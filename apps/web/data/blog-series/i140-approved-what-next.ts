import { defineArticle } from './shared';
import { STATUS_GUIDE_DATE, statusSources as src } from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "i-140 approved what next", "i 140 approved but laid off",
// "i-140 approved can spouse work", "i-140 approved how long for green card",
// "i-140 premium processing time". I-140 status searches are the second
// largest query family in Search Console.

const SLUG = 'i-140-approved-what-next';

export const i140ApprovedGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'I-140 Approved: What Happens Next, and How Long Premium Processing Takes',
  seoTitle: 'I-140 Approved: What Next? Priority Date, H-1B, Layoffs',
  description:
    'An approved I-140 locks your priority date. It is not a green card or a work permit. What it unlocks for H-1B extensions and your spouse, what happens after a layoff, and premium processing times.',
  category: 'Green Card',
  tags: [
    'I-140 approved what next',
    'I-140 approved laid off',
    'I-140 premium processing time',
    'priority date',
    'H-4 EAD I-140',
  ],
  readTime: '6 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'green-card',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: an approved I-140 locks the priority date; premium processing takes 15 or 45 business days.',
  imageCaption:
    'What an approved I-140 gives you, and what it does not.',
  directAnswer:
    'An approved Form I-140 confirms your green card category and locks your priority date. It does not let you work or stay by itself. Next you wait until your priority date is current in the Visa Bulletin, then file Form I-485 or go through a consulate. Meanwhile it can extend H-1B status beyond six years and let an H-4 spouse apply to work. Premium processing takes 15 business days for most categories and 45 for two.',
  keyTakeaways: [
    'Approval locks your priority date. It is not a green card or a work permit.',
    'You keep the priority date for later petitions unless the approval is revoked for fraud or error.',
    'An I-140 withdrawn 180 days or more after approval stays approved.',
    'Premium processing: 15 business days for most categories, 45 for EB-1C and NIW. The fee is $2,965.',
  ],
  sections: [
    {
      heading: 'What approval gives you',
      paragraphs: [
        'The I-140 is the petition step. USCIS agreed that you, the job and the employer fit an employment-based category.',
      ],
      table: {
        caption: 'What an approved I-140 does and does not do.',
        columns: ['It does', 'It does not'],
        rows: [
          ['Lock your priority date.', 'Give you a green card.'],
          ['Let you file Form I-485 once the date is current.', 'Authorize work.'],
          ['Support H-1B extensions beyond six years.', 'Extend F-1 or OPT status.'],
          ['Let an H-4 spouse apply for work authorization.', 'Move with you to a new employer.'],
        ],
      },
      sources: [src.priorityDate, src.cfrH],
    },
    {
      heading: 'The next step: your priority date',
      paragraphs: [
        'For a case with a labor certification, the priority date is the day the Department of Labor accepted the PERM application. For categories without one, it is the day USCIS received the I-140.',
        'Each month the Visa Bulletin lists cut-off dates by category and country. When your date is earlier than the cut-off, you can file Form I-485 in the United States or finish at a consulate.',
        'For people born in India or China the wait can be many years. For most other countries it is much shorter.',
      ],
      links: [
        { label: 'Visa Bulletin guides and predictions', href: '/blog/hub/visa-bulletin' },
        { label: 'I-485 and green card status tracking', href: '/blog/i-485-green-card-status-tracking' },
        { label: 'I-140 case status tracking', href: '/blog/i-140-case-status-tracking' },
      ],
      sources: [src.priorityDate, src.visaBulletin],
    },
    {
      heading: 'What it unlocks while you wait',
      figure: {
        src: '/blog/illustrations/i-140-approved-what-next.webp',
        alt: 'Painted illustration of an open paper folder on a wooden desk with a small olive tree, and a long corridor of open doors behind.',
        caption: 'Approval is one door. The priority date decides the next one. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'Two benefits matter most to H-1B families.',
      ],
      bullets: [
        'H-1B beyond six years: if your I-140 is approved and a visa number is not available because of the per-country limit, USCIS may grant H-1B extensions in steps of up to three years.',
        'H-4 work authorization: the H-4 spouse of an H-1B worker with an approved I-140 may apply for an EAD on Form I-765.',
      ],
      note: 'If you are still on F-1 or OPT, be careful with travel. An approved I-140 shows an intent to immigrate, which can matter when you renew an F-1 visa or reenter. Ask an immigration attorney before you travel.',
      links: [
        { label: 'H-4 EAD: work authorization for spouses', href: '/blog/h4-ead-opt-spouse-work-authorization' },
        { label: 'H-4 EAD case status tracking', href: '/blog/h4-ead-case-status-tracking' },
      ],
      sources: [src.cfrH],
    },
    {
      heading: 'Laid off or changing jobs after approval',
      paragraphs: [
        'The priority date is yours. The regulation lets you keep it for any later EB-1, EB-2 or EB-3 petition, unless USCIS revokes the approval for fraud, a revoked or invalid labor certification, or a material error.',
        'The petition belongs to the employer. A new employer normally starts again with a new PERM and a new I-140, and you carry the old priority date over.',
      ],
      table: {
        caption: 'What happens to an approved I-140 when the job ends.',
        columns: ['Event', 'Effect on the I-140', 'Priority date'],
        rows: [
          ['Employer withdraws it less than 180 days after approval', 'Revoked automatically', 'Kept for a later petition'],
          ['Employer withdraws it 180 days or more after approval', 'Stays approved', 'Kept'],
          ['Employer closes 180 days or more after approval', 'Stays approved', 'Kept'],
          ['Revoked for fraud, labor certification problems or material error', 'Revoked', 'Lost'],
        ],
      },
      note: 'An I-140 that stays approved can still support H-1B extensions beyond six years. It does not replace the job offer you need to file Form I-485.',
      links: [
        { label: 'PERM labor certification on OPT', href: '/blog/perm-labor-certification-opt' },
        { label: 'Green card after OPT', href: '/blog/green-card-after-opt' },
      ],
      sources: [src.priorityDate, src.revocation, src.cfrH],
    },
    {
      heading: 'I-140 premium processing time',
      paragraphs: [
        'The employer, or you in a self-petition, can pay for premium processing with Form I-907. USCIS must approve, deny, or ask for more evidence within the period. A request for evidence starts a new period when USCIS gets your answer.',
      ],
      table: {
        caption: 'I-140 premium processing periods and fee.',
        columns: ['Category', 'Period', 'Fee'],
        rows: [
          ['EB-1A, EB-1B, EB-2 without a waiver, EB-3', '15 business days', '$2,965'],
          ['EB-1C multinational manager', '45 business days', '$2,965'],
          ['EB-2 national interest waiver', '45 business days', '$2,965'],
        ],
      },
      note: 'Premium processing speeds up the I-140 decision only. It does not move your priority date.',
      links: [
        { label: 'Premium processing: business days or calendar days?', href: '/blog/premium-processing-business-days-or-calendar-days' },
        { label: 'EB-2 NIW green card on OPT', href: '/blog/eb2-niw-green-card-opt' },
      ],
      sources: [src.premium],
    },
  ],
  checklist: [
    'Save the I-140 approval notice and note the priority date.',
    'Check the Visa Bulletin each month for your category and country.',
    'Ask your employer when the H-1B extension will be filed.',
    'Check whether your spouse can file for an H-4 EAD.',
    'Before a job change, ask when the 180-day mark falls.',
  ],
  mistakes: [
    'Treating the approval as work authorization.',
    'Assuming the I-140 moves to a new employer.',
    'Leaving a job before 180 days without asking what happens to the petition.',
    'Travelling on an F-1 visa after approval without legal advice.',
  ],
  faq: [
    {
      question: 'What happens after my I-140 is approved?',
      answer:
        'You wait for your priority date to become current in the Visa Bulletin. Then you file Form I-485 or complete consular processing.',
    },
    {
      question: 'How long after I-140 approval do I get a green card?',
      answer:
        'It depends on your category and country of birth. Most countries wait months to a few years. India and China can wait many years.',
    },
    {
      question: 'What if I am laid off after my I-140 is approved?',
      answer:
        'You keep the priority date for a later petition. If the I-140 was approved 180 days or more before the employer withdraws it, the petition itself stays approved.',
    },
    {
      question: 'Can my spouse work after my I-140 is approved?',
      answer:
        'If you hold H-1B status and your spouse holds H-4, your spouse may apply for an EAD once your I-140 is approved.',
    },
    {
      question: 'How long does I-140 premium processing take?',
      answer:
        '15 business days for most categories and 45 business days for EB-1C and national interest waiver cases. The fee is $2,965.',
    },
    {
      question: 'Does an approved I-140 let me stay after OPT ends?',
      answer:
        'No. It gives no status and no work authorization. You still need H-1B or another status until you can file Form I-485.',
    },
  ],
  sources: [src.priorityDate, src.revocation, src.cfrH, src.premium, src.visaBulletin],
  related: [
    { label: 'I-140 case status tracking', href: '/blog/i-140-case-status-tracking' },
    { label: 'I-485 and green card status tracking', href: '/blog/i-485-green-card-status-tracking' },
    { label: 'Visa Bulletin guides and predictions', href: '/blog/hub/visa-bulletin' },
    { label: 'OPT to green card without H-1B', href: '/blog/opt-to-green-card-without-h1b' },
  ],
});
