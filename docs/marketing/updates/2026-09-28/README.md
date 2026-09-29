# September 29 product update

**Status: send preparation implemented; physical mailing address, reviewed recipients, marketing SMTP configuration, and mailbox test are still required. No email sent or scheduled.**

## Personal re-engagement revision

- Subject: **We’ve been busy 👋 Try Pro for $0.99**
- Preheader: A quick note from Karthik: what you can do with your account, plus 7 days of Pro for $0.99 if eligible.
- Proposed sender display name: **Karthik from TrackMyOPT**, using the verified `support@trackmyopt.com` mailbox. The tracked SMTP campaign uses this From display and `support@trackmyopt.com` as Reply-To. The global transactional SMTP configuration is unchanged. The campaign provider must verify this sender.
- Intended audience: registered Free users who have not started using their account, are eligible for the introductory offer, and receive product emails. Do not send an upgrade invitation to current paid subscribers.
- No inactivity rule or recipient list has been selected. Tracked campaigns now require an explicit list of 1–100 account UUIDs per request and default to a read-only preflight. The endpoint enforces this scope, marketing opt-outs and blocked addresses; it does not decide inactivity, consent or offer eligibility for you.
- The draft uses a first-name greeting, with the existing sender's `there` fallback. It does not claim to know why someone has not used the product, invent personal history, or promise that Karthik personally reads every reply.
- Recent improvements are introduced separately from the overview of existing tools. The overview covers Chrome prefill and writing drafts, resumes/ATS, jobs/sponsors/tracking, OPT/STEM, cases/reminders, networking, Document Vault, and insurance/tax/partner resources.
- Pro is a paid $0.99 introduction for 7 days for eligible accounts. Automatic renewal, plan choice, cancellation timing, and once-per-account eligibility remain adjacent to the button. Dedicated-only services are not presented as Pro benefits.

## Files

| File | Purpose |
| --- | --- |
| [email.html](email.html) | Send-source HTML; main editable template |
| [email.txt](email.txt) | Matching plain text; subject and preheader are the first two lines |
| [preview.html](preview.html) | Review page with desktop/mobile controls |
| [preview-email.html](preview-email.html) | Generated preview with local assets and the fallback greeting |
| [build_preview.py](build_preview.py) | Rebuilds previews; never sends mail |
| [assets/next-steps.gif](assets/next-steps.gif) | Existing brief, one-pass illustration, after the personal opening |
| [assets/next-steps.png](assets/next-steps.png) | Static fallback for reduced motion |
| [assets/logo.png](assets/logo.png) | Existing product logo |
| [github-review.md](github-review.md) | Product evidence and historical commit inventory |
| [tracking.json](tracking.json) | Separate Pro and Free CTA destinations for campaign tracking |

The earlier hero background files are retained but are no longer used in this email. The draft uses one animation; it opens with the personal note rather than a large promotional hero.

## Preview and editing

From the repository root:

```sh
python3 docs/marketing/updates/2026-09-28/build_preview.py --preview-only
python3 -m http.server 4398 --bind 127.0.0.1 --directory docs/marketing/updates/2026-09-28
```

Open [the review page](http://127.0.0.1:4398/preview.html). Edit `email.html` and `email.txt`, then rebuild. Subject and preheader are read from `email.txt`, so the preview stays in sync. Preview greeting uses “there”; the send-source versions retain `{{firstName}}`.

Python 3 and Pillow are required. `--preview-only` reuses existing images. Without it, the generator rebuilds the original illustrations using macOS Trebuchet MS fonts; `CAMPAIGN_FONT_DIR` can point to equivalent font files on another system. Recipients do not need these fonts.

## Preparing the SMTP handoff

The logo, GIF and reduced-motion PNG are included in `apps/web/public/email/product-update-2026-09-29/`. The send-source HTML uses `https://www.trackmyopt.com/email/product-update-2026-09-29/` directly. The local preview still uses its existing local image copies. Verify that all three production images return HTTP 200 after deployment.

Use a marketing-capable provider. **ZeptoMail does not allow promotional campaigns or product announcements**, and Zoho Mail directs bulk marketing to Zoho Campaigns. See [ZeptoMail policy](https://www.zoho.com/zeptomail/help/sending-bulk-emails.html) and [Zoho Mail policy](https://www.zoho.com/mail/help/usage-policy.html). The campaign SMTP path uses dedicated `CAMPAIGN_SMTP_HOST`, `CAMPAIGN_SMTP_PORT` (465 or 587), `CAMPAIGN_SMTP_USER`, and `CAMPAIGN_SMTP_PASS`; it does not reuse the transactional credentials. Verify `support@trackmyopt.com` and domain authentication with the selected provider.

1. Prepare a reviewed list of registered Free accounts who have not started using the platform, are eligible for the introductory offer, and may receive product email. Exclude paid users and prior intro users. `first_dashboard_viewed_at` is one activation signal, not a complete inactivity measure. No audience is automatically selected. Store a JSON array of account UUIDs outside this repository; at most 100 per request.
2. Put the exact physical business mailing address in a text file outside the repository. `support@trackmyopt.com` is the contact email, not a postal address. A valid business address or registered PO Box is required in the footer; see the [FTC guidance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).
3. Run the offline preparation command below. It fills and escapes the address, strips Subject/Preheader metadata from the plain-text body, and writes a new private file with mode `0600`. It never sends mail, queries recipients or registers a campaign. It refuses to overwrite existing files or write recipient payloads inside the current repository.

```sh
pnpm --filter web exec tsx scripts/prepare-product-update.ts \
  --recipients-file /private/operator/recipients.json \
  --postal-address-file /private/operator/address.txt \
  --output /private/operator/product-update-preflight.json
```

4. Submit the resulting request to the authenticated `POST /api/admin/bulk-notification` endpoint with `Authorization: Bearer <ADMIN_SECRET>`, using your private server environment. The file defaults to `dryRun: true`: this checks the exact recipient scope, opt-outs and suppressions, with zero campaign writes or SMTP attempts. Read the returned `requested`, `matched`, `eligible`, `skippedOptOut`, and `suppressed` counts. If a record is missing, resolve that before proceeding. For more than 100 selected recipients, use reviewed disjoint batches with identical content and the same campaign ID.
5. For an approved single-mailbox test, prepare a one-account list and supply `--campaign-id test_product_update_2026_09_29`. Review the preflight. Only an explicit `dryRun: false` request sends. Inspect the actual HTML/plain text, sender/reply address, images, personalized fallback, renewal terms, unsubscribe, and provider DKIM coverage of the List-Unsubscribe headers. Verify Pro/Free clicks in the admin dashboard. A browser preview cannot certify Gmail, Outlook or Apple Mail rendering.
6. After those checks, an explicit `dryRun: false` request with the reviewed production campaign ID sends through the configured marketing SMTP provider. Do not change an existing campaign's content or resend ambiguous outcomes; read the [tracking integration](../../EMAIL_CAMPAIGN_TRACKING.md).

The source retains `{{firstName}}`, `{{POSTAL_ADDRESS}}` and `{{UNSUBSCRIBE_URL}}` intentionally. Preparation resolves the address; the server resolves every name (fallback “there”) and creates each recipient's signed unsubscribe link, tracked CTA URLs and open pixel. Copying the raw template into Zoho Campaigns or another platform bypasses this integration: configure that provider's own personalization, unsubscribe and analytics instead, or implement an adapter. Do not send unresolved source HTML.

The unsubscribe route requires no login. Opening a link shows confirmation; a POST saves only the product-email opt-out. GET/HEAD scanner visits do not unsubscribe. Inbox one-click POSTs are supported. The approved `20260929172952_email_marketing_unsubscribe_preference.sql` migration was applied and verified on September 29; existing reminder preferences and addresses were not changed. An unknown preference is not evidence of consent.

## Design and verification

A short note from Karthik precedes the illustration. Eight compact rows explain what an account can do. One primary Pro button and a secondary Free dashboard link provide the next step; the Chrome Store link remains available for installation. The government-notice joke and its subject have been removed.

The template retains table layout, inline styles, readable HTML text, image alternatives, explicit dimensions, and mobile padding. There is no JavaScript in the send-source HTML. The existing GIF has a useful first frame and plays once; reduced-motion CSS switches it to the PNG where supported. The preview controls are separate from the send-source email.

The HTML and plain-text CTA destinations remain compatible with the existing tracking instrumentation tests. Verify preview rendering, both width controls, merge placeholders, local assets, and `git diff --check` after edits. Historical release and validation evidence remains in [GitHub review](github-review.md) and the [tracking documentation](../../EMAIL_CAMPAIGN_TRACKING.md).

This revision was checked in the browser at 375px and the available 464px reading width with no horizontal overflow; images loaded, the mobile control switched correctly, and the offer and footer remained readable. All 10 existing campaign-instrumentation tests passed against the rewritten template. The plain-text draft dropped from 664 to 441 words, including metadata, links, terms, and footer. Preview merge fields are resolved while send-source merge fields remain intact.

Send-preparation verification (September 29): 48 focused tests, TypeScript, scoped lint, production build and the offline CLI fixture passed. The approved unsubscribe preference migration is live with RLS retained; no email-preferences security findings were reported by the advisor. The refreshed local preview shows Karthik. No live recipient request, SMTP test, campaign registration or send was performed.
