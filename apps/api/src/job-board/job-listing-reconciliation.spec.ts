import { planListingReconciliation } from './job-listing-reconciliation';

describe('job listing reconciliation', () => {
  const jobs = [
    {
      id: 'open-current',
      external_job_id: 'current',
      listing_status: 'open' as const,
    },
    {
      id: 'open-missing',
      external_job_id: 'missing-once',
      listing_status: 'open' as const,
    },
    {
      id: 'stale-missing',
      external_job_id: 'missing-twice',
      listing_status: 'stale' as const,
    },
    {
      id: 'stale-current',
      external_job_id: 'returned',
      listing_status: 'stale' as const,
    },
    {
      id: 'removed-current',
      external_job_id: 'relisted',
      listing_status: 'removed' as const,
    },
    {
      id: 'removed-missing',
      external_job_id: 'still-gone',
      listing_status: 'removed' as const,
    },
  ];

  it('drops a first absence as stale and confirms removal on the next absence', () => {
    expect(
      planListingReconciliation(jobs, ['current', 'returned', 'relisted']),
    ).toEqual({
      staleJobIds: ['open-missing'],
      removedJobIds: ['stale-missing'],
      reopenedJobIds: ['stale-current', 'removed-current'],
    });
  });

  it('does not transition any listing when every persisted job is still present', () => {
    expect(planListingReconciliation(jobs.slice(0, 1), ['current'])).toEqual({
      staleJobIds: [],
      removedJobIds: [],
      reopenedJobIds: [],
    });
  });
});
