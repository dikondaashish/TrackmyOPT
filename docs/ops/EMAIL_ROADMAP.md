# Email roadmap — pending work only

The billing, onboarding, refund, contact, and trial email phases are shipped.
See [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md) for the current catalog.

## 1. Migrate legacy direct SMTP sends

These flows still bypass the durable `email_queue` pattern:

- Daily/tool reminders
- Enrollment mail
- Vault passcode OTP
- Export OTP
- Notification email change/security notices
- Admin bulk mail

- [ ] Move one flow at a time to the shared queue and SMTP transport.
- [ ] Preserve its subject/body and idempotency behavior.
- [ ] Record pending/sent/failed state and retry only retryable failures.
- [ ] Add a focused test before moving the next flow.

## 2. Extract remaining templates

`apps/web/lib/notifications/transactional-emails.ts` is about 2,564 lines.

- [ ] Extract one email family at a time into
  `lib/notifications/templates/`.
- [ ] Keep queueing, suppression, and delivery orchestration out of template
  modules.
- [ ] Render-test the resulting HTML.

The daily reminder is already extracted and is the pattern to follow.

## 3. Notification email verification

- [ ] Confirm the product still wants a separate notification email.
- [ ] If yes, add double opt-in before sending reminders to a new address.
- [ ] Queue verification mail with a short-lived signed token.
- [ ] Do not mark the address verified until the token is redeemed.

## 4. Signed tracking links

- [ ] Make `EMAIL_LINK_SIGNING_SECRET` required in production.
- [ ] Decide a transition window for unsigned legacy links.
- [ ] Test valid, expired/tampered, and legacy-link behavior.

## 5. External operations

- [ ] Configure/verify Supabase Auth email branding and production redirect
  URLs.
- [ ] Verify Stripe customer receipts.
- [ ] Verify SPF/DKIM for `@trackmyopt.com`.
- [ ] Add an asynchronous export-ready email only if exports become background
  jobs.

## 6. Marketing mail gate

No bulk marketing workflow should launch from the transactional mail system.

- [ ] Select a list provider before using the prepared marketing sequences.
- [ ] Implement unsubscribe, suppression, sender identity, and consent policy.
- [ ] Keep transactional and marketing preferences separate.

## Implementation rules

- Use `transactional-emails.ts` queue primitives and the shared
  `sendMailWithRetry` transport.
- Preserve `blocked_emails`, idempotency, and content-free error logging.
- For Stripe, return success only after primary entitlement processing
  succeeds; primary failures must remain retryable by Stripe.
- Never promise immigration or billing outcomes in email copy.
