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

export function atsSourceName(sourceAts: string) {
  return sourceAts.charAt(0).toUpperCase() + sourceAts.slice(1).toLowerCase();
}
