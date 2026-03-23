-- Add tool-specific email preferences columns
-- Each tool can be individually enabled/disabled for reminders

ALTER TABLE email_preferences 
ADD COLUMN IF NOT EXISTS opt_apply_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS opt_clock_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS stem_apply_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS stem_clock_reminders BOOLEAN DEFAULT TRUE;

-- Add comment for documentation
COMMENT ON COLUMN email_preferences.opt_apply_reminders IS 'Enable OPT Application filing window reminders';
COMMENT ON COLUMN email_preferences.opt_clock_reminders IS 'Enable OPT 90-day unemployment clock reminders';
COMMENT ON COLUMN email_preferences.stem_apply_reminders IS 'Enable STEM OPT Extension filing reminders';
COMMENT ON COLUMN email_preferences.stem_clock_reminders IS 'Enable STEM 150-day aggregate unemployment reminders';
