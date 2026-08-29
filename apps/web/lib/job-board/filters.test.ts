import { describe, expect, it } from 'vitest';
import { findActiveTrackerStatus, inferJobFacts } from './filters';

describe('findActiveTrackerStatus', () => {
  it('ignores archived matches and normalizes harmless URL differences', () => {
    const status = findActiveTrackerStatus(
      {
        title: 'Data Engineer',
        company_name: 'Example, Inc.',
        employer_board_name: 'Example',
        job_url: 'https://jobs.example.com/roles/123/',
      },
      [
        {
          job_url: 'https://jobs.example.com/roles/123',
          company_name: 'Example, Inc.',
          role_title: 'Data Engineer',
          status: 'Interviewing',
          is_archived: true,
        },
        {
          job_url: 'https://jobs.example.com/roles/123',
          company_name: 'Example, Inc.',
          role_title: 'Data Engineer',
          status: 'Wishlist',
          is_archived: false,
        },
      ],
    );

    expect(status).toBe('Wishlist');
  });

  it('uses normalized company and title only when a listing has no URL', () => {
    expect(findActiveTrackerStatus(
      {
        title: '  DATA   ENGINEER ',
        company_name: 'EXAMPLE, INC.',
        employer_board_name: 'Example',
        job_url: null,
      },
      [{
        job_url: null,
        company_name: 'Example, Inc.',
        role_title: 'Data Engineer',
        status: 'Applied',
        is_archived: null,
      }],
    )).toBe('Applied');
  });
});

describe('inferJobFacts', () => {
  it('prefers an explicit ATS location over incidental workplace wording', () => {
    const facts = inferJobFacts({
      title: 'Software Engineer',
      company_name: 'Example, Inc.',
      employer_board_name: 'Example',
      location: 'Remote — United States',
      department: 'Engineering',
      description: "Our hybrid company requires a Bachelor’s or M.S. degree and four years of experience.",
      posted_at: '2026-08-29T12:00:00.000Z',
      tracker_status: null,
      employer_match: null,
      visa_signals: [],
    });

    expect(facts).toMatchObject({
      workplace: 'remote',
      degreeLevels: ['bachelor', 'master'],
      minimumExperienceYears: 4,
      experience: 'mid',
      roles: ['engineering'],
      jobType: 'unspecified',
    });
  });
});
