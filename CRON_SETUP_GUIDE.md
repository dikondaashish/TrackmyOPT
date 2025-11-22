# 🕐 Cron Jobs Setup Guide

## Overview

TrackMyOPT uses **2 cron jobs** to automate background tasks:
1. **Daily Email Reminders** - Runs on Vercel Cron (internal)
2. **USCIS Case Status Checker** - Runs on cron-job.org (external)

---

## 1️⃣ Daily Email Reminders ✅ (Vercel Cron)

**Status:** ✅ Already configured  
**No action needed** - This runs automatically via Vercel

### Details:
- **Endpoint:** `/api/cron/send-daily-reminders`
- **Schedule:** `0 13 * * *` (1:00 PM UTC = 9:00 AM EST, daily)
- **Purpose:** Sends personalized OPT countdown emails to premium users
- **Configuration:** Defined in `vercel.json`
- **Security:** Protected by `CRON_SECRET` environment variable

### What it does:
- Fetches all premium users with verified emails
- Calculates OPT countdowns (filing windows, unemployment days)
- Sends personalized emails with urgency levels
- Logs results to database

---

## 2️⃣ USCIS Case Status Checker 🔧 (cron-job.org)

**Status:** 🔧 Requires manual setup  
**Action Required:** Set up on cron-job.org

### Details:
- **Endpoint:** `/api/cron/check-case-status`
- **Schedule:** Every 6 hours
- **Purpose:** Automatically checks USCIS status for all tracked receipt numbers
- **Configuration:** External service (cron-job.org)

---

## 📋 Step-by-Step Setup for cron-job.org

### Prerequisites:
1. Your website is deployed: `https://www.trackmyopt.com`
2. You have the `CRON_SECRET` value from Vercel environment variables
3. Create a free account at https://cron-job.org

---

### Step 1: Get Your CRON_SECRET

**Option A - From Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project: `TrackMyOPT`
3. Go to **Settings** → **Environment Variables**
4. Find `CRON_SECRET` and copy its value

**Option B - From Terminal:**
```bash
vercel env pull
cat .env.local | grep CRON_SECRET
```

**Copy the secret value** - you'll need it in Step 3.

---

### Step 2: Create Account on cron-job.org

1. Go to https://cron-job.org
2. Click **"Sign Up"** (free account)
3. Verify your email
4. Log in to your dashboard

---

### Step 3: Create the Cron Job

#### A. Click "Create Cronjob"

#### B. Fill in the form:

**Basic Settings:**
- **Title:** `TrackMyOPT - USCIS Status Checker`
- **Address (URL):** `https://www.trackmyopt.com/api/cron/check-case-status`
- **Execution Schedule:**
  - Select: **"Every 6 hours"**
  - OR use custom cron: `0 */6 * * *`
  - OR specific times: `0 0,6,12,18 * * *` (at 12am, 6am, 12pm, 6pm UTC)

**Advanced Settings:**
Click **"Advanced"** to expand options:

- **Request Method:** `GET`
- **Request Timeout:** `30` seconds (maximum allowed on free tier)
- **Follow Redirects:** ✅ Yes
- **Save Responses:** ✅ Yes (recommended for debugging)

⚠️ **Note:** Free tier max timeout is 30 seconds. With the 2-second delay between case checks, you can process ~12-15 cases per run. If you have more receipt numbers, consider upgrading to paid tier or optimizing the endpoint.

**Headers:**
Click **"Add Header"** and enter:

⚠️ **IMPORTANT:** The header format must be EXACTLY as shown below:

```
Key:   Authorization
Value: Bearer YOUR_CRON_SECRET
```

**Example with actual secret:**
```
Key:   Authorization
Value: Bearer 18az3X17miX5FgS4o4aqpg6IzZiKuju...
```

**Common Mistakes to Avoid:**
- ❌ Key: `CRON_SECRET` → ✅ Should be: `Authorization`
- ❌ Value: `YOUR_SECRET` → ✅ Should be: `Bearer YOUR_SECRET` (with "Bearer " prefix and space)
- ❌ Missing space after "Bearer"
- ❌ Extra quotes around the value

**Notifications:**
- Enable email notifications for failures (optional but recommended)
- Add your email address

#### C. Verify Your Settings

Before saving, double-check:

**Common Tab:**
- ✅ URL ends with `/api/cron/check-case-status`
- ✅ Schedule is "Every 6 hours" or `0 */6 * * *`
- ✅ "Save responses" is checked

**Advanced Tab:**
- ✅ Header Key is `Authorization` (NOT `CRON_SECRET`)
- ✅ Header Value starts with `Bearer ` (note the space!)
- ✅ Timeout is set to 30 seconds
- ✅ Request method is GET

#### D. Save the Cron Job

Click **"Create cronjob"** (or **"Save"** if editing) at the bottom.

---

### Step 4: Test the Cron Job

#### Option 1 - Test via cron-job.org Dashboard:
1. Find your newly created cron job in the dashboard
2. Click the **"Run now"** button
3. Wait for the response (may take 10-30 seconds)
4. Check the **"Executions"** tab
5. Look for a **200 OK** response

**Expected Response:**
```json
{
  "ok": true,
  "message": "Cron job completed",
  "total": 5,
  "successful": 5,
  "changed": 1,
  "results": [...]
}
```

#### Option 2 - Test via Command Line:
```bash
curl -X GET "https://www.trackmyopt.com/api/cron/check-case-status" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

**Expected Output:**
```
< HTTP/2 200
< content-type: application/json
{
  "ok": true,
  "message": "Cron job completed",
  ...
}
```

---

### Step 5: Monitor Execution

#### In cron-job.org Dashboard:
1. Go to your cron jobs list
2. Click on **"TrackMyOPT - USCIS Status Checker"**
3. View the **"Executions"** tab
4. Check recent runs:
   - ✅ Green = Success
   - ❌ Red = Failed
5. Click any execution to see full response

#### Check Your Application Logs:
1. Go to Vercel Dashboard
2. Open your project
3. Go to **"Logs"** (Deployments → Functions)
4. Filter for `/api/cron/check-case-status`
5. Look for logs like:
   ```
   🕐 Cron job started: Check case status
   📋 Found 5 cases to check
   🔍 Checking IOE1234567890...
   ✅ Status unchanged for IOE1234567890
   ✅ Cron job completed: 5/5 successful, 1 changed
   ```

---

## 🔒 Security Considerations

### CRON_SECRET Protection:
- **Never commit** `CRON_SECRET` to git
- Store it only in Vercel environment variables
- Use the same secret in cron-job.org headers

### Rate Limiting:
The endpoint includes built-in rate limiting:
- 2-second delay between USCIS checks
- Prevents overwhelming the USCIS website
- Avoids getting IP blocked

### Error Handling:
- Failed checks are logged but don't stop the cron job
- Partial failures are reported in the response
- Unauthorized requests return 401 immediately

---

## 🐛 Troubleshooting

### Problem: "Unauthorized" (401 Error)

**Cause:** CRON_SECRET mismatch

**Solution:**
1. Verify the `CRON_SECRET` in Vercel matches the one in cron-job.org
2. Check for extra spaces or characters
3. Ensure the header format is exactly:
   ```
   Authorization: Bearer YOUR_SECRET_HERE
   ```
   (Note: "Bearer" must have capital B, followed by a space)

### Problem: "Timeout" (504 Error)

**Cause:** Request taking too long (>30 seconds on free tier)

**Solution:**
1. Check how many cases are being checked (visible in logs)
2. The endpoint processes ~1 case per 2 seconds (with rate limiting)
3. **With 30-second timeout, maximum ~12-15 cases can be checked per run**
4. If you have more cases:
   - **Option A:** Upgrade cron-job.org to paid tier (allows 60-120 second timeouts)
   - **Option B:** Run checks more frequently (every 3 hours instead of 6)
   - **Option C:** Optimize the endpoint to use parallel checking (requires code changes)
   - **Option D:** Add pagination to check different batches each run

### Problem: "No cases to check" in Response

**Cause:** No receipt numbers saved in database

**Solution:**
1. Go to https://www.trackmyopt.com/dashboard/case-status
2. Add a receipt number (e.g., IOE1234567890)
3. Run the cron job again
4. Should now show cases being checked

### Problem: USCIS API Returns Errors

**Cause:** USCIS website may be down or blocking requests

**Solution:**
1. This is expected occasionally
2. The cron job logs the error but continues
3. Will retry on the next scheduled run
4. Consider adding exponential backoff (future enhancement)

---

## 📊 Monitoring Best Practices

### Daily Checks:
1. Review cron-job.org dashboard once per day
2. Look for consistent success rate (>95%)
3. Check execution duration (should be <30 seconds on free tier)
4. Monitor if any timeouts occur (indicates too many cases)

### Weekly Checks:
1. Review Vercel function logs for patterns
2. Check database for status change history
3. Verify email notifications are working (if enabled)

### Monthly Checks:
1. Review total executions (should be ~120/month for 6-hour intervals)
2. Check for any IP blocks or rate limiting issues
3. Update CRON_SECRET if compromised

---

## 🔄 Updating the Schedule

### To Change Frequency:

**Every 3 hours:**
```
Schedule: 0 */3 * * *
```

**Every 12 hours (twice daily):**
```
Schedule: 0 0,12 * * *
```

**Specific times only (e.g., 9am, 3pm, 9pm EST):**
```
Schedule: 0 14,20,2 * * *
(Convert EST to UTC by adding 5 hours)
```

**Once per day (at midnight UTC):**
```
Schedule: 0 0 * * *
```

---

## 📞 Support

### If Issues Persist:

1. **Check Vercel Status:** https://www.vercel-status.com
2. **Check cron-job.org Status:** https://status.cron-job.org
3. **Review Application Logs:** Vercel Dashboard → Logs
4. **Test Endpoint Manually:** Use curl command from Step 4

---

## ✅ Verification Checklist

After setup, verify these items:

- [ ] Cron job appears in cron-job.org dashboard
- [ ] Schedule is set to every 6 hours (or your preferred interval)
- [ ] Authorization header includes correct `CRON_SECRET`
- [ ] Request timeout is set to 30 seconds (free tier max)
- [ ] Email notifications are enabled (optional)
- [ ] Test run returns 200 OK
- [ ] Vercel logs show cron job execution
- [ ] Cases are being checked (visible in response)
- [ ] Status changes trigger notifications (if premium)
- [ ] You have fewer than 15 receipt numbers (or consider upgrading for longer timeout)

---

## 📈 Expected Behavior

### Normal Operation:
```
🕐 00:00 UTC - Cron runs, checks 5 cases, all unchanged → ✅
🕐 06:00 UTC - Cron runs, checks 5 cases, 1 changed → ✅ (notification sent)
🕐 12:00 UTC - Cron runs, checks 5 cases, all unchanged → ✅
🕐 18:00 UTC - Cron runs, checks 5 cases, all unchanged → ✅
```

### In cron-job.org:
- **Last Execution:** < 6 hours ago
- **Status:** ✅ Success
- **Response Time:** 5-30 seconds
- **Response Code:** 200

### In Vercel Logs:
```
✅ Cron job completed: 5/5 successful, 1 changed
```

---

**Last Updated:** 2025-11-22  
**Cron Service:** cron-job.org (Free Tier)  
**Endpoint Status:** ✅ Production Ready

