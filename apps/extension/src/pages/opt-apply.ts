import { dateField, toolIntro, TOOL_HELP } from '../tool-ui';
import { renderPageHeader, setupPageHandlers, setCurrentPage } from '../navigation.js';
import {
  addDateInputValidation,
  calculateFilingWindow,
  formatDate,
  parseDate,
} from './opt-apply-date-helpers';
import { createDatePicker } from './opt-apply-date-picker';
import { loadSavedData, saveDatesToAPI } from './opt-apply-api';

/**
 * Render OPT Apply Start Dates page
 */
export function renderOptApply(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';

  renderPageHeader(root, 'OPT Apply Dates', 'Your filing window');

  const content = document.createElement('div');
  content.className = 'tool-content tool-form';
  content.innerHTML = `
    ${toolIntro('Filing dates', 'opt-rules-help', TOOL_HELP.opt)}
    ${dateField('program-end-date', 'Program end date', 'Use the program end date on your I-20.', 'program-date-picker-btn')}
    ${dateField('dso-recommendation-date', 'DSO recommendation', 'Optional: the date your DSO entered the OPT recommendation in SEVIS. USCIS must receive your application within 30 days. Without this date, the result is an estimate.', 'dso-date-picker-btn', true)}
  `;
  const calculateBtn = document.createElement('button');
  calculateBtn.type = 'button';
  calculateBtn.className = 'tool-button tool-button-primary';
  calculateBtn.textContent = 'Calculate Filing Window';
  content.appendChild(calculateBtn);
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'results-container';
  resultsContainer.setAttribute('role', 'alert');
  content.appendChild(resultsContainer);
  root.appendChild(content);

  // Date picker event handlers
  const programDatePickerBtn = document.getElementById('program-date-picker-btn');
  const dsoDatePickerBtn = document.getElementById('dso-date-picker-btn');

  let activePicker: HTMLElement | null = null;

  // Close picker when clicking outside
  document.addEventListener('click', (e) => {
    if (activePicker && !activePicker.contains(e.target as Node)) {
      const pickerButtons = [programDatePickerBtn, dsoDatePickerBtn];
      const isPickerButton = pickerButtons.some(btn => btn?.contains(e.target as Node));
      if (!isPickerButton) {
        activePicker.remove();
        activePicker = null;
      }
    }
  });

  programDatePickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();

    // Close any existing picker
    if (activePicker) {
      activePicker.remove();
      activePicker = null;
    }

    const picker = createDatePicker('program-end-date', (date) => {
      const input = document.getElementById('program-end-date') as HTMLInputElement;
      if (input) {
        input.value = formatDate(date);
      }
      activePicker = null;
    });

    const container = programDatePickerBtn.closest('div[style*="position: relative"]');
    if (container) {
      container.appendChild(picker);
      activePicker = picker;
    }
  });

  dsoDatePickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();

    // Close any existing picker
    if (activePicker) {
      activePicker.remove();
      activePicker = null;
    }

    const picker = createDatePicker('dso-recommendation-date', (date) => {
      const input = document.getElementById('dso-recommendation-date') as HTMLInputElement;
      if (input) {
        input.value = formatDate(date);
      }
      activePicker = null;
    });

    const container = dsoDatePickerBtn.closest('div[style*="position: relative"]');
    if (container) {
      container.appendChild(picker);
      activePicker = picker;
    }
  });

  // Auto-save dates when they change
  const autoSaveDates = () => {
    if (!root.contains(content) || calculateBtn.disabled) return;
    const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
    const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;

    const programEnd = programEndInput.value.trim();
    const dsoRec = dsoRecommendationInput.value.trim();

    // Never replace a saved DSO date with an incomplete/invalid typed value.
    if (programEnd && parseDate(programEnd) && (!dsoRec || parseDate(dsoRec))) {
      saveDatesToAPI(programEnd, dsoRec || null);
    }
  };

  // Event handlers
  calculateBtn.addEventListener('click', async () => {
    const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
    const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;

    const programEndDate = parseDate(programEndInput.value);
    if (!programEndDate) {
      resultsContainer.innerHTML = `
        <div style="padding:12px;border-radius:12px;background:var(--tool-red-surface);color:var(--tool-red-ink);font-size:13px;border:1px solid var(--tool-red-border);">
          Please enter a valid Program End Date (mm/dd/yyyy)
        </div>
      `;
      return;
    }

    const dsoRecommendationDate = dsoRecommendationInput.value.trim()
      ? parseDate(dsoRecommendationInput.value)
      : null;

    if (dsoRecommendationInput.value.trim() && !dsoRecommendationDate) {
      resultsContainer.innerHTML = `
        <div style="padding:12px;border-radius:12px;background:var(--tool-red-surface);color:var(--tool-red-ink);font-size:13px;border:1px solid var(--tool-red-border);">
          Please enter a valid DSO Recommendation Date (mm/dd/yyyy)
        </div>
      `;
      return;
    }

    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Saving…';

    // Save dates before opening the countdown so the dashboard and extension
    // cannot silently diverge.
    const saved = await saveDatesToAPI(
      programEndInput.value.trim(),
      dsoRecommendationInput.value.trim() || null
    );
    if (!root.contains(content)) return;

    if (!saved) {
      resultsContainer.innerHTML = `
        <div style="padding:12px;border-radius:12px;background:var(--tool-red-surface);color:var(--tool-red-ink);font-size:13px;border:1px solid var(--tool-red-border);">
          We could not save these dates. Check your connection and sign in to TrackMyOPT, then try again.
        </div>
      `;
      calculateBtn.disabled = false;
      calculateBtn.textContent = 'Calculate Filing Window';
      return;
    }

    const results = calculateFilingWindow(programEndDate, dsoRecommendationDate);

    // Navigate to countdown page
    const { renderOptCountdown } = await import('./opt-countdown.js');
    if (!root.contains(content)) return;
    renderOptCountdown(root, () => {
      setCurrentPage('opt-apply');
      renderOptApply(root, onBack);
    }, results);
  });

  // Add blur event listeners to auto-save when user finishes entering dates
  const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
  const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;

  if (programEndInput) {
    // Add real-time date validation
    addDateInputValidation(programEndInput);

    programEndInput.addEventListener('blur', () => {
      // Delay to allow calendar selection to complete
      setTimeout(autoSaveDates, 300);
    });
  }

  if (dsoRecommendationInput) {
    // Add real-time date validation
    addDateInputValidation(dsoRecommendationInput);

    dsoRecommendationInput.addEventListener('blur', () => {
      setTimeout(autoSaveDates, 300);
    });
  }

  // Load saved data on page load
  loadSavedData().then(savedData => {
    if (savedData && programEndInput) {
      if (savedData.program_end_date && !programEndInput.value) {
        programEndInput.value = savedData.program_end_date;
      }
      if (savedData.dso_recommendation_date && dsoRecommendationInput && !dsoRecommendationInput.value) {
        dsoRecommendationInput.value = savedData.dso_recommendation_date;
      }

    }
  });

  setupPageHandlers(onBack);
}
