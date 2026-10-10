-- Migration: Add offer fields and archive support
-- Run this in Supabase SQL Editor or via CLI

-- Add offer fields for Offer stage details
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS offer_salary NUMERIC(10,2) NULL;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS offer_start_date DATE NULL;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS offer_deadline DATE NULL;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS sponsor_h1b BOOLEAN DEFAULT NULL;

-- Add archive support
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS previous_status TEXT NULL;

-- Index for filtering archived items
CREATE INDEX IF NOT EXISTS idx_job_applications_archived ON job_applications(is_archived) WHERE is_archived = true;
