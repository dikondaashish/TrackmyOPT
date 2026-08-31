import {
  ATS_PLATFORM_PLUGINS,
  detectAtsBoardFromUrl,
  detectAtsBoardsInHtml,
  getAtsPlatformPlugin,
} from './ats-platform.registry';

describe('ATS platform registry', () => {
  it('registers every phase-one priority ATS exactly once', () => {
    expect(ATS_PLATFORM_PLUGINS.map((plugin) => plugin.platform)).toEqual([
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
    ]);
    expect(
      new Set(ATS_PLATFORM_PLUGINS.map((plugin) => plugin.platform)).size,
    ).toBe(10);
    expect(getAtsPlatformPlugin('workday')?.defaultRequestsPerMinute).toBe(2);
  });

  it.each([
    [
      'https://job-boards.greenhouse.io/stripe/jobs/8023928',
      'greenhouse',
      'stripe',
    ],
    [
      'https://boards-api.greenhouse.io/v1/boards/stripe/jobs?content=true',
      'greenhouse',
      'stripe',
    ],
    ['https://jobs.lever.co/palantir/abc', 'lever', 'palantir'],
    ['https://api.ashbyhq.com/posting-api/job-board/ramp', 'ashby', 'ramp'],
    [
      'https://jobs.smartrecruiters.com/Visa/744000133907678-role',
      'smartrecruiters',
      'Visa',
    ],
    [
      'https://apply.workable.com/api/v1/widget/accounts/huggingface',
      'workable',
      'huggingface',
    ],
    ['https://helloprint.recruitee.com/o/engineer', 'recruitee', 'helloprint'],
    [
      'https://personio.jobs.personio.de/xml',
      'personio',
      'https://personio.jobs.personio.de',
    ],
    ['https://flyio.bamboohr.com/careers/35', 'bamboohr', 'flyio'],
    ['https://fathom.breezy.hr/p/abc-engineer', 'breezy', 'fathom'],
  ])('extracts %s', (url, platform, token) => {
    expect(detectAtsBoardFromUrl(url)).toMatchObject({
      platform,
      boardToken: token,
    });
  });

  it('extracts the full Workday board identity from a localized career URL', () => {
    expect(
      detectAtsBoardFromUrl(
        'https://intel.wd1.myworkdayjobs.com/en-US/External/job/role',
      ),
    ).toEqual({
      platform: 'workday',
      boardToken: 'https://intel.wd1.myworkdayjobs.com/External',
      boardUrl: 'https://intel.wd1.myworkdayjobs.com/External',
      discoveredFromUrl:
        'https://intel.wd1.myworkdayjobs.com/en-US/External/job/role',
      workday: { tenant: 'intel', shard: 'wd1', site: 'External' },
    });
  });

  it('extracts Workday identity from the public API URL', () => {
    expect(
      detectAtsBoardFromUrl(
        'https://intel.wd1.myworkdayjobs.com/wday/cxs/intel/External/jobs',
      ),
    ).toMatchObject({
      platform: 'workday',
      boardToken: 'https://intel.wd1.myworkdayjobs.com/External',
      workday: { tenant: 'intel', shard: 'wd1', site: 'External' },
    });
  });

  it('only detects ATS links in URL-bearing HTML attributes', () => {
    const html = `
      <p>We used Greenhouse once and jobs.ashbyhq.com/not-a-link is plain text.</p>
      <a href="https://jobs.ashbyhq.com/openai">Open roles</a>
      <script src='https://jobs.lever.co/palantir?mode=json'></script>
      <form action="https://jobs.ashbyhq.com/openai/application"></form>
    `;

    expect(detectAtsBoardsInHtml(html)).toEqual([
      expect.objectContaining({ platform: 'ashby', boardToken: 'openai' }),
      expect.objectContaining({ platform: 'lever', boardToken: 'palantir' }),
    ]);
  });

  it.each([
    'not a url',
    'http://jobs.lever.co/palantir',
    'https://example.com/careers',
    'https://jobs.ashbyhq.com/',
    'https://www.bamboohr.com/careers',
  ])('rejects unsupported or unsafe candidate %s', (value) => {
    expect(detectAtsBoardFromUrl(value)).toBeNull();
  });
});
