/**
 * Convert MM/DD/YYYY format to ISO YYYY-MM-DD format
 * 
 * @param s - Date string in MM/DD/YYYY format
 * @returns ISO date string (YYYY-MM-DD) or null if invalid
 * 
 * @example
 * mmddyyyyToISO('05/15/2024') // '2024-05-15'
 * mmddyyyyToISO('13/01/2024') // null (invalid month)
 * mmddyyyyToISO('invalid')    // null
 */
export function mmddyyyyToISO(s: string): string | null {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [_, mm, dd, yyyy] = m;
  const iso = `${yyyy}-${mm}-${dd}`;
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return null;
  return iso;
}

