import { percentile } from '../community-opt/estimate';
import { prepareEvidence } from '../community-opt/evidence';
import {
  addDays,
  days,
  normalizeObservations,
  trainingRecords,
} from './normalize';
import { conditional, fitCurve, predict } from './survival';
import type { Curve, Forecast, Observation, Timeline } from './types';

export type CommunityObservation = {
  id: number;
  timeline_id: string;
  observed_at: string;
  payload: {
    external_id: string;
    case_kind: string;
    premium_processing: boolean;
    init_date: string | null;
    approve_date: string | null;
    days_to_approval: number | null;
    external_updated_at: string | null;
  };
};
export const CANDIDATES = [
  'A_legacy',
  'B_survival',
  'C_receipt_30',
  'C_receipt_60',
  'C_receipt_90',
] as const;
export type Candidate = (typeof CANDIDATES)[number];
type Followup = {
  duration: number;
  event: 'approval' | 'competing' | 'censored';
};
type Scored = {
  id: string;
  landmark: string;
  segment: string;
  waitGroup: string;
  predicted: Forecast | null;
  truth: Followup;
  probabilities: Array<number | null>;
};
const HORIZONS = [7, 14, 30, 60, 90];

// Stable application-level partition: no enrollment of the same receipt can be in both sets.
export function validationFold(id: string): number {
  let hash = 2166136261;
  for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return (hash >>> 0) % 5;
}
function followup(
  start: Timeline,
  end: Timeline | undefined,
  landmark: string
): Followup {
  if (!end) return { duration: 0, event: 'censored' };
  if (
    start.processing === 'regular_unconfirmed' &&
    end.premiumStart &&
    end.premiumStart > landmark.slice(0, 10)
  )
    return { duration: days(landmark, end.premiumStart), event: 'competing' };
  if (
    end.eventDate &&
    end.eventDate > landmark.slice(0, 10) &&
    !end.flags.some((f) =>
      ['contradictory_outcome', 'invalid_event_date'].includes(f)
    )
  ) {
    if (end.outcome === 'approval')
      return { duration: days(landmark, end.eventDate), event: 'approval' };
    if (end.outcome === 'denial' || end.outcome === 'withdrawal')
      return { duration: days(landmark, end.eventDate), event: 'competing' };
  }
  return {
    duration: Math.max(0, days(landmark, end.lastPendingAt ?? landmark)),
    event: 'censored',
  };
}

/** Reverse KM for independent censoring, estimated on the non-held-out follow-up. */
export function censorSurvival(
  rows: Followup[],
  time: number,
  before = false
): number {
  let survival = 1;
  const times = [...new Set(rows.map((r) => r.duration))].sort((a, b) => a - b);
  for (const t of times) {
    if (before ? t >= time : t > time) break;
    const risk = rows.filter((r) => r.duration >= t).length;
    const censored = rows.filter(
      (r) => r.duration === t && r.event === 'censored'
    ).length;
    if (risk) survival *= 1 - censored / risk;
  }
  return survival;
}
export function ipcwBrier(
  rows: Array<{ truth: Followup; probability: number | null }>,
  censorTraining: Followup[],
  horizon: number
): { score: number | null; eligible: number } {
  if (!rows.length || !censorTraining.length)
    return { score: null, eligible: 0 };
  let total = 0,
    eligible = 0;
  for (const { truth, probability } of rows) {
    if (probability === null) continue;
    eligible++;
    if (truth.duration <= horizon && truth.event === 'censored') continue;
    const happened = truth.duration <= horizon;
    const g = censorSurvival(
      censorTraining,
      happened ? truth.duration : horizon,
      happened
    );
    // Do not clip huge weights and silently claim calibration beyond censor support.
    if (g <= 0.05) return { score: null, eligible };
    const outcome = happened && truth.event === 'approval' ? 1 : 0;
    total += (outcome - probability) ** 2 / g;
  }
  return { score: eligible ? total / eligible : null, eligible };
}
/** Approval CIF interval mass, with competing outcomes contributing zero. */
export function ipcwIntervalCoverage(
  rows: Scored[],
  censorTraining: Followup[],
  level: 50 | 80
) {
  let eligible = 0,
    total = 0;
  for (const r of rows) {
    const bounds = r.predicted?.[level === 50 ? 'interval50' : 'interval80'];
    if (!bounds?.[0] || !bounds[1]) continue;
    const lower = days(r.landmark, bounds[0]),
      upper = days(r.landmark, bounds[1]);
    eligible++;
    if (upper < 0) continue;
    if (!censorTraining.length || censorSurvival(censorTraining, upper) <= 0.05)
      return { coverage: null, nominal: level / 100, eligible };
    if (
      r.truth.event === 'approval' &&
      r.truth.duration >= lower &&
      r.truth.duration <= upper
    ) {
      const g = censorSurvival(censorTraining, r.truth.duration, true);
      if (g <= 0.05) return { coverage: null, nominal: level / 100, eligible };
      total += 1 / g;
    }
  }
  return {
    coverage: eligible ? total / eligible : null,
    nominal: level / 100,
    eligible,
  };
}

function pairedErrorDifference(a: Scored[], b: Scored[]) {
  const reference = new Map(
    a
      .filter((r) => r.predicted?.medianDate && r.truth.event === 'approval')
      .map((r) => [r.id + ':' + r.landmark, r])
  );
  const byApplication = new Map<string, number[]>();
  for (const r of b) {
    const old = reference.get(r.id + ':' + r.landmark);
    if (!old || !r.predicted?.medianDate || r.truth.event !== 'approval')
      continue;
    const difference =
      Math.abs(days(r.landmark, r.predicted.medianDate) - r.truth.duration) -
      Math.abs(
        days(old.landmark, old.predicted!.medianDate!) - old.truth.duration
      );
    byApplication.set(r.id, [...(byApplication.get(r.id) ?? []), difference]);
  }
  const values = [...byApplication.values()].map(
    (xs) => xs.reduce((a, b) => a + b, 0) / xs.length
  );
  if (values.length < 30)
    return {
      applications: values.length,
      meanDifferenceDays: null,
      bootstrap95: null,
    };
  let state = 123456789;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const means = Array.from(
    { length: 400 },
    () =>
      Array.from(
        { length: values.length },
        () => values[Math.floor(random() * values.length)]!
      ).reduce((a, b) => a + b, 0) / values.length
  ).sort((a, b) => a - b);
  return {
    applications: values.length,
    meanDifferenceDays: values.reduce((a, b) => a + b, 0) / values.length,
    bootstrap95: [
      means[Math.floor(0.025 * means.length)],
      means[Math.floor(0.975 * means.length)],
    ],
  };
}
function legacy(
  rows: CommunityObservation[],
  t: Timeline,
  cutoff: string
): { forecast: Forecast; probabilities: number[] } | null {
  const latest = new Map<string, CommunityObservation>();
  for (const row of rows
    .filter((r) => r.observed_at <= cutoff)
    .sort((a, b) => a.id - b.id))
    latest.set(row.timeline_id, row);
  const values = prepareEvidence(
    [...latest.values()].map((r) => ({
      ...r.payload,
      updated_at: r.observed_at,
    })),
    new Date(cutoff)
  )
    .rows.filter(
      (r) =>
        r.case_kind === t.kind &&
        r.premium_processing === (t.processing === 'premium')
    )
    .map((r) => r.days_to_approval)
    .filter((n): n is number => n != null && n >= 7 && n <= 400)
    .sort((a, b) => a - b);
  const origin = t.reportedFilingDate ?? t.receiptDate;
  if (values.length < 15 || !origin) return null;
  const f = predict(t, null, cutoff);
  const date = (p: number) => addDays(origin, percentile(values, p));
  return {
    probabilities: HORIZONS.map(
      (h) =>
        values.filter((n) => n <= days(origin, cutoff) + h).length /
        values.length
    ),
    forecast: {
      ...f,
      state: 'estimate',
      modelVersion: 'legacy-percentiles',
      medianDate: date(0.5),
      interval50: [date(0.25), date(0.75)],
      interval80: [date(0.1), date(0.9)],
      sampleSize: values.length,
    },
  };
}
function summarize(rows: Scored[]) {
  const eligible = rows.filter((r) => r.predicted?.medianDate);
  const resolved = eligible.filter((r) => r.truth.event === 'approval');
  const errors = resolved
    .map((r) =>
      Math.abs(days(r.landmark, r.predicted!.medianDate!) - r.truth.duration)
    )
    .sort((a, b) => a - b);
  const mean = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  const coverage = (key: 'interval50' | 'interval80') => {
    const scored = resolved.filter((r) => r.predicted![key].every(Boolean));
    return {
      n: scored.length,
      value: mean(
        scored.map((r) => {
          const [lo, hi] = r.predicted![key];
          return days(r.landmark, lo!) <= r.truth.duration &&
            days(r.landmark, hi!) >= r.truth.duration
            ? 1
            : 0;
        })
      ),
    };
  };
  return {
    attempted: rows.length,
    uniqueApplications: new Set(rows.map((r) => r.id)).size,
    forecasts: eligible.length,
    observedApprovals: resolved.length,
    meanAbsoluteErrorDays: mean(errors),
    medianAbsoluteErrorDays: errors.length ? percentile(errors, 0.5) : null,
    within7: mean(errors.map((e) => (e <= 7 ? 1 : 0))),
    within14: mean(errors.map((e) => (e <= 14 ? 1 : 0))),
    within30: mean(errors.map((e) => (e <= 30 ? 1 : 0))),
    coverage50: coverage('interval50'),
    coverage80: coverage('interval80'),
  };
}

/** Rolling-origin, held-out-application evaluation. Reports only aggregate data. */
export function backtest(input: {
  observations: Observation[];
  community: CommunityObservation[];
  landmarks: string[];
  evaluationCutoff: string;
}) {
  const scored: Record<Candidate, Scored[]> = {
    A_legacy: [],
    B_survival: [],
    C_receipt_30: [],
    C_receipt_60: [],
    C_receipt_90: [],
  };
  const brier: Record<string, unknown> = {};
  const intervalCalibration: Record<string, unknown> = {};
  let retrospectivePendingCorrections = 0;
  const end = new Map(
    normalizeObservations(input.observations, input.evaluationCutoff).map(
      (t) => [t.applicationId, t]
    )
  );
  for (const landmark of input.landmarks) {
    if (landmark >= input.evaluationCutoff) continue;
    const atTime = normalizeObservations(input.observations, landmark);
    const pendingTargets = atTime.filter(
      (t) =>
        validationFold(t.applicationId) === 0 &&
        t.outcome === 'pending' &&
        t.kind &&
        t.receiptDate &&
        days(t.lastSyncedAt, landmark) <= 2
    );
    const targets = pendingTargets.filter((t) => {
      const knownLater = end.get(t.applicationId);
      if (
        knownLater?.eventDate &&
        knownLater.eventDate <= landmark.slice(0, 10)
      ) {
        retrospectivePendingCorrections++;
        return false;
      }
      return true;
    });
    const training = input.observations.filter(
      (o) => validationFold(o.application_id) !== 0 && o.observed_at <= landmark
    );
    const censoring = atTime
      .filter(
        (t) => validationFold(t.applicationId) !== 0 && t.outcome === 'pending'
      )
      .filter(
        (t) =>
          !end.get(t.applicationId)?.eventDate ||
          end.get(t.applicationId)!.eventDate! > landmark.slice(0, 10)
      )
      .map((t) => followup(t, end.get(t.applicationId), landmark));
    const slice: Record<Candidate, Scored[]> = {
      A_legacy: [],
      B_survival: [],
      C_receipt_30: [],
      C_receipt_60: [],
      C_receipt_90: [],
    };
    const curveCache = new Map<string, Curve>();
    const origins = new Map(
      normalizeObservations(training, landmark).map((row) => [
        row.applicationId,
        row.receiptDate,
      ])
    );
    for (const t of targets)
      for (const candidate of CANDIDATES) {
        let predicted: Forecast | null = null;
        let probabilities: Array<number | null> = HORIZONS.map(() => null);
        if (candidate === 'A_legacy') {
          const baseline = legacy(input.community, t, landmark);
          predicted = baseline?.forecast ?? null;
          probabilities = baseline?.probabilities ?? probabilities;
        } else {
          const window =
            candidate === 'B_survival'
              ? null
              : Number(candidate.split('_').at(-1));
          const cacheKey = `${candidate}:${t.kind}:${t.processing}`;
          let curve = curveCache.get(cacheKey);
          if (!curve) {
            const rows = trainingRecords(
              training,
              landmark,
              t.kind,
              t.processing
            ).filter(
              (r) =>
                !window ||
                (origins.get(r.id) &&
                  days(origins.get(r.id)!, landmark) <= window)
            );
            curve = fitCurve(rows);
            curveCache.set(cacheKey, curve);
          }
          predicted = predict(t, curve, landmark);
          if (predicted.state === 'estimate' && t.origin) {
            const conditionalCurve = conditional(
              curve,
              days(t.origin, landmark)
            );
            probabilities = HORIZONS.map((h) =>
              h > conditionalCurve.supportedThrough
                ? null
                : (conditionalCurve.cdf.filter((p) => p.remaining <= h).at(-1)
                    ?.probability ?? null)
            );
          }
        }
        const row: Scored = {
          id: t.applicationId,
          landmark,
          segment: `${t.kind}:${t.processing}`,
          waitGroup:
            days(t.receiptDate!, landmark) < 90
              ? 'under_90_days'
              : '90_plus_days',
          predicted,
          truth: followup(t, end.get(t.applicationId), landmark),
          probabilities,
        };
        slice[candidate].push(row);
        scored[candidate].push(row);
      }
    brier[landmark] = Object.fromEntries(
      CANDIDATES.map((c) => [
        c,
        HORIZONS.map((h, i) => ({
          horizon: h,
          ...ipcwBrier(
            slice[c].map((r) => ({
              truth: r.truth,
              probability: r.probabilities[i]!,
            })),
            censoring,
            h
          ),
        })),
      ])
    );
    intervalCalibration[landmark] = Object.fromEntries(
      CANDIDATES.map((c) => [
        c,
        {
          interval50: ipcwIntervalCoverage(slice[c], censoring, 50),
          interval80: ipcwIntervalCoverage(slice[c], censoring, 80),
        },
      ])
    );
  }
  return {
    schemaVersion: 1,
    retrospectivePendingCorrections,
    asOf: input.evaluationCutoff,
    landmarks: input.landmarks,
    // Deployment requires a separately reviewed, locked validation artifact; never self-promote.
    promotionEligible: false,
    limitations: [
      'Approval-date errors and interval coverage below describe observed approvals only; use IPCW Brier and forecast availability alongside them.',
      'Independent censoring and delayed-entry assumptions require sensitivity review.',
      'Repeated landmarks are correlated; paired comparisons average within each application and bootstrap applications. Independent censoring and cohort stability still require review.',
      'Community imports do not confirm pending status. Sources are not pooled into the verified survival fit.',
      'C candidates use receipt cohorts; status-transition effects are not fitted without validation.',
    ],
    models: Object.fromEntries(
      CANDIDATES.map((c) => [
        c,
        {
          ...summarize(scored[c]),
          segments: Object.fromEntries(
            [...new Set(scored[c].map((r) => r.segment))].map((s) => [
              s,
              summarize(scored[c].filter((r) => r.segment === s)),
            ])
          ),
          waitingGroups: Object.fromEntries(
            ['under_90_days', '90_plus_days'].map((s) => [
              s,
              summarize(scored[c].filter((r) => r.waitGroup === s)),
            ])
          ),
        },
      ])
    ),
    ipcwBrier: brier,
    ipcwIntervalCalibration: intervalCalibration,
    pairedMeanErrorDifferenceVersusA: Object.fromEntries(
      CANDIDATES.filter((c) => c !== 'A_legacy').map((c) => [
        c,
        pairedErrorDifference(scored.A_legacy, scored[c]),
      ])
    ),
  };
}
