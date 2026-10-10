-- Create passcode_otps table for OTP verification during passcode change
CREATE TABLE IF NOT EXISTS passcode_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(6) NOT NULL,
  new_passcode_hash VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_passcode_otps_user_id ON passcode_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_passcode_otps_expires_at ON passcode_otps(expires_at);

-- Enable RLS
ALTER TABLE passcode_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own OTP records"
  ON passcode_otps
  FOR ALL
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE passcode_otps IS 'Stores temporary OTPs for passcode change verification';
