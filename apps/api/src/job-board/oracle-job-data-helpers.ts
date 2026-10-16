import type { AtsJobFacts } from './ats-job-facts';
import {
  type JobStoreRecord,
  type JobStoreVisaSignal,
} from './job-data-store.contract';
import { experienceBucket, inferTextJobFacts } from './job-facts';

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
  /** node-oracledb round-trip limit in milliseconds (0 = unlimited). */
  callTimeout?: number;
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

export type OracleJobRow = Record<string, unknown>;

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
 * Filter evidence materialized in TRACKMYOPT_JOB_SEARCH.description_filter_flags
 * so filters never re-scan description CLOBs. Bits 1-16384 hold evidence the
 * description states (see job-facts.ts: whole words and phrases, never
 * substrings). Bits from 262144 up hold the ATS's own structured fields
 * (Ashby workplaceType/employmentType, Greenhouse metadata), which the query
 * prefers over description wording.
 *
 * Experience: exactly one bucket bit, from the minimum years the posting
 * requires (entry: up to 2, mid: 3 to 5, senior: more than 5), or none when
 * no requirement is stated.
 *
 * Bits 32768-131072 held plain-word degree evidence in an earlier version and
 * are no longer set or read.
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
  atsRemote: 262144,
  atsHybrid: 524288,
  atsOnSite: 1048576,
  atsFullTime: 2097152,
  atsPartTime: 4194304,
  atsInternship: 8388608,
  atsContract: 16777216,
  atsTemporary: 33554432,
  atsPermanent: 67108864,
} as const;

const FLAGS = ORACLE_DESCRIPTION_FLAGS;

export const ORACLE_DESCRIPTION_FLAG_MASKS = {
  degrees: FLAGS.degreeBachelor | FLAGS.degreeMaster | FLAGS.degreeDoctorate,
  experiences:
    FLAGS.experienceEntry | FLAGS.experienceMid | FLAGS.experienceSenior,
  jobTypes:
    FLAGS.typeInternship |
    FLAGS.typeContract |
    FLAGS.typeTemporary |
    FLAGS.typePermanent,
  employmentTypes: FLAGS.employmentFullTime | FLAGS.employmentPartTime,
  atsWorkplace: FLAGS.atsRemote | FLAGS.atsHybrid | FLAGS.atsOnSite,
  atsEmployment: FLAGS.atsFullTime | FLAGS.atsPartTime,
  /** Every bit that only ingestion can set (from ATS fields, not text). */
  ats:
    FLAGS.atsRemote |
    FLAGS.atsHybrid |
    FLAGS.atsOnSite |
    FLAGS.atsFullTime |
    FLAGS.atsPartTime |
    FLAGS.atsInternship |
    FLAGS.atsContract |
    FLAGS.atsTemporary |
    FLAGS.atsPermanent,
} as const;

const EXPERIENCE_FLAG = {
  entry: FLAGS.experienceEntry,
  mid: FLAGS.experienceMid,
  senior: FLAGS.experienceSenior,
} as const;

/** Flags for what the description itself states. */
export function textFilterFlags(description: string | null): number {
  const facts = inferTextJobFacts(description);
  let flags = 0;
  const set = (condition: boolean, flag: number) => {
    if (condition) flags |= flag;
  };
  set(facts.workplaces.includes('remote'), FLAGS.remote);
  set(facts.workplaces.includes('hybrid'), FLAGS.hybrid);
  set(facts.workplaces.includes('on_site'), FLAGS.onSite);
  set(facts.degreeLevels.includes('bachelor'), FLAGS.degreeBachelor);
  set(facts.degreeLevels.includes('master'), FLAGS.degreeMaster);
  set(facts.degreeLevels.includes('doctorate'), FLAGS.degreeDoctorate);
  const bucket = experienceBucket(facts.minimumExperienceYears);
  if (bucket) flags |= EXPERIENCE_FLAG[bucket];
  set(facts.jobTypes.includes('internship'), FLAGS.typeInternship);
  set(facts.jobTypes.includes('contract'), FLAGS.typeContract);
  set(facts.jobTypes.includes('temporary'), FLAGS.typeTemporary);
  set(facts.jobTypes.includes('permanent'), FLAGS.typePermanent);
  set(facts.employmentTypes.includes('full_time'), FLAGS.employmentFullTime);
  set(facts.employmentTypes.includes('part_time'), FLAGS.employmentPartTime);
  return flags;
}

const ATS_WORKPLACE_FLAG = {
  remote: FLAGS.atsRemote,
  hybrid: FLAGS.atsHybrid,
  on_site: FLAGS.atsOnSite,
} as const;

const ATS_EMPLOYMENT_FLAG = {
  full_time: FLAGS.atsFullTime,
  part_time: FLAGS.atsPartTime,
  internship: FLAGS.atsInternship,
  contract: FLAGS.atsContract,
  temporary: FLAGS.atsTemporary,
  permanent: FLAGS.atsPermanent,
} as const;

/** Flags for the ATS's structured workplace and employment fields. */
export function atsFilterFlags(facts: AtsJobFacts | null | undefined): number {
  if (!facts) return 0;
  let flags = facts.workplace ? ATS_WORKPLACE_FLAG[facts.workplace] : 0;
  for (const type of facts.employmentTypes) flags |= ATS_EMPLOYMENT_FLAG[type];
  return flags;
}

export function descriptionFilterFlags(
  description: string | null,
  ats?: AtsJobFacts | null,
): number {
  return textFilterFlags(description) | atsFilterFlags(ats);
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

/** Oracle Text's maximum token length in bytes. */
export const ORACLE_TEXT_MAX_TOKEN_LENGTH = 64;

// A lexer token is a run of letters, digits and the `+` printjoin. Runs longer
// than Oracle Text's token limit are never words: they are embedded data such
// as base64 images. With prefix and wildcard indexing on, every commit of a
// source whose descriptions carried base64 blobs (amboss, 2026-10-15) spent
// from 45 minutes to 14 hours of CPU in the commit-time sync, so the index
// column drops them. The exact-match search_text column keeps the full
// description.
const OVERLONG_TOKEN = new RegExp(
  `[\\p{L}\\p{N}+]{${ORACLE_TEXT_MAX_TOKEN_LENGTH + 1},}`,
  'gu',
);

export function oracleDescriptionText(value: string | null): string {
  return normalizeOracleSearchText(value || '').replace(OVERLONG_TOKEN, ' ');
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

export function toJobUpsertBinds(row: JobStoreRecord) {
  return {
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
  };
}

export function toJobSearchUpsertBinds(row: JobStoreRecord) {
  return {
    job_id: row.id,
    search_text: oracleDescriptionSourceText(row.description),
    search_text_index: oracleDescriptionText(row.description),
    description_filter_flags: descriptionFilterFlags(
      row.description,
      row.atsFacts,
    ),
  };
}

export function toJobSearchFlagsBinds(row: JobStoreRecord) {
  return {
    job_id: row.id,
    description_filter_flags: descriptionFilterFlags(
      row.description,
      row.atsFacts,
    ),
  };
}

export function searchFlagsBindDefinitions(
  driver: OracleDriver,
): Record<string, OracleBindDefinition> | undefined {
  if (!driver.STRING) return undefined;
  return {
    job_id: { type: driver.STRING, maxSize: 36 },
    description_filter_flags: driver.NUMBER
      ? { type: driver.NUMBER }
      : { type: driver.STRING, maxSize: 12 },
  };
}

export function searchBindDefinitions(
  driver: OracleDriver,
): Record<string, OracleBindDefinition> | undefined {
  if (!driver.STRING) return undefined;
  return {
    job_id: { type: driver.STRING, maxSize: 36 },
    search_text: driver.CLOB
      ? { type: driver.CLOB }
      : { type: driver.STRING, maxSize: 4_000 },
    search_text_index: driver.CLOB
      ? { type: driver.CLOB }
      : { type: driver.STRING, maxSize: 4_000 },
    description_filter_flags: driver.NUMBER
      ? { type: driver.NUMBER }
      : { type: driver.STRING, maxSize: 12 },
  };
}

export function mapVisaSignalRow(row: {
  JOB_ID: string;
  SIGNAL_TYPE: string;
  EVIDENCE_SNIPPET: string;
  SOURCE_URL: string;
  OBSERVED_DATE: Date | string;
  CONFIDENCE: number;
  SOURCE: string;
}): JobStoreVisaSignal {
  return {
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
  };
}

export function validateVisaSignals(signals: readonly JobStoreVisaSignal[]) {
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

export function toVisaSignalUpsertBinds(
  signal: JobStoreVisaSignal & { id?: string },
  id: string,
) {
  return {
    id,
    job_id: signal.jobId,
    signal_type: signal.signalType,
    evidence_snippet: signal.evidenceSnippet,
    source_url: signal.sourceUrl,
    observed_date: signal.observedDate,
    confidence: signal.confidence,
    source: signal.source,
  };
}

export function visaSignalBindDefinitions(
  driver: OracleDriver,
): Record<string, OracleBindDefinition> | undefined {
  if (!driver.STRING) return undefined;
  return {
    id: { type: driver.STRING, maxSize: 36 },
    job_id: { type: driver.STRING, maxSize: 36 },
    signal_type: { type: driver.STRING, maxSize: 256 },
    evidence_snippet: { type: driver.STRING, maxSize: 8000 },
    source_url: { type: driver.STRING, maxSize: 8000 },
    observed_date: { type: driver.STRING, maxSize: 10 },
    confidence: { type: driver.NUMBER },
    source: { type: driver.STRING, maxSize: 256 },
  };
}
