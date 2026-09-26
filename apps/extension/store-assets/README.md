# Chrome Web Store assets

These files are the privacy-safe marketing assets for the TrackMyOPT Chrome
Web Store listing. They use fictional application data and contain no customer
credentials, addresses, resumes, or employer submissions.

Version 0.2.1 lives in `output/0.2.1/`. Its five screenshots frame real tour
components from the extension with clearly labeled fictional sample data.
The two promotional tiles use the same branding. See `LISTING-0.2.1.md` for
the exact listing copy and `../../../docs/releases/chrome-extension-0.2.1.md`
for release verification.

## Render

From the repository root after `pnpm install` and the extension build, run:

```bash
node apps/extension/store-assets/release-assets.mjs
```

Open the printed local URL in Chrome and click **Export all 7 PNGs**. The
renderer uses the extension's tour markup and CSS with fictional data. It
produces:

- five `1280x800` Store screenshots;
- one `440x280` small promotional tile;
- one `1400x560` marquee promotional tile.

All output files are opaque 24-bit PNGs.
