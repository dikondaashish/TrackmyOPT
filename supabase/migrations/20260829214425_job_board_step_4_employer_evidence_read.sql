-- Step 4 exposes only match metadata needed to render evidence for verified
-- jobs. Sponsor records remain protected behind the existing profile API.
CREATE POLICY "Authenticated users can read matches for verified jobs"
  ON public.employer_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.employer_match_id = employer_matches.id
        AND jobs.source_trust_tier = 'verified_ats'
    )
  );
