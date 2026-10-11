# Email templates inventory

Complete reference for **subject lines**, **who receives** each mail, and **what it contains**. Implementation lives in `lib/notifications/email-service.ts`, `lib/notifications/transactional/`, `lib/notifications/email-brand.ts`, and the API routes listed below.

**Related:** [EMAIL_ROADMAP.md](./EMAIL_ROADMAP.md) ·
[legal/billing manual QA](../compliance/LEGAL_BILLING_COMPLIANCE_QA.md)

---

## Supabase authentication

The versioned source is `apps/web/lib/notifications/supabase-auth-templates.ts`.
Render it with the offline QA command below before updating Supabase Dashboard →
Authentication → Emails. Application deployment does not publish hosted auth templates.

| Templates | Behavior preserved |
|---|---|
| Confirm signup, reauthentication | `{{ .Token }}` code entry; signup and identity verification use separate instructions |
| Invitation, magic link, email change, password reset | `{{ .ConfirmationURL }}` button and copyable fallback link |
| Password/email/phone changed, sign-in method linked/removed, MFA added/removed | Existing Supabase variables and notification enablement settings |

Do not enable security notifications or change auth settings when publishing template
content. All 13 templates were published and their persisted source verified on
October 10, 2026; the seven security notifications remained disabled.
Do not put verification codes in subject lines. Avoid fixed expiry claims;
expiry is controlled by the hosted auth configuration.

## Complete offline QA

```sh
pnpm --filter web email-qa:render
python3 -m http.server 8766 --directory /tmp/trackmyopt-email-qa
```

Open `http://127.0.0.1:8766/after/matrix.html`, then **Run all layout checks**.
Rendering sends no email and does not query or mutate the database. The catalog
calls the same builders as production, including cancellation/checkout/activation
variants, consultation confirmations, support alerts, all four daily tools, all
seven enrollment tools, seven document types, case changes, weekly summaries,
saved deadlines, policy notices, admin drafts, and all 13 hosted auth templates.
The renderer also includes the archived September 2026 product update and long
name, address, and filename fixtures.

The October 10, 2026 audit rendered **84 fixtures** and checked **1,260 combinations**
at 320, 768, and 1366 pixels in light mode, forced dark CSS, Outlook dark selectors,
stripped style blocks, and blocked images. All checks passed without horizontal
overflow. Signup was also visually inspected at 375 pixels. These are browser
rendering and CSS fallback checks; they do not certify native Gmail, Apple Mail,
or Outlook inbox rendering or email deliverability.

Corrections include solid header colors when gradients are unavailable, narrower
mobile padding and code spacing, explicit dark-mode text colors, escaped user
content, consistent Free-plan resume limits in HTML and text, concise daily and
enrollment instructions, current-fee links instead of hard-coded filing fees,
and Eastern calendar-day document expiry handling. Weekly summaries and saved
case deadlines include an HTML alternative while preserving their plain text.

Admin bulk notices remain drafts. Replace every bracketed incident, ownership,
policy, and effective-date field with verified details before sending.

---

## Cron / scheduled jobs

| Subject | Recipient | Content summary | Code / `email_type` |
|---------|-----------|-----------------|----------------------|
| **Dynamic:** `TrackMyOPT: {n} day(s) left — action needed` (≤7d) · `TrackMyOPT: {n} days remaining` (≤14d) · `TrackMyOPT: {n} days left on your timeline` (≤30d) · `TrackMyOPT daily update — {n} days remaining` (>30d) | Premium users with at least one tool email | Daily OPT summary: active tools, deadlines, link to dashboard. Queue log subject: `Daily OPT Reminder - {n} active`. | `GET /api/cron/send-daily-reminders` · `daily_reminder` |
| `⏰ Document Expiring Soon: {document type}` | `notification_email` / profile | Document vault expiry warning | `GET /api/cron/send-document-reminders` |
| `Your STEM OPT extension window is now open — here's what to do` | Users whose OPT EAD hits the 90-day STEM filing window (see cron SQL) | DSO / E-Verify / I-765 / I-983 checklist; dashboard CTA | `GET /api/cron/stem-opt-window-alert` · `stem_opt_window_open` |

---

## Queued transactional mail (`email_queue` + SMTP)

Defined in `lib/notifications/transactional/` via `queueTransactionalEmailSend`.

| `email_type` | Subject | Content summary |
|--------------|---------|-----------------|
| `payment_failed` | `TrackMyOPT: Payment failed — update your card` | Card charge failed; update payment method / Stripe portal |
| `subscription_ended` | `TrackMyOPT: Your Premium subscription has ended` | Access ended; what’s locked; resubscribe CTA |
| `unused_cancel_winback` | Win-back copy for cancellation reason `unused` | Pro reminder sent only from the approved cancellation flow |
| `welcome_free` | `Welcome to TrackMyOPT — here’s how to get started` | Free-tier onboarding (e.g. signup / OAuth paths) |
| `welcome_free_resend` | Same welcome body | Controlled one-time welcome resend campaign |
| `checkout_recovery` | `Finish setting up your daily USCIS alerts` | Resume an open checkout or start a fresh annual Pro checkout |
| `free_receipt_reengagement` | `Try Pro: daily USCIS auto-checks + status-change emails` | One-off, flag-gated free-receipt campaign |
| `at_risk_reengagement` | `Your OPT tools are still here when you need them` | Owner-approved, flag-gated at-risk campaign |
| `d1_activation_nudge` | Dynamic first-day setup nudge | Free signup activation based on missing dashboard/case setup |
| `refund_processed` | `TrackMyOPT: Refund confirmation` | Refund amount; premium ended; processing timeline |
| `premium_welcome` | `Welcome to TrackMyOPT Premium! 🚀` | Post-checkout premium welcome |
| `trial_ending` | `TrackMyOPT: Your Premium trial is ending soon` | Stripe trial ending (webhook-driven) |
| `trial_started` | `TrackMyOPT: Your 7-day Pro trial has started` | Trial dates, renewal disclosure, and cancellation path |
| `subscription_cancel_confirmed` | `TrackMyOPT: Subscription cancellation confirmed` | Access-through date and resubscribe path |
| `subscription_receipt` | `TrackMyOPT: Subscription receipt` | Paid period/renewal receipt summary |
| `material_policy_change` | `TrackMyOPT: Important update to subscription terms` | Effective date and links for an approved material change |
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

| Subject | To | Purpose | Source |
|---------|-----|---------|--------|
| `New contact form submission from {name}` | `support@trackmyopt.com` | Staff alert with submission details | `sendInternalContactFormNotification` in `transactional/internal.ts` |

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
