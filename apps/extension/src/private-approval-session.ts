import {
  jobUrlsReferToSameJob,
  normalizeJobIdentityText,
  normalizeJobUrl,
  type JobContextIdentity,
} from './resume-autofill-contract';

export interface PrivateApprovalBinding extends JobContextIdentity {
  fingerprint: string;
}

function fingerprintFor(identity: JobContextIdentity): string {
  return [
    normalizeJobUrl(identity.jobUrl),
    normalizeJobIdentityText(identity.companyName),
    normalizeJobIdentityText(identity.roleTitle),
  ].join('|');
}

/** Bind private-answer and credential approval to one reviewed application. */
export function createPrivateApprovalBinding(
  identity: JobContextIdentity,
): PrivateApprovalBinding {
  return {
    ...identity,
    fingerprint: fingerprintFor(identity),
  };
}

/** URL-only guard used immediately when an SPA changes location. */
export function approvalMatchesUrl(
  binding: PrivateApprovalBinding,
  nextUrl: string,
): boolean {
  return jobUrlsReferToSameJob(binding.jobUrl, nextUrl);
}

/** Full guard used once the new page's company and role are available. */
export function approvalMatchesJob(
  binding: PrivateApprovalBinding,
  identity: JobContextIdentity,
): boolean {
  return (
    jobUrlsReferToSameJob(binding.jobUrl, identity.jobUrl) &&
    normalizeJobIdentityText(binding.companyName) ===
      normalizeJobIdentityText(identity.companyName) &&
    normalizeJobIdentityText(binding.roleTitle) ===
      normalizeJobIdentityText(identity.roleTitle)
  );
}
