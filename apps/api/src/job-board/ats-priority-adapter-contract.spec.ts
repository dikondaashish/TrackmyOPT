import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fetchAuthorizedAtsJobs } from './ats-scrapers.runner';
import { planSourceFailure } from './source-health';
import { planSourceIngestionJobs } from './source-job-planning';

const PRIORITY_ADAPTERS = [
  'greenhouse',
  'lever',
  'ashby',
  'workday',
  'smartrecruiters',
  'workable',
  'recruitee',
  'personio',
  'bamboohr',
  'breezy',
] as const;

type PriorityAdapter = (typeof PRIORITY_ADAPTERS)[number];

describe('priority ATS adapter bridge contracts', () => {
  let fixtureDirectory: string;

  beforeEach(() => {
    fixtureDirectory = mkdtempSync(path.join(tmpdir(), 'priority-ats-'));
  });

  afterEach(() => {
    rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function source(ats_type: PriorityAdapter) {
    return {
      ats_type,
      board_token: `fixture-${ats_type}`,
      base_url: `https://example.test/${ats_type}`,
    };
  }

  function fixture(name: string, script: string) {
    const file = path.join(fixtureDirectory, `${name}.cjs`);
    writeFileSync(file, script);
    return file;
  }

  function bridge(
    scriptPath: string,
    ats_type: PriorityAdapter,
    timeoutMs = 500,
  ) {
    return fetchAuthorizedAtsJobs(source(ats_type), {
      scriptPath,
      pythonCommand: process.execPath,
      timeoutMs,
    });
  }

  const outputFixture = (jobs: string, requests: number) => `
    let body = '';
    process.stdin.on('data', (chunk) => body += chunk);
    process.stdin.on('end', () => {
      const source = JSON.parse(body);
      process.stdout.write(JSON.stringify({
        jobs: ${jobs},
        metadata: { adapter: source.ats_type, complete: true, requests_made: ${requests} }
      }));
    });
  `;

  it.each(PRIORITY_ADAPTERS)(
    '%s accepts a normal response and counts a request',
    async (ats) => {
      const scriptPath = fixture(
        'normal',
        outputFixture(
          "[{ external_job_id: 'job-1', title: 'Engineer', company_name: 'Example' }]",
          1,
        ),
      );
      await expect(bridge(scriptPath, ats)).resolves.toMatchObject({
        jobs: [{ external_job_id: 'job-1', title: 'Engineer' }],
        metadata: { adapter: ats, complete: true, requests_made: 1 },
      });
    },
  );

  it.each(PRIORITY_ADAPTERS)(
    '%s preserves multiple paginated jobs and their request count',
    async (ats) => {
      const scriptPath = fixture(
        'paginated',
        outputFixture(
          "[{ external_job_id: 'page-1', title: 'Engineer', company_name: 'Example' }, { external_job_id: 'page-2', title: 'Analyst', company_name: 'Example' }, { external_job_id: 'page-3', title: 'Developer', company_name: 'Example' }]",
          2,
        ),
      );
      const result = await bridge(scriptPath, ats);
      expect(result.jobs.map((job) => job.external_job_id)).toEqual([
        'page-1',
        'page-2',
        'page-3',
      ]);
      expect(result.metadata).toMatchObject({
        adapter: ats,
        requests_made: 2,
      });
    },
  );

  it.each(PRIORITY_ADAPTERS)(
    '%s represents an authoritative zero-job board without inventing listings',
    async (ats) => {
      const scriptPath = fixture('zero', outputFixture('[]', 1));
      await expect(bridge(scriptPath, ats)).resolves.toMatchObject({
        jobs: [],
        metadata: { adapter: ats, complete: true, requests_made: 1 },
      });
    },
  );

  it.each(PRIORITY_ADAPTERS)(
    '%s rejects malformed, missing, and duplicate job output',
    async (ats) => {
      const malformed = fixture(
        'malformed',
        "process.stdout.write('{not-json');",
      );
      await expect(bridge(malformed, ats)).rejects.toThrow();

      const missing = fixture(
        'missing',
        outputFixture(
          "[{ external_job_id: 'missing-title', title: '', company_name: 'Example' }]",
          1,
        ),
      );
      await expect(bridge(missing, ats)).rejects.toThrow(
        'Invalid normalized job schema',
      );

      const duplicate = fixture(
        'duplicate',
        outputFixture(
          "[{ external_job_id: 'same', title: 'One', company_name: 'Example' }, { external_job_id: 'same', title: 'Two', company_name: 'Example' }]",
          1,
        ),
      );
      await expect(bridge(duplicate, ats)).rejects.toThrow(
        'Duplicate external_job_id same',
      );
    },
  );

  it.each(PRIORITY_ADAPTERS)(
    '%s passes 4xx, 5xx, and 429 failures to source health without treating them as jobs',
    async (ats) => {
      for (const status of [404, 500, 429]) {
        const scriptPath = fixture(
          `http-${status}`,
          `process.stderr.write('HTTP ${status}'); process.exit(1);`,
        );
        await expect(bridge(scriptPath, ats)).rejects.toThrow(`HTTP ${status}`);
      }
    },
  );

  it.each(PRIORITY_ADAPTERS)(
    '%s enforces a timeout and receives the same safe retry plan',
    async (ats) => {
      const scriptPath = fixture('timeout', 'setInterval(() => {}, 1_000);');
      await expect(bridge(scriptPath, ats, 25)).rejects.toThrow(
        'timed out after 25ms',
      );
      expect(
        planSourceFailure({
          consecutiveFailures: 0,
          now: new Date('2026-08-30T12:00:00.000Z'),
        }),
      ).toMatchObject({
        consecutiveFailures: 1,
        circuitState: 'closed',
        nextRetryAt: '2026-08-30T12:05:00.000Z',
      });
    },
  );

  it('isolates all ten sources into independent queue jobs', () => {
    const jobs = planSourceIngestionJobs(
      PRIORITY_ADAPTERS.map((ats) => `source-${ats}`),
    );
    expect(jobs).toHaveLength(PRIORITY_ADAPTERS.length);
    expect(new Set(jobs.map((job) => job.data.sourceId)).size).toBe(
      PRIORITY_ADAPTERS.length,
    );
    expect(jobs.every((job) => job.name === 'ingest-source')).toBe(true);
  });
});
