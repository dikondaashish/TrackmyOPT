-- Oracle ADMIN-only setup for the derived description search store.
--
-- Run this script as ADMIN. TRACKMYOPT_JOB_APP receives only DML on this
-- derived table; it does not receive CREATE TABLE/INDEX or other DDL rights.
-- The table is not a second source of job data: JOBS remains authoritative.

BEGIN
  EXECUTE IMMEDIATE '
    CREATE TABLE ADMIN.TRACKMYOPT_JOB_SEARCH (
      job_id     VARCHAR2(36 CHAR) NOT NULL,
      search_text CLOB,
      search_text_index CLOB,
      description_filter_flags NUMBER(10) DEFAULT 0 NOT NULL,
      CONSTRAINT trackmyopt_job_search_pk PRIMARY KEY (job_id)
    )';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE
    'ALTER TABLE ADMIN.TRACKMYOPT_JOB_SEARCH ADD (description_filter_flags NUMBER(10) DEFAULT 0 NOT NULL)';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE NOT IN (-1430, -955) THEN RAISE; END IF;
END;
/

-- The table may already exist from the first search-index rollout. Keep this
-- migration rerunnable without granting DDL to the application user.
BEGIN
  EXECUTE IMMEDIATE
    'ALTER TABLE ADMIN.TRACKMYOPT_JOB_SEARCH ADD (search_text_index CLOB)';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE NOT IN (-1430, -955) THEN RAISE; END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE q'[BEGIN CTX_DDL.CREATE_PREFERENCE('ADMIN.TRACKMYOPT_JOB_SEARCH_LEXER', 'BASIC_LEXER'); END;]';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

BEGIN
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_LEXER', 'PRINTJOINS', '+');
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_LEXER', 'INDEX_THEMES', 'NO');
END;
/

BEGIN
  EXECUTE IMMEDIATE q'[BEGIN CTX_DDL.CREATE_PREFERENCE('ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST', 'BASIC_WORDLIST'); END;]';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

BEGIN
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST', 'WILDCARD_INDEX', 'TRUE');
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST', 'WILDCARD_INDEX_K', '2');
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST', 'PREFIX_INDEX', 'TRUE');
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST', 'PREFIX_MIN_LENGTH', '2');
  CTX_DDL.SET_ATTRIBUTE('ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST', 'PREFIX_MAX_LENGTH', '64');
END;
/

-- Replace the first-rollout index if it was built on SEARCH_TEXT. FORCE is
-- required when an Oracle Text index is still loading (ORA-29868).
BEGIN
  EXECUTE IMMEDIATE
    'DROP INDEX ADMIN.TRACKMYOPT_JOB_SEARCH_CTX_IDX FORCE';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1418 THEN RAISE; END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE q'[
    CREATE INDEX ADMIN.TRACKMYOPT_JOB_SEARCH_CTX_IDX
      ON ADMIN.TRACKMYOPT_JOB_SEARCH(search_text_index)
      INDEXTYPE IS CTXSYS.CONTEXT
      PARAMETERS ('LEXER ADMIN.TRACKMYOPT_JOB_SEARCH_LEXER WORDLIST ADMIN.TRACKMYOPT_JOB_SEARCH_WORDLIST SYNC (ON COMMIT)')
  ]';
END;
/

GRANT SELECT, INSERT, UPDATE ON ADMIN.TRACKMYOPT_JOB_SEARCH TO TRACKMYOPT_JOB_APP;

-- SEARCH_TEXT is the lower-cased DESCRIPTION and remains authoritative for
-- exact substring checks. SEARCH_TEXT_INDEX is a lower-cased accelerator in
-- which periods and hyphens are normalized to the configured PRINTJOINS
-- character. Title/company matching is kept on JOBS so this derived table
-- cannot broaden general-search semantics. DESCRIPTION_FILTER_FLAGS stores
-- exact lower-case substring flags for the fixed workplace/degree/experience/
-- job-type vocabularies; it is maintained by the adapter and does not alter
-- arbitrary free-text search semantics.
-- The application adapter maintains it with an idempotent MERGE; do not
-- delete JOBS rows here.
