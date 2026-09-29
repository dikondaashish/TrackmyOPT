# September 29 product update

**Status: review draft. No email sent or scheduled.**

## Personal re-engagement revision

- Subject: **We’ve been busy 👋 Try Pro for $0.99**
- Preheader: A quick note from Karthik: what you can do with your account, plus 7 days of Pro for $0.99 if eligible.
- Proposed sender display name: **Karthik from TrackMyOPT**, using the verified `support@trackmyopt.com` mailbox. This is preview copy; the global SMTP sender configuration was not changed. Confirm the campaign's actual From/Reply-To presentation before sending.
- Intended audience: registered Free users who have not started using their account, are eligible for the introductory offer, and receive product emails. Do not send an upgrade invitation to current paid subscribers.
- This is a template revision, not an audience selection. No inactivity rule or recipient list has been calculated. The existing bulk-notification endpoint selects the full eligible audience, **not an inactive-user segment**; do not invoke it unchanged for this targeted campaign.
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

## Before sending

1. Define and verify the inactive-user segment, introductory-offer eligibility, opt-outs, bounces, and suppressions. This package does not select or send to that segment. Configure a scoped sender before any mailbox test or campaign send.
2. Recheck featured releases and the [live pricing terms](https://www.trackmyopt.com/pricing). See [GitHub review](github-review.md) for the verified release snapshot. No approval, employment, or contact-lookup result is guaranteed.
3. Host the existing logo and illustration at an approved public HTTPS location and replace `{{ASSET_BASE_URL}}`. Local image URLs will not work in recipients' inboxes.
4. Replace `{{POSTAL_ADDRESS}}` with the verified sender address and `{{UNSUBSCRIBE_URL}}` with a working recipient-specific link. Keep privacy and unsubscribe links direct.
5. Confirm the From/Reply-To mailbox. Remove `Subject:` and `Preheader:` metadata from the plain-text MIME body. The existing SMTP flow substitutes `{{firstName}}` (HTML-escaped) and falls back to “there”; another provider must have an equivalent merge field and fallback.
6. Preserve the Pro and Free URLs in [tracking.json](tracking.json). The existing integration is described in [Email campaign tracking](../../EMAIL_CAMPAIGN_TRACKING.md). Pasting the template into a different provider does not enable this tracking automatically. If a campaign ID has already been registered with different content, use a new ID.
7. Inspect an approved single-recipient test in Gmail, Outlook, and Apple Mail before scheduling. Browser preview checks do not certify every email client. No mailbox test or live send was performed for this revision.

## Design and verification

A short note from Karthik precedes the illustration. Eight compact rows explain what an account can do. One primary Pro button and a secondary Free dashboard link provide the next step; the Chrome Store link remains available for installation. The government-notice joke and its subject have been removed.

The template retains table layout, inline styles, readable HTML text, image alternatives, explicit dimensions, and mobile padding. There is no JavaScript in the send-source HTML. The existing GIF has a useful first frame and plays once; reduced-motion CSS switches it to the PNG where supported. The preview controls are separate from the send-source email.

The HTML and plain-text CTA destinations remain compatible with the existing tracking instrumentation tests. Verify preview rendering, both width controls, merge placeholders, local assets, and `git diff --check` after edits. Historical release and validation evidence remains in [GitHub review](github-review.md) and the [tracking documentation](../../EMAIL_CAMPAIGN_TRACKING.md).

This revision was checked in the browser at 375px and the available 464px reading width with no horizontal overflow; images loaded, the mobile control switched correctly, and the offer and footer remained readable. All 10 existing campaign-instrumentation tests passed against the rewritten template. The plain-text draft dropped from 664 to 441 words, including metadata, links, terms, and footer. Preview merge fields are resolved while send-source merge fields remain intact.
