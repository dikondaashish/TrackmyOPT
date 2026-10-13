/**
 * Oracle copy of the static DOL LCA `h1b_filings` reference table.
 *
 * One column list drives the Oracle DDL, the idempotent MERGE, and the row
 * conversion, so the three cannot drift apart. The source of truth during the
 * copy is the Supabase filings project; nothing here writes to Supabase.
 */

export type FilingColumnKind =
  | 'uuid'
  | 'text'
  | 'date'
  | 'int'
  | 'num'
  | 'tstz';

const TEXT = 'text' as const;
const DATE = 'date' as const;
const INT = 'int' as const;
const NUM = 'num' as const;

export const H1B_FILING_COLUMNS: ReadonlyArray<
  readonly [name: string, kind: FilingColumnKind]
> = [
  ['id', 'uuid'],
  ['case_number', TEXT],
  ['status', TEXT],
  ['received_date', DATE],
  ['decision_date', DATE],
  ['original_cert_date', DATE],
  ['visa_class', TEXT],
  ['job_title', TEXT],
  ['soc_code', TEXT],
  ['soc_title', TEXT],
  ['full_time_position', TEXT],
  ['begin_date', DATE],
  ['end_date', DATE],
  ['total_workers', INT],
  ['employer_name', TEXT],
  ['employer_address1', TEXT],
  ['employer_address2', TEXT],
  ['employer_city', TEXT],
  ['employer_state', TEXT],
  ['employer_postal_code', TEXT],
  ['employer_country', TEXT],
  ['employer_phone', TEXT],
  ['employer_phone_ext', TEXT],
  ['employer_province', TEXT],
  ['employer_fein', TEXT],
  ['naics_code', TEXT],
  ['employer_poc_name', TEXT],
  ['employer_poc_job_title', TEXT],
  ['employer_poc_address1', TEXT],
  ['employer_poc_address2', TEXT],
  ['employer_poc_city', TEXT],
  ['employer_poc_state', TEXT],
  ['employer_poc_postal_code', TEXT],
  ['employer_poc_province', TEXT],
  ['employer_poc_country', TEXT],
  ['employer_poc_email', TEXT],
  ['employer_poc_phone', TEXT],
  ['employer_poc_phone_ext', TEXT],
  ['agent_attorney_name', TEXT],
  ['agent_attorney_address1', TEXT],
  ['agent_attorney_address2', TEXT],
  ['agent_attorney_city', TEXT],
  ['agent_attorney_state', TEXT],
  ['agent_attorney_postal_code', TEXT],
  ['agent_attorney_province', TEXT],
  ['agent_attorney_country', TEXT],
  ['agent_attorney_email', TEXT],
  ['agent_attorney_phone', TEXT],
  ['agent_attorney_phone_ext', TEXT],
  ['agent_representing_employer', TEXT],
  ['lawfirm_name', TEXT],
  ['lawfirm_business_fein', TEXT],
  ['worksite_address1', TEXT],
  ['worksite_address2', TEXT],
  ['worksite_city', TEXT],
  ['worksite_county', TEXT],
  ['worksite_state', TEXT],
  ['worksite_postal_code', TEXT],
  ['worksite_workers', INT],
  ['total_worksite_locations', INT],
  ['trade_name_dba', TEXT],
  ['secondary_entity', TEXT],
  ['secondary_entity_business_name', TEXT],
  ['wage_rate_from', NUM],
  ['wage_rate_to', NUM],
  ['wage_unit', TEXT],
  ['prevailing_wage', NUM],
  ['pw_unit', TEXT],
  ['pw_wage_level', TEXT],
  ['pw_source', TEXT],
  ['pw_source_year', INT],
  ['pw_other_source', TEXT],
  ['pw_other_year', INT],
  ['pw_tracking_number', TEXT],
  ['pw_survey_name', TEXT],
  ['pw_survey_publisher', TEXT],
  ['sponsor_id', TEXT],
  ['new_employment', INT],
  ['continued_employment', INT],
  ['change_previous_employment', INT],
  ['new_concurrent_employment', INT],
  ['change_employer', INT],
  ['amended_petition', INT],
  ['h_1b_dependent', TEXT],
  ['willful_violator', TEXT],
  ['support_h1b', TEXT],
  ['appendix_a_attached', TEXT],
  ['public_disclosure', TEXT],
  ['agree_to_lc_statement', TEXT],
  ['statutory_basis', TEXT],
  ['preparer_first_name', TEXT],
  ['preparer_middle_initial', TEXT],
  ['preparer_last_name', TEXT],
  ['preparer_business_name', TEXT],
  ['preparer_email', TEXT],
  ['created_at', 'tstz'],
  ['state_of_highest_court', TEXT],
  ['name_of_highest_state_court', TEXT],
];

/** Longest observed text value is under 120 characters; 500 leaves headroom. */
export const FILING_TEXT_MAX = 500;

const ORACLE_TYPES: Record<FilingColumnKind, string> = {
  uuid: 'VARCHAR2(36 CHAR)',
  text: `VARCHAR2(${FILING_TEXT_MAX} CHAR)`,
  date: 'DATE',
  int: 'NUMBER(10)',
  num: 'NUMBER',
  tstz: 'TIMESTAMP(6) WITH TIME ZONE',
};

const NOT_NULL = new Set(['id', 'case_number']);

/** Indexes match the sponsor profile lookups (by sponsor, then employer name). */
export const H1B_FILING_INDEXES = [
  'CREATE INDEX h1b_filings_case_number_idx ON h1b_filings (case_number)',
  'CREATE INDEX h1b_filings_sponsor_idx ON h1b_filings (sponsor_id, received_date DESC)',
  'CREATE INDEX h1b_filings_employer_idx ON h1b_filings (employer_name, received_date DESC)',
  'CREATE INDEX h1b_filings_employer_upper_idx ON h1b_filings (UPPER(employer_name))',
];

export function buildH1bFilingsDdl() {
  const width = Math.max(...H1B_FILING_COLUMNS.map(([name]) => name.length));
  const columns = H1B_FILING_COLUMNS.map(
    ([name, kind]) =>
      `  ${name.padEnd(width)} ${ORACLE_TYPES[kind]}${NOT_NULL.has(name) ? ' NOT NULL' : ''},`,
  );
  return [
    'CREATE TABLE h1b_filings (',
    ...columns,
    '  CONSTRAINT h1b_filings_pk PRIMARY KEY (id)',
    ');',
    '',
    ...H1B_FILING_INDEXES.map((statement) => `${statement};`),
  ].join('\n');
}

function bindExpression(name: string, kind: FilingColumnKind) {
  if (kind === 'date') return `TO_DATE(:${name}, 'YYYY-MM-DD')`;
  if (kind === 'tstz')
    return `TO_TIMESTAMP_TZ(:${name}, 'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM')`;
  return `:${name}`;
}

/** Idempotent upsert keyed on the preserved Supabase id. */
export function buildH1bFilingsMergeSql() {
  const source = H1B_FILING_COLUMNS.map(
    ([name, kind]) => `${bindExpression(name, kind)} AS ${name}`,
  ).join(',\n    ');
  const updates = H1B_FILING_COLUMNS.filter(([name]) => name !== 'id')
    .map(([name]) => `t.${name} = s.${name}`)
    .join(',\n    ');
  const names = H1B_FILING_COLUMNS.map(([name]) => name);
  return `MERGE INTO h1b_filings t
USING (
  SELECT
    ${source}
  FROM dual
) s
ON (t.id = s.id)
WHEN MATCHED THEN UPDATE SET
    ${updates}
WHEN NOT MATCHED THEN INSERT (${names.join(', ')})
VALUES (${names.map((name) => `s.${name}`).join(', ')})`;
}

export type FilingBinds = Record<string, string | number | null>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function scalarText(value: unknown, name: string) {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value);
  throw new Error(`Filing ${name} is not a scalar value`);
}

/**
 * Supabase returns timestamptz as "2026-01-14T12:34:56.123456+00:00" and may
 * drop the fraction; Oracle's FF mask needs one, so normalise to ".0".
 */
export function normaliseTimestamp(value: string) {
  const match =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}(?::?\d{2})?)$/.exec(
      value,
    );
  if (!match) throw new Error('Unrecognised timestamp value');
  const [, base, fraction = '.0', zone] = match;
  const offset =
    zone === 'Z'
      ? '+00:00'
      : /^[+-]\d{2}$/.test(zone)
        ? `${zone}:00`
        : zone.includes(':')
          ? zone
          : `${zone.slice(0, 3)}:${zone.slice(3)}`;
  return `${base}${fraction}${offset}`;
}

/** Convert one Supabase row to Oracle binds, rejecting values that would lose data. */
export function toFilingBinds(row: Record<string, unknown>): FilingBinds {
  const binds: FilingBinds = {};
  for (const [name, kind] of H1B_FILING_COLUMNS) {
    const value = row[name];
    if (value === null || value === undefined || value === '') {
      if (NOT_NULL.has(name)) throw new Error(`Filing is missing ${name}`);
      binds[name] = null;
      continue;
    }
    if (kind === 'int' || kind === 'num') {
      const numeric = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(numeric))
        throw new Error(`Filing ${name} is not numeric`);
      if (kind === 'int' && !Number.isInteger(numeric))
        throw new Error(`Filing ${name} is not an integer`);
      binds[name] = numeric;
      continue;
    }
    const text = scalarText(value, name);
    if (kind === 'date' && !DATE_PATTERN.test(text))
      throw new Error(`Filing ${name} is not a date`);
    if (kind === 'text' && text.length > FILING_TEXT_MAX)
      throw new Error(`Filing ${name} exceeds ${FILING_TEXT_MAX} characters`);
    binds[name] = kind === 'tstz' ? normaliseTimestamp(text) : text;
  }
  return binds;
}

type BindTypes = { STRING: unknown; NUMBER: unknown };

export function filingBindDefinitions(driver: BindTypes) {
  return Object.fromEntries(
    H1B_FILING_COLUMNS.map(([name, kind]) => [
      name,
      kind === 'int' || kind === 'num'
        ? { type: driver.NUMBER }
        : {
            type: driver.STRING,
            maxSize: kind === 'text' ? FILING_TEXT_MAX * 4 : 64,
          },
    ]),
  );
}

/**
 * Verification select. Dates and timestamps come back as text so the driver's
 * local time zone cannot shift them before comparison.
 */
export function buildH1bFilingsVerifySql(idCount: number) {
  const columns = H1B_FILING_COLUMNS.map(([name, kind]) => {
    if (kind === 'date') return `TO_CHAR(${name}, 'YYYY-MM-DD') AS ${name}`;
    if (kind === 'tstz')
      return `TO_CHAR(${name} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS') || 'Z' AS ${name}`;
    return name;
  }).join(', ');
  const binds = Array.from({ length: idCount }, (_, index) => `:id${index}`);
  return `SELECT ${columns} FROM h1b_filings WHERE id IN (${binds.join(', ')})`;
}

/**
 * Comparable projection used by verification: Oracle and Supabase rows are
 * reduced to the same string form per column before comparison.
 */
export function comparableFiling(row: Record<string, unknown>) {
  return H1B_FILING_COLUMNS.map(([name, kind]) => {
    const value = row[name] ?? row[name.toUpperCase()];
    if (value === null || value === undefined || value === '') return null;
    const text = scalarText(value, name);
    if (kind === 'int' || kind === 'num') return String(Number(text));
    if (kind === 'date') return text.slice(0, 10);
    if (kind === 'tstz') return String(Math.floor(Date.parse(text) / 1000));
    return text;
  });
}
