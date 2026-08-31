export const DEFAULT_CAREER_PATHS = [
  '/careers',
  '/career',
  '/jobs',
  '/job',
  '/about/careers',
  '/company/careers',
  '/en/careers',
  '/careers/jobs',
  '/work-with-us',
  '/join-us',
] as const;

export type BoardOwnershipEvidence = {
  confidence: number;
  companyNameMatch: boolean;
  websiteMatch: boolean;
  domainMatch: boolean;
  careersLinkMatch: boolean;
  brandingMatch: boolean;
  reasons: string[];
};

type CareerCandidateInput = {
  website: string;
  domain: string;
  careersUrl?: string | null;
  limit?: number;
};

type OwnershipInput = {
  companyName: string;
  companyDomain: string;
  companyWebsite: string;
  discoveredOnOfficialCareerPage: boolean;
  boardHtml: string;
};

type RobotsGroup = {
  agents: string[];
  rules: Array<{ allow: boolean; path: string }>;
};

export type CompanyDiscoverySeed = {
  id: string;
  name: string;
  website: string;
  domain: string;
  careersUrl?: string | null;
};

export type DiscoveryPage = {
  finalUrl: string;
  body: string;
};

export type DiscoveryPageFetcher = (
  url: string,
) => Promise<DiscoveryPage | null>;

function safeHttpsUrl(value: string, base?: string) {
  try {
    const url = base ? new URL(value, base) : new URL(value);
    if (url.protocol !== 'https:') return null;
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

function normalizedDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/\.$/, '');
}

function isCompanyHost(hostname: string, companyDomain: string) {
  const host = normalizedDomain(hostname);
  const domain = normalizedDomain(companyDomain);
  return host === domain || host.endsWith(`.${domain}`);
}

function isLikelyCareerLink(value: string, companyDomain: string) {
  const ats = detectAtsBoardFromUrl(value);
  if (ats) return true;
  const url = safeHttpsUrl(value);
  if (!url || !isCompanyHost(url.hostname, companyDomain)) return false;
  return (
    /(^|[-.])(careers?|jobs?)\./i.test(`${url.hostname}.`) ||
    /\/(careers?|jobs?|join-us|work-with-us)(?:\/|$)/i.test(url.pathname)
  );
}

export function buildCareerPageCandidates(input: CareerCandidateInput) {
  const limit = Math.max(1, Math.min(input.limit ?? 12, 16));
  const domain = normalizedDomain(input.domain);
  const website = safeHttpsUrl(input.website);
  if (!website || !domain || !isCompanyHost(website.hostname, domain))
    return [];

  const candidates: string[] = [];
  const add = (value: string) => {
    const url = safeHttpsUrl(value);
    if (!url || candidates.includes(url.toString())) return;
    candidates.push(url.toString());
  };

  if (input.careersUrl) add(input.careersUrl);
  add(`https://careers.${domain}/`);
  add(`https://jobs.${domain}/`);
  for (const path of DEFAULT_CAREER_PATHS) {
    add(`https://${domain}${path}`);
  }
  return candidates.slice(0, limit);
}

export function extractDiscoverableLinks(html: string, pageUrl: string) {
  const links: string[] = [];
  const matches = html.matchAll(
    /\b(?:href|src|action)\s*=\s*(["'])(?<url>.*?)\1/gi,
  );
  for (const match of matches) {
    const raw = match.groups?.url?.replace(/&amp;/gi, '&').trim();
    if (!raw) continue;
    const url = safeHttpsUrl(raw, pageUrl);
    if (!url) continue;
    const normalized = url.toString();
    if (!links.includes(normalized)) links.push(normalized);
  }
  return links;
}

function parseRobotsGroups(robots: string) {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  for (const sourceLine of robots.split(/\r?\n/)) {
    const line = sourceLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (directive === 'user-agent') {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if (!current || (directive !== 'allow' && directive !== 'disallow')) {
      continue;
    }
    if (!value && directive === 'disallow') continue;
    current.rules.push({ allow: directive === 'allow', path: value });
  }
  return groups;
}

function robotsRuleMatches(pathname: string, rule: string) {
  if (!rule) return true;
  const endAnchored = rule.endsWith('$');
  const source = (endAnchored ? rule.slice(0, -1) : rule)
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${source}${endAnchored ? '$' : ''}`).test(pathname);
}

export function isPathAllowedByRobots(
  robots: string,
  pathname: string,
  userAgent = 'TrackMyOPTJobDiscovery',
) {
  const groups = parseRobotsGroups(robots);
  const agent = userAgent.toLowerCase();
  const exact = groups.filter((group) =>
    group.agents.some(
      (candidate) => candidate !== '*' && agent.includes(candidate),
    ),
  );
  const applicable = exact.length
    ? exact
    : groups.filter((group) => group.agents.includes('*'));
  const matching = applicable
    .flatMap((group) => group.rules)
    .filter((rule) => robotsRuleMatches(pathname, rule.path))
    .sort((left, right) => right.path.length - left.path.length);
  return matching[0]?.allow ?? true;
}

function normalizedCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, ' and ')
    .replace(
      /\b(incorporated|corporation|company|limited|inc|corp|llc|ltd)\b/g,
      '',
    )
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizedText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function evaluateBoardOwnership(
  input: OwnershipInput,
): BoardOwnershipEvidence {
  const companyName = normalizedCompanyName(input.companyName);
  const text = normalizedText(input.boardHtml);
  const links = extractDiscoverableLinks(input.boardHtml, input.companyWebsite);
  const website = safeHttpsUrl(input.companyWebsite);
  const companyNameMatch = Boolean(companyName && text.includes(companyName));
  const websiteMatch = Boolean(
    website &&
      links.some(
        (link) =>
          new URL(link).origin === website.origin &&
          new URL(link).pathname.replace(/\/$/, '') ===
            website.pathname.replace(/\/$/, ''),
      ),
  );
  const domainMatch = links.some((link) =>
    isCompanyHost(new URL(link).hostname, input.companyDomain),
  );
  const careersLinkMatch = input.discoveredOnOfficialCareerPage;
  const brandMarkup = [
    ...input.boardHtml.matchAll(
      /<(?:title|h1)\b[^>]*>(?<value>[\s\S]*?)<\/(?:title|h1)>/gi,
    ),
    ...input.boardHtml.matchAll(
      /\b(?:alt|aria-label)\s*=\s*(["'])(?<value>.*?)\1/gi,
    ),
  ]
    .map((match) => normalizedText(match.groups?.value || ''))
    .join(' ');
  const brandingMatch = Boolean(
    companyName && brandMarkup.includes(companyName),
  );
  const evidence = [
    { matched: companyNameMatch, weight: 0.25, reason: 'company_name_match' },
    { matched: websiteMatch, weight: 0.25, reason: 'official_website_link' },
    { matched: domainMatch, weight: 0.25, reason: 'official_domain_link' },
    { matched: careersLinkMatch, weight: 0.2, reason: 'official_careers_link' },
    { matched: brandingMatch, weight: 0.05, reason: 'company_branding_match' },
  ];
  return {
    confidence: Number(
      evidence
        .filter((item) => item.matched)
        .reduce((sum, item) => sum + item.weight, 0)
        .toFixed(3),
    ),
    companyNameMatch,
    websiteMatch,
    domainMatch,
    careersLinkMatch,
    brandingMatch,
    reasons: evidence.filter((item) => item.matched).map((item) => item.reason),
  };
}

export function planBoardCandidate(input: {
  platformAuthorization: 'approved' | 'pending_review' | 'blocked';
  ownership: BoardOwnershipEvidence;
}) {
  let queueReason = 'insufficient_company_ownership_evidence';
  if (input.platformAuthorization !== 'approved') {
    queueReason = 'ats_policy_review_required';
  } else if (input.ownership.confidence >= 0.9) {
    queueReason = 'ready_for_explicit_verification';
  }
  return {
    verificationStatus: 'pending_verification' as const,
    activationAllowed: false,
    queueReason,
  };
}

type DiscoveredBoardCandidate = AtsBoardIdentity &
  ReturnType<typeof planBoardCandidate> & {
    ownership: BoardOwnershipEvidence;
    discoveredOnUrl: string;
  };

export async function discoverCompanyBoards(
  company: CompanyDiscoverySeed,
  fetchPage: DiscoveryPageFetcher,
  platformAuthorization: Partial<
    Record<PriorityAtsPlatform, 'approved' | 'pending_review' | 'blocked'>
  >,
  candidateLimit = 8,
) {
  const website = safeHttpsUrl(company.website);
  if (!website || !isCompanyHost(website.hostname, company.domain)) {
    return { careerPageUrl: null, boards: [] as DiscoveredBoardCandidate[] };
  }

  const homepageUrl = website.origin + '/';
  const homepage = await fetchPage(homepageUrl);
  const homepageCareerLinks = homepage
    ? extractDiscoverableLinks(homepage.body, homepage.finalUrl).filter(
        (link) => isLikelyCareerLink(link, company.domain),
      )
    : [];
  const candidates = [
    ...homepageCareerLinks,
    ...buildCareerPageCandidates({
      website: company.website,
      domain: company.domain,
      careersUrl: company.careersUrl,
      limit: 16,
    }),
  ]
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, Math.max(1, Math.min(candidateLimit, 16)));

  const boards = new Map<string, DiscoveredBoardCandidate>();
  let careerPageUrl: string | null = null;
  for (const candidateUrl of candidates) {
    const page = await fetchPage(candidateUrl);
    if (!page) continue;
    const direct = detectAtsBoardFromUrl(page.finalUrl);
    const detected = [
      ...(direct ? [direct] : []),
      ...detectAtsBoardsInHtml(page.body),
    ];
    if (!detected.length) continue;
    careerPageUrl ??= candidateUrl;
    const sourceUrl = safeHttpsUrl(candidateUrl);
    const foundOnOfficialCareerPage = Boolean(
      sourceUrl && isCompanyHost(sourceUrl.hostname, company.domain),
    );

    for (const identity of detected) {
      const key = `${identity.platform}:${identity.boardToken}`;
      if (boards.has(key)) continue;
      const boardPage = direct
        ? page
        : ((await fetchPage(identity.boardUrl)) ?? page);
      const ownership = evaluateBoardOwnership({
        companyName: company.name,
        companyDomain: company.domain,
        companyWebsite: company.website,
        discoveredOnOfficialCareerPage: foundOnOfficialCareerPage,
        boardHtml: boardPage.body,
      });
      const plan = planBoardCandidate({
        platformAuthorization:
          platformAuthorization[identity.platform] ?? 'pending_review',
        ownership,
      });
      boards.set(key, {
        ...identity,
        ...plan,
        ownership,
        discoveredOnUrl: candidateUrl,
      });
    }
  }

  return { careerPageUrl, boards: [...boards.values()] };
}
import {
  detectAtsBoardFromUrl,
  detectAtsBoardsInHtml,
  type AtsBoardIdentity,
  type PriorityAtsPlatform,
} from './ats-platform.registry';
