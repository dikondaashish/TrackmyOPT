---
workflow: motion-graphics
flow: automation
storyboard: no
---

Viewers see the complete three-stage explanation from the first frame of this nine-second inline blog graphic. The title 'H-1B employer scrutiny: what to verify' anchors a quiet ivory layout, with navy text and teal accents. A pale teal card background and a left-to-right progress marker focus attention on each stage for three seconds without moving or hiding any words. The graphic distinguishes the checked October 12 facts from unknown future outcomes, remains readable while paused, and uses no audio or external assets.

Audience: TrackMyOPT readers. Destination: an inline blog GIF and static poster. Canvas: 1200 × 600. Duration: nine seconds at 30 fps. Audio: none.

Authorization: The user authorized all five blog topics and the prior request for generated images and explanatory GIFs. Continue through build, validation and render without reopening approval.

Asset strategy: asset-free (`asset_needs: []`); no sourcing step or additional news search. Use the supplied facts checked October 12, 2026.

Design: teal #176b78, navy #152c49, ivory #f6f8fc; white resting cards and pale teal #e5f2f4 active cards. Use system sans/serif or shipped local fonts. All three cards remain visible throughout. Stages: 0–3, 3–6 and 6–9 seconds. Dominant motion: sequential background highlight plus left-origin scaleX marker. No camera movement, text animation or audio.

Reuse decision: adapt `docs/blog-media/october-2026/opt-fees/index.html` as the existing validated three-card pattern. Catalog queries for sequential card background highlighting and a left-to-right scaleX progress fill both exited 13 with an unsettled top-level await warning. The official raw registry manifest was inspected as fallback and includes caption-highlight, marker-highlight, inline-highlight and mk-progress-stat. Those are caption or stat treatments; the supplied pattern matches this fixed card explanation directly. No new effect needs to be authored.

Builder contract: follow the final shot-plan.json. Keep all three cards visible throughout. Use explicit seek-safe GSAP states. Readability and short factual qualifications take priority over decoration. Validate at 1.5, 4.5 and 7.5 seconds and create a static poster as well as the nine-second GIF.
