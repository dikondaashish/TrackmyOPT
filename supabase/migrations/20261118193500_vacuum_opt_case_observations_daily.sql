-- The daily forecast refresh failed from Nov 13 to Nov 18, 2026 with
-- "OPT forecast evidence read failed" (TRACKMYOPT-36 / -2Y): each page of
-- read_opt_case_observations took ~12.7 s against the 8 s API statement
-- timeout. The boundary lookup is an index-only scan of
-- opt_observation_evidence_key, but with the visibility map out of date it
-- fetched all ~71k heap rows anyway ("Heap Fetches: 71052").
--
-- This table only receives inserts (~1,850 a day from the daily sync). With
-- the default insert trigger (1,000 + 20% of the table) autovacuum ran only
-- about every eight days, so most pages were never marked all-visible. A
-- manual VACUUM on Nov 18 brought a page read to ~1.4 s.
--
-- Vacuum after every 1,000 inserts instead, so each daily sync is followed by
-- a vacuum that keeps the index-only scan off the heap. Metadata only: no
-- table rewrite and no lock beyond a brief SHARE UPDATE EXCLUSIVE.
ALTER TABLE public.opt_case_observations SET (
  autovacuum_vacuum_insert_threshold = 1000,
  autovacuum_vacuum_insert_scale_factor = 0
);
