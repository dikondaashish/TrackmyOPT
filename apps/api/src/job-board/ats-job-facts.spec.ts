import {
  smartRecruitersJobFacts,
  leverJobFacts,
  ashbyJobFacts,
  greenhouseJobFacts,
  normalizeAtsJobFacts,
} from './ats-job-facts';

describe('ashbyJobFacts', () => {
  it.each([
    ['Remote', true, 'remote'],
    ['Hybrid', true, 'hybrid'],
    ['OnSite', false, 'on_site'],
    [null, true, 'remote'],
    [null, false, null],
    [null, null, null],
  ])(
    'workplaceType %s / isRemote %s -> %s',
    (workplaceType, isRemote, want) => {
      expect(ashbyJobFacts({ workplaceType, isRemote }).workplace).toBe(want);
    },
  );

  it.each([
    ['FullTime', ['full_time']],
    ['PartTime', ['part_time']],
    ['Intern', ['internship']],
    ['Contract', ['contract']],
    ['Temporary', ['temporary']],
    ['Unknown', []],
    [undefined, []],
  ])('employmentType %s', (employmentType, want) => {
    expect(ashbyJobFacts({ employmentType }).employmentTypes).toEqual(want);
  });
});

describe('greenhouseJobFacts', () => {
  const facts = (metadata: { name: string; value: unknown }[]) =>
    greenhouseJobFacts(metadata);

  it('reads workplace fields by name, as seen on production boards', () => {
    expect(facts([{ name: 'Location Type', value: 'On-Site' }]).workplace).toBe(
      'on_site',
    );
    expect(
      facts([{ name: 'Location Type', value: 'Hybrid (Travel-Required)' }])
        .workplace,
    ).toBe('hybrid');
    expect(facts([{ name: 'Workplace Type', value: 'Onsite' }]).workplace).toBe(
      'on_site',
    );
    expect(
      facts([{ name: 'Remote Options', value: 'Remote within single state' }])
        .workplace,
    ).toBe('remote');
    expect(facts([{ name: 'Remote job', value: true }]).workplace).toBe(
      'remote',
    );
    // "Remote job: false" does not say on-site or hybrid.
    expect(facts([{ name: 'Remote job', value: false }]).workplace).toBeNull();
  });

  it('ignores unrelated fields and conflicting values', () => {
    expect(
      facts([
        { name: 'Job Family', value: 'Remote Support' },
        { name: 'Career Level', value: 'Part-time' },
        { name: 'Job Type', value: 'National' },
      ]),
    ).toEqual({ workplace: null, employmentTypes: [] });
    expect(
      facts([
        { name: 'Location Type', value: 'Remote' },
        { name: 'Workplace Type', value: 'Onsite' },
      ]).workplace,
    ).toBeNull();
    expect(greenhouseJobFacts(null)).toEqual({
      workplace: null,
      employmentTypes: [],
    });
  });

  it.each<[string, string, string[]]>([
    ['Employment Type', 'Full-time', ['full_time']],
    ['Employment Type', 'FT', ['full_time']],
    ['Full or Part Time', 'Part Time', ['part_time']],
    ['Schedule Type', 'PRN', []],
    ['Employment Type', 'Class 3', []],
    ['Worker Type', 'Contingent Worker', ['contract']],
    ['Worker Sub-Type', 'Fixed Term (Fixed Term)', ['temporary']],
    ['Employment Sub-Type', 'Regular Employee', ['permanent']],
  ])('%s: %s', (name, value, want) => {
    expect(facts([{ name, value }]).employmentTypes).toEqual(want);
  });
});

describe('normalizeAtsJobFacts', () => {
  it('keeps only known values in a stable order', () => {
    expect(
      normalizeAtsJobFacts('remote', ['contract', 'bogus', 'full_time']),
    ).toEqual({
      workplace: 'remote',
      employmentTypes: ['full_time', 'contract'],
    });
    expect(normalizeAtsJobFacts('moon', undefined)).toEqual({
      workplace: null,
      employmentTypes: [],
    });
  });
});

describe('leverJobFacts', () => {
  it.each([
    [
      { workplaceType: 'onsite', categories: { commitment: 'Intern' } },
      { workplace: 'on_site', employmentTypes: ['internship'] },
    ],
    [
      { workplaceType: 'remote', categories: { commitment: 'Full-time' } },
      { workplace: 'remote', employmentTypes: ['full_time'] },
    ],
    [
      { workplaceType: 'unspecified', categories: { commitment: 'Contract' } },
      { workplace: null, employmentTypes: ['contract'] },
    ],
    [{}, { workplace: null, employmentTypes: [] }],
  ])('maps %j', (item, facts) => {
    expect(leverJobFacts(item)).toEqual(facts);
  });
});

describe('smartRecruitersJobFacts', () => {
  it('reads remote/hybrid flags and the employment label', () => {
    expect(
      smartRecruitersJobFacts({
        location: { hybrid: true },
        typeOfEmployment: { label: 'Full-time' },
      }),
    ).toEqual({ workplace: 'hybrid', employmentTypes: ['full_time'] });
    expect(
      smartRecruitersJobFacts({
        location: { remote: true },
        typeOfEmployment: { label: 'Intern' },
      }),
    ).toEqual({ workplace: 'remote', employmentTypes: ['internship'] });
    // No flag is not evidence of an on-site job.
    expect(smartRecruitersJobFacts({ location: {} })).toEqual({
      workplace: null,
      employmentTypes: [],
    });
  });
});
