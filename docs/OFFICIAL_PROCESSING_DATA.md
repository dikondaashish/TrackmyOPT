# Official processing-time source maintenance

## Verified September 23, 2026

Observed directly in the official USCIS browser tool, not a third-party estimate:

- Source: https://egov.uscis.gov/processing-times
- Form: I-765, Application for Employment Authorization.
- Category: Based on a request by a qualified F-1 academic student [(c)(3)].
- Office: Service Center Operations (SCOPS), the only office offered for this category.
- Result: 80% of completed cases within **5 months**.
- Measurement: adjudicated cases over the past six months, per the tool's explanation.
- Publication date: not displayed. Do not substitute the observation date.
- This combined category is not an OPT-only or STEM-only cohort, not a premium-processing deadline, and not an individual approval prediction.

## Maintenance procedure

The data is human-verified and versioned; it is **not an automatic USCIS numeric feed**. The official website can deny server-side requests. Do not bypass its access protections or substitute community figures.

The `Official processing data freshness` GitHub workflow runs every Monday at 08:00 UTC. It fails once verification is 21 days old, leaving a nine-day review window before the UI hides the figure at 30 days. Repository owners should retain GitHub Actions failure notifications.

1. Open the source above in the browser.
2. Choose the exact form, category and office above; check for changed categories/offices.
3. Click **Get processing time**. Read the displayed result and methodology.
4. Update `apps/web/lib/case-status/official-processing-times.ts` only with verified values and today's `checkedDate`. Keep `publishedDate: null` unless USCIS provides it explicitly.
5. Update this evidence record, run the snapshot tests and freshness script, and publish through the repository's normal verified workflow.

If the source is inaccessible, leave the last verification unchanged. A failed source check must never reset its age. After 30 days the page shows an unavailable state and the official link.
