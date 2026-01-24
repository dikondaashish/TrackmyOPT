-- ============================================================================
-- MIGRATION: Policy Consents Table
-- Purpose: Track user consent for policy changes (USCIS Attestation Requirement)
-- ============================================================================

-- Create policy_consents table
CREATE TABLE IF NOT EXISTS public.policy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Policy Information
  policy_type TEXT NOT NULL,  -- 'privacy_policy', 'terms_of_service'
  policy_version TEXT NOT NULL,  -- e.g., '2024-12-09'
  
  -- Consent Details
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_method TEXT NOT NULL,  -- 'checkbox', 'modal', 'banner_click'
  ip_address TEXT,  -- For audit purposes
  user_agent TEXT,  -- For audit purposes
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one consent per user per policy version
  CONSTRAINT unique_user_policy_consent UNIQUE (user_id, policy_type, policy_version)
);

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_policy_consents_user_id ON public.policy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_consents_policy_type ON public.policy_consents(policy_type, policy_version);

-- RLS Policies
ALTER TABLE public.policy_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view own consents" ON public.policy_consents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users can insert own consents" ON public.policy_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table comment
COMMENT ON TABLE public.policy_consents IS 'Tracks user consent for privacy policy and terms of service changes';

-- ============================================================================
-- Create policy_versions table to track current versions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  policy_type TEXT NOT NULL UNIQUE,  -- 'privacy_policy', 'terms_of_service'
  current_version TEXT NOT NULL,  -- e.g., '2024-12-09'
  requires_consent BOOLEAN DEFAULT FALSE,  -- Whether this version requires active consent
  change_summary TEXT,  -- Plain-language summary of changes
  effective_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert current versions
INSERT INTO public.policy_versions (policy_type, current_version, requires_consent, effective_date, change_summary)
VALUES 
  ('privacy_policy', '2024-12-09', false, '2024-12-09', 'Added CCPA compliance, data breach procedures, and business transfer clauses.'),
  ('terms_of_service', '2024-12-09', false, '2024-12-09', 'Updated governing law to Delaware, added Zyene Inc company information.')
ON CONFLICT (policy_type) DO UPDATE SET
  current_version = EXCLUDED.current_version,
  requires_consent = EXCLUDED.requires_consent,
  effective_date = EXCLUDED.effective_date,
  change_summary = EXCLUDED.change_summary,
  updated_at = NOW();

-- RLS for policy_versions (public read)
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read policy versions" ON public.policy_versions
  FOR SELECT USING (true);

COMMENT ON TABLE public.policy_versions IS 'Tracks current policy versions and whether they require consent';

DO $$
BEGIN
  RAISE NOTICE '✅ Policy consent tables created successfully';
END $$;
