import { addDays, days, fatalFlags, isoDay } from './normalize';
import {
  MODEL_VERSION,
  type Curve,
  type Forecast,
  type SurvivalRecord,
  type Timeline,
} from './types';

// Numerical support safeguards, NOT validated reliability/accuracy thresholds.
export const MIN_CASES = 30;
export const MIN_AT_RISK = 15;
export const MIN_APPROVALS = 5;

/** Aalen–Johansen; exactly Kaplan–Meier with approval as the only event cause. */
export function fitCurve(input: SurvivalRecord[]): Curve {
  const ids = new Set<string>();
  for (const r of input) {
    if (ids.has(r.id)) throw new Error('Duplicate application in survival fit');
    if (
      ![r.entry, r.exit].every(Number.isFinite) ||
      r.entry < 0 ||
      r.exit <= r.entry
    )
      throw new Error('Invalid survival interval');
    ids.add(r.id);
  }
  const times = [...new Set(input.flatMap((r) => [r.entry, r.exit]))].sort(
    (a, b) => a - b
  );
  let survival = 1;
  let approval = 0;
  const points = times.map((day) => {
    const atRisk = input.filter((r) => r.entry < day && r.exit >= day).length;
    const ending = input.filter((r) => r.exit === day);
    const approvals = ending.filter((r) => r.event === 'approval').length;
    const competing = ending.filter(
      (r) => r.event !== 'approval' && r.event !== 'censored'
    ).length;
    if (atRisk) {
      approval += (survival * approvals) / atRisk;
      survival *= 1 - (approvals + competing) / atRisk;
    }
    return {
      day,
      atRisk,
      riskAfter: input.filter((r) => r.entry <= day && r.exit > day).length,
      approvals,
      competing,
      survival,
      approval,
    };
  });
  return { size: input.length, points, support: times.at(-1) ?? 0 };
}

/** Conditional approval CIF. Null means follow-up/risk support does not identify it. */
export function conditional(
  curve: Curve,
  waited: number,
  minAtRisk = MIN_AT_RISK
) {
  const atStart = curve.points.filter((p) => p.day <= waited).at(-1);
  const risk = atStart?.riskAfter ?? 0;
  const probabilities = [0.1, 0.25, 0.5, 0.75, 0.9];
  const quantiles: Array<number | null> = probabilities.map(() => null);
  const cdf: Array<{ remaining: number; probability: number }> = [
    { remaining: 0, probability: 0 },
  ];
  if (risk < minAtRisk) return { quantiles, cdf, risk, supportedThrough: 0 };
  // Reinitialize at the landmark. This avoids extrapolating survival before enrollment.
  let survival = 1,
    approval = 0,
    supportedThrough = 0;
  for (const p of curve.points.filter((p) => p.day > waited)) {
    if (p.atRisk < minAtRisk) break;
    approval += (survival * p.approvals) / p.atRisk;
    survival *= 1 - (p.approvals + p.competing) / p.atRisk;
    supportedThrough = p.day - waited;
    cdf.push({ remaining: supportedThrough, probability: approval });
    probabilities.forEach((q, i) => {
      if (quantiles[i] === null && approval + 1e-12 >= q)
        quantiles[i] = supportedThrough;
    });
    if (p.riskAfter < minAtRisk) break;
  }
  return { quantiles, cdf, risk, supportedThrough };
}

export function emptyForecast(
  t: Timeline | null,
  asOf: string,
  explanation: string
): Forecast {
  return {
    modelVersion: MODEL_VERSION,
    state: 'limited_data',
    asOf,
    medianDate: null,
    interval50: [null, null],
    interval80: [null, null],
    approvalDate: null,
    waitingDays: t?.receiptDate ? Math.max(0, days(t.receiptDate, asOf)) : null,
    remainingDays: { p10: null, p25: null, p50: null, p75: null, p90: null },
    sampleSize: 0,
    atRisk: 0,
    reliability: 'Limited Data',
    lastSuccessfulSync: t?.lastSyncedAt ?? null,
    modelUpdatedAt: null,
    explanation,
  };
}

export function predict(
  t: Timeline,
  curve: Curve | null,
  asOf: string
): Forecast {
  const result = emptyForecast(
    t,
    asOf,
    'There is not enough comparable, verified follow-up to estimate an approval window.'
  );
  if (
    t.flags.includes('contradictory_outcome') ||
    t.flags.includes('invalid_event_date')
  ) {
    result.explanation =
      'Conflicting case dates or outcomes need confirmation before an estimate can be provided.';
    return result;
  }
  if (t.outcome === 'approval') {
    return {
      ...result,
      state: 'approved',
      approvalDate: t.eventDate,
      reliability: null,
      explanation: t.eventDate
        ? 'USCIS reports this approval date.'
        : 'USCIS reports approval, but an exact approval date is unavailable.',
    };
  }
  if (t.outcome === 'denial' || t.outcome === 'withdrawal')
    return {
      ...result,
      state: 'nonapproval',
      reliability: null,
      explanation:
        'This case has a nonapproval outcome. An approval-wait forecast no longer applies.',
    };
  if (
    t.outcome !== 'pending' ||
    !t.origin ||
    !t.receiptDate ||
    (t.processing === 'premium' && !t.premiumStart)
  )
    return result;
  if (t.flags.some((f) => fatalFlags.has(f))) return result;
  if (days(t.lastSyncedAt, asOf) > 2) {
    result.explanation =
      'The latest successful USCIS check is too old to confirm that this case is still pending.';
    return result;
  }
  if (
    !curve ||
    curve.size < MIN_CASES ||
    curve.points.reduce((n, p) => n + p.approvals, 0) < MIN_APPROVALS
  )
    return result;
  const remaining = conditional(curve, days(t.origin, asOf));
  const [p10, p25, p50, p75, p90] = remaining.quantiles;
  const date = (n: number | null | undefined) =>
    n == null ? null : addDays(isoDay(asOf)!, n);
  return {
    ...result,
    state:
      p50 != null && p25 != null && p75 != null ? 'estimate' : 'limited_data',
    medianDate: date(p50),
    interval50: [date(p25), date(p75)],
    interval80: [date(p10), date(p90)],
    remainingDays: {
      p10: p10 ?? null,
      p25: p25 ?? null,
      p50: p50 ?? null,
      p75: p75 ?? null,
      p90: p90 ?? null,
    },
    sampleSize: curve.size,
    atRisk: remaining.risk,
    reliability:
      p50 != null && p25 != null && p75 != null ? null : 'Limited Data',
    explanation:
      'Based on USCIS case histories of comparable tracked applications that were still pending after waiting as long as yours. The range covers 80% of modeled outcomes where the data supports it; unsupported bounds are not shown. This is an estimate, not a USCIS promise.',
  };
}
