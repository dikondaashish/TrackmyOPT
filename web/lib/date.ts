export function mmddyyyyToISO(s?: string | null): string | null {
  if (!s) return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[1]}-${m[2]}`;
  const d = new Date(iso + "T00:00:00Z");
  return Number.isNaN(d.getTime()) ? null : iso;
}
