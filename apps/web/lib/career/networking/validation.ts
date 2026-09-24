import { z } from 'zod';

export const BundleInputSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  companyDomain: z.string().trim().max(253).nullable().optional(),
  targetRole: z.string().trim().min(2).max(120),
  userIntent: z.string().trim().max(1000).default(''),
  idempotencyKey: z.string().uuid(),
}).strict();

export const DiscoverySchema = z.object({
  company: z.object({ name: z.string(), domain: z.string() }),
  contacts: z.array(z.object({
    name: z.string(),
    title: z.string(),
    company: z.string(),
    linkedinUrl: z.string(),
    relevanceReason: z.string(),
    evidence: z.array(z.object({ url: z.string(), title: z.string(), description: z.string() })),
  })).max(3),
});

export type ValidContact = {
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
  relevanceReason: string;
  evidence: Array<{ url: string; title: string; description: string }>;
};

export type GroundedSource = { uri: string; title: string; domain?: string };

const CachedDiscoverySchema = z.object({
  companyName: z.string().min(2).max(120),
  companyDomain: z.string().nullable(),
  contacts: z.array(z.object({
    name: z.string().min(2).max(120), title: z.string().min(2).max(120),
    company: z.string().min(2).max(120), linkedinUrl: z.string(),
    relevanceReason: z.string().min(2).max(300), evidence: z.array(z.object({
      url: z.string(), title: z.string(), description: z.string(),
    })).min(1).max(3),
  })).min(1).max(3),
});

export function parseCachedDiscovery(value: unknown, requestedCompany: string, requestedDomain: string | null) {
  const parsed = CachedDiscoverySchema.safeParse(value);
  if (!parsed.success || !companyMatches(requestedCompany, parsed.data.companyName) ||
    (requestedDomain && requestedDomain !== parsed.data.companyDomain)) return null;
  if (parsed.data.contacts.some((contact) =>
    normalizeLinkedInProfile(contact.linkedinUrl) !== contact.linkedinUrl ||
    !companyMatches(requestedCompany, contact.company) ||
    contact.evidence.some((item) => !safeSourceUrl(item.url)))) return null;
  return parsed.data;
}

export function normalizeLinkedInProfile(input: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== 'linkedin.com' && !hostname.endsWith('.linkedin.com')) return null;
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    const slug = url.pathname.match(/^\/in\/([a-zA-Z0-9][a-zA-Z0-9._-]{1,99})\/?$/i)?.[1];
    if (!slug || /^(profile|unknown|firstname-lastname|your-name|name|example|sample)$/i.test(slug)) return null;
    return `https://www.linkedin.com/in/${slug.toLowerCase()}`;
  } catch { return null; }
}

export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    const domain = url.hostname.toLowerCase().replace(/^www\./, '');
    return /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(domain) &&
      !domain.includes('..') && !url.username && !url.password && !url.port ? domain : null;
  } catch { return null; }
}

export function normalizeKey(input: string): string {
  return input.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
}

function words(value: string): string[] {
  return normalizeKey(value).split('-').filter((word) => word.length > 2);
}

function companyMatches(requested: string, actual: string): boolean {
  const a = normalizeKey(requested);
  const b = normalizeKey(actual);
  return a === b || a.startsWith(`${b}-`) || b.startsWith(`${a}-`) ||
    words(requested).every((word) => words(actual).includes(word));
}

function safeSourceUrl(input: string): string | null {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}

/** Model text alone is not evidence. A contact needs grounded evidence for
 * current employment and a grounded LinkedIn result for the exact profile. */
export function validateGroundedDiscovery(input: {
  discovery: unknown;
  requestedCompany: string;
  requestedDomain: string | null;
  sources: GroundedSource[];
}): { companyName: string; companyDomain: string | null; contacts: ValidContact[] } {
  const parsed = DiscoverySchema.safeParse(input.discovery);
  if (!parsed.success) return { companyName: input.requestedCompany, companyDomain: input.requestedDomain, contacts: [] };
  const resolved = parsed.data.company;
  const proposedDomain = normalizeDomain(resolved.domain);
  if (!companyMatches(input.requestedCompany, resolved.name) ||
    (input.requestedDomain && proposedDomain !== input.requestedDomain)) {
    return { companyName: input.requestedCompany, companyDomain: input.requestedDomain, contacts: [] };
  }
  const sources = input.sources.filter((source) => safeSourceUrl(source.uri));
  const domain = input.requestedDomain || (proposedDomain && sources.some((source) => {
    const host = new URL(source.uri).hostname.toLowerCase();
    return (host === proposedDomain || host.endsWith(`.${proposedDomain}`)) &&
      words(input.requestedCompany).some((word) => words(source.title).includes(word));
  }) ? proposedDomain : null);
  // A name alone is too ambiguous for an unselected company. Require a
  // grounded official domain before presenting contacts from free text input.
  if (!domain) return { companyName: resolved.name.trim().slice(0, 120), companyDomain: null, contacts: [] };
  const seen = new Set<string>();
  const contacts: ValidContact[] = [];
  for (const person of parsed.data.contacts) {
    const profile = normalizeLinkedInProfile(person.linkedinUrl);
    if (!profile || seen.has(profile) || !companyMatches(resolved.name, person.company) ||
      !person.name.trim() || !person.title.trim() || !person.relevanceReason.trim()) continue;
    const nameWords = words(person.name);
    if (nameWords.length < 2) continue;
    const employerSources = sources.filter((source) => {
      const sourceWords = words(source.title);
      return nameWords.every((word) => sourceWords.includes(word)) &&
        words(input.requestedCompany).some((word) => sourceWords.includes(word)) &&
        !/\b(former|previously|ex[- ]|alumni|left)\b/i.test(source.title);
    });
    const linkedInSource = sources.find((source) =>
      normalizeLinkedInProfile(source.uri) === profile &&
      nameWords.every((word) => words(source.title).includes(word)));
    if (!linkedInSource || !employerSources.length) continue;
    // Only show links actually returned by the grounding tool. Descriptions
    // come from source titles, not from unsupported model-supplied claims.
    const evidence = [...new Map([linkedInSource, ...employerSources].map((source) =>
      [source.uri, source])).values()].slice(0, 3).map((source) => ({
      url: source.uri,
      title: source.title.slice(0, 200),
      description: 'Search-grounded source for this contact and company.',
    }));
    seen.add(profile);
    contacts.push({
      name: person.name.trim().slice(0, 120),
      title: person.title.trim().slice(0, 120),
      company: person.company.trim().slice(0, 120),
      linkedinUrl: profile,
      relevanceReason: person.relevanceReason.trim().slice(0, 300),
      evidence,
    });
  }
  return { companyName: resolved.name.trim().slice(0, 120), companyDomain: domain, contacts };
}
