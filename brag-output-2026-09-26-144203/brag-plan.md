# TrackMyOPT Chrome Web Store walkthrough

A 90-second, 1920 × 1080 Chrome extension demo. An animated brand introduction and closing frame 42 source-UI scenes inside a persistent laptop presentation. Fictional demo data and illustrative service responses are used.

The opening introduces TrackMyOPT for Chrome. At 4.5 seconds, the laptop fills the frame and the original feature walkthrough begins with a real prefill interaction. The closing thanks viewers and invites them to start using TrackMyOPT. The cool-blue background, aluminum laptop, logo, and product palette stay consistent.

| Time | Chapter | Real screen | Action |
|---|---|---|---|
| 0.0–4.5 | INTRODUCING | TrackMyOPT icon and extension home | Your Chrome extension |
| 4.5–5.7 | APPLICATION TOOLS | job-before | Your profile → the open application |
| 5.7–7.3 | APPLICATION TOOLS | job-filled | Prefill → review |
| 7.3–9.5 | EXTENSION POPUP | home | Chrome toolbar → TrackMyOPT → OPT Tools |
| 9.5–10.6 | 01 / OPT CLOCK | opt-clock-empty | OPT Tools → OPT Clock |
| 10.6–11.8 | 01 / OPT CLOCK | opt-calendar | OPT EAD start date |
| 11.8–13.4 | 01 / OPT CLOCK | opt-clock-filled | OPT EAD start date → Save & Go |
| 13.4–16.2 | 01 / OPT CLOCK | opt-clock-result | Saved date → employment timeline |
| 16.2–18.7 | 01 / OPT CLOCK | opt-reminders | Scroll down → Daily reminders |
| 18.7–20.0 | 02 / STEM CLOCK | stem-clock-nav | OPT Tools → STEM Clock |
| 20.0–21.1 | 02 / STEM CLOCK | stem-clock-empty | STEM EAD start date |
| 21.1–22.7 | 02 / STEM CLOCK | stem-clock-filled | STEM EAD start date → Save & Go |
| 22.7–25.6 | 02 / STEM CLOCK | stem-clock-result | Saved date → STEM employment timeline |
| 25.6–26.8 | 03 / OPT APPLY DATES | opt-filing-nav | OPT Tools → OPT Apply Dates |
| 26.8–28.0 | 03 / OPT APPLY DATES | opt-filing-empty | Program end date + DSO recommendation |
| 28.0–29.7 | 03 / OPT APPLY DATES | opt-filing-filled | Dates → Calculate Filing Window |
| 29.7–32.6 | 03 / OPT APPLY DATES | opt-filing-result | Filing window → countdown |
| 32.6–33.8 | 04 / STEM APPLY DATES | stem-filing-nav | OPT Tools → STEM Apply Dates |
| 33.8–35.0 | 04 / STEM APPLY DATES | stem-filing-empty | Current OPT expires |
| 35.0–36.8 | 04 / STEM APPLY DATES | stem-filing-filled | Dates → Calculate Filing Window |
| 36.8–39.5 | 04 / STEM APPLY DATES | stem-filing-result | Filing window → countdown |
| 39.5–41.7 | CASE STATUS | home | Extension popup → Case status |
| 41.7–43.1 | 05 / JOB APPLICATIONS | job-before | Job posting → TrackMyOPT sidebar |
| 43.1–45.3 | 05 / JOB APPLICATIONS | job-filled | You review and submit the application |
| 45.3–47.5 | 05 / JOB APPLICATIONS | job-save | Job posting → sponsorship signal |
| 47.5–48.9 | 06 / JOB TRACKER | job-save | Sidebar → Save to job tracker |
| 48.9–51.3 | 06 / JOB TRACKER | job-status | Application Status → Wishlist or Applied |
| 51.3–53.2 | 06 / JOB TRACKER | job-saved | Wishlist → View in tracker |
| 53.2–54.8 | 07 / RESUME ANALYSIS | job-analyze | Sidebar → Analyze with AI |
| 54.8–57.6 | 07 / RESUME ANALYSIS | job-analysis | Analyze with AI → keyword review |
| 57.6–58.9 | 08 / TAILORED RÉSUMÉ | job-resume | Sidebar → Generate custom resume |
| 58.9–60.5 | 08 / TAILORED RÉSUMÉ | sidepanel-top | Side panel → Job description |
| 60.5–63.3 | 08 / TAILORED RÉSUMÉ | sidepanel-create | Résumé + template → Create tailored résumé |
| 63.3–64.7 | 08 / TAILORED RÉSUMÉ | sidepanel-running | Create → progress |
| 64.7–67.1 | 08 / TAILORED RÉSUMÉ | sidepanel-result | Done → Download PDF / Open in editor |
| 67.1–68.7 | 09 / COVER LETTER | resume-ready | In-page résumé result → Generate cover letter |
| 68.7–71.4 | 09 / COVER LETTER | cover-letter | Cover letter → Edit → Save |
| 71.4–74.0 | 10 / SAVED ANSWERS | private-answers | Sidebar → Private answers |
| 74.0–75.8 | 11 / PREFILL SETTINGS | home-settings | Popup → Job application → Prefill mode |
| 75.8–77.6 | 11 / PREFILL SETTINGS | continuous | Prefill mode → Continuous |
| 77.6–80.1 | 11 / PREFILL SETTINGS | guided | Guided Autopilot → enabled |
| 80.1–82.1 | 12 / SIDEBAR SETTINGS | widget-settings | Sidebar → Settings |
| 82.1–84.5 | TRACKMYOPT FOR CHROME | home | trackmyopt.com |
| 84.5–90.0 | THANKS FOR WATCHING | TrackMyOPT icon and extension home | Start using TrackMyOPT |

The source captures come from the actual extension components. A local harness supplies fictional profile, account, calculator, tracker, and AI-service responses. Prefill executes the actual runPrefill engine. Date calculations run in product code at a fixed reference date. Service waits are shortened and labeled. The video does not demonstrate a live account or claim immigration or hiring outcomes. The résumé side panel and in-page cover-letter flow are distinct surfaces.
