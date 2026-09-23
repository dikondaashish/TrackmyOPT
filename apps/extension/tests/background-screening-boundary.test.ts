import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { validateArtifactForPrefill } from '../src/resume-artifact-lifecycle';
import { resolveScreeningDraftJobContext } from '../src/screening-draft-context';
import { isSensitiveApplicationQuestion } from '../src/sensitive-question-policy';
import { hasQuestionEvidence } from '../src/screening-answer-evidence';
import { looksLikeRealJobPostingText } from '../src/job-description';
const req = createRequire(resolve('package.json'));
const source = readFileSync('src/background-screening.ts', 'utf8');
const code = req('esbuild').transformSync(
  source
    .slice(
      source.indexOf('export async function requestScreeningDraft'),
      source.indexOf('export async function requestSavedScreeningAnswer')
    )
    .replace('export async', 'async') +
    '\nglobalThis.run=requestScreeningDraft;',
  { loader: 'ts' }
).code;
for (const scenario of [
  'valid',
  'expired',
  'wrong_job',
  'missing_url',
  'missing_tool',
  'sensitive',
  'http_error',
  'invalid_description',
] as const)
  test(`screening worker boundary: ${scenario}`, async () => {
    let calls = 0;
    const generatedAt = new Date(
      Date.now() - (scenario === 'expired' ? 3600000 : 1000)
    ).toISOString();
    const artifact = {
      generatedAt,
      expiresAt: new Date(Date.parse(generatedAt) + 1800000).toISOString(),
      job: {
        sourceUrl: 'https://example.test/jobs/1',
        companyName: 'Example',
        roleTitle: 'Analyst',
        jobDescription: scenario === 'invalid_description' ? 'body { overflow: hidden; display: flex; } '.repeat(70) : 'Responsibilities: Build dbt models and SQL dashboards for the team. Qualifications: Strong data modeling skills and three years of experience. Benefits include health insurance and paid time off. '.repeat(3),
      },
      snapshot: { skills: scenario === 'missing_tool' ? ['SQL'] : ['dbt'] },
      generatedContentHash: 'a'.repeat(64),
    };
    const context: any = {
      validateArtifactForPrefill,
      resolveScreeningDraftJobContext,
      isSensitiveApplicationQuestion,
      hasQuestionEvidence,
      looksLikeRealJobPostingText,
      normalizeQuestionText: (v: string) => v.trim(),
      readCurrentGeneratedResumeArtifact: async () => artifact,
      getExtensionBearerToken: async () => 'test-only',
      WEBSITE_URL: 'https://example.test',
      fetch: async () => {
        calls++;
        return {
          ok: scenario !== 'http_error',
          json: async () => ({ ok: true, draft: 'I use dbt' }),
        };
      },
    };
    vm.runInNewContext(code, context);
    const response = await context.run({
      jobUrl:
        scenario === 'missing_url'
          ? ''
          : scenario === 'wrong_job'
            ? 'https://example.test/jobs/2'
            : 'https://example.test/jobs/1',
      questionText:
        scenario === 'sensitive'
          ? 'What is your salary?'
          : 'What do you use dbt with?',
    });
    assert.equal(calls, ['valid', 'http_error'].includes(scenario) ? 1 : 0);
    assert.equal(response.ok, scenario === 'valid');
  });
