# TrackMyOPT — Chrome Web Store walkthrough

A 1:30 landscape walkthrough (1920 × 1080, 30 fps) with visible click paths, actual extension UI, fictional demo data, bundled music, and synchronized Gemini Charon narration. Application code and behavior are unchanged.

## Deliverables

- `brag.mp4`: final YouTube-ready H.264/AAC video.
- `brag.jpg`: selected poster, also baked into video frame zero.
- `share-copy.txt`: suggested YouTube title/description and listing placement notes.
- `composition/index.html`: editable Hyperframes/GSAP source with bundled captures/audio.
- `storyboard.json`, `brag-plan.md`, `composition-brief.md`: creative plan and timing.
- `scripts/capture.cjs`, `scripts/capture-sidepanel.cjs`: isolated source-UI capture harnesses.
- `scripts/build.cjs`: scene/caption/crop builder. It regenerates `index.html` and the storyboard.
- `capture-manifest.json`: capture dimensions and measured click targets.
- `capture-evidence.json`: fictional message and prefill evidence.
- `validation.md`: checks, render details, and inspection notes.

## Chrome Web Store placement

Google's listing form accepts a **YouTube video link**. Upload the MP4 to YouTube, then paste its URL into your extension's Store listing video field. For a localized listing, use **Localized promo video**; Google documents that it appears before localized screenshots. This task does not upload to YouTube or submit the store listing.

Official reference, checked September 26, 2026: [Chrome Web Store listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).

The 16:9 format and duration are design choices for a readable walkthrough, not claimed Google requirements. This shorter landscape revision preserves every feature and all 42 scenes from the approved 2:42 walkthrough. The previous video remains in `../brag-output-2026-09-26-131520/`.

## Edit and render

Node 22+ and FFmpeg are required. From this directory:

```sh
cd composition
npm run check
npx --yes hyperframes@0.8.78 preview --background
npm run render
```

Rendering uses one worker, native Chrome/Metal and VideoToolbox where available. No Docker or AI services are required. Keep other heavy apps closed on an 8 GB machine. The bundled captures make the composition independent of a running TrackMyOPT application.

To change timing, captions or crops, edit `scripts/build.cjs`, then run it from the repository root. To recapture the UI, run `node <output-directory>/scripts/capture.cjs`, followed by `capture-sidepanel.cjs`, from the repository root. Those optional capture scripts use esbuild and puppeteer-core from the cached Hyperframes CLI installation. They require the extension source tree at the inspected version; later product changes may require updating selectors.

After a fresh render, `scripts/finalize.sh` selects the poster and replaces only video frame zero. It retains the original render as an ignored local file.

## Demonstration fidelity

The screens come from the actual extension source at revision `9b921f4`, including local extension work already present before this task. That application work is not included in this task's publication. Source renderers and event handlers run in a local browser harness; network/account responses are replaced by fictional fixtures. The form is a clearly labeled fictional employer application. `runPrefill` genuinely fills five contact fields; no application is submitted.

Clock counters, account status and AI responses are illustrative fixtures. Date-window calculations run in the actual product code with a fixed reference date. The numerical AI score is outside the video crop; the film makes no performance or outcome claim. Service waits are shortened and labeled. The PDF/AI backends are not exercised; the demo shows their actual UI controls and representative returned states. The résumé side-panel flow and in-page cover-letter flow are shown as separate surfaces.

The video is edited from source-UI state captures, with an animated pointer at measured button coordinates. It is not a continuous screen recording or an end-to-end production-account test. Secondary controls such as feedback, product tour, sign-out, and theme switching are visible where present but are not individual walkthrough chapters.

Music: Brag's bundled **Happy Beats Business Moves vol. 1 by ende.app**. Its cue metadata is included. Click sound: bundled `interface/click_003.ogg`. Logo and screenshots: this repository. GSAP and Hyperframes provide animation/rendering. Narration is generated with Gemini 3.8 Flash TTS, using the Charon voice. The bundled music is unchanged.

## Narration revision

All 42 visual scenes and the 90-second timeline are retained. Fifteen voice takes were generated sequentially using Gemini 3.8 Flash TTS / Charon. Credentials were supplied only to the generation process and are not saved in this package.

- `narration-script.txt`: spoken script.
- `audio_request.json`: model, voice, delivery and section timings.
- `composition/assets/voice/`: original generated takes.
- `composition/assets/narration.wav`: aligned, normalized voice track.
- `narration-timing.json`: measured section placement and pitch-preserving tempo adjustments.
- `audio-elements.html`: editable audio tracks, music EQ and ducking envelopes, reused by the scene builder.

To regenerate speech, supply `GEMINI_API_KEY` securely in the process environment and run `node scripts/generate-narration.mjs`. The media-use skill adapter is required; its path can be overridden with `MEDIA_USE_GEMINI_ADAPTER`. Existing takes are reused. Run `python3 scripts/align-narration.py` after changing takes. If the voice changes, recalculate the music carve before rendering. `scripts/review-audio.py` performs a cloud transcription/quality review using a privately entered key. Its timestamps are estimates, not authoritative editing coordinates.
