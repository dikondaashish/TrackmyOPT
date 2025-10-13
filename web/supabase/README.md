# Supabase Database Setup

This directory contains SQL migrations for the TrackMyOPT database schema.

## 🚀 Quick Setup

### 1. Run the Migration

1. Open your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project: **deknauqkqqzwuvopqott**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `migrations/001_initial_schema.sql`
6. Paste into the SQL editor
7. Click **Run** or press `Ctrl/Cmd + Enter`

### 2. Verify Tables

After running the migration, verify in the **Table Editor**:
- ✅ `profiles` table
- ✅ `opt_status` table
- ✅ `employment_spans` table

All tables should have RLS enabled (green shield icon).

## 📊 Database Schema

### Tables

#### `profiles`
Extended user information linked to Supabase Auth users.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | Primary key, references auth.users |
| `timezone` | text | User's timezone (default: America/New_York) |
| `is_stem_eligible` | boolean | STEM OPT eligibility |
| `created_at` | timestamptz | Record creation timestamp |

#### `opt_status`
Core OPT timeline tracking with all critical dates.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | Primary key, references auth.users |
| `program_end_date` | date | Academic program completion date |
| `dso_recommendation_date` | date | DSO recommendation date |
| `opt_ead_end_date` | date | OPT EAD expiration date |
| `opt_start_date` | date | OPT period start date |
| `stem_start_date` | date | STEM extension start date (nullable) |
| `created_at` | timestamptz | Record creation timestamp |
| `updated_at` | timestamptz | Last update timestamp (auto-updated) |

#### `employment_spans`
Employment history tracking during OPT period.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `user_id` | uuid | References auth.users |
| `employer_name` | text | Employer name |
| `start_date` | date | Employment start date |
| `end_date` | date | Employment end date (NULL = current) |
| `created_at` | timestamptz | Record creation timestamp |

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only read/write their own data
- Policy name: `"[table_name] self"`
- Uses `auth.uid()` to match authenticated user

### Testing RLS

```sql
-- As authenticated user, this should return only your data
select * from profiles;
select * from opt_status;
select * from employment_spans;
```

## 🔧 Functions & Triggers

### Auto-create Profile on Signup
When a user signs up via Supabase Auth, a profile is automatically created:
- **Function**: `handle_new_user()`
- **Trigger**: `on_auth_user_created`

### Auto-update Timestamps
The `opt_status.updated_at` field is automatically updated on every update:
- **Function**: `update_updated_at_column()`
- **Trigger**: `update_opt_status_updated_at`

## 📝 Example Queries

### Create OPT Status for User
```sql
insert into opt_status (
  user_id,
  program_end_date,
  opt_start_date,
  opt_ead_end_date
) values (
  auth.uid(),
  '2024-05-15',
  '2024-06-01',
  '2025-05-31'
);
```

### Add Employment Record
```sql
insert into employment_spans (
  user_id,
  employer_name,
  start_date
) values (
  auth.uid(),
  'Tech Company Inc',
  '2024-07-01'
);
```

### Update Profile Timezone
```sql
update profiles
set timezone = 'America/Los_Angeles'
where user_id = auth.uid();
```

### Calculate Days Remaining
```sql
select 
  opt_ead_end_date - current_date as days_remaining
from opt_status
where user_id = auth.uid();
```

## 🔄 Future Migrations

To add new migrations:
1. Create `002_your_migration_name.sql`
2. Document changes in this README
3. Run in Supabase SQL Editor
4. Update the schema documentation

## 🐛 Troubleshooting

### "relation already exists" error
If you see this error, tables already exist. You can either:
1. Drop existing tables: `drop table if exists profiles cascade;`
2. Or modify the migration to use `create table if not exists`

### RLS blocks all access
Make sure you're authenticated when testing:
```sql
-- Check current user
select auth.uid();
```

### Trigger not working
Verify trigger exists:
```sql
select * from pg_trigger 
where tgname in ('on_auth_user_created', 'update_opt_status_updated_at');
```

## 📚 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Date Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)

