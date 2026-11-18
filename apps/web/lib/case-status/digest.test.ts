import { expect, it } from 'vitest';
import { buildCaseDigest, digestCasesForViewer, digestWeek } from './digest';
it.each([
  ['2026-09-23T23:00:00Z', '2026-09-21'],
  ['2026-09-27T23:59:59Z', '2026-09-21'],
  ['2026-09-28T00:00:00Z', '2026-09-28'],
  ['2027-01-01T00:00:00Z', '2026-12-28'],
])('uses stable weekly keys %s', (date, week) =>
  expect(digestWeek(new Date(date))).toBe(week)
);
it('shows actual check freshness and saved deadlines without receipt numbers or guessed progress', () => {
  const text = buildCaseDigest(
    [
      {
        label: '<b>My case</b>\nInjected',
        current_status: 'Case Was Approved',
        last_checked_at: null,
        change_log: [
          { date: '2026-09-22' },
          null,
          { date: '2026-08-01' },
          { date: '2027-01-01' },
        ],
      },
    ],
    [{ title: 'DSO report', due_date: '2026-09-25' }],
    '2026-09-21',
    new Date('2026-09-23T12:00:00Z')
  );
  expect(text).toContain('Last successful check: Not confirmed');
  expect(text).toContain('1 recorded change(s)');
  expect(text).toContain('DSO report — 2026-09-25');
  expect(text).not.toContain('<b>');
  expect(text).toContain('Turn off Weekly summary');
});
it('gives a Free account its last revealed status and only a flag for a newer one', () => {
  const stored = [
    {
      label: 'OPT',
      current_status: 'Case Was Approved',
      last_checked_at: '2026-11-18T14:00:00Z',
      change_log: [{ date: '2026-11-18' }],
      free_visible_status: {
        current_status: 'Case Was Received',
        last_checked_at: '2026-11-01T10:00:00Z',
      },
    },
  ];
  expect(digestCasesForViewer(stored, true)[0]).toMatchObject({
    current_status: 'Case Was Approved',
  });
  const free = digestCasesForViewer(stored, false);
  expect(free[0]).toEqual({
    label: 'OPT',
    current_status: 'Case Was Received',
    last_checked_at: '2026-11-01T10:00:00Z',
    change_log: [],
    updateWaiting: true,
  });
  const text = buildCaseDigest(
    free,
    [],
    '2026-11-16',
    new Date('2026-11-18T15:00:00Z'),
    { free: true }
  );
  expect(text).toContain('OPT: Case Was Received');
  expect(text).toContain('A newer USCIS status is waiting');
  expect(text).not.toContain('Approved');
  expect(text).toContain('On Pro, each new status');

  const unchanged = digestCasesForViewer(
    [{ ...stored[0]!, current_status: 'Case Was Received' }],
    false
  );
  expect(unchanged[0]!.updateWaiting).toBe(false);
  expect(
    buildCaseDigest(unchanged, [], '2026-11-16', new Date(), { free: true })
  ).toContain('No new status since then.');
});
