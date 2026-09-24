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
};
type Deadline = { title: string; due_date: string };
export function buildCaseDigest(
  cases: DigestCase[],
  deadlines: Deadline[],
  week: string,
  now = new Date()
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
    'Turn off Weekly summary on your case page to stop these digests. Individual case-change alerts are controlled separately.',
  ].join('\n');
}
