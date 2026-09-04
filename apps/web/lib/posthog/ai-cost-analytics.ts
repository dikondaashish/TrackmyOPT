import type { PostHogEventProperties } from '@/lib/posthog-server';
import { captureServerEvent } from '@/lib/posthog-server';

/** PostHog project — see EVENT_TAXONOMY.md */
export const POSTHOG_PROJECT_ID = 369087;

/** Rollup event: one row per successful resume generation request. */
export const RESUME_AI_COST_RECORDED_EVENT = 'resume_ai_cost_recorded';

/** Per-model-call telemetry from generateAiContent. */
export const AI_GENERATION_COMPLETED_EVENT = 'ai_generation_completed';

export type ResumeAiCostRecordedProps = PostHogEventProperties & {
  ai_request_id: string;
  ai_cost_usd: number;
  ai_cost_generate_usd: number;
  ai_cost_latex_fix_usd: number;
  ai_call_count: number;
  ai_model: string | null;
  ai_fallback_used: boolean;
  template_id: string;
  compile_repaired?: boolean;
  source: 'generate' | 'regenerate';
};

export async function captureResumeAiCostRecorded(
  userId: string,
  props: ResumeAiCostRecordedProps,
): Promise<void> {
  await captureServerEvent(userId, RESUME_AI_COST_RECORDED_EVENT, {
    ...props,
    // Alias for PostHog insight math_property shortcuts.
    ai_cost_per_resume: props.ai_cost_usd,
  });
}

/** HogQL for the primary dashboard tile (rollup event). */
export const HOGQL_AVG_COST_PER_RESUME = `
SELECT
  round(avg(toFloat(properties.ai_cost_usd)), 4) AS avg_cost_usd,
  round(quantile(0.5)(toFloat(properties.ai_cost_usd)), 4) AS p50_cost_usd,
  round(quantile(0.95)(toFloat(properties.ai_cost_usd)), 4) AS p95_cost_usd,
  count() AS resumes
FROM events
WHERE event = '${RESUME_AI_COST_RECORDED_EVENT}'
  AND timestamp >= now() - INTERVAL 30 DAY
  AND properties.ai_cost_usd IS NOT NULL
`.trim();

/** HogQL fallback before rollup events exist: main generate call only. */
export const HOGQL_AVG_COST_PER_GENERATE_CALL = `
SELECT
  round(avg(toFloat(properties.ai_estimated_cost_usd)), 4) AS avg_cost_usd,
  count() AS generate_calls
FROM events
WHERE event = '${AI_GENERATION_COMPLETED_EVENT}'
  AND properties.ai_task = 'resume_generate'
  AND timestamp >= now() - INTERVAL 30 DAY
  AND properties.ai_estimated_cost_usd IS NOT NULL
`.trim();

/** Resumes per $1 of Google AI spend at current average cost. */
export const HOGQL_RESUMES_PER_DOLLAR = `
SELECT
  round(
    1 / nullIf(avg(toFloat(properties.ai_cost_usd)), 0),
    0
  ) AS resumes_per_usd
FROM events
WHERE event = '${RESUME_AI_COST_RECORDED_EVENT}'
  AND timestamp >= now() - INTERVAL 30 DAY
  AND properties.ai_cost_usd > 0
`.trim();
