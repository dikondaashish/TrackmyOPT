-- Add last_updated_field column to track which date was most recently updated
-- This helps the dashboard dropdown automatically select the most recent date type

ALTER TABLE opt_status 
ADD COLUMN IF NOT EXISTS last_updated_field text;

COMMENT ON COLUMN opt_status.last_updated_field IS 'Tracks which date field was most recently updated (program_end_date, dso_recommendation_date, opt_start_date, opt_ead_end_date, or stem_start_date)';

