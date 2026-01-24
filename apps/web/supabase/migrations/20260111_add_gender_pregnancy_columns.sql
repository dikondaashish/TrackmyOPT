-- Add gender and is_pregnant columns to insurance_eligibility_checks table
-- Migration: 20260111_add_gender_pregnancy_columns.sql

-- Add gender column
ALTER TABLE insurance_eligibility_checks 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add is_pregnant column
ALTER TABLE insurance_eligibility_checks 
ADD COLUMN IF NOT EXISTS is_pregnant BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN insurance_eligibility_checks.gender IS 'User gender: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN insurance_eligibility_checks.is_pregnant IS 'Whether user is currently pregnant';
