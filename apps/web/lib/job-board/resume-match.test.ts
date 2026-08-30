import { describe, expect, it } from 'vitest';
import {
  extractResumeProfileFallback,
  parseResumeJobProfile,
  scoreJobForResume,
  type ResumeJobProfile,
} from './resume-match';
import { inferJobFacts, type FilterableJob } from './filters';

const profile: ResumeJobProfile = {
  schemaVersion: 1,
  roleTitles: ['Software Engineer', 'Backend Engineer'],
  skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
  certifications: [],
  education: [{ level: 'master', field: 'Computer Science' }],
  yearsExperience: 4,
};

function job(overrides: Partial<FilterableJob>): FilterableJob {
  return {
    title: 'Backend Software Engineer',
    company_name: 'Example, Inc.',
    employer_board_name: 'Example',
    location: 'Remote, United States',
    department: 'Engineering',
    description: "Build Node.js and TypeScript services on AWS with PostgreSQL. Bachelor's degree and 3 years of experience required.",
    posted_at: '2026-08-29T12:00:00.000Z',
    tracker_status: null,
    employer_match: null,
    visa_signals: [],
    ...overrides,
  };
}

describe('resume job profile', () => {
  it('accepts bounded qualification data but rejects unexpected personal fields', () => {
    expect(parseResumeJobProfile(profile)).toEqual(profile);
    expect(parseResumeJobProfile({ ...profile, email: 'person@example.com' })).toBeNull();
  });

  it('extracts a usable deterministic fallback when AI is unavailable', () => {
    const extracted = extractResumeProfileFallback(`
      BACKEND ENGINEER
      4 years of experience building TypeScript and Node.js APIs with PostgreSQL and AWS.
      Education: Master of Science in Computer Science
      Certification: AWS Certified Developer
    `);

    expect(extracted.roleTitles).toContain('Backend Engineer');
    expect(extracted.skills).toEqual(expect.arrayContaining(['TypeScript', 'Node.js', 'PostgreSQL', 'AWS']));
    expect(extracted.yearsExperience).toBe(4);
    expect(extracted.education).toContainEqual({ level: 'master', field: 'Computer Science' });
  });
});

describe('explainable resume matching', () => {
  it('ranks a role with matching skills, title, experience, and education above an unrelated role', () => {
    const strongJob = job({});
    const unrelatedJob = job({
      title: 'Account Executive',
      department: 'Sales',
      description: 'Sell enterprise contracts. Six years of quota-carrying sales experience required.',
    });

    const strong = scoreJobForResume(profile, strongJob, inferJobFacts(strongJob));
    const unrelated = scoreJobForResume(profile, unrelatedJob, inferJobFacts(unrelatedJob));

    expect(strong.score).toBeGreaterThanOrEqual(80);
    expect(strong.score).toBeGreaterThan(unrelated.score + 40);
    expect(strong.matchedSkills).toEqual(expect.arrayContaining(['TypeScript', 'Node.js', 'PostgreSQL', 'AWS']));
    expect(strong.reasons.join(' ')).toMatch(/skills|experience/i);
  });

  it('does not change the resume match score based on sponsorship evidence', () => {
    const withoutEvidence = job({ employer_match: null, visa_signals: [] });
    const withEvidence = job({
      employer_match: { canonical_h1b_sponsor_id: 'sponsor-1', review_status: 'confirmed' },
      visa_signals: [{ signal_type: 'historical_h1b_filing' }],
    });

    expect(scoreJobForResume(profile, withoutEvidence, inferJobFacts(withoutEvidence)).score)
      .toBe(scoreJobForResume(profile, withEvidence, inferJobFacts(withEvidence)).score);
  });

  it('treats job skills absent from the resume as gaps without penalizing unrelated extra resume skills', () => {
    const targetedProfile = { ...profile, skills: [...profile.skills, 'Figma', 'Tableau', 'Excel'] };
    const role = job({ description: 'Build TypeScript and Node.js APIs with PostgreSQL, AWS, and Docker.' });
    const match = scoreJobForResume(targetedProfile, role, inferJobFacts(role));

    expect(match.matchedSkills).toEqual(expect.arrayContaining(['TypeScript', 'Node.js', 'PostgreSQL', 'AWS']));
    expect(match.missingSkills).toContain('Docker');
    expect(match.missingSkills).not.toContain('Figma');
    expect(match.score).toBeGreaterThanOrEqual(75);
  });
});
