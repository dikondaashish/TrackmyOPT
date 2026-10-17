import {
  fetchSmartRecruitersJobs,
  smartRecruitersDescription,
  smartRecruitersLocation,
} from './smartrecruiters-fetcher';

const source = {
  ats_type: 'smartrecruiters',
  board_token: 'Acme',
  base_url: 'https://jobs.smartrecruiters.com/Acme',
  employer_board_name: 'Acme',
};

const urlOf = (input: string | URL | Request) =>
  typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : input.url;

function posting(n: number) {
  return {
    id: `P${n}`,
    name: `Engineer ${n}`,
    releasedDate: '2026-10-16T20:52:12.836Z',
    location: {
      city: 'Sunnyvale',
      region: 'CA',
      country: 'us',
      remote: false,
      hybrid: true,
    },
    department: { label: 'Engineering' },
    typeOfEmployment: { label: 'Full-time' },
  };
}

/** A fake SmartRecruiters company with `count` US postings. */
function company(count: number) {
  const calls: string[] = [];
  const all = Array.from({ length: count }, (_, i) => posting(i));
  const fetchImpl = ((input: string | URL | Request) => {
    const url = urlOf(input);
    calls.push(
      url.replace(
        'https://api.smartrecruiters.com/v1/companies/Acme/postings',
        '',
      ),
    );
    const list = /\?country=us&limit=(\d+)&offset=(\d+)$/.exec(url);
    if (list) {
      const [limit, offset] = [Number(list[1]), Number(list[2])];
      return Promise.resolve(
        new Response(
          JSON.stringify({
            totalFound: all.length,
            content: all.slice(offset, offset + limit),
          }),
        ),
      );
    }
    const id = url.split('/').pop();
    return Promise.resolve(
      new Response(
        JSON.stringify({
          postingUrl: `https://jobs.smartrecruiters.com/Acme/${id}-engineer`,
          jobAd: {
            sections: {
              companyDescription: {
                title: 'Company Description',
                text: '<p>About Acme</p>',
              },
              jobDescription: {
                title: 'Job Description',
                text: `<p>Role ${id}</p>`,
              },
              qualifications: { title: 'Qualifications', text: '' },
            },
          },
        }),
      ),
    );
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

describe('SmartRecruiters helpers', () => {
  it('formats locations', () => {
    expect(
      smartRecruitersLocation({
        city: 'Sunnyvale',
        region: 'CA',
        country: 'us',
      }),
    ).toBe('Sunnyvale, CA');
    expect(smartRecruitersLocation({ country: 'us', remote: true })).toBe(
      'Remote, US',
    );
    expect(smartRecruitersLocation(undefined)).toBeNull();
  });

  it('joins non-empty description sections in page order', () => {
    expect(
      smartRecruitersDescription({
        jobAd: {
          sections: {
            additionalInformation: {
              title: 'Additional Information',
              text: '<p>Benefits</p>',
            },
            jobDescription: { title: 'Job Description', text: '<p>Role</p>' },
            qualifications: { text: ' ' },
          },
        },
      }),
    ).toBe(
      '<h3>Job Description</h3><p>Role</p>\n<h3>Additional Information</h3><p>Benefits</p>',
    );
  });
});

describe('fetchSmartRecruitersJobs', () => {
  it('pages through US postings and reads details for new ones', async () => {
    const { fetchImpl, calls } = company(150);
    const result = await fetchSmartRecruitersJobs(source, { fetchImpl });

    expect(calls.slice(0, 2)).toEqual([
      '?country=us&limit=100&offset=0',
      '?country=us&limit=100&offset=100',
    ]);
    expect(result.jobs).toHaveLength(150);
    expect(result.jobs[0]).toEqual({
      external_job_id: 'P0',
      title: 'Engineer 0',
      company_name: 'Acme',
      location: 'Sunnyvale, CA',
      department: 'Engineering',
      description:
        '<h3>Company Description</h3><p>About Acme</p>\n<h3>Job Description</h3><p>Role P0</p>',
      job_url: 'https://jobs.smartrecruiters.com/Acme/P0-engineer',
      posted_at: '2026-10-16T20:52:12.836Z',
      workplace_type: 'hybrid',
      employment_types: ['full_time'],
      location_countries: ['United States'],
    });
    expect(result.metadata).toMatchObject({
      adapter: 'smartrecruiters',
      complete: true,
      requests_made: 152,
    });
  });

  it('reuses stored descriptions and keeps list fields fresh', async () => {
    const { fetchImpl, calls } = company(3);
    const stored = new Map([
      [
        'P0',
        {
          location: 'old',
          description: 'saved',
          postedAt: null,
          jobUrl: 'u0',
          department: null,
        },
      ],
      [
        'P1',
        {
          location: 'old',
          description: 'saved',
          postedAt: null,
          jobUrl: 'u1',
          department: null,
        },
      ],
    ]);
    const result = await fetchSmartRecruitersJobs(source, {
      fetchImpl,
      stored,
      refresh: (id) => id === 'P1',
    });
    const p0 = result.jobs.find((j) => j.external_job_id === 'P0');
    expect(p0).toMatchObject({
      description: 'saved',
      job_url: 'u0',
      location: 'Sunnyvale, CA',
    });
    expect(calls.filter((c) => !c.startsWith('?'))).toEqual(['/P1', '/P2']);
  });

  it('reads at most maxNewDetails new postings per run', async () => {
    const { fetchImpl } = company(10);
    const result = await fetchSmartRecruitersJobs(source, {
      fetchImpl,
      maxNewDetails: 3,
    });
    expect(result.jobs).toHaveLength(3);
  });

  it('returns no jobs for a company without US postings', async () => {
    const { fetchImpl } = company(0);
    await expect(
      fetchSmartRecruitersJobs(source, { fetchImpl }),
    ).resolves.toMatchObject({ jobs: [] });
  });

  it('rejects an invalid company identifier', async () => {
    await expect(
      fetchSmartRecruitersJobs({ ...source, board_token: '../x' }),
    ).rejects.toThrow('Invalid SmartRecruiters company');
  });
});
