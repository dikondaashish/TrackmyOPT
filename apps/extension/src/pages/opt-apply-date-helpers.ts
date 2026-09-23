/**
 * Pure date helpers for the OPT Apply page (mm/dd/yyyy formatting + filing window).
 */

/**
 * Format date to mm/dd/yyyy
 */
export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Validate and filter date input - only allow valid mm/dd/yyyy
 */
export function validateDateInput(input: string): string {
  // Keep the user's invalid date visible so submit-time validation can explain
  // the problem. Silently changing 02/31 to 02/29 is dangerous for a deadline tool.
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Add real-time validation to date input
 */
export function addDateInputValidation(inputElement: HTMLInputElement): void {
  inputElement.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;
    const oldValue = target.value;
    const newValue = validateDateInput(oldValue);

    if (newValue !== oldValue) {
      target.value = newValue;
      // Keep the caret after the same digit, including when a slash is inserted.
      const digitsBeforeCursor = oldValue.slice(0, cursorPosition).replace(/\D/g, '').length;
      let cursor = 0;
      let digits = 0;
      while (cursor < newValue.length && digits < digitsBeforeCursor) {
        if (/\d/.test(newValue[cursor])) digits++;
        cursor++;
      }
      target.setSelectionRange(cursor, cursor);
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
 * Get month name
 */
export function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Parse mm/dd/yyyy to Date
 */
export function parseDate(dateStr: string): Date | null {
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
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate filing window
 */
export interface FilingWindowResults {
  earliestStart: Date;
  latestEnd: Date;
  /** Optional 30-day receipt deadline based on the DSO recommendation date. */
  uscisDeadline: Date | null;
  /** The earlier of the broad 60-day window and the DSO-specific deadline. */
  filingDeadline: Date;
  programEndDate: Date;
  dsoRecommendationDate: Date | null;
}

export function calculateFilingWindow(
  programEndDate: Date,
  dsoRecommendationDate: Date | null,
): FilingWindowResults {
  const earliestStart = addDays(programEndDate, -90);
  const latestEnd = addDays(programEndDate, 60);
  const uscisDeadline = dsoRecommendationDate
    ? addDays(dsoRecommendationDate, 30)
    : null;
  const filingDeadline = uscisDeadline && uscisDeadline.getTime() < latestEnd.getTime()
    ? uscisDeadline
    : latestEnd;

  return {
    earliestStart,
    latestEnd,
    uscisDeadline,
    filingDeadline,
    programEndDate,
    dsoRecommendationDate,
  };
}

export interface StemFilingWindowResults {
  earliestStart: Date;
  latestEnd: Date;
  currentOptEndDate: Date;
  dsoRecommendationDate: Date | null;
  uscisDeadline: Date | null;
  filingDeadline: Date;
}

export function calculateStemFilingWindow(
  currentOptEndDate: Date,
  dsoRecommendationDate: Date | null = null,
): StemFilingWindowResults {
  // USCIS: STEM I-765 must be filed within 60 days of the SEVIS recommendation.
  const uscisDeadline = dsoRecommendationDate ? addDays(dsoRecommendationDate, 60) : null;
  return {
    earliestStart: addDays(currentOptEndDate, -90),
    latestEnd: currentOptEndDate,
    currentOptEndDate,
    dsoRecommendationDate,
    uscisDeadline,
    filingDeadline: uscisDeadline && uscisDeadline < currentOptEndDate ? uscisDeadline : currentOptEndDate,
  };
}

/**
 * Get formatted date for card display
 */
export function getCardDateFormat(date: Date): { day: string; month: string; year: string } {
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  return {
    day: String(date.getDate()),
    month: months[date.getMonth()],
    year: String(date.getFullYear())
  };
}

/**
 * Calculate time remaining
 */
export function calculateTimeRemaining(targetDate: Date, now = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  // Calendar-day estimate in the user's local timezone, not a filing-time guarantee.
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
}

export function filingWindowMessage(earliestStart: Date, deadline: Date, now = new Date()): string {
  if (deadline < earliestStart) return 'No valid filing window for these dates. Check with your DSO.';
  const remaining = calculateTimeRemaining(deadline, now);
  if (remaining.total === 0) return 'Filing window expired. Contact your DSO about next steps.';
  if (now < earliestStart) return 'Filing window has not opened yet. Prepare with your DSO.';
  if (remaining.days > 60) return 'You have plenty of time remaining';
  if (remaining.days > 30) return 'Time is moving along, stay prepared';
  if (remaining.days > 14) return 'Getting closer to the deadline!';
  if (remaining.days > 7) return 'Less than two weeks remaining!';
  return 'Deadline approaching. Confirm filing requirements with your DSO.';
}
