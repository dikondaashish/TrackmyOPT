# 🔔 Document Reminder Cron Job Setup (cron-job.org)

## Overview

This guide shows you how to set up automated daily email reminders for expiring documents using [cron-job.org](https://cron-job.org/).

**What it does:**
- Checks for reminders due today
- Sends email notifications to users
- Marks reminders as sent
- Handles failures gracefully

---

## 📋 Prerequisites

1. ✅ Document Vault backend deployed
2. ✅ Resend API key configured
3. ✅ CRON_SECRET environment variable set
4. ✅ cron-job.org account (free)

---

## 🚀 Step-by-Step Setup

### **Step 1: Create cron-job.org Account**

1. Go to [https://cron-job.org](https://cron-job.org)
2. Click **"Sign up"** (top right)
3. Create free account
4. Verify your email

### **Step 2: Create New Cron Job**

1. Log in to cron-job.org
2. Click **"Cronjobs"** in the left sidebar
3. Click **"Create cronjob"** button

### **Step 3: Configure Job Settings**

**Basic Settings:**

| Field | Value |
|-------|-------|
| **Title** | TrackMyOPT - Document Reminders |
| **Address (URL)** | `https://www.trackmyopt.com/api/cron/send-document-reminders` |
| **Request method** | GET |
| **Execution schedule** | Every day at 09:00 |

**Schedule Configuration:**

- **Type:** Daily
- **Time:** 09:00 (9:00 AM EST)
- **Timezone:** America/New_York (EST)

### **Step 4: Add Authorization Header**

Under **"HTTP request headers"**:

1. Click **"Add header"**
2. **Header name:** `Authorization`
3. **Header value:** `Bearer YOUR_CRON_SECRET`
   - Replace `YOUR_CRON_SECRET` with the value from your `CRON_SECRET` env variable

### **Step 5: Configure Advanced Settings**

**Advanced Options:**

| Setting | Value | Description |
|---------|-------|-------------|
| **Timeout** | 30 seconds | Max execution time |
| **Retry on failure** | Yes (3 times) | Retry if request fails |
| **Success codes** | 200-299 | HTTP status codes considered successful |
| **Notification email** | Your email | Get notified on failures |

### **Step 6: Save and Test**

1. Click **"Create cronjob"**
2. Click **"Execute now"** to test immediately
3. Check execution log for success
4. Verify in your application logs

---

## 🔐 Environment Variables

### **Add to Vercel:**

```env
# Cron Job Security
CRON_SECRET=your-random-32-character-secret-key

# Resend Email API
RESEND_API_KEY=re_...

# Already configured (Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Generate CRON_SECRET:**
```bash
# Use this command to generate a secure random secret
openssl rand -hex 32
```

---

## 📊 Monitoring

### **Check Execution Logs:**

1. Go to cron-job.org dashboard
2. Click on your cronjob
3. View **"Execution history"** tab
4. See:
   - Status codes
   - Response time
   - Response body
   - Error messages

### **What Success Looks Like:**

**HTTP 200 Response:**
```json
{
  "success": true,
  "message": "Reminder emails processed",
  "sent": 5,
  "failed": 0,
  "total": 5
}
```

### **What Failure Looks Like:**

**HTTP 401 (Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```
**Fix:** Check your `Authorization` header has correct `CRON_SECRET`

**HTTP 500 (Server Error):**
```json
{
  "error": "Cron job failed",
  "details": "..."
}
```
**Fix:** Check Vercel logs for detailed error

---

## 📧 Email Notifications

### **When Emails Are Sent:**

- ✅ Document expires in **6 months** (180 days)
- ✅ Document expires in **3 months** (90 days)
- ✅ Document expires in **1 month** (30 days)
- ✅ Document expires in **7 days**

### **Email Format:**

- **Subject:** `⏰ Document Expiring Soon: [filename]`
- **From:** `TrackMyOPT <notifications@trackmyopt.com>`
- **Content:** HTML email with:
  - Urgency badge (CRITICAL/URGENT/REMINDER)
  - Document details
  - Expiry date
  - Days remaining
  - CTA button to view document

### **User Preferences:**

Users can disable document reminders in:
```
Dashboard → Settings → Email Preferences → Document Reminders
```

If disabled, reminders are marked as "cancelled" and not sent.

---

## 🧪 Testing

### **Test Immediately:**

1. **Via cron-job.org:**
   - Go to your cronjob
   - Click **"Execute now"**
   - Check execution log

2. **Via curl:**
```bash
curl -X GET https://www.trackmyopt.com/api/cron/send-document-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **Test Scenarios:**

1. **No reminders due today:**
   ```json
   {
     "success": true,
     "message": "No reminders to send today",
     "sent": 0
   }
   ```

2. **Reminders sent successfully:**
   ```json
   {
     "success": true,
     "message": "Reminder emails processed",
     "sent": 3,
     "failed": 0,
     "total": 3
   }
   ```

3. **Some failures:**
   ```json
   {
     "success": true,
     "message": "Reminder emails processed",
     "sent": 2,
     "failed": 1,
     "total": 3
   }
   ```

---

## 🐛 Troubleshooting

### **Problem: 401 Unauthorized**

**Cause:** Incorrect or missing `Authorization` header

**Fix:**
1. Check `CRON_SECRET` in Vercel matches header value
2. Ensure header format is: `Bearer YOUR_SECRET` (with space)
3. Redeploy if `CRON_SECRET` was just added

### **Problem: No emails being sent**

**Cause:** Resend API key issue or email preferences

**Fix:**
1. Verify `RESEND_API_KEY` in Vercel
2. Check user has email notifications enabled
3. Verify reminder dates are set correctly
4. Check Vercel logs for specific errors

### **Problem: 500 Server Error**

**Cause:** Code error or database issue

**Fix:**
1. Check Vercel function logs
2. Verify database connection
3. Check Supabase service role key
4. Review recent code changes

### **Problem: Emails not reaching users**

**Cause:** Email delivery issues

**Fix:**
1. Check spam folder
2. Verify Resend domain is verified
3. Check Resend dashboard for delivery logs
4. Test with your own email first

---

## 📈 Performance

### **Execution Stats:**

- **Average duration:** 2-5 seconds
- **Max duration:** 30 seconds (timeout)
- **Frequency:** Daily at 9 AM EST
- **API calls per execution:** N+1 (N = reminders to send)

### **Scaling:**

cron-job.org free tier includes:
- ✅ Up to 60 executions per hour
- ✅ Unlimited cronjobs
- ✅ 1-minute precision
- ✅ Free forever

If you need more frequent checks (e.g., hourly), create additional cronjobs:
- 9 AM, 12 PM, 3 PM, 6 PM, etc.

---

## 🔄 Backup Plan

### **If cron-job.org is down:**

**Option 1: Use Vercel Cron (paid)**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/send-document-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

**Option 2: Use GitHub Actions**
```yaml
# .github/workflows/document-reminders.yml
name: Document Reminders
on:
  schedule:
    - cron: '0 14 * * *'  # 9 AM EST = 2 PM UTC
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron endpoint
        run: |
          curl -X GET ${{ secrets.CRON_URL }} \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## ✅ Checklist

Before going live, verify:

- [ ] cron-job.org account created
- [ ] Cronjob configured with correct URL
- [ ] Authorization header added
- [ ] Schedule set to daily at 9 AM EST
- [ ] Timeout set to 30 seconds
- [ ] Retry on failure enabled
- [ ] Notification email configured
- [ ] Test execution successful
- [ ] Emails received in inbox (not spam)
- [ ] Vercel logs show successful execution
- [ ] Database reminders marked as "sent"

---

## 📚 Additional Resources

- [cron-job.org Documentation](https://cron-job.org/en/documentation/)
- [cron-job.org API](https://cron-job.org/en/documentation/api/)
- [Resend Documentation](https://resend.com/docs)

---

**Setup Time:** ~10 minutes  
**Cost:** $0 (100% free)  
**Maintenance:** Minimal (auto-retry on failures)

**Status:** ✅ Production Ready

