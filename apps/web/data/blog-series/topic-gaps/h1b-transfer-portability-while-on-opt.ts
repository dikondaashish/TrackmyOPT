import { source } from '../shared';
import { gap, gapSources } from './shared';

export const h1bTransferPortabilityWhileOnOptArticle = gap({
    slug: 'h1b-transfer-portability-while-on-opt',
    title:
      'Changing Employers While on OPT or Early H-1B: Transfer, Portability, and New Petitions',
    seoTitle: 'H-1B Transfer vs New Petition While on OPT',
    description:
      'Clarify the difference between an H-1B transfer/portability and a new H-1B petition while you are still on OPT, including when you can start work for a new employer.',
    category: 'H-1B',
    tags: [
      'H-1B transfer',
      'H-1B portability',
      'change employer OPT',
      'AC21',
    ],
    readTime: '11 min read',
    cta: 'sponsors',
    image: '/blog/topic-gaps-2026-10/h1b-transfer-portability-while-on-opt.webp',
    imageAlt: 'Fictional OPT worker discussing a new employer offer and H-1B petition documents',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      '“H-1B transfer” usually means a new employer files an H-1B petition so you can move into or between H-1B employment. AC21 portability that lets some workers start with a new H-1B employer upon a nonfrivolous filing generally applies when you are already in H-1B status (with additional conditions). If you are still only on OPT, a new employer typically needs its own petition strategy—often a change of status or consular path—and you may continue OPT work for that employer only if the job is degree-related and your OPT EAD remains valid, plus any STEM reporting rules.',
    keyTakeaways: [
      'OPT employment changes and H-1B petition changes are different legal tracks.',
      'Portability rules for starting work on a pending H-1B transfer generally require already being in H-1B status.',
      'Cap-exempt vs cap-subject filings change timing and lottery risk.',
    ],
    sections: [
      {
        heading: 'Still on OPT: changing jobs is an OPT problem first',
        paragraphs: [
          'On post-completion OPT you may change employers if the new role is directly related to your major, you report updates as required, and you stay within unemployment limits. STEM OPT adds E-Verify, Form I-983, and material-change reporting duties before or when you switch.',
          'A promise that “our lawyer will file H-1B” does not replace OPT compliance. Keep working only within OPT rules until an H-1B approval or lawful portability condition actually authorizes H-1B employment.',
        ],
        links: [
          {
            label: 'Change employers on STEM OPT',
            href: '/blog/change-employers-stem-opt',
          },
          {
            label: 'Change employer while STEM OPT pending',
            href: '/blog/change-employer-stem-opt-pending',
          },
          {
            label: 'OPT reporting requirements and DSO',
            href: '/blog/opt-reporting-requirements-dso',
          },
        ],
      },
      {
        heading: 'When H-1B “transfer” / portability language applies',
        paragraphs: [
          'Once you are in H-1B status, a new employer may file a petition and, when portability conditions are met, you may be able to begin working for that new petitioner upon a nonfrivolous filing rather than waiting for approval. Those conditions and evidence standards are technical—paystubs, prior status maintenance, and petition details matter.',
          'If you are still F-1/OPT and have never been admitted or changed to H-1B, you are usually looking at a new H-1B petition with COS or consular processing—not classic portability from an existing H-1B period of stay.',
        ],
        sources: [gapSources.h1bPortability, source.capgap],
      },
      {
        heading: 'Cap-subject vs cap-exempt moves',
        paragraphs: [
          'Moving to a cap-exempt employer can sometimes allow an H-1B filing outside the lottery, subject to the employer’s qualifying status and the role. Moving from cap-exempt to cap-subject employment can reintroduce lottery and timing issues. Verify the legal entity on the petition, not only the brand name on your offer letter.',
        ],
        links: [
          {
            label: 'Find cap-exempt H-1B employers',
            href: '/blog/find-cap-exempt-h1b-employers',
          },
          {
            label: 'Top H-1B sponsor companies 2026',
            href: '/blog/top-h1b-sponsor-companies-2026',
          },
        ],
      },
      {
        heading: 'Fictional example: Priya’s startup offer',
        paragraphs: [
          'Priya is fictional and currently on STEM OPT. A startup offers to “transfer her H-1B,” but she has never held H-1B status. Counsel explains the company must file a new petition (likely COS or consular) and that until H-1B is authorized she may work there only under STEM OPT rules with a new I-983. The word “transfer” in the offer email was recruiting language, not a legal category she already possessed.',
        ],
      },
    ],
    checklist: [
      'Write down your current status: OPT, STEM OPT, or H-1B.',
      'Ask whether the new filing is cap-subject or cap-exempt.',
      'If still on OPT/STEM OPT, complete reporting and I-983 steps before starting.',
      'If already H-1B, ask counsel whether portability conditions are met before starting.',
      'Keep copies of every I-797 and employment verification letter.',
    ],
    mistakes: [
      'Starting H-1B work on a pending petition while still only on OPT and calling it portability.',
      'Ignoring STEM I-983 updates when changing employers.',
      'Assuming any new employer can “transfer” without a new petition.',
    ],
    faq: [
      {
        question: 'Can I work for the new H-1B employer on OPT while the petition is pending?',
        answer:
          'Possibly under OPT/STEM OPT rules if the job is degree-related and you meet reporting requirements. That is OPT work, not H-1B portability. Confirm both tracks separately.',
      },
      {
        question: 'Does an H-1B transfer reset my OPT unemployment days?',
        answer:
          'No. Unemployment counting follows OPT/STEM OPT rules while you remain in those categories. H-1B status ends the OPT employment framework once you properly begin H-1B.',
      },
      {
        question: 'Can I hold two H-1B petitions?',
        answer:
          'Concurrent or sequential filings are sometimes used, but status, cap, and work-start rules are fact-specific. Get counsel before relying on multiple pending petitions.',
      },
    ],
    sources: [gapSources.h1bPortability, source.capgap, source.opt, source.stem],
    related: [
      { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
      {
        label: 'H-1B COS vs consular processing from OPT',
        href: '/blog/h1b-change-of-status-vs-consular-processing-opt',
      },
      {
        label: 'Laid off on STEM OPT',
        href: '/blog/laid-off-on-stem-opt',
      },
    ],
  });
