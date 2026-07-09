-- ============================================================================
-- Forensic query: detect spoofed user_id inserts on insurance_eligibility_checks
-- ============================================================================
-- Context: security audit finding H-1. Before the fix, POST /api/insurance-
-- eligibility computed `user_id = sessionUserId ?? bodyUserId` and wrote via the
-- service-role client (RLS bypassed). An UNAUTHENTICATED caller could therefore
-- attribute a check (DOB / income / visa_type) to any real user whose UUID they
-- supplied. `user_id` is a FK to auth.users(id), so any spoofed row points at a
-- REAL, existing user — every hit below is cleanly attributable.
--
-- READ-ONLY. Run against production Supabase (SQL editor or psql). Nothing here
-- writes or deletes. Review Section A + B hits before quarantining any rows.
--
-- LIMITATION: profiles/opt_status do NOT store date_of_birth or visa_type, so a
-- spoofed row cannot be compared against the user's "true" DOB/visa. We instead
-- use two signals that need no external source:
--   A. No-login correlation  — the strongest signal (spoof requires session=null).
--   B. Within-user DOB conflict — one person has one DOB.
-- Section C is a volume/variety anomaly to triage the rest.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- SECTION A — No-login correlation (PRIMARY SIGNAL)
-- ----------------------------------------------------------------------------
-- A legitimate authenticated insert happens while the user has an active
-- session, so there is a sign-in event in auth.audit_log_entries near
-- checked_at. A spoofed insert has session = null, so the attributed user was
-- typically NOT signed in around that time. Flag rows where the user had no
-- sign-in within +/- 24h of checked_at.
--
-- Note: auth.audit_log_entries retention is finite (Supabase default keeps a
-- rolling window). Rows older than your retention window will show as "no
-- login" simply because the log aged out — treat pre-retention rows as
-- INCONCLUSIVE, not confirmed spoof. Adjust the interval to taste.
--
-- IMPORTANT: 'user_signedup' is included alongside 'login'/'token_refreshed'.
-- A brand-new user who signs up and immediately runs an eligibility check
-- authenticates via the SIGNUP event, not a separate 'login' — omitting it
-- produced false positives here (real new users flagged as "no login"). Keep
-- this list = every action that establishes/holds an authenticated session.

WITH signins AS (
  SELECT
    (payload ->> 'actor_id')::uuid AS user_id,
    created_at
  FROM auth.audit_log_entries
  WHERE payload ->> 'action' IN ('login', 'token_refreshed', 'user_signedup')
)
SELECT
  c.id,
  c.user_id,
  c.checked_at,
  c.state,
  c.visa_type,
  c.date_of_birth,
  c.monthly_income,
  (
    SELECT max(s.created_at)
    FROM signins s
    WHERE s.user_id = c.user_id
      AND s.created_at BETWEEN c.checked_at - interval '24 hours'
                           AND c.checked_at + interval '24 hours'
  ) AS nearest_signin_within_24h
FROM public.insurance_eligibility_checks c
WHERE c.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM signins s
    WHERE s.user_id = c.user_id
      AND s.created_at BETWEEN c.checked_at - interval '24 hours'
                           AND c.checked_at + interval '24 hours'
  )
ORDER BY c.checked_at DESC;


-- ----------------------------------------------------------------------------
-- SECTION B — Within-user DOB conflict (self-contradiction)
-- ----------------------------------------------------------------------------
-- A person has exactly one date of birth. If a single user_id has two or more
-- DISTINCT non-null date_of_birth values across its checks, at least one was
-- not submitted by that user -> strong spoof indicator. Lists every offending
-- user with the conflicting DOBs and how many checks each has.

SELECT
  c.user_id,
  count(*)                                        AS total_checks,
  count(DISTINCT c.date_of_birth)                 AS distinct_dobs,
  array_agg(DISTINCT c.date_of_birth)             AS dob_values,
  array_agg(DISTINCT c.visa_type)                 AS visa_values,
  array_agg(DISTINCT c.state)                     AS states,
  min(c.checked_at)                               AS first_check,
  max(c.checked_at)                               AS last_check
FROM public.insurance_eligibility_checks c
WHERE c.user_id IS NOT NULL
  AND c.date_of_birth IS NOT NULL
GROUP BY c.user_id
HAVING count(DISTINCT c.date_of_birth) > 1
ORDER BY distinct_dobs DESC, total_checks DESC;


-- ----------------------------------------------------------------------------
-- SECTION C — Volume / variety anomaly (triage helper)
-- ----------------------------------------------------------------------------
-- The rate limit was per-IP, so an attacker rotating IPs could inject many rows
-- for many victims. Surface user_ids with an implausible number of checks or a
-- suspicious spread of distinct visa_type/state values (a real user rechecking
-- their own eligibility does not cycle through many visa types / states).
-- Tune the thresholds to your real usage before acting.

SELECT
  c.user_id,
  count(*)                            AS total_checks,
  count(DISTINCT c.visa_type)         AS distinct_visa_types,
  count(DISTINCT c.state)             AS distinct_states,
  count(DISTINCT date(c.checked_at))  AS distinct_days,
  min(c.checked_at)                   AS first_check,
  max(c.checked_at)                   AS last_check
FROM public.insurance_eligibility_checks c
WHERE c.user_id IS NOT NULL
GROUP BY c.user_id
HAVING count(*) >= 5
    OR count(DISTINCT c.visa_type) >= 3
    OR count(DISTINCT c.state) >= 4
ORDER BY total_checks DESC;


-- ----------------------------------------------------------------------------
-- SECTION D — Baseline counts (context for the above)
-- ----------------------------------------------------------------------------
SELECT
  count(*)                                          AS total_rows,
  count(*) FILTER (WHERE user_id IS NULL)           AS anonymous_rows,
  count(*) FILTER (WHERE user_id IS NOT NULL)       AS attributed_rows,
  count(DISTINCT user_id)                           AS distinct_users,
  min(checked_at)                                   AS earliest,
  max(checked_at)                                   AS latest
FROM public.insurance_eligibility_checks;
