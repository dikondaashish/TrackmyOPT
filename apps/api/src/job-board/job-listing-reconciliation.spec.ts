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
      planListingReconciliation(jobs, ['current', 'returned', 'relisted'], {
        complete: true,
      }),
    ).toEqual({
      staleJobIds: ['open-missing'],
      removedJobIds: ['stale-missing'],
      reopenedJobIds: ['stale-current', 'removed-current'],
    });
  });

  it('does not transition any listing when every persisted job is still present', () => {
    expect(
      planListingReconciliation(jobs.slice(0, 1), ['current'], {
        complete: true,
      }),
    ).toEqual({
      staleJobIds: [],
      removedJobIds: [],
      reopenedJobIds: [],
    });
  });

  it('rejects an incomplete response before changing lifecycle state', () => {
    expect(() =>
      planListingReconciliation(jobs, ['current'], { complete: false }),
    ).toThrow('not complete');
  });

  it('treats an empty response against existing jobs as ambiguous', () => {
    expect(() =>
      planListingReconciliation(jobs, [], { complete: true }),
    ).toThrow('Ambiguous empty ATS response');
    expect(jobs.map((job) => job.listing_status)).toEqual([
      'open',
      'open',
      'stale',
      'stale',
      'removed',
      'removed',
    ]);
  });

  it('moves a genuinely missing listing from open to stale, then removed on the next complete board run', () => {
    const firstRun = planListingReconciliation(
      [
        {
          id: 'keep',
          external_job_id: 'keep',
          listing_status: 'open' as const,
        },
        {
          id: 'gone',
          external_job_id: 'gone',
          listing_status: 'open' as const,
        },
      ],
      ['keep'],
      { complete: true },
    );
    expect(firstRun).toEqual({
      staleJobIds: ['gone'],
      removedJobIds: [],
      reopenedJobIds: [],
    });

    const secondRun = planListingReconciliation(
      [
        {
          id: 'keep',
          external_job_id: 'keep',
          listing_status: 'open' as const,
        },
        {
          id: 'gone',
          external_job_id: 'gone',
          listing_status: 'stale' as const,
        },
      ],
      ['keep'],
      { complete: true },
    );
    expect(secondRun).toEqual({
      staleJobIds: [],
      removedJobIds: ['gone'],
      reopenedJobIds: [],
    });
  });
});
