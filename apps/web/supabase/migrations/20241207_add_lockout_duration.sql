-- Add lockout_duration column to document_passcodes table
-- This allows users to customize how long they are locked out after 3 failed attempts

ALTER TABLE document_passcodes
ADD COLUMN IF NOT EXISTS lockout_duration INTEGER DEFAULT 10;

-- Add comment
COMMENT ON COLUMN document_passcodes.lockout_duration IS 'Lockout duration in minutes after 3 failed passcode attempts. Default is 10 minutes.';
