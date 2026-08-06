/**
 * The parts of the OPT wait either side of adjudication.
 *
 * The approval estimate answers "when will a decision come", which is the
 * noisiest thing in the dataset — p25 to p75 spans weeks. The stages here are
 * mechanical rather than discretionary (a biometrics notice, a card print run,
 * a USPS handoff), so they land in a much tighter band and can be stated with
 * far more confidence than the headline wait ever can.
 *
 * Partner community timelines only — never USCIS lookups, and never a claim
 * about whether a case will be approved.
 */

import { daysBetweenDates } from "./clean";
import { COMMUNITY_ESTIMATE_SOURCE_NOTE, percentile } from "./estimate";
import { maturityCutoffMs, parseUtcDate } from "./weekly-trend";

export type StageId = "biometrics" | "card_produced" | "card_delivered";

export type StageRow = {
  init_date: string | null;
  biometrics_date: string | null;
  approve_date: string | null;
  card_produce_date: string | null;
  delivered_date: string | null;
  premium_processing: boolean;
};

export type StageStat = {
  stage: StageId;
  medianDays: number;
  /** Detail withheld from the free payload — see `redactStagesForFree`. */
  p25Days?: number;
  p75Days?: number;
  sampleSize?: number;
};

export type JourneyStages = {
  /** Filing → biometrics / fingerprint milestone. */
  biometrics: StageStat | null;
  /** Approval → card produced. */
  cardProduced: StageStat | null;
  /** Approval → card in hand. */
  cardDelivered: StageStat | null;
  sourceNote: string;
};

/** A median over fewer reports than this is noise, tight distribution or not. */
export const MIN_STAGE_SAMPLE = 15;

type StageSpec = {
  id: StageId;
  /** The event the wait is measured from. Also what censors the sample: a case
   *  that reached this point yesterday cannot yet show a slow next step. */
  anchor: (row: StageRow) => string | null;
  end: (row: StageRow) => string | null;
  /** Above this the pair is a partner parse error, not a real wait. */
  maxDays: number;
  /** Floor on the maturity horizon. Card steps settle in about a week, so the
   *  30-day floor the approval trend uses would discard most of the sample. */
  minHorizonDays: number;
};

const STAGE_SPECS: StageSpec[] = [
  {
    id: "biometrics",
    anchor: (r) => r.init_date,
    end: (r) => r.biometrics_date,
    maxDays: 120,
    minHorizonDays: 30,
  },
  {
    id: "card_produced",
    anchor: (r) => r.approve_date,
    end: (r) => r.card_produce_date,
    maxDays: 120,
    minHorizonDays: 14,
  },
  {
    id: "card_delivered",
    anchor: (r) => r.approve_date,
    end: (r) => r.delivered_date,
    maxDays: 150,
    minHorizonDays: 14,
  },
];

function buildStage(
  rows: StageRow[],
  spec: StageSpec,
  nowMs: number
): StageStat | null {
  const observed: Array<{ anchorMs: number; days: number }> = [];
  for (const row of rows) {
    const anchor = spec.anchor(row);
    const days = daysBetweenDates(anchor, spec.end(row));
    if (days === null || days > spec.maxDays) continue;
    const anchorMs = parseUtcDate(anchor);
    if (anchorMs === null) continue;
    observed.push({ anchorMs, days });
  }
  if (!observed.length) return null;

  const cutoff = maturityCutoffMs(
    observed.map((o) => o.days).sort((a, b) => a - b),
    nowMs,
    spec.minHorizonDays
  );
  if (cutoff === null) return null;

  const mature = observed
    .filter((o) => o.anchorMs <= cutoff)
    .map((o) => o.days)
    .sort((a, b) => a - b);
  if (mature.length < MIN_STAGE_SAMPLE) return null;

  return {
    stage: spec.id,
    medianDays: percentile(mature, 0.5),
    p25Days: percentile(mature, 0.25),
    p75Days: percentile(mature, 0.75),
    sampleSize: mature.length,
  };
}

/**
 * Stage waits for one premium / regular segment.
 *
 * Segments never mix: premium cases reach adjudication on a different clock,
 * and while the card steps afterwards look similar in the data, presenting a
 * blended median would quietly contradict every other number on the page.
 */
export function buildJourneyStages(
  rows: StageRow[],
  opts: { premiumProcessing: boolean; nowMs?: number }
): JourneyStages {
  const nowMs = opts.nowMs ?? Date.now();
  const segment = rows.filter(
    (r) => r.premium_processing === opts.premiumProcessing
  );
  const [biometrics, cardProduced, cardDelivered] = STAGE_SPECS.map((spec) =>
    buildStage(segment, spec, nowMs)
  );

  return {
    biometrics: biometrics ?? null,
    cardProduced: cardProduced ?? null,
    cardDelivered: cardDelivered ?? null,
    sourceNote: COMMUNITY_ESTIMATE_SOURCE_NOTE,
  };
}

/**
 * Free-plan view: the typical wait for each stage, without the spread, the
 * sample size, or anything that positions the user inside the distribution.
 *
 * Applied on the server so the withheld numbers are never sent to the browser.
 */
export function redactStagesForFree(stages: JourneyStages): JourneyStages {
  const headline = (stat: StageStat | null): StageStat | null =>
    stat ? { stage: stat.stage, medianDays: stat.medianDays } : null;

  return {
    biometrics: headline(stages.biometrics),
    cardProduced: headline(stages.cardProduced),
    cardDelivered: headline(stages.cardDelivered),
    sourceNote: stages.sourceNote,
  };
}

/**
 * Where a case sits in the pipeline, so the page can lead with the wait the
 * user is actually in rather than always answering the approval question.
 *
 * Finer-grained than the `CaseState` driving the case switcher, which folds
 * every post-decision status into one "approved" bucket — the whole point here
 * is to separate approval from card production from delivery.
 */
export type JourneyPhase =
  | "filed"
  | "biometrics_done"
  | "approved"
  | "card_produced"
  | "delivered";

export function deriveJourneyPhase(
  currentStatus: string | null | undefined
): JourneyPhase {
  const s = (currentStatus ?? "").toLowerCase();
  if (!s) return "filed";
  // Most advanced first: USCIS status text is cumulative, so "Card Was
  // Delivered To Me By The Post Office" also contains "card was".
  if (s.includes("delivered") || s.includes("picked up")) return "delivered";
  // "New Card Is Being Produced" and "Card Was Produced" are both this step.
  if (s.includes("mailed") || s.includes("produced")) return "card_produced";
  if (s.includes("approved")) return "approved";
  if (s.includes("fingerprint") || s.includes("biometric")) {
    return "biometrics_done";
  }
  return "filed";
}
