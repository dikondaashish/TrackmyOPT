# TrackMyOPT Chrome extension launch video

20 seconds · vertical 1080 × 1920 · 30 fps · polished · bundled music · no voiceover.

- `brag.mp4`: final H.264/AAC video, including the selected poster as frame zero.
- `brag.jpg`: settled Prefill result used as the poster.
- `share-copy.txt`: single ready-to-post caption.
- `brag-plan.md`: source inspection, feature coverage, storyboard and truth boundaries.
- `composition-brief.md`: implementation brief.
- `composition/index.html`: editable scenes, type, timing and audio mix.
- `composition/assets/`: source branding, actual demo popup capture, music, SFX, and local GSAP runtime.

## Edit, inspect and render

Requires Node 22+, FFmpeg/FFprobe and Hyperframes' supported Chrome. Run from this directory:

```sh
cd composition
npx --yes hyperframes@0.8.78 check
npx --yes hyperframes@0.8.78 preview --background
npx --yes hyperframes@0.8.78 render --workers 1 --fps 30 --gpu --quality delivery --output ../brag.mp4
cd ..
ffmpeg -y -ss 3.5 -i brag.mp4 -frames:v 1 -q:v 2 brag.jpg
ffmpeg -y -i brag.mp4 -i brag.jpg -filter_complex_threads 1 \
  -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" \
  -map '[v]' -map '0:a?' -c:v libx264 -threads 2 -crf 18 -preset medium \
  -pix_fmt yuv420p -c:a copy -movflags +faststart brag.poster.mp4
mv brag.poster.mp4 brag.mp4
ffprobe -v error -show_streams -show_format brag.mp4
```

One render worker conserves memory. GPU encoding uses Apple's VideoToolbox when available; no Docker or local AI models are required. The final poster pass uses two encoding threads. Do not run several render jobs at once on an 8 GB Mac.

## Product evidence

Paths below are relative to the repository root.

| Scene | Source files | What the film shows |
|---|---|---|
| Prefill and review | `apps/extension/src/resume-status-row.ts`, `content-job-portal.ts`, `autofill-feature-flags.ts`, `autofill-plan-entitlements.ts`, `home.ts` | Saved-profile prefill, résumé attachment, Undo, private-answer review, skills/history, Step-by-step, Continuous and Guided Autopilot. Pro modes labeled; final submission stays with the user. |
| Résumé and AI | `apps/extension/src/job-portal-tracker-widget.ts`, `sidepanel.ts`, `cover-letter-review.ts`, `tour-content.ts` | Prepared tailored résumé demo, PDF/editor actions, fit/keyword analysis, cover letter and screening drafts. AI plan limits labeled; no invented fit score or generation-speed claim. |
| Sponsorship and tracker | `apps/extension/src/job-portal-widget-ui.ts`, `job-portal-tracker-widget.ts`, `tour-content.ts` | Posting signal, Save to job tracker, example stages; save is not submission. |
| OPT command center | `apps/extension/src/home.ts`, `public/popup.css`, `src/design/tokens.ts` | Actual source-rendered popup: demo case status and all four OPT/STEM date/clock tiles. |

The first three scenes are magnified, source-grounded demonstrations with staged state changes. The final popup is captured directly from `renderHome` with intercepted API responses and mocked Chrome storage. All names, jobs and records are fictional; no live account is accessed. Dates and immigration requirements are not calculated in this film. Supporting utility controls (theme, help, tour and feedback) are not separate demos.

To regenerate the actual popup on Apple Silicon, run `node brag-output/scripts/capture-popup.cjs` from the repository root after caching Hyperframes with `npx hyperframes doctor`. The script discovers its cached esbuild/Puppeteer dependencies and Chrome; set `CHROME_PATH` for another supported browser. It uses source code without editing application files.

## Audio and motion

Music: “Happy Beats / Business Moves Vol. 12” by ende.app, bundled with the Brag skill (`latent-spaces/brag`). Short click: bundled `interface/click_003.ogg`. Timing metadata is preserved in `composition/assets/music-cues.json`. Audio-reactive rule uses the first 600 frames from Hyperframes Creative's `extract-audio-data.py`; no music generation. The `page-slide` registry primitive informed the opposing inner-panel motion. Text fades are staggered to avoid overlapping copy.

The output is a feature overview, not a compatibility certification or an account demonstration. No deployment or application behavior changes are included.
