-- Oracle copy of the static DOL LCA h1b_filings reference table.
-- Run in Database Actions / SQL Worksheet with Run Script (F5).
--
-- Step 1 (as ADMIN): let the app user create this table and hold the data.
-- The copy is ~240 MB with indexes; the bootstrap quota was 250M.
--   GRANT CREATE TABLE TO TRACKMYOPT_JOB_APP;
--   ALTER USER TRACKMYOPT_JOB_APP QUOTA 2G ON DATA;
--
-- Step 2 (as TRACKMYOPT_JOB_APP): run the statements below.
--
-- Step 3 (as ADMIN): REVOKE CREATE TABLE FROM TRACKMYOPT_JOB_APP;
--
-- GENERATED from H1B_FILING_COLUMNS in src/sponsor-data/oracle-h1b-filings.ts.
-- A unit test fails if this block drifts from the column list.

CREATE TABLE h1b_filings (
  id                             VARCHAR2(36 CHAR) NOT NULL,
  case_number                    VARCHAR2(500 CHAR) NOT NULL,
  status                         VARCHAR2(500 CHAR),
  received_date                  DATE,
  decision_date                  DATE,
  original_cert_date             DATE,
  visa_class                     VARCHAR2(500 CHAR),
  job_title                      VARCHAR2(500 CHAR),
  soc_code                       VARCHAR2(500 CHAR),
  soc_title                      VARCHAR2(500 CHAR),
  full_time_position             VARCHAR2(500 CHAR),
  begin_date                     DATE,
  end_date                       DATE,
  total_workers                  NUMBER(10),
  employer_name                  VARCHAR2(500 CHAR),
  employer_address1              VARCHAR2(500 CHAR),
  employer_address2              VARCHAR2(500 CHAR),
  employer_city                  VARCHAR2(500 CHAR),
  employer_state                 VARCHAR2(500 CHAR),
  employer_postal_code           VARCHAR2(500 CHAR),
  employer_country               VARCHAR2(500 CHAR),
  employer_phone                 VARCHAR2(500 CHAR),
  employer_phone_ext             VARCHAR2(500 CHAR),
  employer_province              VARCHAR2(500 CHAR),
  employer_fein                  VARCHAR2(500 CHAR),
  naics_code                     VARCHAR2(500 CHAR),
  employer_poc_name              VARCHAR2(500 CHAR),
  employer_poc_job_title         VARCHAR2(500 CHAR),
  employer_poc_address1          VARCHAR2(500 CHAR),
  employer_poc_address2          VARCHAR2(500 CHAR),
  employer_poc_city              VARCHAR2(500 CHAR),
  employer_poc_state             VARCHAR2(500 CHAR),
  employer_poc_postal_code       VARCHAR2(500 CHAR),
  employer_poc_province          VARCHAR2(500 CHAR),
  employer_poc_country           VARCHAR2(500 CHAR),
  employer_poc_email             VARCHAR2(500 CHAR),
  employer_poc_phone             VARCHAR2(500 CHAR),
  employer_poc_phone_ext         VARCHAR2(500 CHAR),
  agent_attorney_name            VARCHAR2(500 CHAR),
  agent_attorney_address1        VARCHAR2(500 CHAR),
  agent_attorney_address2        VARCHAR2(500 CHAR),
  agent_attorney_city            VARCHAR2(500 CHAR),
  agent_attorney_state           VARCHAR2(500 CHAR),
  agent_attorney_postal_code     VARCHAR2(500 CHAR),
  agent_attorney_province        VARCHAR2(500 CHAR),
  agent_attorney_country         VARCHAR2(500 CHAR),
  agent_attorney_email           VARCHAR2(500 CHAR),
  agent_attorney_phone           VARCHAR2(500 CHAR),
  agent_attorney_phone_ext       VARCHAR2(500 CHAR),
  agent_representing_employer    VARCHAR2(500 CHAR),
  lawfirm_name                   VARCHAR2(500 CHAR),
  lawfirm_business_fein          VARCHAR2(500 CHAR),
  worksite_address1              VARCHAR2(500 CHAR),
  worksite_address2              VARCHAR2(500 CHAR),
  worksite_city                  VARCHAR2(500 CHAR),
  worksite_county                VARCHAR2(500 CHAR),
  worksite_state                 VARCHAR2(500 CHAR),
  worksite_postal_code           VARCHAR2(500 CHAR),
  worksite_workers               NUMBER(10),
  total_worksite_locations       NUMBER(10),
  trade_name_dba                 VARCHAR2(500 CHAR),
  secondary_entity               VARCHAR2(500 CHAR),
  secondary_entity_business_name VARCHAR2(500 CHAR),
  wage_rate_from                 NUMBER,
  wage_rate_to                   NUMBER,
  wage_unit                      VARCHAR2(500 CHAR),
  prevailing_wage                NUMBER,
  pw_unit                        VARCHAR2(500 CHAR),
  pw_wage_level                  VARCHAR2(500 CHAR),
  pw_source                      VARCHAR2(500 CHAR),
  pw_source_year                 NUMBER(10),
  pw_other_source                VARCHAR2(500 CHAR),
  pw_other_year                  NUMBER(10),
  pw_tracking_number             VARCHAR2(500 CHAR),
  pw_survey_name                 VARCHAR2(500 CHAR),
  pw_survey_publisher            VARCHAR2(500 CHAR),
  sponsor_id                     VARCHAR2(500 CHAR),
  new_employment                 NUMBER(10),
  continued_employment           NUMBER(10),
  change_previous_employment     NUMBER(10),
  new_concurrent_employment      NUMBER(10),
  change_employer                NUMBER(10),
  amended_petition               NUMBER(10),
  h_1b_dependent                 VARCHAR2(500 CHAR),
  willful_violator               VARCHAR2(500 CHAR),
  support_h1b                    VARCHAR2(500 CHAR),
  appendix_a_attached            VARCHAR2(500 CHAR),
  public_disclosure              VARCHAR2(500 CHAR),
  agree_to_lc_statement          VARCHAR2(500 CHAR),
  statutory_basis                VARCHAR2(500 CHAR),
  preparer_first_name            VARCHAR2(500 CHAR),
  preparer_middle_initial        VARCHAR2(500 CHAR),
  preparer_last_name             VARCHAR2(500 CHAR),
  preparer_business_name         VARCHAR2(500 CHAR),
  preparer_email                 VARCHAR2(500 CHAR),
  created_at                     TIMESTAMP(6) WITH TIME ZONE,
  state_of_highest_court         VARCHAR2(500 CHAR),
  name_of_highest_state_court    VARCHAR2(500 CHAR),
  CONSTRAINT h1b_filings_pk PRIMARY KEY (id)
);

CREATE INDEX h1b_filings_case_number_idx ON h1b_filings (case_number);
CREATE INDEX h1b_filings_sponsor_idx ON h1b_filings (sponsor_id, received_date DESC);
CREATE INDEX h1b_filings_employer_idx ON h1b_filings (employer_name, received_date DESC);
CREATE INDEX h1b_filings_employer_upper_idx ON h1b_filings (UPPER(employer_name));

-- Post-run verification.
SELECT table_name FROM user_tables WHERE table_name = 'H1B_FILINGS';
SELECT index_name FROM user_indexes WHERE table_name = 'H1B_FILINGS' ORDER BY index_name;
