/**
 * Guest decision-window helpers (no auth path).
 * Keep receipt handling to 3-letter prefixes only — never accept a full receipt.
 */

export function daysSinceIsoDate(iso: string, now = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const filed = Date.UTC(y, m - 1, d);
  if (!Number.isFinite(filed)) return null;
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const days = Math.floor((today - filed) / (1000 * 60 * 60 * 24));
  if (days < 0 || days > 800) return null;
  return days;
}

export function normalizeReceiptPrefix(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const prefix = raw.trim().slice(0, 3).toUpperCase();
  return /^[A-Z]{3}$/.test(prefix) ? prefix : null;
}

// ponytail: assert-based self-check — upgrade to vitest when the local runner is healthy
if (process.env.NODE_ENV !== 'production' && process.argv[1]?.includes('public-decision-window')) {
  const fixed = new Date(Date.UTC(2026, 3, 15)); // 2026-04-15
  const a = daysSinceIsoDate('2026-01-15', fixed);
  if (a !== 90) throw new Error(`expected 90 days, got ${a}`);
  if (daysSinceIsoDate('not-a-date', fixed) !== null) throw new Error('bad date should be null');
  if (daysSinceIsoDate('2027-01-01', fixed) !== null) throw new Error('future date should be null');
  if (normalizeReceiptPrefix('ioe123') !== 'IOE') throw new Error('prefix normalize failed');
  if (normalizeReceiptPrefix('12') !== null) throw new Error('short prefix should be null');
  console.log('public-decision-window self-check ok');
}
