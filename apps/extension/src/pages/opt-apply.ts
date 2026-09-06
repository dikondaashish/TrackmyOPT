import { renderPageHeader, setupPageHandlers } from '../navigation.js';
import { icon } from '../icons.js';
import { toolSurfaceCard } from '../tool-page-theme.js';
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

  renderPageHeader(root, 'OPT Apply Dates', 'Calculate your OPT filing window');

  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';

  // Info card
  const infoCard = document.createElement('div');
  infoCard.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    ${toolSurfaceCard('blue')};
    margin-bottom: 12px;
  `;
  infoCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: start;">
      <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; font-size: 16px;">
        ${icon('info', 16, 'currentColor')}
      </div>
      <div>
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px;">Post-Completion OPT Filing Rules</div>
        <div style="font-size: 12px; line-height: 1.5; opacity: 0.95;">
          You can apply 90 days before your program ends, up to 60 days after. USCIS must receive your I-765 within 30 days of your DSO's recommendation.
        </div>
      </div>
    </div>
  `;
  content.appendChild(infoCard);

  // Program End Date card
  const programCard = document.createElement('div');
  programCard.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    ${toolSurfaceCard('blue')};
    margin-bottom: 12px;
    position: relative;
  `;
  programCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 10px;">
      <div style="flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2); display: grid; place-items: center; font-size: 18px;">
        ${icon('calendar', 20, 'currentColor')}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">Program End Date</div>
        <div style="font-size: 11px; opacity: 0.9;">From your I-20</div>
      </div>
    </div>
    <div style="position: relative;">
      <input 
        type="text" 
        id="program-end-date" 
        placeholder="mm/dd/yyyy"
        style="
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 0;
          border-radius: 10px;
          background: var(--surface-2);
          backdrop-filter: blur(10px);
          color: var(--ink);
          font-size: 14px;
          outline: none;
          font-family: inherit;
        "
      />
      <button 
        id="program-date-picker-btn"
        style="
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: var(--surface-2);
          color: var(--ink);
          cursor: pointer;
          font-size: 16px;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        "
      >${icon('calendar', 16, 'currentColor')}</button>
    </div>
  `;
  content.appendChild(programCard);

  // DSO Recommendation Date card
  const dsoCard = document.createElement('div');
  dsoCard.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    ${toolSurfaceCard('green')};
    margin-bottom: 12px;
    position: relative;
  `;
  dsoCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 10px;">
      <div style="flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2); display: grid; place-items: center; font-size: 18px;">
        ${icon('calendar', 20, 'currentColor')}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">DSO Recommendation Date</div>
        <div style="font-size: 11px; opacity: 0.9;">Optional - When DSO signed your I-20</div>
      </div>
    </div>
    <div style="position: relative;">
      <input 
        type="text" 
        id="dso-recommendation-date" 
        placeholder="mm/dd/yyyy"
        style="
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 0;
          border-radius: 10px;
          background: var(--surface-2);
          backdrop-filter: blur(10px);
          color: var(--ink);
          font-size: 14px;
          outline: none;
          font-family: inherit;
        "
      />
      <button 
        id="dso-date-picker-btn"
        style="
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: var(--surface-2);
          color: var(--ink);
          cursor: pointer;
          font-size: 16px;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        "
      >${icon('calendar', 16, 'currentColor')}</button>
    </div>
  `;
  content.appendChild(dsoCard);

  // Calculate button
  const calculateBtn = document.createElement('button');
  calculateBtn.textContent = 'Calculate Filing Window';
  calculateBtn.style.cssText = `
    width: 100%;
    padding: 14px;
    border: 0;
    border-radius: 12px;
    background: var(--tmo-gradient-brand);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: inherit;
  `;
  content.appendChild(calculateBtn);

  // Results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'results-container';
  resultsContainer.style.cssText = 'margin-top: 12px;';
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

  // Hover effects for calendar buttons
  [programDatePickerBtn, dsoDatePickerBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'var(--surface-2)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'var(--surface-2)';
      });
    }
  });

  // Auto-save dates when they change
  const autoSaveDates = () => {
    const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
    const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;

    const programEnd = programEndInput.value.trim();
    const dsoRec = dsoRecommendationInput.value.trim();

    // Only save if program end date is valid
    if (programEnd && parseDate(programEnd)) {
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

    // Save dates to database
    await saveDatesToAPI(
      programEndInput.value.trim(),
      dsoRecommendationInput.value.trim() || null
    );

    const results = calculateFilingWindow(programEndDate, dsoRecommendationDate);

    // Navigate to countdown page
    const { renderOptCountdown } = await import('./opt-countdown.js');
    renderOptCountdown(root, onBack, results);
  });

  // Input styling on focus (for both light and dark mode)
  const inputs = [
    document.getElementById('program-end-date'),
    document.getElementById('dso-recommendation-date')
  ];

  inputs.forEach(input => {
    if (input) {
      input.addEventListener('focus', (e) => {
        (e.target as HTMLElement).style.background = 'var(--surface-2)';
      });
      input.addEventListener('blur', (e) => {
        (e.target as HTMLElement).style.background = 'var(--surface-2)';
      });
    }
  });

  calculateBtn.addEventListener('mouseenter', () => {
    calculateBtn.style.transform = 'translateY(-1px)';
    calculateBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
  });

  calculateBtn.addEventListener('mouseleave', () => {
    calculateBtn.style.transform = 'translateY(0)';
    calculateBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
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
      if (savedData.program_end_date) {
        programEndInput.value = savedData.program_end_date;
      }
      if (savedData.dso_recommendation_date && dsoRecommendationInput) {
        dsoRecommendationInput.value = savedData.dso_recommendation_date;
      }

    }
  });

  setupPageHandlers(onBack);
}
