# CRON Jobs Documentation

## Overview

OPT Hub uses Vercel Cron Jobs to send automated email reminders to users about their OPT deadlines.

## Configuration

### Vercel Setup

1. The `vercel.json` file in the project root defines the CRON schedule
2. CRON jobs run automatically on Vercel's infrastructure
3. No additional configuration needed in Vercel dashboard

### Current CRON Jobs

#### Daily Digest (`/api/jobs/daily-digest`)

**Schedule:** Every day at 9:00 AM ET (13:00 UTC)  
**Cron Expression:** `0 13 * * *`

**What it does:**
- Fetches all users with OPT status data
- Calculates days remaining until key deadlines
- Sends email reminders at specific thresholds

**Email Triggers:**

| Event | Days Before | Email Subject |
|-------|-------------|---------------|
| Program End Date | 60, 30, 10 | "OPT Application Window Opens in X Days" |
| OPT EAD End Date | 60, 30, 10 | "Your OPT Ends in X Days" |
| OPT Start Date | 14, 7, 3, 1 | "Your OPT Starts in X Days" |

## Environment Variables

### Required Variables

```env
# Supabase (for database access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for sending emails)
RESEND_API_KEY=re_xxxxx

# CRON Security
CRON_SECRET=your-random-secret-here

# Site URL (for links in emails)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Resend API Keys

We use two separate Resend API keys for different types of emails:

1. **RESEND_ONBOARDING_API_KEY** - For welcome emails
   - Sender: `onboarding@opt-tracker.ashishdikonda.com`
   
2. **RESEND_API_KEY** - For daily reminders (used by CRON job)
   - Sender: `noreply@opt-tracker.ashishdikonda.com`

## Email Content

### Example: Program End Date Reminder

```html
Subject: OPT Application Window Opens in 60 Days

Your program end date is approaching!

Days until program end: 60 days
Program End Date: May 15, 2024

Remember: You can apply for OPT up to 90 days before your 
program end date and no later than 60 days after.

Visit OPT Hub to track your timeline.
```

### Example: OPT End Date Reminder

```html
Subject: Your OPT Ends in 30 Days

Your OPT EAD is expiring soon!

Days until OPT ends: 30 days
OPT EAD End Date: May 15, 2025

Make sure you have plans for your status after OPT expires. 
Consider STEM extension if eligible, H1-B, or other visa options.

Visit OPT Hub to track your timeline.
```

## Testing Locally

### 1. Set Up Environment

```bash
# In web/.env.local
RESEND_API_KEY=your-test-api-key
CRON_SECRET=test-secret-123
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Run the CRON Job Manually

```bash
curl http://localhost:3000/api/jobs/daily-digest \
  -H "Authorization: Bearer test-secret-123"
```

Or visit in browser (in development mode, authorization is bypassed):
```
http://localhost:3000/api/jobs/daily-digest
```

### 3. Expected Response

```json
{
  "message": "Daily digest completed",
  "emailsSent": 3,
  "errors": 0,
  "details": {
    "sent": [
      "program_end: user@example.com (60 days)",
      "opt_ead_end: user2@example.com (30 days)",
      "opt_start: user3@example.com (7 days)"
    ]
  }
}
```

## Deployment to Vercel

### 1. Set Environment Variables

Go to **Vercel Dashboard → Project → Settings → Environment Variables**

Add the following:
- `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard)
- `RESEND_API_KEY` (from Resend dashboard)
- `RESEND_ONBOARDING_API_KEY` (optional, for onboarding emails)
- `CRON_SECRET` (generate with `openssl rand -hex 32`)
- `NEXT_PUBLIC_SITE_URL` (your production domain)

### 2. Deploy

```bash
git push origin main
```

Vercel automatically detects `vercel.json` and sets up the CRON job.

### 3. Verify CRON Job

1. Go to **Vercel Dashboard → Project → Cron Jobs**
2. You should see `/api/jobs/daily-digest` listed
3. Check the schedule: `0 13 * * *` (daily at 1:00 PM UTC)
4. View execution logs to verify it's running

### 4. Monitor Execution

Check logs in **Vercel Dashboard → Deployments → Function Logs**

Look for:
- `Daily digest completed`
- `Email sent successfully`
- Any errors in processing

## Security

### Authorization

The CRON endpoint is protected by:

1. **Bearer Token**: Vercel sets `Authorization: Bearer <CRON_SECRET>` header
2. **Development Mode**: In dev, authorization is bypassed for testing
3. **Service Role Key**: Uses Supabase service role to bypass RLS

### Best Practices

- ✅ Never commit API keys to Git
- ✅ Use environment variables for all secrets
- ✅ Rotate CRON_SECRET periodically
- ✅ Monitor email sending quotas in Resend dashboard
- ✅ Set up error alerts in Vercel

## Troubleshooting

### CRON Job Not Running

**Check:**
1. `vercel.json` is in project root
2. CRON schedule syntax is correct
3. Endpoint is accessible (test manually)
4. Environment variables are set in Vercel

### Emails Not Sending

**Check:**
1. `RESEND_API_KEY` is set correctly
2. Sender email domain is verified in Resend
3. Check Resend dashboard for sending errors
4. Verify email addresses in Supabase are valid

### No Users Processed

**Check:**
1. `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Users exist in `opt_status` table
3. Dates are in correct format (`YYYY-MM-DD`)
4. Check Supabase logs for query errors

### Authorization Errors

**Check:**
1. `CRON_SECRET` matches in Vercel and code
2. Vercel is setting the `Authorization` header
3. Check function logs for auth failures

## Monitoring

### Key Metrics

- **Emails sent per day**: Track in response JSON
- **Errors per run**: Monitor error count
- **Execution time**: Check Vercel function duration
- **Email delivery rate**: Check Resend dashboard

### Alerts

Set up alerts for:
- Failed CRON executions
- High error rates (>10%)
- Email bounce rates
- API quota warnings

## Future Enhancements

- [ ] Add email preferences (opt-out)
- [ ] Support multiple timezones
- [ ] Weekly digest option
- [ ] Custom reminder thresholds per user
- [ ] Email templates with better styling
- [ ] SMS notifications via Twilio
- [ ] Slack/Discord integrations

---

**Last Updated:** October 2025  
**Maintainer:** OPT Hub Team

