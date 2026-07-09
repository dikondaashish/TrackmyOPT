# Email templates inventory

Complete reference for **subject lines**, **who receives** each mail, and **what it contains**. Implementation lives in `lib/notifications/email-service.ts`, `lib/notifications/transactional-emails.ts`, `lib/notifications/email-brand.ts`, and the API routes listed below.

**Related:** [EMAIL_ROADMAP.md](./EMAIL_ROADMAP.md) · [PAYMENT_FLOW_AUDIT.md](./PAYMENT_FLOW_AUDIT.md)

---

## Supabase Auth (not in application code)

Configured in **Supabase Dashboard → Authentication → Email templates**.

| Flow | Notes |
|------|--------|
| Sign up / email confirmation | Template in Supabase |
| Password reset | Template in Supabase |
| Magic link | Template in Supabase |

Subjects and HTML are **not** defined in this repo.

---

## Cron / scheduled jobs

| Subject | Recipient | Content summary | Code / `email_type` |
|---------|-----------|-----------------|----------------------|
| **Dynamic:** `TrackMyOPT: {n} day(s) left — action needed` (≤7d) · `TrackMyOPT: {n} days remaining` (≤14d) · `TrackMyOPT: {n} days left on your timeline` (≤30d) · `TrackMyOPT daily update — {n} days remaining` (>30d) | Premium users with at least one tool email | Daily OPT summary: active tools, deadlines, link to dashboard. Queue log subject: `Daily OPT Reminder - {n} active`. | `GET /api/cron/send-daily-reminders` · `daily_reminder` |
| `⏰ Document Expiring Soon: {document type}` | `notification_email` / profile | Document vault expiry warning | `GET /api/cron/send-document-reminders` |
| `Your STEM OPT extension window is now open — here's what to do` | Users whose OPT EAD hits the 90-day STEM filing window (see cron SQL) | DSO / E-Verify / I-765 / I-983 checklist; dashboard CTA | `GET /api/cron/stem-opt-window-alert` · `stem_opt_window_open` |

---

## Queued transactional mail (`email_queue` + SMTP)

Defined in `lib/notifications/transactional-emails.ts` via `queueTransactionalEmailSend`.

| `email_type` | Subject | Content summary |
|--------------|---------|-----------------|
| `payment_failed` | `TrackMyOPT: Payment failed — update your card` | Card charge failed; update payment method / Stripe portal |
| `subscription_ended` | `TrackMyOPT: Your Premium subscription has ended` | Access ended; what’s locked; resubscribe CTA |
| `welcome_free` | `Welcome to TrackMyOPT — here’s how to get started` | Free-tier onboarding (e.g. signup / OAuth paths) |
| `refund_processed` | `TrackMyOPT: Refund confirmation` | Refund amount; premium ended; processing timeline |
| `premium_welcome` | `Welcome to TrackMyOPT Premium! 🚀` | Post-checkout premium welcome |
| `trial_ending` | `TrackMyOPT: Your Premium trial is ending soon` | Stripe trial ending (webhook-driven) |
| `contact_received` | `We received your message — TrackMyOPT Support` | Contact form auto-reply |
| `stem_opt_window_open` | `Your STEM OPT extension window is now open — here's what to do` | Same STEM alert as cron (when sent via `sendStemOptWindowEmail`) |

---

## Direct SMTP (`email-service.ts` + `sendMailWithRetry`)

| Function / flow | Subject | Content summary |
|-----------------|---------|-----------------|
| `sendDailyReminder` | Same **dynamic** subjects as daily cron above | HTML daily reminder (tool sections) |
| `sendExportOtpEmail` | `Your TrackMyOPT data export verification code` | Monospace OTP; short expiry notice |
| `sendEnrollmentEmail` | `Welcome to {title} — TrackMyOPT` — see **Enrollment titles** below | Branded enrollment: timeline/tips per tool; dashboard CTA |
| `sendNotificationPreferencesSavedEmail` | `Your TrackMyOPT notification email is saved` | Confirms shared notification address (Settings, first save) |
| `sendEmailChangeNotification` | `Your email address was updated` | Security notice for email preference change |

### Enrollment email — `{title}` values

Subject: **`Welcome to {title} — TrackMyOPT`**.

| `title` | Typical source |
|---------|----------------|
| OPT Apply Dates | Tool email `opt_apply` (premium), `tool-email` API |
| OPT Unemployment Clock | `opt_clock` |
| STEM OPT Extension | `stem_apply` |
| STEM Unemployment Clock | `stem_clock` |
| Document Expiry Reminders | Notification email save from Document Vault (`toolType: documents`) |
| Case Status Tracker | Case status enrollment (`case-status`) |
| OPT Daily Reminders | Fallback `default` in `getToolEnrollmentContent` |

---

## Other API routes (nodemailer instances)

| Subject | Recipient | Content summary | Route |
|---------|-----------|-----------------|-------|
| `🔔 Your USCIS Case Status Has Changed - {receipt_number}` | User notification email | Status change alert | `POST /api/case-status/notify` · `case_status_change` |
| `🔐 Your OTP for Passcode Change - TrackMyOPT` | User email | Vault passcode change OTP | `POST /api/documents/passcode/send-otp` |

---

## Admin bulk notification

`POST /api/admin/bulk-notification` — subjects are fixed presets:

| Subject |
|---------|
| `Important: TrackMyOPT Privacy Policy Update` |
| `Important Notice: TrackMyOPT Ownership Change` |
| `🚨 Security Notice: TrackMyOPT Data Incident` |

---

## Internal (operations — not end-user product email)

| Subject | To | Purpose |
|---------|-----|---------|
| `New contact form submission from {name}` | `support@trackmyopt.com` | Staff alert with submission details | `sendInternalContactFormNotification` in `transactional-emails.ts` |

---

## Triggers quick map

| User action | Likely email(s) |
|-------------|------------------|
| Save notification email (Settings, first time) | `Your TrackMyOPT notification email is saved` |
| Save tool email (premium, new/changed) | `Welcome to {tool title} — TrackMyOPT` |
| Save vault email with documents tool | `Welcome to Document Expiry Reminders — TrackMyOPT` |
| Case status enrollment | `Welcome to Case Status Tracker — TrackMyOPT` |
| Premium checkout success | `Welcome to TrackMyOPT Premium! 🚀` |
| Stripe payment failure / subscription end / refund / trial | Rows in **Queued transactional** table above |
| Contact form | `We received your message — TrackMyOPT Support` (+ internal to support) |
| Data export | `Your TrackMyOPT data export verification code` |
| Daily (cron) | Dynamic **TrackMyOPT:** subject daily reminder |

---

*Last updated to match app code in-repo; Supabase Auth templates are maintained separately.*
