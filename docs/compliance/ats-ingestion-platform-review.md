# ATS ingestion platform review — Step 0

Reviewed: 2026-08-29. This is an implementation gate, not legal advice. A
public board URL or `robots.txt` is not permission to aggregate, republish, or
otherwise use an ATS's data. `ats_sources.enabled` must remain `false` until a
specific employer board has the listed clearance recorded in the change ticket.

| ATS type | Official API / terms reviewed | Conclusion before enabling a board | Rate-limit rule |
| --- | --- | --- | --- |
| Greenhouse | [Job Board API](https://docs.greenhouse.io/job-board.html); [MSA](https://www.greenhouse.com/uk/master-subscription-agreement) | **Allowed for the initial Greenhouse phase.** TrackMyOPT's documented policy decision is to rely on Greenhouse's public, unauthenticated Job Board **GET** API for third-party career-site/job-aggregation discovery. This is limited to published job data; it excludes application POSTs and applicant data. | TrackMyOPT operating limit: 5 requests/minute and 250/day per board. |
| Lever | [Postings API FAQ](https://hire.lever.co/developer/support); [terms](https://www.lever.co/legal/terms-of-service?hsLang=en-us) | **Conditional, not pre-cleared for aggregation.** The Postings API is publicly accessible for a company's custom jobs site; Lever's service terms are customer/internal-use terms. Use only with employer/Lever permission. | No public limit found; configure a written-limit value per board. |
| Ashby | [Public Job Posting API](https://developers.ashbyhq.com/docs/public-job-posting-api); [dedicated partner feeds](https://developers.ashbyhq.com/docs/dedicated-partner-job-feeds) | **Allowed for the initial Ashby phase.** TrackMyOPT's documented policy decision is to rely on Ashby's public, unauthenticated Job Postings **GET** API for job-board aggregation. This is limited to published job data; it excludes application submission and applicant data. Dedicated partner feeds remain the path for any future expanded program. | TrackMyOPT operating limit: 5 requests/minute and 250/day per board. |
| Workday | [developer portal](https://community.workday.com/); [terms](https://www.workday.com/en-us/legal.html) | **Blocked.** No general third-party public job-board ingestion permission or public rate limit was identified. Use only a contracted Workday integration or explicit written authorization. | Contracted limit only. |
| SmartRecruiters | [Posting API](https://developers.smartrecruiters.com/docs/endpoints); [platform/API policy](https://developers.smartrecruiters.com/docs/the-smartrecruiters-platform); [SAP API Policy](https://help.sap.com/doc/sap-api-policy/latest/en-US/API_Policy_latest.pdf) | **Conditional.** The Posting API exposes public postings without authentication, but the platform says API use is governed by SAP policy and directs customers/partners through credentials. Legal must confirm the intended third-party aggregation use. | No published numeric limit found; use a documented, per-board value until approval defines one. |
| SuccessFactors | [API reference](https://help.sap.com/docs/successfactors-platform/sap-successfactors-api-reference-guide-odata-v2/sap-successfactors-api-reference-guide-odata-v2); [restricted API notice](https://userapps.support.sap.com/sap/support/knowledge/en/3328379) | **Blocked.** The APIs are customer/partner integrations; restricted and non-public beta APIs cannot be used by customers or partners. No public board ingestion basis was identified. | Contracted limit only. |
| Rippling | [API reference](https://developer.rippling.com/documentation/developer-portal/reference/api-reference); [developer terms](https://app.rippling.com/developer/tos) | **Blocked.** API access requires an API key or OAuth token tied to one Rippling company. Use only a company-authorized integration under the applicable developer terms. | Token/contract limit only. |

Before a row is changed to `enabled = true`, the worker must record the
source-specific authorization basis and rate limit in the operational runbook.
For the two initial types above, the public-API policy decision is that basis;
all other ATS types still require the stricter conclusion in this review. No
browser automation, application action, or applicant-data access is part of
this feature.
