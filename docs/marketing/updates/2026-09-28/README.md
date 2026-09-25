# September 28 product update

**Status: review draft. No email sent or scheduled.**

- Intended send date: Monday, September 28, 2026, America/New_York. Time is not selected.
- Review window: September 15–24 inclusive, the last ten calendar dates as of the request. Changes after the September 24 snapshot are not included.
- Subject: **Important notice from TrackMyOPT (not usci.s 👀)**
- Alternate subject: **Important TrackMyOPT update: Chrome extension + more**
- Preheader: A major Chrome extension update, clearer OPT dates and case tracking, new networking tools, and more.
- Proposed sender: TrackMyOPT `<support@trackmyopt.com>`, subject to the sending provider's verified sender configuration.
- Audience: product users eligible to receive product updates, honoring marketing opt-outs, suppressions, bounces, and duplicate addresses. “All users” is the intended breadth, not an instruction to override email preferences.

## Files

| File | Purpose |
| --- | --- |
| [preview.html](preview.html) | Local review page with desktop/mobile controls |
| [preview-email.html](preview-email.html) | Rendered email with local assets and visibly unfinished footer values |
| [email.html](email.html) | Email HTML for the sending provider, with three explicit merge placeholders |
| [email.txt](email.txt) | Plain-text counterpart, with subject/preheader metadata at the top |
| [assets/next-steps.gif](assets/next-steps.gif) | Original four-area illustration, one brief animation, about 320 KiB |
| [assets/next-steps.png](assets/next-steps.png) | Static illustration, also used for reduced motion where supported |
| [assets/hero-route.gif](assets/hero-route.gif) | One-pass animated hero background: calendar, case, and outreach checkpoints |
| [assets/hero-route.png](assets/hero-route.png) | Static hero background for reduced motion where supported |
| [assets/logo.png](assets/logo.png) | Unmodified existing TrackMyOPT favicon |
| [github-review.md](github-review.md) | Feature evidence, release limits, and the complete first-parent commit inventory |
| [build_preview.py](build_preview.py) | Rebuilds the illustration and review pages; no network or email operations |

## Preview locally

From the repository root:

```sh
python3 -m http.server 4398 --bind 127.0.0.1 --directory docs/marketing/updates/2026-09-28
```

Open [the review page](http://127.0.0.1:4398/preview.html). Use HTTP so the preview frame and automatic height adjustment have the same origin.

To regenerate after editing `email.html`, use Python 3 with Pillow installed:

```sh
python3 docs/marketing/updates/2026-09-28/build_preview.py
```

The generator uses the existing macOS Trebuchet MS fonts. On other systems, set `CAMPAIGN_FONT_DIR` to a directory containing `Trebuchet MS.ttf` and `Trebuchet MS Bold.ttf`. Email recipients do not need these files: the HTML has Arial/Helvetica fallbacks.

## Before sending

This package deliberately does not implement or invoke a mailing job.

1. Confirm the final draft and recheck the featured releases before Monday. Recheck the outreach pilot flag and provider availability. The Chrome extension section explicitly describes work merged to GitHub and notes that its Chrome Web Store rollout is unverified; update that sentence only after confirming the installed store version.
2. Upload `assets/` to the email provider or an approved public HTTPS asset location. Replace `{{ASSET_BASE_URL}}` with that directory's HTTPS URL, without a trailing slash. Do not send local image paths or GitHub HTML-page URLs as image sources.
3. Replace `{{UNSUBSCRIBE_URL}}` in both versions with the provider's recipient-specific unsubscribe merge field. Replace `{{POSTAL_ADDRESS}}` with the verified sender postal address. Neither value was invented. The local preview's unsubscribe link is deliberately inactive.
4. Set the provider's subject and preheader from the metadata above. Remove the `Subject:` and `Preheader:` metadata lines from `email.txt` when importing it as the MIME plain-text body. Configure the provider's subscription/suppression behavior and unsubscribe headers using its supported campaign flow.
5. Send a test only to an approved test recipient and inspect Gmail, Outlook, and Apple Mail rendering, including dark mode, before scheduling the eligible audience. No mailbox tests were performed for this draft.

The existing `app/api/admin/bulk-notification/route.ts` replaces only `firstName`, `email`, and `userId`; it does not resolve these campaign placeholders. It is not a ready-to-use sender for this package. Do not POST this unrendered template to that endpoint.

## Design and validation

The reader is an international student checking a Monday morning inbox on a phone or laptop. The light reading surface, existing brand blue, calm wording, and illustrated Chrome tools/dates/case/career sequence support a quick scan without creating a false application status. The illustration is conceptual, not a dashboard screenshot or applicant record. Existing Arial/Helvetica email typography is preserved, with Trebuchet headings and safe fallback fonts. There is no new `DESIGN.md`; the existing email brand and product context guided the design. The optional Impeccable `document` command can capture these choices for future campaigns.

Email uses presentation tables, inline primary styles, real HTML text, descriptive link labels, alternative image text, explicit image dimensions, and no JavaScript. The separate review wrapper has small local-only preview controls. Hex colors preserve the existing brand and email compatibility.

Both GIFs have useful complete first frames, play for approximately 3.62 seconds once, and do not depend on infinite motion to communicate. The new hero GIF animates a calendar → case record → outreach route behind the live HTML headline. Inline background styles and a `background` attribute use the animated asset in supporting clients; the hero keeps a solid blue fallback when email apps block or ignore background images. A mobile media query removes the background layer to keep narrow headlines clear, while the main journey illustration still animates. A reduced-motion media query selects static PNGs where supported. Clients can display only a still when animation is disabled; see [Microsoft's animation behavior documentation](https://support.microsoft.com/en-au/outlook/the-animated-graphic-in-my-e-mail-message-doesn-t-work). The email's responsive styling is an enhancement over its inline base; see [Gmail's supported CSS documentation](https://developers.google.com/workspace/gmail/design/css).

Verified for this draft:

- Chromium desktop preview and 320, 375, and 600px email widths: no horizontal overflow.
- Desktop/mobile preview controls and automatic iframe height adjustment.
- Visible images and hero background loaded; reduced-motion mode hides the illustration GIF and displays both static PNGs.
- Image-blocked mode retains the heading, all feature descriptions, and all nine links.
- Six product links resolve to the expected sign-in redirect; privacy returns HTTP 200. This is route verification, not authenticated feature testing.
- HTML has no scripts, forms, embedded product data, or sending credentials. Template placeholders remain only in the send-source versions.
- Asset size, GIF frame count/duration, HTML structure, local references, and `git diff --check` checked before commit.

App tests/build were not rerun for a campaign-only documentation and asset change. Browser preview checks do not certify every email client or inbox delivery. The reviewed web release's successful CI/deployment is recorded separately in the GitHub review.
