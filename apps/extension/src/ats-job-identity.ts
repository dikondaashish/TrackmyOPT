/**
 * Stable job identity across a posting URL and its apply URL.
 *
 * A user generates a tailored resume while reading the posting, then clicks
 * Apply. Almost every ATS changes the URL at that moment — a new path segment
 * (`/apply`), a new host (`boards.` -> `job-boards.greenhouse.io`), or a
 * different route entirely. Comparing normalized URLs therefore reported
 * "different job" and Prefill silently dropped the PDF it had just generated.
 *
 * This module reduces both URLs to `{platform, tenant, jobId}` so the pair is
 * recognised as one posting. It is deliberately conservative: an identity is
 * only produced when the platform's stable job id can actually be read, and two
 * identities match only when platform and job id agree (and tenant agrees
 * whenever both URLs carry one). No company/role text is consulted here —
 * matching by scraped text risks attaching another employer's resume.
 *
 * Pure and dependency-free: the web API imports it too, so the server and the
 * extension can never disagree about which artifact belongs to a page.
 */

export interface AtsJobIdentity {
  platform: string;
  /** Board/company slug. Empty when the URL does not carry one. */
  tenant: string;
  jobId: string;
}

function lower(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function pathSegments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean).map(decode);
}

/** Left-most subdomain, e.g. `acme` in `acme.bamboohr.com`. */
function subdomain(url: URL): string {
  const parts = url.hostname.split('.');
  return parts.length > 2 ? lower(parts[0]) : '';
}

function identity(
  platform: string,
  tenant: string,
  jobId: string,
): AtsJobIdentity | undefined {
  const normalizedId = lower(jobId);
  if (!normalizedId) return undefined;
  return { platform, tenant: lower(tenant), jobId: normalizedId };
}

/** Leading numeric run of a `12345-some-slug` segment. */
function leadingNumericId(segment: string | undefined): string {
  return segment?.match(/^(\d{3,})\b/)?.[1] ?? '';
}

function firstQueryValue(url: URL, keys: string[]): string {
  for (const key of keys) {
    const value = url.searchParams.get(key);
    if (value?.trim()) return value.trim();
  }
  return '';
}

/** Segment following `marker`, e.g. the id after `/job/`. */
function segmentAfter(segments: string[], marker: string): string {
  const index = segments.findIndex((segment) => lower(segment) === marker);
  return index >= 0 ? segments[index + 1] ?? '' : '';
}

type PlatformResolver = (url: URL) => AtsJobIdentity | undefined;

const WORKDAY_HOST_RE = /(?:^|\.)(?:myworkdayjobs|myworkday)\.com$/i;
const ICIMS_HOST_RE = /(?:^|\.)icims\.com$/i;

const PLATFORM_RESOLVERS: PlatformResolver[] = [
  // Greenhouse — `boards.`, `job-boards.`, and the EU variants all serve the
  // same numeric job id. `gh_jid` additionally identifies embedded boards
  // hosted on the employer's own domain, where no tenant is available.
  (url) => {
    const greenhouseHost =
      /(?:^|\.)(?:job-boards|boards)(?:\.eu)?\.greenhouse\.io$/i.test(url.hostname);
    const segments = pathSegments(url);
    if (greenhouseHost) {
      const jobId = segmentAfter(segments, 'jobs') || firstQueryValue(url, ['gh_jid']);
      const tenant = segments[0] && lower(segments[0]) !== 'embed' ? segments[0] : '';
      return identity('greenhouse', tenant, jobId);
    }
    // Embedded Greenhouse iframe/board on a company career page.
    const embeddedId = firstQueryValue(url, ['gh_jid']);
    return embeddedId ? identity('greenhouse', '', embeddedId) : undefined;
  },

  // Lever — jobs.lever.co/<tenant>/<uuid>[/apply]
  (url) => {
    if (!/(?:^|\.)lever\.co$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('lever', segments[0] ?? '', segments[1] ?? '');
  },

  // Ashby — jobs.ashbyhq.com/<tenant>/<uuid>[/application]
  (url) => {
    if (!/(?:^|\.)ashbyhq\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('ashby', segments[0] ?? '', segments[1] ?? '');
  },

  // Workable — apply.workable.com/<tenant>/j/<CODE>[/apply] and the
  // <tenant>.workable.com/j/<CODE> variant.
  (url) => {
    if (!/(?:^|\.)workable\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const code = segmentAfter(segments, 'j') || segmentAfter(segments, 'jobs');
    const tenant = lower(segments[0] ?? '') === 'j' ? subdomain(url) : segments[0] ?? '';
    return identity('workable', tenant, code);
  },

  // SmartRecruiters — the long numeric posting id is the stable part; the
  // trailing slug and the `/apply` suffix both vary.
  (url) => {
    if (!/(?:^|\.)smartrecruiters\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const posting = segments.map(leadingNumericId).find(Boolean) ?? '';
    return identity('smartrecruiters', segments[0] ?? '', posting);
  },

  // Jobvite — jobs.jobvite.com/<tenant>/job/<id> and app.jobvite.com/j?cj=<id>
  (url) => {
    if (!/(?:^|\.)jobvite\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const jobId = segmentAfter(segments, 'job') || firstQueryValue(url, ['cj', 'jvi']);
    const tenant = lower(segments[0] ?? '') === 'j' ? '' : segments[0] ?? '';
    return identity('jobvite', tenant, jobId);
  },

  // Recruitee — <tenant>.recruitee.com/o/<slug>[/c/new]
  (url) => {
    if (!/(?:^|\.)recruitee\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('recruitee', subdomain(url), segmentAfter(segments, 'o'));
  },

  // Teamtailor — <tenant>.teamtailor.com/jobs/<id>-<slug>[/applications/new]
  (url) => {
    if (!/(?:^|\.)teamtailor\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const posting = segmentAfter(segments, 'jobs');
    return identity('teamtailor', subdomain(url), leadingNumericId(posting) || posting);
  },

  // Breezy — <tenant>.breezy.hr/p/<id>-<slug>[/apply]
  (url) => {
    if (!/(?:^|\.)(?:breezy\.hr|breezyhr\.com)$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const posting = segmentAfter(segments, 'p');
    return identity('breezy', subdomain(url), posting.split('-')[0] ?? '');
  },

  // Pinpoint — <tenant>.pinpointhq.com/postings/<uuid>[/applications/new]
  (url) => {
    if (!/(?:^|\.)pinpointhq\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('pinpoint', subdomain(url), segmentAfter(segments, 'postings'));
  },

  // Personio — <tenant>.jobs.personio.<tld>/job/<id>
  (url) => {
    if (!/(?:^|\.)personio\.(?:de|com)$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const jobId = segmentAfter(segments, 'job') || firstQueryValue(url, ['id']);
    return identity('personio', subdomain(url), leadingNumericId(jobId) || jobId);
  },

  // Eightfold — <tenant>.eightfold.ai/careers/job/<id>
  (url) => {
    if (!/(?:^|\.)eightfold\.ai$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const jobId = segmentAfter(segments, 'job') || firstQueryValue(url, ['job_id', 'pid']);
    return identity('eightfold', subdomain(url), jobId);
  },

  // JazzHR — <tenant>.applytojob.com/apply/<code>/<slug>. `apply` is the first
  // segment here, so the generic suffix rule must not touch it.
  (url) => {
    if (!/(?:^|\.)applytojob\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('jazzhr', subdomain(url), segmentAfter(segments, 'apply'));
  },

  // BambooHR — <tenant>.bamboohr.com/careers/<id>
  (url) => {
    if (!/(?:^|\.)bamboohr\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('bamboohr', subdomain(url), segmentAfter(segments, 'careers'));
  },

  // Dover — app.dover.com/apply/<uuid>/...
  (url) => {
    if (!/(?:^|\.)dover\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('dover', '', segmentAfter(segments, 'apply'));
  },

  // Comeet — comeet.com/jobs/<tenant>/<code>/<slug>/<id>
  (url) => {
    if (!/(?:^|\.)comeet\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const after = segments.slice(segments.indexOf('jobs') + 1);
    return identity('comeet', after[0] ?? '', after[after.length - 1] ?? '');
  },

  // Taleo — the requisition lives in the query string; jobdetail.ftl and
  // apply.ftl are the same posting.
  (url) => {
    if (!/(?:^|\.)taleo\.net$/i.test(url.hostname)) return undefined;
    return identity(
      'taleo',
      subdomain(url),
      firstQueryValue(url, ['job', 'rid', 'jobId']),
    );
  },

  // SAP SuccessFactors — career_job_req_id survives the apply transition.
  (url) => {
    if (!/(?:^|\.)successfactors\.(?:com|eu)$/i.test(url.hostname)) return undefined;
    return identity(
      'successfactors',
      subdomain(url),
      firstQueryValue(url, ['career_job_req_id', 'jobReqId', 'jobId']),
    );
  },

  // Oracle Cloud Recruiting — .../job/<id>[/apply/email]
  (url) => {
    if (!/(?:^|\.)oraclecloud\.com$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    return identity('oraclecloud', subdomain(url), segmentAfter(segments, 'job'));
  },

  // Avature — .../JobDetail/<slug>/<id> and the ApplicationMethods route.
  (url) => {
    if (!/(?:^|\.)avature\.net$/i.test(url.hostname)) return undefined;
    const segments = pathSegments(url);
    const fromQuery = firstQueryValue(url, ['jobId']);
    const fromPath = [...segments].reverse().find((segment) => /^\d+$/.test(segment)) ?? '';
    return identity('avature', subdomain(url), fromQuery || fromPath);
  },
];

/**
 * Resolve a URL to a stable ATS job identity, or undefined when this URL is
 * not a recognised posting/apply route.
 *
 * Workday and iCIMS are handled by their own dedicated extractors in
 * resume-autofill-contract.ts, which already encode requisition-level rules
 * this generic table cannot express.
 */
export function extractAtsJobIdentity(value: string): AtsJobIdentity | undefined {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  if (WORKDAY_HOST_RE.test(url.hostname) || ICIMS_HOST_RE.test(url.hostname)) {
    return undefined;
  }
  for (const resolve of PLATFORM_RESOLVERS) {
    const resolved = resolve(url);
    if (resolved) return resolved;
  }
  return undefined;
}

/**
 * Two identities describe the same posting when the platform and job id agree.
 * Tenant is compared only when both URLs carry one — an embedded Greenhouse
 * board has no tenant in its URL, and its numeric job id is already unique.
 */
export function atsJobIdentitiesMatch(
  left: AtsJobIdentity,
  right: AtsJobIdentity,
): boolean {
  if (left.platform !== right.platform) return false;
  if (left.jobId !== right.jobId) return false;
  if (left.tenant && right.tenant) return left.tenant === right.tenant;
  return true;
}

const APPLY_SEGMENT_RE =
  /^(?:apply|apply-now|applynow|application|applications|submit)$/i;

/**
 * Drop a trailing apply route so an unrecognised ATS still matches its own
 * posting URL. Requires at least one preceding segment, so a board whose path
 * *starts* with `/apply/<id>` keeps its identity.
 */
export function stripApplyRouteSegments(segments: string[]): string[] {
  const result = [...segments];
  // Recruitee-style `/c/new` composite apply route.
  if (
    result.length > 2 &&
    lower(result[result.length - 1]) === 'new' &&
    lower(result[result.length - 2]) === 'c'
  ) {
    result.length -= 2;
    return result;
  }
  for (let index = result.length - 1; index >= 1; index -= 1) {
    if (APPLY_SEGMENT_RE.test(result[index])) {
      result.length = index;
      return result;
    }
  }
  return result;
}

/**
 * Host-and-path comparison for ATSs with no dedicated rule: identical origin
 * and identical path once any trailing apply route is removed.
 */
export function sameHostApplyRouteMatch(
  leftUrl: string,
  rightUrl: string,
): boolean {
  try {
    const left = new URL(leftUrl);
    const right = new URL(rightUrl);
    if (left.hostname.toLowerCase() !== right.hostname.toLowerCase()) return false;
    const leftPath = stripApplyRouteSegments(pathSegments(left)).map(lower);
    const rightPath = stripApplyRouteSegments(pathSegments(right)).map(lower);
    if (leftPath.length === 0 || leftPath.length !== rightPath.length) return false;
    return leftPath.every((segment, index) => segment === rightPath[index]);
  } catch {
    return false;
  }
}
