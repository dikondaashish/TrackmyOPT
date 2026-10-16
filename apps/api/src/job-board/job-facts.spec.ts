import {
  experienceBucket,
  inferDegreeLevels,
  inferEmploymentEvidence,
  inferJobTypeEvidence,
  inferMinimumExperienceYears,
  inferTextJobFacts,
  inferWorkplaceEvidence,
  jobPostingPlainText,
} from './job-facts';

const years = (text: string) =>
  inferMinimumExperienceYears(jobPostingPlainText(text));
const degrees = (text: string) => inferDegreeLevels(jobPostingPlainText(text));
const workplaces = (text: string) =>
  inferWorkplaceEvidence(jobPostingPlainText(text));
const jobTypes = (text: string) =>
  inferJobTypeEvidence(jobPostingPlainText(text));
const employment = (text: string) =>
  inferEmploymentEvidence(jobPostingPlainText(text));

describe('jobPostingPlainText', () => {
  it('decodes Greenhouse double-escaped HTML into lines', () => {
    expect(
      jobPostingPlainText(
        '&lt;p&gt;Fully&amp;nbsp;remote&lt;/p&gt;&lt;ul&gt;&lt;li&gt;5+ years&lt;/li&gt;&lt;li&gt;B.S.&lt;/li&gt;&lt;/ul&gt;',
      ),
    ).toBe('fully remote\n5+ years\nb.s.');
  });

  it('normalizes curly quotes, dashes and bullets', () => {
    expect(jobPostingPlainText('Master’s • 3–5 years')).toBe(
      "master's\n3-5 years",
    );
  });

  it('ignores markup, attributes and scripts', () => {
    expect(
      jobPostingPlainText(
        '<div class="remote-banner" data-x="hybrid"><script>var onsite=1</script>Hello</div>',
      ),
    ).toBe('hello');
  });
});

describe('inferMinimumExperienceYears', () => {
  it.each<[string, number]>([
    ['5+ years of experience in backend development', 5],
    ['3-5 years of experience', 3],
    ['3 – 5 years of relevant experience', 3],
    ['3 to 5 years of experience', 3],
    ['Minimum of 5 years', 5],
    ['A minimum of 4 years of professional experience', 4],
    ['At least two years of experience in sales', 2],
    ['two (2) years of experience', 2],
    ['Ten+ years building distributed systems', 10],
    ['2 or more years of experience', 2],
    ['5+ yrs. experience with SQL', 5],
    ['7+ YOE', 7],
    ['one year of experience with React', 1],
    ['a year of experience in retail', 1],
    ['6 months of experience in customer support', 0],
    ['Experience: 4+ years', 4],
    ['Proven track record (5+ years) of shipping products', 5],
    ['5+ years configuring enterprise platforms', 5],
    ['min. 2 years in business development', 2],
    ['8-12+ years of progressive finance experience', 8],
    ['No prior experience required - we will train you', 0],
  ])('%s -> %i', (text, expected) => {
    expect(years(text)).toBe(expected);
  });

  it('never reads the trailing digit of a larger number', () => {
    expect(years('12 years of experience')).toBe(12);
    expect(years('Requires 12 years of experience')).not.toBe(2);
  });

  it.each([
    '401(k) match and 2 weeks of PTO',
    'Support our customers 24/7',
    'Founded 10 years ago',
    'For over 20 years, Acme has led the industry',
    'We have over 15 years of experience serving clients',
    'Must be 18 years or older',
    'Over the past 3 years we tripled revenue',
    'Within 2-3 years, you will own major projects',
    '1 month sabbatical after 5 years of service',
    'Requires a 4-year degree',
    'Have a 4 year college degree',
    'This is a 2-year fixed-term contract',
    'Age (40 years and over) is a protected class',
    'Commit to a minimum of 10 hours per week',
  ])('ignores unrelated numbers: %s', (text) => {
    expect(years(text)).toBeNull();
  });

  it('takes the largest required minimum across statements', () => {
    expect(
      years(
        '<li>6+ years of B2B sales experience, with 2+ years leading teams</li><li>3+ years with Salesforce</li>',
      ),
    ).toBe(6);
  });

  it('treats "or" alternatives as either qualifying', () => {
    expect(
      years(
        '6+ years of professional experience (senior) or 10+ years (staff)',
      ),
    ).toBe(6);
  });

  it('prefers required statements over preferred ones', () => {
    expect(
      years(
        '<p>Requirements</p><ul><li>3+ years of experience</li></ul><p>Preferred qualifications</p><ul><li>8+ years of experience</li></ul>',
      ),
    ).toBe(3);
    expect(years('2+ years of experience required; 5+ years preferred.')).toBe(
      2,
    );
  });

  it('uses the smallest preferred statement when nothing is required', () => {
    expect(
      years(
        '<p>Nice to have</p><ul><li>4+ years of Go experience</li><li>6+ years of experience</li></ul>',
      ),
    ).toBe(4);
  });

  it('maps years to the filter buckets', () => {
    expect(experienceBucket(null)).toBeNull();
    expect(experienceBucket(0)).toBe('entry');
    expect(experienceBucket(2)).toBe('entry');
    expect(experienceBucket(2.5)).toBe('mid');
    expect(experienceBucket(5)).toBe('mid');
    expect(experienceBucket(6)).toBe('senior');
    expect(experienceBucket(12)).toBe('senior');
  });
});

describe('inferDegreeLevels', () => {
  it.each<[string, string[]]>([
    ["Bachelor's degree in Computer Science", ['bachelor']],
    ['Bachelors or Masters in Engineering', ['bachelor', 'master']],
    ['BS/MS in Computer Science', ['bachelor', 'master']],
    ['B.S. or M.S. in Statistics', ['bachelor', 'master']],
    ['BA in Economics', ['bachelor']],
    ['BSc in Physics', ['bachelor']],
    ['A four-year degree', ['bachelor']],
    ['MBA preferred', ['master']],
    ['MS degree in Data Science', ['master']],
    ['M.Sc. in Chemistry', ['master']],
    ['Master of Science in Mathematics', ['master']],
    ["Master's or PhD in Machine Learning", ['master', 'doctorate']],
    ['Ph.D. in Biology', ['doctorate']],
    ['PhDs welcome', ['doctorate']],
    ['Doctorate in Education', ['doctorate']],
    [
      'bs, ms, or phd in a quantitative field',
      ['bachelor', 'master', 'doctorate'],
    ],
  ])('%s', (text, expected) => {
    expect(degrees(text)).toEqual(expected);
  });

  it.each([
    'Certified Scrum Master (CSM)',
    'Act as Scrum Master for two teams',
    'Own master data management',
    'Maintain the master schedule and master batch records',
    'Master new markets quickly',
    'Complete mastery of PHP 8',
    'Embark on a new journey',
    'Proficient in MS Office, MS Excel and MS Teams',
    'Located in Jackson, MS',
    'Senior BA (business analyst) for payments',
    'Absorb new information fast',
    'Plan B. A new approach',
    'Master of ceremonies at company events',
    'A PhD is not required',
    'No bachelor’s degree required',
  ])('finds no degree in: %s', (text) => {
    expect(degrees(text)).toEqual([]);
  });
});

describe('inferWorkplaceEvidence', () => {
  it.each<[string, string[]]>([
    ['This role is fully remote within the US.', ['remote']],
    ['Remote (EU/UK)', ['remote']],
    ['Location: Remote', ['remote']],
    ['We are a remote-first company.', ['remote']],
    ['Our team works 100% remotely from home.', ['remote']],
    ['#LI-Remote', ['remote']],
    ['This is a hybrid role based in our NYC office.', ['hybrid']],
    ['Hybrid part-time contract role.', ['hybrid']],
    ['Remote full-time position', ['remote']],
    ['3 days a week in the office', ['hybrid']],
    ['In-office three days per week', ['hybrid']],
    ['Work from the office 4 days a week', ['hybrid', 'on_site']],
    ['This position is on-site in San Francisco.', ['on_site']],
    ['You will work onsite five days per week.', ['on_site']],
    ['Location: Austin, TX (on-site)', ['on_site']],
    ['This is not a remote position.', ['on_site']],
    ['Remote work is not available for this role.', ['on_site']],
  ])('%s', (text, expected) => {
    expect(workplaces(text)).toEqual(expected);
  });

  it.each([
    'Experience with hybrid cloud and on-prem infrastructure',
    'A hybrid cloud engineering role',
    'Remote sensing analyst position',
    'Collaborate with remote teams across time zones',
    'Remote sensing and analysis solutions',
    'Manage remote environments and deploys',
    'Onsite interviews take place in our office',
    'Enjoy on-site lunch and an onsite gym',
    'Meet customers in person at conferences',
    'Imposters are conducting remote interviews',
  ])('finds no workplace in: %s', (text) => {
    expect(workplaces(text)).toEqual([]);
  });

  it('honors negations', () => {
    expect(
      workplaces(
        'This role requires working on-site. We do not offer hybrid or remote options.',
      ),
    ).toEqual(['on_site']);
    expect(workplaces('We do not offer remote-only roles.')).toEqual([]);
  });
});

describe('inferJobTypeEvidence', () => {
  it.each<[string, string[]]>([
    ['This is a paid summer internship.', ['internship']],
    ['Pay: paid internship', ['internship']],
    ['This is a 6-month contract position.', ['contract']],
    ['Contract-to-hire opportunity', ['contract']],
    ['Freelance | 8-20 hrs/week | Remote', ['contract']],
    ['This is a temporary full-time role.', ['temporary']],
    ['This is a 6-month, fixed-term contract.', ['temporary']],
    ['Permanent full-time position', ['permanent']],
    ['Job type (permanent, fixed term, internship)\nPermanent', ['permanent']],
    ['Type: contract / part-time', ['contract']],
  ])('%s', (text, expected) => {
    expect(jobTypes(text)).toEqual(expected);
  });

  it.each([
    'As a federal contractor, we comply with VEVRAA.',
    'Manage vendors, contractors and contracts.',
    'Open to U.S. citizens and permanent residents.',
    'Duties may change on a temporary or permanent basis.',
    'Temporary housing is provided for relocation.',
    'You will mentor summer interns.',
    'Internal tools for international teams',
    'Job type (permanent, fixed term, internship)',
  ])('finds no job type in: %s', (text) => {
    expect(jobTypes(text)).toEqual([]);
  });
});

describe('inferEmploymentEvidence', () => {
  it.each<[string, string[]]>([
    ['This is a full-time role.', ['full_time']],
    ['Full time, exempt', ['full_time']],
    ['This is a part-time position.', ['part_time']],
    ['Type: contract (part-time)', ['part_time']],
    ['Commitment: 10-20 hours per week', ['part_time']],
    ['Expected 40 hours per week', ['full_time']],
  ])('%s', (text, expected) => {
    expect(employment(text)).toEqual(expected);
  });

  it.each([
    'Full-time equivalent (FTE) headcount planning',
    'Refactor rather than full rewrites',
    'We often ship after review',
    'Full-time students are eligible',
  ])('finds no employment type in: %s', (text) => {
    expect(employment(text)).toEqual([]);
  });
});

describe('inferTextJobFacts', () => {
  it('combines every fact from an HTML description', () => {
    expect(
      inferTextJobFacts(
        '<p>This is a hybrid role (3 days a week in our SF office).</p><h3>Requirements</h3><ul><li>BS/MS in CS</li><li>3+ years of experience</li></ul><p>This is a full-time position.</p>',
      ),
    ).toEqual({
      workplaces: ['hybrid'],
      degreeLevels: ['bachelor', 'master'],
      minimumExperienceYears: 3,
      jobTypes: [],
      employmentTypes: ['full_time'],
    });
  });

  it('returns no facts for an empty description', () => {
    expect(inferTextJobFacts(null)).toEqual({
      workplaces: [],
      degreeLevels: [],
      minimumExperienceYears: null,
      jobTypes: [],
      employmentTypes: [],
    });
  });
});
