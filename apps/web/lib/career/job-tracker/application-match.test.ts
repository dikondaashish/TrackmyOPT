import { describe, expect, it } from 'vitest';
import { findSimilarApplication } from './application-match';

const applications = [
  {
    id: 'exact-current',
    company_name: 'Stripe, Inc.',
    role_title: 'Frontend Engineer',
    job_url: 'https://jobs.example.com/current',
    status: 'Applied',
    applied_at: '2026-06-01',
    created_at: '2026-06-01T12:00:00Z',
  },
  {
    id: 'similar',
    company_name: 'Stripe Inc',
    role_title: 'Senior Front-End Developer',
    job_url: 'https://jobs.example.com/older',
    status: 'Applied',
    applied_at: '2026-05-03',
    created_at: '2026-05-03T12:00:00Z',
  },
  {
    id: 'wrong-role',
    company_name: 'Stripe',
    role_title: 'Data Engineer',
    job_url: 'https://jobs.example.com/data',
    status: 'Interviewing',
    applied_at: '2026-04-20',
    created_at: '2026-04-20T12:00:00Z',
  },
  {
    id: 'wishlist-only',
    company_name: 'Stripe',
    role_title: 'Frontend Software Engineer',
    job_url: 'https://jobs.example.com/wishlist',
    status: 'Wishlist',
    applied_at: null,
    created_at: '2026-06-10T12:00:00Z',
  },
];

describe('findSimilarApplication', () => {
  it('matches company suffix variants and semantically similar role titles', () => {
    expect(findSimilarApplication(applications, {
      companyName: 'Stripe',
      roleTitle: 'Frontend Engineer',
      currentJobUrl: 'https://jobs.example.com/current',
    })).toMatchObject({
      roleTitle: 'Senior Front-End Developer',
      companyName: 'Stripe Inc',
      appliedAt: '2026-05-03',
    });
  });

  it('does not warn for a different role family or a Wishlist-only save', () => {
    expect(findSimilarApplication(applications, {
      companyName: 'Stripe',
      roleTitle: 'Product Manager',
    })).toBeNull();
  });
});
