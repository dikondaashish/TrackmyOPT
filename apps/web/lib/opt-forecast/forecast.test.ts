import { describe, expect, it } from 'vitest';
import {
  backtest,
  censorSurvival,
  ipcwBrier,
  validationFold,
} from './backtest';
import {
  addDays,
  classify,
  isoDay,
  normalizeObservations,
  toSurvivalRecord,
  trainingRecords,
} from './normalize';
import { conditional, fitCurve, predict } from './survival';
import { isPromoted } from './service';
import { MODEL_VERSION, type Observation, type SurvivalRecord } from './types';

const stamp = (day: string) => day + 'T12:00:00.000Z';
const obs = (
  id: number,
  day: string,
  status = 'Case Was Received',
  patch: Partial<Observation> = {}
): Observation => ({
  id,
  case_id: 'case-1',
  application_id: 'app-1',
  observed_at: stamp(day),
  synced_at: stamp(day),
  provider: { status, form: 'I-765', received: '2026-01-01', events: [] },
  reported: {
    category: 'initial_opt',
    category_confirmed_at: stamp('2026-01-01'),
    filing_date: '2025-12-30',
    premium_start: null,
  },
  ...patch,
});
const normalize = (rows: Observation[], at = '2026-10-13') =>
  normalizeObservations(rows, stamp(at));

describe('as-of timeline normalization', () => {
  it('rejects impossible dates and keeps UTC date arithmetic', () => {
    expect(isoDay('2026-02-30')).toBeNull();
    expect(isoDay('February 30, 2026')).toBeNull();
    expect(isoDay('January 31, 2026')).toBe('2026-01-31');
    expect(isoDay('garbage')).toBeNull();
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
  });
  it('counts daily and shared-owner observations as one application with delayed entry', () => {
    const first = obs(1, '2026-03-01');
    const last = obs(2, '2026-04-01');
    const t = normalize([
      first,
      last,
      { ...last, id: 3, case_id: 'another-owner' },
    ]);
    expect(t).toHaveLength(1);
    expect(t[0]!.caseIds).toHaveLength(2);
    expect(toSurvivalRecord(t[0]!)).toMatchObject({
      entry: 59,
      exit: 90,
      event: 'censored',
    });
    expect(t[0]!.receiptDate).toBe('2026-01-01');
    expect(t[0]!.reportedFilingDate).toBe('2025-12-30');
  });
  it('does not infer receipt from an RFE response or count card production as approval', () => {
    const r = obs(1, '2026-04-01', 'Card Is Being Produced');
    r.provider.received = null;
    r.provider.events = [
      {
        status: 'Response To USCIS Request For Evidence Was Received',
        date: '2026-03-01',
      },
    ];
    const t = normalize([r])[0]!;
    expect(t.receiptDate).toBeNull();
    expect(t.eventDate).toBeNull();
    expect(t.outcome).toBe('unknown');
    expect(toSurvivalRecord(t)).toBeNull();
    expect(classify('Case Was Denied')).toBe('denial');
    expect(classify('Withdrawal Acknowledgement Notice Was Sent')).toBe(
      'withdrawal'
    );
  });
  it('reads USCIS long-form history sentences and current titles', () => {
    expect(classify('USCIS Is currently Processing the Case')).toBe('pending');
    expect(
      classify(
        'We received your Form I-765, Application for Employment Authorization, and sent you a receipt notice.'
      )
    ).toBe('pending');
    expect(classify('Approval Case Decision Rendered')).toBe('approval');
    expect(
      classify(
        'We produced your new card for your Form I-765, Application for Employment Authorization.'
      )
    ).toBe('unknown');
    const r = obs(1, '2026-05-20', 'Card Was Picked Up By The United States Postal Service');
    r.provider.received = null;
    r.provider.events = [
      {
        status:
          'We received your Form I-765, Application for Employment Authorization, and sent you a receipt notice.',
        date: '2026-02-02',
      },
      {
        status:
          'We started the premium-processing clock for your Form I-765, Application for Employment Authorization.',
        date: '2026-04-01',
      },
      {
        status:
          'Your Form I-765, Application for Employment Authorization, has been approved.',
        date: '2026-04-20',
      },
    ];
    const t = normalize([r])[0]!;
    expect(t.receiptDate).toBe('2026-02-02');
    expect(t.premiumStart).toBe('2026-04-01');
    expect(t.flags).toContain('verified_premium_start');
    expect(t.outcome).toBe('approval');
    expect(t.eventDate).toBe('2026-04-20');
  });
  it('uses an explicit approval history date after card delivery, never the card date', () => {
    const r = obs(2, '2026-04-15', 'Card Was Delivered To Me');
    r.provider.events = [
      { status: 'Card Was Delivered To Me', date: '2026-04-14' },
      { status: 'Case Was Approved', date: '2026-04-01' },
    ];
    const t = normalize([obs(1, '2026-03-01'), r])[0]!;
    expect(toSurvivalRecord(t)).toMatchObject({
      entry: 59,
      exit: 90,
      event: 'approval',
    });
    expect(predict(t, null, stamp('2026-04-15')).approvalDate).toBe(
      '2026-04-01'
    );
  });
  it('does not invent an exact date when current approval has no history date', () => {
    const t = normalize([
      obs(1, '2026-03-01'),
      obs(2, '2026-04-01', 'Case Was Approved'),
    ])[0]!;
    expect(t.eventDate).toBeNull();
    expect(predict(t, null, stamp('2026-04-01')).state).toBe('approved');
    expect(toSurvivalRecord(t)).toBeNull();
  });
  it('quarantines conflicting outcomes and conflicting shared enrollment metadata', () => {
    const r = obs(3, '2026-04-02', 'Case Was Received');
    r.provider.events = [{ status: 'Case Was Approved', date: '2026-04-01' }];
    const t = normalize([obs(1, '2026-03-01'), r])[0]!;
    expect(t.flags).toContain('contradictory_outcome');
    expect(toSurvivalRecord(t)).toBeNull();
    const conflicting = {
      ...r,
      id: 4,
      case_id: 'other',
      reported: { ...r.reported, category: 'stem_extension' },
    };
    expect(normalize([r, conflicting])[0]!.flags).toContain(
      'conflicting_category'
    );
  });
  it('records delayed reporting while keeping event and observation times distinct', () => {
    const r = obs(3, '2026-04-05', 'Case Was Approved');
    r.provider.events = [{ status: 'Case Was Approved', date: '2026-04-01' }];
    const rows = [obs(1, '2026-03-01'), obs(2, '2026-04-03'), r];
    expect(normalize(rows, '2026-04-04')[0]!.outcome).toBe('pending');
    const t = normalize(rows)[0]!;
    expect(t.flags).toContain('delayed_event_reporting');
    expect(toSurvivalRecord(t)).toMatchObject({ exit: 90, event: 'approval' });
  });
  it('excludes already-approved enrollment from prospective risk sets', () => {
    const r = obs(1, '2026-04-05', 'Case Was Approved');
    r.provider.events = [{ status: 'Case Was Approved', date: '2026-04-01' }];
    expect(toSurvivalRecord(normalize([r])[0]!)).toBeNull();
  });
  it('treats an upgrade as a regular competing event, then uses a separate premium clock', () => {
    const regular = obs(1, '2026-03-01');
    const pp = obs(2, '2026-03-20');
    pp.reported.premium_start = '2026-03-15';
    const end = obs(3, '2026-04-01');
    end.reported.premium_start = '2026-03-15';
    const rows = [regular, pp, end];
    expect(
      trainingRecords(
        rows,
        stamp('2026-04-02'),
        'initial_opt',
        'regular_unconfirmed'
      )
    ).toEqual([{ id: 'app-1', entry: 59, exit: 73, event: 'upgrade' }]);
    expect(
      trainingRecords(rows, stamp('2026-04-02'), 'initial_opt', 'premium')
    ).toEqual([{ id: 'app-1', entry: 5, exit: 17, event: 'censored' }]);
    expect(normalize(rows, '2026-03-10')[0]!.processing).toBe(
      'regular_unconfirmed'
    );
  });
  it('rejects missing premium dates and unknown OPT classifications', () => {
    const r = obs(1, '2026-03-01', 'Premium Processing Clock Was Started');
    const end = {
      ...r,
      id: 2,
      observed_at: stamp('2026-04-01'),
      synced_at: stamp('2026-04-01'),
    };
    expect(toSurvivalRecord(normalize([r, end])[0]!)).toBeNull();
    r.reported.category_confirmed_at = null;
    expect(normalize([r])[0]!.flags).toContain('unconfirmed_category');
  });
  it('rejects premium dates before receipt regardless of their source', () => {
    for (const source of ['provider', 'reported', 'legacy']) {
      const r = obs(1, '2026-03-01');
      if (source === 'provider')
        r.provider.events = [
          {
            status: 'Premium Processing Clock Was Started',
            date: '2025-12-01',
          },
        ];
      if (source === 'reported') r.reported.premium_start = '2025-12-01';
      if (source === 'legacy') r.reported.legacy_premium_start = '2025-12-01';
      const t = normalize([r])[0]!;
      expect(t.flags).toContain('invalid_premium_start');
      expect(toSurvivalRecord(t)).toBeNull();
    }
  });
});

describe('delayed-entry competing-risk survival', () => {
  const row = (
    id: string,
    exit: number,
    event: SurvivalRecord['event'] = 'approval',
    entry = 0
  ) => ({ id, entry, exit, event });
  it('matches hand-calculated KM with event/censor ties', () => {
    const c = fitCurve([row('a', 10), row('b', 10, 'censored'), row('c', 20)]);
    expect(c.points.find((p) => p.day === 10)).toMatchObject({
      atRisk: 3,
      approvals: 1,
    });
    expect(c.points.find((p) => p.day === 10)!.survival).toBeCloseTo(2 / 3);
    expect(c.points.at(-1)!.approval).toBeCloseTo(1);
  });
  it('does not turn competing outcomes into approvals or censor them', () => {
    const c = fitCurve([row('a', 10), row('b', 10, 'denial'), row('c', 20)]);
    expect(c.points.at(-1)!.approval).toBeCloseTo(2 / 3);
    expect(conditional(c, 0, 1).quantiles[3]).toBeNull();
  });
  it('includes delayed enrollees only after they enter', () => {
    const c = fitCurve([
      row('a', 10),
      row('b', 30),
      row('late', 30, 'approval', 20),
    ]);
    expect(c.points.find((p) => p.day === 10)!.atRisk).toBe(2);
    expect(c.points.find((p) => p.day === 30)!.atRisk).toBe(2);
  });
  it('conditions remaining wait without sliding the calendar median every day', () => {
    const c = fitCurve(
      Array.from({ length: 100 }, (_, i) => row(String(i), 110 + i))
    );
    const a = conditional(c, 104),
      b = conditional(c, 105);
    expect(a.quantiles[2]).not.toBeNull();
    expect(104 + a.quantiles[2]!).toBe(105 + b.quantiles[2]!);
    expect(conditional(c, 1000).quantiles.every((q) => q === null)).toBe(true);
  });
  it('does not cross empty follow-up gaps or extrapolate censored tails', () => {
    expect(
      conditional(
        fitCurve([row('a', 10, 'censored'), row('b', 40, 'approval', 30)]),
        5,
        1
      ).quantiles.every((q) => q === null)
    ).toBe(true);
    expect(
      conditional(
        fitCurve(
          Array.from({ length: 30 }, (_, i) => row(String(i), 50, 'censored'))
        ),
        10
      ).quantiles.every((q) => q === null)
    ).toBe(true);
  });
  it('rejects duplicate applications and malformed intervals', () => {
    expect(() => fitCurve([row('a', 10), row('a', 20)])).toThrow('Duplicate');
    expect(() => fitCurve([row('a', 10, 'approval', 10)])).toThrow('Invalid');
  });
});

describe('evaluation and promotion gates', () => {
  it('handles censored evaluation and competing-event Brier contributions', () => {
    const training = [
      { duration: 10, event: 'approval' as const },
      { duration: 20, event: 'censored' as const },
    ];
    expect(censorSurvival(training, 15)).toBe(1);
    const score = ipcwBrier(
      [
        { truth: { duration: 5, event: 'approval' }, probability: 0.5 },
        { truth: { duration: 5, event: 'competing' }, probability: 0.5 },
      ],
      training,
      7
    );
    expect(score.score).toBe(0.25);
    expect(
      ipcwBrier(
        [{ truth: { duration: 30, event: 'censored' }, probability: 0.5 }],
        training,
        25
      ).score
    ).toBeNull();
  });
  it('does not leak future evidence into earlier forecasts or manufacture metrics', () => {
    const report = backtest({
      observations: [obs(1, '2026-10-13')],
      community: [],
      landmarks: [stamp('2026-08-01')],
      evaluationCutoff: stamp('2026-10-13'),
    });
    expect(report.models.B_survival.attempted).toBe(0);
    expect(report.models.B_survival.meanAbsoluteErrorDays).toBeNull();
    expect(report.promotionEligible).toBe(false);
    expect(validationFold('same-application')).toBe(
      validationFold('same-application')
    );
  });
  it('requires source authorization and a reviewed exact version/cohort', () => {
    const p = {
      uscis_training_authorized: true,
      promoted_model: MODEL_VERSION,
      validation: {
        modelVersion: MODEL_VERSION,
        approved: true,
        reviewedAt: stamp('2026-10-13'),
        reportReference: 'reviewed-test-report',
        cohorts: ['initial_opt:premium'],
      },
    };
    expect(isPromoted(p, 'initial_opt:premium')).toBe(true);
    expect(
      isPromoted(
        { ...p, uscis_training_authorized: false },
        'initial_opt:premium'
      )
    ).toBe(false);
    expect(isPromoted(p, 'stem_extension:premium')).toBe(false);
    expect(
      isPromoted({ ...p, promoted_model: 'old' }, 'initial_opt:premium')
    ).toBe(false);
  });
});
