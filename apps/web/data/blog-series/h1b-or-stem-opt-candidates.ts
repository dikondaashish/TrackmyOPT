import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "h1-b or stem opt" (853 impressions a quarter at position 2.8, ranking
// without a page) and "h1-b or stem opt candidates meaning" (181) had no
// explainer for the job-posting phrase. Every rule below was checked on
// 2026-11-08 against 8 CFR 214.2(f)(10)(ii)(C) and (h)(2)(i)(H), the USCIS
// STEM OPT, H-1B and H-1B cap season pages, Study in the States and SEVP's
// OPT policy guidance, and the USCIS I-765 page alert confirming that the
// fixed-admission rule is postponed by court order (USCIS applies the previous
// rules: no extension of stay, 60-day grace period).
// No counts of listings: none are published, so the
// staffing and consulting point is a general observation only.

const src = {
  stemReg: {
    label: '8 CFR 214.2(f)(10)(ii)(C): 24-month STEM OPT extension',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  uscisStem: {
    label: 'Optional Practical Training Extension for STEM Students (STEM OPT)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt',
  },
  sitsEligibility: {
    label: 'Students: Determining STEM OPT Extension Eligibility',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/stem-opt-hub/students-determining-stem-opt-extension-eligibility',
  },
  sitsEmployerI983: {
    label: 'Employers and the Form I-983',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/students/employers-and-the-form-i-983',
  },
  stemHub: {
    label: 'STEM OPT Hub',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/stem-opt-hub',
  },
  optGuidance: {
    label: 'SEVP Policy Guidance 1004-03: Update to Optional Practical Training',
    publisher: 'ICE SEVP',
    url: 'https://www.ice.gov/doclib/sevis/pdf/opt_policy_guidance_042010.pdf',
  },
  h1b: {
    label: 'H-1B Specialty Occupations',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  capSeason: {
    label: 'H-1B Cap Season',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-cap-season',
  },
  portabilityReg: {
    label: '8 CFR 214.2(h)(2)(i)(H): H-1B portability',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  uscisI765Alert: {
    label: 'Form I-765 page: court order postponing the fixed-admission rule',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'h1b-or-stem-opt-candidates-meaning';

export const h1bOrStemOptCandidates: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    '"H-1B or STEM OPT Candidates": What the Job Posting Phrase Means and How to Check the Employer',
  seoTitle: 'H-1B or STEM OPT Candidates: What the Job Phrase Means',
  description:
    'What "H-1B or STEM OPT candidates" means in a job posting, what it does not promise, what an employer must have for STEM OPT, whether initial OPT counts, and how to check the company first.',
  category: 'Careers',
  tags: [
    'H-1B or STEM OPT candidates',
    'STEM OPT employer requirements',
    'H-1B transfer',
    'E-Verify',
    'Form I-983',
    'staffing companies OPT',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  hub: 'stem-opt',
  cta: 'sponsors',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: what "H-1B or STEM OPT candidates" means in a job posting and what to check before applying.',
  imageCaption:
    'The two groups the phrase usually invites, and the employer checks STEM OPT requires. Based on the rules described in this guide.',
  directAnswer:
    '"H-1B or STEM OPT candidates" usually means the employer will consider two groups: people who already hold H-1B status and would need the employer to file a new petition (often called a transfer), and people on the 24-month STEM OPT extension or eligible for it. It does not promise that the employer will enter you in the H-1B lottery or sponsor a green card. For STEM OPT, the employer must be enrolled in E-Verify, sign a Form I-983 training plan, have a real employer-employee relationship with you, provide the training itself and offer a role directly related to your STEM degree. Check those points before you accept an offer.',
  keyTakeaways: [
    'The phrase invites current H-1B holders who need a new petition and STEM OPT holders or students eligible for the extension. It is a statement about who can start work, not a sponsorship promise.',
    'A current H-1B holder generally can start with a new employer once that employer properly files a nonfrivolous I-129, and is generally not counted against the cap again during the same H-1B validity period.',
    'For STEM OPT, the employer must be in E-Verify, have an EIN, sign the I-983, keep a bona fide employer-employee relationship and train you through its own employees or contractors, not a client\'s. The role must be directly related to your STEM degree.',
    'Initial OPT holders with a STEM-designated degree can often apply for the extension; ask the recruiter whether they count. Students without a qualifying STEM degree cannot get STEM OPT.',
    'Check the employer in E-Verify, ask who will supervise and train you, and answer the sponsorship question truthfully.',
  ],
  sections: [
    {
      heading: 'What the phrase usually signals',
      paragraphs: [
        'Job postings use "H-1B or STEM OPT candidates" to say which work authorization the employer will accept. It is not a legal term. USCIS and DHS do not define it, so the meaning comes from the two programs it names.',
        'The first group is people who already hold H-1B status. They would need the new employer to file a new Form I-129 petition, which people often call an H-1B transfer. The second group is F-1 students on the 24-month STEM OPT extension, or students who are eligible to apply for it.',
        'Both groups can usually start work without the employer winning an H-1B lottery slot this year. That is a common reason employers write the phrase. It tells you who they think they can hire quickly. It does not tell you what they will do later.',
      ],
      table: {
        caption: 'The two groups the phrase usually covers.',
        columns: ['Group', 'What the employer would do', 'Lottery needed now?'],
        rows: [
          ['Current H-1B holder', 'File a new I-129 petition for you (a "transfer")', 'Generally no, if you were already counted against the cap'],
          ['STEM OPT holder', 'Sign a new Form I-983 training plan with you; you submit it to your DSO within 10 days of starting', 'No'],
          ['Initial OPT holder with a STEM-designated degree', 'Meet the STEM OPT employer rules and sign the I-983 so you can apply for the extension', 'No'],
        ],
      },
      sources: [src.h1b, src.portabilityReg, src.stemReg],
    },
    {
      heading: 'What the phrase does not promise',
      paragraphs: [
        'The phrase does not say the employer will register you in the H-1B lottery. New cap-subject petitions can only be filed on a valid, selected registration, and the employer decides whether to register you at all. Ask directly if that matters to your plans.',
        'It does not promise a green card either. Permanent residence sponsorship is a separate, longer process that an employer chooses to start or not. A posting that welcomes STEM OPT holders may still have no plan to file anything for you.',
        'It also does not prove the employer meets the STEM OPT rules. A company can write the phrase in a posting and still be unable to sign a valid I-983 for your role. You confirm that during the offer stage, not from the posting.',
      ],
      bullets: [
        'Not a promise of H-1B cap registration or selection.',
        'Not a promise of green card sponsorship.',
        'Not proof that the employer is enrolled in E-Verify or can provide STEM OPT training.',
      ],
      links: [
        { label: 'H-1B weighted selection explained', href: '/blog/h1b-weighted-selection-process-fy2027' },
        { label: 'Find cap-exempt H-1B employers', href: '/blog/find-cap-exempt-h1b-employers' },
      ],
      sources: [src.capSeason],
    },
    {
      heading: 'Where the phrase tends to appear',
      paragraphs: [
        'The phrase commonly appears in staffing and consulting listings, especially for contract or client-site roles. This is a general observation, not a measured statistic. Product companies and other employers use it too.',
        'The setting matters because of how STEM OPT works. Staffing agencies, temporary agencies and consulting firms may employ STEM OPT students, according to USCIS. They must be the ones providing the training and must keep a bona fide employer-employee relationship with the student.',
        'Initial OPT has looser rules on the type of employer. SEVP\'s OPT policy guidance lists employment through an agency or consulting firm among the allowed kinds of post-completion OPT work. The job must still relate to your degree and average at least 20 hours a week.',
      ],
      links: [
        { label: 'Staffing and consulting companies on OPT and STEM OPT', href: '/blog/staffing-consulting-companies-opt-stem-opt' },
        { label: 'HSI OPT fraud crackdown: a guide for legitimate students', href: '/blog/hsi-opt-fraud-crackdown-legitimate-students-guide' },
      ],
      sources: [src.uscisStem, src.optGuidance],
    },
    {
      heading: 'What an employer must have for STEM OPT',
      paragraphs: [
        'The STEM OPT employer rules are in 8 CFR 214.2(f)(10)(ii)(C). USCIS and Study in the States explain them in plain language. A STEM OPT candidate should check each point before accepting an offer.',
        'Staffing and consulting setups get the most questions. Training can happen at a site other than the employer\'s headquarters if the I-983 lists it. But USCIS says a STEM OPT employer may not assign or delegate its training responsibilities to a non-employer third party. The people who train you can be the employer\'s own employees or contractors, not employees or contractors of its clients or customers.',
        'USCIS also notes that some arrangements may not be able to show a bona fide employer-employee relationship. It names multiple employer arrangements, sole proprietorships and certain temporary agency or consulting firm arrangements. The employer cannot be your employer in name only.',
      ],
      table: {
        caption: 'STEM OPT employer requirements and where each comes from.',
        columns: ['Requirement', 'What it means for you', 'Source'],
        rows: [
          ['Job directly related to your STEM degree', 'The role must use the STEM degree the extension is based on', '8 CFR 214.2(f)(10)(ii)(C)(4)'],
          ['E-Verify enrollment in good standing', 'The employer has an E-Verify company ID and remains a participant in good standing', '8 CFR 214.2(f)(10)(ii)(C)(5)'],
          ['Employer Identification Number (EIN)', 'The employer has a tax ID; it goes in Section 3 of the I-983', '8 CFR 214.2(f)(10)(ii)(C)(5)'],
          ['Signed Form I-983 training plan', 'Goals, supervision and evaluation are written down and signed by someone with signatory authority', '8 CFR 214.2(f)(10)(ii)(C)(7)'],
          ['Bona fide employer-employee relationship', 'You are a real employee of the company that signs the I-983', 'USCIS STEM OPT page; Study in the States'],
          ['Employer provides the training', 'Training is not handed off to a client or its staff', '8 CFR 214.2(f)(10)(ii)(C)(10); USCIS STEM OPT page'],
          ['At least 20 hours a week, commensurate terms', 'Duties, hours and pay are in line with similarly situated U.S. workers', '8 CFR 214.2(f)(10)(ii)(C)(8)'],
          ['Does not replace a U.S. worker', 'The employer attests to this on the I-983', '8 CFR 214.2(f)(10)(ii)(C)(10)'],
          ['Reports your departure', 'The employer tells your DSO within five business days if you leave or are terminated early', '8 CFR 214.2(f)(10)(ii)(C)(6)'],
        ],
      },
      note: 'DHS may also visit a STEM OPT employer to check that it can provide the training in the I-983. It generally gives 48 hours\' notice, except when a complaint or other evidence of noncompliance triggers the visit.',
      links: [
        { label: 'Form I-983 training plan guide', href: '/blog/i-983-training-plan-guide' },
        { label: 'STEM OPT employer requirements', href: '/blog/stem-opt-employer-requirements' },
        { label: 'Preparing for a STEM OPT employer site visit', href: '/blog/stem-opt-employer-site-visit-preparation' },
      ],
      sources: [src.stemReg, src.uscisStem, src.sitsEligibility, src.sitsEmployerI983],
    },
    {
      heading: 'Do initial OPT holders count as STEM OPT candidates?',
      paragraphs: [
        'Often, yes, if your degree qualifies. You can apply for the STEM OPT extension while you are in a valid period of post-completion OPT. The degree must be on the DHS STEM Designated Degree Program List and come from an accredited U.S. school.',
        'A non-STEM degree does not qualify on its own. The extension can be based on an earlier STEM degree, with conditions. That degree must have been conferred by an accredited, SEVP-certified U.S. school within the 10 years before your DSO recommends the extension, and must be on the current STEM list.',
        'Timing matters. You can file up to 90 days before your current OPT EAD expires, and within 60 days of your DSO\'s recommendation. You must apply while your post-completion OPT is still valid, not during the 60-day grace period after it ends.',
        'You may see articles saying STEM OPT applicants now also need an extension of stay and get only a 30-day grace period. Those changes come from a DHS rule that a federal court postponed on September 14, 2026. USCIS says it is applying the previous rules until the court says otherwise, so no extension of stay is needed today. Check the current status with your DSO before you file.',
        'Recruiters use the phrase differently. Some mean "already on STEM OPT." Others mean "eligible for STEM OPT." If you are on initial OPT with a qualifying degree, say so plainly and ask whether that fits.',
      ],
      numbered: [
        'Check your CIP code against the STEM Designated Degree Program List.',
        'Confirm you are still within your post-completion OPT period, not the grace period.',
        'Confirm the new employer meets the STEM OPT employer rules above.',
        'Complete the I-983 with the employer, get your DSO\'s recommendation, then file Form I-765.',
      ],
      links: [
        { label: 'Is my degree STEM eligible? CIP code check', href: '/blog/is-my-degree-stem-eligible-cip-code' },
        { label: 'STEM OPT extension guide', href: '/blog/stem-opt-extension-guide' },
        { label: 'STEM OPT 180-day automatic extension explained', href: '/blog/stem-opt-180-day-auto-extension-explained-2026' },
      ],
      sources: [src.stemReg, src.uscisStem, src.sitsEligibility, src.uscisI765Alert],
    },
    {
      heading: 'What the H-1B side means for current H-1B holders',
      paragraphs: [
        'If you already hold H-1B status, the new employer files a new I-129 petition for you. Under H-1B portability, you generally can start working for the new employer once it properly files a nonfrivolous petition, or on the requested start date, whichever is later.',
        'Portability has conditions. You must have been admitted in, or given, H-1B status. The new petition must be filed before your authorized stay expires. You must not have worked without authorization since your last admission. Work based on portability continues while the petition is pending and stops if USCIS denies it.',
        'USCIS says workers previously counted toward the cap will not become subject to it again during the same H-1B validity period. That is why a transfer usually does not need a lottery selection.',
      ],
      links: [
        { label: 'H-1B transfer and portability while on OPT', href: '/blog/h1b-transfer-portability-while-on-opt' },
        { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
      ],
      sources: [src.portabilityReg, src.h1b],
    },
    {
      heading: 'How to check the employer before you accept',
      paragraphs: [
        'Start with E-Verify. A STEM OPT employer must be enrolled, and the I-983 asks for its E-Verify company ID. Search the company in our E-Verify employer search and compare the legal name with the name on your offer letter.',
        'Then ask about training and supervision. Find out who your supervisor will be and whether that person works for the employer. If the role is at a client site, ask how the employer will train and evaluate you there.',
        'Watch for warning signs. Be careful if a company asks you to pay for a job, will not put the role in writing, or cannot name your supervisor. Our guide to the HSI OPT fraud crackdown covers more red flags.',
      ],
      bullets: [
        'Is the company enrolled in E-Verify under the same legal name as the offer letter?',
        'Will the company sign an I-983 with its own EIN and its own supervisor?',
        'Who trains you, and do they work for the employer or for its client?',
        'Is the role directly related to the STEM degree your extension will be based on?',
        'Is the role at least 20 hours a week, with pay in line with similar U.S. workers?',
        'Will the company tell you in writing whether it plans to register you for H-1B?',
      ],
      links: [
        { label: 'E-Verify employer search', href: '/e-verify-employer-search' },
        { label: 'Check an employer\'s E-Verify status before a STEM OPT offer', href: '/blog/check-employer-e-verify-stem-opt-offer' },
        { label: 'OPT and STEM OPT job offer verification checklist', href: '/blog/opt-stem-opt-job-offer-verification-checklist' },
      ],
      sources: [src.stemReg, src.uscisStem],
    },
    {
      heading: 'How to answer the sponsorship question truthfully',
      paragraphs: [
        'Applications that say "H-1B or STEM OPT candidates" often ask whether you will need sponsorship now or in the future. Answer honestly. OPT and STEM OPT are not employer-sponsored visas, but if you will need H-1B or another petition later, the "in the future" part is usually yes.',
        'You can add context in a cover letter or note. Say what you have now, for example "authorized to work on STEM OPT through a specific date," and what you will need later. A misleading answer can cause problems later in the hiring process.',
      ],
      links: [
        { label: 'How to answer the sponsorship question', href: '/blog/how-to-answer-sponsorship-question' },
      ],
    },
    {
      heading: 'Example: a consulting listing on initial OPT',
      paragraphs: [
        'Fictional example: Ananya has a master\'s in computer science and is four months into initial OPT. A consulting firm posts a data engineer role for "H-1B or STEM OPT candidates only" at a client site.',
        'She tells the recruiter she is on initial OPT and her degree is on the STEM list. She asks whether that fits, and they say yes. She then checks the firm in the E-Verify search and asks who will supervise and train her.',
        'The firm says a firm employee will be her supervisor, working with her at the client office, and that it will sign the I-983 with its own EIN. She also asks about H-1B registration. The firm says it decides each year and makes no promise. She accepts and plans to file the STEM OPT extension in the 90 days before her OPT EAD expires. She keeps the I-983 and offer letter together.',
      ],
    },
  ],
  checklist: [
    'Read the phrase as "who can start work," not as a sponsorship promise.',
    'Confirm your degree is on the STEM Designated Degree Program List if you rely on STEM OPT.',
    'Check the employer in E-Verify under the same legal name as the offer.',
    'Confirm the role is directly related to your STEM degree.',
    'Ask who will train and supervise you, and whether they work for the employer.',
    'Ask in writing whether the employer plans to register you for H-1B.',
    'Answer the sponsorship question truthfully.',
  ],
  mistakes: [
    'Assuming "H-1B or STEM OPT candidates" means the employer will register you in the H-1B lottery.',
    'Accepting a STEM OPT role where a client, not the employer, would train and supervise you.',
    'Skipping the E-Verify check because the posting mentioned STEM OPT.',
    'Ruling yourself out on initial OPT when your degree qualifies for the extension.',
    'Answering "no" to a future sponsorship question when you will need H-1B later.',
  ],
  faq: [
    {
      question: 'What does "H-1B or STEM OPT candidates" mean?',
      answer:
        'It usually means the employer will consider people who already hold H-1B and need a new petition, and people on STEM OPT or eligible for it. It describes who can start work, not a promise of H-1B lottery registration or a green card.',
    },
    {
      question: 'Can I apply on initial OPT?',
      answer:
        'Often yes, if your degree is on the STEM Designated Degree Program List and you are still in your post-completion OPT period. Tell the recruiter you are eligible for the STEM OPT extension and ask whether that fits the role.',
    },
    {
      question: 'Can a staffing or consulting company employ me on STEM OPT?',
      answer:
        'It can, if it is enrolled in E-Verify, signs the I-983, keeps a bona fide employer-employee relationship, provides the training itself and offers a role directly related to your STEM degree. It may not hand your training to a client or the client\'s staff.',
    },
    {
      question: 'Does an H-1B transfer need a new lottery selection?',
      answer:
        'Generally no. USCIS says workers previously counted toward the cap will not become subject to it again during the same H-1B validity period. The new employer still files a new I-129 petition.',
    },
    {
      question: 'How do I check if an employer is in E-Verify?',
      answer:
        'Search the company name in the TrackMyOPT E-Verify employer search and compare it with the legal name on your offer. The employer\'s E-Verify company ID also goes on the Form I-983.',
    },
  ],
  sources: [
    src.stemReg,
    src.uscisStem,
    src.sitsEligibility,
    src.sitsEmployerI983,
    src.stemHub,
    src.optGuidance,
    src.portabilityReg,
    src.h1b,
    src.capSeason,
    src.uscisI765Alert,
  ],
  related: [
    { label: 'Check employer E-Verify before a STEM OPT offer', href: '/blog/check-employer-e-verify-stem-opt-offer' },
    { label: 'Staffing and consulting companies on OPT and STEM OPT', href: '/blog/staffing-consulting-companies-opt-stem-opt' },
    { label: 'Form I-983 training plan guide', href: '/blog/i-983-training-plan-guide' },
    { label: 'H-1B transfer and portability while on OPT', href: '/blog/h1b-transfer-portability-while-on-opt' },
    { label: 'How to answer the sponsorship question', href: '/blog/how-to-answer-sponsorship-question' },
  ],
});
