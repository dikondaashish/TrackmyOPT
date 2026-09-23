import { createDatePicker } from './opt-apply-date-picker';
import { dateField, toolIntro, TOOL_HELP } from '../tool-ui';
import { addDateInputValidation } from './opt-apply-date-helpers';
import { loadStemDates, saveStemDates } from './stem-apply-api';
import { renderPageHeader, setupPageHandlers, setCurrentPage } from '../navigation.js';
import { calculateStemFilingWindow as calculateSharedStemFilingWindow } from './opt-apply-date-helpers';

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
 * Render STEM OPT Apply Start Dates page
 */
export function renderStemApply(root: HTMLElement, onBack: () => void, restoreCountdown = false): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'STEM OPT Dates', 'Your extension window');
  
  const content = document.createElement('div');
  content.className = 'tool-content tool-form';
  content.innerHTML = `
    ${toolIntro('Filing dates', 'stem-rules-help', TOOL_HELP.stem)}
    ${dateField('current-opt-end-date', 'Current OPT expires', 'Use the end date on your current OPT EAD card.', 'opt-end-date-picker-btn')}
    ${dateField('stem-dso-recommendation-date', 'STEM recommendation', 'Optional: use the date your DSO entered the STEM recommendation in SEVIS. Without it, the deadline is an estimate. Calculate to save both dates for your dashboard and reminders.', 'stem-dso-date-picker-btn', true)}
  `;
  const calculateBtn = document.createElement('button');
  calculateBtn.type = 'button';
  calculateBtn.className = 'tool-button tool-button-primary';
  calculateBtn.textContent = 'Calculate Filing Window';
  content.appendChild(calculateBtn);
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  content.appendChild(status);
  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'tool-button';
  retryBtn.textContent = 'Retry loading saved dates';
  retryBtn.hidden = true;
  content.appendChild(retryBtn);
  root.appendChild(content);

  const optEndInput = content.querySelector<HTMLInputElement>('#current-opt-end-date')!;
  const stemDsoInput = content.querySelector<HTMLInputElement>('#stem-dso-recommendation-date')!;
  addDateInputValidation(optEndInput);
  addDateInputValidation(stemDsoInput);
  const edited = new Set<HTMLInputElement>();
  let revision = 0;
  let loaded = false;
  let saving = false;
  for (const input of [optEndInput, stemDsoInput]) {
    input.addEventListener('input', () => { edited.add(input); revision++; });
    input.addEventListener('change', () => { edited.add(input); revision++; });
  }

  async function load(): Promise<void> {
    calculateBtn.disabled = true;
    retryBtn.hidden = true;
    status.textContent = 'Loading saved dates…';
    const saved = await loadStemDates();
    if (!root.contains(content)) return;
    if (!saved) {
      status.textContent = 'We could not load your saved dates. Retry before saving to keep your existing dates safe.';
      retryBtn.hidden = false;
      return;
    }
    if (!edited.has(optEndInput)) optEndInput.value = saved.opt_ead_end_date ?? '';
    if (!edited.has(stemDsoInput)) stemDsoInput.value = saved.stem_dso_recommendation_date ?? '';
    loaded = true;
    status.textContent = '';
    calculateBtn.disabled = false;
    // Popup restoration uses fresh server dates and never writes a cached snapshot.
    if (restoreCountdown && revision === 0 && saved.opt_ead_end_date) {
      const { renderStemCountdown } = await import('./stem-countdown.js');
      if (!root.contains(content) || revision !== 0) return;
      const results = calculateSharedStemFilingWindow(
        parseDate(saved.opt_ead_end_date)!,
        saved.stem_dso_recommendation_date ? parseDate(saved.stem_dso_recommendation_date) : null,
      );
      void renderStemCountdown(root, () => {
        setCurrentPage('stem-apply');
        renderStemApply(root, onBack);
      }, results);
    }
  }
  retryBtn.addEventListener('click', () => { void load(); });
  void load();

  // Date picker event handlers
  const optEndDatePickerBtn = document.getElementById('opt-end-date-picker-btn');
  const stemDsoPickerBtn = document.getElementById('stem-dso-date-picker-btn');
  
  let activePicker: HTMLElement | null = null;
  
  document.addEventListener('click', (e) => {
    if (activePicker && !activePicker.contains(e.target as Node)) {
      const isPickerButton = [optEndDatePickerBtn, stemDsoPickerBtn].some(btn => btn?.contains(e.target as Node));
      if (!isPickerButton) {
        activePicker.remove();
        activePicker = null;
      }
    }
  });
  
  for (const [button, inputId] of [[optEndDatePickerBtn, 'current-opt-end-date'], [stemDsoPickerBtn, 'stem-dso-recommendation-date']] as const) {
    button?.addEventListener('click', e => {
      e.stopPropagation();
      activePicker?.remove();
      const picker = createDatePicker(inputId, date => {
        const input = content.querySelector<HTMLInputElement>('#' + inputId);
        if (input) {
          input.value = formatDate(date);
          edited.add(input);
          revision++;
        }
        activePicker = null;
      });
      // The shared picker's Clear button changes the input without firing input/change.
      picker.addEventListener('click', event => {
        if (!(event.target as Element).closest('[aria-label="Clear date"]')) return;
        const input = content.querySelector<HTMLInputElement>('#' + inputId);
        if (input) {
          edited.add(input);
          revision++;
        }
        activePicker = null;
      }, true);
      button.closest('.tool-input-wrap')?.appendChild(picker);
      activePicker = picker;
    });
  }

  // Event handlers
  calculateBtn.addEventListener('click', async () => {
    if (!loaded || saving || !root.contains(content)) return;
    
    const currentOptEndDate = parseDate(optEndInput.value);
    if (!currentOptEndDate) {
      alert('Please enter a valid Current OPT EAD End Date (mm/dd/yyyy)');
      return;
    }

    const dsoText = stemDsoInput.value.trim();
    const dsoDate = dsoText ? parseDate(dsoText) : null;
    if (dsoText && !dsoDate) {
      alert('Please enter a valid STEM DSO Recommendation Date (mm/dd/yyyy)');
      return;
    }
    
    const savedRevision = revision;
    const savedValues = [optEndInput.value, stemDsoInput.value];
    saving = true;
    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Saving…';

    // Save before opening the countdown so the extension and dashboard remain
    // in sync.
    const saved = await saveStemDates({
      opt_ead_end_date: formatDate(currentOptEndDate),
      stem_dso_recommendation_date: dsoDate ? formatDate(dsoDate) : null,
    });
    if (!root.contains(content)) return;
    if (!saved) {
      alert('We could not save these dates. Check your connection and sign in to TrackMyOPT, then try again.');
      saving = false;
      calculateBtn.disabled = false;
      calculateBtn.textContent = 'Calculate Filing Window';
      return;
    }
    
    const results = calculateSharedStemFilingWindow(currentOptEndDate, dsoDate);
    
    // Navigate to STEM countdown page
    const { renderStemCountdown } = await import('./stem-countdown.js');
    if (!root.contains(content)) return;
    if (revision !== savedRevision || optEndInput.value !== savedValues[0] || stemDsoInput.value !== savedValues[1]) {
      saving = false;
      calculateBtn.disabled = false;
      calculateBtn.textContent = 'Calculate Filing Window';
      status.textContent = 'Dates changed while saving. Calculate again to save your latest edits.';
      return;
    }
    renderStemCountdown(root, () => {
      setCurrentPage('stem-apply');
      renderStemApply(root, onBack);
    }, results);
  });
  
  // Save only on Calculate: blur must not race a newer two-date submission.

  setupPageHandlers(onBack);
}
