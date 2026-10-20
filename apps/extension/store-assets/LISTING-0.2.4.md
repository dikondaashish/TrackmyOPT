# Chrome Web Store update — 0.2.4

Existing production item: `hfljbefkccdmlnhclfojlafipjnjbajm` (Zyene, Inc.).
Upload to this item's draft; do not create a second listing. The listing copy,
screenshots, and tiles in [`LISTING-0.2.1.md`](LISTING-0.2.1.md) and
`output/0.2.1/` stay valid; confirm the dashboard's Store listing tab still
shows them before submitting.

## Package

Build and validate from the repository root:

```bash
pnpm --filter extension package:store
```

The script rebuilds `dist/`, checks the manifest (MV3, version matches
`package.json`, exact permission and host lists), rejects `localhost`, source
maps, console calls, and key-shaped strings, and writes
`apps/extension/releases/trackmyopt-v0.2.4-chrome-web-store.zip`. `releases/`
is not tracked; rebuild to reproduce it. Record the SHA-256 the script prints.

## What changes for the Store form

0.2.4 adds one permission since the last published package: **`alarms`**.
Chrome re-reviews permission additions, and the Privacy practices tab needs a
justification for it. Suggested text:

> alarms: Schedules two short background checks in the extension's service
> worker: a periodic refresh of TrackMyOPT's own feature configuration, and a
> one-minute sweep that closes out the status of a job-application submission
> the user already started. Neither alarm contacts third-party sites or reads
> page content on its own.

Every other permission, the host list (`trackmyopt.com` only), and the
remote-code answer (**No**) are unchanged. The Store's data-use declarations
do not change.

## Before you submit

1. Upload the ZIP on the **Package** tab; confirm the dashboard reports 0.2.4.
2. Add the `alarms` justification on **Privacy practices**.
3. Re-read the single-purpose and permission fields; they must still describe
   the extension accurately.
4. Choose publishing options (immediate or deferred), then **Submit for review**.
