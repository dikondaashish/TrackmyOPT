export const ATS_DOMAINS: Record<string, string> = {
  ashby: 'ashbyhq.com',
  greenhouse: 'greenhouse.com',
};

export function domainFromWebsite(website: string | null | undefined) {
  if (!website?.trim()) return null;
  try {
    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(normalized).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

export function companyLogoUrl(domain: string | null | undefined) {
  if (!domain) return null;
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
}

/** High-res logo candidates for marketing/offer cards (Clearbit brand mark → Google favicon). */
export function brandLogoCandidates(domain: string | null | undefined): string[] {
  if (!domain) return [];
  const clearbitBlocked =
    typeof window !== 'undefined' && localStorage.getItem('trackmyopt_clearbit_blocked') === 'true';
  const candidates = [
    `https://logo.clearbit.com/${domain}`,
    companyLogoUrl(domain),
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
  ].filter((url): url is string => Boolean(url));
  return clearbitBlocked ? candidates.slice(1) : candidates;
}

export function atsSourceName(sourceAts: string) {
  return sourceAts.charAt(0).toUpperCase() + sourceAts.slice(1).toLowerCase();
}
