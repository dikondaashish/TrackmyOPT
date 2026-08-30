import { describe, expect, it } from 'vitest';
import { findActiveTrackerStatus, inferJobFacts, isWithinDateRange, type JobDateWindow } from './filters';

describe('isWithinDateRange', () => {
  const asOf = new Date('2030-02-01T12:00:00.000Z');

  it.each<[JobDateWindow, string, string]>([
    ['1h', '2030-02-01T11:00:00.000Z', '2030-02-01T10:59:59.999Z'],
    ['6h', '2030-02-01T06:00:00.000Z', '2030-02-01T05:59:59.999Z'],
    ['12h', '2030-02-01T00:00:00.000Z', '2030-01-31T23:59:59.999Z'],
    ['24h', '2030-01-31T12:00:00.000Z', '2030-01-31T11:59:59.999Z'],
    ['48h', '2030-01-30T12:00:00.000Z', '2030-01-30T11:59:59.999Z'],
    ['7d', '2030-01-25T12:00:00.000Z', '2030-01-25T11:59:59.999Z'],
    ['30d', '2030-01-02T12:00:00.000Z', '2030-01-02T11:59:59.999Z'],
  ])('uses an inclusive %s window', (window, boundary, outside) => {
    expect(isWithinDateRange(boundary, window, asOf)).toBe(true);
    expect(isWithinDateRange(outside, window, asOf)).toBe(false);
  });

  it('rejects future and invalid posting timestamps', () => {
    expect(isWithinDateRange('2030-02-01T12:00:00.001Z', '1h', asOf)).toBe(false);
    expect(isWithinDateRange('not-a-date', '1h', asOf)).toBe(false);
    expect(isWithinDateRange(null, '1h', asOf)).toBe(false);
  });
});

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
