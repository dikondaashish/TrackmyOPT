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
export function addDateInputValidation(inputElement: HTMLInputElement): void {
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
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
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
export function calculateFilingWindow(programEndDate: Date, dsoRecommendationDate: Date | null) {
  const earliestStart = addDays(programEndDate, -90);
  const latestEnd = addDays(programEndDate, 60);

  return {
    earliestStart,
    latestEnd,
    programEndDate
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
export function calculateTimeRemaining(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
}
