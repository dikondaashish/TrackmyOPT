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
    const request = jest.spyOn(global, 'fetch').mockResolvedValue(
      Response.json({
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
    );

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
    jest.spyOn(global, 'fetch').mockResolvedValue(
      Response.json({
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
    );

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

  it('keeps Ashby and Greenhouse structured workplace and employment fields', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      Response.json({
        jobs: [
          {
            id: 'a1',
            title: 'Engineer',
            workplaceType: 'Hybrid',
            isRemote: true,
            employmentType: 'FullTime',
          },
          {
            id: 'a2',
            title: 'Designer',
            workplaceType: null,
            isRemote: null,
            employmentType: 'Intern',
          },
        ],
      }),
    );
    const ashby = await fetchAuthorizedAtsJobs({
      ats_type: 'ashby',
      board_token: 'example',
      base_url: 'https://jobs.ashbyhq.com/example',
    });
    expect(ashby.jobs).toEqual([
      expect.objectContaining({
        workplace_type: 'hybrid',
        employment_types: ['full_time'],
      }),
      expect.objectContaining({
        workplace_type: null,
        employment_types: ['internship'],
      }),
    ]);

    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      Response.json({
        jobs: [
          {
            id: 7,
            title: 'Analyst',
            metadata: [
              { name: 'Location Type', value: 'On-Site' },
              { name: 'Employment Type', value: 'Part Time Employees' },
              { name: 'Job Family', value: 'Remote Support' },
            ],
          },
        ],
      }),
    );
    const greenhouse = await fetchAuthorizedAtsJobs(SOURCE);
    expect(greenhouse.jobs[0]).toMatchObject({
      workplace_type: 'on_site',
      employment_types: ['part_time'],
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

  it('enforces the deadline while consuming a native response body', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((_input, init) =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          new Promise((_resolve, reject) => {
            // The runner must abort a body that never finishes, not leave the
            // source job active after headers have arrived.
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('body aborted')),
            );
          }),
      } as Response),
    );

    await expect(
      fetchAuthorizedAtsJobs(SOURCE, { timeoutMs: 5 }),
    ).rejects.toThrow('request failed: body aborted');
  });

  it('reads Workday boards natively, never through the Python bridge', async () => {
    const board = 'https://acme.wd5.myworkdayjobs.com/External';
    const request = jest
      .spyOn(global, 'fetch')
      .mockImplementation((input) =>
        Promise.resolve(
          (typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url
          ).endsWith('/jobs')
            ? new Response(
                JSON.stringify({ total: 0, jobPostings: [], facets: [] }),
              )
            : new Response('{}', { status: 404 }),
        ),
      );
    await expect(
      fetchAuthorizedAtsJobs({
        ats_type: 'workday',
        board_token: board,
        base_url: board,
      }),
    ).resolves.toMatchObject({
      jobs: [],
      metadata: { adapter: 'workday', complete: true },
    });
    expect(request.mock.calls[0][0]).toBe(
      'https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/External/jobs',
    );
  });

  it('reports a Workday failure as a runner error', async () => {
    const board = 'https://acme.wd5.myworkdayjobs.com/External';
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 404 }));
    await expect(
      fetchAuthorizedAtsJobs({
        ats_type: 'workday',
        board_token: board,
        base_url: board,
      }),
    ).rejects.toBeInstanceOf(AtsScraperRunnerError);
  });

  it('reads Lever postings natively: title, every location, country and full description', async () => {
    const request = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'abc-123',
            text: 'Backend Engineer',
            categories: {
              commitment: 'Full-time',
              location: 'New York, NY',
              allLocations: ['New York, NY', 'London, UK'],
              team: 'Engineering',
              department: 'Product Development',
            },
            country: 'US',
            workplaceType: 'hybrid',
            createdAt: Date.UTC(2026, 9, 10),
            description: '<div>About the role</div>',
            lists: [
              { text: 'Requirements', content: '<li>Go</li>' },
              { text: 'Empty', content: '' },
            ],
            additional: '<div>Benefits</div>',
            hostedUrl: 'https://jobs.lever.co/acme/abc-123',
          },
        ]),
      ),
    );
    const result = await fetchAuthorizedAtsJobs({
      ats_type: 'lever',
      board_token: 'acme',
      base_url: 'https://jobs.lever.co/acme',
      employer_board_name: 'Acme',
    });
    expect(request.mock.calls[0][0]).toBe(
      'https://api.lever.co/v0/postings/acme?mode=json',
    );
    expect(result.metadata).toMatchObject({
      adapter: 'lever',
      complete: true,
      requests_made: 1,
    });
    expect(result.jobs).toEqual([
      {
        external_job_id: 'abc-123',
        title: 'Backend Engineer',
        company_name: 'Acme',
        location: 'New York, NY | London, UK',
        department: 'Product Development',
        description:
          '<div>About the role</div>\n<h3>Requirements</h3><ul><li>Go</li></ul>\n<div>Benefits</div>',
        job_url: 'https://jobs.lever.co/acme/abc-123',
        posted_at: '2026-10-10T00:00:00.000Z',
        workplace_type: 'hybrid',
        employment_types: ['full_time'],
        location_countries: ['United States'],
      },
    ]);
  });

  it('fails a Lever board that does not exist', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{"ok":false,"error":"Document not found"}', {
        status: 404,
      }),
    );
    await expect(
      fetchAuthorizedAtsJobs({
        ats_type: 'lever',
        board_token: 'nope',
        base_url: 'https://jobs.lever.co/nope',
      }),
    ).rejects.toThrow('lever HTTP 404');
  });

  it('reads SmartRecruiters companies natively with the US filter', async () => {
    const request = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ totalFound: 0, content: [] })),
      );
    await expect(
      fetchAuthorizedAtsJobs({
        ats_type: 'smartrecruiters',
        board_token: 'Acme',
        base_url: 'https://jobs.smartrecruiters.com/Acme',
      }),
    ).resolves.toMatchObject({
      jobs: [],
      metadata: { adapter: 'smartrecruiters' },
    });
    expect(request.mock.calls[0][0]).toBe(
      'https://api.smartrecruiters.com/v1/companies/Acme/postings?country=us&limit=100&offset=0',
    );
  });
});
