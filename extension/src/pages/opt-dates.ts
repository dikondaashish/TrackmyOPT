import { WEBSITE_URL } from '../config.js';
import { renderPageHeader, setupPageHandlers } from '../navigation.js';

/**
 * Validate and filter date input - only allow valid mm/dd/yyyy
 */
function validateDateInput(input: string): string {
  // Remove any non-digit and non-slash characters
  let cleaned = input.replace(/[^\d/]/g, '');
  
  // Limit to 10 characters (mm/dd/yyyy)
  cleaned = cleaned.substring(0, 10);
  
  // Parse the parts
  const parts = cleaned.split('/');
  
  if (parts.length >= 1 && parts[0].length > 0) {
    // Validate month (01-12)
    let month = parseInt(parts[0]);
    if (month > 12) {
      parts[0] = '12';
    } else if (parts[0].length === 2 && month === 0) {
      parts[0] = '01';
    }
    // Limit month to 2 digits
    parts[0] = parts[0].substring(0, 2);
  }
  
  if (parts.length >= 2 && parts[1].length > 0) {
    // Validate day based on month
    let month = parseInt(parts[0]) || 1;
    let day = parseInt(parts[1]);
    
    // Get max days for the month (assume non-leap year for Feb)
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const maxDay = daysInMonth[month - 1] || 31;
    
    if (day > maxDay) {
      parts[1] = String(maxDay).padStart(2, '0');
    } else if (parts[1].length === 2 && day === 0) {
      parts[1] = '01';
    }
    // Limit day to 2 digits
    parts[1] = parts[1].substring(0, 2);
  }
  
  if (parts.length >= 3) {
    // Limit year to 4 digits
    parts[2] = parts[2].substring(0, 4);
  }
  
  return parts.join('/');
}

/**
 * Add real-time validation to date input
 */
function addDateInputValidation(inputElement: HTMLInputElement): void {
  inputElement.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;
    const oldValue = target.value;
    const newValue = validateDateInput(oldValue);
    
    if (newValue !== oldValue) {
      target.value = newValue;
      // Restore cursor position
      target.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
  
  inputElement.addEventListener('keypress', (e) => {
    const char = e.key;
    // Only allow numbers and forward slash
    if (!/[\d/]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  });
}

/**
 * Load saved dates from the API
 */
async function loadSavedDates(): Promise<any> {
  try {
    const response = await fetch(`${WEBSITE_URL}/api/opt/dates`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      if (result.ok && result.data) {
        return result.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading dates:', error);
    return null;
  }
}

/**
 * Save dates to the API
 */
async function saveDates(dates: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(`${WEBSITE_URL}/api/opt/dates`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dates),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving dates:', error);
    return { ok: false, error: 'Failed to save dates' };
  }
}

/**
 * Render OPT Dates page
 */
export async function renderOptDates(root: HTMLElement, onBack: () => void): Promise<void> {
  // Clear root
  root.innerHTML = '';

  // Add header
  renderPageHeader(root, 'OPT Dates', 'Manage your important OPT-related dates');

  // Load existing dates
  const savedDates = await loadSavedDates();

  // Create form HTML
  const formHTML = `
    <div class="page-content">
      <div class="notice" style="margin-bottom: 16px;">
        <div class="dot">ℹ️</div>
        <div>
          <div style="font-weight:600; margin-bottom: 4px;">Important</div>
          <div style="font-size: 13px;">At least one date is required. All dates must be in MM/DD/YYYY format.</div>
        </div>
      </div>

      <form id="opt-dates-form" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Program End Date -->
        <div class="input-group">
          <label for="program_end_date">
            <span style="font-weight: 600;">Program End Date</span>
          </label>
          <input 
            type="text" 
            id="program_end_date" 
            placeholder="MM/DD/YYYY"
            value="${savedDates?.program_end_date || ''}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
          />
          <span style="font-size: 12px; color: #666; margin-top: 4px;">The date your academic program officially ends</span>
        </div>

        <!-- DSO Recommendation Date -->
        <div class="input-group">
          <label for="dso_recommendation_date">
            <span style="font-weight: 600;">DSO Recommendation Date</span>
            <span style="font-weight: 400; color: #666;"> (Optional)</span>
          </label>
          <input 
            type="text" 
            id="dso_recommendation_date" 
            placeholder="MM/DD/YYYY"
            value="${savedDates?.dso_recommendation_date || ''}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
          />
          <span style="font-size: 12px; color: #666; margin-top: 4px;">Date when your DSO recommended OPT</span>
        </div>

        <!-- OPT Start Date -->
        <div class="input-group">
          <label for="opt_start_date">
            <span style="font-weight: 600;">OPT Start Date</span>
            <span style="font-weight: 400; color: #666;"> (Optional)</span>
          </label>
          <input 
            type="text" 
            id="opt_start_date" 
            placeholder="MM/DD/YYYY"
            value="${savedDates?.opt_start_date || ''}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
          />
          <span style="font-size: 12px; color: #666; margin-top: 4px;">The start date of your OPT period</span>
        </div>

        <!-- OPT EAD End Date -->
        <div class="input-group">
          <label for="opt_ead_end_date">
            <span style="font-weight: 600;">OPT EAD End Date</span>
            <span style="font-weight: 400; color: #666;"> (Optional)</span>
          </label>
          <input 
            type="text" 
            id="opt_ead_end_date" 
            placeholder="MM/DD/YYYY"
            value="${savedDates?.opt_ead_end_date || ''}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
          />
          <span style="font-size: 12px; color: #666; margin-top: 4px;">Employment Authorization Document expiration date</span>
        </div>

        <!-- STEM Start Date -->
        <div class="input-group">
          <label for="stem_start_date">
            <span style="font-weight: 600;">STEM Extension Start Date</span>
            <span style="font-weight: 400; color: #666;"> (Optional)</span>
          </label>
          <input 
            type="text" 
            id="stem_start_date" 
            placeholder="MM/DD/YYYY"
            value="${savedDates?.stem_start_date || ''}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;"
          />
          <span style="font-size: 12px; color: #666; margin-top: 4px;">Start date of STEM OPT extension (if applicable)</span>
        </div>

        <!-- Error Message -->
        <div id="error-message" class="notice error-notice" style="display: none; background-color: #fee; border-color: #fcc;">
          <div class="dot">⚠️</div>
          <div id="error-text" style="color: #c00;"></div>
        </div>

        <!-- Success Message -->
        <div id="success-message" class="notice success-notice" style="display: none; background-color: #efe; border-color: #cfc;">
          <div class="dot">✅</div>
          <div style="color: #060;">Dates saved successfully!</div>
        </div>

        <!-- Buttons -->
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            Save Dates
          </button>
          <button type="button" id="reset-btn" class="btn btn-secondary" style="flex: 1;">
            Reset
          </button>
        </div>
      </form>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = formHTML;
  root.appendChild(tempDiv.firstElementChild!);

  // Setup date input validation
  const dateInputs = [
    'program_end_date',
    'dso_recommendation_date',
    'opt_start_date',
    'opt_ead_end_date',
    'stem_start_date',
  ];

  dateInputs.forEach(inputId => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      addDateInputValidation(input);
    }
  });

  // Setup form submission
  const form = document.getElementById('opt-dates-form') as HTMLFormElement;
  const errorMessage = document.getElementById('error-message') as HTMLElement;
  const errorText = document.getElementById('error-text') as HTMLElement;
  const successMessage = document.getElementById('success-message') as HTMLElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    // Get all date values
    const dates: any = {};
    dateInputs.forEach(inputId => {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input && input.value.trim() !== '') {
        dates[inputId] = input.value.trim();
      }
    });

    // Validate: at least one date must be filled
    if (Object.keys(dates).length === 0) {
      errorText.textContent = 'Please enter at least one date';
      errorMessage.style.display = 'flex';
      return;
    }

    // Validate date format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    for (const [field, value] of Object.entries(dates)) {
      if (!dateRegex.test(value as string)) {
        errorText.textContent = `Invalid date format for ${field.replace(/_/g, ' ')}`;
        errorMessage.style.display = 'flex';
        return;
      }
    }

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    // Save dates
    const result = await saveDates(dates);

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

    if (result.ok) {
      successMessage.style.display = 'flex';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);
    } else {
      errorText.textContent = result.error || 'Failed to save dates';
      errorMessage.style.display = 'flex';
    }
  });

  // Setup reset button
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  resetBtn?.addEventListener('click', async () => {
    const savedDates = await loadSavedDates();
    dateInputs.forEach(inputId => {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        input.value = savedDates?.[inputId] || '';
      }
    });
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
  });

  // Setup page handlers (back, theme, logout)
  await setupPageHandlers(onBack);
}

