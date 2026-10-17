import type { JobEmploymentKind, JobTypeKind, JobWorkplace } from './job-facts';

/** An employment classification an ATS states as structured data. */
export type AtsEmploymentType = JobEmploymentKind | JobTypeKind;

/**
 * Workplace and employment type an ATS publishes as structured fields. They
 * are set by the employer, so they take precedence over wording inferred from
 * the description. Null or empty means the ATS did not say.
 */
export type AtsJobFacts = {
  workplace: JobWorkplace | null;
  employmentTypes: AtsEmploymentType[];
};

export const NO_ATS_JOB_FACTS: AtsJobFacts = {
  workplace: null,
  employmentTypes: [],
};

const EMPLOYMENT_ORDER: readonly AtsEmploymentType[] = [
  'full_time',
  'part_time',
  'internship',
  'contract',
  'temporary',
  'permanent',
];

function sortedEmploymentTypes(types: Iterable<AtsEmploymentType>) {
  const unique = new Set(types);
  return EMPLOYMENT_ORDER.filter((type) => unique.has(type));
}

const ASHBY_WORKPLACE: Record<string, JobWorkplace> = {
  remote: 'remote',
  hybrid: 'hybrid',
  onsite: 'on_site',
};

const ASHBY_EMPLOYMENT: Record<string, AtsEmploymentType> = {
  fulltime: 'full_time',
  parttime: 'part_time',
  intern: 'internship',
  contract: 'contract',
  temporary: 'temporary',
};

function token(value: unknown) {
  return typeof value === 'string'
    ? value.toLowerCase().replace(/[^a-z]/g, '')
    : '';
}

/**
 * Ashby's posting API: `workplaceType` is "OnSite" | "Remote" | "Hybrid" | null
 * and `employmentType` is "FullTime" | "PartTime" | "Intern" | "Contract" |
 * "Temporary". `isRemote` is also true for hybrid jobs, so it is only used
 * when `workplaceType` is missing, and only when true.
 */
export function ashbyJobFacts(item: Record<string, unknown>): AtsJobFacts {
  const workplace =
    ASHBY_WORKPLACE[token(item.workplaceType)] ??
    (item.isRemote === true ? 'remote' : null);
  const employment = ASHBY_EMPLOYMENT[token(item.employmentType)];
  return {
    workplace,
    employmentTypes: employment ? [employment] : [],
  };
}

/** Custom field names that hold the workplace arrangement. */
const GREENHOUSE_WORKPLACE_FIELD =
  /\b(?:workplace|location type|work (?:arrangement|model|location type|setting|type)|remote (?:options?|job|status|eligib\w*)|on[- ]?site\/remote)\b/i;
/** Custom field names that hold the employment type or schedule. */
const GREENHOUSE_EMPLOYMENT_FIELD =
  /\b(?:employment (?:sub-?)?type|employee type|worker (?:sub-?)?type|schedule type|full or part time|full\/part time|job type|position type|time type)\b/i;

function metadataValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'boolean') return [String(value)];
  if (Array.isArray(value))
    return value.filter((entry): entry is string => typeof entry === 'string');
  return [];
}

function greenhouseWorkplace(name: string, value: string): JobWorkplace | null {
  const text = value.toLowerCase();
  // "Remote job: false" says only that the job is not remote.
  if (/^remote\b/i.test(name.trim()) && /^(?:true|yes)$/.test(text))
    return 'remote';
  if (/\bhybrid\b/.test(text)) return 'hybrid';
  if (/\bremote\b/.test(text)) return 'remote';
  if (
    /\b(?:on[- ]?site|in[- ]office|in[- ]person|office[- ]based)\b/.test(text)
  )
    return 'on_site';
  return null;
}

function greenhouseEmployment(value: string): AtsEmploymentType[] {
  const text = value.toLowerCase().trim();
  const types: AtsEmploymentType[] = [];
  if (/\bfull[- ]?time\b|^ft$/.test(text)) types.push('full_time');
  if (/\bpart[- ]?time\b|^pt$/.test(text)) types.push('part_time');
  if (/\bintern(?:ship)?s?\b|\bco-?op\b/.test(text)) types.push('internship');
  if (/\bcontract(?:or)?s?\b|\bcontingent\b|\bfreelance\b/.test(text))
    types.push('contract');
  if (/\btemporary\b|\btemp\b|\bfixed[- ]term\b|\bseasonal\b/.test(text))
    types.push('temporary');
  if (/\bpermanent\b|^regular(?: employee)?$/.test(text))
    types.push('permanent');
  return types;
}

/**
 * Greenhouse has no standard workplace or employment field; boards add custom
 * `metadata` fields (seen in production: "Location Type", "Workplace Type",
 * "Employment Type", "Full or Part Time", "Worker Sub-Type", "Remote job").
 * Only fields whose name clearly states one of these is read, and only values
 * that map to a known arrangement count. Conflicting workplace values leave
 * the workplace unknown.
 */
export function greenhouseJobFacts(metadata: unknown): AtsJobFacts {
  if (!Array.isArray(metadata)) return NO_ATS_JOB_FACTS;
  const workplaces = new Set<JobWorkplace>();
  const employment: AtsEmploymentType[] = [];
  for (const field of metadata) {
    if (!field || typeof field !== 'object') continue;
    const { name, value } = field as { name?: unknown; value?: unknown };
    if (typeof name !== 'string') continue;
    for (const entry of metadataValues(value)) {
      if (GREENHOUSE_WORKPLACE_FIELD.test(name)) {
        const workplace = greenhouseWorkplace(name, entry);
        if (workplace) workplaces.add(workplace);
      } else if (GREENHOUSE_EMPLOYMENT_FIELD.test(name)) {
        employment.push(...greenhouseEmployment(entry));
      }
    }
  }
  return {
    workplace: workplaces.size === 1 ? [...workplaces][0] : null,
    employmentTypes: sortedEmploymentTypes(employment),
  };
}

/**
 * Lever's posting API: `workplaceType` is "onsite" | "remote" | "hybrid" |
 * "unspecified", and `categories.commitment` is the employer's own job-type
 * label ("Full-time", "Intern", "Contract", "Permanent", ...).
 */
export function leverJobFacts(item: Record<string, unknown>): AtsJobFacts {
  const categories = (item.categories ?? {}) as { commitment?: unknown };
  const commitment =
    typeof categories.commitment === 'string' ? categories.commitment : '';
  return {
    workplace: ASHBY_WORKPLACE[token(item.workplaceType)] ?? null,
    employmentTypes: sortedEmploymentTypes(greenhouseEmployment(commitment)),
  };
}

/**
 * SmartRecruiters' posting list: `location.remote` / `location.hybrid` flags
 * and `typeOfEmployment.label` ("Full-time", "Part-time", "Intern", ...).
 * A posting with neither flag is not assumed to be on-site.
 */
export function smartRecruitersJobFacts(item: {
  location?: { remote?: boolean; hybrid?: boolean };
  typeOfEmployment?: { label?: string };
}): AtsJobFacts {
  const workplace = item.location?.hybrid
    ? 'hybrid'
    : item.location?.remote
      ? 'remote'
      : null;
  const label = item.typeOfEmployment?.label;
  return {
    workplace,
    employmentTypes: sortedEmploymentTypes(
      typeof label === 'string' ? greenhouseEmployment(label) : [],
    ),
  };
}

/** Normalizes facts read back from a scraper payload or a stored record. */
export function normalizeAtsJobFacts(
  workplace: unknown,
  employmentTypes: unknown,
): AtsJobFacts {
  const knownWorkplace =
    workplace === 'remote' || workplace === 'hybrid' || workplace === 'on_site'
      ? workplace
      : null;
  const types = Array.isArray(employmentTypes)
    ? employmentTypes.filter((type): type is AtsEmploymentType =>
        EMPLOYMENT_ORDER.includes(type as AtsEmploymentType),
      )
    : [];
  return {
    workplace: knownWorkplace,
    employmentTypes: sortedEmploymentTypes(types),
  };
}
