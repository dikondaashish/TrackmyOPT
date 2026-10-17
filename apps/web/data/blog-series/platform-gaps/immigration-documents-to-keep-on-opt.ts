import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const immigrationDocumentsToKeepOnOptArticle = platformGap({
  slug: 'immigration-documents-to-keep-on-opt',
  title:
    'Which Immigration Documents to Keep on OPT, and How to Store Them Safely',
  seoTitle: 'Immigration Documents to Keep on OPT: Checklist',
  description:
    'A document checklist for F-1 OPT and STEM OPT: I-20s, EAD cards, I-797 notices, I-983 plans, pay stubs, and I-94 records. Learn what to keep, for how long, and how to store copies securely.',
  category: 'Compliance',
  tags: ['OPT documents', 'immigration records', 'EAD card', 'I-20 copies'],
  readTime: '8 min read',
  cta: 'opt-timeline',
  imageAlt:
    'Illustration of a person filing documents into folders beside a laptop showing a padlock',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Keep every I-20 your school issued, your EAD cards, all USCIS receipt and approval notices (I-797), your I-94 records, every signed I-983 if you are on STEM OPT, offer letters, and pay stubs or other proof of employment. These records come up again for STEM OPT, H-1B, and green card filings, sometimes years later. Keep the originals in a safe place and secure digital copies you can reach from anywhere, and check expiry dates regularly.',
  keyTakeaways: [
    'Keep every I-20, not just the latest one.',
    'Proof of employment and job duties matters for future filings.',
    'Store originals offline and copies in secure, access-controlled storage.',
    'Track expiry dates for your passport, EAD, and travel signature.',
  ],
  sections: [
    {
      heading: 'The core OPT document checklist',
      paragraphs: [
        'Future filings such as H-1B petitions, green card applications, and naturalization often ask about your history in F-1 status. Lost records turn routine questions into stressful document hunts.',
      ],
      bullets: [
        'Passport and visa pages, including expired passports with old visas.',
        'Every Form I-20, including CPT, OPT, and STEM OPT recommendations and travel signatures.',
        'I-797C receipt notices and I-797 approval notices for each I-765.',
        'Front and back copies of every EAD card.',
        'I-94 records and a copy of your travel history.',
        'Signed Form I-983 training plans and evaluations (STEM OPT).',
        'Offer letters, job descriptions, and any letter explaining how the job relates to your degree.',
        'Pay stubs, W-2s, and tax returns for each year in the United States.',
        'Transcripts and diplomas.',
      ],
      links: [
        {
          label: 'OPT employment evidence checklist',
          href: '/blog/opt-employment-evidence-checklist',
        },
        {
          label: 'I-94 travel history guide',
          href: '/blog/i94-travel-history-opt-h1b',
        },
      ],
    },
    {
      heading: 'How long to keep them',
      paragraphs: [
        'There is no single deadline that applies to everything, so the safest practice is to keep immigration documents indefinitely. Tax records follow IRS guidance, and employment records are useful for as long as you might file another immigration benefit.',
        'If you plan to pursue H-1B or permanent residence, assume your F-1 and OPT history may be reviewed. Employment dates, job duties, and unemployment periods should be easy to document.',
      ],
      links: [
        {
          label: 'Green card after OPT',
          href: '/blog/green-card-after-opt',
        },
        {
          label: 'OPT to H-1B transition',
          href: '/blog/opt-to-h1b-transition',
        },
      ],
    },
    {
      heading: 'Expiry dates worth tracking',
      paragraphs: [
        'Several documents expire on different schedules, and the next step usually needs to start before the expiry date:',
      ],
      bullets: [
        'EAD end date, which drives STEM OPT filing (up to 90 days before) and H-1B timing.',
        'Passport expiry date, needed for travel and many filings.',
        'I-20 travel signature date if you plan to travel on OPT.',
        'Visa stamp expiry date, which matters for re-entry, not for staying in status.',
      ],
      links: [
        {
          label: 'STEM OPT extension guide',
          href: '/blog/stem-opt-extension-guide',
        },
        {
          label: 'Renewing your F-1 visa on OPT',
          href: '/blog/renewing-f1-visa-on-opt',
        },
      ],
    },
    {
      heading: 'Storing copies securely',
      paragraphs: [
        'Use storage with strong account security, encryption, and access controls. Avoid emailing scans to yourself or keeping them in shared drives. These documents contain passport numbers, SEVIS IDs, and receipt numbers.',
        'TrackMyOPT Pro includes a Document Vault for PDFs and images up to 10 MB each. Files are encrypted in transit and stored with AES-256 encryption at rest, and previews use time-limited links. A six-digit vault passcode locks the screen; it does not encrypt the files or replace your account password. Pro also reads documents to find expiry dates, SEVIS IDs, and receipt numbers, and can send expiry reminders.',
      ],
      note: 'If you reset a forgotten vault passcode, documents currently in the vault are removed. Keep originals and a backup copy elsewhere.',
    },
    {
      heading: 'When an original is lost',
      paragraphs: [
        'Lost EAD cards and incorrect cards each have their own replacement process. Lost I-20s can usually be reissued by your DSO. I-94 records can be retrieved online. Report a lost passport to your country’s consulate.',
      ],
      links: [
        {
          label: 'EAD card lost, stolen, incorrect, or never delivered',
          href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
        },
      ],
    },
  ],
  checklist: [
    'Gather every I-20 and confirm you have all versions.',
    'Scan both sides of each EAD card.',
    'Download your current I-94 and travel history.',
    'Save every USCIS notice as a PDF.',
    'Keep pay stubs and W-2s for each employer.',
    'Note expiry dates for your passport, EAD, and travel signature.',
  ],
  mistakes: [
    'Discarding old I-20s after a new one is issued.',
    'Keeping only digital copies on a single device.',
    'Sharing immigration scans over unsecured email or chat.',
    'Losing track of job duties from past OPT employers.',
  ],
  faq: [
    {
      question: 'Do I need to carry my EAD card at work?',
      answer:
        'You show it for Form I-9 when you start. Keep the original safe and carry it when you travel internationally or when an employer asks to see it.',
    },
    {
      question: 'Should I keep expired passports?',
      answer:
        'Yes. They may contain visas and entry stamps that document your history.',
    },
    {
      question: 'Is the Document Vault free?',
      answer:
        'No. Uploads are a Pro feature. Free tools such as the OPT Clock and filing calculators stay free.',
    },
  ],
  sources: [source.opt, platformSources.i94, platformSources.optReporting],
  related: [
    {
      label: 'OPT EAD card guide',
      href: '/blog/opt-ead-card-guide',
    },
    {
      label: 'Form I-9 complete guide',
      href: '/blog/form-i9-complete-guide',
    },
    {
      label: 'I-983 training plan guide',
      href: '/blog/i-983-training-plan-guide',
    },
  ],
});
