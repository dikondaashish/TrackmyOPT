-- Add column to track which date field was most recently updated
alter table opt_status 
add column if not exists most_recent_field text;

-- Add comment explaining the column
comment on column opt_status.most_recent_field is 'Tracks which date field was most recently updated (program_end_date, dso_recommendation_date, opt_start_date, opt_ead_end_date, stem_start_date)';

