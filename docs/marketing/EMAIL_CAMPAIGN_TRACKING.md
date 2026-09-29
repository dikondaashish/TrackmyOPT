# Product email tracking

The SMTP bulk sender can now record campaign opens and separate CTA clicks. It does not send or schedule a campaign by itself. Existing emails without campaign metadata continue through the original flow; this cannot recover their historical opens or clicks.

## Viewing results

Open `/admin/login` and sign in with an approved account's TrackMyOPT email and password. Access is granted only by the server-assigned `app_metadata.email_campaign_admin` permission on a verified, non-anonymous Supabase account. Both the dashboard and report API validate the current user on the server; ordinary signed-in users cannot read reports. Passwords are used only for sign-in and are not saved by the dashboard. Reporting no longer requires entering `ADMIN_SECRET`.

The dashboard lists registered campaigns, loads the newest campaign initially, and shows separate Pro and Free click counts. Use **Refresh results** to fetch the latest aggregate counts. Failed refreshes clear the previous report; an expired session returns to admin sign-in. Reports contain no recipient email addresses or user IDs. Sign out ends this browser's session.

For the September 29 draft, the campaign ID is **`product_update_2026_09_29`**. It appears after the sender registers this campaign. Before any tracked campaign is registered, the dashboard shows an empty state rather than fabricated metrics.

### Granting admin access

Run the trusted operator script with server Supabase environment variables loaded. For an existing account:

```sh
pnpm --filter web exec tsx scripts/email-campaign-admin.ts --email owner@example.com
```

For an email that does not yet have an account, supply an absolute output path outside this Git repository:

```sh
pnpm --filter web exec tsx scripts/email-campaign-admin.ts --email owner@example.com --setup-file /private/operator/email-admin-setup.txt
```

The script checks account suppression, grants only the selected account, and verifies the grant. It preserves existing app metadata. The new-account option generates an invitation without sending email and saves one-time password setup instructions in a private file with mode `0600`; never commit, share publicly, or paste its token into logs. The setup route verifies the invitation, establishes a session, and opens the existing password creation form. The account must complete verification before it can read reports. If the link expires, use normal account recovery. For an existing account, use its current password or the existing password recovery flow.

To revoke access, remove or set `email_campaign_admin` to `false` in the account's **app metadata** through a trusted server-side Supabase admin operation. Do not place this permission in editable user metadata. Subsequent dashboard and API requests recheck the current grant.

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

Apply `supabase/migrations/20260929155655_email_campaign_tracking.sql` before using tracking. Its version matches the migration already applied to the TrackMyOPT database. The new tables have RLS enabled and deny anonymous/authenticated client access; only the server service-role client can write events or read the reporting functions.

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

Unit tests cover signatures/expiry, destination checks, real-template instrumentation, authenticated reporting, scanner flags, duplicate reservations, preference/suppression failures and ambiguous SMTP outcomes. Admin tests also check trusted grants versus editable metadata, ordinary-user denial, sign-in rate limits and request origins, password clearing, local sign-out, invitation verification, campaign pagination, expired sessions and refresh races. Run `supabase/tests/email_campaign_tracking.sql` against the migrated database for a verification with fictional recipients inside a rolled-back transaction. It checks unique counts, repeat events, separate CTA counts and private privileges; it does not send mail or write applicant records.

September 29 implementation verification: the migration was applied to the TrackMyOPT database and the rolled-back test passed under `service_role`. All 31 targeted tests, TypeScript, lint and the production build passed; React Doctor reported 100/100. The broader suite passed 1,610 tests with one existing `screening-review-widget-ui.test.ts` failure that also reproduces on an isolated `origin/main` baseline. No campaign was registered or sent. The security advisor's informational “RLS enabled, no policy” findings on these two private tables are intentional: client privileges are revoked and only the server role accesses them, consistent with [Supabase's RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

Password-based admin update verification: all 59 focused tests, TypeScript, scoped lint and the production build passed; React Doctor reported 100/100. Full web lint had no errors and 240 existing warnings. The broader suite passed 1,637 tests with the same existing review-widget failure and one sensitive-autofill timeout; all sensitive-autofill tests passed on an isolated rerun. The rolled-back database check passed again, leaving no synthetic campaign records. No campaign was registered or sent by this update.
