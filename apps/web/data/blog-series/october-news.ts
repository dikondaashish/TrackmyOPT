import { defineArticle, source } from './shared';

const optFeeProposal = {
  label:
    'Optional Practical Training Fees: October 8 proposed rule, sections V–VI',
  publisher: 'DHS / ICE, Federal Register',
  url: 'https://www.federalregister.gov/documents/2026/10/08/2026-20660/optional-practical-training-fees',
};
const optFeePdf = {
  label:
    'OPT fee proposal: original agency text and proposed transition provision',
  publisher: 'DHS / ICE',
  url: 'https://public-inspection.federalregister.gov/2026-20660.pdf',
};
const cptRegulation = {
  label: '8 CFR 214.2(f)(10): practical training regulations',
  publisher: 'Electronic Code of Federal Regulations',
  url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2',
};
const cptLawsuit = {
  label: 'October 5 CPT lawsuit and October 6 supporting memorandum',
  publisher: 'Association of American Universities (a plaintiff)',
  url: 'https://www.aau.edu/resource-library/aau-files-lawsuit-challenging-changes-to-the-curricular-practical-training-cpt-program-for-international-students',
};
const cptComplaint = {
  label: 'Filed complaint: Association of American Universities v. DHS',
  publisher:
    'Plaintiffs, U.S. District Court for the District of Massachusetts',
  url: 'https://www.aau.edu/uploads/files/general/CPT-Complaint-AAU-v.-DHS.pdf',
};
const cptMotion = {
  label: 'Motion requesting a preliminary injunction and stay of agency action',
  publisher:
    'Plaintiffs, U.S. District Court for the District of Massachusetts',
  url: 'https://www.aau.edu/uploads/files/general/Motion-for-Preliminary-Injunction-and-Stay-of-Agency-Action-CPT-Case.pdf',
};
const cptMemo = {
  label: 'October 6 memorandum supporting requested court relief',
  publisher:
    'Plaintiffs, U.S. District Court for the District of Massachusetts',
  url: 'https://www.aau.edu/uploads/files/general/Memo-in-Support-of-PI-and-Stay-AAU-v-DHS.pdf',
};
const mitCpt = {
  label: 'MIT notice on its pause in certain CPT authorizations',
  publisher: 'MIT International Students Office',
  url: 'https://iso.mit.edu/employment/f-1-curricular-practical-training/',
};

export const octoberNewsArticles = [
  defineArticle({
    slug: 'opt-fee-proposal-70000-30000-october-2026',
    title:
      'OPT Fee Proposal 2026: What the $70,000 and $30,000 Fees Would Mean',
    seoTitle: 'OPT Fee Proposal 2026: $70,000 and $30,000 Explained',
    description:
      'DHS proposed large OPT fees on October 8. Learn who would pay, how STEM OPT could be affected, the comment deadline, and what students should do now.',
    category: 'Visa Policy Update',
    tags: [
      'OPT fee proposal 2026',
      '$70,000 OPT fee',
      '$30,000 STEM OPT fee',
      'DHS OPT proposed rule',
      'F-1 students',
      'OPT fee comment deadline',
    ],
    publishedDate: '2026-10-11',
    modifiedDate: '2026-10-11',
    newsSitemapEligible: true,
    newsPublishedAt: '2026-10-12T00:27:47Z',
    readTime: '9 min read',
    cta: 'opt-timeline',
    showContents: true,
    image: '/blog/october-2026/opt-fees-cover.webp',
    imageAlt:
      'Illustration of a fictional international graduate and university adviser reviewing an OPT plan',
    imageCaption:
      'AI-generated conceptual illustration. Your school’s recommendation and your USCIS application are different steps; the proposal would add a school payment before the recommendation.',
    statusNote:
      'Verified October 11, 2026: this is a proposed rule, not an effective OPT fee requirement. The main public-comment deadline is November 9, 2026; the separate information-collection deadline is December 7. No final-rule effective date has been established by this proposal.',
    directAnswer:
      'DHS’s October 8 OPT fee proposal would require an SEVP-certified school to pay $70,000 before an initial OPT recommendation and $30,000 for subsequent OPT after the initial fee has been paid. The proposal includes STEM OPT. These amounts are not current student filing fees. Keep following today’s OPT rules and deadlines while checking your school’s guidance and the official rulemaking docket.',
    keyTakeaways: [
      'The proposal places the government-payment obligation on the school; it does not create a $70,000 bill payable today by every student.',
      'A STEM recommendation after a future effective date could trigger $70,000 if no initial fee was previously paid under the proposed system.',
      'An employer change alone would not trigger this proposed fee. A new OPT recommendation is the relevant event.',
      'A comment deadline is not an effective date. The proposed transition would begin 60 days after publication of a future final rule.',
    ],
    sections: [
      {
        heading: 'What happened on October 8, and who should read this?',
        paragraphs: [
          'The Department of Homeland Security published “Optional Practical Training Fees” as a notice of proposed rulemaking on October 8, 2026. This guide is for F-1 students preparing for graduation, students already working on post-completion OPT, and students planning a STEM OPT extension. It also helps families interpret headlines without turning a possible future cost into an immediate payment instruction.',
          'A proposal starts a rulemaking process. It does not, by itself, change your current Employment Authorization Document (EAD), approve a new application, or create a payment requirement. The useful next step is to identify your next real immigration milestone: program completion, a DSO recommendation, an I-765 filing, or an EAD expiration.',
          'Keep three dates separate when reading the news: the proposal’s publication date, its public-comment deadline, and any later final-rule effective date. Only the third would tell you when a finalized requirement starts. The final text could differ from the proposal, so a headline is not enough to plan a filing.',
        ],
        sources: [optFeeProposal],
        visual: {
          src: '/blog/october-2026/opt-fees-flow.gif',
          poster: '/blog/october-2026/opt-fees-flow.png',
          alt: 'Three-stage OPT fee flow: October 8 proposal, current rules today, and possible future final rule',
          caption:
            'Read left to right. The future stage is conditional; the GIF does not predict that the proposal will become law. Play is optional and all steps are written below.',
          steps: [
            'What happened: DHS published the proposal on October 8, 2026.',
            'What applies now: existing OPT rules and your actual filing deadlines.',
            'What comes next: comments, agency review, and a possible final rule.',
            'Only if finalized: check the final effective date and transition language.',
          ],
        },
      },
      {
        heading: 'Who would pay the $70,000 OPT fee?',
        paragraphs: [
          'Under the proposed approach, the SEVP-certified educational institution would make the government payment before its designated school official (DSO) recommends OPT in SEVIS. The first fee is proposed at $70,000. Another OPT recommendation would be subject to $30,000 after the student’s initial fee has been paid under this system.',
          'The first recommendation could be for pre-completion OPT, post-completion OPT, or a STEM OPT extension. “Initial” in this fee proposal should not be read as a guarantee that every first STEM extension costs only $30,000. The proposed transition matters for students who participated in OPT before this fee system existed.',
          'The proposal identifies the school as the payer to the government. It does not tell you what your own school will ultimately offer or what the full financial arrangements would be if a rule becomes effective. Ask the university for its written position before making tuition, loan, enrollment, or job decisions based on a guessed cost.',
        ],
        sources: [optFeeProposal, optFeePdf],
        bullets: [
          'Proposed payer: the SEVP-certified school.',
          'Proposed first fee: $70,000 before the DSO’s recommendation.',
          'Proposed later fee: $30,000 after a prior initial fee payment.',
          'Current action: verify legitimate USCIS filing instructions; do not pay a new fee from a social-media link.',
        ],
      },
      {
        heading:
          'Three fictional students: graduation, STEM OPT, and pre-completion OPT',
        paragraphs: [
          'These examples are fictional planning scenarios, not predictions, legal determinations, or stories about TrackMyOPT customers. They use the proposal as written to show which facts would matter if it were finalized without changes.',
          'Priya is finishing a master’s degree in December 2026 and preparing her first post-completion OPT application. Today, she should obtain her DSO recommendation and follow the current filing window. If a future final rule takes effect before her recommendation, her school would need to evaluate the new requirement. She should not invent an effective date or miss a valid filing window while waiting for news.',
          'Daniel already holds a post-completion OPT EAD and plans to seek STEM OPT in spring 2027. His school has never paid an initial fee under the proposed system. The transition provision would require $70,000 for a recommendation on or after the eventual effective date, including a STEM recommendation. His existing EAD does not mean that every future recommendation is automatically exempt.',
          'Mei is considering pre-completion OPT now and post-completion OPT later. In a hypothetical future system where her school pays $70,000 for her first recommendation, the proposed subsequent fee could add $30,000 for the later recommendation. The combined $100,000 describes two school payments in that scenario, not an automatic invoice to Mei today.',
          'For all three students, the practical task is the same: document the next recommendation and filing dates, ask the school what it can confirm, and keep current compliance obligations separate from conditional financial planning.',
        ],
        sources: [optFeePdf],
        links: [
          {
            label: 'Compare pre-completion OPT and CPT',
            href: '/blog/pre-completion-opt-vs-cpt',
          },
          {
            label: 'Prepare a STEM OPT extension',
            href: '/blog/stem-opt-extension-guide',
          },
        ],
      },
      {
        heading: 'What would trigger a fee, and what would not?',
        paragraphs: [
          'The proposed trigger is the school’s OPT recommendation, rather than each job change. For example, Daniel moving between employers during an already-authorized OPT period would not, by that fact alone, cause this new proposed payment. He would still need to follow the employment-reporting rules that apply to his current authorization.',
          'Do not combine this OPT proposal with the separate H-1B fee proposal. OPT recommendations and an employer’s H-1B petition are different processes, with different proposed payers and triggers. A recruiter discussing H-1B sponsorship cannot confirm what your university will do about an OPT recommendation.',
          'Paying a fee would not replace eligibility requirements or guarantee employment authorization. A student would still need to satisfy the rules governing the requested training and application. Conversely, the news does not give a pending initial OPT applicant permission to start work early.',
        ],
        sources: [optFeeProposal, source.opt, source.h1bFeeProposal],
        links: [
          {
            label: 'Understand the separate proposed H-1B fee',
            href: '/blog/dhs-proposes-103265-h1b-fee-2026',
          },
          {
            label: 'Can you work before your OPT EAD arrives?',
            href: '/blog/can-you-start-work-before-opt-ead-arrives',
          },
        ],
      },
      {
        heading: 'What could happen next? Read the transition carefully',
        paragraphs: [
          'The proposal would have a final rule take effect 60 days after publication of that final rule. That is a proposed transition period, not a countdown starting on October 8. There is no confirmed implementation day to calculate from the proposal alone.',
          'Its transition language would apply the initial fee to a recommendation dated on or after the future effective date when an initial fee has not previously been paid. A prior OPT history by itself would not necessarily protect a later STEM recommendation. Ask about the date of the recommendation, the history of fee payment under the new system, and the final transition text.',
          'Possible next steps include reviewing public comments, publishing different final provisions, or leaving the proposal unfinalized. Any later litigation would need to be assessed separately. These are possible process outcomes, not a forecast that one particular outcome will occur.',
          'For a useful planning discussion, prepare two columns: obligations you have today and decisions that depend on future official action. Put current I-765 and EAD dates in the first column. Put school funding decisions and possible new fee requirements in the second.',
        ],
        sources: [optFeeProposal, optFeePdf],
      },
      {
        heading:
          'November 9 comment deadline: how to contribute useful feedback',
        paragraphs: [
          'The published notice sets November 9, 2026 as the deadline for comments on the rule itself. December 7, 2026 is a separate deadline concerning the information collection under the Paperwork Reduction Act. Do not substitute the later date for the main rule-comment deadline.',
          'If you choose to comment, open the official Federal Register notice and use its Regulations.gov link for docket ICEB-2026-0100. Explain a concrete effect and the provision you are discussing. For example, describe how a prospective recommendation requirement could affect a graduation-to-training plan, and support financial claims with figures you can substantiate.',
          'Comments can become public. Use a generalized account of your situation and remove unnecessary identifying details, receipt numbers, passport details, and personal documents. A public comment is not a private immigration case inquiry. You can also ask your university how it plans to provide institutional feedback.',
          'Submitting a comment does not extend your status, pause an EAD expiration, or change an OPT filing deadline. Treat it as an optional contribution to rulemaking while continuing your own application preparations.',
        ],
        sources: [optFeeProposal],
      },
      {
        heading: 'A practical plan for the coming week',
        paragraphs: [
          'Start with a short appointment or written request to your international student office. Include your program end date or EAD expiration, the kind of OPT you expect to request, and the month you anticipate asking for the recommendation. Ask which dates and requirements the office can confirm today.',
          'Keep a private folder with your I-20s, EAD, notices, and communications. TrackMyOPT can help you organize your existing OPT timeline and case-status milestones; it cannot promise a fee exemption or a university funding decision. The school and, when needed, qualified immigration counsel remain the right sources for your individual plan.',
          'If a new official document appears, check its legal status and effective-date section before changing your plan. A comment extension, a press release, and a final rule are different events. The next meaningful update to this guide should identify the document, date, and practical consequence.',
        ],
        links: [
          {
            label: 'Use the OPT application checklist',
            href: '/blog/opt-application-checklist-2026',
          },
          {
            label: 'Understand current STEM OPT employer requirements',
            href: '/blog/stem-opt-employer-requirements',
          },
        ],
      },
    ],
    checklist: [
      'Confirm your next DSO recommendation and I-765 filing dates using current requirements.',
      'Ask the university for written guidance about the proposal and its possible funding approach.',
      'Record November 9 for the main comment deadline; keep December 7 separate.',
      'Check the official notice for a future final rule and its actual transition provisions.',
      'Keep employment reporting and EAD planning current while the proposal is pending.',
    ],
    mistakes: [
      'Treating proposed amounts as fees due today.',
      'Assuming every STEM recommendation would cost only $30,000.',
      'Assuming an existing EAD exempts all later OPT recommendations.',
      'Counting 60 days from October 8 as an implementation date.',
      'Confusing a school-paid OPT recommendation fee with an employer’s H-1B petition fee.',
    ],
    faq: [
      {
        question: 'Is the $70,000 OPT fee in effect now?',
        answer:
          'No. As verified October 11, 2026, the October 8 notice is a proposed rule. It does not establish a current $70,000 OPT payment requirement.',
      },
      {
        question: 'Who would pay the proposed OPT fees?',
        answer:
          'The proposal requires the SEVP-certified school to pay the government before its DSO recommends OPT. It does not establish each university’s future financial arrangements with students.',
      },
      {
        question: 'Would STEM OPT always have a $30,000 fee?',
        answer:
          'No. Under the proposed transition, a recommendation on or after a future effective date could require $70,000 if no initial fee has been paid under the system. The $30,000 amount applies to subsequent OPT after the initial fee payment.',
      },
      {
        question: 'Would changing OPT employers trigger another fee?',
        answer:
          'The proposal says an employer change alone is not the trigger. The school’s decision to issue an OPT recommendation is the relevant event. Existing reporting requirements would still apply.',
      },
      {
        question: 'When is the OPT fee proposal comment deadline?',
        answer:
          'The published rule-comment deadline is November 9, 2026. The separate information-collection deadline is December 7, 2026. Verify the official notice for any later extension.',
      },
      {
        question: 'Should I delay my OPT application because of this proposal?',
        answer:
          'Continue planning under current rules and confirm your filing window with your DSO. The proposal does not pause your application deadlines. Seek advice about your individual situation before changing a valid plan.',
      },
    ],
    sources: [
      optFeeProposal,
      optFeePdf,
      source.opt,
      source.stem,
      source.h1bFeeProposal,
    ],
    related: [
      {
        label: 'STEM OPT extension guide',
        href: '/blog/stem-opt-extension-guide',
      },
      {
        label: 'OPT application checklist',
        href: '/blog/opt-application-checklist-2026',
      },
      {
        label: 'October 2026 CPT lawsuit explained',
        href: '/blog/cpt-lawsuit-october-2026-internship-rules',
      },
    ],
    dataNote:
      'Sources were checked October 11, 2026. Priya, Daniel, and Mei are fictional; their examples illustrate conditional planning and do not determine eligibility or predict final policy. Keyword choices reflect topic relevance and reader questions, not measured search-volume data. The cover is AI-generated conceptual art.',
  }),
  defineArticle({
    slug: 'cpt-lawsuit-october-2026-internship-rules',
    title:
      'CPT Lawsuit October 2026: What F-1 Students Should Do About Internships',
    seoTitle: 'CPT Lawsuit October 2026: F-1 Internship Rules Explained',
    description:
      'Universities challenged SEVP’s CPT guidance on October 5. Understand the lawsuit, internship approval, three student examples, and what to confirm with your DSO.',
    category: 'Visa Policy Update',
    tags: [
      'CPT lawsuit October 2026',
      'F-1 internship rules',
      'SEVP CPT guidance 2026',
      'CPT authorization',
      'CPT academic credit',
      'CPT and OPT eligibility',
    ],
    publishedDate: '2026-10-11',
    modifiedDate: '2026-10-11',
    newsSitemapEligible: true,
    newsPublishedAt: '2026-10-12T00:27:47Z',
    readTime: '9 min read',
    cta: 'opt-timeline',
    showContents: true,
    image: '/blog/october-2026/cpt-lawsuit-cover.webp',
    imageAlt:
      'Conceptual illustration of two fictional students reviewing internship plans with a university adviser and a pending legal timeline',
    imageCaption:
      'AI-generated conceptual illustration. A pending legal challenge and your school’s authorization process are separate: confirm your internship before starting work.',
    statusNote:
      'Verified October 11, 2026: the reviewed filings document a complaint, a motion requesting a preliminary injunction and stay, and a supporting memorandum. They do not establish that the requested relief has been granted. Check your school’s current guidance and any actual court order before changing an internship plan.',
    directAnswer:
      'On October 5, 2026, four higher-education organizations sued over SEVP’s August CPT guidance. They asked a federal court to pause the disputed interpretation, but the filing itself does not authorize work or reverse a school’s CPT pause. F-1 students should confirm the internship’s academic basis and obtain the required DSO authorization before starting or changing employment.',
    keyTakeaways: [
      'A complaint explains the plaintiffs’ claims; it is not a court finding.',
      'The dispute concerns SEVP guidance about when training is integral to an established curriculum, including elective internships for credit.',
      'Schools may have different program requirements and current processing instructions. MIT’s announced pause is an example of one school’s response.',
      'CPT and OPT remain different authorizations. A pending CPT lawsuit does not approve an OPT application or restore OPT eligibility.',
    ],
    sections: [
      {
        heading: 'What happened: August guidance, October lawsuit',
        paragraphs: [
          'The Association of American Universities, NAFSA: Association of International Educators, the Presidents’ Alliance on Higher Education and Immigration, and the Association of Independent Colleges and Universities in Massachusetts filed the lawsuit in the U.S. District Court for the District of Massachusetts on October 5, 2026.',
          'The organizations challenge two ICE Student and Exchange Visitor Program (SEVP) broadcast messages issued on August 12 and August 24. Their complaint argues that the agency unlawfully changed its interpretation of Curricular Practical Training (CPT) eligibility. Those are allegations the court has been asked to evaluate, not conclusions already reached by the judge.',
          'The plaintiffs also filed a motion for a preliminary injunction and stay of agency action on October 5 and a supporting memorandum on October 6. A motion asks the court to act. Its filing date should not be reported as the date a policy was blocked.',
          'This guide is for enrolled F-1 students planning internships or co-ops, students whose schools have paused a CPT request, and students considering how practical training affects later OPT. It explains the news and gives you questions to take to the DSO; it cannot decide whether your particular internship qualifies.',
        ],
        sources: [cptLawsuit, cptComplaint, cptMotion],
        visual: {
          src: '/blog/october-2026/cpt-lawsuit-flow.gif',
          poster: '/blog/october-2026/cpt-lawsuit-flow.png',
          alt: 'CPT process flow showing August guidance, October 5 lawsuit, and current DSO review before work',
          caption:
            'The sequence stops at a review step, not a promised court victory. Each student still needs the authorization applicable to their internship.',
          steps: [
            'What happened: SEVP issued guidance on August 12 and August 24.',
            'What happened next: organizations filed suit and requested relief on October 5.',
            'What applies now: confirm your school’s guidance and DSO authorization.',
            'What comes next: read any actual court order and the school’s resulting instructions.',
          ],
        },
      },
      {
        heading: 'What is the CPT eligibility dispute?',
        paragraphs: [
          'The regulation describes CPT as practical training integral to an established curriculum. The central dispute is how SEVP interprets that relationship, particularly for an internship taken for academic credit when not every student in the degree program must complete it.',
          'According to the complaint, the August messages treat qualifying training as mandatory for every student in the degree program. The plaintiffs argue this improperly excludes credit-bearing elective training and departs from a longstanding approach without the required process. Readers should distinguish the agency interpretation, the plaintiffs’ argument, and a later judicial ruling.',
          'For a student, the difference is concrete. “My internship is related to computer science” answers a subject-matter question. “My degree’s curriculum requires or academically integrates this training, and my DSO has authorized it” addresses additional requirements. A relevant job offer or a course registration alone is not a reliable permission slip to work.',
          'Ask the school which published curriculum provisions, employer arrangements, faculty supervision, and enrollment records it needs for your program. You should not reconstruct the school’s eligibility policy from social-media examples or another university’s checklist.',
        ],
        sources: [cptRegulation, cptComplaint, cptMemo],
      },
      {
        heading: 'What the lawsuit changes today, and what remains unresolved',
        paragraphs: [
          'The lawsuit creates a formal challenge and a request for interim relief. It does not itself approve new CPT, reactivate a paused school process, or grant permission to extend a previously authorized internship. In the materials reviewed for this guide, the requested relief remains a request; this article does not claim an injunction has been granted.',
          'A future order might address particular messages, particular enforcement actions, or particular parties. If an order is issued, read its scope and effective timing rather than assuming that a headline applies to every school and student. Your school then needs to explain how it is implementing the development for its programs.',
          'Keep this dispute separate from litigation over F-1 Duration of Status. A court action affecting fixed admission periods does not automatically resolve the academic requirements for CPT. Similarly, the proposed OPT fees are a separate rulemaking, not a ruling in this CPT case.',
          'The useful question today is specific: “Does my school currently authorize this exact training, for these dates and this employer, under its current instructions?” An answer to that question is more useful for next Monday’s internship than a prediction about the lawsuit’s eventual outcome.',
        ],
        sources: [cptMotion, cptMemo],
        links: [
          {
            label: 'Read the separate Duration of Status court update',
            href: '/blog/september-2026-f1-fixed-admission-rule-opt',
          },
          {
            label: 'Understand the separate OPT fee proposal',
            href: '/blog/opt-fee-proposal-70000-30000-october-2026',
          },
        ],
      },
      {
        heading:
          'Three fictional students: required co-op, elective credit, and existing CPT',
        paragraphs: [
          'The following people are fictional and their cases illustrate questions to ask, not eligibility decisions or accounts of real customers. No example should be used to override your DSO’s instructions.',
          'Aisha’s engineering degree includes a co-op required for every student. She should gather the curriculum requirement, employer offer, dates, and school-requested documentation. That academic requirement may be relevant under the disputed guidance, but she still needs the school to evaluate all CPT conditions and issue authorization before starting. A mandatory co-op does not bypass the approval process.',
          'Luis has an optional data-science internship and can earn course credit for it. This is the kind of distinction at the center of the complaint: the training may carry academic credit without being mandatory for every student in the degree. Luis should not tell the employer that the lawsuit has made him work-authorized. He should ask his DSO for a written decision and discuss a contingent start date.',
          'Hana already has a fall CPT authorization and wants to add a second employer or extend into winter. Her prior authorization does not automatically cover a new employer or period. She should confirm the scope of the existing I-20 authorization and whether her school requires a new review. A pending court request does not fill a gap between authorized dates.',
          'Each student should keep the academic question and the work-authorization question visible. Faculty may confirm an internship’s educational value; the DSO handles the CPT authorization process. A conversation with a professor or recruiter does not replace the required immigration documentation.',
        ],
        sources: [cptRegulation, cptComplaint, mitCpt],
      },
      {
        heading: 'Why one university’s CPT pause is not every school’s policy',
        paragraphs: [
          'MIT’s International Students Office announced a pause on certain new or pending requests involving experiences not required of all students in a degree program and said it would contact students already issued fall CPT authorization to discuss options. That is direct evidence of one institution’s response, not a nationwide rule that every internship was canceled.',
          'Your school may have different degree structures, supporting documents, and current instructions. Ask whether its guidance affects pending requests, existing authorizations, extensions, or only certain types of training. Save the written reply and any replacement I-20; do not assume a general campus announcement resolves the facts of your own authorization.',
          'If you have already begun an internship and receive a concerning notice, promptly contact the DSO and, when appropriate, qualified immigration counsel. Explain your actual authorization dates and any employer or program changes. Avoid drawing a status conclusion from someone else’s experience on a forum.',
        ],
        sources: [mitCpt],
      },
      {
        heading:
          'Keep CPT, pre-completion OPT, and post-completion OPT separate',
        paragraphs: [
          'CPT is authorized through the school for qualifying curricular training. OPT generally involves a DSO recommendation followed by a USCIS employment-authorization application. They have different approval steps and timing. A CPT delay does not make OPT instantly available, and a pending initial OPT application is not permission to begin the internship.',
          'The regulation also makes students who receive one year or more of full-time CPT ineligible for post-completion OPT. Part-time CPT does not trigger that same full-time threshold. If you have multiple CPT periods, ask the DSO to review the exact authorizations and cumulative history rather than using a rough month count.',
          'Pre-completion OPT may be worth discussing when CPT is unavailable, but it has its own eligibility, filing process, work-hour limits, and effect on the OPT time available after graduation. Treat it as a question for a timely planning discussion, not a workaround that automatically preserves the same start date.',
          'For example, Luis can ask whether a different lawful authorization fits his academic and immigration situation. He should also ask how long that process might take and what tradeoffs it creates for post-graduation OPT. He should keep the employer informed that any start remains contingent on valid authorization.',
        ],
        sources: [cptRegulation, source.opt],
        links: [
          {
            label: 'Compare pre-completion OPT with CPT',
            href: '/blog/pre-completion-opt-vs-cpt',
          },
          {
            label: 'Understand the full-time CPT threshold for OPT',
            href: '/blog/cpt-12-month-rule-opt-eligibility',
          },
        ],
      },
      {
        heading: 'What to ask your DSO before an internship start date',
        paragraphs: [
          'Send a short request with the employer name, proposed duties, weekly hours, work location, dates, academic course or program requirement, and any existing authorization. Use the school’s secure process for personal documents. Do not upload private immigration records into a public legal-news discussion.',
          'Ask the DSO to distinguish the academic evidence it needs from the immigration authorization it can issue. If the request is paused, ask which condition is unresolved and whether the office has a written update students can share with employers. This makes the employer conversation practical without promising a court outcome.',
          'If a court order appears, ask for a fresh school update before assuming that a prior pause ended. Save the official order or a link, the school’s interpretation, and the resulting decision for your request. TrackMyOPT can help organize your later OPT timeline and case milestones; it does not issue CPT authorization.',
          'Your next step should follow the document that governs your situation: current school instructions and valid authorization now, then any applicable court order and revised instructions later. Keeping those steps separate makes the news easier to understand and your internship plan easier to explain.',
        ],
        numbered: [
          'Does this exact training satisfy our degree’s current academic requirements?',
          'Do the August messages affect this request or an existing authorization?',
          'Which employer, location, hours, and dates will the authorization cover?',
          'What must be issued before I can begin or change the internship?',
          'How does my full-time CPT history affect later OPT eligibility?',
        ],
        sources: [cptRegulation, mitCpt],
      },
    ],
    checklist: [
      'Check your school’s current CPT notice and contact the DSO about your exact request.',
      'Gather the offer, academic requirement, dates, hours, and existing authorization.',
      'Confirm authorization before starting or changing work; do not rely on the lawsuit filing.',
      'Review cumulative full-time CPT with the DSO when planning post-completion OPT.',
      'Recheck the case for actual orders and ask how any order applies to your school.',
    ],
    mistakes: [
      'Reporting a requested injunction as a granted injunction.',
      'Assuming course credit or a related job automatically authorizes CPT.',
      'Treating one university’s processing pause as every school’s policy.',
      'Assuming a prior CPT authorization covers new dates or a different employer.',
      'Assuming an unpaid internship needs no authorization review.',
    ],
    faq: [
      {
        question: 'Did the October 5 CPT lawsuit block SEVP’s guidance?',
        answer:
          'The reviewed filings establish that the plaintiffs requested an injunction and stay. Filing that request does not itself block guidance. Check for an actual court order and your school’s current instructions.',
      },
      {
        question: 'Can I start CPT while the lawsuit is pending?',
        answer:
          'A lawsuit does not authorize employment. Obtain the required DSO authorization for your particular employer and training period before starting, and follow your school’s current instructions.',
      },
      {
        question: 'Does academic credit guarantee CPT approval?',
        answer:
          'No. Credit-bearing elective training is central to the dispute, but a course enrollment or relevant internship offer alone does not replace the school’s eligibility review and authorization.',
      },
      {
        question: 'Is every university pausing CPT?',
        answer:
          'This guide does not establish a pause at every school. MIT announced a pause in certain authorizations. Check your own school’s current policy and how it applies to your degree and request.',
      },
      {
        question: 'Does full-time CPT affect later OPT?',
        answer:
          'Under the practical-training regulation, one year or more of full-time CPT makes a student ineligible for post-completion OPT. Review your exact authorization history with the DSO; part-time CPT has a different effect.',
      },
      {
        question: 'Can I use pre-completion OPT instead of CPT?',
        answer:
          'Possibly, if you meet its separate requirements. Discuss eligibility, USCIS filing and approval timing, work-hour limits, and the effect on remaining OPT with your DSO. It is not an automatic substitute.',
      },
    ],
    sources: [
      cptLawsuit,
      cptComplaint,
      cptMotion,
      cptMemo,
      cptRegulation,
      mitCpt,
      source.opt,
    ],
    related: [
      { label: 'CPT complete guide', href: '/blog/cpt-complete-guide' },
      {
        label: 'Pre-completion OPT versus CPT',
        href: '/blog/pre-completion-opt-vs-cpt',
      },
      {
        label: 'OPT fee proposal: what could change next',
        href: '/blog/opt-fee-proposal-70000-30000-october-2026',
      },
    ],
    dataNote:
      'Verified against the linked filings and institutional notices on October 11, 2026. Plaintiff arguments are identified as arguments; no granted CPT injunction is asserted. Aisha, Luis, and Hana are fictional teaching examples. No applicant data is used. The cover is AI-generated conceptual art; keywords are editorial selections, not measured search-volume data.',
  }),
];
