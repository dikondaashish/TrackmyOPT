export type PersistedJobListing = {
  id: string;
  external_job_id: string;
  listing_status: 'open' | 'stale' | 'removed';
};

export type ListingReconciliationPlan = {
  staleJobIds: string[];
  removedJobIds: string[];
  reopenedJobIds: string[];
};

/**
 * Plans lifecycle transitions after a successful, authoritative full-board fetch.
 * Missing open jobs leave the active feed immediately as stale; a second
 * consecutive absence marks them removed. Reappearing jobs return to open.
 */
export function planListingReconciliation(
  persistedJobs: PersistedJobListing[],
  currentExternalJobIds: Iterable<string>,
  response: { complete: boolean },
): ListingReconciliationPlan {
  if (!response.complete) {
    throw new Error('ATS response is not complete; reconciliation is unsafe');
  }
  const currentIds = new Set(currentExternalJobIds);
  if (persistedJobs.length > 0 && currentIds.size === 0) {
    throw new Error(
      'Ambiguous empty ATS response; existing listings were left unchanged',
    );
  }
  const plan: ListingReconciliationPlan = {
    staleJobIds: [],
    removedJobIds: [],
    reopenedJobIds: [],
  };

  for (const job of persistedJobs) {
    if (currentIds.has(job.external_job_id)) {
      if (job.listing_status !== 'open') plan.reopenedJobIds.push(job.id);
      continue;
    }

    if (job.listing_status === 'open') plan.staleJobIds.push(job.id);
    if (job.listing_status === 'stale') plan.removedJobIds.push(job.id);
  }

  return plan;
}
