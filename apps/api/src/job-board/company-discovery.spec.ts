import {
  buildCareerPageCandidates,
  discoverCompanyBoards,
  evaluateBoardOwnership,
  extractDiscoverableLinks,
  isPathAllowedByRobots,
  planBoardCandidate,
} from './company-discovery';

describe('company discovery safety contracts', () => {
  it('builds a bounded, HTTPS-only career candidate list with known URL first', () => {
    const candidates = buildCareerPageCandidates({
      website: 'https://example.com/about',
      domain: 'example.com',
      careersUrl: 'https://example.com/join-us',
      limit: 8,
    });

    expect(candidates).toEqual([
      'https://example.com/join-us',
      'https://careers.example.com/',
      'https://jobs.example.com/',
      'https://example.com/careers',
      'https://example.com/career',
      'https://example.com/jobs',
      'https://example.com/job',
      'https://example.com/about/careers',
    ]);
  });

  it('extracts only URL-bearing HTML attributes and resolves safe relative links', () => {
    const html = `
      <p>Plain text https://jobs.lever.co/not-a-link is ignored.</p>
      <a href="/careers">Careers</a>
      <a href="https://jobs.ashbyhq.com/example">Jobs</a>
      <form action='javascript:alert(1)'></form>
      <img src="https://example.com/logo.svg" />
    `;

    expect(extractDiscoverableLinks(html, 'https://example.com/about')).toEqual(
      [
        'https://example.com/careers',
        'https://jobs.ashbyhq.com/example',
        'https://example.com/logo.svg',
      ],
    );
  });

  it('honors the most-specific robots rule for the TrackMyOPT crawler', () => {
    const robots = `
      User-agent: *
      Disallow: /private
      Allow: /private/careers

      User-agent: TrackMyOPTJobDiscovery
      Disallow: /blocked
    `;

    expect(
      isPathAllowedByRobots(
        robots,
        '/private/careers/engineering',
        'TrackMyOPTJobDiscovery',
      ),
    ).toBe(true);
    expect(
      isPathAllowedByRobots(robots, '/blocked/jobs', 'TrackMyOPTJobDiscovery'),
    ).toBe(false);
  });

  it('scores explicit official-domain, company-name, and careers-link evidence', () => {
    const result = evaluateBoardOwnership({
      companyName: 'Example Technologies, Inc.',
      companyDomain: 'example.com',
      companyWebsite: 'https://example.com',
      discoveredOnOfficialCareerPage: true,
      boardHtml: `
        <title>Example Technologies Careers</title>
        <a href="https://example.com">Company website</a>
      `,
    });

    expect(result).toEqual({
      confidence: 1,
      companyNameMatch: true,
      websiteMatch: true,
      domainMatch: true,
      careersLinkMatch: true,
      brandingMatch: true,
      reasons: [
        'company_name_match',
        'official_website_link',
        'official_domain_link',
        'official_careers_link',
        'company_branding_match',
      ],
    });
  });

  it('never activates a discovered board and queues weak evidence for review', () => {
    expect(
      planBoardCandidate({
        platformAuthorization: 'approved',
        ownership: {
          confidence: 0.2,
          companyNameMatch: false,
          websiteMatch: false,
          domainMatch: false,
          careersLinkMatch: true,
          brandingMatch: false,
          reasons: ['official_careers_link'],
        },
      }),
    ).toEqual({
      verificationStatus: 'pending_verification',
      activationAllowed: false,
      queueReason: 'insufficient_company_ownership_evidence',
    });
  });

  it('still requires an explicit verification step for strong evidence', () => {
    expect(
      planBoardCandidate({
        platformAuthorization: 'approved',
        ownership: {
          confidence: 0.95,
          companyNameMatch: true,
          websiteMatch: true,
          domainMatch: true,
          careersLinkMatch: true,
          brandingMatch: false,
          reasons: [
            'company_name_match',
            'official_website_link',
            'official_domain_link',
            'official_careers_link',
          ],
        },
      }),
    ).toEqual({
      verificationStatus: 'pending_verification',
      activationAllowed: false,
      queueReason: 'ready_for_explicit_verification',
    });
  });

  it('blocks activation when the ATS platform policy is not approved', () => {
    expect(
      planBoardCandidate({
        platformAuthorization: 'pending_review',
        ownership: {
          confidence: 1,
          companyNameMatch: true,
          websiteMatch: true,
          domainMatch: true,
          careersLinkMatch: true,
          brandingMatch: true,
          reasons: [],
        },
      }).queueReason,
    ).toBe('ats_policy_review_required');
  });

  it('follows one obvious official careers link and produces a review-only board candidate', async () => {
    const pages = new Map([
      [
        'https://example.com/',
        {
          finalUrl: 'https://example.com/',
          body: '<a href="/join-us">Join our team</a>',
        },
      ],
      [
        'https://example.com/join-us',
        {
          finalUrl: 'https://example.com/join-us',
          body: '<a href="https://jobs.ashbyhq.com/example">Open jobs</a>',
        },
      ],
      [
        'https://jobs.ashbyhq.com/example',
        {
          finalUrl: 'https://jobs.ashbyhq.com/example',
          body: '<title>Example Careers</title><a href="https://example.com">Website</a>',
        },
      ],
    ]);

    const result = await discoverCompanyBoards(
      {
        id: 'company-1',
        name: 'Example, Inc.',
        website: 'https://example.com',
        domain: 'example.com',
        careersUrl: null,
      },
      (url) => Promise.resolve(pages.get(url) ?? null),
      { ashby: 'approved' },
      6,
    );

    expect(result.boards).toHaveLength(1);
    expect(result.boards[0]).toMatchObject({
      platform: 'ashby',
      boardToken: 'example',
      verificationStatus: 'pending_verification',
      activationAllowed: false,
      queueReason: 'ready_for_explicit_verification',
    });
    expect(result.boards[0]?.ownership.confidence).toBe(1);
    expect(result.careerPageUrl).toBe('https://example.com/join-us');
  });
});
