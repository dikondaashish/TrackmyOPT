# Validation

## Composition

- Hyperframes 0.8.78 `check` passed after the final crop changes.
- Zero lint errors; zero runtime, layout or contrast errors/warnings.
- All 45 sampled text-contrast checks passed.
- 45 non-blocking lint advisories remain: 42 repeated-scene/subcomposition suggestions, two repeated-image discovery advisories, and one dense timeline advisory. These describe the single-file editing structure; no duplicate playback or broken imagery was observed.
- The source contains 42 timed scenes totaling 162 seconds. All 19 measured click targets are inside their displayed crops.
- JavaScript capture/build scripts pass `node --check`; finalization script passes `sh -n`.
- Studio preview returned HTTP 200. It was opened before rendering and stopped afterward to release resources.

## Product evidence and visual review

Actual extension source components were bundled into an isolated browser harness. Five contact fields were populated by the real Prefill engine. The fictional sponsorship question and résumé upload remained blank in that profile-only flow. No application was submitted. Calendar and calculator handlers ran against fixed fictional dates; account and service responses were fixtures.

Reviewed source captures, composition chapter snapshots, and an encoded-frame proof sheet for every scene. Corrected the STEM saved-date fixture, calendar dismissal, a stale résumé loading label, cover-letter editing state, caption visibility at scene boundaries, cropped form borders, and overly tall sidebar-settings crop. Final close-up frames show complete action buttons with margins. The numerical AI score is excluded from the visible crop.

Screenshots are edited into a walkthrough with measured animated pointer positions; this is not a live production-account recording. AI outputs, clock counts, account state and server saves are illustrative. UI checks do not validate production backend behavior.

## Render and media checks

Native Hyperframes rendering uses one worker, Chrome screenshot capture, Apple M2 Metal acceleration, and hardware video encoding. Music is bundled Business Moves vol. 1, with gain/fades and click cues; no voiceover or generated music.

- Final MP4: H.264, 1920 × 1080, 30 fps, exactly 4,860 frames / 162.000 seconds.
- Audio: AAC stereo, 48 kHz, 162.000 seconds. Audio packet SHA-256 is identical before and after poster insertion: `f29b473e71c15fe60ab0feab95a891d83ebaec24855399040048c4c0bf4eb6db`.
- Final file size: 49,644,765 bytes. Fast-start MP4 metadata is enabled.
- Poster selected at 159 seconds, saved as `brag.jpg`, and baked into frame zero. The opening Prefill result still appears at 1.4 seconds.
- All 42 encoded scene proof frames were extracted; the corrected filing-form and settings frames were re-inspected after the final render.
- Final native render completed in 4m 1.7s using screenshot capture and hardware GPU; no Docker or parallel workers.
- No application source files were changed. No YouTube upload, Chrome Web Store submission, production backend test, or deployment verification was performed.
