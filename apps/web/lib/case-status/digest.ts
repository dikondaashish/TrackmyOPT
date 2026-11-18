import { buildCaseActionPlan } from './case-action-plan';
/** UTC calendar week; retries share a stable delivery key across year boundaries. */
export function digestWeek(now = new Date()) {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

type DigestCase = {
  label?: string | null;
  current_status: string | null;
  last_checked_at: string | null;
  change_log?: unknown;
  /** Free view only: a scheduled check found a status the person has not revealed yet. */
  updateWaiting?: boolean;
};
type StoredDigestCase = DigestCase & { free_visible_status?: unknown };

/**
 * The cases as their owner is allowed to see them. Pro sees the stored status.
 * Free sees the status from their last own refresh, plus whether a scheduled
 * check has found a different one since, never the new status itself.
 */
export function digestCasesForViewer(
  rows: StoredDigestCase[],
  isPremium: boolean
): DigestCase[] {
  return rows.map(({ free_visible_status, ...row }) => {
    if (isPremium) return row;
    const seen =
      free_visible_status && typeof free_visible_status === 'object'
        ? (free_visible_status as Record<string, unknown>)
        : {};
    const seenStatus =
      typeof seen.current_status === 'string' ? seen.current_status : null;
    return {
      label: row.label,
      current_status: seenStatus,
      last_checked_at:
        typeof seen.last_checked_at === 'string' ? seen.last_checked_at : null,
      change_log: [],
      updateWaiting: Boolean(
        row.current_status && row.current_status !== seenStatus
      ),
    };
  });
}
type Deadline = { title: string; due_date: string };
export function buildCaseDigest(
  cases: DigestCase[],
  deadlines: Deadline[],
  week: string,
  now = new Date(),
  options: { free?: boolean } = {}
) {
  const clean = (value: string) =>
    value
      .replace(/<[^>]*>/g, '')
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 240);
  const since = now.getTime() - 7 * 86400000;
  return [
    'Your TrackMyOPT weekly case summary',
    `Week beginning ${week} (UTC)`,
    '',
    ...cases.map((c, index) => {
      const changes = Array.isArray(c.change_log)
        ? c.change_log.filter((item: unknown) => {
            if (!item || typeof item !== 'object') return false;
            const date = (item as { date?: unknown }).date;
            return (
              typeof date === 'string' &&
              Date.parse(date) >= since &&
              Date.parse(date) <= now.getTime()
            );
          }).length
        : 0;
      const guidance = buildCaseActionPlan({
        statusText: c.current_status,
        daysSinceFiled: null,
      });
      if (options.free)
        return `${clean(c.label || `Case ${index + 1}`)}: ${clean(c.current_status || 'Status not yet revealed')}\nYour last refresh: ${c.last_checked_at || 'Not yet'}. ${
          c.updateWaiting
            ? 'A scheduled check has found a newer USCIS status since then. Sign in and refresh your case to see it.'
            : 'Scheduled checks have not found a different status since then.'
        }\nWhat this means: ${clean(guidance.summary)}\nNext step: ${clean(guidance.nextStep)}`;
      return `${clean(c.label || `Case ${index + 1}`)}: ${clean(c.current_status || 'Status not yet available')}\nLast successful check: ${c.last_checked_at || 'Not confirmed'}. ${changes} recorded change(s) in the last 7 days.\nWhat this means: ${clean(guidance.summary)}\nNext step: ${clean(guidance.nextStep)}`;
    }),
    '',
    'Your saved deadlines in the next 7 days:',
    ...(deadlines.length
      ? deadlines.map((d) => `${clean(d.title)} — ${d.due_date}`)
      : ['None saved. This does not confirm that you have no obligations.']),
    '',
    'Review official notices for required actions and exact deadlines. No status change does not imply that USCIS has not worked on your case.',
    'https://www.trackmyopt.com/dashboard/case-status',
    ...(options.free
      ? [
          'On Pro, each new status appears on your case page automatically and is emailed to you the day a scheduled check detects it.',
        ]
      : []),
    'Turn off Weekly summary on your case page to stop these digests. Individual case-change alerts are controlled separately.',
  ].join('\n');
}
