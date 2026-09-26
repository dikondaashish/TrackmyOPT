# TrackMyOPT: Recordly → Remotion

This is the local, code-driven video workflow requested by the owner. ChatGPT/Codex writes and edits React animation code; Recordly supplies genuine recordings of the extension; Remotion previews and renders the MP4 on the Mac. No generative-video service or API key is required.

## Current delivery

- Remotion 4.0.529 project, separate from the extension build and production dependencies.
- 1920 × 1080, 30 fps.
- 8-second animated opening, 6-second ending, and 14 individually editable feature compositions.
- DetailedWalkthrough: 120 seconds at the default timings, including 12-frame crossfades.
- An actual silent opening MP4 in `out/trackmyopt-opening-preview.mp4` after rendering.
- Footage slots are explicitly labeled RECORDING NEEDED until Recordly exports are supplied.
- No extension footage has been captured or supplied yet. This is an editable project and opening preview, not a finished product demo.
- No narration/music has been added yet. Existing recordings are muted so accidental microphone audio does not enter the edit.

## First recording

Record **Smart Prefill** first, for about 20–30 seconds:

1. Use fictional demo profile details and a supported safe application form.
2. In Recordly, select the Chrome window. Keep the microphone and webcam off for this take.
3. Record two seconds of the empty form before doing anything.
4. Open the extension's application tools and click Prefill.
5. Let the completed fields remain visible for about three seconds.
6. Show a pre-entered value remaining unchanged if possible.
7. Stop before any real application submission.
8. Export a high-quality 16:9 MP4, ideally 1920 × 1080 or higher source resolution. Keep zooms subtle and cursor movement readable.
9. Save it as `public/recordings/prefill.mp4`. Keep the original source and .recordly project too.

A .recordly project contains editor state and references to source media; it is not the final MP4. We need the exported MP4 for the timeline. Avoid heavy Recordly framing if the Remotion frame is used, so the video does not acquire two layers of borders.

[Full recording shot list](RECORDING-SHOT-LIST.md)

## Commands

Run from this directory, not the monorepo root:

```sh
npm ci --workspaces=false
npm run studio --workspaces=false
npm run typecheck --workspaces=false
npm test --workspaces=false
npm run render:opener --workspaces=false
```

Studio: http://localhost:59768

The `--workspaces=false` flag keeps this standalone tool outside the pnpm application workspace. Do not add the video packages to the extension's runtime dependencies.

## Editing and final rendering

Edit `src/shot-list.json` for clip filenames, chapter copy, durations, trim starts, and playback speed. Times use seconds; the project converts trims to composition frames. Clips must cover `trimStartSeconds + durationSeconds × playbackRate`.

After inspecting a clip for personal information, readable UI, and accurate behavior, mark its `reviewed` field true. Recording files and generated outputs are ignored by Git.

```sh
npm run preflight --workspaces=false
npm run render:final --workspaces=false
```

The final command checks that all footage exists, has been reviewed, and is long enough, then renders `out/trackmyopt-walkthrough.mp4`. It intentionally reports missing recordings at present. Direct Studio rendering is available for drafts and does not replace that final check.

Each feature is a separate Studio composition, such as `Feature-prefill`. To export an individual reviewed feature:

```sh
./node_modules/.bin/remotion render src/index.ts Feature-prefill out/prefill.mp4
```

For stills from the edited composition:

```sh
./node_modules/.bin/remotion still src/index.ts Feature-prefill out/prefill.png --frame=100
```

The render is deterministic: animations use frame numbers, with no CSS animation timers. Real footage stays at its original proportions using contain, rather than being stretched.

## Workflow and style

Capture → choose genuine interactions → trim pauses → animate chapter titles → compose footage → add purposeful callouts and zooms → record narration if wanted → review → render.

The current opening establishes the TrackMyOPT ink/cobalt/ivory palette and large kinetic typography. Detailed feature scenes keep the screen recording large. The earlier campaign images can be optional interstitials, but they do not substitute for real product evidence. Final zoom targets and callouts should be placed after inspecting the recordings.

## Verified sources

- [Remotion: creating projects with coding agents](https://www.remotion.dev/docs)
- [Official Remotion agent guidance](https://www.remotion.dev/docs/ai/skills)
- [Remotion video embedding](https://www.remotion.dev/docs/media/video)
- [Recordly upstream project and export workflow](https://github.com/webadderallorg/Recordly)
- [Remotion license](https://www.remotion.dev/license)

Recordly is open source; the current upstream project lists AGPL-3.0. The installed Mac app was identified as 1.4.0; newer upstream features have not been assumed to exist in that installation. Remotion is source-available under its own license. The current 4.x terms allow individuals, nonprofits, and for-profit organizations with up to three employees to use it free, including commercial videos; larger for-profit organizations require a company license. This project is prepared as an evaluation; company eligibility has not been confirmed.

## Validation

TypeScript, four focused media-preflight tests, an opening MP4 render, representative frame inspection, and an embedded-video smoke render are the relevant checks. Raw recordings are still required to verify the actual product-demo edit.
