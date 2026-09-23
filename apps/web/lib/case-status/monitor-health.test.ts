import { describe, expect, it } from 'vitest';
import { monitorHealth } from './monitor-health';

const now = Date.parse('2026-09-23T12:00:00Z');
describe('monitor health', () => {
  it('does not claim monitoring works based on a paid subscription alone', () => {
    expect(monitorHealth(true, '2026-06-16', null, now)).toBe('delayed');
    expect(monitorHealth(true, null, null, now)).toBe('unconfirmed');
  });
  it('distinguishes failures, recent checks and manual checking', () => {
    expect(
      monitorHealth(true, '2026-09-23T10:00:00Z', '2026-09-23T11:00:00Z', now)
    ).toBe('failed');
    expect(
      monitorHealth(true, '2026-09-23T11:00:00Z', '2026-09-23T10:00:00Z', now)
    ).toBe('recent');
    expect(monitorHealth(false, '2026-09-23', null, now)).toBe('off');
    expect(monitorHealth(true, 'invalid', null, now)).toBe('unconfirmed');
    expect(monitorHealth(true, '2027-01-01', null, now)).toBe('unconfirmed');
  });
});
