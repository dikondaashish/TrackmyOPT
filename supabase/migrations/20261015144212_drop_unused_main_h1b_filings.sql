-- Drop the unused copy of the DOL LCA reference data in the main project.
--
-- H-1B filings are served from Oracle (H1B_FILINGS_STORE=oracle), with the
-- separate "TrackmyOPT H1B Filings" Supabase project as the fallback. No
-- application code reads public.h1b_filings in this project; it was last
-- written on 2026-01-28.
--
-- Verified before dropping (2026-10-15), all three copies identical:
--   rows 233,575; received_date 2020-10-14..2025-09-30;
--   sum(hashtext(id|case_number|employer_name)) = -342317062402
--   in this project and the filings project; Oracle H1B_FILINGS = 233,575.
--
-- The only dependents are the unused view sponsor_intelligence_agg and the
-- unused function get_sponsor_intelligence (no callers in apps/ or scripts/).
-- h1b_sponsors and companies are kept: they still back sponsor identity.
-- Frees about 186 MB.

DROP FUNCTION IF EXISTS public.get_sponsor_intelligence(TEXT[]);
DROP VIEW IF EXISTS public.sponsor_intelligence_agg;
DROP TABLE IF EXISTS public.h1b_filings;
