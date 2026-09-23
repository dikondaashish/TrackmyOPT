import { describe, expect, it } from 'vitest';
import { getStemFilingWindow } from '../opt-calculations';

describe('STEM filing window shared by portal and email', () => {
  it('uses the EAD estimate when recommendation is missing', () => {
    expect(getStemFilingWindow('2026-12-31')).toEqual({ earliestFile: '2026-10-02', hardDeadline: '2026-12-31', recommendationDeadline: null, isDsoLimited: false });
  });
  it('uses the earlier 60-day recommendation deadline', () => {
    expect(getStemFilingWindow('2026-12-31', '2026-10-01')).toMatchObject({ hardDeadline: '2026-11-30', recommendationDeadline: '2026-11-30', isDsoLimited: true });
  });
  it('never extends filing beyond EAD expiry', () => {
    expect(getStemFilingWindow('2026-12-31', '2026-12-01')).toMatchObject({ hardDeadline: '2026-12-31', isDsoLimited: false });
  });
  it('handles leap years and DST using calendar days', () => {
    expect(getStemFilingWindow('2024-04-30', '2024-02-01').hardDeadline).toBe('2024-04-01');
  });
  it('preserves a passed recommendation deadline instead of resetting it', () => {
    expect(getStemFilingWindow('2026-12-31', '2026-01-01').hardDeadline).toBe('2026-03-02');
  });
});
