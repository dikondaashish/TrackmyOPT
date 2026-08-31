import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  AtsScraperRunnerError,
  fetchAuthorizedAtsJobs,
} from './ats-scrapers.runner';

const SOURCE = {
  ats_type: 'greenhouse',
  board_token: 'example',
  base_url: 'https://job-boards.greenhouse.io/example',
};

describe('ats-scrapers process runner', () => {
  let fixtureDirectory: string;

  beforeEach(() => {
    fixtureDirectory = mkdtempSync(path.join(tmpdir(), 'ats-runner-'));
  });

  afterEach(() => {
    rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function fixture(source: string) {
    const file = path.join(fixtureDirectory, 'fixture.cjs');
    writeFileSync(file, source);
    return file;
  }

  it('returns normalized jobs and measured fetch metadata', async () => {
    const scriptPath = fixture(`
      process.stdin.resume();
      process.stdin.on('end', () => {
        process.stdout.write(JSON.stringify({
          jobs: [{ external_job_id: '1', title: 'Engineer', company_name: 'Example' }],
          metadata: { adapter: 'greenhouse', complete: true, requests_made: 2 }
        }));
      });
    `);

    await expect(
      fetchAuthorizedAtsJobs(SOURCE, {
        scriptPath,
        pythonCommand: process.execPath,
        timeoutMs: 1_000,
      }),
    ).resolves.toEqual({
      jobs: [
        {
          external_job_id: '1',
          title: 'Engineer',
          company_name: 'Example',
        },
      ],
      metadata: { adapter: 'greenhouse', complete: true, requests_made: 2 },
    });
  });

  it('rejects a response without completeness and request metadata', async () => {
    const scriptPath = fixture(`
      process.stdin.resume();
      process.stdin.on('end', () => {
        process.stdout.write(JSON.stringify({ jobs: [] }));
      });
    `);

    await expect(
      fetchAuthorizedAtsJobs(SOURCE, {
        scriptPath,
        pythonCommand: process.execPath,
        timeoutMs: 1_000,
      }),
    ).rejects.toThrow('Invalid scraper metadata');
  });

  it('rejects duplicate job identities as a schema failure', async () => {
    const scriptPath = fixture(`
      process.stdin.resume();
      process.stdin.on('end', () => {
        process.stdout.write(JSON.stringify({
          jobs: [
            { external_job_id: '1', title: 'Engineer', company_name: 'Example' },
            { external_job_id: '1', title: 'Engineer II', company_name: 'Example' }
          ],
          metadata: { adapter: 'greenhouse', complete: true, requests_made: 1 }
        }));
      });
    `);

    await expect(
      fetchAuthorizedAtsJobs(SOURCE, {
        scriptPath,
        pythonCommand: process.execPath,
        timeoutMs: 1_000,
      }),
    ).rejects.toThrow('Duplicate external_job_id 1');
  });

  it('preserves measured HTTP attempts when an adapter fails after retries', async () => {
    const scriptPath = fixture(`
      process.stdin.resume();
      process.stdin.on('end', () => {
        process.stdout.write(JSON.stringify({
          error: 'HTTP 503 after retries',
          metadata: { adapter: 'greenhouse', complete: false, requests_made: 3 }
        }));
        process.exitCode = 1;
      });
    `);

    let failure: unknown;
    try {
      await fetchAuthorizedAtsJobs(SOURCE, {
        scriptPath,
        pythonCommand: process.execPath,
        timeoutMs: 1_000,
      });
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(AtsScraperRunnerError);
    if (!(failure instanceof AtsScraperRunnerError)) {
      throw new Error('Expected a structured adapter failure');
    }
    expect(failure.message).toContain('HTTP 503 after retries');
    expect(failure.requestsMade).toBe(3);
  });

  it('kills a child process that exceeds its deadline', async () => {
    const scriptPath = fixture('setInterval(() => {}, 1_000);');

    await expect(
      fetchAuthorizedAtsJobs(SOURCE, {
        scriptPath,
        pythonCommand: process.execPath,
        timeoutMs: 25,
      }),
    ).rejects.toThrow('timed out after 25ms');
  });

  it('kills a child process that exceeds the output limit', async () => {
    const scriptPath = fixture("process.stdout.write('x'.repeat(128));");

    await expect(
      fetchAuthorizedAtsJobs(SOURCE, {
        scriptPath,
        pythonCommand: process.execPath,
        timeoutMs: 1_000,
        maxOutputBytes: 32,
      }),
    ).rejects.toThrow('exceeded the 32-byte output limit');
  });
});
