import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// Data post for "opt denied" (279), "opt denial reasons" (82), "opt approval
// rate" (66), "reasons for opt denial" (58) and "can opt be denied" (38).
// Every count below was parsed on 2026-11-08 from the four quarterly USCIS
// files "Form I-765, Application for Employment Authorization, Eligibility
// Category and Filing Type" (FY2025 Q4 through FY2026 Q3). Rates are
// approvals / (approvals + denials) from the TOTAL columns of each file.
// Rules were checked the same day against eCFR (8 CFR 214.2(f), 103.2,
// 274a.12), the Form I-765 instructions (edition 08/21/25) and the USCIS
// I-765 page. The July 2026 DHS rule (FR 2026-14439) that would cut the
// post-completion program-end window from 60 to 30 days was postponed by a
// federal court on Sept. 14, 2026; USCIS says it is following the previous
// rules, so eCFR's codified 30-day text is not what USCIS applies. USCIS does not
// publish denial counts by reason, so the reasons section lists documented
// grounds only, with no frequencies.

const src = {
  dataLibrary: {
    label: 'Immigration and Citizenship Data',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data',
  },
  fy26q3: {
    label:
      'Form I-765, Eligibility Category and Filing Type, FY2026 Q3 (April 1 to June 30, 2026), XLSX',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/data/i765_application_for_employment_fy2026_q3_v1.xlsx',
  },
  fy26q2: {
    label:
      'Form I-765, Eligibility Category and Filing Type, FY2026 Q2 (January 1 to March 31, 2026), XLSX',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/data/i765_application_for_employment_fy2026_q2_v1.xlsx',
  },
  fy26q1: {
    label:
      'Form I-765, Eligibility Category and Filing Type, FY2026 Q1 (October 1 to December 31, 2025), XLSX',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/reports/i765_application_for_employment_fy2026_q1_v1.xlsx',
  },
  fy25q4: {
    label:
      'Form I-765, Eligibility Category and Filing Type, FY2025 Q4 (July 1 to September 30, 2025), XLSX',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/data/i765_application_for_employment_fy2025_q4_v1.xlsx',
  },
  cfr2142: {
    label:
      '8 CFR 214.2(f)(10) and (f)(11): practical training and the OPT application process (current eCFR text includes the postponed 30-day change, which USCIS is not applying)',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  cfr1032: {
    label: '8 CFR 103.2(b): evidence, requests for evidence and abandonment',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-103/section-103.2',
  },
  cfr274a12: {
    label: '8 CFR 274a.12(c)(3): F-1 student employment authorization categories',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.12',
  },
  i765Page: {
    label: 'I-765, Application for Employment Authorization (September 14, 2026 alert and When to File table)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  frRule: {
    label:
      'Establishing a Fixed Time Period of Admission and an Extension of Stay Procedure for Nonimmigrant Academic Students, Exchange Visitors, and Representatives of Foreign Information Media (final rule, July 17, 2026)',
    publisher: 'Federal Register',
    url: 'https://www.federalregister.gov/documents/2026/07/17/2026-14439/establishing-a-fixed-time-period-of-admission-and-an-extension-of-stay-procedure-for-nonimmigrant',
  },
  i765Instructions: {
    label: 'Instructions for Form I-765, Application for Employment Authorization (edition 08/21/25)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf',
  },
  status: {
    label: 'Check your immigration case status',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'opt-approval-denial-rate-2026';

export const optApprovalDenialRate: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'processing-times',
  title:
    'OPT Approval and Denial Rate in 2026: What USCIS I-765 Data Shows for (c)(3)(A), (c)(3)(B) and (c)(3)(C)',
  seoTitle: 'OPT Approval Rate 2026: USCIS Denial Data by Category',
  description:
    'USCIS approved about 97 of every 100 post-completion OPT decisions and 96 of every 100 STEM OPT decisions from July 2025 to June 2026. See the quarterly counts, how the rate is calculated, and the documented reasons OPT is denied.',
  category: 'TrackMyOPT Data',
  tags: [
    'OPT approval rate',
    'OPT denied',
    'OPT denial reasons',
    'STEM OPT approval rate',
    'I-765 data',
    'USCIS data',
  ],
  readTime: '9 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: OPT approval rates by eligibility category from four quarters of USCIS Form I-765 data.',
  imageCaption:
    'Approval rates calculated from USCIS Form I-765 data for July 2025 to June 2026. USCIS data, calculation by TrackMyOPT.',
  badgeLabel: 'USCIS data analysis',
  reviewLabel:
    'Counts parsed on November 8, 2026 from four quarterly USCIS Form I-765 files',
  directAnswer:
    'Yes, OPT can be denied, but most OPT decisions are approvals. In USCIS Form I-765 data for July 1, 2025 to June 30, 2026, post-completion OPT (c)(3)(B) had 159,239 approvals and 5,195 denials, an approval rate of 96.8%. The STEM OPT extension (c)(3)(C) had 100,720 approvals and 4,393 denials, or 95.8%. Pre-completion OPT (c)(3)(A) is small and different: 827 approvals and 671 denials, or 55.2%. USCIS does not publish why each case was denied.',
  keyTakeaways: [
    'Post-completion OPT (c)(3)(B): between 96.6% and 97.2% of decisions were approvals in each of the four quarters.',
    'STEM OPT (c)(3)(C): between 93.7% and 98.6% each quarter. The low point was October to December 2025, with 2,918 denials.',
    'Pre-completion OPT (c)(3)(A): about 250 to 630 decisions a quarter, with approval rates from 29.5% to 66.5%.',
    'The rate counts decisions made in a quarter, not the outcome of applications filed in that quarter. Many decisions are on older filings.',
    'USCIS publishes no denial counts by reason. The documented grounds include late filing, missing eligibility, unmet STEM requirements, and an unanswered RFE or missed biometrics appointment.',
  ],
  sections: [
    {
      heading: 'The short answer: OPT approval rates by category',
      figure: { src: '/blog/figures/opt-approval-denial-rate-2026/approval-rate-by-category.png', alt: 'Bar chart of OPT approval rates from July 2025 to June 2026: post-completion OPT 96.8%, STEM OPT extension 95.8%, all I-765 categories 89.0%, pre-completion OPT 55.2%.', caption: 'Approval rate by category from the USCIS I-765 files. The table below has the counts.', width: 1200, height: 509 },
      paragraphs: [
        'USCIS publishes Form I-765 counts by eligibility category every quarter. Each file lists receipts, approvals, denials and pending cases for every EAD code. OPT has three codes: (c)(3)(A) for pre-completion OPT, (c)(3)(B) for post-completion OPT and (c)(3)(C) for the 24-month STEM OPT extension.',
        'We downloaded the four most recent quarterly files on November 8, 2026. They cover July 1, 2025 to June 30, 2026. The table adds up the approvals and denials across those four quarters for each OPT code.',
        'The approval rate here is approvals divided by approvals plus denials. Pending cases are not in the rate, because they have no decision yet.',
      ],
      table: {
        caption:
          'OPT decisions from July 1, 2025 to June 30, 2026, all filing types combined. Source: USCIS Form I-765 eligibility category files, FY2025 Q4 to FY2026 Q3. Rate calculated by TrackMyOPT.',
        columns: ['Category', 'Approvals', 'Denials', 'Approval rate'],
        rows: [
          ['(c)(3)(B) post-completion OPT', '159,239', '5,195', '96.8%'],
          ['(c)(3)(C) 24-month STEM OPT', '100,720', '4,393', '95.8%'],
          ['(c)(3)(A) pre-completion OPT', '827', '671', '55.2%'],
          ['All I-765 categories, for comparison', '2,073,828', '255,123', '89.0%'],
        ],
      },
      note: 'These are approvals and denials made during each quarter. USCIS notes that some of them were on applications received in earlier periods. So the figure is a decision mix, not the odds for any one application.',
      sources: [src.dataLibrary, src.fy26q3],
    },
    {
      heading: 'Post-completion OPT (c)(3)(B), quarter by quarter',
      paragraphs: [
        'Post-completion OPT is the 12-month OPT most students apply for near graduation. It is also by far the largest OPT category in the data.',
        'The approval rate barely moved across the four quarters. It stayed between 96.6% and 97.2%. In plain terms, about 3 of every 100 decisions were denials.',
        'The pending count changed much more than the rate. It was 6,089 at the end of September 2025 and 70,225 at the end of June 2026. USCIS warns that pending counts cannot be rebuilt from earlier files, because some actions, such as administrative closures and office transfers, are not shown.',
      ],
      table: {
        caption:
          'Form I-765, category (c)(3)(B) post-completion OPT, all filing types. Pending is the count awaiting a decision at the end of the quarter.',
        columns: ['Quarter', 'Receipts', 'Approvals', 'Denials', 'Approval rate', 'Pending at end'],
        rows: [
          ['Jul 1 to Sep 30, 2025 (FY2025 Q4)', '20,604', '62,971', '2,232', '96.6%', '6,089'],
          ['Oct 1 to Dec 31, 2025 (FY2026 Q1)', '45,639', '25,700', '740', '97.2%', '25,582'],
          ['Jan 1 to Mar 31, 2026 (FY2026 Q2)', '60,295', '23,229', '794', '96.7%', '62,138'],
          ['Apr 1 to Jun 30, 2026 (FY2026 Q3)', '56,901', '47,339', '1,429', '97.1%', '70,225'],
        ],
      },
      bullets: [
        'Almost all (c)(3)(B) cases are filed as initial applications. In April to June 2026 there were 46,939 initial approvals and 1,366 initial denials, or 97.2%.',
        'The file also lists small "renewal" and "replacement" counts for (c)(3)(B). In April to June 2026 those were 147 approvals and 20 denials for renewals, and 253 approvals and 43 denials for replacements.',
      ],
      links: [
        {
          label: 'OPT EAD processing time 2026, updated monthly',
          href: '/blog/opt-processing-time-2026',
        },
        {
          label: 'OPT EAD pending: delays in 2026',
          href: '/blog/opt-ead-pending-processing-delays-2026',
        },
      ],
      sources: [src.fy25q4, src.fy26q1, src.fy26q2, src.fy26q3],
    },
    {
      heading: 'STEM OPT extension (c)(3)(C), quarter by quarter',
      paragraphs: [
        'The STEM OPT extension adds 24 months of OPT for eligible STEM degrees. USCIS lists most of these filings under the "renewal" filing type, and some under "initial". The table combines all filing types.',
        'The rate was high in three of the four quarters. October to December 2025 was lower, at 93.7%, with 2,918 denials against 43,362 approvals. The file does not say why. Do not read a reason into it.',
      ],
      table: {
        caption:
          'Form I-765, category (c)(3)(C) 24-month STEM OPT, all filing types. Pending is the count awaiting a decision at the end of the quarter.',
        columns: ['Quarter', 'Receipts', 'Approvals', 'Denials', 'Approval rate', 'Pending at end'],
        rows: [
          ['Jul 1 to Sep 30, 2025 (FY2025 Q4)', '19,434', '25,756', '360', '98.6%', '38,407'],
          ['Oct 1 to Dec 31, 2025 (FY2026 Q1)', '23,533', '43,362', '2,918', '93.7%', '15,673'],
          ['Jan 1 to Mar 31, 2026 (FY2026 Q2)', '24,698', '14,066', '675', '95.4%', '25,866'],
          ['Apr 1 to Jun 30, 2026 (FY2026 Q3)', '56,960', '17,536', '440', '97.6%', '65,221'],
        ],
      },
      links: [
        {
          label: 'STEM OPT processing time 2026',
          href: '/blog/stem-opt-processing-time-2026',
        },
        {
          label: 'STEM OPT extension guide',
          href: '/blog/stem-opt-extension-guide',
        },
      ],
      sources: [src.fy25q4, src.fy26q1, src.fy26q2, src.fy26q3],
    },
    {
      heading: 'Pre-completion OPT (c)(3)(A): small numbers, lower rates',
      paragraphs: [
        'Pre-completion OPT is OPT used before you finish your program. It is a small category, with roughly 250 to 630 decisions a quarter. Small counts make the rate swing from quarter to quarter.',
        'The approval rate ranged from 29.5% in January to March 2026 to 66.5% in July to September 2025. Across all four quarters it was 55.2%. That is far below the post-completion rate.',
        'The data does not explain the gap. The rules for pre-completion OPT are different, though. You must have been enrolled full time for one full academic year before the work starts. While school is in session, pre-completion OPT is limited to 20 hours a week.',
      ],
      table: {
        caption:
          'Form I-765, category (c)(3)(A) pre-completion OPT, all filing types. Pending is the count awaiting a decision at the end of the quarter.',
        columns: ['Quarter', 'Receipts', 'Approvals', 'Denials', 'Approval rate', 'Pending at end'],
        rows: [
          ['Jul 1 to Sep 30, 2025 (FY2025 Q4)', '650', '189', '95', '66.5%', '1,153'],
          ['Oct 1 to Dec 31, 2025 (FY2026 Q1)', '670', '201', '132', '60.4%', '1,385'],
          ['Jan 1 to Mar 31, 2026 (FY2026 Q2)', '671', '75', '179', '29.5%', '1,709'],
          ['Apr 1 to Jun 30, 2026 (FY2026 Q3)', '579', '362', '265', '57.7%', '1,524'],
        ],
      },
      links: [
        {
          label: 'Pre-completion OPT vs CPT',
          href: '/blog/pre-completion-opt-vs-cpt',
        },
      ],
      sources: [src.fy25q4, src.fy26q1, src.fy26q2, src.fy26q3, src.cfr2142],
    },
    {
      heading: 'How to read these numbers, and what they do not tell you',
      paragraphs: [
        'Each quarterly file counts what happened in that quarter. Receipts are new applications entered into USCIS systems. Approvals and denials are decisions made in the quarter, on applications filed at any time. Pending is the count still waiting at the end of the quarter.',
        'That is why approvals can be larger than receipts in the same quarter. In July to September 2025, USCIS decided 62,971 (c)(3)(B) approvals but logged only 20,604 new (c)(3)(B) receipts.',
        'A rejection is not a denial. A rejected filing is sent back without a decision, for example when the form is not signed. A denial is a decision on a case USCIS accepted.',
        'USCIS also notes that counts can change between reports because of system updates and later actions. Our figures are the counts as printed in each file on the day we downloaded it.',
      ],
      bullets: [
        'The rate is not your personal chance of approval. It mixes strong and weak filings from different months.',
        'The file has no reason field, so no one can rank denial reasons from this data.',
        'The data stops at June 30, 2026. A DHS rule that would shorten the post-completion filing window was postponed by a court on September 14, 2026, and USCIS says it is still following the previous rules.',
      ],
      sources: [src.fy26q3, src.i765Page],
    },
    {
      heading: 'Documented reasons OPT is denied',
      paragraphs: [
        'USCIS does not publish how often each reason appears. The regulation does require USCIS to explain a denial in writing. The reasons below come from the OPT rules and the Form I-765 instructions. They are grounds that can lead to a denial, not a ranked list.',
        'Post-completion OPT has a strict filing window. You can generally file up to 90 days before and no later than 60 days after your program end date. You must also file within 30 days of the date your DSO entered the OPT recommendation in SEVIS. The I-765 instructions say USCIS will deny a request filed after that 30-day period.',
        'A July 2026 DHS rule would cut the program-end limit from 60 days to 30 days. On September 14, 2026, a federal court postponed that rule. USCIS says it is following the previous rules for now. The eCFR website already shows the 30-day text, but USCIS is not applying it while the court order stands. Check with your DSO before relying on either window.',
        'Eligibility gaps can also lead to a denial. Practical training generally requires one full academic year of full-time enrollment. You get 12 months of OPT per education level. Students who used one year or more of full-time CPT are not eligible for post-completion OPT.',
        'For the STEM extension, the degree must be on the STEM Designated Degree Program List, and the employer must be enrolled in E-Verify. A completed Form I-983 must go to the DSO before the recommendation. You must file within 60 days of the DSO recommendation.',
        'Process failures matter too. If you do not answer an RFE or a NOID by the deadline, USCIS may deny the case as abandoned, on the record, or both. Missing a biometrics appointment generally leads to a denial as abandoned, unless USCIS accepted a rescheduling request in time. Evidence that does not show you were eligible when you filed also leads to a denial.',
      ],
      table: {
        caption:
          'Documented grounds for an OPT denial, with the rule behind each. USCIS publishes no counts by reason.',
        columns: ['Ground', 'Applies to', 'Where it is written'],
        rows: [
          ['Filed more than 30 days after the DSO recommendation in SEVIS', 'Post-completion OPT', 'Form I-765 instructions; 8 CFR 214.2(f)(11)(i)(B)'],
          ['Filed more than 60 days after the program end date', 'Post-completion OPT', 'USCIS I-765 page; 8 CFR 214.2(f)(11)(i)(B)(2) as applied before the postponed 2026 rule'],
          ['Filed more than 60 days after the DSO recommendation', 'STEM OPT', 'Form I-765 instructions; 8 CFR 214.2(f)(11)(i)(C)'],
          ['No full academic year of full-time enrollment', 'Pre- and post-completion OPT', '8 CFR 214.2(f)(10)'],
          ['12 months of OPT already used at the same education level', 'Pre- and post-completion OPT', '8 CFR 214.2(f)(10)'],
          ['One year or more of full-time CPT', 'Post-completion OPT', '8 CFR 214.2(f)(10)(i)'],
          ['Degree not on the STEM list, or employer not in E-Verify', 'STEM OPT', '8 CFR 214.2(f)(10)(ii)(C)'],
          ['No response to an RFE or NOID by the deadline', 'All categories', '8 CFR 103.2(b)(13)(i)'],
          ['Missed biometrics appointment', 'All categories', '8 CFR 103.2(b)(13)(ii)'],
        ],
      },
      note: 'There is no appeal from an OPT denial under 8 CFR 214.2(f)(11)(iii)(C). Read the denial notice for the exact reason, then talk to your DSO before you file anything new.',
      links: [
        {
          label: 'OPT application denied: what to do next',
          href: '/blog/opt-application-denied',
        },
        {
          label: 'OPT RFE: how to respond to a Request for Evidence',
          href: '/blog/opt-rfe-request-for-evidence-i765',
        },
        {
          label: 'USCIS NOID response guide for OPT',
          href: '/blog/uscis-noid-response-guide-opt',
        },
        {
          label: 'The 12-month CPT rule and OPT eligibility',
          href: '/blog/cpt-12-month-rule-opt-eligibility',
        },
        {
          label: 'Check an employer’s E-Verify status before a STEM OPT offer',
          href: '/blog/check-employer-e-verify-stem-opt-offer',
        },
      ],
      sources: [src.i765Page, src.i765Instructions, src.frRule, src.cfr2142, src.cfr1032],
    },
    {
      heading: 'Example: Mei files on day 35',
      paragraphs: [
        'Fictional example: Mei’s DSO enters her post-completion OPT recommendation in SEVIS on March 1. She gets busy with final exams and files her I-765 online on April 5, which is 35 days later.',
        'The I-765 instructions say the filing must come within 30 days of the DSO recommendation. Mei’s case is denied, and the denial notice states the reason. There is no appeal.',
        'Mei calls her DSO the same day. They check whether a new recommendation and a new filing are still possible inside her program-end window. A 97% approval rate did not help Mei, because her problem was a rule, not chance.',
        'The useful habit is simple. Write down the date the DSO enters the recommendation, and file well before day 30.',
      ],
    },
    {
      heading: 'Track your own case, not the average',
      paragraphs: [
        'The quarterly data is useful for context. It cannot tell you what is happening with your receipt. Your own case status, and any notice USCIS mails you, is the official record.',
        'Check the I-765 receipt in USCIS Case Status Online or your USCIS account. Watch for "Request for Evidence Was Sent", because that deadline matters more than any average. A tracker such as TrackMyOPT can check the status for you and email you when it changes. It is a tracker, not legal advice.',
      ],
      links: [
        {
          label: 'EAD card status: every USCIS status message explained',
          href: '/blog/ead-card-status-check',
        },
        {
          label: 'OPT timelines reported by users: November 2026 snapshot',
          href: '/blog/opt-stem-opt-timelines-reported-november-2026',
        },
        {
          label: 'How TrackMyOPT case tracking works',
          href: '/features/case-status',
        },
      ],
      sources: [src.status],
    },
  ],
  checklist: [
    'Note the date your DSO enters the OPT recommendation in SEVIS, and file well within 30 days (60 days for STEM OPT).',
    'Confirm your program end date and the filing window that applies to it with your DSO.',
    'For STEM OPT, confirm the degree is on the STEM list and the employer is enrolled in E-Verify.',
    'Answer any RFE or NOID completely and before the printed deadline.',
    'Attend your biometrics appointment, or reschedule it in time.',
  ],
  mistakes: [
    'Reading a 97% approval rate as a guarantee for your own case.',
    'Counting from the I-20 signature date instead of the date the DSO entered the recommendation in SEVIS.',
    'Assuming a news headline about the 30-day rule is in force. USCIS says a court postponed it on September 14, 2026, so confirm your window with your DSO.',
    'Treating a rejected filing as a denial, or a denial as something you can appeal.',
  ],
  faq: [
    {
      question: 'Can OPT be denied?',
      answer:
        'Yes. From July 2025 to June 2026, USCIS recorded 5,195 denials of post-completion OPT, 4,393 denials of STEM OPT and 671 denials of pre-completion OPT. Most decisions in the two larger categories were approvals.',
    },
    {
      question: 'What is the OPT approval rate?',
      answer:
        'Using USCIS Form I-765 data for July 1, 2025 to June 30, 2026, the approval rate was 96.8% for post-completion OPT, 95.8% for STEM OPT and 55.2% for pre-completion OPT. The rate is approvals divided by approvals plus denials.',
    },
    {
      question: 'What are the most common reasons for OPT denial?',
      answer:
        'USCIS does not publish denial counts by reason, so no one can rank them from official data. Documented grounds include filing more than 30 days after the DSO recommendation, filing outside the program-end window, missing eligibility such as one year of full-time CPT, unmet STEM requirements, and an unanswered RFE or NOID.',
    },
    {
      question: 'Can I appeal an OPT denial?',
      answer:
        'No. The OPT regulation says the applicant may not appeal the decision. Read the denial notice for the reason and talk to your DSO about your options.',
    },
    {
      question: 'Is a rejected OPT application the same as a denial?',
      answer:
        'No. A rejection sends the filing back without a decision, for example when the form is not signed. A denial is a decision on a case USCIS accepted, and the notice explains the reason.',
    },
    {
      question: 'Where does this data come from?',
      answer:
        'From the quarterly USCIS files titled "Form I-765, Application for Employment Authorization, Eligibility Category and Filing Type" in the USCIS Immigration and Citizenship Data library. We used the FY2025 Q4 to FY2026 Q3 files.',
    },
  ],
  sources: [
    src.dataLibrary,
    src.fy26q3,
    src.fy26q2,
    src.fy26q1,
    src.fy25q4,
    src.cfr2142,
    src.cfr1032,
    src.cfr274a12,
    src.i765Page,
    src.i765Instructions,
    src.frRule,
  ],
  related: [
    {
      label: 'OPT application denied: what to do next',
      href: '/blog/opt-application-denied',
    },
    {
      label: 'OPT processing time 2026',
      href: '/blog/opt-processing-time-2026',
    },
    {
      label: 'STEM OPT processing time 2026',
      href: '/blog/stem-opt-processing-time-2026',
    },
    {
      label: 'USCIS case status tracking guide',
      href: '/blog/uscis-case-status-tracking-guide',
    },
  ],
  dataNote:
    'Source: USCIS, Immigration and Citizenship Data library, "Form I-765, Application for Employment Authorization, Eligibility Category and Filing Type", four quarterly XLSX files downloaded on November 8, 2026: i765_application_for_employment_fy2025_q4_v1.xlsx (July 1 to September 30, 2025, queried 10/2025), i765_application_for_employment_fy2026_q1_v1.xlsx (October 1 to December 31, 2025, queried 01/2026), i765_application_for_employment_fy2026_q2_v1.xlsx (January 1 to March 31, 2026, queried 04/2026) and i765_application_for_employment_fy2026_q3_v1.xlsx (April 1 to June 30, 2026, queried 07/2026). We read the rows for eligibility codes C03A, C03B and C03C and the "Total" row, using the TOTAL columns (initial, renewal and replacement filing types combined) unless a figure is labelled as initial, renewal or replacement. Approval rate = approvals / (approvals + denials), rounded to one decimal place; pending cases are excluded. Four-quarter rates sum approvals and denials across the four files. USCIS notes that decisions in a quarter may concern applications received earlier, that counts may differ from earlier reports because of system updates and post-adjudicative outcomes, and that some actions such as administrative closures and transfers are not reflected. The files contain no denial reasons. No applicant data is used.',
});
