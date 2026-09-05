import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import {
  readOracleJobDataConfig,
  type OracleJobDataConfig,
} from './job-data-store.config';
import {
  type JobDataStore,
  type JobStorePage,
  type JobStoreRecord,
  type JobStoreSearch,
  type JobStoreVisaSignal,
} from './job-data-store.contract';

type OracleRowsResult<T> = { rows?: T[]; rowsAffected?: number };

export type OracleConnection = {
  execute<T = Record<string, unknown>>(
    sql: string,
    binds?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<OracleRowsResult<T>>;
  executeMany(
    sql: string,
    binds: readonly Record<string, unknown>[],
    options?: Record<string, unknown>,
  ): Promise<OracleRowsResult<Record<string, unknown>>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close(): Promise<void>;
};

type OraclePool = {
  getConnection(): Promise<OracleConnection>;
  close(drainTime?: number): Promise<void>;
};

export type OracleDriver = {
  OUT_FORMAT_OBJECT: number;
  STRING?: unknown;
  CLOB?: unknown;
  NUMBER?: unknown;
  createPool(options: Record<string, unknown>): Promise<OraclePool>;
};

const nodeRequire = createRequire(__filename);

function loadOracleDriver(): OracleDriver {
  // The package is intentionally loaded lazily. Supabase remains the default,
  // so a production boot does not need an Oracle client or credentials.
  return nodeRequire('oracledb') as OracleDriver;
}

type OracleJobRow = Record<string, unknown>;

function boolToNumber(value: boolean | null) {
  return value === null ? null : value ? 1 : 0;
}

/**
 * Oracle's TZH:TZM parser needs an explicit offset. JavaScript's ISO output
 * ends in a literal `Z`, so convert it to an explicit UTC offset before
 * binding it to TIMESTAMP WITH TIME ZONE columns.
 */
export function toOracleTimestamp(value: string | null) {
  if (!value) return null;
  const iso = new Date(value).toISOString();
  return `${iso.slice(0, -1)}+00:00`;
}

function textValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

export function normalizeOracleTimestamp(value: unknown) {
  const text = textValue(value);
  return text ? new Date(text).toISOString() : null;
}

function mapJobRow(row: OracleJobRow): JobStoreRecord {
  return {
    id: textValue(row.ID) || '',
    sourceId: textValue(row.SOURCE_ID) || '',
    sourceAts: textValue(row.SOURCE_ATS) || '',
    boardToken: textValue(row.BOARD_TOKEN) || '',
    externalJobId: textValue(row.EXTERNAL_JOB_ID) || '',
    title: textValue(row.TITLE) || '',
    companyName: textValue(row.COMPANY_NAME) || '',
    location: textValue(row.LOCATION),
    department: textValue(row.DEPARTMENT),
    description: textValue(row.DESCRIPTION),
    jobUrl: textValue(row.JOB_URL),
    postedAt: normalizeOracleTimestamp(row.POSTED_AT),
    updatedAt: normalizeOracleTimestamp(row.UPDATED_AT) || '',
    optEligible:
      row.OPT_ELIGIBLE == null ? null : Number(row.OPT_ELIGIBLE) === 1,
    stemOptEligible:
      row.STEM_OPT_ELIGIBLE == null
        ? null
        : Number(row.STEM_OPT_ELIGIBLE) === 1,
    cptEligible:
      row.CPT_ELIGIBLE == null ? null : Number(row.CPT_ELIGIBLE) === 1,
    h1bSponsorStatus: textValue(row.H1B_SPONSOR_STATUS),
    createdAt: normalizeOracleTimestamp(row.CREATED_AT) || '',
    firstSeenAt: normalizeOracleTimestamp(row.FIRST_SEEN_AT) || '',
    lastConfirmedAt: normalizeOracleTimestamp(row.LAST_CONFIRMED_AT) || '',
    listingStatus: (textValue(row.LISTING_STATUS) ||
      'open') as JobStoreRecord['listingStatus'],
    employerBoardName: textValue(row.EMPLOYER_BOARD_NAME),
    sourceTrustTier: textValue(row.SOURCE_TRUST_TIER) || 'verified_ats',
    employerMatchId: textValue(row.EMPLOYER_MATCH_ID),
    missingSinceAt: normalizeOracleTimestamp(row.MISSING_SINCE_AT),
    removedAt: normalizeOracleTimestamp(row.REMOVED_AT),
  };
}

const JOB_COLUMNS = `
  id, source_id, source_ats, board_token, external_job_id, title,
  company_name, location, department, description, job_url, posted_at,
  updated_at, opt_eligible, stem_opt_eligible, cpt_eligible,
  h1b_sponsor_status, created_at, first_seen_at, last_confirmed_at,
  listing_status, employer_board_name, source_trust_tier, employer_match_id,
  missing_since_at, removed_at
`;
export const ORACLE_ISO_TZ_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.FF3TZH:TZM';
export const ORACLE_JOB_SEARCH_TABLE = 'ADMIN.TRACKMYOPT_JOB_SEARCH';

/**
 * Exact, case-insensitive description predicates used by the existing
 * Supabase filters. Keeping these as materialized flags avoids re-scanning
 * every CLOB for fixed filter vocabularies while preserving ILIKE substring
 * semantics (the flags are computed with String.includes()).
 */
export const ORACLE_DESCRIPTION_FLAGS = {
  remote: 1,
  hybrid: 2,
  onSite: 4,
  degreeBachelor: 8,
  degreeMaster: 16,
  degreeDoctorate: 32,
  experienceEntry: 64,
  experienceMid: 128,
  experienceSenior: 256,
  typeInternship: 512,
  typeContract: 1024,
  typeTemporary: 2048,
  typePermanent: 4096,
  employmentFullTime: 8192,
  employmentPartTime: 16384,
  plainBachelor: 32768,
  plainMaster: 65536,
  plainDoctorate: 131072,
} as const;

export const ORACLE_DESCRIPTION_FLAG_MASKS = {
  degrees:
    ORACLE_DESCRIPTION_FLAGS.degreeBachelor |
    ORACLE_DESCRIPTION_FLAGS.degreeMaster |
    ORACLE_DESCRIPTION_FLAGS.degreeDoctorate,
  experiences:
    ORACLE_DESCRIPTION_FLAGS.experienceEntry |
    ORACLE_DESCRIPTION_FLAGS.experienceMid |
    ORACLE_DESCRIPTION_FLAGS.experienceSenior,
  jobTypes:
    ORACLE_DESCRIPTION_FLAGS.typeInternship |
    ORACLE_DESCRIPTION_FLAGS.typeContract |
    ORACLE_DESCRIPTION_FLAGS.typeTemporary |
    ORACLE_DESCRIPTION_FLAGS.typePermanent,
  employmentTypes:
    ORACLE_DESCRIPTION_FLAGS.employmentFullTime |
    ORACLE_DESCRIPTION_FLAGS.employmentPartTime,
} as const;

function includesAny(value: string, patterns: readonly string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

export function descriptionFilterFlags(value: string | null): number {
  const text = (value || '').toLowerCase();
  let flags = 0;
  if (text.includes('remote')) flags |= ORACLE_DESCRIPTION_FLAGS.remote;
  if (text.includes('hybrid')) flags |= ORACLE_DESCRIPTION_FLAGS.hybrid;
  if (includesAny(text, ['on-site', 'onsite']))
    flags |= ORACLE_DESCRIPTION_FLAGS.onSite;
  if (includesAny(text, ['bachelor', 'b.s.', 'b.a.']))
    flags |= ORACLE_DESCRIPTION_FLAGS.degreeBachelor;
  if (includesAny(text, ['master', 'm.s.', 'mba']))
    flags |= ORACLE_DESCRIPTION_FLAGS.degreeMaster;
  if (includesAny(text, ['ph.d.', 'doctorate', 'doctoral']))
    flags |= ORACLE_DESCRIPTION_FLAGS.degreeDoctorate;
  if (text.includes('bachelor'))
    flags |= ORACLE_DESCRIPTION_FLAGS.plainBachelor;
  if (text.includes('master')) flags |= ORACLE_DESCRIPTION_FLAGS.plainMaster;
  if (text.includes('doctorate'))
    flags |= ORACLE_DESCRIPTION_FLAGS.plainDoctorate;
  if (includesAny(text, ['0 year', '1 year', '2 year']))
    flags |= ORACLE_DESCRIPTION_FLAGS.experienceEntry;
  if (includesAny(text, ['3 year', '4 year', '5 year']))
    flags |= ORACLE_DESCRIPTION_FLAGS.experienceMid;
  if (includesAny(text, ['6 year', '7 year', '8 year', '9 year', '10 year']))
    flags |= ORACLE_DESCRIPTION_FLAGS.experienceSenior;
  if (text.includes('internship'))
    flags |= ORACLE_DESCRIPTION_FLAGS.typeInternship;
  if (text.includes('contractor'))
    flags |= ORACLE_DESCRIPTION_FLAGS.typeContract;
  if (includesAny(text, ['temporary', 'fixed-term']))
    flags |= ORACLE_DESCRIPTION_FLAGS.typeTemporary;
  if (includesAny(text, ['permanent', 'regular employee']))
    flags |= ORACLE_DESCRIPTION_FLAGS.typePermanent;
  if (includesAny(text, ['full-time', 'full time', 'fte']))
    flags |= ORACLE_DESCRIPTION_FLAGS.employmentFullTime;
  if (includesAny(text, ['part-time', 'part time']))
    flags |= ORACLE_DESCRIPTION_FLAGS.employmentPartTime;
  return flags;
}

type OracleBindDefinition = {
  type: unknown;
  maxSize?: number;
};

/**
 * executeMany() uses bindDefs as the complete bind definition when it is
 * supplied. Defining only `description` therefore makes node-oracledb see one
 * bind value for the 26 placeholders in the MERGE (NJS-098). Keep every named
 * placeholder defined, while binding descriptions as CLOBs.
 */
function jobBindDefinitions(
  driver: OracleDriver,
): Record<string, OracleBindDefinition> | undefined {
  const stringType = driver.STRING;
  if (!stringType) return undefined;

  const numberType = driver.NUMBER || stringType;
  const timestampSize = 40;
  const text = (maxSize: number): OracleBindDefinition => ({
    type: stringType,
    maxSize,
  });

  return {
    id: text(36),
    source_id: text(36),
    source_ats: text(32),
    board_token: text(255),
    external_job_id: text(255),
    title: text(500),
    company_name: text(500),
    location: text(1000),
    department: text(500),
    description: driver.CLOB ? { type: driver.CLOB } : text(4_000),
    job_url: text(2_000),
    posted_at: text(timestampSize),
    updated_at: text(timestampSize),
    opt_eligible: { type: numberType },
    stem_opt_eligible: { type: numberType },
    cpt_eligible: { type: numberType },
    h1b_sponsor_status: text(64),
    created_at: text(timestampSize),
    first_seen_at: text(timestampSize),
    last_confirmed_at: text(timestampSize),
    listing_status: text(16),
    employer_board_name: text(500),
    source_trust_tier: text(32),
    employer_match_id: text(36),
    missing_since_at: text(timestampSize),
    removed_at: text(timestampSize),
  };
}

function outputOptions(driver: OracleDriver) {
  return {
    outFormat: driver.OUT_FORMAT_OBJECT,
    ...(driver.STRING
      ? { fetchInfo: { DESCRIPTION: { type: driver.STRING } } }
      : {}),
  };
}

function normalizeOracleSearchText(value: string): string {
  // BASIC_LEXER PRINTJOINS keeps `+` inside a token. Mapping punctuation used
  // by job metadata to the same join character lets terms such as m.s. and
  // fixed-term use the index without broad punctuation expansion; spaces stay
  // literal so phrase checks retain Supabase's substring semantics.
  return value.toLowerCase().replace(/[.-]/g, '+');
}

function oracleDescriptionSourceText(value: string | null): string {
  return (value || '').toLowerCase();
}

function oracleDescriptionText(value: string | null): string {
  return normalizeOracleSearchText(value || '');
}

function oracleTextWildcard(value: string): string | null {
  const normalized = normalizeOracleSearchText(value);
  // Keep user input bound, and only hand Oracle Text its literal search
  // alphabet. Terms outside it use the exact CLOB predicate below rather
  // than being interpreted as Oracle Text operators.
  if (!/^[\p{L}\p{N} +.#'-]+$/u.test(normalized)) return null;
  return `%${normalized}%`;
}

function needsOracleExactCheck(value: string): boolean {
  // A phrase can match its words in separate positions, and punctuation is
  // normalized only in the accelerator column. Keep the source CLOB check for
  // both cases so punctuation variants cannot broaden substring semantics.
  return /[\s+.-]/.test(value);
}

/**
 * Oracle implementation for the database-neutral job store. The Nest module
 * constructs it only for an explicit JOB_DATA_STORE=oracle selection; callers
 * must still provision and validate the schema/user before cutover.
 */
export class OracleJobDataStore implements JobDataStore {
  private pool: OraclePool | null = null;

  constructor(
    private readonly config: OracleJobDataConfig,
    private readonly driver: OracleDriver = loadOracleDriver(),
  ) {}

  static fromEnvironment(
    env: Record<string, string | undefined>,
    driver?: OracleDriver,
  ) {
    const config = readOracleJobDataConfig({
      ...env,
      JOB_DATA_STORE: 'oracle',
    });
    if (!config) throw new Error('Oracle job store is not selected');
    return new OracleJobDataStore(config, driver);
  }

  async initialize() {
    if (this.pool) return;
    this.pool = await this.driver.createPool({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.connectString,
      poolMin: 0,
      poolMax: this.config.poolMax,
      poolIncrement: 1,
      queueTimeout: 5_000,
      // Bound a shadow probe's connection handshake without changing the
      // database-neutral job-store contract or Supabase production path.
      connectTimeout: 10,
      stmtCacheSize: 30,
    });
  }

  async healthCheck() {
    const connection = await this.connection();
    try {
      await connection.execute('SELECT 1 AS "ok" FROM dual');
    } finally {
      await connection.close();
    }
  }

  async listJobs(query: JobStoreSearch): Promise<JobStorePage> {
    const page = Math.max(1, Math.floor(query.page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize)));
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
        [
          'title',
          'company_name',
          'employer_board_name',
          'location',
          'department',
        ]
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
      const names = query.includeJobUrls.map(
        (_, index) => `:includeUrl${index}`,
      );
      conditions.push(`job_url IN (${names.join(', ')})`);
      query.includeJobUrls.forEach((url, index) => {
        filterBinds[`includeUrl${index}`] = url;
      });
    }
    if (query.excludeJobUrls?.length) {
      const names = query.excludeJobUrls.map(
        (_, index) => `:excludeUrl${index}`,
      );
      conditions.push(`job_url NOT IN (${names.join(', ')})`);
      query.excludeJobUrls.forEach((url, index) => {
        filterBinds[`excludeUrl${index}`] = url;
      });
    }

    const where = conditions.join(' AND ');
    const pageBinds = {
      ...filterBinds,
      offset: (page - 1) * pageSize,
      pageSize,
    };
    const connection = await this.connection();
    try {
      const rowsResult = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE ${where}
         ORDER BY ${query.sortBy === 'last_confirmed_at' ? 'last_confirmed_at' : 'posted_at'} DESC NULLS LAST, id ASC
         OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
        pageBinds,
        outputOptions(this.driver),
      );
      const countResult = await connection.execute<{ TOTAL: number }>(
        `SELECT COUNT(*) AS "TOTAL" FROM jobs WHERE ${where}`,
        filterBinds,
        outputOptions(this.driver),
      );
      return {
        rows: (rowsResult.rows || []).map(mapJobRow),
        total: Number(countResult.rows?.[0]?.TOTAL || 0),
      };
    } finally {
      await connection.close();
    }
  }

  async listSourceJobs(sourceId: string): Promise<JobStoreRecord[]> {
    const connection = await this.connection();
    try {
      const rows: OracleJobRow[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const result = await connection.execute<OracleJobRow>(
          `SELECT ${JOB_COLUMNS} FROM jobs
           WHERE source_id = :sourceId
           ORDER BY id
           OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
          { sourceId, offset, pageSize },
          outputOptions(this.driver),
        );
        const page = result.rows || [];
        rows.push(...page);
        if (page.length < pageSize) break;
      }
      return rows.map(mapJobRow);
    } finally {
      await connection.close();
    }
  }

  async listSourceJobsPage(
    sourceId: string,
    offset: number,
    pageSize: number,
  ): Promise<JobStorePage> {
    const safeOffset = Math.max(0, Math.floor(offset));
    const safePageSize = Math.min(500, Math.max(1, Math.floor(pageSize)));
    const connection = await this.connection();
    try {
      const result = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs
         WHERE source_id = :sourceId AND source_trust_tier = 'verified_ats'
         ORDER BY id
         OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
        { sourceId, offset: safeOffset, pageSize: safePageSize },
        outputOptions(this.driver),
      );
      const countResult = await connection.execute<{ TOTAL: number }>(
        `SELECT COUNT(*) AS "TOTAL" FROM jobs
         WHERE source_id = :sourceId AND source_trust_tier = 'verified_ats'`,
        { sourceId },
        outputOptions(this.driver),
      );
      return {
        rows: (result.rows || []).map(mapJobRow),
        total: Number(countResult.rows?.[0]?.TOTAL || 0),
      };
    } finally {
      await connection.close();
    }
  }

  async getJob(id: string) {
    const connection = await this.connection();
    try {
      const result = await connection.execute<OracleJobRow>(
        `SELECT ${JOB_COLUMNS} FROM jobs WHERE id = :id`,
        { id },
        outputOptions(this.driver),
      );
      const row = result.rows?.[0];
      return row ? mapJobRow(row) : null;
    } finally {
      await connection.close();
    }
  }

  async listVisaSignals(
    jobIds: readonly string[],
  ): Promise<JobStoreVisaSignal[]> {
    if (!jobIds.length) return [];
    const names = jobIds.map((_, index) => `:jobId${index}`);
    const binds = Object.fromEntries(
      jobIds.map((jobId, index) => [`jobId${index}`, jobId]),
    );
    const connection = await this.connection();
    try {
      const result = await connection.execute<{
        JOB_ID: string;
        SIGNAL_TYPE: string;
        EVIDENCE_SNIPPET: string;
        SOURCE_URL: string;
        OBSERVED_DATE: Date | string;
        CONFIDENCE: number;
        SOURCE: string;
      }>(
        `SELECT job_id AS "JOB_ID", signal_type AS "SIGNAL_TYPE",
                evidence_snippet AS "EVIDENCE_SNIPPET", source_url AS "SOURCE_URL",
                TO_CHAR(observed_date, 'YYYY-MM-DD') AS "OBSERVED_DATE", confidence AS "CONFIDENCE",
                source AS "SOURCE"
         FROM job_visa_signals
         WHERE job_id IN (${names.join(', ')})`,
        binds,
        outputOptions(this.driver),
      );
      return (result.rows || []).map((row) => ({
        jobId: String(row.JOB_ID),
        signalType: String(row.SIGNAL_TYPE),
        evidenceSnippet: String(row.EVIDENCE_SNIPPET),
        sourceUrl: String(row.SOURCE_URL),
        observedDate:
          row.OBSERVED_DATE instanceof Date
            ? row.OBSERVED_DATE.toISOString().slice(0, 10)
            : String(row.OBSERVED_DATE),
        confidence: Number(row.CONFIDENCE),
        source: String(row.SOURCE),
      }));
    } finally {
      await connection.close();
    }
  }

  async upsertJobs(rows: readonly JobStoreRecord[]) {
    if (!rows.length) return;
    const connection = await this.connection();
    try {
      const bindDefs = jobBindDefinitions(this.driver);
      await connection.executeMany(
        `MERGE INTO jobs target
         USING (SELECT :id id, :source_id source_id, :source_ats source_ats,
                       :board_token board_token, :external_job_id external_job_id,
                       :title title, :company_name company_name, :location location,
                       :department department, :description description, :job_url job_url,
                       TO_TIMESTAMP_TZ(:posted_at, '${ORACLE_ISO_TZ_FORMAT}') posted_at,
                       TO_TIMESTAMP_TZ(:updated_at, '${ORACLE_ISO_TZ_FORMAT}') updated_at,
                       :opt_eligible opt_eligible, :stem_opt_eligible stem_opt_eligible,
                       :cpt_eligible cpt_eligible, :h1b_sponsor_status h1b_sponsor_status,
                       TO_TIMESTAMP_TZ(:created_at, '${ORACLE_ISO_TZ_FORMAT}') created_at,
                       TO_TIMESTAMP_TZ(:first_seen_at, '${ORACLE_ISO_TZ_FORMAT}') first_seen_at,
                       TO_TIMESTAMP_TZ(:last_confirmed_at, '${ORACLE_ISO_TZ_FORMAT}') last_confirmed_at,
                       :listing_status listing_status, :employer_board_name employer_board_name,
                       :source_trust_tier source_trust_tier, :employer_match_id employer_match_id,
                       TO_TIMESTAMP_TZ(:missing_since_at, '${ORACLE_ISO_TZ_FORMAT}') missing_since_at,
                       TO_TIMESTAMP_TZ(:removed_at, '${ORACLE_ISO_TZ_FORMAT}') removed_at
                FROM dual) incoming
         ON (target.source_ats = incoming.source_ats
             AND target.board_token = incoming.board_token
             AND target.external_job_id = incoming.external_job_id)
         WHEN MATCHED THEN UPDATE SET
           target.title = incoming.title,
           target.company_name = incoming.company_name,
           target.location = incoming.location,
           target.department = incoming.department,
           target.description = incoming.description,
           target.job_url = incoming.job_url,
           target.posted_at = incoming.posted_at,
           target.updated_at = incoming.updated_at,
           target.opt_eligible = incoming.opt_eligible,
           target.stem_opt_eligible = incoming.stem_opt_eligible,
           target.cpt_eligible = incoming.cpt_eligible,
           target.h1b_sponsor_status = incoming.h1b_sponsor_status,
           target.created_at = incoming.created_at,
           target.first_seen_at = incoming.first_seen_at,
           target.last_confirmed_at = incoming.last_confirmed_at,
           target.listing_status = incoming.listing_status,
           target.employer_board_name = incoming.employer_board_name,
           target.source_trust_tier = incoming.source_trust_tier,
           target.employer_match_id = incoming.employer_match_id,
           target.missing_since_at = incoming.missing_since_at,
           target.removed_at = incoming.removed_at
         WHEN NOT MATCHED THEN INSERT (${JOB_COLUMNS}) VALUES (
           incoming.id, incoming.source_id, incoming.source_ats, incoming.board_token,
           incoming.external_job_id, incoming.title, incoming.company_name,
           incoming.location, incoming.department, incoming.description, incoming.job_url,
           incoming.posted_at, incoming.updated_at, incoming.opt_eligible,
           incoming.stem_opt_eligible, incoming.cpt_eligible, incoming.h1b_sponsor_status,
           incoming.created_at, incoming.first_seen_at, incoming.last_confirmed_at,
           incoming.listing_status, incoming.employer_board_name, incoming.source_trust_tier,
           incoming.employer_match_id, incoming.missing_since_at, incoming.removed_at
         )`,
        rows.map((row) => ({
          id: row.id,
          source_id: row.sourceId,
          source_ats: row.sourceAts,
          board_token: row.boardToken,
          external_job_id: row.externalJobId,
          title: row.title,
          company_name: row.companyName,
          location: row.location,
          department: row.department,
          description: row.description,
          job_url: row.jobUrl,
          posted_at: toOracleTimestamp(row.postedAt),
          updated_at: toOracleTimestamp(row.updatedAt),
          opt_eligible: boolToNumber(row.optEligible),
          stem_opt_eligible: boolToNumber(row.stemOptEligible),
          cpt_eligible: boolToNumber(row.cptEligible),
          h1b_sponsor_status: row.h1bSponsorStatus,
          created_at: toOracleTimestamp(row.createdAt),
          first_seen_at: toOracleTimestamp(row.firstSeenAt),
          last_confirmed_at: toOracleTimestamp(row.lastConfirmedAt),
          listing_status: row.listingStatus,
          employer_board_name: row.employerBoardName,
          source_trust_tier: row.sourceTrustTier,
          employer_match_id: row.employerMatchId,
          missing_since_at: toOracleTimestamp(row.missingSinceAt),
          removed_at: toOracleTimestamp(row.removedAt),
        })),
        {
          autoCommit: false,
          ...(bindDefs ? { bindDefs } : {}),
        },
      );
      const searchBindDefs = this.driver.STRING
        ? {
            job_id: { type: this.driver.STRING, maxSize: 36 },
            search_text: this.driver.CLOB
              ? { type: this.driver.CLOB }
              : { type: this.driver.STRING, maxSize: 4_000 },
            search_text_index: this.driver.CLOB
              ? { type: this.driver.CLOB }
              : { type: this.driver.STRING, maxSize: 4_000 },
            description_filter_flags: this.driver.NUMBER
              ? { type: this.driver.NUMBER }
              : { type: this.driver.STRING, maxSize: 12 },
          }
        : undefined;
      await connection.executeMany(
        `MERGE INTO ${ORACLE_JOB_SEARCH_TABLE} target
         USING (SELECT :job_id job_id, :search_text search_text,
                       :search_text_index search_text_index,
                       :description_filter_flags description_filter_flags FROM dual) incoming
         ON (target.job_id = incoming.job_id)
         WHEN MATCHED THEN UPDATE SET
           target.search_text = incoming.search_text,
           target.search_text_index = incoming.search_text_index,
           target.description_filter_flags = incoming.description_filter_flags
         WHEN NOT MATCHED THEN INSERT (job_id, search_text, search_text_index, description_filter_flags)
           VALUES (incoming.job_id, incoming.search_text, incoming.search_text_index, incoming.description_filter_flags)`,
        rows.map((row) => ({
          job_id: row.id,
          search_text: oracleDescriptionSourceText(row.description),
          search_text_index: oracleDescriptionText(row.description),
          description_filter_flags: descriptionFilterFlags(row.description),
        })),
        {
          autoCommit: false,
          ...(searchBindDefs ? { bindDefs: searchBindDefs } : {}),
        },
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /**
   * Writes posting/sponsor signals next to Oracle jobs when the Oracle store is
   * explicitly selected. Employer matches and H-1B sponsors remain in
   * Supabase; the caller supplies the already-composed signal payload.
   */
  async replaceVisaSignals(
    jobIds: readonly string[],
    signals: readonly {
      job_id: string;
      signal_type: string;
      evidence_snippet: string;
      source_url: string;
      observed_date: string;
      confidence: number;
      source: string;
    }[],
  ) {
    if (!jobIds.length) return;
    const mappedSignals = signals.map((signal) => ({
      jobId: signal.job_id,
      signalType: signal.signal_type,
      evidenceSnippet: signal.evidence_snippet,
      sourceUrl: signal.source_url,
      observedDate: signal.observed_date,
      confidence: signal.confidence,
      source: signal.source,
    }));
    this.validateVisaSignals(mappedSignals);
    const allowed = new Set(jobIds);
    if (mappedSignals.some((signal) => !allowed.has(signal.jobId)))
      throw new Error('Evidence job is outside source scope');
    const connection = await this.connection();
    try {
      for (let offset = 0; offset < jobIds.length; offset += 250) {
        await connection.executeMany(
          `DELETE FROM job_visa_signals
         WHERE job_id = :jobId AND source = 'employer_posting'`,
          jobIds.slice(offset, offset + 250).map((jobId) => ({ jobId })),
          { autoCommit: false },
        );
      }
      await this.mergeVisaSignals(connection, mappedSignals);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  /** Non-destructive, idempotent evidence migration; never reconciles or deletes. */
  async upsertVisaSignals(
    signals: readonly (JobStoreVisaSignal & { id?: string })[],
  ) {
    if (!signals.length) return;
    this.validateVisaSignals(signals);
    const connection = await this.connection();
    try {
      await this.mergeVisaSignals(connection, signals);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  private validateVisaSignals(signals: readonly JobStoreVisaSignal[]) {
    for (const signal of signals) {
      if (
        [...signal.evidenceSnippet].length > 2000 ||
        [...signal.sourceUrl].length > 2000 ||
        signal.signalType.length > 64 ||
        signal.source.length > 64
      )
        throw new Error('Evidence exceeds Oracle column limits');
      if (
        !signal.jobId ||
        !signal.signalType ||
        !signal.evidenceSnippet ||
        !signal.sourceUrl ||
        !signal.source ||
        !Number.isFinite(signal.confidence) ||
        signal.confidence < 0 ||
        signal.confidence > 1 ||
        Number(signal.confidence.toFixed(3)) !== signal.confidence
      )
        throw new Error('Invalid evidence value');
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(signal.observedDate) ||
        new Date(`${signal.observedDate}T00:00:00Z`)
          .toISOString()
          .slice(0, 10) !== signal.observedDate
      )
        throw new Error('Invalid evidence date');
    }
  }

  private async mergeVisaSignals(
    connection: OracleConnection,
    signals: readonly (JobStoreVisaSignal & { id?: string })[],
  ) {
    for (let offset = 0; offset < signals.length; offset += 250) {
      await connection.executeMany(
        `MERGE INTO job_visa_signals target
         USING (SELECT :id id, :job_id job_id, :signal_type signal_type,
                       :evidence_snippet evidence_snippet, :source_url source_url,
                       TO_DATE(:observed_date, 'YYYY-MM-DD') observed_date,
                       :confidence confidence, :source source FROM dual) incoming
         ON (target.job_id = incoming.job_id
             AND target.signal_type = incoming.signal_type
             AND target.source = incoming.source
             AND target.source_url = incoming.source_url)
         WHEN MATCHED THEN UPDATE SET
           target.evidence_snippet = incoming.evidence_snippet,
           target.observed_date = incoming.observed_date,
           target.confidence = incoming.confidence
         WHEN NOT MATCHED THEN INSERT
           (id, job_id, signal_type, evidence_snippet, source_url,
            observed_date, confidence, source)
         VALUES
           (incoming.id, incoming.job_id, incoming.signal_type,
            incoming.evidence_snippet, incoming.source_url,
            incoming.observed_date, incoming.confidence, incoming.source)`,
        signals.slice(offset, offset + 250).map((signal) => ({
          id: signal.id || randomUUID(),
          job_id: signal.jobId,
          signal_type: signal.signalType,
          evidence_snippet: signal.evidenceSnippet,
          source_url: signal.sourceUrl,
          observed_date: signal.observedDate,
          confidence: signal.confidence,
          source: signal.source,
        })),
        {
          autoCommit: false,
          ...(this.driver.STRING
            ? {
                bindDefs: {
                  id: { type: this.driver.STRING, maxSize: 36 },
                  job_id: { type: this.driver.STRING, maxSize: 36 },
                  signal_type: { type: this.driver.STRING, maxSize: 256 },
                  evidence_snippet: { type: this.driver.STRING, maxSize: 8000 },
                  source_url: { type: this.driver.STRING, maxSize: 8000 },
                  observed_date: { type: this.driver.STRING, maxSize: 10 },
                  confidence: { type: this.driver.NUMBER },
                  source: { type: this.driver.STRING, maxSize: 256 },
                },
              }
            : {}),
        },
      );
    }
  }

  async reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
  ) {
    // An empty authoritative response must be handled by the caller's
    // empty-feed protection. Never turn an empty list into mass removals.
    if (!seenExternalJobIds.length) return;
    const connection = await this.connection();
    try {
      const seen = new Set(seenExternalJobIds.map(String));
      const missingIds: string[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const existing = await connection.execute<{
          ID: string;
          EXTERNAL_JOB_ID: string;
          LISTING_STATUS: string;
        }>(
          `SELECT id AS "ID", external_job_id AS "EXTERNAL_JOB_ID",
                  listing_status AS "LISTING_STATUS"
           FROM jobs
           WHERE source_id = :sourceId AND listing_status <> 'removed'
           ORDER BY id
           OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
          { sourceId, offset, pageSize },
          outputOptions(this.driver),
        );
        const page = existing.rows || [];
        for (const row of page) {
          if (!seen.has(String(row.EXTERNAL_JOB_ID))) {
            missingIds.push(row.ID);
          }
        }
        if (page.length < pageSize) break;
      }
      if (!missingIds.length) return;
      await connection.executeMany(
        `UPDATE jobs SET
           listing_status = CASE WHEN listing_status = 'open' THEN 'stale' ELSE 'removed' END,
           missing_since_at = COALESCE(missing_since_at, SYSTIMESTAMP),
           removed_at = CASE WHEN listing_status = 'stale' THEN SYSTIMESTAMP ELSE removed_at END
         WHERE id = :id`,
        missingIds.map((id) => ({ id })),
        { autoCommit: false },
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.close();
    }
  }

  async close() {
    if (!this.pool) return;
    await this.pool.close(5);
    this.pool = null;
  }

  private async connection() {
    await this.initialize();
    if (!this.pool) throw new Error('Oracle job store pool is unavailable');
    return this.pool.getConnection();
  }
}
