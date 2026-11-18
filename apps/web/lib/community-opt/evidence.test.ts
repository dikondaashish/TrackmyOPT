import { describe, expect, it } from 'vitest';
import {
  prepareEvidence,
  premiumUpgradeStats,
  removeCrossPartnerRedditDuplicates,
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
      'Community source 1',
      'Community source 2',
    ]);
  });
  it('excludes a prior import for each source while keeping the latest batch of another source', () => {
    const rows = [
      { ...row, external_id: 'optt_old', updated_at: '2026-09-22T10:00:00Z' },
      { ...row, external_id: 'optt_new', updated_at: '2026-09-23T10:00:00Z' },
      { ...row, external_id: 'optp_current', updated_at: '2026-09-22T10:00:00Z' },
    ];
    const result = prepareEvidence(rows, now);
    expect(result.rows.map((r) => r.external_id)).toEqual(['optt_new', 'optp_current']);
    expect(result.evidence.excludedOlderImport).toBe(1);
    expect(result.evidence.totalReports).toBe(3);
  });
  it('excludes a category that was absent from its source-wide latest import', () => {
    const result = prepareEvidence(
      [{ ...row, external_id: 'optp_old', updated_at: '2026-09-22T10:00:00Z' }],
      now,
      new Map([['OPT Pulse', Date.parse('2026-09-23T10:00:00Z')]])
    );
    expect(result.rows).toHaveLength(0);
    expect(result.evidence.excludedOlderImport).toBe(1);
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

describe('cross-partner Reddit duplicates', () => {
  const reddit = {
    ...row,
    source: 'reddit',
    premium_processing: false,
    pp_date: null,
    card_produce_date: null,
    delivered_date: null,
  };
  it('counts a Reddit post reported by both partners once, keeping the fuller report', () => {
    const result = prepareEvidence(
      [
        { ...reddit, external_id: 'optt_a' },
        { ...reddit, external_id: 'optp_a', card_produce_date: '2026-03-12' },
      ],
      now
    );
    expect(result.rows.map((r) => r.external_id)).toEqual(['optp_a']);
    expect(result.evidence).toMatchObject({
      includedReports: 1,
      crossSourceDuplicatesRemoved: 1,
    });
  });
  it('never merges reports from one partner, non-Reddit reports, or conflicting dates', () => {
    const kept = prepareEvidence(
      [
        { ...reddit, external_id: 'optt_a' },
        { ...reddit, external_id: 'optt_b' },
        { ...reddit, external_id: 'optt_registered', source: 'registered' },
        { ...reddit, external_id: 'optp_registered_match', source: 'other' },
        {
          ...reddit,
          external_id: 'optp_other_bio',
          biometrics_date: '2026-01-20',
        },
      ].map((r, i) =>
        i === 0 ? { ...r, biometrics_date: '2026-01-15' } : r
      ),
      now
    );
    // optp_other_bio cannot pair with optt_a (different biometrics date) but
    // pairs with optt_b, which has none.
    expect(kept.evidence.crossSourceDuplicatesRemoved).toBe(1);
    expect(kept.rows.map((r) => r.external_id).sort()).toEqual(
      ['optp_other_bio', 'optp_registered_match', 'optt_a', 'optt_registered'].sort()
    );
  });
  it('pairs each report at most once', () => {
    const base = {
      case_kind: 'initial_opt' as const,
      source: 'reddit' as const,
      premium_processing: false,
      init_date: '2026-01-01',
      approve_date: '2026-03-10',
    };
    const rows = ['optt_1', 'optt_2', 'optp_1'].map((external_id) => ({
      ...base,
      external_id,
    }));
    expect(removeCrossPartnerRedditDuplicates(rows)).toHaveLength(2);
  });
});
