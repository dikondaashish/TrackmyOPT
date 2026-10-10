export interface DuplicateApplicationNotice {
  roleTitle: string;
  companyName: string;
  appliedAt?: string | null;
}

export interface OptClockNudge {
  active: true;
  remaining: number;
  used: number;
  max: 90 | 150;
  phase: 'initial' | 'stem';
}

export interface ScoreComparison {
  baseline?: number;
  generated: number;
  delta?: number;
  improved: boolean;
}

function normalizedWords(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function jobMemoryKey(input: {
  companyName?: unknown;
  roleTitle?: unknown;
  jobUrl?: unknown;
}): string {
  let url = String(input.jobUrl ?? '').trim();
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    url = parsed.toString();
  } catch {
    url = url.split('#')[0];
  }
  return [url, normalizedWords(input.companyName), normalizedWords(input.roleTitle)].join('|');
}

export function recordSeenJob(
  existing: unknown,
  key: string,
  maxEntries = 100,
): { alreadySeen: boolean; keys: string[] } {
  const keys = Array.isArray(existing)
    ? existing.map((value) => String(value)).filter(Boolean)
    : [];
  if (keys.includes(key)) return { alreadySeen: true, keys: keys.slice(0, maxEntries) };
  return { alreadySeen: false, keys: [key, ...keys.filter((value) => value !== key)].slice(0, maxEntries) };
}

export function formatDuplicateApplicationNotice(duplicate: DuplicateApplicationNotice): {
  roleTitle: string;
  companyName: string;
  dateLabel?: string;
} {
  let dateLabel: string | undefined;
  if (duplicate.appliedAt) {
    const parsed = new Date(`${duplicate.appliedAt.slice(0, 10)}T12:00:00Z`);
    if (Number.isFinite(parsed.getTime())) {
      dateLabel = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(parsed);
    }
  }
  return {
    roleTitle: String(duplicate.roleTitle || '').trim(),
    companyName: String(duplicate.companyName || '').trim(),
    ...(dateLabel ? { dateLabel } : {}),
  };
}

export function normalizeOptClockNudge(value: unknown): OptClockNudge | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (data.active !== true || (data.phase !== 'initial' && data.phase !== 'stem')) return null;
  const remaining = Number(data.remaining);
  const used = Number(data.used);
  const max = Number(data.max);
  if ((max !== 90 && max !== 150) || !Number.isInteger(remaining) || !Number.isInteger(used)) return null;
  if (remaining < 0 || remaining > max || used < 0 || used > 10_000) return null;
  return { active: true, remaining, used, max, phase: data.phase };
}

function normalizedScore(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildScoreComparison(
  baselineValue: unknown,
  generatedValue: unknown,
): ScoreComparison | null {
  const generated = normalizedScore(generatedValue);
  if (generated === undefined) return null;
  const baseline = normalizedScore(baselineValue);
  if (baseline === undefined) return { baseline: undefined, generated, delta: undefined, improved: false };
  const delta = generated - baseline;
  return { baseline, generated, delta, improved: delta > 0 };
}
