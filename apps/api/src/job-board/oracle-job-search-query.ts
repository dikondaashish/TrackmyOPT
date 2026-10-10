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
    `LOWER(${column}) LIKE :${bindName}`;
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
  const descriptionNotHas = (bindName: string, value: string) =>
    `NOT ${descriptionHas(bindName, value)}`;
  const descriptionFlagHas = (bindName: string, mask: number) => {
    filterBinds[bindName] = mask;
    return `EXISTS (SELECT 1 FROM ${ORACLE_JOB_SEARCH_TABLE} s WHERE s.job_id = jobs.id AND BITAND(NVL(s.description_filter_flags, 0), :${bindName}) != 0)`;
  };
  const descriptionFlagNotHas = (bindName: string, mask: number) =>
    `NOT ${descriptionFlagHas(bindName, mask)}`;
  if (query.query?.trim()) {
    const queryPattern = `%${query.query.trim().toLowerCase()}%`;
    filterBinds.query = queryPattern;
    if (query.searchScope === 'title') {
      conditions.push(textContains('title', 'query'));
    } else if (query.searchScope === 'company') {
      conditions.push(
        `(${textContains('company_name', 'query')} OR ${textContains('employer_board_name', 'query')})`,
      );
    } else {
      conditions.push(
        `(${textContains('title', 'query')} OR ${textContains('company_name', 'query')} OR ${textContains('employer_board_name', 'query')} OR ${descriptionHas('queryToken', query.query.trim())})`,
      );
    }
  }
  if (query.exclude?.trim()) {
    filterBinds.exclude = `%${query.exclude.trim().toLowerCase()}%`;
    conditions.push(
      ['title', 'company_name', 'employer_board_name', 'location', 'department']
        .map((column) => `LOWER(${column}) NOT LIKE :exclude`)
        .concat(descriptionNotHas('excludeToken', query.exclude.trim()))
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
      `posted_at >= TO_TIMESTAMP_TZ(:postedAfter, '${ORACLE_ISO_TZ_FORMAT}')`,
    );
    filterBinds.postedAfter = toOracleTimestamp(query.postedAfter);
  }

  if (query.workplace && query.workplace !== 'all') {
    if (query.workplace === 'remote') {
      conditions.push(
        `(LOWER(location) LIKE '%remote%' OR ${descriptionFlagHas('workplaceRemoteFlag', ORACLE_DESCRIPTION_FLAGS.remote)})`,
      );
    } else if (query.workplace === 'hybrid') {
      conditions.push(
        `(LOWER(location) LIKE '%hybrid%' OR ${descriptionFlagHas('workplaceHybridFlag', ORACLE_DESCRIPTION_FLAGS.hybrid)})`,
      );
    } else if (query.workplace === 'on_site') {
      conditions.push(
        `(LOWER(location) LIKE '%on-site%' OR LOWER(location) LIKE '%onsite%' OR LOWER(location) LIKE '%in-office%' OR ${descriptionFlagHas('workplaceOnSiteFlag', ORACLE_DESCRIPTION_FLAGS.onSite)})`,
      );
    } else {
      conditions.push(
        `LOWER(location) NOT LIKE '%remote%' AND LOWER(location) NOT LIKE '%hybrid%' AND ${descriptionFlagNotHas('workplaceExcludedFlags', ORACLE_DESCRIPTION_FLAGS.remote | ORACLE_DESCRIPTION_FLAGS.hybrid)}`,
      );
    }
  }
  const degreePatterns: Record<string, string[]> = {
    bachelor: ['bachelor', 'b.s.', 'b.a.'],
    master: ['master', 'm.s.', 'mba'],
    doctorate: ['ph.d.', 'doctorate', 'doctoral'],
  };
  if (query.degree && query.degree !== 'all') {
    const patterns = degreePatterns[query.degree];
    if (patterns) {
      const flag =
        query.degree === 'bachelor'
          ? ORACLE_DESCRIPTION_FLAGS.degreeBachelor
          : query.degree === 'master'
            ? ORACLE_DESCRIPTION_FLAGS.degreeMaster
            : ORACLE_DESCRIPTION_FLAGS.degreeDoctorate;
      conditions.push(descriptionFlagHas('degreeFlag', flag));
    } else {
      // Keep this aligned with Supabase's established semantics: the
      // unspecified bucket excludes the three plain-language degree terms,
      // not the abbreviated variants used by the positive filters.
      conditions.push(
        descriptionFlagNotHas(
          'degreeUnspecifiedFlags',
          ORACLE_DESCRIPTION_FLAGS.plainBachelor |
            ORACLE_DESCRIPTION_FLAGS.plainMaster |
            ORACLE_DESCRIPTION_FLAGS.plainDoctorate,
        ),
      );
    }
  }
  const experiencePatterns = {
    entry: ['0 year', '1 year', '2 year'],
    mid: ['3 year', '4 year', '5 year'],
    senior: ['6 year', '7 year', '8 year', '9 year', '10 year'],
  } as const;
  if (query.experience && query.experience !== 'all') {
    const patterns =
      experiencePatterns[query.experience as keyof typeof experiencePatterns];
    if (patterns) {
      const flag =
        query.experience === 'entry'
          ? ORACLE_DESCRIPTION_FLAGS.experienceEntry
          : query.experience === 'mid'
            ? ORACLE_DESCRIPTION_FLAGS.experienceMid
            : ORACLE_DESCRIPTION_FLAGS.experienceSenior;
      conditions.push(descriptionFlagHas('experienceFlag', flag));
    } else if (query.experience === 'unspecified') {
      conditions.push(
        descriptionFlagNotHas(
          'experienceUnspecifiedFlags',
          ORACLE_DESCRIPTION_FLAG_MASKS.experiences,
        ),
      );
    }
  }
  const rolePatterns: Record<string, string[]> = {
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
  };
  if (query.role && query.role !== 'all') {
    const patterns = rolePatterns[query.role];
    if (patterns) {
      conditions.push(
        `(${patterns
          .map((value, index) => {
            filterBinds[`role${index}`] = `%${value}%`;
            return 'LOWER(title) LIKE :role' + index;
          })
          .join(' OR ')})`,
      );
    } else if (query.role === 'other') {
      const allRoles = Object.values(rolePatterns).flat();
      conditions.push(
        `NOT (${allRoles
          .map((value, index) => {
            filterBinds[`roleAny${index}`] = `%${value}%`;
            return 'LOWER(title) LIKE :roleAny' + index;
          })
          .join(' OR ')})`,
      );
    }
  }
  const descriptionTypePatterns: Record<string, string[]> = {
    internship: ['internship'],
    contract: ['contractor'],
    temporary: ['temporary', 'fixed-term'],
    permanent: ['permanent', 'regular employee'],
    full_time: ['full-time', 'full time', 'fte'],
    part_time: ['part-time', 'part time'],
  };
  if (query.jobType && query.jobType !== 'all') {
    const titlePattern =
      query.jobType === 'internship'
        ? '%intern%'
        : query.jobType === 'contract'
          ? '%contract%'
          : query.jobType === 'temporary'
            ? '%temporary%'
            : null;
    const patterns = descriptionTypePatterns[query.jobType];
    if (patterns) {
      const flag =
        query.jobType === 'internship'
          ? ORACLE_DESCRIPTION_FLAGS.typeInternship
          : query.jobType === 'contract'
            ? ORACLE_DESCRIPTION_FLAGS.typeContract
            : query.jobType === 'temporary'
              ? ORACLE_DESCRIPTION_FLAGS.typeTemporary
              : ORACLE_DESCRIPTION_FLAGS.typePermanent;
      const descriptionCondition = descriptionFlagHas('jobTypeFlag', flag);
      conditions.push(
        titlePattern
          ? `(LOWER(title) LIKE '${titlePattern}' OR ${descriptionCondition})`
          : `(${descriptionCondition})`,
      );
    } else if (query.jobType === 'unspecified') {
      // The Supabase store's unspecified branch only excludes description
      // evidence (and intentionally does not infer type from the title).
      conditions.push(
        descriptionFlagNotHas(
          'jobTypeUnspecifiedFlags',
          ORACLE_DESCRIPTION_FLAG_MASKS.jobTypes,
        ),
      );
    }
  }
  if (query.employmentType && query.employmentType !== 'all') {
    const patterns = descriptionTypePatterns[query.employmentType];
    if (patterns) {
      const flag =
        query.employmentType === 'full_time'
          ? ORACLE_DESCRIPTION_FLAGS.employmentFullTime
          : ORACLE_DESCRIPTION_FLAGS.employmentPartTime;
      conditions.push(descriptionFlagHas('employmentTypeFlag', flag));
    } else if (query.employmentType === 'unspecified') {
      conditions.push(
        descriptionFlagNotHas(
          'employmentTypeUnspecifiedFlags',
          ORACLE_DESCRIPTION_FLAG_MASKS.employmentTypes,
        ),
      );
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
    conditions.push(`job_url NOT IN (${names.join(', ')})`);
    query.excludeJobUrls.forEach((url, index) => {
      filterBinds[`excludeUrl${index}`] = url;
    });
  }

  const where = conditions.join(' AND ');
  return { where, filterBinds };
}
