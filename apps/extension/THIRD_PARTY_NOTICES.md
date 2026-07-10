# Third-Party Notices — TrackMyOPT Chrome Extension

This file records third-party software that the TrackMyOPT extension is derived
from or incorporates, along with the applicable licenses and notices.

---

## AutoApplyMax

- **Source:** https://github.com/Azoo92i/AutoApplyMax
- **Copyright:** © 2024 AutoApplyMax Contributors
- **Upstream license:** GNU Affero General Public License v3.0 (AGPL-3.0)
- **Upstream license text:** [`licenses/AutoApplyMax-LICENSE.txt`](./licenses/AutoApplyMax-LICENSE.txt)

### What TrackMyOPT uses

The LinkedIn Easy Apply prefill feature was written from scratch for TrackMyOPT.
Its multilingual form-field label-matching heuristics (the regex vocabulary that
recognizes email/name fields across EN/FR/ES/DE/IT) are **informed by** the
field-matching logic in AutoApplyMax's `content-simple.js`.

TrackMyOPT does **not** incorporate AutoApplyMax's control flow, its auto-submit
behavior, its job-card iteration loop, or its detection-evasion / "human-like
delay" logic. TrackMyOPT's implementation is fill-only and never submits.

Derived files carry a provenance header:

- `src/easy-apply-matchers.ts`

### License grant

AutoApplyMax is published under AGPL-3.0. Zyene, Inc. uses this material under a
**separate written license agreement** with the AutoApplyMax author that grants
permission to use and integrate the code into Zyene's commercial product and
overrides the AGPL-3.0 copyleft obligations (including the AGPL §13 network-use
clause). That agreement — not the AGPL — governs Zyene's use.

> This notice is provenance and attribution documentation, not legal advice.
> The written agreement on file is the controlling instrument; confirm its scope
> with counsel before distribution.
