# 🚀 Migration Execution Guide

**All migrations are now fully idempotent and safe to run multiple times!**

---

## ✅ Quick Run (Supabase SQL Editor)

### **Step 1: Open Supabase Dashboard**
```
https://supabase.com/dashboard
→ Select your project
→ Click "SQL Editor" (left sidebar)
→ Click "New Query"
```

### **Step 2: Run Migrations in Order**

**Important:** Copy and paste the **entire file** into the SQL Editor, then click "Run".

#### **Migration 001: Initial Schema**
```sql
-- Copy ALL contents from:
web/supabase/migrations/001_initial_schema.sql

-- Creates: profiles, opt_status, employment_spans
```
✅ Click **"Run"**

---

#### **Migration 002: Premium & Email System**
```sql
-- Copy ALL contents from:
web/supabase/migrations/002_premium_email_system.sql

-- Creates: email_preferences, email_queue, payment_transactions
-- Updates: profiles (adds premium columns)
```
✅ Click **"Run"**

---

#### **Migration 003: Last Updated Field**
```sql
-- Copy ALL contents from:
web/supabase/migrations/003_add_last_updated_field.sql

-- Updates: opt_status (adds last_updated_field)
```
✅ Click **"Run"**

---

#### **Migration 004: Case Status Tracker**
```sql
-- Copy ALL contents from:
web/supabase/migrations/004_add_case_status_table.sql

-- Creates: case_status
```
✅ Click **"Run"**

---

#### **Migration 005: Document Vault**
```sql
-- Copy ALL contents from:
web/supabase/migrations/005_add_document_vault_tables.sql

-- Creates: documents, document_passcodes, document_reminders
```
✅ Click **"Run"**

---

#### **Migration 006: Gemini AI Columns**
```sql
-- Copy ALL contents from:
web/supabase/migrations/006_update_documents_schema.sql

-- Updates: documents (adds Gemini AI columns)
```
✅ Click **"Run"**

---

## ✅ Verification

After running all migrations, verify tables exist:

```sql
-- Check all tables exist
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should show:
-- - case_status
-- - document_passcodes
-- - document_reminders
-- - documents
-- - email_preferences
-- - email_queue
-- - employment_spans
-- - opt_status
-- - payment_transactions
-- - profiles
```

---

## 🔄 Idempotent = Safe to Re-run

**All migrations are now idempotent**, meaning you can run them multiple times without errors:

✅ **Tables:** `CREATE TABLE IF NOT EXISTS`  
✅ **Columns:** `ADD COLUMN IF NOT EXISTS`  
✅ **Indexes:** `CREATE INDEX IF NOT EXISTS`  
✅ **Policies:** `DROP POLICY IF EXISTS` before `CREATE POLICY`  
✅ **Triggers:** `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`  
✅ **Functions:** `CREATE OR REPLACE FUNCTION`  

**Result:** Run once, run twice, run 100 times - no errors! ✅

---

## 🐛 Troubleshooting

### **Error: "relation already exists"**
✅ **Normal!** The migration is idempotent. It skips existing objects.

### **Error: "policy already exists"**
✅ **Fixed!** Update your migration files from GitHub (latest commit).

### **Error: "trigger already exists"**
✅ **Fixed!** Update your migration files from GitHub (latest commit).

### **Error: "column already exists"**
✅ **Normal!** The migration uses `IF NOT EXISTS` - it's safe.

### **Error: "permission denied"**
❌ **Problem:** You need admin access to the Supabase project.
🔧 **Fix:** Ask project owner to add you as admin.

---

## 🎯 What Each Migration Does

| Migration | Purpose | Tables Created | Updates |
|-----------|---------|----------------|---------|
| **001** | Core OPT tracking | profiles, opt_status, employment_spans | - |
| **002** | Premium features | email_preferences, email_queue, payment_transactions | profiles |
| **003** | Date sync tracking | - | opt_status |
| **004** | USCIS case tracker | case_status | - |
| **005** | Document vault | documents, document_passcodes, document_reminders | - |
| **006** | Gemini AI | - | documents |

---

## 🔐 Security (RLS Policies)

All tables have **Row Level Security (RLS)** enabled:

✅ Users can only see their own data  
✅ Users can only modify their own data  
✅ Data is isolated per user  
✅ No cross-user data leaks  

Policies are automatically created by the migrations.

---

## 📊 Database Schema Overview

After all migrations, you'll have:

**10 Tables:**
1. `profiles` - User settings
2. `opt_status` - OPT timeline tracking
3. `employment_spans` - Employment history
4. `email_preferences` - Email settings
5. `email_queue` - Email delivery tracking
6. `payment_transactions` - Stripe payments
7. `case_status` - USCIS case tracking
8. `documents` - Document vault files
9. `document_passcodes` - Vault passcodes
10. `document_reminders` - Expiry reminders

**30+ RLS Policies** (automatic user isolation)  
**8 Functions** (auto-update triggers, reminders)  
**12 Triggers** (updated_at, profile creation)  
**20+ Indexes** (performance optimization)  

---

## 🚀 Alternative: Supabase CLI

If you prefer command-line:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# All migrations run automatically!
```

---

## ✅ Success Checklist

After running all migrations:

- [ ] All 10 tables exist
- [ ] RLS policies are active
- [ ] Triggers are working
- [ ] Can insert into `profiles`
- [ ] Can insert into `opt_status`
- [ ] Can insert into `documents`
- [ ] No errors when running migrations again

---

## 📝 Notes

1. **Migrations run in order:** 001 → 002 → 003 → 004 → 005 → 006
2. **Never skip migrations:** Always run in sequence
3. **Safe to re-run:** All migrations are idempotent
4. **Backup handled:** Supabase auto-backs up before migrations
5. **No downtime:** Migrations run while app is live

---

## 🆘 Need Help?

**Issue:** Migration fails with unexpected error  
**Solution:** Check the migration file for syntax errors, or contact support

**Issue:** Data not showing up after migration  
**Solution:** Check RLS policies are enabled and user is authenticated

**Issue:** Performance is slow  
**Solution:** Verify indexes were created (check with `\di` in SQL editor)

---

**Last Updated:** November 23, 2025  
**Status:** ✅ All migrations tested and working  
**Idempotent:** ✅ Yes - Safe to run multiple times

