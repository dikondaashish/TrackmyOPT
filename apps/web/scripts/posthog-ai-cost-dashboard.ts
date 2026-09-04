/**
 * Creates the AI cost-per-resume PostHog dashboard (project 369087).
 *
 * Usage:
 *   pnpm posthog:ai-cost-dashboard
 *   pnpm posthog:ai-cost-dashboard --dry-run
 *
 * Requires POSTHOG_PERSONAL_API_KEY in apps/web/.env.local
 */

import * as dotenv from 'dotenv';
import path from 'path';

import {
  HOGQL_AVG_COST_PER_GENERATE_CALL,
  HOGQL_AVG_COST_PER_RESUME,
  HOGQL_RESUMES_PER_DOLLAR,
  POSTHOG_PROJECT_ID,
} from '../lib/posthog/ai-cost-analytics';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const dryRun = process.argv.includes('--dry-run');
const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com').replace(
  /\/$/,
  '',
);
const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();

const DASHBOARD_NAME = 'Resume AI unit economics';

type HogInsightPayload = {
  name: string;
  description: string;
  hogql: string;
};

const INSIGHTS: HogInsightPayload[] = [
  {
    name: 'Avg AI cost per resume (full pipeline)',
    description:
      'Rollup from resume_ai_cost_recorded — includes resume_generate + latex_fix.',
    hogql: HOGQL_AVG_COST_PER_RESUME,
  },
  {
    name: 'Resumes per $1 (Google AI)',
    description: 'Inverse of average ai_cost_usd on successful generations.',
    hogql: HOGQL_RESUMES_PER_DOLLAR,
  },
  {
    name: 'Avg AI cost per generate call (legacy)',
    description:
      'Fallback metric from ai_generation_completed where ai_task=resume_generate only.',
    hogql: HOGQL_AVG_COST_PER_GENERATE_CALL,
  },
];

async function posthogApi<T>(
  method: string,
  route: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${host}/api/projects/${POSTHOG_PROJECT_ID}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PostHog API ${method} ${route} failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
}

function hogInsightBody(insight: HogInsightPayload) {
  return {
    name: insight.name,
    description: insight.description,
    query: {
      kind: 'DataVisualizationNode',
      source: {
        kind: 'HogQLQuery',
        query: insight.hogql,
      },
    },
  };
}

async function main() {
  if (!apiKey) {
    console.error('Missing POSTHOG_PERSONAL_API_KEY in apps/web/.env.local');
    console.error('Create insights manually in PostHog with these HogQL queries:\n');
    for (const insight of INSIGHTS) {
      console.error(`--- ${insight.name} ---`);
      console.error(insight.hogql);
      console.error('');
    }
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] Would create dashboard "${DASHBOARD_NAME}" with ${INSIGHTS.length} insights`);
    for (const insight of INSIGHTS) {
      console.log(`\n--- ${insight.name} ---\n${insight.hogql}`);
    }
    return;
  }

  const dashboard = await posthogApi<{ id: number; url: string }>('POST', '/dashboards/', {
    name: DASHBOARD_NAME,
    description:
      'Production AI unit economics for resume generation (Gemini via Vertex).',
    tags: ['ai', 'resume', 'unit-economics'],
  });

  console.log(`Created dashboard: ${dashboard.url ?? dashboard.id}`);

  for (const insight of INSIGHTS) {
    const created = await posthogApi<{ id: number; short_id: string }>(
      'POST',
      '/insights/',
      hogInsightBody(insight),
    );

    await posthogApi('PATCH', `/dashboards/${dashboard.id}/`, {
      tiles: [
        {
          insight: created.id,
        },
      ],
    });

    console.log(`  + insight "${insight.name}" (${created.short_id})`);
  }

  console.log(`\nDone. Open: ${host}/project/${POSTHOG_PROJECT_ID}/dashboard/${dashboard.id}`);
  console.log(
    `\nNote: Full-pipeline tiles need resume_ai_cost_recorded events (deploy code first).`,
  );
  console.log('Legacy tile uses existing ai_generation_completed events immediately.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
