-- Migration: Update Documents Schema for Gemini AI Integration
-- Purpose: Add missing columns and rename fields to match API expectations

-- Add missing columns for Gemini AI
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS filename text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS extracted_text text,
ADD COLUMN IF NOT EXISTS ai_confidence integer,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS uploaded_at timestamptz DEFAULT now();

-- Migrate data from old column names to new ones
UPDATE documents 
SET filename = file_name 
WHERE filename IS NULL AND file_name IS NOT NULL;

UPDATE documents 
SET category = document_type 
WHERE category IS NULL AND document_type IS NOT NULL;

UPDATE documents 
SET extracted_text = raw_ocr_text 
WHERE extracted_text IS NULL AND raw_ocr_text IS NOT NULL;

-- Make filename NOT NULL after data migration
ALTER TABLE documents 
ALTER COLUMN filename SET NOT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user_category ON documents(user_id, category);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- Add comment
COMMENT ON COLUMN documents.ai_confidence IS 'Gemini AI confidence score (0-100)';
COMMENT ON COLUMN documents.extracted_text IS 'Full text extracted by Gemini OCR';
COMMENT ON COLUMN documents.category IS 'Document category for filtering (same as document_type)';

