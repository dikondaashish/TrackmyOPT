# Case status UI refinement

## Scope

Implements the approved layout: status first, comparisons next, detailed charts
expandable. Keeps the existing palette and light/dark themes.

- Actual USCIS status is the summary heading, with receipt details secondary.
- Compact definition-list facts replace repeated statistic tiles.
- Milestones and detailed comparison charts are available through native disclosures.
- Next-step guidance and critical warnings remain visible; consultation promotion
  moves below the case information rather than interrupting the status summary.
- Chart tabs support arrow keys, Home/End, focus movement, and instance-safe IDs.
- Copy feedback only reports success after clipboard access succeeds.
- Date-only filing records no longer shift to the preceding day in western time zones.
- Case switching remounts case-specific summary feedback and comparison navigation.
- PRODUCT.md records the approved design direction for future work.

## Validation

- Web suite: 215 files, 1,313 tests passed.
- Targeted case-status/STEM tests: 53 passed under America/New_York.
- STEM synchronization suite: 23 passed under UTC. Its previously failing CI
  assertion now waits for asynchronous saved-date calculations, not just form rendering.
- Targeted ESLint, web TypeScript, and production build passed.
- React Doctor: 92/100 before and after on the same five production components.
  Existing complexity, component-size, and default-array warnings remain unchanged.
- Browser verification uses the synthetic, network-isolated preview script:
  desktop light mode, 375px dark mode, pending/RFE/approved headings, empty free-plan
  data, disclosure expansion, keyboard tab focus, and mobile heatmap containment.
  At 375px, document scroll width remained 375px with the heatmap open.

No database migration, case mutation, billing change, or legal-rule change.
Local verification is not evidence of a completed production deployment.
