-- Migration 008: Add separate email columns for each tool
-- Purpose: Store user's preferred email for each tool's notifications
-- Each tool sends separate reminders, so each needs its own email

-- Add email columns for each of the 4 tools
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS opt_apply_email TEXT,
ADD COLUMN IF NOT EXISTS opt_clock_email TEXT,
ADD COLUMN IF NOT EXISTS stem_apply_email TEXT,
ADD COLUMN IF NOT EXISTS stem_clock_email TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_opt_apply_email 
ON profiles(opt_apply_email) 
WHERE opt_apply_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_opt_clock_email 
ON profiles(opt_clock_email) 
WHERE opt_clock_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stem_apply_email 
ON profiles(stem_apply_email) 
WHERE stem_apply_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stem_clock_email 
ON profiles(stem_clock_email) 
WHERE stem_clock_email IS NOT NULL;

-- Add comments
COMMENT ON COLUMN profiles.opt_apply_email IS 'Email for OPT Apply Dates tool notifications';
COMMENT ON COLUMN profiles.opt_clock_email IS 'Email for OPT Clock Tracker tool notifications';
COMMENT ON COLUMN profiles.stem_apply_email IS 'Email for STEM Apply Dates tool notifications';
COMMENT ON COLUMN profiles.stem_clock_email IS 'Email for STEM Clock Tracker tool notifications';
