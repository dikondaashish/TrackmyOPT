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
 * Save OPT start date to API
 */
async function saveOptStartDate(optStartDate: string | null): Promise<boolean> {
  try {
    // Only send this tool’s field. Omitted fields are preserved by the API.
    const payload = {
      opt_start_date: optStartDate,
      _lastModifiedField: 'opt_start_date', // Tell API this field was updated
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
 * Render OPT Clock Tracker page
 */
export function renderClock(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'OPT Clock Tracker', 'Employment timeline');
  
  const content = document.createElement('div');
  content.className = 'tool-content tool-form';
  content.innerHTML = `
    ${toolIntro('Employment timeline', 'clock-rules-help', TOOL_HELP.clock)}
    ${dateField('opt-start-date', 'OPT EAD start date', 'Use the start date printed on your OPT EAD card.', 'start-date-picker-btn')}
    <div class="tool-limit"><span>Unemployment allowance</span><strong>90 days</strong>${helpTip('allowance-help', 'unemployment allowance', 'Initial post-completion OPT allows up to 90 unemployment days.')}</div>
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
  const startDatePickerBtn = document.getElementById('start-date-picker-btn');
  
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
    
    const picker = createDatePicker('opt-start-date', (date) => {
      const input = document.getElementById('opt-start-date') as HTMLInputElement;
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
    const startDateInput = document.getElementById('opt-start-date') as HTMLInputElement;
    
    const optStartDate = parseDate(startDateInput.value);
    if (!optStartDate) {
      alert('Please enter a valid OPT Start Date (mm/dd/yyyy)');
      return;
    }
    
    saveBtn.disabled = true;
    readyMessage.textContent = 'Saving your OPT start date…';

    // Save before opening the tracker so a failed API request cannot produce a
    // tracker that looks current but is not persisted.
    const saved = await saveOptStartDate(formatDate(optStartDate));
    if (!root.contains(content)) return;
    if (!saved) {
      readyMessage.textContent = 'Could not save the date. Check your connection and sign in, then try again.';
      saveBtn.disabled = false;
      return;
    }
    
    // Navigate to clock tracker page
    const { renderClockTracker } = await import('./clock-tracker.js');
    if (!root.contains(content)) return;
    renderClockTracker(root, () => {
      setCurrentPage('clock');
      renderClock(root, onBack);
    }, optStartDate);
  });
  
  // Input styling on focus
  const startDateInput = document.getElementById('opt-start-date') as HTMLInputElement;
  
  if (startDateInput) {
    // Add real-time date validation
    addDateInputValidation(startDateInput);
    startDateInput.addEventListener('blur', async (e) => {

      // Auto-save on blur
      const date = parseDate(startDateInput.value);
      if (date) {
        await saveOptStartDate(formatDate(date));
      }
    });
  }
  

  
  // Load saved data on page load
  loadSavedData().then(savedData => {
    if (savedData && startDateInput && !startDateInput.value && savedData.opt_start_date && parseDate(savedData.opt_start_date)) {
      startDateInput.value = savedData.opt_start_date;
    }
  });
  
  setupPageHandlers(onBack);
}
