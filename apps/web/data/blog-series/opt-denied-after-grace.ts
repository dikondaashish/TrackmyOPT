import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "opt denied" (279), "opt grace period after expiration" (85), "opt denied
// how long can i stay" (57), "what happens if opt is denied" (55), "opt
// pending after grace period" (33) and "opt denied what are my options" (26)
// had no page about a denial that arrives after the 60-day grace period.
// Checked on 2026-11-09 against the USCIS Policy Manual (Vol. 2, Part F,
// Chapters 4, 5 and 8), 8 CFR 103.5, 8 CFR 274a.13(c), the USCIS Form I-290B
// pages, the Form I-765 page alert on the postponed DHS "fixed time period of
// admission" rule, ICE SEVP FAQs and Study in the States SEVIS job aids.
// eCFR 214.2(f) already shows the postponed text, so it is not cited for the
// grace period or filing window. No fixed stay length is given beyond the
// Policy Manual sentence on denied post-completion OPT.

const src = {
  pmCh5: {
    label: 'Policy Manual, Volume 2, Part F, Chapter 5: Practical Training',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-5',
  },
  pmCh8: {
    label: 'Policy Manual, Volume 2, Part F, Chapter 8: Change of Status, Extension of Stay, and Length of Stay',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-8',
  },
  pmCh4: {
    label: 'Policy Manual, Volume 2, Part F, Chapter 4: School Transfer',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-4',
  },
  i765: {
    label: 'Form I-765, Application for Employment Authorization (court order alert)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  i290b: {
    label: 'Form I-290B, Notice of Appeal or Motion',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-290b',
  },
  i290bWhen: {
    label: 'When to Use Form I-290B, Notice of Appeal or Motion',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-290b/eligibility',
  },
  cfr1035: {
    label: '8 CFR 103.5: Reopening or reconsideration',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-103/subpart-A/section-103.5',
  },
  cfr274a13: {
    label: '8 CFR 274a.13: Application for employment authorization',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.13',
  },
  i539: {
    label: 'Form I-539, Application to Extend/Change Nonimmigrant Status',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-539',
  },
  premium: {
    label: 'How Do I Request Premium Processing?',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
  },
  iceEmployment: {
    label: 'SEVP Employment FAQs',
    publisher: 'ICE SEVP',
    url: 'https://www.ice.gov/sevis/employment',
  },
  iceTravel: {
    label: 'SEVP Travel FAQs',
    publisher: 'ICE SEVP',
    url: 'https://www.ice.gov/sevis/travel',
  },
  sisOpt: {
    label: 'F-1 Optional Practical Training (OPT): SEVIS OPT request statuses',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-optional-practical-training-opt',
  },
  sisTerminate: {
    label: 'Terminate a Student: grace periods after a termination',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/completions-and-terminations/terminate-a-student',
  },
  sisComplete: {
    label: 'Complete Student SEVIS Status',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/completions-and-terminations/complete-student-sevis-status',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'opt-denied-after-grace-period-options';

export const optDeniedAfterGrace: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'OPT Denied After the Grace Period: How Long You Can Stay and What Your Options Are',
  seoTitle: 'OPT Denied After the Grace Period: Your Options (2026)',
  description:
    'OPT denied or still pending after the 60-day grace period? How long you can generally stay, the 30-day motion window, SEVIS effects and your options.',
  category: 'OPT Rules',
  tags: [
    'OPT denied',
    'OPT grace period',
    'OPT pending after grace period',
    'Form I-290B',
    'motion to reopen',
    'F-1 status',
  ],
  readTime: '9 min read',
  publishedDate: '2026-11-07',
  modifiedDate: '2026-11-09',
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: what happens when OPT is denied after the 60-day grace period, with the 30-day motion window.',
  imageCaption:
    'The status clock after an OPT denial. Generated from the USCIS Policy Manual and the Form I-290B pages.',
  statusNote:
    'A federal court postponed the DHS "fixed time period of admission" rule on September 14, 2026. USCIS says it is proceeding under the previous rules, which this guide describes. If the court order is lifted, these rules may change.',
  directAnswer:
    'The USCIS Policy Manual says that if post-completion OPT is denied, F-1 status ends 60 days after the program end date or 60 days after the denial date, whichever is later. If the denial says you failed to maintain F-1 status, you must leave right away. There is no appeal for an OPT denial. You can file a motion to reopen or reconsider on Form I-290B, generally within 30 days of the decision, or 33 days if it was mailed. Your options are to depart, start a new program with a new I-20, change to another status, refile if you are still inside the filing window, or file a motion. Talk to your DSO and an immigration attorney before you choose.',
  keyTakeaways: [
    'A timely filed OPT application can still be pending after day 60. You cannot work until it is approved and the EAD start date arrives.',
    'For a denied post-completion OPT, the Policy Manual ties the end of F-1 status to the later of program end plus 60 days or denial plus 60 days.',
    'A denial for failure to maintain status has no grace period. You must leave right away or ask an attorney about reinstatement.',
    'OPT denials cannot be appealed. A motion on Form I-290B is due within 30 days, or 33 days if the decision was mailed, and it does not pause the denial.',
    'The 60 days after a denial are for preparing to leave, starting a new program or changing status. They are not work time.',
  ],
  sections: [
    {
      heading: 'Which rules apply right now',
      paragraphs: [
        'In July 2026, DHS published a rule that would replace duration of status for F-1 students with a fixed admission period. It would also shorten some deadlines.',
        'On September 14, 2026, a federal court in Massachusetts postponed that rule. USCIS says on its Form I-765 page that it will proceed under the previous regulatory provisions until the court says otherwise.',
        'This guide describes those previous rules. They include duration of status, the 60-day F-1 grace period and the 60-days-after-program-end window to file for post-completion OPT. Some online copies of the regulations already show the postponed text, so check the date and source of anything you read.',
      ],
      sources: [src.i765, src.pmCh5],
    },
    {
      heading: 'What a pending OPT application does after day 60',
      paragraphs: [
        'You can file for post-completion OPT up to 90 days before your program end date and up to 60 days after it. You must also file within 30 days of the date your DSO enters the recommendation in SEVIS.',
        'Filing late in that window often means USCIS decides the case after your 60-day grace period has ended. That is common, and it does not by itself mean you are out of status.',
        'The Policy Manual measures the end of status from the later of two dates: the program end date or the denial date. So a timely, properly filed application that is still pending generally lets you remain while USCIS decides.',
        'A pending application does not let you work. USCIS says you may not begin OPT until it approves the I-765 and you receive your EAD, and employment can begin only on the EAD start date.',
      ],
      bullets: [
        'You generally can: stay in the United States while a timely application is pending, keep your address current with the DSO and USCIS, and answer any RFE fast.',
        'You cannot: work on or off campus based on the pending OPT application.',
        'Be careful with travel: SEVP says travel while OPT is pending should be undertaken with caution. If USCIS approves while you are away, you need the EAD in hand to re-enter.',
      ],
      links: [
        { label: 'What happens when OPT expires', href: '/blog/what-happens-if-opt-expires' },
        { label: 'The 60-day grace period for F-1 students', href: '/blog/60-day-grace-period-f1-students' },
      ],
      sources: [src.pmCh5, src.iceTravel],
    },
    {
      heading: 'What happens when OPT is denied',
      paragraphs: [
        'USCIS sends a written denial that gives the reasons. In SEVIS, the OPT request status changes to "Denied", which tells your DSO what happened.',
        'Read the reason closely, because it decides how long you have. The Policy Manual draws a sharp line between an ordinary denial and a denial for failing to maintain F-1 status.',
        'For an ordinary denial of post-completion OPT, F-1 status ends 60 days after the program end date or the denial date, whichever is later. If the denial says you failed to maintain status, you must depart immediately.',
        'A STEM OPT extension denial works differently. If your post-completion OPT EAD has already expired, employment authorization ends at once, including any 180-day automatic extension, and F-1 status ends 60 days after the denial date. If that EAD is still unexpired, you stay work authorized only until it expires. A status-maintenance denial again means immediate departure.',
      ],
      table: {
        caption: 'How long F-1 status generally lasts after an OPT decision, under the rules USCIS currently applies.',
        columns: ['Situation', 'Work allowed?', 'When F-1 status generally ends', 'Source'],
        rows: [
          ['Post-completion OPT pending, timely filed', 'No', 'Not yet; tied to the decision date', 'Policy Manual Vol. 2, Part F, Ch. 5'],
          ['Post-completion OPT denied, ordinary reason', 'No', '60 days after program end or denial, whichever is later', 'Policy Manual Vol. 2, Part F, Ch. 5'],
          ['Any OPT denied for failure to maintain F-1 status', 'No', 'Immediately; no grace period', 'Policy Manual Ch. 5; SEVP termination job aid'],
          ['STEM OPT extension denied, ordinary reason, OPT EAD expired', 'Ends on the denial date', '60 days after the denial date', 'Policy Manual Vol. 2, Part F, Ch. 5'],
        ],
      },
      note: 'These dates are the general rule. Your own end date depends on your I-20, the exact denial notice and your SEVIS record. Confirm it in writing with your DSO.',
      links: [
        { label: 'OPT application denied: common reasons', href: '/blog/opt-application-denied' },
        { label: 'OPT approval and denial rates in 2026', href: '/blog/opt-approval-denial-rate-2026' },
      ],
      sources: [src.pmCh5, src.sisOpt, src.sisTerminate],
    },
    {
      heading: 'No appeal, but a motion is possible',
      paragraphs: [
        '8 CFR 274a.13(c) says there is no appeal from the denial of an employment authorization application. The USCIS I-290B guide confirms that an I-765 denial cannot be appealed, but a motion to reopen or reconsider can be filed.',
        'A motion to reopen must state new facts and include affidavits or other documents. A motion to reconsider must show the decision applied the law or USCIS policy incorrectly, with supporting precedent.',
        'USCIS says most motions are due within 30 calendar days of the decision, or 33 days if it mailed the decision. A late motion to reconsider is dismissed. A late motion to reopen may be excused only if the delay was reasonable and beyond your control.',
        'Filing a motion does not pause the denial or extend a departure date unless USCIS directs otherwise. Plan as if the denial stands while the motion is pending.',
      ],
      note: 'USCIS recently changed where Form I-290B is filed. Check the current address and fee on the form page before you send anything.',
      links: [
        { label: 'NOID response guide for OPT', href: '/blog/uscis-noid-response-guide-opt' },
        { label: 'OPT RFE: what USCIS asks for', href: '/blog/opt-rfe-request-for-evidence-i765' },
      ],
      sources: [src.cfr274a13, src.i290bWhen, src.i290b, src.cfr1035],
    },
    {
      heading: 'Your options after a denial',
      paragraphs: [
        'Each option below has its own deadlines. Most of them must start while you still have F-1 status, so the denial date matters more than anything else.',
      ],
      numbered: [
        'Depart the United States before your status ends. SEVP says the grace period exists to prepare to leave. If you leave before it ends, the rest of it is lost.',
        'Start a new degree program. During the grace period you are treated as maintaining status, so a transfer can generally start then. A change of educational level is handled by your DSO, and the new program generally has to start within five months. Ask your DSO and the new school whether your timing still works.',
        'Change to another status, such as F-2 through a spouse, or H-4 or another category. File before your current status ends. The Policy Manual says an F-1 student in the grace period is deemed to be maintaining status and may apply for a change of status.',
        'Refile for OPT if you are still eligible. That generally requires being inside the window of 60 days after the program end date, plus a filing within 30 days of a DSO recommendation. A denial that arrives after that window usually closes this option for that degree.',
        'File a motion on Form I-290B within 30 days, or 33 days if the decision was mailed, if the denial was wrong or you have new evidence. Prepare a fallback, because the motion does not pause the denial.',
      ],
      note: 'A change of status to F-1 or F-2 on Form I-539 can use premium processing, with a 30-business-day timeframe once all prerequisites are met. USCIS treats travel abroad while a change of status to F-1 is pending as abandoning the request.',
      links: [
        { label: 'Fell out of F-1 status? Your options', href: '/blog/fall-out-of-f1-status-options' },
        { label: 'F-2 dependent rules for OPT students', href: '/blog/f2-dependent-visa-rules-opt-students' },
        { label: 'F-1 reinstatement on I-539 vs re-entry', href: '/blog/f1-reinstatement-i539-vs-reentry' },
      ],
      sources: [src.iceEmployment, src.sisComplete, src.pmCh4, src.pmCh8, src.i539, src.premium],
    },
    {
      heading: 'What happens to your SEVIS record',
      paragraphs: [
        'The OPT request in SEVIS shows "Denied" once USCIS denies the I-765. Your DSO can see it and the date.',
        'SEVP says SEVIS completes a student record automatically after the appropriate grace period has passed. Once a record is completed, there is no further grace period. Ask your DSO what your record will show and on which date.',
        'A termination for a status violation is different. SEVP says there is no grace period, and you must either apply for reinstatement or leave immediately.',
        'Reinstatement uses Form I-539 with a DSO recommendation on a new I-20. The Policy Manual says it generally must be filed within 5 months of falling out of status, and USCIS decides it at its discretion.',
      ],
      sources: [src.sisOpt, src.sisComplete, src.sisTerminate, src.pmCh8],
    },
    {
      heading: 'When to call your DSO and an attorney today',
      paragraphs: [
        'Contact your DSO on the day you see a denial. They can read your SEVIS record, confirm your program end date and tell you what the school can do.',
        'Talk to an immigration attorney before acting if any of the points below apply. A DSO advises on school and SEVIS rules; an attorney can advise on motions, status and future visas.',
      ],
      bullets: [
        'The denial mentions failure to maintain status, unauthorized employment or a SEVIS termination.',
        'You worked at any point without an approved EAD.',
        'You have just received a denial notice, because the 30-day motion clock is already running.',
        'You have another pending case, such as an H-1B change of status in cap-gap or a spouse’s petition.',
        'You are outside the United States, or you plan to travel.',
        'You have F-2 dependents whose status depends on yours.',
      ],
      links: [
        { label: 'H-1B cap-gap after a denial, rejection or withdrawal', href: '/blog/h1b-cap-gap-denial-rejection-withdrawal-layoff' },
      ],
    },
    {
      heading: 'Example: a denial 140 days after graduation',
      paragraphs: [
        'Fictional example: Lina’s master’s program ended on May 15, 2026. Her DSO entered the OPT recommendation on June 1. She filed the I-765 on July 10, inside 60 days of graduation but 39 days after the recommendation.',
        'USCIS denied the application on October 2, 2026 because it was filed more than 30 days after the DSO recommendation. The denial does not mention any status violation.',
        'The Policy Manual says F-1 status generally ends 60 days after the later of the program end date or the denial date, which would be December 1, 2026. Because her application was filed late, her attorney warns that USCIS could take the view that it was never properly filed and count from the program end date instead. She treats the earlier date as the safe assumption. She cannot refile, because her window closed on July 14.',
        'She meets her DSO the same week and confirms the date in SEVIS. An attorney tells her a motion is unlikely to help, because the denial applied the 30-day rule as written.',
        'She asks a school about a spring program and whether a new I-20 can be issued in time. When the DSO says the timing does not work, she books a flight to leave as soon as she can, well before December 1.',
      ],
    },
  ],
  checklist: [
    'Read the denial reason and note the decision date and whether it was mailed.',
    'Contact your DSO the same day and confirm your status end date in writing.',
    'Mark the motion deadline: 30 days from the decision, or 33 days if mailed.',
    'Stop any work that relied on the pending application; none should have started.',
    'Choose a path with your DSO and an attorney: depart, new program, change of status, refile or motion.',
    'Keep copies of the I-20, the denial notice, the receipt and any SEVIS printouts.',
  ],
  mistakes: [
    'Assuming you had to leave on day 60 while a timely OPT application was still pending.',
    'Starting work before approval because the application was filed on time.',
    'Waiting for a motion decision without a backup plan, even though the motion does not pause the denial.',
    'Missing the 30-day motion deadline while waiting to hear from the school.',
    'Leaving the United States during the grace period and expecting to return on it. SEVP says you may not depart and return during the grace period.',
    'Relying on online regulation text that shows the postponed 30-day rules.',
  ],
  faq: [
    {
      question: 'My OPT was denied. How long can I stay?',
      answer:
        'Under the USCIS Policy Manual, F-1 status after a denied post-completion OPT generally ends 60 days after the program end date or the denial date, whichever is later. If the denial says you failed to maintain status, you must leave immediately. Confirm your date with your DSO.',
    },
    {
      question: 'Can I stay in the US if my OPT is still pending after the grace period?',
      answer:
        'Generally yes, if you filed on time and properly. The Policy Manual measures the end of status from the decision date when it is later than the program end date. You cannot work until approval and the EAD start date.',
    },
    {
      question: 'Can I appeal an OPT denial?',
      answer:
        'No. 8 CFR 274a.13(c) bars appeals of employment authorization denials. You can file a motion to reopen or reconsider on Form I-290B, generally within 30 days, or 33 days if the decision was mailed.',
    },
    {
      question: 'Does filing a motion let me keep working or stay longer?',
      answer:
        'No. Unless USCIS directs otherwise, a motion does not stay the denial or extend a departure date. It also does not give you work authorization.',
    },
    {
      question: 'What are my options if OPT is denied?',
      answer:
        'Depart before your status ends, start a new program with a new I-20, change to another status such as F-2, refile if you are still inside the filing window, or file a motion. Speak with your DSO and an immigration attorney before you choose.',
    },
    {
      question: 'Does TrackMyOPT tell me if my OPT is denied?',
      answer:
        'TrackMyOPT tracks your receipt number and alerts you when the USCIS status changes, so you see a denial quickly. It is a tracker, not legal advice. The USCIS notice and your SEVIS record control.',
    },
  ],
  sources: [
    src.pmCh5,
    src.i765,
    src.cfr274a13,
    src.i290b,
    src.i290bWhen,
    src.cfr1035,
    src.pmCh8,
    src.pmCh4,
    src.sisOpt,
    src.sisTerminate,
    src.sisComplete,
    src.iceEmployment,
    src.iceTravel,
    src.i539,
    src.premium,
  ],
  related: [
    { label: 'OPT application denied: reasons and next steps', href: '/blog/opt-application-denied' },
    { label: 'The 60-day grace period for F-1 students', href: '/blog/60-day-grace-period-f1-students' },
    { label: 'What happens if OPT expires', href: '/blog/what-happens-if-opt-expires' },
    { label: 'Fell out of F-1 status? Your options', href: '/blog/fall-out-of-f1-status-options' },
    { label: 'OPT approval and denial rates in 2026', href: '/blog/opt-approval-denial-rate-2026' },
  ],
});
