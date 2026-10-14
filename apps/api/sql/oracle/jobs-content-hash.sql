-- Oracle Database Actions / SQL Worksheet script. Run as TRACKMYOPT_JOB_APP
-- (the JOBS owner) with Run Script (F5).
--
-- Adds the nullable change-detection column used by incremental ingestion
-- (JOB_INGEST_INCREMENTAL=true). Backward compatible:
--   * existing rows keep NULL and are treated as changed once, which fills the
--     hash on the next ingestion of their source;
--   * the application only reads or writes the column when the flag is on, so
--     deploying the code before or after this script is safe.
-- Value format: 'v1.<64 hex description digest>.<64 hex metadata digest>'
-- (132 characters).
--
-- Idempotent: re-running reports that the column already exists.

DECLARE
  column_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM user_tab_columns
  WHERE table_name = 'JOBS' AND column_name = 'CONTENT_HASH';
  IF column_count = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE jobs ADD (content_hash VARCHAR2(140 CHAR))';
    DBMS_OUTPUT.PUT_LINE('JOBS.CONTENT_HASH added');
  ELSE
    DBMS_OUTPUT.PUT_LINE('JOBS.CONTENT_HASH already exists');
  END IF;
END;
/

-- Verify (expect one row: CONTENT_HASH, VARCHAR2, 140, Y):
SELECT column_name, data_type, char_length, nullable
FROM user_tab_columns
WHERE table_name = 'JOBS' AND column_name = 'CONTENT_HASH';

-- Rollback, only after setting JOB_INGEST_INCREMENTAL=false on every API
-- service and restarting them:
--   ALTER TABLE jobs DROP COLUMN content_hash;
