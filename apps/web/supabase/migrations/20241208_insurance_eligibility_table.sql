-- Create insurance_eligibility_checks table
-- This table stores valuable data about users checking their insurance eligibility
-- Used for analytics and improving the insurance finder feature

CREATE TABLE IF NOT EXISTS public.insurance_eligibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  state VARCHAR(2) NOT NULL,
  monthly_income DECIMAL(10,2) DEFAULT 0,
  visa_type VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  has_employer_insurance BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_insurance_eligibility_user_id ON public.insurance_eligibility_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_eligibility_state ON public.insurance_eligibility_checks(state);
CREATE INDEX IF NOT EXISTS idx_insurance_eligibility_checked_at ON public.insurance_eligibility_checks(checked_at);

-- Enable RLS
ALTER TABLE public.insurance_eligibility_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own eligibility checks
CREATE POLICY "Users can view own eligibility checks"
  ON public.insurance_eligibility_checks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can insert (including anonymous users for lead generation)
CREATE POLICY "Anyone can insert eligibility checks"
  ON public.insurance_eligibility_checks
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can do everything
CREATE POLICY "Service role has full access to eligibility checks"
  ON public.insurance_eligibility_checks
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comment
COMMENT ON TABLE public.insurance_eligibility_checks IS 'Stores insurance eligibility check data for analytics and user tracking';
