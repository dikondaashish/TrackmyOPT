import { platformGap, platformSources } from './shared';

export const backgroundCheckOfferLetterInternationalStudentsArticle =
  platformGap({
    slug: 'background-check-offer-letter-international-students',
    title:
      'Background Checks and Offer Letters: What International Students Should Verify',
    seoTitle: 'Background Checks & Offer Letters for OPT Students',
    description:
      'What to expect from U.S. pre-employment background checks as an F-1 or OPT hire: foreign degree verification, no-SSN delays, I-9 and E-Verify timing, and the offer-letter details OPT reporting needs.',
    category: 'Career',
    tags: [
      'background check international student',
      'offer letter OPT',
      'foreign degree verification',
      'I-9 OPT',
    ],
    readTime: '9 min read',
    cta: 'resume',
    imageAlt:
      'Illustration of a new hire reviewing an offer letter beside a large magnifying glass',
    imageCaption: 'Conceptual illustration for educational context.',
    directAnswer:
      'Many U.S. employers run pre-employment background checks with your written consent. For international hires, these can take longer: foreign degree and employment verification often takes weeks, and some vendors struggle without an SSN. Expect to complete Form I-9 by your third day of work using your EAD, with E-Verify if the employer uses it. Before you sign, check that the offer letter states your title, start date, weekly hours, salary, worksite, and duties. You will need those details for OPT reporting and, on STEM OPT, for Form I-983.',
    keyTakeaways: [
      'Background checks require your written consent under the FCRA.',
      'Foreign degree verification can take several weeks, so start early.',
      'An employer cannot set an earlier start date than your EAD start date.',
      'Offer-letter details feed OPT reporting and I-983 plans.',
    ],
    sections: [
      {
        heading: 'What a background check usually covers',
        bullets: [
          'Identity verification.',
          'Education verification, including foreign degrees.',
          'Employment verification, including internships abroad.',
          'Criminal records checks where permitted.',
          'Sometimes credit checks or drug tests, depending on the role and state.',
        ],
        paragraphs: [
          'Under the Fair Credit Reporting Act, employers must get your written permission before ordering a background report, and must notify you before taking adverse action based on it, so you can dispute errors.',
        ],
        sources: [platformSources.fcra],
      },
      {
        heading: 'Why it can take longer for international hires',
        paragraphs: [
          'Verifying a degree from a university abroad can involve time zones, local holidays, and consent forms in another language. Vendors may also ask for an SSN you do not have yet. Tell the recruiter early, give alternative identifiers if asked, and keep copies of diplomas, transcripts, and previous employer letters ready.',
        ],
        links: [
          {
            label: 'How to get an SSN on OPT',
            href: '/blog/how-to-get-ssn-on-opt',
          },
        ],
      },
      {
        heading: 'I-9 and E-Verify timing',
        paragraphs: [
          'You complete Form I-9 Section 1 by your first day and present documents by the third business day. An unexpired EAD is a List A document. If your employer uses E-Verify, it creates a case after the I-9. Employers may not demand specific documents or treat you differently because of your citizenship status beyond what the law requires.',
          'You cannot start working before the start date on your EAD, even if the background check clears early.',
        ],
        links: [
          {
            label: 'Form I-9 complete guide',
            href: '/blog/form-i9-complete-guide',
          },
          {
            label: 'Can you start work before your EAD arrives?',
            href: '/blog/can-you-start-work-before-opt-ead-arrives',
          },
        ],
        sources: [platformSources.i9, platformSources.discrimination],
      },
      {
        heading: 'Offer-letter details to confirm',
        bullets: [
          'Exact job title and a duty summary that relates to your degree.',
          'Start date on or after your EAD start date.',
          'Weekly hours of 20 or more (full time is typical).',
          'Salary, including how it compares with similar roles for STEM OPT.',
          'Worksite address and remote-work arrangements.',
          'Legal employer name, which matters for OPT reporting.',
        ],
        paragraphs: [
          'If you are on STEM OPT or plan to be, confirm the employer is enrolled in E-Verify and will sign the I-983.',
        ],
        links: [
          {
            label: 'OPT and STEM OPT job offer verification checklist',
            href: '/blog/opt-stem-opt-job-offer-verification-checklist',
          },
          {
            label: 'Can you work remotely on OPT?',
            href: '/blog/can-you-work-remotely-on-opt',
          },
        ],
      },
      {
        heading: 'Fictional example: a delayed degree check',
        paragraphs: [
          'Yuki is fictional. Her offer depends on a background check, and verification of her undergraduate degree from abroad stalls. She sends the vendor a scanned diploma and a registrar contact, and tells the recruiter. Her start date moves by one week. That is still after her EAD start date, and she has unemployment days to spare.',
        ],
      },
    ],
    checklist: [
      'Read and sign the background check consent.',
      'Prepare diplomas, transcripts, and past employer letters.',
      'Tell the recruiter if you do not have an SSN yet.',
      'Confirm the start date is on or after your EAD start date.',
      'Check every offer-letter detail OPT reporting needs.',
      'Bring your EAD for Form I-9.',
    ],
    mistakes: [
      'Starting work before the EAD start date because onboarding is complete.',
      'Ignoring an adverse-action notice instead of disputing errors.',
      'Accepting an offer letter with no duties or hours listed.',
      'Waiting until the last minute to gather degree documents.',
    ],
    faq: [
      {
        question:
          'Can an employer run a background check without my permission?',
        answer:
          'For background reports from a consumer reporting agency, the FCRA requires your written consent.',
      },
      {
        question: 'Do I need an SSN to pass a background check?',
        answer:
          'Not always. Many vendors can verify you without one, but it may take longer. Tell the recruiter early.',
      },
      {
        question: 'What document do I show for Form I-9 on OPT?',
        answer:
          'Your unexpired EAD card is a List A document that establishes both identity and work authorization.',
      },
    ],
    sources: [
      platformSources.fcra,
      platformSources.i9,
      platformSources.discrimination,
    ],
    related: [
      {
        label: 'First U.S. paycheck deductions and W-4',
        href: '/blog/first-us-paycheck-deductions-w4',
      },
      {
        label: 'Salary negotiation for international workers',
        href: '/blog/salary-negotiation-international-workers-opt',
      },
      {
        label: 'OPT employment evidence checklist',
        href: '/blog/opt-employment-evidence-checklist',
      },
    ],
  });
