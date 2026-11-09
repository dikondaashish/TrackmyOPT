import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "uscis is issuing requests for evidence with shortened response periods"
// (460 impressions a quarter at position 3.8), "rfe" (247 at position 25),
// "opt noid" (54) and "opt rfe" (41) had no OPT-specific RFE guide. Every
// rule below was checked on 2026-11-08 against the USCIS Policy Manual
// (Vol. 1, Part E, Ch. 6), 8 CFR 103.2, 8 CFR 106.4, 8 CFR 214.2, 8 CFR
// 274a.12, the Form I-765 instructions and the USCIS premium processing page.
// The RFE topics table uses only reasons documented in USCIS instructions or
// published school guidance. No percentages: none are published.

const src = {
  policyManual: {
    label: 'Policy Manual, Volume 1, Part E, Chapter 6: Evidence',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-1-part-e-chapter-6',
  },
  evidenceAlert: {
    label: 'USCIS to Reduce Frivolous Immigration Benefits Requests by Reinforcing Evidence Standards (August 5, 2026)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/newsroom/alerts/uscis-to-reduce-frivolous-immigration-benefits-requests-by-reinforcing-evidence-standards',
  },
  policyAlert: {
    label: 'Policy Alert PA-2026-05: Evidentiary Standards (August 5, 2026)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20260805-EvidentiaryStandards.pdf',
  },
  cfr1032: {
    label: '8 CFR 103.2: Submission and adjudication of benefit requests',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-103/section-103.2',
  },
  cfr1064: {
    label: '8 CFR 106.4: Premium processing service',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-106/section-106.4',
  },
  cfr2142: {
    label: '8 CFR 214.2(f): F-1 students, including practical training',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  cfr274a12: {
    label: '8 CFR 274a.12(b)(6)(iv): STEM OPT automatic extension',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.12',
  },
  i765Instructions: {
    label: 'Instructions for Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf',
  },
  premium: {
    label: 'How Do I Request Premium Processing?',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
  },
  status: {
    label: 'Check your immigration case status',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  sjsu: {
    label: 'Rejections, Denials, and RFEs for Post-Completion OPT',
    publisher: 'San José State University, International Student & Scholar Services',
    url: 'https://gcp-web.sjsu.edu/isss/docs/rejections-denials-rfes.pdf',
  },
  bu: {
    label: 'Resolving Common OPT Issues Post Application',
    publisher: 'Boston University, International Students & Scholars Office',
    url: 'https://www.bu.edu/isso/international-students/off-campus-student-employment-training/optional-practical-training-opt-f-1/resolving-common-opt-issues-post-application/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'opt-rfe-request-for-evidence-i765';

export const optRfeGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'processing-times',
  title:
    'OPT RFE Guide: What a USCIS Request for Evidence on Your I-765 Means and How to Respond',
  seoTitle: 'OPT RFE: How to Respond to a USCIS Request for Evidence',
  description:
    'Got an RFE on your OPT or STEM OPT I-765? Learn the common reasons, how to read the deadline under the August 2026 USCIS policy, how to send one complete response, and what happens next.',
  category: 'USCIS',
  tags: [
    'OPT RFE',
    'request for evidence',
    'I-765 RFE',
    'STEM OPT RFE',
    'RFE response deadline',
    'OPT NOID',
  ],
  readTime: '10 min read',
  publishedDate: '2026-10-27',
  modifiedDate: '2026-11-08',
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: what a Request for Evidence on an OPT I-765 means, the response deadline and the premium processing clock.',
  imageCaption:
    'An RFE pauses the decision until USCIS receives your response. Generated from the USCIS rules described in this guide.',
  directAnswer:
    'An RFE (Request for Evidence) is a USCIS notice asking for more documents before it decides your OPT or STEM OPT Form I-765. Read the full notice, find the deadline printed on it, and send every requested item together in one response, with the notice on top. Since August 5, 2026, officers may set a response period shorter than the 12-week maximum. Extensions are not allowed.',
  keyTakeaways: [
    'The deadline on your notice controls. For Form I-765 the maximum is 84 days, but an officer may set a shorter period that fits the evidence requested.',
    'USCIS cannot extend an RFE deadline. A partial response is treated as a request to decide the case on the record you have sent.',
    'Common OPT RFE topics are documented: unclear photo ID, photos that do not meet the specifications, wrong or missing form details, mismatched names or dates, and proof of eligibility.',
    'With premium processing, the 30-business-day clock stops at the RFE and a new 30-business-day period starts when USCIS receives your response.',
    'A NOID is more serious than an RFE. It signals an intent to deny and allows at most 30 days to respond.',
  ],
  sections: [
    {
      heading: 'What an RFE on an OPT or STEM OPT I-765 is',
      paragraphs: [
        'A Request for Evidence is a written notice from USCIS. It says your Form I-765 does not yet show that you qualify, and it lists what USCIS needs to decide the case. It is not a denial. Your case stays pending while you respond.',
        'An RFE can arrive on any OPT category. That includes pre-completion OPT (c)(3)(A), post-completion OPT (c)(3)(B) and the 24-month STEM OPT extension (c)(3)(C). The rules for responding are the same for each one.',
        'Your online case status will usually show that a Request for Evidence was sent. The status message is only a summary. The notice itself, by mail or in your USCIS online account, has the list of items and the deadline.',
      ],
      links: [
        {
          label: 'What is an RFE from USCIS? Short answer',
          href: '/answers/what-is-rfe-uscis',
        },
        {
          label: 'EAD card status: every USCIS status message explained',
          href: '/blog/ead-card-status-check',
        },
      ],
      sources: [src.policyManual, src.status],
    },
    {
      heading: 'Why OPT applicants get RFEs: documented reasons',
      paragraphs: [
        'USCIS does not publish how often each RFE reason appears on OPT cases. What it does publish is the evidence the Form I-765 instructions require. School international offices have also described the RFEs their students receive. The table below uses only those sources.',
        'School guidance describes most OPT RFEs as relatively minor corrections or clarifications. Some problems usually lead to a denial instead of an RFE. One example is filing more than 30 days after your DSO recommended post-completion OPT in SEVIS. The I-765 instructions say USCIS will deny that request.',
      ],
      table: {
        caption:
          'Common RFE topics on OPT and STEM OPT I-765 filings, and the evidence that usually answers each. Always send exactly what your own notice asks for.',
        columns: ['RFE topic', 'What evidence usually answers it', 'Where it is documented'],
        rows: [
          [
            'Identity could not be confirmed from the photo ID copy',
            'A clear color copy of your last EAD (front and back), or of a government photo ID such as your passport biographic page',
            'I-765 instructions; SJSU ISSS sample RFE',
          ],
          [
            'Photos missing, old or not to specification',
            'Two new identical 2 x 2 inch color passport-style photos that meet the I-765 photo rules',
            'I-765 instructions; SJSU ISSS',
          ],
          [
            'A form item is wrong or blank, such as the I-94 number or last entry date',
            'The corrected information and a printout of your electronic I-94 from CBP',
            'I-765 instructions; SJSU ISSS',
          ],
          [
            'Name, date or visa class does not match across the I-20, I-94 and passport',
            'Documents showing the correct details. Ask your DSO if the I-20 or SEVIS record needs a correction',
            'SJSU ISSS',
          ],
          [
            'Proof that you met OPT eligibility, such as one full academic year of study',
            'An academic transcript or a school letter, usually obtained through your international office',
            'SJSU ISSS',
          ],
          [
            'Prior CPT or OPT history unclear',
            'Evidence of each prior CPT or OPT authorization and the degree level, plus any earlier SEVIS numbers',
            'I-765 instructions',
          ],
          [
            'STEM degree not shown to be on the STEM Designated Degree Program List',
            'Your diploma or transcript showing the degree. For a prior STEM degree, also proof the school is accredited and SEVP-certified',
            'I-765 instructions',
          ],
          [
            'STEM employer E-Verify details missing or unclear',
            'The employer name exactly as listed in E-Verify and its E-Verify Company ID or Client Company ID',
            'I-765 instructions',
          ],
          [
            'Passport expired or close to expiry',
            'A copy of your renewed or valid passport',
            'SJSU ISSS',
          ],
          [
            'Questions about employment history or maintenance of status',
            'Whatever records your DSO identifies for the specific question. BU ISSO encourages an immigration attorney for complex RFEs',
            'BU ISSO',
          ],
        ],
      },
      note: 'Treat this table as a map, not a checklist to send in full. School guidance, such as SJSU ISSS, advises sending exactly what the RFE asks for and no more than necessary.',
      sources: [src.i765Instructions, src.sjsu, src.bu],
    },
    {
      heading: 'How to read the notice and find your real deadline',
      paragraphs: [
        'Start with the date the response must be received by. The RFE must state that deadline clearly. That printed date is the one that matters, not a number you read online.',
        'For Form I-765, the USCIS Policy Manual sets the maximum RFE response period at 12 weeks, which is 84 days. Officers may set a shorter period that reflects the evidence being requested. When the RFE is mailed, USCIS adds 3 days. When it is uploaded to your online account, service is complete on the upload day, so no days are added.',
        'Weekends and holidays matter for mailed responses. If the deadline falls on a Saturday, Sunday or federal holiday, a mailed response received on the next business day is treated as timely. An online response counts as received on the day you submit it, even on a weekend.',
      ],
      numbered: [
        'Find the "response must be received by" date on the notice.',
        'List every item the notice requests, one line each.',
        'Check whether the notice tells you to respond online, by mail, or either.',
        'Note the mailing address printed on the notice if you will mail it.',
        'Send a scan of the notice to your international office the same day.',
      ],
      sources: [src.policyManual, src.cfr1032],
    },
    {
      heading: 'The August 2026 USCIS policy: shorter response periods',
      paragraphs: [
        'On August 5, 2026, USCIS updated its Policy Manual guidance on evidence, RFEs and NOIDs. It applies to cases pending on that date and to cases filed afterward, unless a regulation or other USCIS policy says otherwise. OPT and STEM OPT I-765 filings are covered.',
        'Two parts of the update matter most for an RFE. First, officers may deny a request without an RFE or NOID when required initial evidence is missing. Second, the 12-week period is a ceiling. The Policy Manual now says officers have discretion to set a response time that reflects the evidence requested. In practice, that means some RFEs give less time than applicants used to expect.',
        'The update also ended the extra 14 days USCIS used to add for notices mailed outside the United States. Only 3 days are now added for any mailed notice.',
        'Some rules did not change. The regulation already barred extensions of an RFE or NOID deadline. It also already required all requested materials to be sent together at one time. A partial response is treated as a request for a decision on the record, and USCIS will not send a second RFE because a response was incomplete.',
      ],
      links: [
        {
          label: 'USCIS can deny without an RFE: the August 2026 policy',
          href: '/blog/uscis-deny-without-rfe-policy-2026',
        },
      ],
      sources: [src.evidenceAlert, src.policyAlert, src.policyManual, src.cfr1032],
    },
    {
      heading: 'How to respond: one complete response',
      paragraphs: [
        'Send everything the notice asks for in a single response. The regulation says all requested materials must be submitted together at one time, along with the original RFE. If you cannot get one item, explain why and include any secondary evidence the notice allows, in the same package.',
        'Respond the way your notice says. If the RFE is in your USCIS online account and the notice lets you respond there, an online upload is received the day you submit it. If you mail it, put the RFE notice on top and send it to the address printed on the notice. Do not send it to the address where you first filed.',
        'A short cover letter helps the officer. List each item the notice requested and the document that answers it, in the same order. Keep a full copy of what you sent and the upload confirmation or mail tracking number.',
      ],
      numbered: [
        'Put the RFE notice on top, as the notice and regulation require.',
        'Add a one-page cover letter that lists each request and the matching document.',
        'Include every requested item, labeled in the same order as the notice.',
        'Add English translations with a translator certification for any foreign document.',
        'Submit online or by trackable mail before the deadline, and keep proof.',
      ],
      bullets: [
        'Ask your DSO before you respond. School offices such as SJSU ISSS ask students to check with them first.',
        'Do not send unrelated documents. They can slow the officer down.',
        'Respond early. The case stays on hold until USCIS receives your response.',
      ],
      sources: [src.cfr1032, src.policyManual, src.sjsu, src.bu],
    },
    {
      heading: 'What happens to the premium processing clock',
      paragraphs: [
        'Premium processing is available for OPT and STEM OPT I-765 categories (c)(3)(A), (c)(3)(B) and (c)(3)(C). USCIS lists a 30-business-day period for these requests. Business days exclude weekends, federal holidays and days federal offices are closed.',
        'An RFE stops that clock. Under 8 CFR 106.4, the premium period does not pause and continue. It stops, and a new full period starts on the date USCIS receives your response. A fast, complete response is the only way to restart it sooner.',
        'Without premium processing there is no fixed clock. The case returns to the review queue after USCIS logs your response, and the wait depends on that queue.',
      ],
      links: [
        {
          label: 'OPT premium processing timeline 2026',
          href: '/blog/opt-premium-processing-timeline-2026',
        },
      ],
      sources: [src.premium, src.cfr1064],
    },
    {
      heading: 'How an RFE delay affects your OPT dates',
      paragraphs: [
        'For post-completion OPT, employment authorization begins on the date you requested or the date USCIS decides the case, whichever is later. All practical training must also be completed within 14 months after your studies end. A long RFE delay can therefore shorten the OPT time you can actually use.',
        'You cannot start OPT work before the start date on your EAD card. An RFE does not change that rule, even if your employer is waiting.',
        'STEM OPT works differently. If you filed the extension on time and your current OPT EAD expires while it is pending, your work authorization is generally extended automatically. That extension ends on the date of the written decision and cannot exceed 180 days. A slow RFE response uses up that window.',
      ],
      links: [
        {
          label: 'STEM OPT 180-day automatic extension explained',
          href: '/blog/stem-opt-180-day-auto-extension-explained-2026',
        },
        {
          label: 'Can you start work before the OPT EAD arrives?',
          href: '/blog/can-you-start-work-before-opt-ead-arrives',
        },
      ],
      sources: [src.cfr2142, src.cfr274a12],
    },
    {
      heading: 'RFE vs NOID: how they differ',
      paragraphs: [
        'A NOID (Notice of Intent to Deny) means USCIS plans to deny the case unless you overcome the stated reasons. USCIS can also use a NOID to tell you about information against your case and give you a chance to rebut it.',
        'The response time is shorter. The maximum for a NOID is 30 days, plus 3 days if it was mailed. Like an RFE, a NOID deadline cannot be extended, and a partial response is treated as a request for a decision.',
        'Because the stakes are higher, school offices such as Boston University ISSO recommend speaking with an immigration attorney promptly after a NOID.',
      ],
      table: {
        caption: 'RFE and NOID on a Form I-765, compared.',
        columns: ['', 'RFE', 'NOID'],
        rows: [
          ['Purpose', 'Asks for missing or more evidence', 'States an intent to deny and the reasons'],
          ['Maximum response time', '84 days (12 weeks); may be shorter', '30 days'],
          ['Added if mailed', '3 days', '3 days'],
          ['Extensions', 'Not allowed', 'Not allowed'],
          ['Partial response', 'Decision on the record', 'Decision on the record'],
        ],
      },
      links: [
        {
          label: 'How to respond to a USCIS NOID on OPT',
          href: '/blog/uscis-noid-response-guide-opt',
        },
        {
          label: 'What is a NOID? Short answer',
          href: '/answers/what-is-noid-uscis',
        },
      ],
      sources: [src.policyManual, src.cfr1032, src.bu],
    },
    {
      heading: 'What comes after your response',
      paragraphs: [
        'USCIS logs the response and the case returns to review. Your online status will usually show that the response was received. After that, one of three things generally happens: an approval, a further notice such as a NOID, or a denial.',
        'If the case is approved, card production and mailing follow, as with any I-765. If it is denied, the denial notice explains the reasons and your options. Read it with your DSO, because the right next step depends on the reason and on your remaining filing window.',
        'If you do not respond by the deadline, USCIS may deny the case as abandoned, deny it on the record, or both.',
      ],
      links: [
        {
          label: 'OPT application denied: what to do next',
          href: '/blog/opt-application-denied',
        },
        {
          label: 'OPT processing time 2026, updated monthly',
          href: '/blog/opt-processing-time-2026',
        },
        {
          label: 'STEM OPT processing time 2026',
          href: '/blog/stem-opt-processing-time-2026',
        },
      ],
      sources: [src.cfr1032, src.status],
    },
    {
      heading: 'Example: Mei answers a photo ID RFE in one upload',
      paragraphs: [
        'Fictional example: Mei filed her post-completion OPT I-765 online with premium processing. Ten days later her USCIS account shows an RFE. The notice says USCIS could not confirm her identity from the passport copy she sent.',
        'The deadline on Mei’s notice is shorter than 12 weeks. She does not assume she has 84 days. She emails a scan of the notice to her DSO that afternoon and makes a clear color copy of her passport biographic page.',
        'Mei writes a one-page cover letter that names the single request and the document that answers it. She uploads one PDF, with the RFE notice first, through her online account two days later. Because she used premium processing, a new 30-business-day period starts on the day USCIS receives her upload.',
      ],
    },
  ],
  checklist: [
    'Read the full RFE notice, not just the case status message.',
    'Write down the deadline printed on the notice and plan to finish a week early.',
    'Send the notice to your DSO the same day.',
    'Put the RFE notice on top and answer every item in one response.',
    'Keep a full copy of the response and the upload or mail tracking proof.',
  ],
  mistakes: [
    'Assuming every RFE gives 12 weeks. Since August 2026 an RFE may give less.',
    'Sending part of the evidence now and planning to send the rest later.',
    'Mailing the response to the original filing address instead of the address on the notice.',
    'Sending a large stack of unrelated documents with the response.',
    'Waiting until the last week, which delays the premium clock and your OPT start.',
  ],
  faq: [
    {
      question: 'Is USCIS issuing RFEs with shortened response periods?',
      answer:
        'USCIS guidance since August 5, 2026 lets officers set an RFE response period shorter than the 12-week maximum, based on the evidence requested. The 12-week (84-day) limit for Form I-765 is still the ceiling. Always use the deadline printed on your own notice.',
    },
    {
      question: 'How long do I have to respond to an OPT RFE?',
      answer:
        'As long as the notice says, up to a maximum of 84 days for Form I-765. Add 3 days if the RFE was mailed. USCIS cannot grant extra time.',
    },
    {
      question: 'Can I respond to an OPT RFE online?',
      answer:
        'If the RFE appears in your USCIS online account and the notice allows an online response, yes. An online response counts as received on the day you submit it. Otherwise, mail it to the address on the notice with the notice on top.',
    },
    {
      question: 'Does an RFE mean my OPT will be denied?',
      answer:
        'No. An RFE means USCIS needs more evidence before deciding. School guidance describes many OPT RFEs as minor fixes, such as a clearer ID copy or new photos. A complete, on-time response gives the officer what is needed to decide.',
    },
    {
      question: 'What happens to premium processing after an RFE?',
      answer:
        'The 30-business-day premium period stops when USCIS issues the RFE. A new 30-business-day period starts on the date USCIS receives your response.',
    },
    {
      question: 'What is the difference between an OPT RFE and a NOID?',
      answer:
        'An RFE asks for more evidence. A NOID says USCIS intends to deny and explains why. A NOID allows at most 30 days to respond, and an attorney review is generally recommended.',
    },
  ],
  sources: [
    src.policyManual,
    src.evidenceAlert,
    src.cfr1032,
    src.cfr1064,
    src.cfr2142,
    src.cfr274a12,
    src.i765Instructions,
    src.premium,
    src.sjsu,
    src.bu,
  ],
  related: [
    {
      label: 'USCIS can deny without an RFE: August 2026 policy',
      href: '/blog/uscis-deny-without-rfe-policy-2026',
    },
    {
      label: 'How to respond to a USCIS NOID on OPT',
      href: '/blog/uscis-noid-response-guide-opt',
    },
    {
      label: 'OPT application denied: what to do next',
      href: '/blog/opt-application-denied',
    },
    {
      label: 'USCIS case status tracking guide',
      href: '/blog/uscis-case-status-tracking-guide',
    },
  ],
  statusNote:
    'TrackMyOPT is a case tracker, not legal advice. The RFE notice and your USCIS account are the official record. Talk to your DSO or an immigration attorney about your own case.',
});
