// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  classifyPostDomain,
  COMMENTARY_LIMIT,
  composeDailyPost,
  escapeLittleText,
  isOptFriendlyCandidate,
  jobLinkCode,
  selectDailyJobs,
  type CandidateJob,
} from './daily-post';

const NOW = new Date('2026-10-18T18:30:00Z');

function job(overrides: Partial<CandidateJob> & { id: string; title: string }): CandidateJob {
  return {
    companyName: `Company ${overrides.id}`,
    location: 'New York, NY',
    description: 'Build great things.',
    jobUrl: `https://boards.example.com/jobs/${overrides.id}`,
    postedAt: '2026-10-18T10:00:00Z',
    firstSeenAt: '2026-10-18T11:00:00Z',
    signalTypes: [],
    ...overrides,
  };
}

describe('classifyPostDomain', () => {
  it.each([
    ['Software Engineer II', 'software'],
    ['Full-Stack Developer', 'software'],
    ['Data Analyst', 'data'],
    ['Machine Learning Engineer', 'data'],
    ['Cloud Security Engineer', 'cybersecurity'],
    ['SOC Analyst', 'cybersecurity'],
    ['Network Engineer', 'networking'],
    ['Site Reliability Engineer', 'networking'],
    ['Systems Administrator', 'networking'],
    ['IT & Network Intern', 'networking'],
  ])('%s → %s', (title, domain) => {
    expect(classifyPostDomain(title)).toBe(domain);
  });

  it.each([
    'Senior Account Executive - Data Products',
    'Engineering Manager, Platform',
    'Principal Software Engineer',
    'Director, Data Center Engineering',
    'Mechanical Engineer',
    'Security Officer',
    'GIS Solution Engineer – Electric, Gas, Telecommunications, Rail',
    'Salesforce Business Systems Administrator',
  ])('skips %s', (title) => {
    expect(classifyPostDomain(title)).toBeNull();
  });
});

describe('isOptFriendlyCandidate', () => {
  it('rejects postings that rule out visa holders', () => {
    expect(isOptFriendlyCandidate(job({ id: '1', title: 'SWE', signalTypes: ['no_sponsorship_stated'] }))).toBe(false);
    expect(
      isOptFriendlyCandidate(job({ id: '2', title: 'SWE', description: '<p>Must be a U.S. citizen.</p>' })),
    ).toBe(false);
    expect(
      isOptFriendlyCandidate(job({ id: '3', title: 'SWE', description: 'Requires an active security clearance.' })),
    ).toBe(false);
    expect(isOptFriendlyCandidate(job({ id: '4', title: 'Software Engineer (TS/SCI)' }))).toBe(false);
    expect(isOptFriendlyCandidate(job({ id: '5', title: 'SWE', jobUrl: 'javascript:alert(1)' }))).toBe(false);
  });

  it.each([
    // Escaped HTML, as some ATS feeds send it.
    '&lt;ul&gt;&lt;li&gt;US Citizen&lt;/li&gt;&lt;li&gt;Eligible to obtain a Public Trust&lt;/li&gt;&lt;/ul&gt;',
    '&amp;lt;li&amp;gt;U.S. Citizenship required (no dual citizenship)&amp;lt;/li&amp;gt;',
    '<p><strong>Clearance:</strong></p><ul><li>Must have an active Top Secret</li></ul>',
    'Applicant must be a U.S. person, defined as a U.S. citizen or national.',
    '<li>U.S. Citizen located on U.S. soil (mandatory).</li>',
  ])('rejects restricted description %#', (description) => {
    expect(isOptFriendlyCandidate(job({ id: 'r', title: 'Software Engineer', description }))).toBe(false);
  });

  it('rejects federal and defense contractors', () => {
    expect(isOptFriendlyCandidate(job({ id: 'f', title: 'Software Engineer', companyName: 'Accenture Federal Services' }))).toBe(false);
  });

  it('keeps ordinary postings', () => {
    expect(isOptFriendlyCandidate(job({ id: '6', title: 'Software Engineer' }))).toBe(true);
    expect(
      isOptFriendlyCandidate(
        job({
          id: '7',
          title: 'Software Engineer',
          description:
            'We consider applicants regardless of citizenship status. | Employee Polygraph Protection Act | U.S. citizens, permanent residents and visa holders are welcome.',
        }),
      ),
    ).toBe(true);
  });
});

describe('selectDailyJobs', () => {
  it('caps each domain at ten and limits jobs per company', () => {
    const candidates = Array.from({ length: 30 }, (_, index) =>
      job({ id: `s${index}`, title: `Software Engineer ${index}`, companyName: `Co ${index % 4}` }),
    );
    const items = selectDailyJobs(candidates, { now: NOW });
    // Four companies, two per company in a domain.
    expect(items).toHaveLength(8);
    expect(items.every((item) => item.domain === 'software')).toBe(true);
  });

  it('prefers early-career and sponsorship-positive roles over senior ones', () => {
    const items = selectDailyJobs(
      [
        job({ id: 'a', title: 'Senior Software Engineer' }),
        job({ id: 'b', title: 'Software Engineer I' }),
        job({ id: 'c', title: 'Software Engineer', signalTypes: ['future_sponsorship_stated'] }),
      ],
      { now: NOW },
    );
    expect(items.map((item) => item.jobId)).toEqual(['c', 'b', 'a']);
  });

  it('skips excluded and duplicate jobs', () => {
    const items = selectDailyJobs(
      [job({ id: 'a', title: 'Data Engineer' }), job({ id: 'a', title: 'Data Engineer' }), job({ id: 'b', title: 'Data Engineer' })],
      { now: NOW, excludeJobIds: new Set(['b']) },
    );
    expect(items.map((item) => item.jobId)).toEqual(['a']);
  });

  it('lists a role posted for several locations once and skips talent pools', () => {
    const items = selectDailyJobs(
      [
        job({ id: 'a', title: 'Bioinformatics Scientist', companyName: 'Natera' }),
        job({ id: 'b', title: 'Bioinformatics Scientist', companyName: 'Natera', location: 'Austin, TX' }),
        job({ id: 'c', title: 'CoRL 2026 - Robotics & AI Talent', companyName: 'Apptronik' }),
      ],
      { now: NOW },
    );
    expect(items.map((item) => item.jobId)).toEqual(['a']);
  });
});

describe('jobLinkCode', () => {
  it('is a stable seven-character base62 code', () => {
    expect(jobLinkCode('6821c24c-19c6-4ef4-92d4-cc0333c3d21b')).toMatch(/^[A-Za-z0-9]{7}$/);
    expect(jobLinkCode('x')).toBe(jobLinkCode('x'));
    expect(jobLinkCode('x')).not.toBe(jobLinkCode('y'));
  });
});

describe('escapeLittleText', () => {
  it('escapes every reserved character', () => {
    expect(escapeLittleText('C++ (Remote) | #1 @Acme [x] <y> *z* _a_ ~b~ {c} \\')).toBe(
      'C++ \\(Remote\\) \\| \\#1 \\@Acme \\[x\\] \\<y\\> \\*z\\* \\_a\\_ \\~b\\~ \\{c\\} \\\\',
    );
  });
});

describe('composeDailyPost', () => {
  const domains = ['Software Engineer', 'Data Scientist', 'Security Engineer', 'Network Engineer'];
  const items = selectDailyJobs(
    domains.flatMap((title, domainIndex) =>
      Array.from({ length: 10 }, (_, index) =>
        job({
          id: `${domainIndex}-${index}`,
          title: `${title} (Platform & Infrastructure Team, Remote)`,
          companyName: `Example Company Number ${domainIndex}-${index}`,
        }),
      ),
    ),
    { now: NOW },
  );

  it('fits LinkedIn’s limit by trimming the largest domains', () => {
    expect(items).toHaveLength(40);
    const post = composeDailyPost(items, { postDate: '2026-10-18', siteOrigin: 'https://www.trackmyopt.com' });
    expect(post.commentary.length).toBeLessThanOrEqual(COMMENTARY_LIMIT);
    expect(post.shownCount).toBeGreaterThan(12);
    expect(post.shownCount).toBeLessThan(40);
    expect(post.commentary).toContain("See all 40 of today's picks: https://www.trackmyopt.com/opt-jobs/2026-10-18");
    expect(post.commentary).toContain('Sunday, Oct 18');
    for (const label of ['Software Engineering', 'Data & AI', 'Cybersecurity', 'Networking & Cloud']) {
      expect(post.commentary).toContain(label);
    }
    // Reserved characters in job titles are escaped; hashtags stay live.
    expect(post.commentary).toContain('\\(Platform');
    expect(post.commentary).toMatch(/#OPT #STEMOPT/);
  });

  it('lists every job when they all fit', () => {
    const post = composeDailyPost(items.slice(0, 3), {
      postDate: '2026-10-18',
      siteOrigin: 'https://www.trackmyopt.com',
    });
    expect(post.shownCount).toBe(3);
    expect(post.commentary).toContain(`https://www.trackmyopt.com/j/${items[0].code}`);
    expect(post.commentary).toContain("Today's picks on one page:");
  });
});
