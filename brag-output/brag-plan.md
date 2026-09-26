# TrackMyOPT extension — 20-second launch film

## Nine-question product rubric
1. TrackMyOPT is a Chrome application companion with saved-profile prefill, résumé and AI tools, job tracking, and OPT/STEM timeline tools.
2. Strongest source claim: “One click. A head start.” (`tour-content.ts`). Demonstrate field filling, never submission.
3. Visual hook: a blue Prefill button fills an application with fictional Alex Taylor details before 2 seconds.
4. Show source-grounded application widgets and an actual `renderHome` popup capture, including case status and all four OPT/STEM tool tiles.
5. Exactly 20 seconds, 1080×1920, 30 fps. Four grouped scenes are the shortest readable overview of the feature families.
6. Polished: restrained motion, precise layouts, generous system type, no hyperbole.
7. Steady bundled Vol. 12 music, gentle start/end fades, sparse click cues. No voice or local music generation.
8. Share copy: TrackMyOPT for Chrome brings application prefill, résumé tools, job tracking, and OPT/STEM timelines into your browser. Review every answer and stay in control of submission.
9. Saved profile → Prefill application and attach job résumé → review; tailor and analyze → save the job → follow applications and OPT/STEM tools.

## Visual identity
Source: `apps/extension/src/design/tokens.ts`, `public/popup.css`, `src/home.ts`, `src/job-portal-tracker-widget.ts`, `src/resume-status-row.ts`, `src/tour-content.ts`.
Background #f6f8fb, surface #ffffff, text #0f172a, muted #64748b, action #2563eb, strong #1e40af, STEM #0f766e; source success #166534. Same system-ui family as extension. Source icon128.png. UI uses source labels and layout relationships, enlarged/reframed for portrait. Popup is rendered directly from the source function with stubbed local data. Application/page state animations are faithful staged demos, not a recording of a live account.

## Storyboard
### 1. One click. A head start. — 0–5s
Real source Prefill interaction, fictional application. Cursor presses at 0.56s; contact fields fill at 0.75–1.2s. Resume-attached state visible by 1.64s. Keep input fields and result readable. Below: private-answer review, Undo, and Pro Continuous / Guided Autopilot controls. Supporting caption: “You review. You submit.” Guided mode never submits. Smooth lateral dissolve out.
### 2. A résumé for this role. — 5–10s
Source widget label “Generate custom resume”, a prepared résumé sample, real “Download PDF” / “Open in editor” labels. Related source tools below: Analyze with AI, cover letter, screening drafts. Show keyword skills without any fabricated score or claimed uplift. Small visible “AI features have plan limits”. Soft document rise; supporting rows arrive together and hold. No fake processing-speed claim.
### 3. Keep every role in view. — 10–14s
Fictional Junior Data Analyst at Example Corp. “Mentions sponsorship” label is a posting signal, not employer verification. Save to job tracker → Saved. Source tour stages Wishlist / Applied / Interview / Offer; only Wishlist selected. “Saved ≠ applied” short supporting line. Cursor tap at 10.93s; saved state settles by 11.3s.
### 4. Your OPT command center. — 14–20s
Actual extension home UI with fictional case, OPT Apply Dates, OPT Clock, STEM Apply Dates, STEM Clock. Meaning: filing windows, unemployment tracking, and saved case status. Hold screenshot readable. Brand CTA appears at 17.47s: “TrackMyOPT for Chrome” and “trackmyopt.com”. Small source-consistent reminder: “Confirm official guidance with your DSO.” No deadline advice or promises.

Total: 5 + 5 + 4 + 6 = 20 seconds.

## Feature coverage and truth boundaries
Prefill includes saved contact/profile data, résumé attachment, skills/history support and saved answers on supported forms. Settings/private-review/Undo appear within scene 1. Continuous + Guided Autopilot are marked Pro. Scene 2 covers source résumé selection/tailoring, PDF/editor output, fit/keyword review, screening drafts and cover letters. Scene 3 covers posting sponsorship signals and saving jobs/stages. Scene 4 covers case status and all four OPT/STEM tools. Theme, help and feedback are secondary utility controls, not standalone claims. Every implementation is source-evidenced; the film does not claim all job sites work or that every feature is free. All names, email and employer are fictional. No real applicants, counts, outcomes, government endorsement, reviews, or legal guarantees.

## Audio and timing
Bundled `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, 109.96 BPM. Copy preset into composition/assets/music-cues.json. Major locks: save click 10.93s and final CTA 17.47s. Minor interaction 0.56s, completion 1.64s. Readability overrides additional beat snapping. Music 0.30 with 0.4s fade in and fade out over last 1.2s. Warm low-risk click_003 for the two clicks, restrained 0.55. Subtle audio-driven blue rule opacity; no equalizer or generic decorative effects.

## Production
One local browser worker, 30fps, native macOS Hyperframes rendering and hardware VideoToolbox if supported. No Docker or AI model processes. Check runtime/layout/contrast, inspect key frames, render, inspect output frames and audio/duration. Select strongest settled Prefill result for poster; replace frame zero only. No application source changes.
