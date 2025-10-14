-- Verify and create tables if they don't exist

-- 1. profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone text DEFAULT 'America/New_York',
  is_stem_eligible boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. opt_status table  
CREATE TABLE IF NOT EXISTS opt_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  program_end_date date NOT NULL,
  dso_recommendation_date date,
  opt_ead_end_date date NOT NULL,
  opt_start_date date NOT NULL,
  stem_start_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. employment_spans table
CREATE TABLE IF NOT EXISTS employment_spans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_name text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employment_spans_user_id ON employment_spans(user_id);

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for opt_status
DROP POLICY IF EXISTS "Users can view own opt_status" ON opt_status;
CREATE POLICY "Users can view own opt_status"
  ON opt_status FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own opt_status" ON opt_status;
CREATE POLICY "Users can insert own opt_status"
  ON opt_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own opt_status" ON opt_status;
CREATE POLICY "Users can update own opt_status"
  ON opt_status FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for employment_spans
DROP POLICY IF EXISTS "Users can view own employment_spans" ON employment_spans;
CREATE POLICY "Users can view own employment_spans"
  ON employment_spans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own employment_spans" ON employment_spans;
CREATE POLICY "Users can insert own employment_spans"
  ON employment_spans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own employment_spans" ON employment_spans;
CREATE POLICY "Users can update own employment_spans"
  ON employment_spans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own employment_spans" ON employment_spans;
CREATE POLICY "Users can delete own employment_spans"
  ON employment_spans FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_spans ENABLE ROW LEVEL SECURITY;
