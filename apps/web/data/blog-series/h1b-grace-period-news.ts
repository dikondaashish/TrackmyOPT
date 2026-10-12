import { defineArticle, source } from './shared';
import {
  policyPublication,
  policySources as s,
  policyVisual,
} from './october-policy-sources';

export const h1bGracePeriodArticle = defineArticle({
  ...policyPublication,
  slug: 'h1b-60-day-grace-period-proposal-2026',
  title: 'Is the H-1B 60-Day Grace Period Ending? The 2026 Proposal Explained',
  seoTitle: 'H-1B 60-Day Grace Period: 2026 Proposal Explained',
  description:
    'The H-1B 60-day grace period remains in the current regulation. Understand the 2026 removal proposal, November 10 comment deadline, and layoff planning.',
  category: 'H-1B Policy Update',
  tags: [
    'H-1B 60-day grace period 2026',
    'H-1B layoff rule proposal',
    'OPT to H-1B',
    '60-day grace period removal',
    'H-1B unemployment',
  ],
  readTime: '7 min read',
  cta: 'sponsors',
  image: '/blog/october-policy-2026/h1b-grace.webp',
  imageAlt:
    'Fictional H-1B professional reviewing an employment letter and calendar after a layoff',
  statusNote:
    'Checked October 12, 2026: DHS published a proposed rule on September 11. Comments are due November 10, 2026. The current regulation still contains the discretionary grace period; this proposal has no final effective date.',
  directAnswer:
    'The H-1B 60-day grace period has not been removed by the September 2026 proposal. DHS is seeking to delete the regulation that can protect eligible workers after employment ends. This article is for H-1B workers and F-1 graduates planning that transition: confirm your current status, I-94 end date and actual employment-end date before relying on any grace period.',
  keyTakeaways: [
    'A notice of proposed rulemaking is a request for public input, not an effective repeal.',
    'The worker grace period and the F-1 post-program grace period are different rules.',
    'An employer’s severance policy does not by itself establish your immigration deadline.',
    'A new job offer alone does not establish permission to begin working.',
  ],
  sections: [
    {
      heading: 'What Happened on September 11?',
      paragraphs: [
        'The Department of Homeland Security published “Eliminating the Discretionary 60-Day Grace Period,” docket USCIS-2026-0364. It proposes removing 8 CFR 214.1(l)(2), covering E-1, E-2, E-3, H-1B, H-1B1, L-1, O-1 and TN classifications and their dependents. The public-comment deadline is November 10, 2026.',
        'For a reader, the useful distinction is between publication of a proposal and publication of a final rule. The next document could change the proposal, add a transition, or establish an effective date. An article announcing a proposal cannot supply those future answers. Save the docket number so later headlines can be matched to the same rulemaking.',
      ],
      sources: [s.graceProposal],
      visual: policyVisual(
        'h1b-grace',
        'Proposal → current rule → possible future final rule.',
        [
          'September 11: DHS proposes removing the worker grace period.',
          'October 12: current discretionary regulation remains; check your individual timeline.',
          'November 10: comments close. Any effective change requires a later final rule.',
        ]
      ),
    },
    {
      heading: 'How the Current H-1B 60-Day Grace Period Works',
      paragraphs: [
        'The current regulation permits up to 60 consecutive days following cessation of qualifying employment, or the end of the authorized validity period, whichever is shorter, once during each authorized validity period. DHS can shorten or eliminate it as a matter of discretion. It is not independent permission to work.',
        'Build a timeline from documents rather than a recruiter’s shorthand. Locate the I-94, approval notice, employer’s written separation information and any filing receipts. If two documents show different dates, bring both to counsel. Do not choose the more convenient date without understanding why they differ. A calendar reminder helps only after the underlying date is correct.',
      ],
      sources: [s.graceCurrent],
    },
    {
      heading: 'F-1 Grace Period, OPT Unemployment and H-1B Layoffs',
      paragraphs: [
        'A graduate can hear “60 days” from classmates in very different circumstances. One person has finished an F-1 program, another is between qualifying OPT jobs, and a third has already changed to H-1B status. A shared number does not make their legal situations equivalent. The proposed worker-rule deletion targets a specific regulation, not every immigration period described as a grace period.',
        'If your change to H-1B has already taken effect, continuing to use an OPT unemployment counter can give you a misleading picture. If you remain in F-1 status, do not adopt an H-1B layoff timeline simply because a future petition was approved. Ask the DSO and employer’s immigration attorney to identify which status you hold now and which event changes it. Your current authorization is the starting point for every next step.',
      ],
      links: [
        {
          label: 'F-1 60-day grace-period guide',
          href: '/blog/60-day-grace-period-f1-students',
        },
        {
          label: 'What to do after an OPT layoff',
          href: '/blog/laid-off-on-opt',
        },
        {
          label: 'OPT to H-1B transition guide',
          href: '/blog/opt-to-h1b-transition',
        },
      ],
    },
    {
      heading: 'Example: Arjun Has an Approved H-1B and Loses His Job',
      paragraphs: [
        'Arjun is fictional. His H-1B change of status has taken effect, and his employer tells him that his role is ending. He initially assumes that receiving severance means he remains employed for immigration purposes. Instead of treating that assumption as a deadline, he requests a written explanation of the employment-end date and sends his I-94 and approval notice to counsel.',
        'His immediate task is to establish the current timeline and evaluate available options. He keeps a record of recruiter conversations, but does not confuse interviewing with permission to start a new role. When he reads the September proposal, he adds a news reminder separate from his case deadline. The example shows a planning method; it does not calculate or guarantee a grace period for any real worker.',
      ],
      note: 'Keep two entries: “my case deadline, confirmed by counsel” and “policy update to recheck.” A proposed rule should not overwrite an individual deadline.',
    },
    {
      heading: 'Example: Meera Is Still Working on STEM OPT',
      paragraphs: [
        'Meera is also fictional. She sees a headline saying that workers could lose 60 days and worries that her STEM OPT employment reporting has changed overnight. She checks the classification on her documents, asks her DSO about her current obligations, and reads the actual proposal rather than a cropped screenshot. She does not assume a worker-rule proposal changed her EAD dates.',
        'For Meera, the practical issue is future planning if she later changes status. She discusses the employer’s sponsorship timeline and asks how a future employment interruption would be handled. She keeps her existing STEM reporting schedule active while following the rulemaking. That gives her a useful response to uncertainty without pretending the outcome is known.',
      ],
    },
    {
      heading: 'Questions to Bring to Counsel After Employment Ends',
      paragraphs: [
        'Prepare a short factual summary before a consultation: current classification, last authorized employment date, I-94 expiration, petition history and dependents’ documents. Include any pending filing and the date it was received. This lets the attorney evaluate the actual sequence instead of spending the consultation reconstructing it from scattered messages.',
        'Ask which options are available, what must be filed before which date, and what separately authorizes work. Get advice before international travel or accepting an immediate start date. These questions are a preparation checklist, not a promise that a transfer, status change or departure plan is available in every case. If an employer gives legal advice informally, ask who is responsible for reviewing the documents.',
      ],
      bullets: [
        'What is the documented employment-end date?',
        'Does my I-94 create an earlier limit?',
        'What filing or departure step is required, and by when?',
        'When could I lawfully begin work with another employer?',
        'How are dependent family members affected?',
      ],
    },
    {
      heading: 'What Could Happen Next?',
      paragraphs: [
        'Watch for a final rule, an announced effective date, transition language and any court order affecting implementation. Read the document that changes the status, not just the date a news story appeared. If a final rule arrives, the first useful update should explain who is covered and how existing situations are treated.',
        'For now, the H-1B 60-day grace period proposal is a reason to improve your records and contingency planning. It is not a reason to invent a new departure deadline. Recheck the sources before acting and have qualified counsel confirm your individual timeline. TrackMyOPT can help organize reminders; it cannot decide whether DHS will exercise discretion in your case.',
      ],
    },
  ],
  checklist: [
    'Save your I-94, approval notices and separation documents.',
    'Identify your current immigration classification.',
    'Confirm deadlines and work-start rules with qualified counsel.',
    'Keep dependent documents in the same review.',
    'Recheck docket USCIS-2026-0364 for a final rule or effective date.',
  ],
  mistakes: [
    'Treating November 10 as the repeal date.',
    'Assuming severance automatically extends qualifying employment.',
    'Using OPT unemployment limits after an H-1B status change.',
    'Assuming a new offer alone authorizes work.',
  ],
  faq: [
    {
      question: 'Has the H-1B 60-day grace period ended?',
      answer:
        'As checked October 12, 2026, the current regulation still contains the discretionary grace period. DHS’s September 11 notice proposes deleting it. A comment deadline does not make a proposed repeal effective; check for a later final rule and have counsel confirm your case timeline.',
    },
    {
      question: 'When are comments due on the proposal?',
      answer:
        'The Federal Register notice sets November 10, 2026 as the public-comment deadline for docket USCIS-2026-0364. Follow the notice’s submission instructions. Comments become part of a public rulemaking record, so avoid including private immigration documents or unnecessary personal details.',
    },
    {
      question: 'Is this the same as the F-1 60-day grace period?',
      answer:
        'No. This proposed deletion concerns a worker regulation covering specified classifications and dependents. F-1 post-program timing and OPT employment rules have separate legal bases. First identify your current classification; then ask your DSO or attorney which rule applies to your situation.',
    },
    {
      question: 'Can I work during a grace period?',
      answer:
        'The worker grace period itself does not authorize employment. Whether another rule or filing permits work depends on the facts. Ask counsel to confirm a lawful start date before working for a new employer, including when an offer or transfer filing is involved.',
    },
  ],
  sources: [s.graceProposal, s.graceCurrent, source.opt],
  related: [
    {
      label: 'H-1B employer scrutiny update',
      href: '/blog/h1b-employer-scrutiny-september-2026',
    },
    { label: 'STEM OPT layoff checklist', href: '/blog/laid-off-on-stem-opt' },
    { label: 'OPT timeline tool', href: '/tools/opt-clock' },
  ],
});
