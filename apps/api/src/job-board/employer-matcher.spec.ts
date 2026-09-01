import {
  decideEmployerMatch,
  decideEmployerTokenMatch,
  normalizeEmployerTokenKey,
  type SponsorCandidate,
} from './employer-matcher';

type MatchCase = {
  sourceName: string;
  candidates: SponsorCandidate[];
  expectedId: string | null;
  expectedStatus: 'auto' | 'pending_review';
};

const exactCases: MatchCase[] = [
  ['Amazon.com Services LLC', 'amazon-com-services-llc'],
  [
    'COGNIZANT TECHNOLOGY SOLUTIONS US CORP',
    'cognizant-technology-solutions-us-corp',
  ],
  ['INFOSYS LIMITED', 'infosys-limited'],
  ['Microsoft Corporation', 'microsoft-corporation'],
  ['Ernst & Young U.S. LLP', 'ernst-young-u-s-llp'],
  ['TATA CONSULTANCY SERVICES LIMITED', 'tata-consultancy-services-limited'],
  ['DELOITTE CONSULTING LLP', 'deloitte-consulting-llp'],
  ['Google LLC', 'google-llc'],
  ['Apple Inc', 'apple-inc'],
  ['Accenture LLP', 'accenture-llp'],
  ['HCL AMERICA INC', 'hcl-america-inc'],
  ['JPMorgan Chase & Co.', 'jpmorgan-chase-co'],
  ['CAPGEMINI AMERICA INC', 'capgemini-america-inc'],
  ['WIPRO LIMITED', 'wipro-limited'],
  ['LTIMindtree Limited', 'ltimindtree-limited'],
  ['IBM Corporation', 'ibm-corporation'],
  ['NVIDIA Corporation', 'nvidia-corporation'],
].map(([sourceName, id]) => ({
  sourceName,
  candidates: [{ id, name: sourceName }],
  expectedId: id,
  expectedStatus: 'auto',
}));

const collisionCases: MatchCase[] = [
  {
    sourceName: 'Abbott Laboratories',
    candidates: [
      { id: 'abbott-laboratories', name: 'ABBOTT LABORATORIES' },
      { id: 'abbott-laboratories-inc', name: 'ABBOTT LABORATORIES INC.' },
    ],
    expectedId: null,
    expectedStatus: 'pending_review',
  },
  {
    sourceName: 'Aktana',
    candidates: [
      { id: 'aktana', name: 'Aktana' },
      { id: 'aktana-inc', name: 'Aktana Inc' },
    ],
    expectedId: null,
    expectedStatus: 'pending_review',
  },
  {
    sourceName: 'AlixPartners',
    candidates: [
      { id: 'alixpartners-llc', name: 'AlixPartners, LLC' },
      { id: 'alixpartners-llp', name: 'AlixPartners, LLP' },
    ],
    expectedId: null,
    expectedStatus: 'pending_review',
  },
];

describe('employer matcher', () => {
  it('resolves or flags all 20 Step 2 test-set companies without a silent collision match', () => {
    const cases = [...exactCases, ...collisionCases];
    expect(cases).toHaveLength(20);

    for (const testCase of cases) {
      const decision = decideEmployerMatch(
        testCase.sourceName,
        testCase.candidates,
      );
      expect(decision.canonicalH1bSponsorId).toBe(testCase.expectedId);
      expect(decision.reviewStatus).toBe(testCase.expectedStatus);
    }
  });

  it('collapses token and legal-name variants without weakening collisions', () => {
    expect(normalizeEmployerTokenKey('ambiqmicroinc')).toBe('ambiqmicro');
    expect(normalizeEmployerTokenKey('ambiq-micro')).toBe('ambiqmicro');
    expect(normalizeEmployerTokenKey('AMBIQ MICRO, INC.')).toBe('ambiqmicro');
    expect(
      decideEmployerTokenMatch('ambiqmicroinc', [
        { id: 'ambiq', name: 'AMBIQ MICRO, INC.' },
      ]),
    ).toMatchObject({
      canonicalH1bSponsorId: 'ambiq',
      confidence: 0.99,
      reviewStatus: 'auto',
    });
    expect(
      decideEmployerTokenMatch('ambiqmicroinc', [
        { id: 'a', name: 'Ambiq Micro, Inc.' },
        { id: 'b', name: 'Ambiq Micro LLC' },
      ]),
    ).toMatchObject({
      canonicalH1bSponsorId: null,
      confidence: 0,
      reviewStatus: 'pending_review',
    });
    // `co` can be part of a brand token; do not turn BrainCo into Brain.
    expect(normalizeEmployerTokenKey('brainco')).toBe('brainco');
    expect(
      decideEmployerTokenMatch('brainco', [
        { id: 'brain-corporation', name: 'Brain Corporation' },
      ]),
    ).toMatchObject({
      canonicalH1bSponsorId: null,
      confidence: 0,
      reviewStatus: 'pending_review',
    });
  });
});
