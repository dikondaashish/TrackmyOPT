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

### 002_premium_email_system.sql
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

### 003_add_most_recent_field.sql ✨ NEW
**Purpose:** Tracks which date field was most recently updated

**What it creates:**
1. **Updates `opt_status` table:**
   - `most_recent_field` - Stores which date field was last updated
   - Used by the Date Selector UI to highlight recently updated fields
   - Automatically updated by API when saving dates

**Values:** `program_end_date`, `dso_recommendation_date`, `opt_start_date`, `opt_ead_end_date`, `stem_start_date`

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

