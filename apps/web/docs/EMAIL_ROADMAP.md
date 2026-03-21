# Email roadmap & enterprise parity

This document tracks **what we send today**, **gaps vs. top-tier SaaS**, and a **phased plan** to close them. **Transactional billing/onboarding** helpers live in `lib/notifications/transactional-emails.ts` (queue + SMTP); legacy templates remain in `lib/notifications/email-service.ts` and `lib/notifications/email-smtp.ts` (shared transporter + `sendMailWithRetry`).

**Related:** [PAYMENT_FLOW_AUDIT.md](./PAYMENT_FLOW_AUDIT.md) (Stripe checkout & webhooks).

---

## 1. Current inventory (quick reference)

| Category | Mechanism | Location |
|----------|-----------|----------|
| Password reset, signup/magic OTP | **Supabase Auth** | Supabase Dashboard → Auth → SMTP / templates |
| Daily OPT / tool reminders | Nodemailer (`sendDailyReminder`) | `GET /api/cron/send-daily-reminders` |
| Document vault reminders | Nodemailer | `GET /api/cron/send-document-reminders` |
| USCIS status change | Nodemailer | `POST /api/case-status/notify` (from web + `apps/api` worker) |
| ZIP export OTP | `sendExportOtpEmail` | `POST /api/user/send-export-otp` |
| Vault passcode OTP | Nodemailer (local transporter) | `POST /api/documents/passcode/send-otp` |
| Tool / notification enrollment | `sendEnrollmentEmail` | `tool-email`, `notification-email`, `case-status` (premium rules per route) |
| Premium welcome | **`sendPremiumWelcomeQueuedEmail`** via `sendPremiumWelcomeEmail` wrapper | `applyStripeCheckoutSession` — `email_type: premium_welcome`, deduped once per user |
| Premium email prefs change | `sendEmailChangeNotification` | `POST /api/email/preferences` |
| Admin broadcast | Nodemailer | `POST /api/admin/bulk-notification` |
| Billing / onboarding / contact (queued) | `transactional-emails.ts` → `email_queue` + SMTP | See §4 |

**Transport:** App-owned mail uses **Nodemailer + `SMTP_*`** (see `.env` / Hostinger-style SMTP). **Resend** is not used in application code.

**Removed:** `sendVerificationEmail` export — no double opt-in flow; re-add with `email_type: email_verified` + queue when notification-email verification ships.

---

## 2. Remaining gaps (optional / not in app code)

### 2.1 Product & ops (not implemented in code)

| Item | Note |
|------|------|
| Marketing opt-out / bulk non-transactional | Policy + list provider when/if you add marketing |
| Async export “ready” | If exports become background jobs, add queued email with link + expiry |
| **Stripe Dashboard** | Customer receipts, SPF/DKIM for `@trackmyopt.com` — configure in Stripe + DNS |

### 2.2 Legacy sends not yet on `email_queue`

Cron reminders, enrollment, vault OTP, export OTP, `sendEmailChangeNotification`, admin bulk — still **direct SMTP** (historical). Migrating them is a separate refactor.

### 2.3 Account & security (unchanged)

| Event | Note |
|-------|------|
| Login / password / email change | Supabase templates where applicable |
| Notification email double opt-in | Not implemented |

---

## 3. Phased plan (status)

| Phase | Item | Status |
|-------|------|--------|
| A | Payment failed, subscription ended, idempotency, webhook 200 | **Shipped** |
| B | Free welcome, remove dead `sendVerificationEmail` | **Shipped** |
| C | Refund ack, contact auto-reply | **Shipped** |
| + | Async checkout failure email, PI dunning, trial ending, premium welcome via queue | **Shipped** |

---

## 4. Stripe webhook → email mapping (reference)

**File:** `app/api/premium/webhook/route.ts`

| Event | Behavior |
|-------|----------|
| `checkout.session.completed` | `applyStripeCheckoutSession` + premium welcome (`premium_welcome` queue) |
| `checkout.session.async_payment_succeeded` | Same as completed |
| `checkout.session.async_payment_failed` | `logPaymentFailure` + **`sendPaymentFailedEmail`** (`payment_failed`) |
| `payment_intent.succeeded` | Transaction update |
| `payment_intent.payment_failed` | Transaction `failed` + **dunning** via **`sendPaymentFailedEmail`** when invoice / checkout / `supabase_user_id` metadata exists |
| `invoice.payment_failed` | **`sendPaymentFailedEmail`** |
| `charge.refunded` | Revoke premium + **`sendRefundAcknowledgmentEmail`** (`refund_processed`) |
| `customer.subscription.updated` | Sync access; **`past_due` / `unpaid`** → **`sendPaymentFailedEmail`** |
| `customer.subscription.deleted` | `revokePremiumAccess` + **`sendSubscriptionEndedEmail`** (`subscription_ended`) |
| `customer.subscription.trial_will_end` | **`sendTrialEndingEmail`** (`trial_ending`) |

**Stripe Dashboard:** Webhook endpoint should subscribe to all events above that you use (including `invoice.payment_failed`, `customer.subscription.trial_will_end`).

---

## 5. Supabase Auth (dashboard checklist)

Configure in **Supabase → Authentication → Email templates**:

- Confirm signup / magic link  
- Reset password  
- (Optional) Change email address  

Align **subject** and **HTML** with TrackMyOPT branding; point **redirect URLs** to production `NEXT_PUBLIC_SITE_URL`.

---

## 6. Code conventions (for implementers)

- Prefer **new** transactional mail in `lib/notifications/transactional-emails.ts` (queue + `blocked_emails` + idempotency).  
- Reuse **`sendMailWithRetry`** from `email-smtp.ts` — do not add a second transporter.  
- Webhooks: **log** errors, return **200** to Stripe; update `email_queue` to `failed` when SMTP fails.  
- **Legal:** immigration product — avoid promising outcomes in billing emails; keep factual.

---

## 7. Changelog

| Date | Action |
|------|--------|
| 2026-02-19 | Initial roadmap created from product email audit |
| 2026-02-19 | **Shipped Phase A:** `invoice.payment_failed` + `customer.subscription.updated` (`past_due` / `unpaid`) → `sendPaymentFailedEmail` (`payment_failed`); idempotency via `email_data.stripe_event_id` + 24h invoice dedupe; `customer.subscription.deleted` → `sendSubscriptionEndedEmail` (`subscription_ended`) after `revokePremiumAccess`; webhook always returns **200**; shared SMTP in `email-smtp.ts`. |
| 2026-02-19 | **Shipped Phase B:** `sendFreeWelcomeEmail` (`welcome_free`) from `POST /api/manual/signup` and first OAuth profile insert in `GET /api/me`; removed unwired `sendVerificationEmail` (comment in `email-service.ts`). |
| 2026-02-19 | **Shipped Phase C:** `charge.refunded` → `sendRefundAcknowledgmentEmail` (`refund_processed`); `POST /api/contact` + `SmartContactForm` → `sendContactReceivedEmail` (`contact_received`) when session or `profiles.email` resolves a `user_id`. |
| 2026-02-19 | **Shipped (gap closure):** `checkout.session.async_payment_failed` → `sendPaymentFailedEmail`; `payment_intent.payment_failed` → dunning when subscription/checkout context exists; `customer.subscription.trial_will_end` → `sendTrialEndingEmail` (`trial_ending`); **`sendPremiumWelcomeQueuedEmail`** (`premium_welcome`) with `sendPremiumWelcomeEmail` delegating from `email-service.ts`. |

---

*Owner: web platform / growth. Update this file when new email types ship.*
