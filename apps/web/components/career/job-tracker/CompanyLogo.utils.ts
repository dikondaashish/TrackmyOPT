import {
  employerLogoDomain,
  normalizeCompanyDomain,
} from '@/lib/company-domain';

// Job-board URLs identify the posting service, not the hiring company.
const POSTING_HOSTS = [
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'ziprecruiter.com',
  'wellfound.com',
  'greenhouse.io',
  'greenhouse.com',
  'lever.co',
  'ashbyhq.com',
  'myworkdayjobs.com',
  'workdayjobs.com',
  'smartrecruiters.com',
  'icims.com',
  'jobvite.com',
  'workable.com',
  'bamboohr.com',
];

export function trackerLogoDomain(companyName: string, jobUrl?: string | null) {
  const knownDomain = employerLogoDomain(companyName);
  if (knownDomain) return knownDomain;
  const host = normalizeCompanyDomain(jobUrl);
  if (
    !host ||
    POSTING_HOSTS.some(
      (postingHost) => host === postingHost || host.endsWith(`.${postingHost}`)
    )
  )
    return null;
  const nameKey = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const belongsToCompany = host
    .split('.')
    .slice(0, -1)
    .some((label) => {
      const key = label.replace(/[^a-z0-9]/g, '');
      return key.length >= 3 && nameKey.includes(key);
    });
  return belongsToCompany ? host : null;
}
