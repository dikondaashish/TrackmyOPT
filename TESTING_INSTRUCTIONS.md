# Testing Instructions for Dashboard & Extension Fixes

## ✅ What Was Fixed

### Issue 1: User Email Not Showing in Dashboard
**Problem:** Sidebar showed "U Loading... Upgrade to Pro" instead of actual user data

**Fix:**
- Added `credentials: 'include'` to API fetch calls
- Added proper error logging
- User email and initials now load correctly from `/api/me`

### Issue 2: Extension Upgrade Button Opening Wrong URL
**Problem:** Extension opened `http://localhost:3000/premium/checkout`

**Fix:**
- All 4 extension tools now use centralized `WEBSITE_URL` config
- All upgrade buttons redirect to: `https://www.trackmyopt.com/dashboard?upgrade=true`
- Pricing modal opens automatically in dashboard

---

## 🔄 IMPORTANT: Rebuild Extension

Since we updated the extension code, you **MUST** rebuild it:

```bash
cd extension
pnpm run build
```

Then reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Click the **reload** icon on TrackMyOPT extension
3. Or remove and re-add the extension from the `dist` folder

---

## 🧪 Testing Steps

### Test 1: Dashboard User Data
1. Login to https://www.trackmyopt.com/
2. Go to `/dashboard`
3. Check sidebar (bottom left)

**Expected Result:**
✅ Shows your actual email (e.g., "ashish@example.com")
✅ Shows your initials (e.g., "AD")
✅ If premium: Shows "PRO" badge
✅ If free: Shows "Upgrade to Pro" button

### Test 2: Sidebar Upgrade Button
1. In dashboard sidebar, click "Upgrade to Pro"

**Expected Result:**
✅ Pricing modal opens
✅ Shows "Free" and "Pro" plans
✅ Free plan shows "Current Plan" (disabled)
✅ Pro plan shows "Upgrade Now" button

### Test 3: Extension Upgrade Buttons (All 4 Tools)

#### Tool 1: OPT Countdown
1. Open extension
2. Go to OPT Countdown tool
3. Scroll to "Daily Reminders" section
4. Click "Upgrade to Premium - $2.99"

**Expected Result:**
✅ Opens https://www.trackmyopt.com/dashboard?upgrade=true
✅ Pricing modal opens automatically
✅ Same as Test 2 results

#### Tool 2: STEM Countdown
1. Open extension
2. Go to STEM Countdown tool
3. Scroll to "Daily Reminders" section
4. Click "Upgrade to Premium - $2.99"

**Expected Result:**
✅ Same as Tool 1

#### Tool 3: Clock Tracker
1. Open extension
2. Go to Clock Tracker tool
3. Look for upgrade section
4. Click upgrade button

**Expected Result:**
✅ Same as Tool 1

#### Tool 4: STEM Clock Tracker
1. Open extension
2. Go to STEM Clock Tracker tool
3. Look for upgrade section
4. Click upgrade button

**Expected Result:**
✅ Same as Tool 1

---

## 🐛 If Issues Persist

### Issue: Still seeing "U Loading..."
**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors starting with ❌
4. Check if cookies are enabled
5. Try logging out and back in

### Issue: Extension still opens localhost
**Solution:**
1. Rebuild extension: `cd extension && pnpm run build`
2. Remove extension from Chrome
3. Re-add from `extension/dist` folder
4. Make sure you're using the BUILT extension, not the src folder

### Issue: Pricing modal doesn't open
**Solution:**
1. Check browser console for errors
2. Make sure you're on `/dashboard` page
3. Try manually adding `?upgrade=true` to URL

---

## 📝 Files Changed

### Web (Dashboard):
- `/web/components/dashboard/DashboardLayoutClient.tsx` - Added credentials and logging
- `/web/components/dashboard/Sidebar.tsx` - Already correct
- `/web/app/dashboard/layout.tsx` - Wrapped in Suspense

### Extension:
- `/extension/src/pages/clock-tracker.ts` - Use WEBSITE_URL
- `/extension/src/pages/stem-clock-tracker.ts` - Use WEBSITE_URL  
- `/extension/src/pages/opt-countdown.ts` - Already updated
- `/extension/src/pages/stem-countdown.ts` - Already updated
- `/extension/src/config.ts` - Already set to production URL

---

## ✅ Success Criteria

All tests pass when:
1. ✅ Dashboard sidebar shows real user email
2. ✅ Dashboard sidebar shows correct initials
3. ✅ PRO badge shows for premium users
4. ✅ "Upgrade to Pro" shows for free users
5. ✅ Clicking upgrade opens pricing modal
6. ✅ All 4 extension tools redirect to dashboard
7. ✅ Pricing modal opens automatically from extension
8. ✅ Free plan shows "Current Plan" (disabled)
9. ✅ Pro plan shows upgrade/active status correctly

---

## 🚀 Deployment Checklist

- [x] Web code pushed to GitHub
- [x] Vercel will auto-deploy
- [ ] Extension rebuilt locally
- [ ] Extension reloaded in Chrome
- [ ] All tests passed

**After these steps, both issues should be completely resolved!**
