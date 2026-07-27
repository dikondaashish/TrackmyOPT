# Chrome Web Store assets

These files are the privacy-safe marketing assets for the TrackMyOPT Chrome
Web Store listing. They use fictional application data and contain no customer
credentials, addresses, resumes, or employer submissions.

## Render

From the repository root:

```bash
NODE_PATH=/Users/ashishdikonda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
  /Users/ashishdikonda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  apps/extension/store-assets/render-store-assets.mjs
```

The renderer produces:

- five `1280x800` Store screenshots;
- one `440x280` small promotional tile;
- one `1400x560` marquee promotional tile.

All output files are opaque 24-bit PNGs.

