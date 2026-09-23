import { createDatePicker } from './opt-apply-date-picker';
import { dateField, toolIntro, helpTip, TOOL_HELP } from '../tool-ui';
import { addDateInputValidation } from './opt-apply-date-helpers';
import { getIdToken } from '../token-store';
import { WEBSITE_URL } from '../config.js';
import { renderPageHeader, setupPageHandlers, setCurrentPage } from '../navigation.js';

/**
 * Format date to mm/dd/yyyy
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Parse mm/dd/yyyy to Date
 */
function parseDate(dateStr: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year) || year < 1) return null;
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**

/**
 * Load saved OPT data from API
 */
async function loadSavedData(): Promise<any> {
  try {
    // Try using session cookies first (if user is logged in on website)
    let response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
      method: 'GET',
      credentials: 'include', // Send cookies from website
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If session cookies failed, try JWT token
    if (!response.ok) {
      const idToken = await getIdToken();
      if (idToken) {
        response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    if (!response.ok) return null;
    
    const result = await response.json();
    return result.ok ? result.data : null;
  } catch (error) {
    return null;
  }
}

/**
 * Save STEM EAD start date to API (stored as stem_start_date)
 */
async function saveStemEadStartDate(stemEadStartDate: string | null): Promise<boolean> {
  try {
    // Only send this tool’s field. Omitted fields are preserved by the API.
    const payload = {
      stem_start_date: stemEadStartDate,
      _lastModifiedField: 'stem_start_date', // Tell API this field was updated
    };

    // Use JWT token for extension → website communication (more reliable than cookies)
    const idToken = await getIdToken();
    if (idToken) {
      const response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        return result.ok === true;
      }
    }

    // Fallback: try session cookies
    const response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    return false;
  }
}

/**
 * Render STEM OPT Clock Tracker page
 */
export function renderStemClock(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'STEM OPT Clock Tracker', 'Employment timeline');
  
  const content = document.createElement('div');
  content.className = 'tool-content tool-form';
  content.innerHTML = `
    ${toolIntro('Employment timeline', 'clock-rules-help', TOOL_HELP.clock)}
    ${dateField('stem-ead-start-date', 'STEM EAD start date', 'Use the start date printed on your STEM OPT EAD card.', 'stem-start-date-picker-btn')}
    <div class="tool-limit"><span>Unemployment allowance</span><strong>150 days</strong>${helpTip('allowance-help', 'unemployment allowance', '150 cumulative unemployment days across initial and STEM OPT, including the initial 90-day allowance.')}</div>
  `;
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'tool-button tool-button-primary';
  saveBtn.textContent = 'Save & Go';
  content.appendChild(saveBtn);
  const readyMessage = document.createElement('div');
  readyMessage.className = 'tool-status';
  readyMessage.setAttribute('role', 'status');
  content.appendChild(readyMessage);
  root.appendChild(content);

  // Date picker event handlers
  const startDatePickerBtn = document.getElementById('stem-start-date-picker-btn');
  
  let activePicker: HTMLElement | null = null;
  
  document.addEventListener('click', (e) => {
    if (activePicker && !activePicker.contains(e.target as Node)) {
      const isPickerButton = startDatePickerBtn?.contains(e.target as Node);
      if (!isPickerButton) {
        activePicker.remove();
        activePicker = null;
      }
    }
  });
  
  startDatePickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (activePicker) {
      activePicker.remove();
      activePicker = null;
    }
    
    const picker = createDatePicker('stem-ead-start-date', (date) => {
      const input = document.getElementById('stem-ead-start-date') as HTMLInputElement;
      if (input) {
        input.value = formatDate(date);
      }
      activePicker = null;
    });
    
    const container = startDatePickerBtn.closest('div[style*="position: relative"]');
    if (container) {
      container.appendChild(picker);
      activePicker = picker;
    }
  });
  
  // Event handlers
  saveBtn.addEventListener('click', async () => {
    const startDateInput = document.getElementById('stem-ead-start-date') as HTMLInputElement;
    
    const stemEadStartDate = parseDate(startDateInput.value);
    if (!stemEadStartDate) {
      alert('Please enter a valid STEM EAD Start Date (mm/dd/yyyy)');
      return;
    }
    
    saveBtn.disabled = true;
    readyMessage.textContent = 'Saving your STEM OPT start date…';

    // Save before opening the tracker so a failed API request cannot produce a
    // tracker that looks current but is not persisted.
    const saved = await saveStemEadStartDate(formatDate(stemEadStartDate));
    if (!root.contains(content)) return;
    if (!saved) {
      readyMessage.textContent = 'Could not save the date. Check your connection and sign in, then try again.';
      saveBtn.disabled = false;
      return;
    }
    
    // Navigate to STEM clock tracker page
    const { renderStemClockTracker } = await import('./stem-clock-tracker.js');
    if (!root.contains(content)) return;
    renderStemClockTracker(root, () => {
      setCurrentPage('stem-clock');
      renderStemClock(root, onBack);
    }, stemEadStartDate);
  });
  
  // Input styling on focus
  const startDateInput = document.getElementById('stem-ead-start-date') as HTMLInputElement;
  
  if (startDateInput) {
    // Add real-time date validation
    addDateInputValidation(startDateInput);
    startDateInput.addEventListener('blur', async (e) => {

      // Auto-save on blur
      const date = parseDate(startDateInput.value);
      if (date) {
        await saveStemEadStartDate(formatDate(date));
      }
    });
  }
  

  
  // Load saved data on page load
  loadSavedData().then(savedData => {
    if (savedData && startDateInput && !startDateInput.value && savedData.stem_start_date && parseDate(savedData.stem_start_date)) {
      startDateInput.value = savedData.stem_start_date;
    }
  });
  
  setupPageHandlers(onBack);
}
