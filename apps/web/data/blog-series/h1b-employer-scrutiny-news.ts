import { defineArticle } from './shared';
import {
  policyPublication,
  policySources as s,
  policyVisual,
} from './october-policy-sources';

export const h1bEmployerScrutinyArticle = defineArticle({
  ...policyPublication,
  slug: 'h1b-employer-scrutiny-september-2026',
  title: 'New H-1B Employer Scrutiny: What OPT Job Seekers Should Know',
  seoTitle: 'H-1B Employer Scrutiny: October 2026 Job-Seeker Guide',
  description:
    'Understand H-1B employer scrutiny after the September 18 order. Learn what OPT job seekers should verify about layoffs, sponsorship, and job documentation.',
  category: 'H-1B Policy Update',
  tags: [
    'H-1B employer scrutiny 2026',
    'H-1B sponsorship after layoffs',
    'OPT job search',
    'H-1B sponsor research',
    'Labor Condition Application',
  ],
  readTime: '7 min read',
  cta: 'sponsors',
  image: '/blog/october-policy-2026/h1b-employer.webp',
  imageAlt:
    'Fictional OPT graduate discussing sponsorship documents with a recruiter',
  statusNote:
    'Checked October 12, 2026: this guide explains the September 18 executive order. Its directions to agencies do not establish a universal ban on employers that have conducted layoffs. Later guidance or individual agency action may affect particular cases.',
  directAnswer:
    'New H-1B employer scrutiny means OPT job seekers should ask more precise sponsorship questions. The September 18 order directs agencies to consider sponsor layoffs and coordinate their review. It does not say that every company with layoffs is automatically prohibited from sponsoring. This guide helps international graduates research a role, document its details, and distinguish an employer’s plans from a legal determination.',
  keyTakeaways: [
    'Past H-1B filing history is useful research, not a current sponsorship promise.',
    'Identify the legal employer, role, worksite and immigration contact.',
    'An LCA for an H-1B petition and PERM for a green card are separate processes.',
    'Keep your OPT or STEM OPT compliance current while researching future sponsorship.',
  ],
  sections: [
    {
      heading: 'What the September 18 Executive Order Says',
      paragraphs: [
        'The order directs interagency coordination in H-1B petitions, labor condition applications, visas and entry decisions. Agencies must consider sponsor layoffs during the previous year and planned layoffs affecting similarly situated U.S. workers. It also directs the Labor Department to begin reviewing previously submitted LCA data within 30 days to assess whether further action is warranted.',
        'These are directions about agency review. A reader should not turn them into a company-by-company eligibility verdict. The relevant questions are what the employer has documented, what guidance applies to the filing, and whether an agency has taken an action affecting that employer or case. A headline alone cannot answer those questions.',
      ],
      sources: [s.employerOrder],
      visual: policyVisual(
        'h1b-employer',
        'Agency order → employer review → your sponsorship questions.',
        [
          'September 18: order directs agency coordination and consideration of layoffs.',
          'Employers and counsel evaluate filings and supporting records.',
          'Before accepting a role, confirm the employer, sponsorship plan and work authorization.',
        ]
      ),
    },
    {
      heading: 'What H-1B Employer Scrutiny Means for an OPT Job Search',
      paragraphs: [
        'Start with the role you are actually being offered. A brand may have multiple subsidiaries, hiring teams and immigration policies. An employer’s historical filings for senior employees may tell you little about whether it will sponsor a new graduate in a different function. Ask for the legal entity and the person who can confirm the sponsorship process.',
        'A useful response from a recruiter identifies a plan: who reviews eligibility, when review occurs, what conditions apply and who communicates changes. “We sponsor” is a starting point for a conversation, not a complete answer. You can ask factual questions professionally without asking the recruiter to make a legal prediction. Save the written response so you can compare it with the final offer.',
      ],
      links: [
        {
          label: 'Research H-1B sponsor companies',
          href: '/blog/top-h1b-sponsor-companies-2026',
        },
        {
          label: 'How to answer the sponsorship question',
          href: '/blog/how-to-answer-sponsorship-question',
        },
      ],
    },
    {
      heading: 'Questions About Layoffs Without Jumping to Conclusions',
      paragraphs: [
        'If you see layoff news, ask whether it changes hiring or sponsorship for the particular role. Avoid assuming that every employee in a large company has the same circumstances. Counsel may need to review the employer’s records and the proposed position; you generally will not have enough public information to decide the petition’s outcome yourself.',
        'Keep the conversation specific: “Has the immigration team reviewed sponsorship for this position in light of the recent policy update?” is more useful than “Is the company banned?” It allows HR to route the question to the right team. If the answer is uncertain, record what is pending and when you can expect a response rather than treating uncertainty as an approval or denial.',
      ],
      bullets: [
        'Who is the petitioner for this role?',
        'Has immigration counsel reviewed the planned filing?',
        'Do recent workforce changes affect this team’s sponsorship plan?',
        'When will HR confirm the next filing milestone?',
      ],
    },
    {
      heading: 'Example: Priya Compares Two Offers',
      paragraphs: [
        'Priya is fictional. One recruiter points to a large number of past H-1B filings; another provides the legal employer name and a clear process for reviewing her role. Priya creates a simple comparison sheet with salary, duties, location, current OPT eligibility, future sponsorship review and the contact responsible for each answer. She marks unresolved items rather than filling them with assumptions.',
        'She does not award an offer a legal “safe” score based on brand recognition. She asks both employers to confirm their current plan and discusses timing with her DSO and counsel. Her comparison helps her make an informed employment decision, while acknowledging that sponsorship, selection and approval remain separate events. No fictional employer in this example represents an actual company’s compliance record.',
      ],
      note: 'Compare confirmed answers. A larger filing count cannot replace a written sponsorship process for your position.',
    },
    {
      heading: 'Example: Daniel Is Offered a Client-Site Assignment',
      paragraphs: [
        'Daniel is fictional. He receives an offer from a staffing company, but the job will be performed at a client’s office. He asks who employs him, who supervises the work, what the duties are and which worksite is documented. He wants the facts to be consistent across the offer, training information and immigration review.',
        'He does not assume that all staffing arrangements are fraudulent, and he does not accept a promise to create paperwork later without clarification. If explanations conflict, he pauses the start-date discussion until the employer and qualified advisers resolve them. The lesson is to verify the arrangement you will actually work under. A generic job title does not explain who controls the work or how it is authorized.',
      ],
    },
    {
      heading: 'H-1B Sponsorship and PERM Are Different Questions',
      paragraphs: [
        'An employer can discuss temporary H-1B sponsorship and a longer-term green-card process in the same recruiting conversation. Ask which process each promise concerns. The H-1B LCA is not a PERM labor certification, and a green-card plan is not present work authorization. Keep the forms, responsible agencies and milestones separate in your notes.',
        'The October 8 PERM announcement concerning named employers is a separate development from this September executive order. It should not be used as evidence that every H-1B petition from those employers is automatically canceled. If both developments are relevant to your offer, ask counsel to explain each one and its effect on the stage of your own case.',
      ],
      links: [
        {
          label: 'October PERM suspension: named employers and case stages',
          href: '/blog/perm-suspension-tech-companies-october-2026',
        },
        {
          label: 'PERM labor certification guide for OPT workers',
          href: '/blog/perm-labor-certification-opt',
        },
      ],
    },
    {
      heading: 'Keep a Useful Sponsorship Record',
      paragraphs: [
        'Create a private record with the dated offer, legal employer name, job description, location, salary information and immigration contact. Note which answers are confirmed and which are awaiting review. Use secure document storage and share applicant documents only with authorized people; a public comment thread is not the place to reconstruct your case.',
        'If a plan changes, ask what changed and which deadline is affected. Keep the old and new versions rather than editing away the earlier promise. This makes a consultation more useful and reduces confusion across recruiting, HR and immigration teams. Your current EAD dates and reporting obligations still need their own reminders while sponsorship is being discussed.',
      ],
    },
    {
      heading: 'What to Watch Next',
      paragraphs: [
        'Watch for official implementing guidance and specific agency actions, then check their scope before applying them to your situation. New H-1B employer scrutiny can lead to more questions and documentation review; this guide cannot forecast an individual approval. Ask the employer’s immigration team to interpret case-specific notices.',
        'The practical next step is a better sponsorship conversation supported by clear records. Research the employer, verify the role, confirm your current authorization and revisit unresolved answers before a work start or filing. TrackMyOPT’s sponsor information can narrow your research list, while the employer and counsel must confirm the actual sponsorship arrangement.',
      ],
    },
  ],
  checklist: [
    'Confirm the legal employer and immigration contact.',
    'Request the role’s current sponsorship-review process.',
    'Document duties, worksite and supervision accurately.',
    'Ask about workforce changes relevant to the role.',
    'Track present work authorization separately from future petitions.',
  ],
  mistakes: [
    'Treating a company’s historical filings as a guarantee.',
    'Assuming all employers with layoffs are banned.',
    'Confusing an LCA with PERM.',
    'Using this executive order to predict an individual approval.',
  ],
  faq: [
    {
      question:
        'Are companies with layoffs automatically banned from H-1B sponsorship?',
      answer:
        'The September 18 order directs agencies to take certain layoffs into account. It does not announce a universal ban on every employer that has laid off workers. Whether a specific filing is affected requires review of applicable guidance, employer records and any individual agency action.',
    },
    {
      question:
        'Does past H-1B filing history prove an employer will sponsor me?',
      answer:
        'No. Historical filings show previous activity, not a commitment for your role. Confirm the legal employer, current hiring policy, immigration contact and review timeline. A recruiter’s general answer may need follow-up from HR or counsel before you can rely on a concrete plan.',
    },
    {
      question: 'Is H-1B employer scrutiny the same as the PERM suspension?',
      answer:
        'They concern different actions and processes. This guide explains the September 18 executive order on H-1B review. The October 8 announcement concerns PERM labor-certification applications involving named employers. Ask counsel how each development affects your current status and green-card case stage.',
    },
  ],
  sources: [s.employerOrder, s.perm],
  related: [
    {
      label: 'H-1B fees: proposal and court status',
      href: '/blog/dhs-proposes-103265-h1b-fee-2026',
    },
    { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
    { label: 'Search H-1B sponsors', href: '/dashboard/h1b-sponsors' },
  ],
});
