# Verified job-description recovery

Implemented locally on 2026-09-22. No Web Store release or web deployment.

## Resolution

1. Read JobPosting JSON-LD (including arrays and @graph) before page text. Match
   declared URLs and Ashby identifiers to the current posting. Do not select an
   arbitrary job from a multi-posting graph.
2. Read cleaned posting containers and same-origin job frames. Remove scripts,
   styles, forms, entered values, navigation and known extension overlays from
   detached clones, without modifying the application.
3. Restore a validated, job-keyed extension-local snapshot (24-hour expiry,
   maximum 50 entries). Ignore the previous unvalidated page session cache.
   Capture overview content during normal widget discovery, before Apply.
4. If unavailable, request the public Workday CXS detail or original listing
   HTML with a timeout. Parse structured metadata and cleaned text, not the SPA
   loading shell. Reject redirects to another job or a careers index.
5. Return unavailable, never arbitrary body text. In the side panel, offer Retry,
   Open job overview (new tab) and Paste description. Require a valid description
   before enabling tailoring. Show the source or "Provided by you".

The same resolver serves resume generation and job analysis. Generated artifacts
carry their job description for answer drafting. Worker checks reject invalid
descriptions before resume reads, scoring/generation calls or screening requests.
Unknown portals, authentication/CORS restrictions, and script-only pages without
readable metadata can still require opening the overview or pasting its text.
No hidden browser, invented AI description, new host permission or form submission
is used. Cross-domain Apply handoffs are not guessed from titles alone.

## Verification

- 567 extension tests passed; TypeScript check and extension build passed.
- Added tests for CSS/loading content, structured metadata and wrong IDs,
  tracking-normalized keys, new-tab restoration, stale/invalid cache entries,
  redirects, private-form exclusion, JSON-LD graphs, late navigation results,
  generation guards, editable recovery and user-edit preservation during Retry.
- Reloaded the local unpacked TrackMyOPT build. Opened a **separate** live Cherry
  application tab. The side panel displayed the actual **4,315-character** role
  description, replacing the previously observed 1,427-character CSS payload.
- Refreshed that test tab: the correct description remained available.
- Replaced only the extension's description textbox with synthetic CSS: tailoring
  became disabled and recovery appeared. Retry restored the real description and
  re-enabled tailoring. Did not click Tailor, Prefill or Submit; no generation
  credit or applicant information was sent during this verification.
- The user's pre-existing Cherry application tab was not refreshed or cleared.

Previously generated resumes are not rewritten or deleted. A resume tailored
against the old CSS payload should be regenerated from a trusted base resume and
the recovered description, then reviewed before use. Snapshot extraction failures
("Reading fields for autofill: not available") are a separate remaining issue.
