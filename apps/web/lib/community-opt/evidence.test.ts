import { describe, expect, it } from 'vitest';
import {
  prepareEvidence,
  premiumUpgradeStats,
  type EvidenceRow,
} from './evidence';
import { deriveJourneyPhase } from './stages';

const now = new Date('2026-09-23T12:00:00Z');
const row: EvidenceRow = {
  external_id: 'optt_one',
  case_kind: 'initial_opt',
  updated_at: '2026-09-23T10:00:00Z',
  init_date: '2026-01-01',
  pp_date: '2026-03-01',
  approve_date: '2026-03-10',
  card_produce_date: '2026-03-12',
  delivered_date: '2026-03-15',
  premium_processing: true,
};
describe('community evidence', () => {
  it('excludes stale, unknown and future refresh timestamps without deleting source records', () => {
    const rows = [
      row,
      { ...row, external_id: 'old', updated_at: '2026-07-01' },
      { ...row, external_id: 'missing', updated_at: null },
      { ...row, external_id: 'future', updated_at: '2027-01-01' },
    ];
    const result = prepareEvidence(rows, now);
    expect(result.rows).toHaveLength(1);
    expect(result.evidence).toMatchObject({
      totalReports: 4,
      includedReports: 1,
      excludedStale: 1,
      excludedUnknownFreshness: 2,
    });
    expect(rows).toHaveLength(4);
  });
  it('removes repeated IDs but does not merge different applicants with identical dates', () => {
    const result = prepareEvidence(
      [row, row, { ...row, external_id: 'optp_two' }],
      now
    );
    expect(result.rows).toHaveLength(2);
    expect(result.evidence).toMatchObject({
      duplicateIdsRemoved: 1,
      possibleCrossSourceDuplicates: 1,
      filingRange: ['2026-01-01', '2026-01-01'],
    });
    expect(result.evidence.sources.map((s) => s.name)).toEqual([
      'OPT Tracker',
      'OPT Pulse',
    ]);
  });
  it('uses upgrade-to-approval, not filing-to-approval, and permits same-day approvals', () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({
      ...row,
      external_id: `optt_${i}`,
      pp_date: '2026-03-10',
    }));
    expect(premiumUpgradeStats(rows, now)).toEqual({
      sampleSize: 15,
      medianDays: 0,
      p25Days: 0,
      p75Days: 0,
    });
    expect(
      premiumUpgradeStats(
        rows.map((r) => ({ ...r, pp_date: '2026-03-01' })),
        now
      ).medianDays
    ).toBe(9);
  });
  it('rejects reversed, missing and future pairs and withholds small samples', () => {
    const stats = premiumUpgradeStats(
      [
        row,
        { ...row, pp_date: '2026-04-01' },
        { ...row, pp_date: null },
        { ...row, approve_date: '2027-01-01' },
      ],
      now
    );
    expect(stats).toEqual({
      sampleSize: 1,
      medianDays: null,
      p25Days: null,
      p75Days: null,
    });
  });
});
it.each([
  'Request for Evidence Was Mailed',
  'Notice Explaining USCIS Actions Was Mailed',
  'Response Was Delivered',
])('does not treat %s as card progress', (status) => {
  expect(deriveJourneyPhase(status)).toBe('filed');
});
it('does not treat carrier pickup as delivery to the applicant', () => {
  expect(
    deriveJourneyPhase('Card Was Picked Up By The United States Postal Service')
  ).toBe('card_produced');
});
