-- Migration 007: Add notification email to profiles
-- Purpose: Store user's preferred email for document expiry notifications

-- Add notification_email column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_notification_email 
ON profiles(notification_email) 
WHERE notification_email IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.notification_email IS 'Email address for document expiry notifications';

