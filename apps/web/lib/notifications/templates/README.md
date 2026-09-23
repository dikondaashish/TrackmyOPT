# Notification templates

Daily OPT reminder rendering is separated from delivery:

- [`daily-reminder-html.ts`](daily-reminder-html.ts): subject generation and
  the HTML wrapper.
- [`partials/tool-section.ts`](partials/tool-section.ts): tool-type dispatch.
- `partials/opt-apply.ts`, `opt-clock.ts`, `stem-apply.ts`, and `stem-clock.ts`:
  individual tool sections.

[`../email-service.ts`](../email-service.ts) owns reminder types and delivery
orchestration. [`../email-smtp.ts`](../email-smtp.ts) provides the shared SMTP
transport. Other email families live under [`../transactional/`](../transactional/),
with queueing in [`../transactional/queue.ts`](../transactional/queue.ts).
Shared branding and layout helpers live in `email-brand.ts` and `email-layout.ts`.

When extracting another template, keep rendering separate from delivery and
preserve its subject, body, suppression, and idempotency behavior. Verify rendered
HTML with representative fixture data; preview it without sending real email.
Outstanding delivery work belongs in the
[email roadmap](../../../../../docs/ops/EMAIL_ROADMAP.md).
