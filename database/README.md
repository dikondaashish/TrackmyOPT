# Database Migrations

This directory contains SQL migration scripts for the TrackMyOPT database.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of the migration file
5. Paste into the SQL editor
6. Click **Run** (or press `Ctrl/Cmd + Enter`)
7. Verify success message in the output

### Option 2: Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push

# Or run directly
supabase db execute -f database/migrations/002_premium_email_system.sql
```

### Option 3: psql Command Line

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i database/migrations/002_premium_email_system.sql

# Exit
\q
```

## Migrations List

### 001_initial_schema.sql
- Initial database setup
- Creates `profiles` and `opt_status` tables
- Sets up Row Level Security (RLS)

### 002_premium_email_system.sql ✨ NEW
**Purpose:** Adds premium email reminder system

**What it creates:**
1. **Updates `profiles` table:**
   - `premium_status` - Boolean flag for premium users
   - `premium_purchased_at` - Timestamp of purchase
   - `stripe_customer_id` - Stripe customer ID
   - `stripe_payment_intent_id` - Payment intent ID

2. **Creates `email_preferences` table:**
   - Stores user email addresses
   - Email verification status
   - Email enable/disable toggle
   - RLS policies for user privacy

3. **Creates `email_queue` table:**
   - Tracks all sent/pending emails
   - Status tracking (sent, failed, bounced)
   - Analytics data (opened, clicked)
   - Debugging information

4. **Creates `payment_transactions` table:**
   - All Stripe payment records
   - Transaction history
   - Refund tracking
   - Payment method info

5. **Helper Functions:**
   - `get_premium_users_for_daily_email()` - Get users for cron job
   - `upgrade_user_to_premium()` - Upgrade user after payment

6. **Analytics Views:**
   - `premium_stats` - Premium vs free user statistics
   - `email_delivery_stats` - Email delivery metrics
   - `revenue_stats` - Revenue and payment statistics

### 003_add_last_updated_field.sql
**Purpose:** Adds date tracking for dashboard dropdown selector

**What it creates:**
1. **Updates `opt_status` table:**
   - `last_updated_field` - Tracks which date was most recently updated
   - Allows dashboard dropdown to automatically select the most recent date

**Use case:**
- When user updates dates on `/dashboard/opt-dates` page
- Dashboard dropdown automatically selects that date type

---

### 004_add_case_status_table.sql
**Purpose:** Adds USCIS case status tracking feature

**What it creates:**
1. **`case_status` table:**
   - `id` - Unique identifier
   - `user_id` - Links to auth.users (with CASCADE delete)
   - `receipt_number` - USCIS receipt number (e.g., IOE123456789)
   - `current_status` - Latest case status from USCIS
   - `case_type` - Type of case (I-765, I-129, I-140, etc.)
   - `received_date` - Date USCIS received the case
   - `last_checked_at` - Last time we checked USCIS for updates
   - `last_status_change_at` - Last time status actually changed
   - `status_history` - JSONB array of historical status updates
   - `notifications_enabled` - Whether user wants notifications
   - `created_at`, `updated_at` - Timestamps
   
2. **Indexes:**
   - `idx_case_status_user_id` - Fast user lookups
   - `idx_case_status_receipt_number` - Fast receipt number lookups
   - `idx_case_status_last_checked` - Fast cron job queries
   
3. **RLS Policies:** Users can only access their own case status
4. **Triggers:** Auto-update `updated_at` timestamp
5. **Constraint:** One case per user (UNIQUE on user_id)

**Features enabled:**
- Users can track their USCIS case by receipt number
- Automatic status checks every 6 hours via cron job
- Email/SMS notifications when status changes (premium feature)
- Historical status tracking
- Prevents manual USCIS website checking

**Use case:**
- User enters USCIS receipt number on `/dashboard/case-status`
- System checks status every 6 hours
- User gets notified via email/SMS when status changes (if premium)

---

### 005_add_document_vault_tables.sql
**Purpose:** Premium-only secure document storage with AI analysis and expiry tracking

**What it creates:**
1. **`document_passcodes` table:**
   - `id` - Unique identifier
   - `user_id` - Links to auth.users
   - `passcode_hash` - Bcrypt hashed 6-digit PIN
   - `failed_attempts` - Track failed login attempts
   - `locked_until` - Temporary lockout after 3 failed attempts
   - `created_at`, `updated_at` - Timestamps
   - **Constraint:** One passcode per user (UNIQUE on user_id)

2. **`documents` table:**
   - `id` - Unique identifier
   - `user_id` - Links to auth.users
   - **File info:** file_name, file_size, file_type, s3_key, s3_bucket
   - **Classification:** document_type (passport, visa, i20, ead_card, etc.)
   - **AI analysis:** ai_analyzed, ai_analysis_date, raw_ocr_text
   - **Extracted metadata:** extracted_fields (JSONB with AI-extracted data)
   - **Dates:** issue_date, expiry_date
   - **User data:** notes, tags
   - **Soft delete:** deleted_at (documents never hard deleted)

3. **`document_reminders` table:**
   - `id` - Unique identifier
   - `user_id`, `document_id` - Foreign keys
   - **Reminder details:** reminder_type, reminder_message, send_at
   - **Status:** status (pending, sent, failed, cancelled)
   - **Channels:** email_sent, sms_sent, notification_sent
   - **Timestamps:** sent_at, created_at, updated_at

4. **Indexes:**
   - Fast queries by user_id, document_type, expiry_date
   - Optimized for reminder scheduling
   - Soft delete filtering

5. **RLS Policies:** Users can only access their own documents and reminders

6. **Functions:**
   - `get_document_expiry_status(date)` - Returns expiry status (good/attention/warning/critical/expired)
   - `create_document_reminders(user_id, document_id, name, expiry)` - Auto-generates 4 reminders (6mo, 3mo, 1mo, 7d)

7. **Triggers:** Auto-update `updated_at` timestamps

**Features enabled:**
- Premium-only document vault with passcode protection
- Upload documents to AWS S3
- AI-powered document analysis (OpenAI)
- Automatic metadata extraction (passport details, EAD info, SEVIS ID, etc.)
- Document expiry tracking with color-coded status
- Automatic reminder generation (6 months, 3 months, 1 month, 7 days before expiry)
- Email/SMS notifications for expiring documents
- Secure access with signed URLs (5-minute expiry)
- Soft delete (documents never permanently deleted)
- Full audit trail

**Security features:**
- Passcode hashed with bcrypt
- Failed attempt tracking and temporary lockout
- Row Level Security (RLS) ensures data isolation
- S3 files accessed only via signed URLs
- AES-256 encryption at rest (S3)
- Comprehensive access logging

**Document types supported:**
- Passport
- Visa
- I-20 (with SEVIS ID extraction)
- EAD Card (with category detection)
- I-983 Training Plan
- Offer Letter
- Paystub
- Receipt Notice (I-797)
- Other

**AI extraction capabilities:**
- Full name
- Document numbers (passport, SEVIS, USCIS, etc.)
- Issue and expiry dates
- Employer information
- Visa status
- OPT/STEM dates
- DSO signatures
- And more...

**Use case:**
1. Premium user clicks "Documents" tab
2. First time: Setup 6-digit PIN
3. Upload document (PDF/image)
4. AI analyzes and extracts metadata
5. Document card created with expiry status
6. Auto-reminders generated if has expiry date
7. User receives notifications before expiration
8. Secure download with signed URLs

## Verifying Migrations

After running a migration, verify it worked:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check new columns in profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View premium stats
SELECT * FROM premium_stats;

-- View email delivery stats (will be empty until emails are sent)
SELECT * FROM email_delivery_stats;

-- View revenue stats (will be empty until payments are made)
SELECT * FROM revenue_stats;
```

## Rollback (if needed)

If you need to rollback the premium email system migration:

```sql
-- Drop views
DROP VIEW IF EXISTS revenue_stats;
DROP VIEW IF EXISTS email_delivery_stats;
DROP VIEW IF EXISTS premium_stats;

-- Drop functions
DROP FUNCTION IF EXISTS upgrade_user_to_premium;
DROP FUNCTION IF EXISTS get_premium_users_for_daily_email;

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS email_queue;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS email_preferences;

-- Remove columns from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS premium_purchased_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS premium_status;
```

## Best Practices

1. **Always backup before migrations:**
   ```bash
   # Backup using Supabase dashboard
   # Go to Database > Backups
   # Or use pg_dump
   pg_dump "YOUR_DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test in development first:**
   - Run migrations in a dev/staging environment
   - Verify everything works
   - Then apply to production

3. **Keep migration files:**
   - Never delete migration files
   - They serve as documentation
   - Useful for setting up new environments

4. **Version control:**
   - Commit migration files to git
   - Include date and description in filename
   - Keep migrations in chronological order

## Troubleshooting

### Error: relation already exists
The table already exists. Either:
- You've already run this migration
- Use `CREATE TABLE IF NOT EXISTS` (already in our migrations)

### Error: column already exists
The column already exists. Either:
- You've already run this migration
- Use `ALTER TABLE ADD COLUMN IF NOT EXISTS` (already in our migrations)

### Error: permission denied
You need proper permissions:
- Make sure you're using the service role key
- Or run as superuser (postgres role)

### Error: RLS policy already exists
The policy already exists:
- Drop and recreate: `DROP POLICY IF EXISTS "policy_name" ON table_name;`
- Or use our migrations which handle this

## Need Help?

- Check Supabase docs: https://supabase.com/docs/guides/database
- SQL reference: https://www.postgresql.org/docs/
- Support: support@trackmyopt.com

