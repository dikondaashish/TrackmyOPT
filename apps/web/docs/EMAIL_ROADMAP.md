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
| Premium welcome | `sendPremiumWelcomeEmail` | `applyStripeCheckoutSession` (webhook + confirm-checkout) |
| Premium email prefs change | `sendEmailChangeNotification` | `POST /api/email/preferences` |
| Admin broadcast | Nodemailer | `POST /api/admin/bulk-notification` |
| Payment failed, subscription ended, refund ack, free welcome, contact auto-reply | `transactional-emails.ts` → `email_queue` + SMTP | Stripe webhook, `POST /api/manual/signup`, `GET /api/me` (OAuth profile create), `POST /api/contact` |

**Transport:** App-owned mail uses **Nodemailer + `SMTP_*`** (see `.env` / Hostinger-style SMTP). **Resend** is not used in application code.

**Removed:** `sendVerificationEmail` export — no double opt-in flow; re-add with `email_type: email_verified` + queue when notification-email verification ships.

---

## 2. Gaps vs. enterprise / “top company” bar

### 2.1 Billing & subscription (highest impact)

Stripe can send **receipts/invoices** if enabled in Stripe Dashboard — users still expect **in-app branded** mail for **access-changing** events.

| User-visible event | Stripe event(s) (already or to add) | Today | Target |
|--------------------|----------------------------------------|-------|--------|
| Payment failed (card declined, etc.) | `invoice.payment_failed`, `customer.subscription.updated` (past_due) | DB / logs only | Email: fix payment + what happens to Premium |
| Subscription canceled / access revoked | `customer.subscription.deleted`, `…updated` (canceled/unpaid) | `revokePremiumAccess` — **no email** | Email: end date, what you lose, resubscribe link |
| Trial ending (if product uses trial) | `customer.subscription.trial_will_end` | — | Optional email 3 days before |
| Refund processed | `charge.refunded` (handler exists) | Premium revoked | Optional: short “refund processed” mail |

**Webhook file:** `app/api/premium/webhook/route.ts` — extend `switch (event.type)` and call new `email-service` helpers (idempotent: use Stripe event `id` or idempotency key in DB if needed).

### 2.2 Account & security

| Event | Typical practice | Today |
|-------|------------------|--------|
| Login / primary email changed | Confirmation from auth provider | Supabase (if configured) |
| Password changed | “If this wasn’t you, contact support” | Usually Supabase template |
| Free user welcome | Single onboarding email | Only **premium** welcome today |
| Notification email verified | Double opt-in | Not implemented — add when product requires verified secondary email |

### 2.3 Product & trust

| Event | Note |
|-------|------|
| Contact form submission | If `/contact` does not email the user a “We received your message”, add it |
| Marketing opt-out | If you send non-transactional mail, confirm unsubscribe (transactional can stay always-on with legal text) |
| Async export “ready” | If export becomes async job, email link + expiry |

---

## 3. Phased implementation plan

### Phase A — Billing trust (P0)

1. **`sendPaymentFailedEmail`** (or one template with variables)  
   - Trigger: `invoice.payment_failed` **or** subscription status `past_due` / `unpaid` from `customer.subscription.updated`.  
   - Content: amount, retry behavior, link to `dashboard/settings?tab=subscription` or Stripe Customer Portal (`/api/premium/portal`).

2. **`sendSubscriptionEndedEmail`**  
   - Trigger: `customer.subscription.deleted` **after** `revokePremiumAccess` (or same handler).  
   - Content: Premium ended, what remains on Free, CTA to resubscribe.

3. **Idempotency**  
   - Store `stripe_event_id` processed for emails (new table or reuse `payment_transactions` metadata) to avoid duplicate sends on webhook retries.

### Phase B — Account & onboarding (P1)

4. **Free welcome** — one email on first successful signup (Supabase trigger or `manual/signup` / client post-login once).  
5. ~~**Wire `sendVerificationEmail`**~~ **Done (removed dead export)** — add back with queue + `email_verified` when double opt-in is scoped.

### Phase C — Polish (P2)

6. Optional **`sendRefundAcknowledgmentEmail`** from `charge.refunded` handler.  
7. Contact form auto-reply (if applicable).  
8. **Stripe Dashboard:** ensure **customer receipt email** is on; align **From** domain with SPF/DKIM for `@trackmyopt.com`.

---

## 4. Stripe webhook → email mapping (reference)

Events **already handled** in `app/api/premium/webhook/route.ts`:

| Event | Current behavior | Suggested email (Phase A) |
|-------|------------------|----------------------------|
| `checkout.session.completed` | `applyStripeCheckoutSession` + welcome | Keep (welcome) |
| `checkout.session.async_payment_succeeded` | Same | Keep |
| `checkout.session.async_payment_failed` | `logPaymentFailure` | Add user-facing failure email |
| `payment_intent.succeeded` | Transaction update | Usually no extra (Stripe receipt) |
| `payment_intent.payment_failed` | Transaction `failed` | Add **dunning** email if linked to subscription invoice |
| `charge.refunded` | Revoke premium + DB | Optional acknowledgment email |
| `customer.subscription.updated` | Active / revoke premium | Email on transition to **past_due** / **canceled** |
| `customer.subscription.deleted` | Revoke premium | **Subscription ended** email |

**To add in Stripe Dashboard** (listen + implement handler):

- `invoice.payment_failed` — best signal for **“payment failed, update card”** for subscriptions.

---

## 5. Supabase Auth (dashboard checklist)

Configure in **Supabase → Authentication → Email templates**:

- Confirm signup / magic link  
- Reset password  
- (Optional) Change email address  

Align **subject** and **HTML** with TrackMyOPT branding; point **redirect URLs** to production `NEXT_PUBLIC_SITE_URL`.

---

## 6. Code conventions (for implementers)

- Add new templates next to existing helpers in `lib/notifications/email-service.ts`.  
- Reuse `sendMailWithRetry` / same SMTP transporter.  
- Log failures; never throw in webhook without returning 200 after queueing (or retry-safe pattern).  
- Include **support@** / help link and **physical address** if required by CAN-SPAM for marketing; transactional notices are narrower.  
- **Legal:** immigration product — avoid promising outcomes in billing emails; keep factual.

---

## 7. Changelog

| Date | Action |
|------|--------|
| 2026-02-19 | Initial roadmap created from product email audit |
| 2026-02-19 | **Shipped Phase A:** `invoice.payment_failed` + `customer.subscription.updated` (`past_due` / `unpaid`) → `sendPaymentFailedEmail` (`email_type: payment_failed`); idempotency via `email_data.stripe_event_id` + 24h invoice dedupe; `customer.subscription.deleted` → `sendSubscriptionEndedEmail` (`subscription_ended`) after `revokePremiumAccess`; webhook always returns **200**; shared SMTP in `email-smtp.ts`. |
| 2026-02-19 | **Shipped Phase B:** `sendFreeWelcomeEmail` (`welcome_free`) from `POST /api/manual/signup` and first OAuth profile insert in `GET /api/me`; removed unwired `sendVerificationEmail` (comment in `email-service.ts`). |
| 2026-02-19 | **Shipped Phase C:** `charge.refunded` → `sendRefundAcknowledgmentEmail` (`refund_processed`); `POST /api/contact` + `SmartContactForm` → `sendContactReceivedEmail` (`contact_received`) when session or `profiles.email` resolves a `user_id`. |

---

*Owner: web platform / growth. Update this file when new email types ship.*
