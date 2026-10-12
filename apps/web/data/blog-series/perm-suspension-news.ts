import { defineArticle } from './shared';
import {
  policyPublication,
  policySources as s,
  policyVisual,
} from './october-policy-sources';

const abc = {
  label: 'October 8 press-conference reporting and company response',
  publisher: 'ABC News',
  url: 'https://abcnews.com/Politics/vance-suspends-microsoft-green-card-program-crack-alleged/story?id=137100899',
};
const permScope = {
  label: '20 CFR 656.1 — purpose of permanent labor certification',
  publisher: 'eCFR',
  url: 'https://www.ecfr.gov/current/title-20/chapter-V/part-656/subpart-A/section-656.1',
};

export const permSuspensionArticle = defineArticle({
  ...policyPublication,
  slug: 'perm-suspension-tech-companies-october-2026',
  title:
    'PERM Suspension at Microsoft, Adobe and IT Firms: What Workers Should Know',
  seoTitle: 'PERM Suspension October 2026: Tech Workers’ Guide',
  description:
    'The October 2026 PERM suspension covers new and pending cases at eight employers. Learn what OPT and H-1B workers should verify at each green-card stage.',
  category: 'Green Card News',
  badgeLabel: 'Developing news',
  reviewLabel: 'News reporting and program regulations reviewed',
  tags: [
    'PERM suspension October 2026',
    'Microsoft PERM suspension',
    'Adobe PERM green card',
    'PERM labor certification',
    'Infosys TCS Cognizant PERM',
    'H-1B green card sponsorship',
  ],
  readTime: '8 min read',
  cta: 'uscis-tracking',
  image: '/blog/october-policy-2026/perm-pause.webp',
  imageAlt:
    'Fictional tech worker and attorney reviewing a paused PERM stage and later green-card document stages',
  statusNote:
    'Checked October 12, 2026: Reuters and ABC News report the October 8 announcement. Reuters reports a halt to accepting new and processing pending PERM applications involving eight named employers. This is developing news; company-specific notices, later-stage treatment and a reopening date require further confirmation. Allegations are not findings of guilt.',
  dataNote:
    'The announcement’s scope is attributed to contemporaneous reporting. Program mechanics are checked against the labor-certification regulations. Company statements represent the company’s position. We do not claim to have reviewed individual suspension notices, applicant files or a court determination of the allegations.',
  directAnswer:
    'The October 2026 PERM suspension concerns a labor-certification step in employer-sponsored green-card cases. Officials announced a halt involving Microsoft, Adobe and six IT services firms. It does not by itself establish that every employee’s H-1B, OPT EAD, approved I-140 or green card is canceled. This article is for international graduates and workers who need to identify their case stage and ask the employer’s immigration counsel what is affected.',
  keyTakeaways: [
    'The reported announcement covers new and pending PERM applications at named employers.',
    'PERM certification is a different stage from USCIS’s I-140 and I-485 processes.',
    'A pending green-card plan does not replace current work authorization.',
    'Do not assume a public announcement stops an existing case deadline.',
    'Request written, case-specific guidance from the employer’s immigration team.',
  ],
  sections: [
    {
      heading: 'What Was Announced on October 8?',
      paragraphs: [
        'Reuters reports that Labor Secretary Keith Sonderling said the department would stop accepting new and processing pending permanent labor-certification applications involving the named companies. The reported list is Microsoft, Adobe, Cognizant, Infosys, Tata Consultancy Services, Wipro, HCL Technologies and Capgemini.',
        'ABC News reports that Vice President JD Vance announced the action while alleging immigration-program abuse and did not give a fixed end date. Those are the administration’s allegations and announced position. They should not be presented as a court finding that every named company or employee committed fraud.',
        'Microsoft’s October 8 statement disputes the characterization of its hiring practices and says approximately 80% of its roughly 6,000 H-1B filings in the last fiscal year concerned extending or changing existing employees’ status. That is Microsoft’s account, not an independent audit of its records.',
      ],
      sources: [s.permNews, abc, s.microsoft],
      visual: policyVisual(
        'perm-pause',
        'PERM announcement → identify the case stage → obtain specific guidance.',
        [
          'October 8: officials announce a halt to new and pending PERM at eight employers.',
          'Now: identify employer entity, PERM stage and separate work-authorization dates.',
          'Next: obtain case-specific guidance; later-stage scope and reopening date need confirmation.',
        ]
      ),
    },
    {
      heading: 'What Is Permanent Labor Certification, or PERM?',
      paragraphs: [
        'Permanent labor certification is a Department of Labor process used in many employer-sponsored employment-based green-card cases. The regulation requires certification about the availability of able, willing, qualified U.S. workers and the effect on similarly employed U.S. workers’ wages and working conditions. Certification does not itself grant permanent residence.',
        'For a typical PERM-based case, think in stages: employer preparation and labor certification, the immigrant petition, and the later permanent-residence application or immigrant-visa process when eligible. Different categories have different requirements, and some paths do not use PERM. Identify the route your employer actually selected rather than assuming every green-card application follows an identical sequence.',
      ],
      sources: [permScope, s.perm, s.i140],
      links: [
        {
          label: 'PERM labor certification guide for OPT workers',
          href: '/blog/perm-labor-certification-opt',
        },
      ],
    },
    {
      heading: 'How to Identify Your Case Stage',
      paragraphs: [
        'Ask the employer’s immigration team for the form or process name, the legal employer entity and the latest dated milestone. “My green card has started” could mean an internal intake, a wage request, recruitment, a pending ETA-9089, a certification or a USCIS filing. Those descriptions are not interchangeable.',
        'Match each stage to its document. A recruiter’s promise is different from a filed application, and a labor-certification result is different from a USCIS petition approval. If you do not have copies, ask which documents can be shared and who can confirm the status. Do not post case numbers or immigration records publicly while trying to crowdsource an answer.',
      ],
      bullets: [
        'Preparation or recruitment: ask whether the planned PERM filing can proceed.',
        'Pending PERM: ask whether processing is on hold and whether any response deadline remains.',
        'Certified PERM: ask whether and how it can support the planned I-140 filing.',
        'Pending or approved I-140: ask about that USCIS stage and any employer-specific action.',
        'Pending I-485 or consular process: ask about the specific application, underlying petition and current authorization.',
      ],
    },
    {
      heading:
        'Does the PERM Suspension Cancel H-1B or OPT Work Authorization?',
      paragraphs: [
        'A labor-certification halt and a worker’s current permission to work are different issues. The public announcement should not be converted into a blanket statement that all employees must stop working or leave the country. At the same time, it is not a guarantee that every individual’s situation is unaffected.',
        'Review the basis on which you work today: current status, employer-specific approval or EAD, relevant dates and any notices. Then separately review the permanent-residence case. A real layoff, petition action or expiring authorization may require attention regardless of what happens to PERM. Keeping the two timelines separate makes a consultation more precise and reduces the risk of acting on an overly broad headline.',
      ],
      links: [
        {
          label: 'OPT to H-1B transition and timing',
          href: '/blog/opt-to-h1b-transition',
        },
        {
          label: 'H-1B layoff grace-period proposal',
          href: '/blog/h1b-60-day-grace-period-proposal-2026',
        },
      ],
    },
    {
      heading: 'Example: Asha Is on OPT and Has a Sponsorship Promise',
      paragraphs: [
        'Asha is fictional. Her recruiter said that green-card sponsorship would start after an internal eligibility review. She has not received confirmation that a PERM application was filed. After the announcement, she asks HR to identify the legal employer and what stage, if any, has actually begun. She records the response and requests the next review date.',
        'She continues to track her present OPT documents and asks the DSO about her existing obligations. She does not assume that a future green-card promise extends her EAD or guarantees an alternative work visa. Her next step is a written immigration plan that addresses both present authorization and future sponsorship, rather than an immediate resignation based on the company’s name in a headline.',
      ],
    },
    {
      heading: 'Example: Ravi Has a Pending PERM Application',
      paragraphs: [
        'Ravi is fictional. His employer’s counsel previously confirmed a pending PERM application. He asks whether the announced hold applies to the exact employer entity and case, what the latest status shows, and whether any audit or other response is still due. He brings the dated communications to the discussion rather than asking only whether “all green cards are frozen.”',
        'He also asks how a delay interacts with his separate immigration timeline. He avoids assuming that changing teams or employers transfers the labor-certification case automatically. Those options require legal review of the job, employer and case stage. His practical response is to identify affected milestones and preserve all deadlines until counsel confirms a change.',
      ],
      note: 'A processing hold should not be treated as permission to ignore a dated notice. Ask who is responsible for every outstanding response.',
    },
    {
      heading: 'Example: Lin Already Has a Certified PERM',
      paragraphs: [
        'Lin is fictional. Her labor certification was granted before the announcement, and counsel is preparing the I-140. She asks whether later guidance affects that filing and whether any notice has been issued in her case. She does not assume the announcement automatically revoked the certification, and she does not assume its normal filing deadline has been suspended.',
        'The regulation generally requires an approved PERM certification to be filed in support of an I-140 within 180 calendar days of certification. It also provides procedures for revocation or invalidation in specified circumstances. Counsel should review Lin’s document and any new agency action. The example shows why a later-stage case needs a different conversation from an application that is still pending at DOL.',
      ],
      sources: [s.permValidity],
    },
    {
      heading: 'Questions to Send Your Employer’s Immigration Team',
      paragraphs: [
        'Send a short request through the employer’s authorized channel. Identify your name and internal case reference privately, then ask for the legal entity, stage, latest milestone, applicable notices and next deadline. Request an explanation of which part of the announcement affects the case and which information is still awaiting agency clarification.',
        'If HR and outside counsel give different answers, ask them to reconcile the instructions before you make an employment or travel decision. Keep copies of dated responses. Avoid paying someone who promises to bypass the announced suspension or move an employer-specific case without reviewing the documents. A useful adviser explains the available legal options and their limits.',
      ],
      numbered: [
        'Confirm the sponsoring legal entity.',
        'Identify the actual case stage and latest document.',
        'List outstanding deadlines and who will meet them.',
        'Ask what current authorization permits work and through what date.',
        'Request a plan for the next employer or agency update.',
      ],
    },
    {
      heading: 'What Is Still Unclear, and What Comes Next?',
      paragraphs: [
        'The sources reviewed do not resolve every entity, exception, previously certified case or later USCIS stage. We have not reviewed the individual company notices. Watch for DOL implementation guidance, employer communications, any litigation and an announcement changing or lifting the hold. A projected reopening date would be speculation.',
        'For the PERM suspension in October 2026, the most useful action is to identify the stage and protect the separate work-authorization timeline. TrackMyOPT’s USCIS case tool can help organize an existing USCIS receipt, such as an I-140; it does not submit PERM applications or monitor DOL’s FLAG system. Ask counsel for a dated plan and recheck the sources when the facts change.',
      ],
      links: [
        {
          label: 'Track a USCIS I-140 case',
          href: '/blog/i-140-case-status-tracking',
        },
      ],
    },
  ],
  checklist: [
    'Confirm whether the sponsoring entity is affected.',
    'Get the exact stage and latest dated document.',
    'Ask about pending notices and response deadlines.',
    'Review EAD, I-94 and petition dates separately.',
    'Get case-specific advice before changing employment or travel.',
    'Monitor official implementation guidance and employer updates.',
  ],
  mistakes: [
    'Calling the announcement cancellation of all H-1B visas.',
    'Treating allegations as proven misconduct by every employee.',
    'Assuming certified PERM, I-140 and I-485 stages are identical.',
    'Inventing a reopening date.',
    'Assuming a news announcement tolls existing deadlines.',
  ],
  faq: [
    {
      question: 'Which companies were named in the PERM announcement?',
      answer:
        'Reuters names Microsoft, Adobe, Cognizant, Infosys, Tata Consultancy Services, Wipro, HCL Technologies and Capgemini. Verify the actual sponsoring legal entity and company-specific guidance with counsel. A brand-name list alone does not resolve every subsidiary, client assignment or individual applicant’s circumstances.',
    },
    {
      question: 'Are pending PERM applications included?',
      answer:
        'Reuters reports that the October 8 statement covers both accepting new and processing pending permanent labor-certification applications involving the named employers. Ask counsel whether that instruction applies to your case and whether any existing notice or response deadline still requires action.',
    },
    {
      question: 'Does the suspension automatically cancel an approved I-140?',
      answer:
        'The reported announcement concerns labor-certification applications. It does not establish automatic cancellation of every approved USCIS petition. That is not a guarantee for your case: ask counsel about the underlying certification, employer entity, any agency notice and the stage of your permanent-residence process.',
    },
    {
      question: 'When will the PERM suspension end?',
      answer:
        'No fixed reopening date is established in the sources reviewed October 12, 2026. ABC News reports that officials did not specify a definite duration. Monitor later agency guidance and employer communications, and avoid basing a filing, job change or travel plan on a predicted end date.',
    },
    {
      question: 'Can TrackMyOPT track my PERM case at DOL?',
      answer:
        'TrackMyOPT’s case-status tool works with USCIS receipts, including supported I-140 tracking. PERM is a Department of Labor process; this tool does not monitor FLAG or file labor certifications. Use the employer’s immigration team for PERM status and keep USCIS-stage records separate.',
    },
  ],
  sources: [s.permNews, abc, s.microsoft, permScope, s.permValidity, s.i140],
  related: [
    {
      label: 'PERM process for OPT workers',
      href: '/blog/perm-labor-certification-opt',
    },
    {
      label: 'I-140 USCIS case tracking',
      href: '/blog/i-140-case-status-tracking',
    },
    {
      label: 'H-1B employer scrutiny',
      href: '/blog/h1b-employer-scrutiny-september-2026',
    },
    {
      label: 'Additional October 8 reporting from POLITICO',
      href: 'https://www.politico.com/news/2026/10/08/vance-microsoft-adobe-h-1-b-green-cards-01111603',
    },
  ],
});
