# TrackMyOPT Database

> **Professional-grade PostgreSQL database schema for TrackMyOPT**  
> Built on Supabase with enterprise security patterns

---

## 📁 Directory Structure

```
supabase/
├── README.md                    # This file - Start here!
├── DATABASE_INVENTORY.md        # Audit: 28 tables + 6 views (34) vs codebase — read before dropping anything
├── migrations/                  # Canonical, ordered database history
├── schema/                      # Legacy core snapshot; reference only
│   ├── 000_extensions.sql       # PostgreSQL extensions
│   ├── 001_tables.sql           # All table definitions
│   ├── 002_indexes.sql          # Performance indexes
│   ├── 003_rls_policies.sql     # Row Level Security policies
│   ├── 004_functions.sql        # Stored procedures & functions
│   ├── 005_triggers.sql         # Database triggers
│   ├── 006_views.sql            # Analytics views
│   └── 007_grants.sql           # Permission grants
└── admin/                       # Admin & maintenance scripts
    ├── manual_premium_upgrade.sql
    ├── check_user_status.sql
    ├── analytics_queries.sql
    └── maintenance.sql
```

---

## 🚀 Quick Start for New Developers

### First Day Setup

1. **Get Supabase Access**
   - Request access to the Supabase project from your team lead
   - Project URL: `https://supabase.com/dashboard/project/deknauqkqqzwuvopqott`

2. **Understand the Schema**
   - Read through `schema/001_tables.sql` to understand all tables
   - Each table has detailed comments explaining its purpose

3. **Run Test Queries**
   ```sql
   -- Check your user profile
   SELECT * FROM profiles WHERE user_id = auth.uid();
   
   -- View all tables
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

### Fresh Database Setup

Use the Supabase CLI migrations as the source of truth:

```bash
supabase db reset
```

Do **not** initialize a database by running `schema/000`–`007`. Those files
are a historical core snapshot and do not include every table, policy, view,
or function added by later product work. New database changes must be added as
an ordered file in `migrations/`; update the legacy snapshot only when a change
also affects one of its original core objects.

---

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles (auto-created on signup) | ✅ User-only |
| `opt_status` | OPT timeline dates | ✅ User-only |
| `employment_spans` | Employment history | ✅ User-only |
| `case_status` | USCIS case tracking | ✅ User-only |

### Document Vault (Premium)

| Table | Purpose | RLS |
|-------|---------|-----|
| `document_passcodes` | Vault access codes | ✅ User-only |
| `documents` | Document metadata | ✅ User-only |
| `document_reminders` | Expiry reminders | ✅ User-only |

### Email & Payments

| Table | Purpose | RLS |
|-------|---------|-----|
| `email_preferences` | Email settings | ✅ User-only |
| `email_queue` | Email history | ✅ Read-only |
| `payment_transactions` | Stripe payments | ✅ Read-only |
| `blocked_emails` | Bounced emails | 🔒 Service-only |

### Settings

| Table | Purpose | RLS |
|-------|---------|-----|
| `notification_settings` | Notification prefs | ✅ User-only |

---

## 🔒 Security Architecture

### Row Level Security (RLS)

All tables have RLS enabled with optimized policies:

```sql
-- ✅ CORRECT: Uses (select auth.uid()) for performance
CREATE POLICY "profiles self" ON profiles
  FOR ALL USING ((select auth.uid()) = user_id);

-- ❌ WRONG: Re-evaluates auth.uid() for each row
CREATE POLICY "profiles self" ON profiles
  FOR ALL USING (auth.uid() = user_id);
```

### Permission Levels

| Role | Access |
|------|--------|
| `anon` | No access (must authenticate) |
| `authenticated` | Own data only (via RLS) |
| `service_role` | Full access (bypasses RLS) |

### Security Best Practices

1. **Never expose `service_role` key** in client code
2. **All policies use `(select auth.uid())`** for performance
3. **Sensitive tables** (blocked_emails) are service_role only
4. **Views use `SECURITY INVOKER`** to respect RLS

---

## 📋 Table Reference

### profiles

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,           -- Links to auth.users
  email TEXT,                         -- Synced from auth
  first_name TEXT,
  last_name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_stem_eligible BOOLEAN DEFAULT FALSE,
  
  -- Premium
  premium_status BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  
  -- Notification Emails
  notification_email TEXT,            -- Case Status & Documents
  opt_apply_email TEXT,               -- OPT Apply tool
  opt_clock_email TEXT,               -- OPT Clock tool
  stem_apply_email TEXT,              -- STEM Apply tool
  stem_clock_email TEXT,              -- STEM Clock tool
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### opt_status

```sql
CREATE TABLE opt_status (
  user_id UUID PRIMARY KEY,
  program_end_date DATE NOT NULL,     -- Graduation date
  dso_recommendation_date DATE,       -- DSO recommendation
  opt_start_date DATE NOT NULL,       -- OPT start
  opt_ead_end_date DATE NOT NULL,     -- EAD expiration
  stem_start_date DATE,               -- STEM extension start
  last_updated_field TEXT,            -- Track last edit
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT NOT NULL,        -- passport, visa, ead_card, etc.
  expiry_date DATE,
  
  -- AI Analysis
  ai_analyzed BOOLEAN DEFAULT FALSE,
  ai_confidence INTEGER,              -- 0-100
  extracted_text TEXT,
  extracted_fields JSONB,
  
  -- Storage
  s3_key TEXT NOT NULL,
  s3_bucket TEXT NOT NULL,
  
  deleted_at TIMESTAMPTZ              -- Soft delete
);
```

---

## ⚡ Functions Reference

| Function | Purpose | Security |
|----------|---------|----------|
| `handle_new_user()` | Auto-create profile on signup | DEFINER |
| `upgrade_user_to_premium()` | Premium upgrade via Stripe | DEFINER |
| `get_premium_users_for_daily_email()` | Email cron job | DEFINER |
| `get_document_expiry_status()` | Check document status | INVOKER |
| `create_document_reminders()` | Auto-create reminders | INVOKER |

---

## 🔧 Common Operations

### Check User Premium Status

```sql
SELECT user_id, email, premium_status, premium_purchased_at
FROM profiles
WHERE email = 'user@example.com';
```

### Manually Upgrade to Premium

```sql
UPDATE profiles
SET 
  premium_status = TRUE,
  premium_purchased_at = NOW()
WHERE email = 'user@example.com';
```

### View Document Expiry Status

```sql
SELECT 
  file_name,
  document_type,
  expiry_date,
  get_document_expiry_status(expiry_date) as status
FROM documents
WHERE user_id = auth.uid()
  AND deleted_at IS NULL;
```

### Calculate OPT Days Remaining

```sql
SELECT 
  opt_ead_end_date - CURRENT_DATE as days_remaining
FROM opt_status
WHERE user_id = auth.uid();
```

---

## 🛠 Admin Scripts

Located in `admin/` folder:

| Script | Purpose |
|--------|---------|
| `manual_premium_upgrade.sql` | Upgrade user to premium |
| `check_user_status.sql` | Debug user data |
| `analytics_queries.sql` | Business metrics |
| `maintenance.sql` | Database cleanup |

---

## 📈 Views for Analytics

| View | Purpose |
|------|---------|
| `premium_stats` | Premium conversion metrics |
| `email_delivery_stats` | Email delivery rates |
| `revenue_stats` | Payment/revenue metrics |
| `document_expiry_overview` | Document status summary |
| `user_activity_summary` | User engagement |

---

## 🐛 Troubleshooting

### "permission denied for table"
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check your auth status
SELECT auth.uid(), auth.role();
```

### "relation does not exist"
Run the schema files in order (000 → 007).

### Trigger not firing
```sql
-- Verify trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%updated_at%';
```

---

## 📚 Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Functions](https://supabase.com/docs/guides/database/functions)

---

## 🏷 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Core tables, RLS, functions |
| 1.1 | Premium | Payment, email system |
| 1.2 | Documents | Document vault, AI analysis |
| 1.3 | Notifications | Tool-specific emails |
| 2.0 | Refactor | Professional schema structure |
