# October 12, 2026 policy blog flows

Five editable HyperFrames projects provide nine-second, silent, 1200 × 600
flow graphics for the approved blog batch. The complete explanation remains
visible while teal card highlights and progress markers move through three
stages: what happened, what applies now, and what comes next.

| Project | Editorial distinction |
| --- | --- |
| `h1b-grace` | The September 11 worker grace-period rule is proposed; comments close November 10. |
| `h1b-fees` | Keep the extended $100,000 proclamation, court-blocked implementing policies, and separate proposed $103,265 fee distinct. |
| `h1b-employer` | Agency scrutiny of sponsor layoffs does not create an automatic universal sponsorship ban. |
| `tn-screening` | The October 1 online-presence review expansion concerns visa applications; distinguish Canadian border admission. |
| `perm-pause` | Label the October 8 company-specific PERM stop as reported; identify case stage and current work authorization. |

Copy is checked as of October 12, 2026. Read the corresponding article's
sources for the complete scope. When official guidance changes, update the
article, figure caption, accessible text steps, HTML composition and exported
GIF/poster together. Preserve the original publication date.

## Reproduce

Node.js 22+, FFmpeg and Gifsicle are required. Scripts pin HyperFrames
**0.8.149**. The compositions use a single paused GSAP 3.14.2 timeline and
system fonts. Run from the relevant project directory:

```bash
npx --yes hyperframes@0.8.149 check --snapshots
npx --yes hyperframes@0.8.149 snapshot --at 1,4,7 --no-end --output /tmp/blog-flow-proof
npx --yes hyperframes@0.8.149 preview --background
npx --yes hyperframes@0.8.149 render --format gif --fps 24 --workers 1 --output /tmp/blog-flow-render.gif
ffmpeg -y -i /tmp/blog-flow-render.gif -vf "fps=10,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" /tmp/blog-flow-small.gif
gifsicle -O3 /tmp/blog-flow-small.gif -o /tmp/blog-flow.gif
ffmpeg -y -i /tmp/blog-flow.gif -frames:v 1 /tmp/blog-flow.png
```

Review all three stages and the final GIF's decoded frames before replacing
production assets. `apps/web/public/blog/october-policy-2026/` contains the
five GIFs and their matching PNG posters. The shared blog figure starts on
the poster and provides Play/Pause controls and accessible text steps.
Temporary captures, caches and rendered intermediates remain untracked.

## Verified exports

All five flows passed the HyperFrames runtime, layout, motion and contrast
checks with zero errors. The retained standalone layout produces one
sub-composition advisory. The exported GIFs were decoded and inspected at
1, 4 and 7 seconds; all stage copy and footer text stay in frame.

| Asset | GIF bytes | PNG poster bytes | Duration |
| --- | ---: | ---: | ---: |
| `h1b-grace` | 127,140 | 50,308 | 9.0 seconds |
| `h1b-fees` | 132,926 | 52,467 | 9.0 seconds |
| `h1b-employer` | 132,459 | 52,807 | 9.0 seconds |
| `tn-screening` | 128,191 | 53,053 | 9.0 seconds |
| `perm-pause` | 143,182 | 55,179 | 9.0 seconds |

Each output is 1200 × 600. Renders used screenshot capture with hardware
GPU, one worker, then FFmpeg and Gifsicle compression. Production GIFs are
far below the one-megabyte per-figure budget.

The user authorized the completed blog assets, including their GIF renders,
as part of this batch. Google indexing timing is independent of media export.
