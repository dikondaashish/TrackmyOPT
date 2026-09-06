import {
  type JobStoreRecord,
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

export type OraclePool = {
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

type OracleJobRow = Record<string, unknown>;

export function boolToNumber(value: boolean | null) {
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

export function mapJobRow(row: OracleJobRow): JobStoreRecord {
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

export const JOB_COLUMNS = `
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
export function jobBindDefinitions(
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

export function outputOptions(driver: OracleDriver) {
  return {
    outFormat: driver.OUT_FORMAT_OBJECT,
    ...(driver.STRING
      ? { fetchInfo: { DESCRIPTION: { type: driver.STRING } } }
      : {}),
  };
}

export function normalizeOracleSearchText(value: string): string {
  // BASIC_LEXER PRINTJOINS keeps `+` inside a token. Mapping punctuation used
  // by job metadata to the same join character lets terms such as m.s. and
  // fixed-term use the index without broad punctuation expansion; spaces stay
  // literal so phrase checks retain Supabase's substring semantics.
  return value.toLowerCase().replace(/[.-]/g, '+');
}

export function oracleDescriptionSourceText(value: string | null): string {
  return (value || '').toLowerCase();
}

export function oracleDescriptionText(value: string | null): string {
  return normalizeOracleSearchText(value || '');
}

export function oracleTextWildcard(value: string): string | null {
  const normalized = normalizeOracleSearchText(value);
  // Keep user input bound, and only hand Oracle Text its literal search
  // alphabet. Terms outside it use the exact CLOB predicate below rather
  // than being interpreted as Oracle Text operators.
  if (!/^[\p{L}\p{N} +.#'-]+$/u.test(normalized)) return null;
  return `%${normalized}%`;
}

export function needsOracleExactCheck(value: string): boolean {
  // A phrase can match its words in separate positions, and punctuation is
  // normalized only in the accelerator column. Keep the source CLOB check for
  // both cases so punctuation variants cannot broaden substring semantics.
  return /[\s+.-]/.test(value);
}
