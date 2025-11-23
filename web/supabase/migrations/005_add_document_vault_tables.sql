-- Migration: Document Vault System
-- Purpose: Premium-only secure document storage with AI analysis and expiry tracking

-- ============================================================================
-- 1. DOCUMENT PASSCODES TABLE
-- ============================================================================
-- Stores user's vault passcode (hashed)
CREATE TABLE IF NOT EXISTS document_passcodes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passcode_hash text NOT NULL,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- One passcode per user
  CONSTRAINT unique_user_passcode UNIQUE (user_id)
);

-- ============================================================================
-- 2. DOCUMENTS TABLE
-- ============================================================================
-- Stores document metadata and AI-extracted information
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File information
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  s3_key text NOT NULL,
  s3_bucket text NOT NULL,
  
  -- Document classification
  document_type text NOT NULL,
  -- Types: passport, visa, i20, ead_card, i983, offer_letter, paystub, receipt_notice, other
  
  -- AI extraction status
  ai_analyzed boolean DEFAULT false,
  ai_analysis_date timestamptz,
  raw_ocr_text text,
  
  -- Extracted metadata (JSONB for flexibility)
  extracted_fields jsonb DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "full_name": "John Doe",
  --   "passport_number": "A12345678",
  --   "issue_date": "2020-01-01",
  --   "expiry_date": "2030-01-01",
  --   "sevis_id": "N0012345678",
  --   "ead_category": "C03B",
  --   ...
  -- }
  
  -- Dates
  issue_date date,
  expiry_date date,
  
  -- User-added information
  notes text,
  tags text[] DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- ============================================================================
-- 3. DOCUMENT REMINDERS TABLE
-- ============================================================================
-- Auto-generated reminders for document expirations
CREATE TABLE IF NOT EXISTS document_reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Reminder details
  reminder_type text NOT NULL,
  -- Types: 6_months, 3_months, 1_month, 7_days, expired
  
  reminder_message text NOT NULL,
  send_at timestamptz NOT NULL,
  
  -- Status
  status text DEFAULT 'pending',
  -- pending, sent, failed, cancelled
  
  sent_at timestamptz,
  
  -- Channels
  email_sent boolean DEFAULT false,
  sms_sent boolean DEFAULT false,
  notification_sent boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);

CREATE INDEX IF NOT EXISTS idx_document_passcodes_user_id ON document_passcodes(user_id);

CREATE INDEX IF NOT EXISTS idx_document_reminders_user_id ON document_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_document_id ON document_reminders(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_send_at ON document_reminders(send_at);
CREATE INDEX IF NOT EXISTS idx_document_reminders_status ON document_reminders(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE document_passcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own passcode" ON document_passcodes;
DROP POLICY IF EXISTS "Users can insert their own passcode" ON document_passcodes;
DROP POLICY IF EXISTS "Users can update their own passcode" ON document_passcodes;
DROP POLICY IF EXISTS "Users can delete their own passcode" ON document_passcodes;

DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can soft delete their own documents" ON documents;

DROP POLICY IF EXISTS "Users can view their own reminders" ON document_reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON document_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON document_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON document_reminders;

-- Document Passcodes Policies
CREATE POLICY "Users can view their own passcode"
  ON document_passcodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passcode"
  ON document_passcodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passcode"
  ON document_passcodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passcode"
  ON document_passcodes FOR DELETE
  USING (auth.uid() = user_id);

-- Documents Policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Document Reminders Policies
CREATE POLICY "Users can view their own reminders"
  ON document_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON document_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON document_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON document_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_passcodes_updated_at
  BEFORE UPDATE ON document_passcodes
  FOR EACH ROW
  EXECUTE FUNCTION update_document_vault_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_vault_updated_at();

CREATE TRIGGER update_document_reminders_updated_at
  BEFORE UPDATE ON document_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_document_vault_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get document expiry status
CREATE OR REPLACE FUNCTION get_document_expiry_status(expiry date)
RETURNS text AS $$
DECLARE
  days_until_expiry integer;
BEGIN
  IF expiry IS NULL THEN
    RETURN 'no_expiry';
  END IF;
  
  days_until_expiry := expiry - CURRENT_DATE;
  
  IF days_until_expiry < 0 THEN
    RETURN 'expired';
  ELSIF days_until_expiry <= 7 THEN
    RETURN 'critical';
  ELSIF days_until_expiry <= 30 THEN
    RETURN 'warning';
  ELSIF days_until_expiry <= 90 THEN
    RETURN 'attention';
  ELSE
    RETURN 'good';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create reminders for a document
CREATE OR REPLACE FUNCTION create_document_reminders(
  p_user_id uuid,
  p_document_id uuid,
  p_document_name text,
  p_expiry_date date
)
RETURNS void AS $$
DECLARE
  reminder_intervals integer[] := ARRAY[180, 90, 30, 7]; -- 6 months, 3 months, 1 month, 7 days
  reminder_labels text[] := ARRAY['6 months', '3 months', '1 month', '7 days'];
  reminder_type text;
  reminder_date date;
  i integer;
BEGIN
  -- Delete existing reminders for this document
  DELETE FROM document_reminders WHERE document_id = p_document_id;
  
  -- Create new reminders
  FOR i IN 1..array_length(reminder_intervals, 1) LOOP
    reminder_date := p_expiry_date - reminder_intervals[i];
    
    -- Only create reminder if it's in the future
    IF reminder_date >= CURRENT_DATE THEN
      reminder_type := CASE reminder_intervals[i]
        WHEN 180 THEN '6_months'
        WHEN 90 THEN '3_months'
        WHEN 30 THEN '1_month'
        WHEN 7 THEN '7_days'
      END;
      
      INSERT INTO document_reminders (
        user_id,
        document_id,
        reminder_type,
        reminder_message,
        send_at
      ) VALUES (
        p_user_id,
        p_document_id,
        reminder_type,
        format('Your document "%s" will expire in %s. Please renew it soon.', p_document_name, reminder_labels[i]),
        reminder_date::timestamptz
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE document_passcodes IS 'Stores hashed passcodes for document vault access';
COMMENT ON TABLE documents IS 'Stores document metadata and AI-extracted information';
COMMENT ON TABLE document_reminders IS 'Auto-generated reminders for document expirations';

COMMENT ON COLUMN documents.extracted_fields IS 'JSONB field containing AI-extracted metadata specific to document type';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete timestamp - documents are never hard deleted';
COMMENT ON COLUMN document_reminders.reminder_type IS '6_months, 3_months, 1_month, 7_days, or expired';
COMMENT ON COLUMN document_reminders.status IS 'pending, sent, failed, or cancelled';

