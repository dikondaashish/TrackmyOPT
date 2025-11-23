# Database Migrations

**Location:** All migrations must be in this folder only.

**Run Order:** Migrations are executed in alphabetical order by filename.

---

## 📋 Migration Files (In Order)

### **001_initial_schema.sql**
**Purpose:** Core TrackMyOPT schema  
**Tables Created:**
- `profiles` - User profiles and settings
- `opt_status` - OPT timeline tracking (program end date, OPT dates, STEM dates)
- `employment_spans` - Employment history during OPT

**Features:**
- RLS policies for all tables
- Auto-create profile on user signup
- Timezone support for countdowns

**Status:** ✅ **REQUIRED** - Core functionality

---

### **002_premium_email_system.sql**
**Purpose:** Premium features and email reminders  
**Tables Created:**
- `email_preferences` - User email settings
- `email_queue` - Email delivery tracking
- `payment_transactions` - Stripe payment records

**Updates:**
- Adds premium columns to `profiles` (premium_status, stripe_customer_id, etc.)

**Features:**
- Daily email reminders (premium only)
- Payment tracking
- Email delivery analytics

**Status:** ✅ **REQUIRED** - Premium features

---

### **003_add_last_updated_field.sql**
**Purpose:** Track most recently updated date field  
**Updates:**
- Adds `last_updated_field` to `opt_status` table

**Used By:**
- Dashboard date selector (auto-selects most recent date)
- Two-way sync between extension and website

**Status:** ✅ **REQUIRED** - OPT Dates feature

---

### **004_add_case_status_table.sql**
**Purpose:** USCIS case status tracking  
**Tables Created:**
- `case_status` - USCIS receipt number tracking

**Features:**
- Auto-refresh case status (cron job via cron-job.org)
- Status change notifications (premium feature)
- History tracking

**Status:** ✅ **REQUIRED** - Case Status Tracker

---

### **005_add_document_vault_tables.sql**
**Purpose:** Secure document storage with AI analysis  
**Tables Created:**
- `document_passcodes` - 6-digit PIN protection
- `documents` - Document metadata and AI-extracted data
- `document_reminders` - Auto-generated expiry reminders

**Features:**
- Passcode protection with lockout (3 attempts → 10 min)
- AI document classification (9 types)
- Metadata extraction
- Auto-reminder generation (6mo, 3mo, 1mo, 7 days)

**Status:** ✅ **REQUIRED** - Document Vault (premium)

---

### **006_update_documents_schema.sql**
**Purpose:** Add Gemini AI columns  
**Updates:**
- Adds `filename`, `category`, `extracted_text`, `ai_confidence`, `summary`, `uploaded_at` to `documents`
- Creates indexes for faster queries

**Migration:**
- Migrates data from old column names (`file_name` → `filename`)

**Status:** ✅ **REQUIRED** - Gemini AI integration

---

## 🎯 Summary

**Total Migrations:** 6  
**All Status:** ✅ All required and in use

### **Tables by Feature:**

| Feature | Tables |
|---------|--------|
| **OPT Tracking** | profiles, opt_status, employment_spans |
| **Premium System** | email_preferences, email_queue, payment_transactions |
| **Case Tracker** | case_status |
| **Document Vault** | documents, document_passcodes, document_reminders |

---

## 🚀 Running Migrations

### **Automatic (Recommended):**
Migrations run automatically when you deploy to Vercel/Supabase.

### **Manual (Local Development):**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### **Run Specific Migration:**
```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste the migration file contents
# Click "Run"
```

---

## ⚠️ Important Notes

1. **Never modify existing migrations** - Create a new one instead
2. **Test migrations locally first** - Use Supabase local dev
3. **Migrations run in order** - 001, 002, 003, etc.
4. **Keep migrations idempotent** - Use `IF NOT EXISTS`, `IF EXISTS`
5. **Backup before running** - Supabase handles this automatically

---

## 📁 Project Structure

```
web/supabase/migrations/
├── README.md (this file)
├── 001_initial_schema.sql
├── 002_premium_email_system.sql
├── 003_add_last_updated_field.sql
├── 004_add_case_status_table.sql
├── 005_add_document_vault_tables.sql
└── 006_update_documents_schema.sql

scripts/
└── MANUAL_PREMIUM_UPGRADE.sql (manual testing utility)
```

---

## 🔄 Creating New Migrations

**Naming Convention:**
```
###_descriptive_name.sql
```

**Example:**
```
007_add_new_feature.sql
```

**Template:**
```sql
-- Migration: [Feature Name]
-- Purpose: [What this migration does]

-- Create tables
CREATE TABLE IF NOT EXISTS my_table (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_my_table_user_id ON my_table(user_id);

-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own data"
  ON my_table FOR SELECT
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE my_table IS 'Description of what this table stores';
```

---

**Last Updated:** November 23, 2025  
**Total Migrations:** 6  
**Status:** ✅ All organized and documented

