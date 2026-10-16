import type { JobStoreSearch } from './job-data-store.contract';
import {
  ORACLE_DESCRIPTION_FLAG_MASKS,
  ORACLE_DESCRIPTION_FLAGS,
  ORACLE_ISO_TZ_FORMAT,
  ORACLE_JOB_SEARCH_TABLE,
  needsOracleExactCheck,
  oracleTextWildcard,
  toOracleTimestamp,
} from './oracle-job-data-helpers';

/**
 * When a job was posted: the ATS publish date (Greenhouse `first_published`,
 * Ashby `publishedAt`), or, for a source that does not publish one, the time
 * ingestion first saw the listing. The default order and the date filter both
 * use this expression so "Past 24 hours" and "newest first" always agree.
 */
export const ORACLE_JOB_POSTED_AT_SQL = 'COALESCE(posted_at, first_seen_at)';

/** Newest first, with the primary key as a stable tiebreak for pagination. */
export function oracleJobOrderBy(sortBy: JobStoreSearch['sortBy']): string {
  const column =
    sortBy === 'last_confirmed_at'
      ? 'last_confirmed_at'
      : ORACLE_JOB_POSTED_AT_SQL;
  return `${column} DESC NULLS LAST, id ASC`;
}

/**
 * Title vocabularies for the role filter. Each term must appear as a whole
 * word, matching the web app's `inferRoles` (`\b…\b`), so "ai" does not match
 * "Maintenance" and "ui" does not match "Build".
 */
export const ROLE_TITLE_TERMS = {
  engineering: [
    'engineer',
    'engineering',
    'developer',
    'software',
    'platform',
    'security',
    'devops',
    'site reliability',
    'sre',
    'firmware',
  ],
  data: [
    'data',
    'analyst',
    'analytics',
    'scientist',
    'machine learning',
    'ml',
    'artificial intelligence',
    'ai',
  ],
  product: ['product', 'product manager', 'product owner'],
  design: [
    'design',
    'designer',
    'ux',
    'ui',
    'user experience',
    'user interface',
  ],
  operations: [
    'operations',
    'strategy',
    'customer success',
    'support',
    'deployment',
    'program manager',
    'project manager',
  ],
  sales: [
    'sales',
    'account executive',
    'business development',
    'revenue',
    'solutions consultant',
  ],
} as const;

const JOB_TYPE_TITLE_TERMS = {
  internship: ['intern', 'interns', 'internship', 'internships'],
  contract: ['contract', 'contractor', 'freelance'],
  temporary: ['temporary', 'temp', 'fixed[ -]term'],
  permanent: ['permanent'],
} as const;

const EMPLOYMENT_TYPE_TITLE_TERMS = {
  full_time: ['full[ -]?time', 'fte'],
  part_time: ['part[ -]?time'],
} as const;

const ON_SITE_PATTERN = 'on[ -]?site|in[ -]?office';

/** POSIX whole-word pattern; Oracle regular expressions have no `\b`. */
export function oracleWholeWordPattern(terms: readonly string[]): string {
  return `(^|[^[:alnum:]])(${terms.join('|')})($|[^[:alnum:]])`;
}

/** Case-insensitive substring pattern for `LIKE … ESCAPE '\'`. */
export function oracleLikeContains(value: string): string {
  return `%${value.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`;
}

/** Builds the WHERE clause and bind variables for a job-board search. */
export function buildOracleJobSearchFilter(query: JobStoreSearch): {
  where: string;
  filterBinds: Record<string, unknown>;
} {
  const conditions = ["source_trust_tier = 'verified_ats'"];
  const filterBinds: Record<string, unknown> = {};
  if (query.listingStatus && query.listingStatus !== 'all') {
    conditions.push('listing_status = :listingStatus');
    filterBinds.listingStatus = query.listingStatus;
  } else if (!query.listingStatus) {
    conditions.push("listing_status = 'open'");
  }
  if (query.sourceId) {
    conditions.push('source_id = :sourceId');
    filterBinds.sourceId = query.sourceId;
  }
  const textContains = (column: string, bindName: string) =>
    `LOWER(${column}) LIKE :${bindName} ESCAPE '\\'`;
  // NULL NOT LIKE x is unknown, which would drop every job whose optional
  // column is empty; a missing value cannot mention the excluded keyword.
  const textNotContains = (column: string, bindName: string) =>
    `(${column} IS NULL OR LOWER(${column}) NOT LIKE :${bindName} ESCAPE '\\')`;
  const titleHasWord = (bindName: string, terms: readonly string[]) => {
    filterBinds[bindName] = oracleWholeWordPattern(terms);
    return `REGEXP_LIKE(LOWER(title), :${bindName})`;
  };
  const descriptionHas = (bindName: string, value: string) => {
    const original = value.toLowerCase();
    const wildcard = oracleTextWildcard(value);
    if (!wildcard) {
      const exactBindName = `${bindName}Exact`;
      filterBinds[exactBindName] = original;
      return `EXISTS (SELECT 1 FROM ${ORACLE_JOB_SEARCH_TABLE} s WHERE s.job_id = jobs.id AND DBMS_LOB.INSTR(s.search_text, :${exactBindName}) > 0)`;
    }
    filterBinds[bindName] = wildcard;
    let exactPredicate = '';
    if (needsOracleExactCheck(value)) {
      const exactBindName = `${bindName}Exact`;
      filterBinds[exactBindName] = original;
      exactPredicate = ` AND DBMS_LOB.INSTR(s.search_text, :${exactBindName}) > 0`;
    }
    return `EXISTS (SELECT 1 FROM ${ORACLE_JOB_SEARCH_TABLE} s WHERE s.job_id = jobs.id AND CONTAINS(s.search_text_index, :${bindName}, 1) > 0${exactPredicate})`;
  };
  // Materialized description evidence (see descriptionFilterFlags). A job
  // without a search row has no description evidence.
  const flags = `(SELECT NVL(MAX(s.description_filter_flags), 0) FROM ${ORACLE_JOB_SEARCH_TABLE} s WHERE s.job_id = jobs.id)`;
  const flagsAny = (mask: number) => `BITAND(${flags}, ${mask}) != 0`;
  const flagsNone = (mask: number) => `BITAND(${flags}, ${mask}) = 0`;

  const searchText = query.query?.trim();
  if (searchText) {
    filterBinds.query = oracleLikeContains(searchText);
    if (query.searchScope === 'title') {
      conditions.push(textContains('title', 'query'));
    } else if (query.searchScope === 'company') {
      conditions.push(
        `(${textContains('company_name', 'query')} OR ${textContains('employer_board_name', 'query')})`,
      );
    } else {
      conditions.push(
        `(${textContains('title', 'query')} OR ${descriptionHas('queryToken', searchText)})`,
      );
    }
  }
  const excluded = query.exclude?.trim();
  if (excluded) {
    filterBinds.exclude = oracleLikeContains(excluded);
    conditions.push(
      ['title', 'company_name', 'employer_board_name', 'location', 'department']
        .map((column) => textNotContains(column, 'exclude'))
        .concat(`NOT ${descriptionHas('excludeToken', excluded)}`)
        .join(' AND '),
    );
  }
  if (query.sourceAts) {
    conditions.push('source_ats = :sourceAts');
    filterBinds.sourceAts = query.sourceAts;
  }
  if (query.companyName) {
    conditions.push(
      '(company_name = :companyName OR employer_board_name = :companyName)',
    );
    filterBinds.companyName = query.companyName;
  }
  if (query.location) {
    conditions.push('location = :location');
    filterBinds.location = query.location;
  }
  if (query.postedAfter) {
    conditions.push(
      `${ORACLE_JOB_POSTED_AT_SQL} >= TO_TIMESTAMP_TZ(:postedAfter, '${ORACLE_ISO_TZ_FORMAT}')`,
    );
    filterBinds.postedAfter = toOracleTimestamp(query.postedAfter);
  }

  if (query.workplace && query.workplace !== 'all') {
    // One arrangement per job, in the web app's precedence: a stated location
    // wins over title/description wording, and hybrid > remote > on-site at
    // each level. The four options therefore partition the open jobs.
    const location = "NVL(LOWER(location), ' ')";
    const locationHybrid = `${location} LIKE '%hybrid%'`;
    const locationRemote = `${location} LIKE '%remote%'`;
    const locationOnSite = `REGEXP_LIKE(${location}, '${ON_SITE_PATTERN}')`;
    const textHybrid = `(LOWER(title) LIKE '%hybrid%' OR ${flagsAny(ORACLE_DESCRIPTION_FLAGS.hybrid)})`;
    const textRemote = `(LOWER(title) LIKE '%remote%' OR ${flagsAny(ORACLE_DESCRIPTION_FLAGS.remote)})`;
    const textOnSite = `(REGEXP_LIKE(LOWER(title), '${ON_SITE_PATTERN}') OR ${flagsAny(ORACLE_DESCRIPTION_FLAGS.onSite)})`;
    const noLocation = `NOT ${locationHybrid} AND NOT ${locationRemote} AND NOT ${locationOnSite}`;
    if (query.workplace === 'hybrid') {
      conditions.push(
        `(${locationHybrid} OR (${noLocation} AND ${textHybrid}))`,
      );
    } else if (query.workplace === 'remote') {
      conditions.push(
        `(NOT ${locationHybrid} AND (${locationRemote} OR (${noLocation} AND NOT ${textHybrid} AND ${textRemote})))`,
      );
    } else if (query.workplace === 'on_site') {
      conditions.push(
        `(NOT ${locationHybrid} AND NOT ${locationRemote} AND (${locationOnSite} OR (NOT ${textHybrid} AND NOT ${textRemote} AND ${textOnSite})))`,
      );
    } else {
      conditions.push(
        `(${noLocation} AND NOT ${textHybrid} AND NOT ${textRemote} AND NOT ${textOnSite})`,
      );
    }
  }

  if (query.degree && query.degree !== 'all') {
    const degreeFlag = {
      bachelor: ORACLE_DESCRIPTION_FLAGS.degreeBachelor,
      master: ORACLE_DESCRIPTION_FLAGS.degreeMaster,
      doctorate: ORACLE_DESCRIPTION_FLAGS.degreeDoctorate,
    }[query.degree as 'bachelor' | 'master' | 'doctorate'];
    if (degreeFlag) conditions.push(flagsAny(degreeFlag));
    else if (query.degree === 'unspecified')
      // Not specified means no degree evidence at all, so it never overlaps
      // with Bachelor's, Master's or Doctorate.
      conditions.push(flagsNone(ORACLE_DESCRIPTION_FLAG_MASKS.degrees));
  }

  if (query.experience && query.experience !== 'all') {
    // "Max experience": the most experience a posting asks for must fit the
    // option, so a posting that also asks for 6+ years is not "up to 2".
    const { experienceEntry, experienceSenior } = ORACLE_DESCRIPTION_FLAGS;
    const experiences = ORACLE_DESCRIPTION_FLAG_MASKS.experiences;
    if (query.experience === 'entry') {
      conditions.push(`BITAND(${flags}, ${experiences}) = ${experienceEntry}`);
    } else if (query.experience === 'mid') {
      conditions.push(
        `(${flagsAny(experiences)} AND ${flagsNone(experienceSenior)})`,
      );
    } else if (query.experience === 'senior') {
      conditions.push(flagsAny(experiences));
    } else if (query.experience === 'unspecified') {
      conditions.push(flagsNone(experiences));
    }
  }

  if (query.role && query.role !== 'all') {
    if (query.role === 'other') {
      conditions.push(
        `NOT ${titleHasWord('roleAny', Object.values(ROLE_TITLE_TERMS).flat())}`,
      );
    } else {
      const terms = ROLE_TITLE_TERMS[query.role];
      if (terms) conditions.push(titleHasWord('role', terms));
    }
  }

  const jobTypeEvidence = (type: keyof typeof JOB_TYPE_TITLE_TERMS) => {
    const flag = {
      internship: ORACLE_DESCRIPTION_FLAGS.typeInternship,
      contract: ORACLE_DESCRIPTION_FLAGS.typeContract,
      temporary: ORACLE_DESCRIPTION_FLAGS.typeTemporary,
      permanent: ORACLE_DESCRIPTION_FLAGS.typePermanent,
    }[type];
    return `(${titleHasWord(`jobType_${type}`, JOB_TYPE_TITLE_TERMS[type])} OR ${flagsAny(flag)})`;
  };
  if (query.jobType && query.jobType !== 'all') {
    if (query.jobType === 'unspecified') {
      // Not specified must exclude title evidence too ("Software Intern").
      conditions.push(
        `NOT ${jobTypeEvidence('internship')} AND NOT ${jobTypeEvidence('contract')} AND NOT ${jobTypeEvidence('temporary')} AND NOT ${jobTypeEvidence('permanent')}`,
      );
    } else if (query.jobType in JOB_TYPE_TITLE_TERMS) {
      conditions.push(jobTypeEvidence(query.jobType));
    }
  }

  const employmentEvidence = (type: keyof typeof EMPLOYMENT_TYPE_TITLE_TERMS) =>
    `(${titleHasWord(`employment_${type}`, EMPLOYMENT_TYPE_TITLE_TERMS[type])} OR ${flagsAny(
      type === 'full_time'
        ? ORACLE_DESCRIPTION_FLAGS.employmentFullTime
        : ORACLE_DESCRIPTION_FLAGS.employmentPartTime,
    )})`;
  if (query.employmentType && query.employmentType !== 'all') {
    if (query.employmentType === 'unspecified') {
      conditions.push(
        `NOT ${employmentEvidence('full_time')} AND NOT ${employmentEvidence('part_time')}`,
      );
    } else if (query.employmentType in EMPLOYMENT_TYPE_TITLE_TERMS) {
      conditions.push(employmentEvidence(query.employmentType));
    }
  }

  if (query.employerEvidence === 'source_backed') {
    conditions.push('employer_match_id IS NOT NULL');
  }
  if (query.includeJobUrls?.length) {
    const names = query.includeJobUrls.map((_, index) => `:includeUrl${index}`);
    conditions.push(`job_url IN (${names.join(', ')})`);
    query.includeJobUrls.forEach((url, index) => {
      filterBinds[`includeUrl${index}`] = url;
    });
  }
  if (query.excludeJobUrls?.length) {
    const names = query.excludeJobUrls.map((_, index) => `:excludeUrl${index}`);
    conditions.push(
      `(job_url IS NULL OR job_url NOT IN (${names.join(', ')}))`,
    );
    query.excludeJobUrls.forEach((url, index) => {
      filterBinds[`excludeUrl${index}`] = url;
    });
  }

  const where = conditions.join(' AND ');
  return { where, filterBinds };
}
