import { defineArticle, source } from './shared';

const communitySources = [
  {
    label: 'TrackMyOPT Community Timeline Methodology',
    publisher: 'TrackMyOPT',
    url: 'https://www.trackmyopt.com/features/community',
  },
  source.opt,
  source.pp,
];

export const dataResearchArticles = [
  defineArticle({
    slug: 'monthly-opt-ead-processing-times-receipt-date',
    title:
      'Monthly OPT EAD Processing Times by Receipt Date: TrackMyOPT Community Data',
    description:
      'A transparent August 2026 snapshot of anonymized community timelines, grouped by receipt month—with sample sizes, filters, and the limits of self-reported data.',
    category: 'TrackMyOPT Data',
    tags: ['OPT Processing Time', 'EAD', 'Receipt Date', 'Community Data'],
    readTime: '11 min read',
    cta: 'community',
    directAnswer:
      'In the permissioned partner snapshot analyzed on August 11, 2026, the feed contained 2,834 anonymized records and 1,607 records with both application and approval dates. Among completed, non-premium Initial OPT cases, the median application-to-approval time was 72 calendar days for January receipts (n=6), 74 days for February (n=123), and 96 days for March (n=248). April had only five completed non-premium cases, so its 130-day median is too thin to treat as a reliable benchmark.',
    keyTakeaways: [
      'Group by receipt month; mixing months hides queue changes.',
      'Always publish n beside a median.',
      'Recent months are right-censored because many ordinary cases are still pending.',
    ],
    sections: [
      {
        heading: 'The August 11 Snapshot',
        paragraphs: [
          'This analysis uses an anonymized public partner feed that TrackMyOPT has written permission to ingest. We removed rows without both an application and approval date for the completed-case calculation and separated Initial OPT from STEM OPT and premium from non-premium cases.',
          "The meaningful non-premium Initial OPT cohorts in this snapshot were February and March. January's n=6 and April's n=5 are disclosed but should not drive planning. May through July ordinary cases did not yet have enough completed records in the feed—an expected form of right-censoring, not proof that no decisions occurred.",
        ],
        bullets: [
          'January 2026: median 71.5 days, n=6',
          'February 2026: median 74 days, n=123',
          'March 2026: median 96 days, n=248',
          'April 2026: median 130 days, n=5—insufficient cohort',
        ],
      },
      {
        heading: 'How to Read a Completed-Case Median',
        paragraphs: [
          'A median is the middle completed duration. It is less distorted than an average by a few very long cases, but it still excludes pending cases. For recent receipt months, fast approvals appear first while slow cases remain open, making early medians look artificially short.',
          'Do not compare a pending personal case to a completed median as if day 75 creates an entitlement to a decision. Use the official USCIS inquiry framework for case-action eligibility.',
        ],
        note: 'The newest month often looks fastest for the wrong reason: only its fastest cases have finished. Wait for cohort maturity before declaring a trend.',
      },
      {
        heading: 'How TrackMyOPT Uses the Data',
        paragraphs: [
          'Community estimates are shown as planning ranges beside—not in place of—official USCIS case status. TrackMyOPT matches case type, premium choice, timing, and usable service-center information where available, while suppressing weak cohorts.',
          'No receipt numbers are stored in the community timeline table, and these aggregates are not derived from private unemployment or profile data.',
        ],
      },
    ],
    checklist: [
      'Compare your case with the same case type and premium status.',
      'Check cohort size and receipt month.',
      'Keep USCIS status as the official record.',
      'Plan travel and employment with conservative buffers.',
    ],
    mistakes: [
      'Combining Initial OPT and STEM extension cases.',
      'Treating a five-case median as predictive.',
      'Ignoring still-pending cases in recent months.',
    ],
    faq: [
      {
        question: 'Are these official USCIS processing times?',
        answer:
          'No. They are anonymized self-reported community timelines for planning; USCIS remains the official source.',
      },
      {
        question: 'Why are recent months missing ordinary approvals?',
        answer:
          'Many cases are still pending, so a completed-case cohort would be incomplete and biased.',
      },
      {
        question: 'Does 96 days mean my March case should be approved?',
        answer:
          'No. It is a historical median for one self-reported cohort, not a deadline or guarantee.',
      },
    ],
    dataNote:
      'Snapshot cutoff: August 11, 2026. Feed queried: 2,834 anonymized partner records; 1,607 had usable application and approval dates. Monthly figures above use completed Initial OPT, non-premium cases. Durations are calendar-day differences. Small cohorts remain visible only to explain why we do not rank them. Partner data is self-reported/Reddit-sourced and may contain reporting errors.',
    sources: communitySources,
    related: [
      {
        label: 'OPT premium-processing timeline data',
        href: '/blog/opt-premium-processing-real-case-timelines-2026',
      },
      {
        label: 'USCIS processing-time guide',
        href: '/blog/opt-processing-time-2026',
      },
      {
        label: 'USCIS case status tracker',
        href: '/blog/uscis-case-status-tracking-guide',
      },
    ],
  }),
  defineArticle({
    slug: 'opt-premium-processing-real-case-timelines-2026',
    title:
      'OPT Premium Processing: Approval, Card Production, and Delivery Times from Real 2026 Cases',
    description:
      'An anonymized 2026 community snapshot separates premium-request-to-approval, approval-to-card-production, and card-production-to-delivery instead of calling everything ‘processing time.’',
    category: 'TrackMyOPT Data',
    tags: [
      'OPT Premium Processing',
      'Card Production',
      'EAD Delivery',
      'Community Timelines',
    ],
    readTime: '11 min read',
    cta: 'community',
    directAnswer:
      'In an August 11, 2026 snapshot of up to 1,000 completed 2026 premium-tagged partner cases, 992 usable rows with a reported premium-request date had a median of 42 calendar days from premium request to approval and an 80th percentile of 59 days. Among usable downstream rows, approval to card production had a 6-day median (n=287), and card production to delivery had a 3-day median (n=206). Self-reported dates can be wrong, and USCIS measures its premium target in business days and can pause the clock after certain notices.',
    keyTakeaways: [
      'Premium adjudication and physical EAD delivery are separate clocks.',
      'Community calendar days should not be compared directly to USCIS business-day commitments.',
      "A decision does not authorize work before the EAD's valid start date or where the physical card is required.",
    ],
    sections: [
      {
        heading: 'Three Clocks, Not One',
        paragraphs: [
          'Applicants often say ‘my premium case took 50 days’ without identifying the start event. This snapshot calculates from the reported premium-processing request date to approval, then separately calculates approval to card production and production to delivery.',
          'That distinction matters when a student upgrades weeks after the original I-765 filing. Filing-to-approval duration includes the pre-upgrade wait and does not measure premium service.',
        ],
        bullets: [
          'Premium request to approval: median 42 calendar days; p80 59; n=992',
          'Approval to card production: median 6 days; p80 7; n=287',
          'Card production to delivery: median 3 days; p80 5; n=206',
        ],
      },
      {
        heading: 'Why the Numbers Need Guardrails',
        paragraphs: [
          'The feed is self-reported. Some users may enter the receipt date rather than the upgrade date, omit an RFE, or update delivery late. We removed malformed dates and stage durations below zero or above 120 days, but cleaning cannot verify every event.',
          'USCIS premium processing for eligible I-765 categories uses a business-day adjudicative-action period. A request for evidence or fraud inquiry can affect the clock under the governing rules.',
        ],
        note: 'Use community stages to plan buffers, not to calculate the day USCIS ‘must’ approve. The official receipt and Form I-907 rules control.',
      },
      {
        heading: 'Planning After Approval',
        paragraphs: [
          "Keep the mailing address current, monitor the case and USPS tracking when available, and do not assume an approval notice is the EAD card. If the card is not delivered, use USCIS's non-delivery procedures and preserve address-change confirmation.",
        ],
      },
    ],
    checklist: [
      'Record the I-907 receipt date separately from the I-765 date.',
      'Track approval, production, mailing, and delivery as separate milestones.',
      'Confirm the EAD start date before working.',
      'Use official USCIS channels for missed premium commitments or non-delivery.',
    ],
    mistakes: [
      'Counting from the original OPT receipt as the premium clock.',
      'Comparing calendar days to a business-day target.',
      'Starting work because an online status says approved.',
    ],
    faq: [
      {
        question: 'Does premium processing include card delivery?',
        answer:
          'No. Premium processing covers specified adjudicative action; production and postal delivery occur afterward.',
      },
      {
        question: 'Why is the community median 42 calendar days?',
        answer:
          'Thirty business days can span roughly six calendar weeks, and self-reported records may include imperfect dates or paused clocks.',
      },
      {
        question: 'Are all 1,000 rows verified USCIS cases?',
        answer:
          'No. They are anonymized self-reported partner records, cleaned for date plausibility but not independently verified with receipt numbers.',
      },
    ],
    dataNote:
      'Snapshot cutoff: August 11, 2026. The query returned the first 1,000 completed 2026 premium-tagged records; 992 had usable premium-request and approval dates after excluding malformed and out-of-range stage values. Downstream stage sample sizes are smaller because many records do not report production or delivery. These results are descriptive, not causal or official.',
    sources: communitySources,
    related: [
      {
        label: 'Monthly OPT EAD community data',
        href: '/blog/monthly-opt-ead-processing-times-receipt-date',
      },
      {
        label: 'Is OPT premium processing worth it?',
        href: '/blog/opt-premium-processing-fee-increase-1780',
      },
      {
        label: 'EAD card delivery guide',
        href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
      },
    ],
  }),
  defineArticle({
    slug: 'f1-221g-social-media-review-tracker-consulate-2026',
    title:
      'F-1 221(g) Social Media Review Tracker by Consulate: Anonymous 2026 Case Data',
    description:
      'How TrackMyOPT will publish consulate-level 221(g) social-media review trends without exposing applicants or manufacturing success-rate claims from tiny samples.',
    category: 'Research Launch',
    tags: ['221(g) Tracker', 'Social Media Review', 'Consulate Data'],
    readTime: '9 min read',
    cta: 'community',
    statusNote:
      'TrackMyOPT does not yet have a publication-quality, consented consulate-level cohort for 2026. This page publishes the collection and suppression methodology now; it intentionally does not display invented approval rates or wait times.',
    directAnswer:
      "A trustworthy 221(g) tracker must separate interview post, visa class, document request, online-presence review, applicant-action date, administrative-processing end, and final outcome. TrackMyOPT will not publish consulate statistics until a cohort meets a minimum sample threshold and privacy review. Individual stories and forum posts can explain possible experiences, but they cannot establish a consulate's approval rate.",
    keyTakeaways: [
      '‘221(g)’ includes multiple workflows that must not be pooled blindly.',
      'Consulate rankings need mature cohorts and outcome dates.',
      'No applicant handle, passport, case number, DS-160 number, or social profile belongs in the public dataset.',
    ],
    sections: [
      {
        heading: 'The Data Model We Will Use',
        paragraphs: [
          'A case record should include the interview month and post, whether documents were requested, whether the applicant was told online-presence review was involved, whether the passport was retained, the date the applicant completed any requested action, and the eventual issued/refused/withdrawn outcome.',
          'Free-text notes must be redacted and converted into categories before publication.',
        ],
        bullets: [
          'Consulate and month—not exact appointment time',
          '221(g) subtype and applicant action required',
          'Processing duration from the correct start event',
          'Outcome with a maturity cutoff',
          'No direct identifiers',
        ],
      },
      {
        heading: 'Minimum Sample and Suppression Rules',
        paragraphs: [
          'TrackMyOPT will suppress consulate-by-month cells below a minimum cohort rather than invite users to identify a person from a rare fact pattern. Open cases will be shown separately from resolved cases, and recent cohorts will carry a right-censoring warning.',
          'A median will be displayed with n and an interquartile range; no ‘approval probability’ will appear without enough mature outcomes.',
        ],
        note: 'Publishing ‘no data yet’ is more valuable than a precise-looking number built from three stories.',
      },
      {
        heading: 'What Applicants Can Do Today',
        paragraphs: [
          'Use the official 221(g) letter, embassy instructions, and State Department guidance. Preserve dates and responses, tell the DSO when a start date is at risk, and never share sensitive identifiers in a public tracker.',
        ],
      },
    ],
    checklist: [
      'Save the 221(g) sheet and exact action date.',
      'Use official embassy submission channels.',
      'Remove identifiers before sharing a timeline.',
      'Treat community wait times as context only.',
    ],
    mistakes: [
      'Calling every 221(g) a social-media case.',
      'Ranking a consulate from tiny samples.',
      'Publishing applicant handles or case numbers.',
    ],
    faq: [
      {
        question: 'Where are the consulate wait-time numbers?',
        answer:
          'They are intentionally withheld until a consented, mature cohort passes minimum sample and privacy checks.',
      },
      {
        question: 'Can a CEAC update prove social-media review?',
        answer:
          'No. The case-specific 221(g) communication is a better source; CEAC usually does not identify the internal review type.',
      },
      {
        question: 'Will TrackMyOPT guarantee anonymity?',
        answer:
          'The design removes direct identifiers and suppresses small cells, but no public submission should include secrets or identifying documents.',
      },
    ],
    dataNote:
      'This is a preregistered publication method, not a results page. TrackMyOPT will label the collection window, consent basis, inclusion rules, minimum n, unresolved-case share, and update date before any consulate comparison appears.',
    sources: [
      source.visaDenials,
      {
        label: 'F-1 Visa Social Media Screening',
        publisher: 'TrackMyOPT source review',
        url: 'https://www.trackmyopt.com/blog/f1-visa-social-media-screening-2026',
      },
    ],
    related: [
      {
        label: '221(g) administrative processing',
        href: '/blog/f1-visa-221g-administrative-processing-2026',
      },
      {
        label: 'Refused vs denied explained',
        href: '/blog/f1-visa-refused-denied-administrative-processing',
      },
      {
        label: 'F-1 social media screening',
        href: '/blog/f1-visa-social-media-screening-2026',
      },
    ],
  }),
  defineArticle({
    slug: 'h1b-sponsors-international-new-graduates-2026-2027',
    title:
      'H-1B Sponsors Hiring International New Graduates in 2026–2027: TrackMyOPT Filing Data',
    description:
      'Use 25,000+ employer profiles and 250,000+ LCA records to identify sponsorship history and entry-level signals—without confusing a historical filing with a live job opening.',
    category: 'TrackMyOPT Data',
    tags: [
      'H-1B Sponsors',
      'New Graduates',
      'LCA Data',
      'International Students',
    ],
    readTime: '12 min read',
    cta: 'sponsors',
    directAnswer:
      "TrackMyOPT's sponsor database covers more than 25,000 employer profiles and 250,000 LCA filing records, with fields for recent filing volume, common roles, work locations, wage data, entry-level signals, career links, and sponsorship trend. Use it to build a target list, then confirm a current role on the employer's own careers page. An LCA is evidence of historical sponsorship activity—not proof that a company is hiring now or will sponsor you.",
    keyTakeaways: [
      'Recent new-employment filings are a stronger signal than lifetime totals alone.',
      'Role and location fit matter as much as company name.',
      'A verified careers link and current job description are required before calling an employer ‘hiring.’',
    ],
    sections: [
      {
        heading: 'A Better Sponsor Screen for New Graduates',
        paragraphs: [
          'Start with employers that show recent activity, meaningful new-employment filings, roles matching your degree, and wages consistent with entry-level positions. Then examine whether the same location and occupation repeat across years.',
          'A huge employer can have thousands of filings but few roles relevant to your field. A smaller employer with consistent filings in your occupation may be a more useful target.',
        ],
        bullets: [
          'Recent filing year and trend',
          'New-employment share',
          'Common sponsored job titles',
          'Worksite geography and wage level',
          'Verified employer career page',
        ],
      },
      {
        heading: 'From Data Signal to Real Application',
        paragraphs: [
          "Open the employer's own careers page, confirm the requisition is active, and read sponsorship language carefully. Tailor the resume to the role without changing facts. Track the application and follow-up date so the research becomes action.",
          'Ask sponsorship questions at an appropriate stage; do not claim that TrackMyOPT data binds the employer to sponsor.',
        ],
        note: 'Build three lists: proven recent sponsors, promising adjacent employers, and no-recent-signal employers. Spend most time on list one while still verifying each opening.',
      },
      {
        heading: 'What the Database Cannot Tell You',
        paragraphs: [
          'LCA certification is not the same as an approved H-1B petition, an accepted offer, or an open job. Corporate entities, acquisitions, remote worksites, and staffing relationships also require context. Use the record as evidence, not a guarantee.',
        ],
      },
    ],
    checklist: [
      'Filter by role, location, recent filings, and entry-level signal.',
      "Verify the job on the employer's official careers site.",
      "Match the resume to the job's actual requirements.",
      'Track the recruiter response and sponsorship conversation.',
    ],
    mistakes: [
      'Calling historical LCA data a live hiring list.',
      'Applying to unrelated roles because the company has high totals.',
      'Ignoring legal entity and worksite differences.',
    ],
    faq: [
      {
        question: 'Does an LCA mean the employer will sponsor me?',
        answer:
          'No. It shows a labor-condition filing for a position; the employer still controls hiring and petition decisions.',
      },
      {
        question: 'What is an entry-level signal?',
        answer:
          'It is an indicator based on wage levels, new-employment filings, and role patterns—not a promise that a role accepts new graduates.',
      },
      {
        question: 'How current is the TrackMyOPT sponsor data?',
        answer:
          'The product currently advertises quarterly refreshes and Q4 2025 as the latest complete dataset; users should verify live openings in 2026.',
      },
    ],
    dataNote:
      "TrackMyOPT's product page reports 25,000+ sponsor profiles and 250,000+ LCA filings, sourced from Department of Labor disclosure data and enriched with career links and employer signals. The article deliberately distinguishes filing history from real-time recruiting and does not publish an unsupported ‘currently hiring’ ranking.",
    sources: [
      source.dolDisclosure,
      {
        label: 'TrackMyOPT H-1B Sponsor Research',
        publisher: 'TrackMyOPT',
        url: 'https://www.trackmyopt.com/features/sponsors',
      },
    ],
    related: [
      {
        label: 'How to find H-1B sponsors',
        href: '/blog/top-h1b-sponsor-companies-2026',
      },
      {
        label: 'OPT job-search strategy',
        href: '/blog/leverage-job-search-trackmyopt-resume-generator',
      },
      {
        label: 'ATS resume guide',
        href: '/blog/ats-resume-international-students-2026',
      },
    ],
  }),
  defineArticle({
    slug: 'common-opt-deadline-mistakes-trackmyopt-audit',
    title:
      'The Most Common OPT Deadline Mistakes: An Anonymous TrackMyOPT User Audit',
    description:
      'The seven deadline failure modes TrackMyOPT is designed to catch—and the privacy-safe audit method required before publishing user prevalence percentages.',
    category: 'TrackMyOPT Research',
    tags: ['OPT Deadlines', 'User Audit', 'Compliance', 'I-765'],
    readTime: '10 min read',
    cta: 'opt-timeline',
    statusNote:
      'This guide identifies deadline failure modes from the OPT workflow and product support taxonomy. TrackMyOPT has not published private user-event prevalence or fabricated percentages. A future measured audit will require consent/authorized use, minimum cohorts, and privacy review.',
    directAnswer:
      'The highest-risk OPT deadline mistakes cluster around seven handoffs: requesting the DSO recommendation too early, missing the 30-day I-20 filing clock, filing outside the 90/60-day window, choosing an impossible EAD start date, overlooking USCIS notices, starting work before authorization, and failing to report employment or address changes. The practical solution is one dated timeline backed by the I-20, receipt, EAD, and employment records—not scattered calendar reminders.',
    keyTakeaways: [
      'Most deadline failures occur between two systems—school/SEVIS and USCIS—not on a single form field.',
      'A reminder should name the evidence and responsible person, not only a date.',
      'TrackMyOPT calculations organize records but do not replace DSO confirmation.',
    ],
    sections: [
      {
        heading: 'The Seven Failure Modes',
        paragraphs: [
          'The first three occur before filing: a stale DSO recommendation, a submission outside the broad post-completion window, or a filing prepared from an incorrect program end date. The next two occur during adjudication: missing an account notice or assuming a correction can wait for an RFE. The last two occur after approval: working outside EAD dates or failing to report employment and unemployment accurately.',
          'These categories are a process audit, not a claim that a stated percentage of TrackMyOPT users made each mistake.',
        ],
        bullets: [
          'Stale OPT I-20 recommendation',
          'Wrong overall filing window',
          'Incorrect requested EAD start date',
          'Missed biometrics/RFE/account notice',
          'Work before the EAD start date',
          'Late employer/address reporting',
          'Untracked unemployment between jobs',
        ],
      },
      {
        heading: 'Build a Deadline System That Survives Stress',
        paragraphs: [
          'For each deadline, store the legal trigger, date, owner, evidence, early-warning date, and completion proof. For example: ‘DSO recommendation entered March 3; I-765 target March 20; absolute recommendation deadline April 1; owner student; proof USCIS submission receipt.’',
          'Use two reminders before every hard date and a document upload checkpoint after completion.',
        ],
        note: 'A deadline without its trigger is dangerous. ‘File by April 1’ is weaker than ‘USCIS must receive I-765 within 30 days of the March 3 SEVIS recommendation.’',
      },
      {
        heading: 'How a Future Anonymous Audit Will Work',
        paragraphs: [
          'A measured audit should use de-identified event categories, suppress small cells, exclude test accounts, document the observation window, and publish n with every percentage. Private documents, receipt numbers, names, schools, and employers should not appear in the report.',
        ],
      },
    ],
    checklist: [
      'Record program end and DSO recommendation dates separately.',
      'Set target dates before legal maximums.',
      'Save proof after every filing and report.',
      'Recalculate unemployment after each employment change.',
    ],
    mistakes: [
      'Treating the requested EAD date as guaranteed.',
      'Using one reminder on the final day.',
      'Publishing user percentages without a documented cohort.',
    ],
    faq: [
      {
        question: 'Is this based on private TrackMyOPT accounts?',
        answer:
          "No prevalence claims are made. The categories come from the required OPT workflow and the product's support/compliance design.",
      },
      {
        question: 'Will TrackMyOPT file or report for me?',
        answer:
          'No. It helps organize dates, reminders, and records; the student remains responsible for school and government submissions.',
      },
      {
        question: 'What is the most dangerous pre-filing deadline?',
        answer:
          'The DSO recommendation age is easy to miss because it overlaps the broader filing window.',
      },
    ],
    dataNote:
      'No personal user data was analyzed for the published version. Before adding measured prevalence, TrackMyOPT should document purpose and lawful basis, exclude direct identifiers, aggregate only sufficiently large cohorts, set a retention period, and obtain privacy/legal review.',
    sources: [source.i765, source.opt],
    related: [
      {
        label: 'OPT I-20 30-day rule',
        href: '/blog/opt-i20-30-day-rule-i765-deadline',
      },
      {
        label: 'OPT application checklist',
        href: '/blog/opt-application-checklist-2026',
      },
      {
        label: '90-day unemployment rule',
        href: '/blog/90-day-unemployment-rule-opt',
      },
    ],
  }),
  defineArticle({
    slug: 'longest-opt-job-searches-by-major',
    title:
      'Which Majors Have the Longest OPT Job Searches? TrackMyOPT Unemployment Data by Degree Field',
    description:
      'A privacy-first framework for measuring job-search duration by degree field—and why TrackMyOPT will not rank majors from incomplete or identifiable user histories.',
    category: 'TrackMyOPT Research',
    tags: ['OPT Job Search', 'Major', 'Unemployment Data', 'Degree Field'],
    readTime: '10 min read',
    cta: 'resume',
    statusNote:
      'TrackMyOPT does not yet have a publication-ready, consented cohort large enough to rank degree fields. This page provides the measurement framework and job-search actions now; it does not invent a ‘longest major’ leaderboard.',
    directAnswer:
      'A credible major-level comparison needs the EAD start date, first qualifying employment date, degree-field taxonomy, graduation season, degree level, location, and whether the student was still searching at the data cutoff. A simple average of users who found jobs excludes unresolved searches and can reverse the ranking. TrackMyOPT will publish results only after minimum-cohort, censoring, and privacy checks; no defensible longest-major claim is available today.',
    keyTakeaways: [
      'Job-search duration is a time-to-event problem, not a simple average.',
      'Users still searching must remain in the analysis as censored observations.',
      'Degree fields should be broad enough to protect identity and comparable enough to be useful.',
    ],
    sections: [
      {
        heading: 'What a Valid Study Must Measure',
        paragraphs: [
          'The outcome should be days from the EAD start or another clearly defined search start to the first qualifying job, with users still searching included at the cutoff. Grouping must account for season, degree level, location, and economic conditions.',
          'Small majors should be combined into broader CIP families or suppressed. A rare degree plus school and month can identify a person even without a name.',
        ],
        bullets: [
          'Defined start event',
          'Qualifying-employment event',
          'Censored open searches',
          'Degree/CIP family',
          'Graduation cohort and location',
          'Minimum sample threshold',
        ],
      },
      {
        heading: 'Why Naive Rankings Mislead',
        paragraphs: [
          'If only successful job seekers report an end date, the ‘average’ ignores the longest searches. Majors with more active users can look slower merely because they report more complete histories. Premium career-service use can also confound results.',
          'A future report should use median time-to-event or survival curves, publish confidence intervals, and avoid causal claims.',
        ],
        note: 'The honest answer to ‘which major is worst?’ may be ‘we do not have a mature comparable cohort.’ That protects students from choosing a degree based on noise.',
      },
      {
        heading: 'What Students Can Do Without a Ranking',
        paragraphs: [
          'Track the unemployment clock, build a role list tied to the degree, widen geography where practical, research sponsor history, and tailor the resume to each job family. Review progress weekly using applications, interviews, and response rate—not only days elapsed.',
        ],
      },
    ],
    checklist: [
      'Define target roles that clearly relate to the degree.',
      'Track applications and interview conversion weekly.',
      'Research sponsor history and verified openings.',
      'Keep evidence of qualifying employment and degree relationship.',
    ],
    mistakes: [
      'Choosing a major based on an unsupported viral ranking.',
      'Ignoring students still searching.',
      'Publishing small degree cohorts that can identify users.',
    ],
    faq: [
      {
        question: 'Which major has the longest OPT job search today?',
        answer:
          'TrackMyOPT does not yet have a defensible privacy-safe cohort to make that ranking.',
      },
      {
        question: 'Why not average completed searches?',
        answer:
          'It excludes students who are still searching and systematically makes recent or difficult cohorts look faster.',
      },
      {
        question: 'Will TrackMyOPT use private unemployment histories?',
        answer:
          'Any future publication needs a documented lawful/consented basis, de-identification, aggregation, small-cell suppression, and privacy review.',
      },
    ],
    dataNote:
      'No private employment or profile records were used for a public major ranking. A future study should preregister cohort dates, inclusion criteria, degree taxonomy, censoring method, minimum n, and suppression rules before analysts view results.',
    sources: [
      source.opt,
      {
        label: 'TrackMyOPT Job Tracker',
        publisher: 'TrackMyOPT',
        url: 'https://www.trackmyopt.com/features/job-tracker',
      },
    ],
    related: [
      {
        label: 'OPT job-search strategy',
        href: '/blog/leverage-job-search-trackmyopt-resume-generator',
      },
      {
        label: 'H-1B sponsors for new graduates',
        href: '/blog/h1b-sponsors-international-new-graduates-2026-2027',
      },
      {
        label: '90-day unemployment rule',
        href: '/blog/90-day-unemployment-rule-opt',
      },
    ],
  }),
] as const;
