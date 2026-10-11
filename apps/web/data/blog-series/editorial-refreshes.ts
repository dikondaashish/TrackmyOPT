import { defineArticle, source } from './shared';
import { trackingSources as s } from './tracking-guides';
import type { ResearchArticle } from './types';

export const fixedAdmissionCourtOrder = {
  label: 'September 14, 2026 order postponing the D/S final rule',
  publisher: 'U.S. District Court for the District of Massachusetts',
  url: 'https://storage.courtlistener.com/recap/gov.uscourts.mad.305059/gov.uscourts.mad.305059.51.0.pdf',
};
export const fixedAdmissionLitigation = {
  label: 'Duration of Status litigation: current case status',
  publisher: 'Presidents’ Alliance (plaintiff)',
  url: 'https://www.presidentsalliance.org/duration-of-status-litigation/',
};
const optRule = {
  label:
    'Pre-rule OPT filing requirements (8 CFR 214.2(f), September 14, 2026)',
  publisher: 'eCFR / Office of the Federal Register',
  url: 'https://www.ecfr.gov/on/2026-09-14/title-8/chapter-I/subchapter-B/part-214/section-214.2#p-214.2(f)',
};
const i983Instructions = {
  label: 'Form I-983 instructions',
  publisher: 'ICE SEVP',
  url: 'https://www.ice.gov/doclib/sevis/pdf/i983Instructions.pdf',
};

export const editorialRefreshes: ResearchArticle[] = [
  defineArticle({
    slug: 'opt-premium-processing-fee-increase-1780',
    title:
      'OPT Premium Processing: $1,780 Fee, 30 Business Days and When It Helps',
    seoTitle: 'OPT Premium Processing: $1,780 Fee and 30 Business Days',
    description:
      'See the current OPT premium-processing fee, how the 30-business-day USCIS action clock works, and what to weigh before paying for Form I-907.',
    category: 'USCIS',
    tags: [
      'OPT premium processing fee 2026',
      'I-907 fee',
      'OPT premium processing worth it',
      '30 business days I-765',
    ],
    readTime: '6 min read',
    publishedDate: '2026-07-14',
    modifiedDate: '2026-10-11',
    showContents: true,
    image: '/blog/opt-premium-processing-fee-increase-1780.png',
    imageAlt:
      'Calculator and immigration-document illustration for the OPT premium-processing cost decision.',
    directAnswer:
      'The additional Form I-907 premium-processing fee for eligible OPT/STEM I-765 applications is $1,780, effective March 1, 2026. The applicable USCIS action period is 30 business days—not calendar days. It covers an adjudicative action, which can include an RFE or denial; it does not guarantee approval or EAD delivery within that period.',
    keyTakeaways: [
      'The $1,780 is additional to applicable I-765 filing fees.',
      'Weekends, federal holidays, and relevant federal closures are excluded from the business-day clock.',
      'An RFE or NOID stops the clock; a new period starts when USCIS receives the response.',
      'USCIS premium processing is separate from TrackMyOPT Pro monitoring.',
    ],
    sections: [
      {
        heading: 'What changed—and what the fee buys',
        paragraphs: [
          'DHS’s inflation adjustment took effect on March 1, 2026. For eligible F-1 pre-completion OPT, post-completion OPT, and STEM OPT I-765 applications, the premium-processing request uses Form I-907 and an additional $1,780 fee. Check the current USCIS form page, instructions, payment requirements, and eligibility before submitting a request.',
          'Premium processing buys a defined period for a qualifying USCIS action. It does not buy a favorable decision or waive the underlying eligibility rules. USCIS may approve, deny, issue a request for evidence, or issue a notice of intent to deny within the applicable period. A request for evidence means there is still work to do.',
          'The base I-765 fee and any other applicable filing charges are separate. Use the live USCIS fee calculator and form instructions rather than an old screenshot, especially when deciding whether to file online or by mail. This article’s stated premium fee is current as of its modification date; it is not a promise that fees never change.',
        ],
        sources: [s.premium, source.pp],
        links: [
          {
            label: 'USCIS Fee Calculator',
            href: 'https://www.uscis.gov/feecalculator',
          },
        ],
      },
      {
        heading: 'How the 30-business-day OPT clock works',
        paragraphs: [
          'Thirty business days can cover substantially more than thirty calendar days. The regulation excludes weekends, federally observed holidays, and relevant days when federal offices are closed. Do not put a calendar-day deadline in an employer email or compare the clock with a regular-processing estimate.',
          'For the applicable I-765 premium service, the clock starts when USCIS has the request, required fees, and all prerequisites for adjudication. If an RFE or NOID is issued, the period stops. When USCIS receives the response, a new applicable premium period begins. It is not simply the unused portion of the original countdown.',
          'The regulation generally requires a premium-fee refund if USCIS fails to take the specified action in time, while continuing to process the case. It also contains an exception involving fraud or misrepresentation investigations. Follow the current USCIS contact instructions for the request instead of treating a blog calculator as the agency’s final deadline determination.',
        ],
        sources: [s.premium],
        links: [
          {
            label: 'RFE response steps and premium-clock restart',
            href: '/answers/what-is-rfe-uscis',
          },
        ],
      },
      {
        heading: 'When paying may be worth considering',
        paragraphs: [
          'Start with the consequence of waiting. Do you have a time-sensitive job opportunity with a flexible employer, or a proposed start that depends on receiving the EAD? Compare that consequence with the additional fee and your budget. Ask your DSO about your OPT dates and discuss the practical employment plan with the employer.',
          'Premium processing may reduce uncertainty about when USCIS must take an action, but an RFE, denial, or card-delivery issue can still affect the start. Before paying, correct known filing problems through the appropriate process. A faster review does not fix missing eligibility or evidence.',
          'Do not base the decision only on another student’s approval. Their filing date, category, documents, and processing track may differ. A community estimate can support planning if the comparison is appropriate, but it cannot show whether your application will require additional review.',
        ],
        sources: [source.opt],
        links: [
          {
            label: 'Check a community-based OPT decision window',
            href: '/tools/opt-decision-window',
          },
        ],
      },
      {
        heading: 'Example: Elena weighs a job start against the cost',
        paragraphs: [
          'Fictional example: Elena’s post-completion OPT application is pending, and an employer wants her to start in several weeks. She first asks whether the start can move if the EAD is delayed. She reviews her requested dates with the DSO and checks the official processing information.',
          'She then considers the $1,780 additional fee against her savings and the job’s timing. If she requests premium processing, she explains that the service requires a qualifying action within the applicable business-day period, not a guaranteed card in her mailbox by the proposed start.',
          'If an RFE arrives, Elena responds to the actual notice and revisits the employer plan. If approval arrives, she still checks the EAD dates and delivery requirements. This is a better decision process than paying solely because a changing myProgress estimate feels alarming.',
        ],
      },
      {
        heading: 'STEM OPT needs a separate employment check',
        paragraphs: [
          'A timely and properly filed STEM OPT extension can have a separate continuation-of-employment rule for eligible students while the application is pending. Do not assume every renewal is covered, and do not confuse that STEM-specific rule with general automatic EAD-renewal guidance for other categories.',
          'Ask the DSO and employer to confirm your eligibility, filing timing, and the documents supporting continued employment. If you already have a lawful continuation period and no other urgent need, the premium fee may provide less practical value. If a different timing issue matters, assess that issue on its own rather than calling premium processing universally necessary or unnecessary.',
        ],
        sources: [optRule, source.stem],
        links: [
          {
            label: 'STEM OPT extension guide',
            href: '/blog/stem-opt-extension-guide',
          },
        ],
      },
      {
        heading: 'Upgrading a pending application and watching delivery',
        paragraphs: [
          'Eligible pending cases can request premium processing using the current I-907 instructions. Confirm how to associate the request with the existing I-765, how to pay, and which filing method applies. Keep the confirmation and any notices so you can distinguish the upgrade request from the original application.',
          'After approval, card production, mailing, and delivery remain separate milestones. Keep the USCIS address current and watch official tracking where available. TrackMyOPT Pro can help monitor status changes, but its subscription is not USCIS premium processing and does not accelerate the government’s review or postal delivery.',
        ],
        sources: [source.pp, s.address],
        links: [
          {
            label: 'Moving while OPT is pending',
            href: '/blog/moving-while-opt-pending-ead-delivery',
          },
          {
            label: 'myProgress estimates explained',
            href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
          },
        ],
      },
    ],
    checklist: [
      'Verify current I-907 eligibility, fee, and instructions.',
      'Discuss the job-start consequences and budget.',
      'Use business days and account for any notice-related restart.',
      'Keep approval, card delivery, and work authorization separate.',
    ],
    mistakes: [
      'Counting 30 calendar days.',
      'Assuming premium processing guarantees approval.',
      'Confusing a TrackMyOPT subscription with a USCIS premium request.',
    ],
    faq: [
      {
        question: 'How much does OPT premium processing cost?',
        answer:
          'The additional I-907 fee is $1,780 for eligible OPT/STEM I-765 cases, effective March 1, 2026. Other applicable filing fees are separate; verify current USCIS instructions before paying.',
      },
      {
        question: 'Is the OPT premium period 30 calendar days?',
        answer:
          'No. The applicable period is 30 business days under the regulation, excluding weekends, federal holidays, and relevant federal-office closures.',
      },
      {
        question: 'What happens to the premium clock after an RFE?',
        answer:
          'An RFE or NOID stops the clock. A new applicable period begins when USCIS receives the response, as described in 8 CFR 106.4.',
      },
      {
        question:
          'Does paying guarantee that my EAD arrives in 30 business days?',
        answer:
          'No. The period covers an adjudicative action, not guaranteed approval or physical card delivery.',
      },
    ],
    sources: [s.premium, source.pp, source.opt, source.stem, optRule],
    related: [
      {
        label: 'OPT processing time guide',
        href: '/blog/opt-processing-time-2026',
      },
      {
        label: 'OPT myProgress explained',
        href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
      },
      {
        label: 'STEM OPT processing time guide',
        href: '/blog/stem-opt-processing-time-2026',
      },
    ],
    cta: 'case-status',
  }),
  defineArticle({
    slug: 'i-983-training-plan-guide',
    title: 'I-983 Training Plan: A Section-by-Section STEM OPT Guide',
    seoTitle: 'I-983 Training Plan: Sections, Examples and Evaluations',
    description:
      'Complete the I-983 with your STEM OPT employer, write specific training goals, and understand signatures, material changes, and required evaluations.',
    category: 'STEM OPT',
    tags: [
      'I-983 training plan',
      'I-983 example',
      'STEM OPT training goals',
      'I-983 evaluation',
    ],
    readTime: '6 min read',
    publishedDate: '2026-03-17',
    modifiedDate: '2026-10-11',
    showContents: true,
    image: '/blog/i-983-training-plan-guide.png',
    imageAlt:
      'Illustration of a student and employer reviewing a STEM OPT training plan.',
    directAnswer:
      'Form I-983 is the STEM OPT training plan completed by the student and employer and provided to the DSO. Explain how the job builds on your STEM degree, who supervises you, and how progress is measured. Keep the plan accurate throughout employment; evaluations and material changes require follow-up, not just the initial signature.',
    keyTakeaways: [
      'The training plan must describe the real job, employer, supervision, and learning goals.',
      'Coordinate with the DSO before the STEM OPT recommendation and filing.',
      'Report material changes and complete the required evaluations.',
      'Sample wording is a structure to adapt, not evidence that your arrangement qualifies.',
    ],
    sections: [
      {
        heading: 'Before writing: gather the facts with your employer',
        paragraphs: [
          'Use the current official Form I-983 and instructions. Gather your student information, degree details, employer legal name, EIN, E-Verify information required for the STEM OPT process, worksite, compensation, hours, and supervisor details. Confirm those facts with the employer instead of guessing from a public website.',
          'Ask the DSO which school fields and submission process apply. A school may require its own review before making the STEM OPT recommendation. Start early enough to correct an incomplete plan without pushing the I-765 filing past the applicable deadlines.',
          'The form is a substantive training agreement, not a generic job description. The employer must be able to make the certifications and deliver the supervision described. If the arrangement involves staffing, remote supervision, or more than one entity, discuss the actual structure with the DSO and qualified counsel rather than copying another student’s form.',
        ],
        sources: [source.i983, i983Instructions, source.stem],
      },
      {
        heading: 'Student, employer, and certification sections',
        paragraphs: [
          'Complete the student information and certification accurately, including the degree and requested training period. Use the employer’s official information in the employer section, and identify the people authorized to make the required certifications. Read each certification before signing; signatures should reflect an understanding of the real arrangement.',
          'The student and employer have different responsibilities. A student can draft a description for discussion, but should not invent an employer’s supervision plan, compensation commitment, or evaluation method. The employer must review the final plan and provide the required signature through an acceptable method under the current instructions.',
          'Keep the signed version and the DSO submission record. If the DSO asks for corrections, make them with the employer and save the final version. A screenshot of a signature page alone is not a reliable record of the full plan that was agreed.',
        ],
        sources: [i983Instructions],
        numbered: [
          'Verify student and degree fields with the I-20 and school.',
          'Confirm employer and worksite information with HR or the supervisor.',
          'Read certifications together.',
          'Sign, submit through the DSO’s process, and save the final plan.',
        ],
      },
      {
        heading: 'Write training goals that connect the job to the degree',
        paragraphs: [
          'Describe what the student will do, which degree-based knowledge the work uses, and what new skills the training develops. Specific goals are easier to understand than “gain professional experience.” Use responsibilities, tools, and learning outcomes that actually match the job.',
          'Explain the learning process. Will the student work on increasingly complex projects, receive code or design reviews, shadow a qualified colleague, or practice a particular research method? Choose details the employer can deliver. Avoid promising advanced work that is absent from the actual role.',
          'A useful structure is: degree knowledge → real work → supervised learning → observable progress. The goal is clarity, not legal-sounding language. Generic copy can hide gaps that a direct description would reveal.',
        ],
        sources: [source.i983, i983Instructions],
      },
      {
        heading: 'Example: Nina drafts a data-engineering training goal',
        paragraphs: [
          'Fictional example: Nina has a qualifying STEM degree and a data-engineering role. Her first draft says, “I will learn data engineering.” Her supervisor asks what that means in this team’s daily work.',
          'They revise the draft to describe building and testing data pipelines using the database and programming concepts from her degree. They identify supervised code reviews, weekly technical feedback, and measures such as documented tests and explanations of design choices. They also confirm the worksite, hours, and compensation.',
          'This is illustrative wording, not an approved template or a determination that Nina qualifies. Another student should replace the details with the actual degree, job, and supervision. If a supervisor cannot explain how progress will be assessed, the plan needs more discussion before signature.',
        ],
      },
      {
        heading: 'Explain supervision and measures of progress',
        paragraphs: [
          'Name the oversight structure and how the employer checks learning. An evaluation method can include review of completed work, feedback against defined goals, project discussions, or documented skills assessments. It should be concrete enough that the student and supervisor know what to do during the training period.',
          'Remote work does not remove the need for real oversight. Describe how supervision operates in the actual arrangement and ask the DSO about any worksite or reporting questions. The form should remain consistent with how the employer really manages the student.',
          'Submit the completed plan to the DSO through the school’s process. Form I-983 is generally retained through the school process for the STEM OPT recommendation; follow current USCIS filing instructions and any specific evidence request rather than automatically attaching every document to the I-765.',
        ],
        sources: [source.i983, source.stem, source.i765],
      },
      {
        heading: 'Evaluations, material changes, and a new employer',
        paragraphs: [
          'The student completes the required progress evaluations and the employer reviews and signs them. The official instructions describe the first evaluation at 12 months and the final evaluation at the conclusion of training, including when employment ends early. Submit the required evaluation to the DSO no later than 10 days after the relevant reporting period ends.',
          'A new employer requires a new plan and the applicable reporting steps. Do not keep using a previous employer’s I-983 because the job title is similar. Coordinate the old employment’s final evaluation and the new plan with the DSO.',
          'Material changes can include certain employer-identity changes, a compensation reduction unrelated to reduced hours, significant hour changes, or changes to learning objectives and employer commitments. Report changes promptly through the DSO’s required process. Keep separate reminders for the six-month STEM validation and the I-983 evaluations; they are related responsibilities with different submissions.',
        ],
        sources: [source.i983, i983Instructions, optRule],
        links: [
          {
            label: 'Moving during a pending OPT/STEM application',
            href: '/blog/moving-while-opt-pending-ead-delivery',
          },
          {
            label: 'STEM OPT extension requirements',
            href: '/blog/stem-opt-extension-guide',
          },
        ],
      },
    ],
    checklist: [
      'Download the current official form and instructions.',
      'Verify student, employer, worksite, hours, and compensation.',
      'Write degree-related goals, supervision, and progress measures.',
      'Obtain the required signatures and DSO review.',
      'Calendar evaluations and report material changes.',
    ],
    mistakes: [
      'Copying another student’s plan unchanged.',
      'Describing supervision that does not exist.',
      'Treating the initial signature as the end of reporting.',
    ],
    faq: [
      {
        question: 'Who completes Form I-983?',
        answer:
          'The student and employer complete and sign their respective sections and provide the plan to the DSO through the school’s process.',
      },
      {
        question: 'Can I copy the example training goal?',
        answer:
          'Use its structure for discussion, but replace it with the actual degree, duties, supervision, and evaluation method. Example wording does not establish eligibility.',
      },
      {
        question: 'When are the I-983 evaluations due?',
        answer:
          'The instructions require a first evaluation at 12 months and a final evaluation at the end of training, including an early end. Submit the required evaluation to the DSO within 10 days after the relevant period ends.',
      },
      {
        question: 'Do I need a new I-983 when changing employers?',
        answer:
          'Yes. Coordinate the new employer’s plan, reporting, and the previous training’s final evaluation with your DSO.',
      },
    ],
    sources: [source.i983, i983Instructions, source.stem, source.i765, optRule],
    related: [
      {
        label: 'STEM OPT extension guide',
        href: '/blog/stem-opt-extension-guide',
      },
      {
        label: 'STEM OPT processing time',
        href: '/blog/stem-opt-processing-time-2026',
      },
      { label: 'OPT timeline tool', href: '/tools/opt-clock' },
    ],
    cta: 'opt-timeline',
  }),
  defineArticle({
    slug: 'spring-graduates-opt-application-timing-2026',
    title: 'When to Apply for OPT: Spring and December Graduation Examples',
    seoTitle: 'When to Apply for OPT: Spring and December Filing Dates',
    description:
      'Plan your post-completion OPT filing window using the I-20 program end date, the DSO recommendation, and clear May and December graduation examples.',
    category: 'OPT Basics',
    tags: [
      'when to apply for OPT',
      'December graduation OPT',
      'OPT filing window',
      '30 day DSO recommendation',
    ],
    readTime: '6 min read',
    publishedDate: '2026-05-29',
    modifiedDate: '2026-10-11',
    showContents: true,
    statusNote:
      'Checked October 11, 2026: the September 14 court order postponed the fixed-admission rule, and the plaintiffs’ current litigation page reports that it remains blocked nationwide. The examples below use the pre-rule 60-day post-program filing window. Current codified text can show the postponed 30-day change; confirm the latest court and DSO guidance before filing.',
    image: '/blog/spring-graduates-opt-application-timing-2026.png',
    imageAlt:
      'Illustration of a graduate planning an OPT application calendar.',
    directAnswer:
      'For ordinary post-completion OPT, USCIS must receive the I-765 no earlier than 90 days before and no later than 60 days after the program end date. You must also file within 30 days after the DSO enters the OPT recommendation in SEVIS. Use the program end date on the I-20—not the commencement ceremony—and confirm your specific dates with the DSO.',
    keyTakeaways: [
      'The program-end window and DSO-recommendation window both apply.',
      'A requested OPT start date is separate from the filing date and actual work authorization.',
      'December graduates use the same ordinary rules as spring graduates.',
      'A school’s internal review deadline may be earlier than the USCIS filing deadline.',
    ],
    sections: [
      {
        heading: 'Start with the I-20 program end date',
        anchors: ['key-dates'],
        paragraphs: [
          'Graduation ceremonies and program completion are not always on the same day. Read the program end date on the I-20 and ask the DSO to confirm it if your completion plans change. Do not calculate an immigration filing window from the date printed on an invitation or commencement schedule.',
          'This guide covers ordinary post-completion OPT. Pre-completion OPT and STEM OPT use different requirements, so do not reuse these examples for every I-765 category. If your situation involves an unusual completion arrangement or a changed program date, get a school review before filing.',
          'Create a calendar with four separate items: program end, earliest I-765 receipt date, latest I-765 receipt date, and the deadline tied to the DSO recommendation. Add the school’s own application or review deadline. This makes it easier to see which requirement is actually the limiting one.',
        ],
        sources: [
          optRule,
          source.opt,
          fixedAdmissionCourtOrder,
          fixedAdmissionLitigation,
        ],
        links: [
          {
            label: 'OPT application checklist',
            href: '/blog/opt-application-checklist-2026',
          },
        ],
      },
      {
        heading: 'Two filing windows must overlap',
        anchors: ['timeline'],
        paragraphs: [
          'The ordinary program-based window opens 90 days before the program end date and closes 60 days after it. A separate rule requires filing within 30 days after the DSO enters the post-completion OPT recommendation in SEVIS. Being inside the larger window does not rescue a stale recommendation.',
          'For a paper filing, plan around USCIS receipt rather than assuming a postmark satisfies the deadline. For an online filing, verify submission and save the confirmation. Leave time for document review and technical problems; the last permissible day is a boundary, not a sensible target.',
          'If the DSO recommendation is old or a filing problem arises, contact the school promptly. Do not assume changing a date yourself or filing a duplicate application will fix the issue. The appropriate next step depends on the record and what USCIS has actually received or rejected.',
        ],
        sources: [optRule, source.i765, fixedAdmissionCourtOrder],
        numbered: [
          'Confirm the program end date.',
          'Calculate the 90-days-before and 60-days-after boundaries.',
          'Record the SEVIS recommendation date with the DSO.',
          'File within both applicable windows and save proof of submission.',
        ],
      },
      {
        heading: 'Spring example: a May 15, 2026 program end',
        paragraphs: [
          'Fictional calendar example: Sam’s I-20 program end date is May 15, 2026. Under the ordinary rule, the program-based I-765 window runs from February 14 through July 14, 2026. These dates are arithmetic examples, not a confirmation that Sam is eligible.',
          'If Sam requests the DSO recommendation well before he is ready to submit, the separate 30-day recommendation rule can become the earlier deadline. He therefore coordinates the school request with his document preparation and checks the SEVIS recommendation date before filing.',
          'Sam also discusses the requested start date with the DSO. The filing window does not mean he can work whenever he wants within it. He must satisfy the applicable authorization and documentation requirements before beginning employment.',
        ],
        sources: [optRule, fixedAdmissionCourtOrder],
      },
      {
        heading: 'December example: a December 15, 2026 program end',
        paragraphs: [
          'Fictional calendar example: Leena’s I-20 program end date is December 15, 2026. The ordinary program-based filing window runs from September 16, 2026 through February 13, 2027. The winter ceremony date does not replace the I-20 date used for this calculation.',
          'Leena checks the international office’s winter closure and internal review schedule. She prepares the passport, I-20, photo, prior authorization records, and other required documents before asking for the recommendation. She then verifies that the actual submission stays inside both filing windows.',
          'A school closure or postal delay does not automatically extend a USCIS deadline. Leena plans a buffer for review and submission rather than waiting until the last day. If the program date changes, she asks the DSO to review the calendar again.',
        ],
        sources: [optRule, fixedAdmissionCourtOrder],
        note: 'December graduation changes the dates, not the ordinary post-completion OPT filing rules. Confirm school review deadlines before holiday closures.',
      },
      {
        heading: 'Choose the requested start date with a practical plan',
        anchors: ['processing-times', '14-month-cap', 'grace-period'],
        paragraphs: [
          'For ordinary post-completion OPT, the requested start falls within the permitted period after program completion. Discuss the date with the DSO and consider the job search, potential employer timing, and the limits on the authorization period. A later requested start is not a guarantee that USCIS will decide or deliver the card by then.',
          'Under the pre-rule framework discussed here, post-completion OPT generally must finish within 14 months of program completion. A delayed decision can therefore affect the usable period. Ask the DSO to review the actual approval and dates instead of assuming every delay preserves a full 12 months.',
          'A grace period is not permission to work. A pending application also needs its own eligibility and status review; ask the DSO about your situation rather than equating the filing-window end with a work-start date.',
          'After approval, check the actual EAD dates and the documents required to start work. Unemployment counting relates to the authorized OPT period and qualifying employment, not simply the date of the graduation ceremony. Use your approved dates rather than an old requested date when updating a planning tool.',
          'If the application is delayed, keep the employer informed without promising an approval date. A myProgress estimate or community timeline can help with planning, but neither changes the filing rules or creates permission to begin work.',
        ],
        sources: [source.opt, optRule],
        links: [
          {
            label: 'myProgress says taking longer than expected',
            href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
          },
          { label: 'Count OPT unemployment days', href: '/tools/opt-clock' },
        ],
      },
      {
        heading: 'After filing: verify receipt, notices, and delivery',
        anchors: ['after-filing'],
        paragraphs: [
          'Save the submitted application and confirmation. Once the receipt is available, check the official status and read any notices. If the receipt number fails, troubleshoot the identifier and filing records instead of assuming the case is pending or denied.',
          'Keep your mailing address current with USCIS and your student records if you move. USPS forwarding is not enough for USCIS mail. Watch separate approval, card-production, and delivery updates, and use the official nondelivery guidance if a notice or card is missing.',
          'Premium processing is an optional separate decision for eligible cases; it does not expand the initial filing window or cure an untimely application. Review the additional fee and business-day action clock only after you understand the underlying OPT timeline.',
        ],
        sources: [s.address, source.pp],
        links: [
          {
            label: 'Receipt number troubleshooting',
            href: '/blog/opt-receipt-number-not-working',
          },
          {
            label: 'Moving while OPT is pending',
            href: '/blog/moving-while-opt-pending-ead-delivery',
          },
          {
            label: 'OPT premium-processing tradeoffs',
            href: '/blog/opt-premium-processing-fee-increase-1780',
          },
        ],
      },
    ],
    checklist: [
      'Confirm the I-20 program end with the DSO.',
      'Record both filing windows and the school deadline.',
      'Prepare and review the required documents.',
      'Save submission evidence and monitor notices.',
      'Verify approved EAD dates before planning work.',
    ],
    mistakes: [
      'Using the commencement ceremony instead of the I-20 program end.',
      'Ignoring the separate 30-day DSO recommendation rule.',
      'Treating a requested start date as current work authorization.',
    ],
    faq: [
      {
        question: 'Do December graduates have a different OPT filing rule?',
        answer:
          'The ordinary post-completion OPT rules are the same; the calendar dates differ. School review deadlines and holiday closures should also be planned for.',
      },
      {
        question: 'Can I file 60 days after graduation with any old OPT I-20?',
        answer:
          'The program-based window is only one requirement. You must also satisfy the 30-day rule tied to the DSO’s SEVIS recommendation and the other eligibility requirements.',
      },
      {
        question:
          'Which date should I use if commencement is later than program completion?',
        answer:
          'Use the program end date on the I-20, confirmed with your DSO. The ceremony date does not automatically determine the OPT window.',
      },
      {
        question: 'Does premium processing extend my OPT filing deadline?',
        answer:
          'No. A premium request does not waive or expand the underlying filing window or eligibility requirements.',
      },
    ],
    sources: [
      optRule,
      source.opt,
      source.i765,
      s.address,
      source.pp,
      fixedAdmissionCourtOrder,
      fixedAdmissionLitigation,
    ],
    related: [
      {
        label: 'OPT application checklist',
        href: '/blog/opt-application-checklist-2026',
      },
      {
        label: 'OPT processing time guide',
        href: '/blog/opt-processing-time-2026',
      },
      { label: 'OPT timeline tool', href: '/tools/opt-clock' },
    ],
    cta: 'opt-timeline',
  }),
];
