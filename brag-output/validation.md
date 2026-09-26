# Validation

- Hyperframes 0.8.78 `check`: passed, zero errors. Runtime and layout: zero errors/warnings. All 88 sampled contrast checks passed.
- Four non-blocking lint notices recommend separate sub-composition files. A single local timeline was retained for this short, low-memory render.
- Inspected settled snapshots at 0, 1.8, 3.5, 7.2, 12.2, 16, 19.4 and 19.9 seconds. Reviewed pointer keyframes. Separated outgoing/incoming text fades to eliminate transition overlap warnings; reran check successfully.
- Native macOS render: one worker, hardware GPU, screenshot capture, 600 frames. No Docker or local AI generation. Render completed in 38.2 seconds.
- Final FFprobe: H.264, 1080×1920, 30/1 fps, 600 frames, exactly 20.000 seconds. AAC audio, exactly 20.000 seconds. Final file approximately 2.4 MB.
- Poster: selected settled Prefill result at 3.5 seconds and baked it into frame zero. Audio packet SHA-256 matches the original render after the poster pass.
- Inspected encoded frame 0 and frames at 1.2, 7.2, 12.2 and the last frame. No clipping, missing assets, broken UI, or black ending observed.
- Audio signal present: mean -28.5 dBFS, peak -7.4 dBFS, no clipping. Bundled music plus two restrained clicks; no narration.
- Demo data only; source popup captured with mocked storage and intercepted API responses. Application source files were not modified.

These checks validate this video artifact. They do not certify live-site compatibility, backend availability, CI completion, or deployment health.
