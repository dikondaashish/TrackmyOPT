# September 29 product update

**Status:** Sent on September 29, 2026 to the 3,031 verified, non-premium accounts selected at launch, including 703 without a profile. The sender reported 3,028 SMTP acceptances and three ambiguous outcomes requiring a ZeptoMail log check. It made one attempt per selected account and did not retry uncertain outcomes. The live [admin report](https://www.trackmyopt.com/admin/email-campaigns) shows current aggregate counts, including raw clicks and clicks after a rapid multi-link filter; these do not prove human visits or purchases. SMTP acceptance does not prove inbox delivery. The two previously reported hard bounces were excluded.

The subject is **A note from Karthik: what’s new in TrackMyOPT 👋**. This one message works for both new and active Free users. It mentions the $0.99 seven-day Pro introduction only as an offer for eligible accounts, because 32 of the selected users have already consumed it. Checkout displays each account’s actual price before payment. The sender display name is **Karthik from TrackMyOPT** on the configured verified TrackMyOPT mailbox; replies go to **support@trackmyopt.com**.

## Edit and preview

| File | Purpose |
| --- | --- |
| [email.html](email.html) | Send-source HTML |
| [email.txt](email.txt) | Matching plain text and subject/preheader |
| [preview.html](preview.html) | Desktop/mobile review page |
| [build_preview.py](build_preview.py) | Rebuilds the local preview; never sends |
| [tracking.json](tracking.json) | Pro and Free link destinations |

From the repository root:

```sh
python3 docs/marketing/updates/2026-09-28/build_preview.py --preview-only
python3 -m http.server 4398 --bind 127.0.0.1 --directory docs/marketing/updates/2026-09-28
```

Open [the preview](http://127.0.0.1:4398/preview.html). The local version substitutes “there,” the owner-supplied postal address, and inactive unsubscribe controls; the send-source files retain recipient merge fields. The logo, animated illustration, and static fallback are hosted under `/email/product-update-2026-09-29/`. The GIF plays once, with a useful first frame and a reduced-motion fallback where supported.

## All-Free campaign

Use the trusted server-side script [send-product-update-all-free.ts](../../../../apps/web/scripts/send-product-update-all-free.ts). It reads Supabase Auth for verified email addresses and `profiles` for current Free status. This is necessary because most Free profiles do not have a copied email address. It also includes verified Auth accounts with no profile and no payment history; these accounts cannot have profile-based Pro access. It excludes known Premium accounts, accounts without a profile but with payment history, deleted/unverified accounts, mismatched addresses, product-email opt-outs, duplicate emails, and `blocked_emails`. Two hard bounces supplied by the owner were added to the blocked list and verified. The script rechecks Free status or missing profile/payment history, opt-outs, and blocks for each 25-person group.

Prepare a private server environment file and owner-supplied address file outside Git. Run without `--send` first:

```sh
pnpm --filter web exec tsx scripts/send-product-update-all-free.ts \
  --env-file /private/operator/production.env \
  --postal-address-file /private/operator/address.txt
```

This only reads the audience and validates content. To perform an owner-authorized campaign, repeat with `--send`. The sender verifies TLS/SMTP login before registering the campaign, then sends in groups of five. The campaign ID `product_update_2026_09_29` now appears in [admin analytics](https://www.trackmyopt.com/admin/email-campaigns). Each recipient gets signed Pro and Free links, a tracking image, a personal unsubscribe link, and one-click unsubscribe headers. The sender reserves each campaign/email pair before SMTP; reruns skip duplicates. Ambiguous outcomes are retained for review, never blindly retried. SMTP acceptance does not prove inbox placement or a purchase.

The owner supplied **28 Geary St Ste 650 #1892, San Francisco, CA 94108** for the footer. The email is a product update with a paid offer and must keep its unsubscribe path. The configured provider’s permission and limits should be confirmed privately. [Zoho’s public policy](https://www.zoho.com/cpaas/help/sending-bulk-emails.html) classifies promotional announcements as bulk, regardless of internal labels. Neither SMTP nor a template can guarantee Gmail Primary or Outlook Focused placement.

The earlier [five-account inactive export](../../../../apps/web/scripts/export-product-update-candidates.ts) and [private-request helper](../../../../apps/web/scripts/prepare-product-update.ts) are retained for a different, narrowly targeted campaign. They are not the all-Free send path.
