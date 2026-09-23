import { expect, it } from 'vitest';
import { buildMilestones } from './MilestoneTimeline';

it('does not certify immigration status or employment from a projected EAD date', () => {
  const rows = buildMilestones('2026-04-01', '2026-07-01', null, null, new Date('2026-09-23T12:00:00Z'));
  expect(rows.find(r => r.key === 'f1')?.status).not.toBe('done');
  expect(rows.find(r => r.key === 'employment')?.status).not.toBe('done');
  expect(rows.find(r => r.key === 'ead')?.status).not.toBe('done');
});
