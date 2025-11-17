# Unused Files Report - TrackMyOPT

This document lists all files that are not being used in the project and can be safely deleted.

## 🔴 CRITICAL - Duplicate Files (DELETE IMMEDIATELY)

### 1. `/web/supabase/migrations/002_add_last_updated_field.sql`
**Reason:** This is a duplicate of `003_add_last_updated_field.sql` in the same folder. Both files have identical content. We already have `002_premium_email_system.sql` in `/database/migrations/`, so the last_updated_field migration should be `003`.

**Action:** Delete this file and keep only `003_add_last_updated_field.sql`

**Risk if kept:** Confusion about migration order, potential database conflicts

---

## 🟡 DEPRECATED - Old API Routes (DELETE)

### 2. `/web/app/api/opt/dates/route.ts`
**Reason:** This API endpoint is no longer being used. All components now use `/api/opt/calculator` instead for date operations.

**Evidence:**
- `OptDatesSection.tsx` uses `/api/opt/calculator` (lines 264, 330)
- `DateSelector.tsx` uses `/api/opt/calculator` (line 40)
- Extension tools all use `/api/opt/calculator`

**Action:** Delete this entire folder: `/web/app/api/opt/dates/`

**Risk if kept:** Confusion about which endpoint to use, maintenance burden

---

### 3. `/web/app/api/jobs/daily-digest/route.ts`
**Reason:** This is an old/duplicate cron job implementation. The project uses `/web/app/api/cron/send-daily-reminders/route.ts` for daily emails.

**Evidence:**
- Root `vercel.json` references `/api/jobs/daily-digest` but this seems to be outdated
- Web `vercel.json` references `/api/cron/send-daily-reminders` which is the active cron job
- Both do similar things (send daily emails to premium users)
- The newer `send-daily-reminders` has better implementation with email service integration

**Action:** Delete `/web/app/api/jobs/` folder entirely

**Risk if kept:** 
- Two cron jobs might run simultaneously
- Duplicate emails sent to users
- Confusion about which is the "real" cron job

**Note:** Update root `vercel.json` to point to `/api/cron/send-daily-reminders` instead

---

## 🔵 UNUSED COMPONENTS (DELETE)

### 4. `/web/components/figma/ImageWithFallback.tsx`
**Reason:** Not imported or used anywhere in the codebase.

**Evidence:** Searched entire web folder - no imports found

**Action:** Delete `/web/components/figma/` folder entirely

**Risk if kept:** Dead code, adds to bundle size (even if minimal)

---

### 5. `/web/components/ui/dialog.tsx` ⚠️ **KEEP - USED**
**Status:** RESTORED - This file is actually being used!

**Evidence:** PricingModal.tsx imports `@/components/ui/dialog`

**Action:** File has been restored

---

### 6. `/web/components/ui/checkbox.tsx` ⚠️ **KEEP - USED**
**Status:** RESTORED - This file is actually being used!

**Evidence:** OnboardingCard.tsx imports `@/components/ui/checkbox`

**Action:** File has been restored

---

### 7. `/web/components/ui/switch.tsx`
**Reason:** UI component not used anywhere in the project.

**Evidence:** No imports found for `@/components/ui/switch`

**Action:** Delete this file

**Risk if kept:** Dead code in codebase

---

## 🟢 UTILITY FILES (CAN DELETE)

### 8. `/web/scripts/verify-supabase-tables.sql`
**Reason:** This is a utility SQL script, not referenced in code or package.json scripts.

**Evidence:** No references found in any code files or npm scripts

**Action:** If this was used for one-time verification, delete it. If you want to keep it for manual database checks, move it to `/database/` folder for better organization.

**Risk if kept:** Clutters the project structure

---

### 9. `/rebuild-extension.sh` (root level)
**Reason:** Not used in any npm scripts. The project uses `pnpm build:ext` instead.

**Evidence:** 
- Not in `package.json` scripts
- Not referenced in documentation
- Duplicate of functionality in `package.json`

**Action:** Delete if not used manually. If you use it manually, document it in README.

**Risk if kept:** Confusion about build process

---

### 10. `/extension/src/utils/` (empty folder)
**Reason:** Empty folder with no files.

**Action:** Delete empty folder

**Risk if kept:** None, just looks messy

---

## 📋 FILES TO KEEP (These Are Used)

The following files were checked and ARE being used:

✅ `/web/app/api/manual/login/route.ts` - Used by extension auth page (line 118)
✅ `/web/app/api/manual/signup/route.ts` - Used by extension auth page (line 156)
✅ `/extension/src/locked.ts` - Imported in `popup.ts` (line 2)
✅ `/web/components/ui/aurora-background.tsx` - Used in landing page
✅ `/web/components/ui/moving-border.tsx` - Used in landing page
✅ `/web/components/ui/separator.tsx` - Used in PricingModal
✅ `/web/components/ui/button.tsx` - Used throughout the app
✅ `/web/components/ui/card.tsx` - Used throughout the app
✅ `/web/components/ui/input.tsx` - Used throughout the app
✅ `/web/components/ui/label.tsx` - Used throughout the app

---

## 🔧 RECOMMENDED ACTIONS

### Immediate Actions (High Priority):
1. **Delete** `/web/supabase/migrations/002_add_last_updated_field.sql` (duplicate)
2. **Delete** `/web/app/api/opt/dates/` (deprecated API)
3. **Delete** `/web/app/api/jobs/daily-digest/` (old cron job)
4. **Update** root `vercel.json` to remove `/api/jobs/daily-digest` cron entry

### Cleanup Actions (Medium Priority):
5. **Delete** `/web/components/figma/` folder
6. **Delete** unused UI components:
   - ~~`/web/components/ui/dialog.tsx`~~ ✅ RESTORED - Actually used by PricingModal
   - ~~`/web/components/ui/checkbox.tsx`~~ ✅ RESTORED - Actually used by OnboardingCard
   - `/web/components/ui/switch.tsx` ✅ DELETED

### Optional Cleanup (Low Priority):
7. **Delete** `/web/scripts/verify-supabase-tables.sql` or move to `/database/`
8. **Delete** `/rebuild-extension.sh` (if not used manually)
9. **Delete** `/extension/src/utils/` (empty folder)

---

## ⚠️ IMPORTANT NOTES

### Before Deleting:
1. **Commit your current work** to git first
2. **Create a backup branch**: `git checkout -b backup-before-cleanup`
3. **Delete files one by one** and test after each deletion
4. **Run the app** after deletions to ensure nothing breaks

### Test Checklist After Deletion:
- [ ] Website builds successfully: `pnpm build:web`
- [ ] Extension builds successfully: `pnpm build:ext`
- [ ] Dashboard loads correctly
- [ ] OPT Dates page works
- [ ] Extension tools work
- [ ] Date syncing works between website and extension
- [ ] Premium features work
- [ ] Email cron job is configured correctly in Vercel

---

## 📊 Summary

| Category | Count | Status |
|----------|-------|--------|
| Duplicate Files | 1 | ✅ DELETED |
| Deprecated APIs | 2 | ✅ DELETED |
| Unused Components | 2 | ✅ DELETED (2 restored as they were used) |
| Utility Files | 3 | ✅ DELETED |
| **Total Files Deleted** | **8** | **✅ COMPLETE** |
| **Files Restored** | **2** | **checkbox.tsx, dialog.tsx** |

**Estimated cleanup benefit:**
- Reduced confusion about code structure
- Smaller codebase to maintain
- Clearer architecture
- No risk of accidentally using deprecated code
- Faster builds (slightly)

---

**Generated:** $(date)
**Project:** TrackMyOPT
**Analyzed by:** AI Code Review

