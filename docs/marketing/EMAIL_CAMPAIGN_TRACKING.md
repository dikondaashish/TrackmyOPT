# Product email tracking

The SMTP bulk sender can now record campaign opens and separate CTA clicks. It does not send or schedule a campaign by itself. Existing emails without campaign metadata continue through the original flow; this cannot recover their historical opens or clicks.

## Viewing results

Sign in and open `/admin/email-campaigns` on TrackMyOPT. Enter the campaign ID and the existing `ADMIN_SECRET`. The secret stays in the page's memory and is sent in the Authorization header; it is never placed in a URL or local storage. The report API also requires that secret and returns aggregate counts, without email addresses or user IDs.

For the September 29 draft, use **`product_update_2026_09_29`**. The report becomes available after the sender registers this campaign; before that it reports that no campaign exists.

| Metric | Meaning |
| --- | --- |
| SMTP accepted | The mail server accepted the recipient. This does not confirm delivery to the inbox. |
| Observed opens | Unique recipient messages whose tracking image was requested, excluding detected automation. Privacy proxies can inflate this, and blocked images or plain-text reading can hide opens. |
| $0.99 offer clickers | Unique recipient messages that requested the `pro_intro` link. This measures interest in the offer, not checkout completion. |
| Free link clickers | Unique recipient messages that requested `free_dashboard`. |
| Any tracked link | Unique recipient messages clicking at least one configured link. A person clicking both offers appears once here and once in each offer count. |
| Detected automated events | Distinct message/event/link combinations flagged by known scanner user agents or prefetch headers. Repeated requests are deduplicated. Unknown scanners can still affect the main counts. |
| Send outcomes needing review | Reserved messages with incomplete or ambiguous SMTP outcomes. Do not blindly resend them. |

Counts identify the original recipient message, not necessarily the individual reader. Forwarded messages retain the original links. An observed event can also come from an ambiguous SMTP send, so event counts and SMTP acceptance counts measure different things. This is approximate engagement measurement, not proof that a human read the email or bought a plan.

## Configuration and sending integration

Apply `supabase/migrations/20260929170000_email_campaign_tracking.sql` before using tracking. The new tables have RLS enabled and deny anonymous/authenticated client access; only the server service-role client can write events or read the reporting functions.

Tracking uses `EMAIL_LINK_SIGNING_SECRET`, falling back to the existing `ADMIN_SECRET`. Set a dedicated long random signing secret through the hosting environment if desired. Do not rotate the active signing secret while campaign links should keep working. Tokens expire after 90 days; expired clicks fall back to the TrackMyOPT homepage.

Use the existing authenticated `POST /api/admin/bulk-notification` flow with `type: "service_announcement"`, `subject`, rendered `htmlContent`, `plainTextContent`, and an additional **`campaign`** object. For this draft, that object's complete value is [updates/2026-09-28/tracking.json](updates/2026-09-28/tracking.json). The destinations must match URLs in both bodies exactly; HTML-escaped `&amp;` attributes are decoded during instrumentation. Keep each tracked destination distinct with `utm_content`.

Before sending:

1. Deploy the routes and verify a report request is protected. Check that the pixel and redirects are reachable on the production domain.
2. Finish the draft's HTTPS asset location, recipient-specific unsubscribe URL and verified postal address. The sender rejects the draft's unresolved placeholders. Remove the Subject/Preheader metadata lines from the plain-text MIME body. An unsubscribe merge field from a third-party campaign platform will not be resolved by this SMTP endpoint; use a working URL with this endpoint's supported recipient placeholders or use that provider's campaign sender instead.
3. Confirm the rendered subject, both offer links, eligibility and renewal terms. Keep unsubscribe and privacy links direct. Keep the email's brief tracking disclosure.
4. Use a distinct test campaign ID and an explicitly scoped test recipient flow for an approved mailbox test. **This endpoint targets the full eligible audience; do not invoke it for a single-mailbox test.** No test or live emails were sent during implementation.
5. Submit the reviewed campaign through the authorized sending flow. Read the response's `sent`, `failed`, `duplicate`, `suppressed`, `skippedOptOut`, and `needsReview` counts. Retrying unchanged content with the same ID skips recipients whose send was already reserved. Changed content requires a new campaign ID.

The sender pages through profiles and marketing opt-outs beyond Supabase's default 1,000 rows. It checks marketing preferences and existing blocked-email suppressions before tracked sends. A durable unique reservation per campaign and normalized email address occurs before SMTP. Ambiguous results are stored separately from the normal pending queue so cron retries cannot duplicate the campaign.

Each message gets one tiny open image and signed redirect URLs for the configured CTAs. No recipient email, destination URL, admin secret, IP address or raw user agent is embedded in the tracking token or saved in the event table. The existing email queue still holds its normal recipient record. Known automation is stored separately; the browser still reaches a valid CTA if event recording fails. HEAD requests do not count.

If using a different campaign sender instead of the SMTP endpoint, use that provider's native campaign tracking. Merely copying `email.html` into another platform does not activate these endpoints.

## Validation

Unit tests cover signatures/expiry, destination checks, real-template instrumentation, authenticated reporting, scanner flags, duplicate reservations, preference/suppression failures and ambiguous SMTP outcomes. Run `supabase/tests/email_campaign_tracking.sql` against the migrated database for a verification with fictional recipients inside a rolled-back transaction. It checks unique counts, repeat events, separate CTA counts and private privileges; it does not send mail or write applicant records.

September 29 implementation verification: the migration was applied to the TrackMyOPT database and the rolled-back test passed under `service_role`. All 31 targeted tests, TypeScript, lint and the production build passed; React Doctor reported 100/100. The broader suite passed 1,610 tests with one existing `screening-review-widget-ui.test.ts` failure that also reproduces on an isolated `origin/main` baseline. No campaign was registered or sent. The security advisor's informational “RLS enabled, no policy” findings on these two private tables are intentional: client privileges are revoked and only the server role accesses them, consistent with [Supabase's RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).
