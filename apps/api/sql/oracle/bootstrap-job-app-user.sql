-- OPERATOR-ONLY BOOTSTRAP. Run in an Oracle SQL Worksheet as ADMIN, then
-- revoke CREATE TABLE before the application connects. Never put the real
-- password in this file, git, Render logs, or a deployment command.
-- Replace the placeholder interactively with a generated secret.

CREATE USER TRACKMYOPT_JOB_APP IDENTIFIED BY "<GENERATE-STRONG-PASSWORD>";
GRANT CREATE SESSION, CREATE TABLE TO TRACKMYOPT_JOB_APP;
ALTER USER TRACKMYOPT_JOB_APP QUOTA 250M ON DATA;

-- Connect as TRACKMYOPT_JOB_APP and run jobs-schema.sql.
-- After the table and indexes are created, reconnect as ADMIN and run:
-- REVOKE CREATE TABLE FROM TRACKMYOPT_JOB_APP;

-- The application user then retains only session plus DML on its own jobs
-- table. No DBA, user-management, wallet, or cross-schema privileges are
-- granted. Rotate the password through the Oracle console after validation.
