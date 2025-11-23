-- Migration: Add case_status table for USCIS case tracking
-- Purpose: Track users' USCIS case status by receipt number with automated updates

-- Create case_status table
CREATE TABLE IF NOT EXISTS case_status (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_number text NOT NULL,
  current_status text,
  case_type text, -- e.g., "I-765", "I-129", "I-140", etc.
  received_date date,
  last_checked_at timestamptz,
  last_status_change_at timestamptz,
  status_history jsonb DEFAULT '[]'::jsonb, -- Array of {status, date, description}
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one case per user (user can only track one case at a time)
  CONSTRAINT unique_user_case UNIQUE (user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_case_status_user_id ON case_status(user_id);
CREATE INDEX IF NOT EXISTS idx_case_status_receipt_number ON case_status(receipt_number);
CREATE INDEX IF NOT EXISTS idx_case_status_last_checked ON case_status(last_checked_at);

-- Enable Row Level Security (RLS)
ALTER TABLE case_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own case status" ON case_status;
DROP POLICY IF EXISTS "Users can insert their own case status" ON case_status;
DROP POLICY IF EXISTS "Users can update their own case status" ON case_status;
DROP POLICY IF EXISTS "Users can delete their own case status" ON case_status;

-- RLS Policies: Users can only access their own case status
CREATE POLICY "Users can view their own case status"
  ON case_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own case status"
  ON case_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own case status"
  ON case_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own case status"
  ON case_status FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_case_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (for re-running migration)
DROP TRIGGER IF EXISTS update_case_status_updated_at_trigger ON case_status;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_case_status_updated_at_trigger
  BEFORE UPDATE ON case_status
  FOR EACH ROW
  EXECUTE FUNCTION update_case_status_updated_at();

-- Add comments for documentation
COMMENT ON TABLE case_status IS 'Stores USCIS case status tracking information for users';
COMMENT ON COLUMN case_status.receipt_number IS 'USCIS receipt number (e.g., IOE123456789)';
COMMENT ON COLUMN case_status.current_status IS 'Latest case status from USCIS';
COMMENT ON COLUMN case_status.case_type IS 'Type of case (I-765, I-129, etc.)';
COMMENT ON COLUMN case_status.status_history IS 'JSON array of historical status updates';
COMMENT ON COLUMN case_status.notifications_enabled IS 'Whether user wants email/SMS notifications for status changes';
COMMENT ON COLUMN case_status.last_checked_at IS 'Last time we checked USCIS for updates';
COMMENT ON COLUMN case_status.last_status_change_at IS 'Last time the case status actually changed';

