import {
  JOB_COLUMNS,
  ORACLE_ISO_TZ_FORMAT,
  ORACLE_JOB_SEARCH_TABLE,
} from './oracle-job-data-helpers';

/** MERGE statements used by the Oracle job store's upsert paths. */
export const ORACLE_JOB_MERGE_SQL = `MERGE INTO jobs target
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
         )`;

/**
 * Same MERGE plus content_hash, used only by incremental ingestion after the
 * jobs-content-hash.sql migration. The original statement stays unchanged for
 * JOB_INGEST_INCREMENTAL=false.
 */
export const ORACLE_JOB_MERGE_WITH_HASH_SQL = ORACLE_JOB_MERGE_SQL.replace(
  'TO_TIMESTAMP_TZ(:removed_at, ',
  ':content_hash content_hash, TO_TIMESTAMP_TZ(:removed_at, ',
)
  .replace(
    'target.removed_at = incoming.removed_at',
    'target.removed_at = incoming.removed_at,\n           target.content_hash = incoming.content_hash',
  )
  .replace(`INSERT (${JOB_COLUMNS})`, `INSERT (${JOB_COLUMNS}, content_hash)`)
  .replace(
    'incoming.employer_match_id, incoming.missing_since_at, incoming.removed_at\n',
    'incoming.employer_match_id, incoming.missing_since_at, incoming.removed_at,\n           incoming.content_hash\n',
  );

/** Re-confirms an unchanged job; only rows that are still open qualify. */
export const ORACLE_JOB_CONFIRM_SQL = `UPDATE jobs SET
           last_confirmed_at = TO_TIMESTAMP_TZ(:confirmed_at, '${ORACLE_ISO_TZ_FORMAT}'),
           updated_at = TO_TIMESTAMP_TZ(:confirmed_at, '${ORACLE_ISO_TZ_FORMAT}')
         WHERE id = :id AND listing_status = 'open'`;

export const ORACLE_JOB_EMPLOYER_MATCH_SQL = `UPDATE jobs SET
           employer_match_id = :employer_match_id
         WHERE id = :id`;

export const ORACLE_JOB_SEARCH_MERGE_SQL = `MERGE INTO ${ORACLE_JOB_SEARCH_TABLE} target
         USING (SELECT :job_id job_id, :search_text search_text,
                       :search_text_index search_text_index,
                       :description_filter_flags description_filter_flags FROM dual) incoming
         ON (target.job_id = incoming.job_id)
         WHEN MATCHED THEN UPDATE SET
           target.search_text = incoming.search_text,
           target.search_text_index = incoming.search_text_index,
           target.description_filter_flags = incoming.description_filter_flags
         WHEN NOT MATCHED THEN INSERT (job_id, search_text, search_text_index, description_filter_flags)
           VALUES (incoming.job_id, incoming.search_text, incoming.search_text_index, incoming.description_filter_flags)`;

export const ORACLE_VISA_SIGNAL_MERGE_SQL = `MERGE INTO job_visa_signals target
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
            incoming.observed_date, incoming.confidence, incoming.source)`;
