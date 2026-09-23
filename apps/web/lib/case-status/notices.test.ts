import { expect, it } from 'vitest';
import { noticeSchema } from './notices';
import { deadlineCalendar } from './calendar';
import {
  usableOfficialSnapshot,
  type OfficialProcessingSnapshot,
} from './official-processing-times';

const notice = {
  case_id: '11111111-1111-4111-8111-111111111111',
  title: 'RFE response',
  kind: 'rfe',
};
it('requires explicit confirmation for a notice deadline, not for receipt storage', () => {
  expect(noticeSchema.safeParse(notice).success).toBe(true);
  expect(
    noticeSchema.safeParse({ ...notice, due_date: '2026-10-01' }).success
  ).toBe(false);
  expect(
    noticeSchema.safeParse({
      ...notice,
      due_date: '2026-10-01',
      deadline_confirmed: true,
    }).success
  ).toBe(true);
  expect(
    noticeSchema.safeParse({
      ...notice,
      due_date: '2026-02-30',
      deadline_confirmed: true,
    }).success
  ).toBe(false);
  expect(
    noticeSchema.safeParse({ ...notice, email_reminder: true }).success
  ).toBe(false);
});
it('exports all-day calendar dates, escapes injection and folds long lines', () => {
  const ics = deadlineCalendar(
    'Deadline\nBEGIN:VEVENT;fake, ' + 'é'.repeat(90),
    '2026-12-31',
    'notice-1',
    new Date('2026-09-23T12:00:00Z')
  );
  expect(ics).toContain(
    'DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101'
  );
  expect(ics).toContain('SUMMARY:Deadline\\nBEGIN:VEVENT\\;fake\\,');
  expect(ics.match(/\r\nBEGIN:VEVENT/g)).toHaveLength(1);
  for (const line of ics.split('\r\n'))
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
});
const snapshot: OfficialProcessingSnapshot = {
  form: 'I-765',
  category: 'F-1 academic student (c)(3)',
  office: 'Example official office',
  months: 3,
  percentile: 80,
  publishedDate: '2026-09-01',
  checkedDate: '2026-09-22',
  source: 'https://egov.uscis.gov/processing-times',
};
it('never displays an unofficial, future, stale or missing official snapshot', () => {
  const now = new Date('2026-09-23T12:00:00Z');
  expect(usableOfficialSnapshot(snapshot, now)).toEqual(snapshot);
  expect(usableOfficialSnapshot(undefined, now)).toBeNull();
  expect(
    usableOfficialSnapshot(
      {
        ...snapshot,
        source: 'https://egov.uscis.gov.evil.test/processing-times',
      },
      now
    )
  ).toBeNull();
  expect(
    usableOfficialSnapshot({ ...snapshot, checkedDate: '2026-10-01' }, now)
  ).toBeNull();
  expect(
    usableOfficialSnapshot(
      { ...snapshot, publishedDate: '2026-07-01', checkedDate: '2026-07-02' },
      now
    )
  ).toBeNull();
});
