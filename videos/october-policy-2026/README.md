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

The user authorized the completed blog assets, including their GIF renders,
as part of this batch. Google indexing timing is independent of media export.
