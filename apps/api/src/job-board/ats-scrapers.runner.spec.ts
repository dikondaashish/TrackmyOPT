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
    jest.restoreAllMocks();
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

  it('fetches and normalizes a Greenhouse board natively', async () => {
    const request = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        JSON.stringify({
          jobs: [
            {
              id: 42,
              title: 'Platform Engineer',
              company: { name: 'Example Co' },
              location: { name: 'Remote - US' },
              departments: [{ name: 'Engineering' }],
              content: '<p>Build platforms</p>',
              absolute_url: 'https://boards.greenhouse.io/example/jobs/42',
              first_published: '2026-09-01T12:00:00Z',
            },
          ],
        }),
    } as Response);

    await expect(
      fetchAuthorizedAtsJobs({ ...SOURCE, employer_board_name: 'Example Co' }),
    ).resolves.toMatchObject({
      jobs: [
        expect.objectContaining({
          external_job_id: '42',
          title: 'Platform Engineer',
          company_name: 'Example Co',
          location: 'Remote - US',
          department: 'Engineering',
        }),
      ],
      metadata: { adapter: 'greenhouse', complete: true, requests_made: 1 },
    });
    expect(request.mock.calls[0]?.[0]).toBe(
      'https://boards-api.greenhouse.io/v1/boards/example/jobs?content=true',
    );
  });

  it('fetches and normalizes an Ashby board using its board name fallback', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        JSON.stringify({
          jobs: [
            {
              id: 'ashby-1',
              title: 'Data Engineer',
              location: 'New York, NY',
              team: 'Data',
              descriptionHtml: '<p>SQL</p>',
              applyUrl: 'https://jobs.ashbyhq.com/example/ashby-1',
            },
          ],
        }),
    } as Response);

    await expect(
      fetchAuthorizedAtsJobs({
        ats_type: 'ashby',
        board_token: 'example',
        base_url: 'https://jobs.ashbyhq.com/example',
        employer_board_name: 'Example Co',
      }),
    ).resolves.toMatchObject({
      jobs: [
        expect.objectContaining({
          external_job_id: 'ashby-1',
          company_name: 'Example Co',
          department: 'Data',
        }),
      ],
      metadata: { adapter: 'ashby', complete: true, requests_made: 1 },
    });
  });

  it('reports native HTTP, malformed, duplicate, and timeout failures safely', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: () => Promise.resolve(''),
    } as Response);
    await expect(fetchAuthorizedAtsJobs(SOURCE)).rejects.toThrow('HTTP 429');

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ jobs: [{ id: '1' }] })),
    } as Response);
    await expect(fetchAuthorizedAtsJobs(SOURCE)).rejects.toThrow(
      'Invalid normalized job schema',
    );

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            jobs: [
              { id: '1', title: 'A' },
              { id: '1', title: 'B' },
            ],
          }),
        ),
    } as Response);
    await expect(fetchAuthorizedAtsJobs(SOURCE)).rejects.toThrow(
      'Duplicate external_job_id 1',
    );

    jest.spyOn(global, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new Error('aborted')),
          );
        }),
    );
    await expect(
      fetchAuthorizedAtsJobs(SOURCE, { timeoutMs: 5 }),
    ).rejects.toThrow('request failed: aborted');
  });
});
