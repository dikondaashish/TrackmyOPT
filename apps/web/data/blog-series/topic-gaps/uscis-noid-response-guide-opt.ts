import { source } from '../shared';
import { gap, gapSources } from './shared';

export const uscisNoidResponseGuideOptArticle = gap({
    slug: 'uscis-noid-response-guide-opt',
    title:
      'USCIS NOID on an OPT or STEM OPT Case: How to Read and Respond',
    seoTitle: 'USCIS NOID Response Guide for OPT / I-765',
    description:
      'Understand a Notice of Intent to Deny (NOID) on Form I-765 for OPT or STEM OPT: deadlines, how it differs from an RFE, and how to submit a complete response.',
    category: 'USCIS',
    tags: ['NOID USCIS', 'OPT denial risk', 'I-765 NOID', 'RFE vs NOID'],
    readTime: '10 min read',
    cta: 'case-status',
    image: '/blog/topic-gaps-2026-10/uscis-noid-response-guide-opt.webp',
    imageAlt: 'Fictional applicant organizing a careful NOID response packet with labeled exhibits',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'A Notice of Intent to Deny (NOID) means USCIS is prepared to deny your filing unless you overcome the stated grounds with a timely, complete response. For many immigration filings, the NOID response period cannot exceed 30 days, and the deadline printed on your notice controls. A NOID is more serious than a routine RFE: treat it as an urgent, organized rebuttal with evidence—not a partial upload.',
    keyTakeaways: [
      'The notice deadline controls; do not assume you can get an extension.',
      'Answer every stated ground of intended denial.',
      'Keep proof of timely delivery or online upload.',
    ],
    sections: [
      {
        heading: 'NOID vs RFE vs denial',
        paragraphs: [
          'An RFE asks for missing or additional evidence and often appears when the officer believes the case could still be approved with more documents. A NOID states that the officer intends to deny and explains why. A denial is a decision; appeal or refiling options depend on the form and basis.',
          'USCIS policy changes around denying without first issuing an RFE or NOID make complete initial filings even more important—but if you receive a NOID, focus on that notice’s text and deadline.',
        ],
        links: [
          {
            label: 'USCIS deny without RFE policy 2026',
            href: '/blog/uscis-deny-without-rfe-policy-2026',
          },
          {
            label: 'OPT application denied',
            href: '/blog/opt-application-denied',
          },
        ],
        sources: [gapSources.noidRfe],
      },
      {
        heading: 'Build a complete response package',
        paragraphs: [
          'Copy the NOID’s numbered issues into a checklist. For each issue, attach evidence and a short written explanation that cites the document. Common OPT/STEM OPT themes include identity documents, degree evidence, STEM CIP and I-983 problems, employer E-Verify issues, photographs, signatures, or status maintenance questions.',
          'Do not send a placeholder “more to follow” package if the notice expects a full response by the deadline. Incomplete responses can still lead to denial.',
        ],
        bullets: [
          'Cover letter mapping each NOID point to exhibits',
          'Legible copies of requested civil and academic documents',
          'Employer letters on letterhead when the issue is job or training related',
          'SEVIS/I-20 pages that match the claim you are making',
        ],
      },
      {
        heading: 'Fictional example: Leo’s STEM I-983 NOID',
        paragraphs: [
          'Leo is fictional. His STEM OPT NOID questions whether the Form I-983 goals are measurable and whether the employer is enrolled in E-Verify. He and the employer revise the training plan, attach E-Verify documentation, and submit a point-by-point response before the printed deadline rather than arguing generically that “the job is STEM.”',
        ],
        links: [
          {
            label: 'I-983 training plan guide',
            href: '/blog/i-983-training-plan-guide',
          },
          {
            label: 'Employer refuses Form I-983',
            href: '/blog/employer-refuses-form-i983',
          },
        ],
      },
    ],
    checklist: [
      'Calendar the exact response deadline from the NOID.',
      'List every intended denial ground in a response outline.',
      'Gather exhibits and label them to match the outline.',
      'Have your DSO or counsel review status-related allegations.',
      'Retain upload receipts or mailing proof.',
    ],
    mistakes: [
      'Missing the NOID deadline while waiting for “more time.”',
      'Answering only the easiest issue and ignoring others.',
      'Submitting unreadable scans or unlabeled bulk PDFs.',
    ],
    faq: [
      {
        question: 'Is a NOID the same as a denial?',
        answer:
          'No. A NOID is a warning that denial is intended unless you overcome the issues. You still have a chance to respond before a final denial decision.',
      },
      {
        question: 'Can I get more than 30 days?',
        answer:
          'Regulations limit NOID response periods and generally do not allow extensions. Follow the date on your notice and seek counsel immediately if the deadline is close.',
      },
      {
        question: 'Should I also upload unsolicited extra evidence after responding?',
        answer:
          'Focus on a complete timely response to the NOID. Unsolicited evidence rules differ; see our unsolicited evidence guide and prefer counsel for strategy.',
      },
    ],
    sources: [gapSources.noidRfe, source.i765, source.opt],
    related: [
      {
        label: 'Which immigration documents to keep on OPT',
        href: '/blog/immigration-documents-to-keep-on-opt',
      },
      {
        label: 'USCIS unsolicited evidence on OPT',
        href: '/blog/uscis-unsolicited-evidence-opt',
      },
      {
        label: 'Track USCIS case status',
        href: '/blog/uscis-case-status-tracking-guide',
      },
      {
        label: 'myProgress taking longer than expected',
        href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
      },
    ],
  });
