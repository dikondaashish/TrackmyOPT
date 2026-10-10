-- Create export_otps table for ZIP export verification
CREATE TABLE IF NOT EXISTS export_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_export_otps_user_id ON export_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_export_otps_expires_at ON export_otps(expires_at);

-- Add RLS policies
ALTER TABLE export_otps ENABLE ROW LEVEL SECURITY;

-- Users can only access their own OTPs
CREATE POLICY "Users can access own export OTPs"
  ON export_otps
  FOR ALL
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE export_otps IS 'Stores OTPs for ZIP export verification';
