-- Cutover prerequisite for Oracle job records.
-- This file is intentionally not executed by the application or migrations.
-- Run only after reviewing the evidence composition plan.

CREATE TABLE job_visa_signals (
  id               VARCHAR2(36 CHAR) NOT NULL,
  job_id           VARCHAR2(36 CHAR) NOT NULL,
  signal_type      VARCHAR2(64 CHAR) NOT NULL,
  evidence_snippet VARCHAR2(2000 CHAR) NOT NULL,
  source_url       VARCHAR2(2000 CHAR) NOT NULL,
  observed_date    DATE NOT NULL,
  confidence       NUMBER(4,3) NOT NULL,
  source           VARCHAR2(64 CHAR) NOT NULL,
  CONSTRAINT job_visa_signals_pk PRIMARY KEY (id),
  CONSTRAINT job_visa_signals_job_fk FOREIGN KEY (job_id) REFERENCES jobs (id),
  CONSTRAINT job_visa_signals_confidence_ck CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT job_visa_signals_uk UNIQUE (job_id, signal_type, source, source_url)
);

CREATE INDEX job_visa_signals_job_idx ON job_visa_signals (job_id);

-- Employer matches and H-1B sponsors remain in Supabase. The application
-- composes those rows with Oracle jobs by the stable employer_match_id value;
-- no cross-database view or foreign key is possible.
