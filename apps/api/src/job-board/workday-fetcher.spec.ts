import {
  fetchWorkdayJobs,
  findUsCountryFilter,
  parseWorkdayBoard,
  workdayJobId,
} from './workday-fetcher';

const BOARD = 'https://acme.wd5.myworkdayjobs.com/External';
const urlOf = (input: string | URL | Request) =>
  typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : input.url;
const bodyOf = (init?: RequestInit) =>
  JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as {
    appliedFacets: Record<string, string[]>;
    offset: number;
    limit: number;
  };
const source = {
  ats_type: 'workday',
  board_token: BOARD,
  base_url: BOARD,
  employer_board_name: 'Acme',
};

type Posting = {
  title: string;
  externalPath: string;
  locationsText: string;
  country: string;
};

/** A fake Workday site: list (with an optional country facet) and details. */
function site(postings: Posting[], options: { countryFacet?: boolean } = {}) {
  const calls: string[] = [];
  const facets =
    options.countryFacet === false
      ? [
          {
            facetParameter: 'jobFamilyGroup',
            values: [
              { descriptor: 'Engineering', id: 'eng', count: postings.length },
            ],
          },
        ]
      : [
          {
            facetParameter: 'locationMainGroup',
            values: [
              {
                facetParameter: 'locationCountry',
                values: [
                  {
                    descriptor: 'United States of America',
                    id: 'us-id',
                    count: postings.filter((p) => p.country === 'US').length,
                  },
                  {
                    descriptor: 'India',
                    id: 'in-id',
                    count: postings.filter((p) => p.country !== 'US').length,
                  },
                ],
              },
            ],
          },
        ];
  const fetchImpl = ((input: string | URL | Request, init?: RequestInit) => {
    const url = urlOf(input);
    calls.push(
      `${init?.method || 'GET'} ${url.replace('https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/External', '')}`,
    );
    if (url.endsWith('/jobs')) {
      const body = bodyOf(init);
      const matching = body.appliedFacets.locationCountry?.includes('us-id')
        ? postings.filter((p) => p.country === 'US')
        : postings;
      return new Response(
        JSON.stringify({
          total: matching.length,
          jobPostings: matching.slice(body.offset, body.offset + body.limit),
          facets,
        }),
      );
    }
    const posting = postings.find((p) => url.endsWith(p.externalPath));
    if (!posting) return new Response('{}', { status: 404 });
    return new Response(
      JSON.stringify({
        jobPostingInfo: {
          title: posting.title,
          jobDescription: `<p>${posting.title} description</p>`,
          location: posting.locationsText,
          additionalLocations: [],
          startDate: '2026-10-16',
          externalUrl: `${BOARD}/job${posting.externalPath}`,
          country: {
            descriptor:
              posting.country === 'US' ? 'United States of America' : 'India',
          },
        },
      }),
    );
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

const posting = (n: number, country = 'US'): Posting => ({
  title: `Engineer ${n}`,
  externalPath: `/job/${country === 'US' ? 'US-CA-San-Jose' : 'Bangalore'}/Engineer-${n}_R${n}`,
  locationsText: country === 'US' ? 'San Jose, CA' : 'Bangalore, India',
  country,
});

describe('Workday board helpers', () => {
  it('parses board URLs, with or without a locale', () => {
    expect(
      parseWorkdayBoard(
        'https://NVIDIA.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite',
      ),
    ).toEqual({
      origin: 'https://nvidia.wd5.myworkdayjobs.com',
      tenant: 'nvidia',
      site: 'NVIDIAExternalCareerSite',
    });
    expect(() => parseWorkdayBoard('https://example.com/jobs')).toThrow(
      'Invalid Workday board URL',
    );
  });

  it('reads the posting ID from the external path', () => {
    expect(
      workdayJobId('/job/US-CA-Santa-Clara/Senior-Engineer_JR2024570-1'),
    ).toBe('JR2024570-1');
    expect(workdayJobId('/job/Remote/Analyst')).toBe('Analyst');
  });

  it('finds the US value of a country filter, including nested groups', () => {
    expect(
      findUsCountryFilter([
        {
          facetParameter: 'CF_Country',
          values: [
            { descriptor: 'United States of America', id: 'x', count: 3 },
          ],
        },
      ]),
    ).toEqual({ CF_Country: ['x'] });
    // "US Remote" is a location, not the country.
    expect(
      findUsCountryFilter([
        {
          facetParameter: 'locations',
          values: [{ descriptor: 'US Remote', id: 'y', count: 3 }],
        },
      ]),
    ).toBeNull();
  });
});

describe('fetchWorkdayJobs', () => {
  it('lists only US postings through the country filter and reads their details', async () => {
    const postings = [
      ...Array.from({ length: 45 }, (_, i) => posting(i)),
      posting(99, 'IN'),
    ];
    const { fetchImpl, calls } = site(postings);
    const result = await fetchWorkdayJobs(source, { fetchImpl });

    expect(result.jobs).toHaveLength(45);
    expect(result.jobs[0]).toMatchObject({
      external_job_id: 'R0',
      title: 'Engineer 0',
      company_name: 'Acme',
      location: 'San Jose, CA',
      description: '<p>Engineer 0 description</p>',
      posted_at: '2026-10-16T12:00:00.000Z',
      location_countries: ['United States of America'],
    });
    // 1 probe + 3 US list pages + 45 details; the Indian posting is never read.
    expect(calls.filter((c) => c.startsWith('POST'))).toHaveLength(4);
    expect(calls.filter((c) => c.startsWith('GET'))).toHaveLength(45);
    expect(calls.some((c) => c.includes('R99'))).toBe(false);
    expect(result.metadata).toMatchObject({
      adapter: 'workday',
      complete: true,
      requests_made: 49,
    });
  });

  it('reuses stored postings instead of reading their details again', async () => {
    const postings = [posting(1), posting(2), posting(3)];
    const { fetchImpl, calls } = site(postings);
    const stored = new Map([
      [
        'R1',
        {
          location: 'San Jose, CA',
          description: 'saved',
          postedAt: '2026-10-01T00:00:00.000Z',
          jobUrl: 'u1',
          department: null,
        },
      ],
      [
        'R2',
        {
          location: 'San Jose, CA',
          description: 'saved',
          postedAt: '2026-10-01T00:00:00.000Z',
          jobUrl: 'u2',
          department: null,
        },
      ],
    ]);
    const result = await fetchWorkdayJobs(source, {
      fetchImpl,
      stored,
      refresh: (id) => id === 'R2',
    });

    expect(result.jobs.find((j) => j.external_job_id === 'R1')).toMatchObject({
      description: 'saved',
      job_url: 'u1',
    });
    expect(
      result.jobs.find((j) => j.external_job_id === 'R2')?.description,
    ).toBe('<p>Engineer 2 description</p>');
    expect(
      calls.filter((c) => c.startsWith('GET')).map((c) => c.slice(-2)),
    ).toEqual(['R2', 'R3']);
  });

  it('reads at most maxNewDetails new postings per run', async () => {
    const { fetchImpl } = site(
      Array.from({ length: 10 }, (_, i) => posting(i)),
    );
    const result = await fetchWorkdayJobs(source, {
      fetchImpl,
      maxNewDetails: 4,
    });
    expect(result.jobs).toHaveLength(4);
  });

  it('skips plainly non-US postings on sites without a country filter', async () => {
    const { fetchImpl, calls } = site([posting(1), posting(2, 'IN')], {
      countryFacet: false,
    });
    const result = await fetchWorkdayJobs(source, { fetchImpl });
    expect(result.jobs.map((j) => j.external_job_id)).toEqual(['R1']);
    expect(calls.some((c) => c.includes('R2'))).toBe(false);
  });

  it('splits a query that reaches the 2,000-result cap by another filter', async () => {
    const big = Array.from({ length: 2000 }, (_, i) => posting(i));
    const calls: string[] = [];
    const fetchImpl = ((input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);
      calls.push(url);
      if (!url.endsWith('/jobs'))
        return new Response(
          JSON.stringify({
            jobPostingInfo: { title: 'x', startDate: '2026-10-16' },
          }),
        );
      const body = bodyOf(init);
      const family = body.appliedFacets.jobFamilyGroup?.[0];
      const matching =
        family === 'a'
          ? big.slice(0, 1200)
          : family === 'b'
            ? big.slice(1200)
            : big;
      return new Response(
        JSON.stringify({
          total: matching.length,
          jobPostings: matching.slice(body.offset, body.offset + body.limit),
          facets: [
            {
              facetParameter: 'jobFamilyGroup',
              values: [
                { id: 'a', descriptor: 'A', count: 1200 },
                { id: 'b', descriptor: 'B', count: 800 },
              ],
            },
          ],
        }),
      );
    }) as unknown as typeof fetch;
    const result = await fetchWorkdayJobs(source, {
      fetchImpl,
      maxNewDetails: 0,
    });
    expect(result.jobs).toHaveLength(0); // no new details this run
    // Every posting was listed: 2 (probe + capped query) + 60 + 40 pages.
    expect(calls.filter((c) => c.endsWith('/jobs'))).toHaveLength(2 + 60 + 40);
  });

  it('fails the source when the site does not exist', async () => {
    const fetchImpl = (() =>
      Promise.resolve(
        new Response('{}', { status: 404 }),
      )) as unknown as typeof fetch;
    await expect(fetchWorkdayJobs(source, { fetchImpl })).rejects.toThrow(
      'Workday site not found',
    );
  });
});
