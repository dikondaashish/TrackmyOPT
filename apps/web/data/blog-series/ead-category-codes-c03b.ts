import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "c03b visa category" (144 impressions at position 1.1), "c03b" (95) and
// "opt codes" (44) land on pages that never explain the Category field on the
// EAD. This explainer maps the printed code to the Form I-765 eligibility
// category. It covers several I-765 categories, so it uses the generic USCIS
// tracking CTA.
//
// Verified 2026-11-08 against: Form I-765 instructions (edition 08/21/25),
// 8 CFR 274a.12(c), USCIS EAD page, USCIS automatic EAD extension page,
// M-274 sections 5.1 and 7.4.2, and USCIS I-765 data tables (FY2023), which
// list the codes as C03A, C03B and C03C.

const src = {
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  i765Instructions: {
    label: 'Instructions for Form I-765 (edition 08/21/25)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf',
  },
  reg: {
    label: '8 CFR 274a.12: Classes of aliens authorized to accept employment',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.12',
  },
  m274Extensions: {
    label:
      'M-274, 5.1 Automatic extensions based on a timely filed application to renew employment authorization',
    publisher: 'USCIS I-9 Central',
    url: 'https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/50-automatic-extensions-of-employment-authorization-andor-employment-authorization-documents-eads-in/51-automatic-extensions-based-on-a-timely-filed-application-to-renew-employment-authorization',
  },
  m274Students: {
    label: 'M-274, 7.4.2 F-1 and M-1 nonimmigrant students',
    publisher: 'USCIS I-9 Central',
    url: 'https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/70-evidence-of-employment-authorization-for-certain-categories/74-exchange-visitors-and-students/742-f-1-and-m-1-nonimmigrant-students',
  },
  ead: {
    label: 'Employment Authorization Document',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/employment-authorization-document',
  },
  autoExtension: {
    label: 'Automatic Employment Authorization Document (EAD) Extension',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/information-for-employers-and-employees/automatic-employment-authorization-document-ead-extension',
  },
  i765Data: {
    label: 'Form I-765 Application for Employment Authorization data, FY2023',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/data/i-765_application_for_employment_fy23.pdf',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'c03b-c03c-c03a-ead-category-codes';

export const eadCategoryCodes: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'case-status',
  title:
    'C03B, C03C and C03A: What the Category Code on Your EAD Card Means',
  seoTitle: 'C03B EAD Category Code Meaning: C03A, C03C, C09, C26',
  description:
    'Decode the Category field on your EAD card. C03A, C03B and C03C are the three F-1 OPT codes; C09, C26, C08, A12 and C19 cover other common cases. Learn how each maps to Form I-765 and what to do if the code is wrong.',
  category: 'USCIS',
  tags: [
    'C03B',
    'C03C',
    'C03A',
    'EAD category code',
    'OPT codes',
    'Form I-766',
    'I-765 eligibility category',
  ],
  readTime: '8 min read',
  publishedDate: '2026-10-28',
  modifiedDate: '2026-11-08',
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the three F-1 OPT category codes C03A, C03B and C03C as they relate to Form I-765.',
  imageCaption:
    'The three OPT codes and the Form I-765 categories they come from. Generated from the USCIS sources cited in this guide.',
  directAnswer:
    'C03B is the EAD category code for post-completion OPT, Form I-765 eligibility category (c)(3)(B). C03A is pre-completion OPT, (c)(3)(A), and C03C is the 24-month STEM OPT extension, (c)(3)(C). The code appears on the front of the EAD under "Category". It is a work authorization category, not a visa type. It should match the category on your I-765 receipt notice.',
  keyTakeaways: [
    'The Category field on the EAD is a short version of the Form I-765 eligibility category. (c)(3)(B) becomes C03B.',
    'C03A is pre-completion OPT, C03B is post-completion OPT (up to 12 months), and C03C is the 24-month STEM OPT extension.',
    'Compare the code with the "Class requested" or "Eligibility Category" on your Form I-797C receipt notice the day the card arrives.',
    'If USCIS printed the wrong category, USCIS corrects it at no cost. If you entered the wrong category, contact your DSO right away, because the OPT filing windows still apply.',
  ],
  sections: [
    {
      heading: 'What the Category field on your EAD shows',
      paragraphs: [
        'Your Employment Authorization Document is Form I-766. USCIS issues it after approving a Form I-765. The card is evidence that you are authorized to work in the United States.',
        'The USCIS Handbook for Employers (M-274) says the eligibility category appears on the front of the EAD under "Category". The same section shows codes written as one letter and two digits, such as C09, C26, A12 and C19. The expiration date appears next to "Card Expires".',
        'USCIS uses the same short codes in its published Form I-765 data. There the three F-1 OPT categories are listed as C03A (pre-completion OPT), C03B (post-completion OPT) and C03C (24-month STEM OPT).',
        'People often search for "C03B visa category". The code is not a visa and not an immigration status. It names the legal basis for your work permission. An F-1 student on OPT is still in F-1 status, shown by the I-94 and the I-20 with the OPT recommendation. The visa stamp is only for entering the United States and may expire while you remain in status.',
      ],
      links: [
        { label: 'What is an EAD card', href: '/answers/what-is-an-ead-card' },
        { label: 'What is Form I-765', href: '/answers/what-is-i-765' },
      ],
      sources: [src.m274Extensions, src.i765Data, src.i765Instructions],
    },
    {
      heading: 'How the card code maps to the I-765 eligibility category',
      paragraphs: [
        'On Form I-765 you enter one eligibility category in Part 2, Item Number 27. The instructions write it with parentheses, for example (c)(3)(B). The letter (a) or (c) points to a paragraph of 8 CFR 274a.12.',
        'The card code drops the parentheses and pads the number to two digits. So (c)(3)(B) becomes C03B, (c)(9) becomes C09 and (a)(12) becomes A12. Read the code from left to right: letter, number, then any sub-letter.',
        'Your receipt notice uses the same idea. USCIS describes the "Class requested" or "Eligibility Category" on the Form I-797C as the category you applied under. The code on the card should match it.',
      ],
      table: {
        caption:
          'How to read an EAD category code. Examples use categories described in the Form I-765 instructions.',
        columns: ['Part of the code', 'Example', 'What it means'],
        rows: [
          ['First letter', 'C in C03B', 'Paragraph (c) of 8 CFR 274a.12: people who must apply for employment authorization.'],
          ['First letter', 'A in A12', 'Paragraph (a): work authorized incident to status, with the EAD as proof.'],
          ['Two digits', '03 in C03B', 'The numbered paragraph. (c)(3) covers F-1 students.'],
          ['Last letter', 'B in C03B', 'The sub-category. (c)(3)(B) is post-completion OPT.'],
        ],
      },
      note: 'The Form I-765 instructions explain that some categories are "incident to status" and others need USCIS approval first. Do not read more into the letter than that. Your approval notice and the card dates control what you may do.',
      sources: [src.i765Instructions, src.reg, src.autoExtension],
    },
    {
      heading: 'The three OPT codes: C03A, C03B and C03C',
      paragraphs: [
        'All three come from 8 CFR 274a.12(c)(3)(i). Each needs your DSO’s recommendation before you file. Each has its own filing window in the Form I-765 instructions.',
        'C03A, pre-completion OPT, is for work before you finish your program. You may file up to 90 days before you have been enrolled for one full academic year. The work cannot start before you complete that year.',
        'C03B, post-completion OPT, is for up to 12 months of work after your program. You may file up to 90 days before, and no later than 60 days after, your program end date. You must file the I-765 within 30 days of the DSO recommendation.',
        'C03C is the 24-month STEM OPT extension. You may file up to 90 days before your current OPT expires. The I-765 must be filed within 60 days of the DSO recommendation. Item Number 28 asks for your degree, the employer name as listed in E-Verify and the E-Verify company ID.',
      ],
      table: {
        caption:
          'The three F-1 OPT categories. Filing windows are from the Form I-765 instructions (edition 08/21/25).',
        columns: ['Card code', 'I-765 category', 'What it is', 'When to file'],
        rows: [
          ['C03A', '(c)(3)(A)', 'Pre-completion OPT', 'Up to 90 days before one full academic year of enrollment'],
          ['C03B', '(c)(3)(B)', 'Post-completion OPT, up to 12 months', 'Up to 90 days before, no later than 60 days after the program end date, and within 30 days of the DSO recommendation'],
          ['C03C', '(c)(3)(C)', '24-month STEM OPT extension', 'Up to 90 days before current OPT expires, within 60 days of the DSO recommendation'],
        ],
      },
      links: [
        { label: 'OPT EAD card guide', href: '/blog/opt-ead-card-guide' },
        { label: 'Pre-completion OPT vs CPT', href: '/blog/pre-completion-opt-vs-cpt' },
        {
          label: 'STEM OPT 180-day automatic extension explained',
          href: '/blog/stem-opt-180-day-auto-extension-explained-2026',
        },
      ],
      sources: [src.reg, src.i765Instructions, src.i765Data],
    },
    {
      heading: 'Other category codes students and families often see',
      paragraphs: [
        'After OPT, many people move to another EAD category. A spouse may also hold an EAD under a different code. The table lists common ones and what they mean in the Form I-765 instructions.',
        'The M-274 notes that some codes carry an extra letter P, such as C09P. Employers are told to ignore the P when comparing the card with the receipt notice.',
      ],
      table: {
        caption:
          'Common EAD category codes outside OPT. Descriptions are from the Form I-765 instructions, 8 CFR 274a.12 and the M-274.',
        columns: ['Card code', 'I-765 category', 'Who it is for'],
        rows: [
          ['C09', '(c)(9)', 'Applicant with a pending Form I-485 to adjust status under INA section 245'],
          ['C26', '(c)(26)', 'H-4 spouse of an H-1B worker who has an approved I-140 or H-1B status under AC21 sections 106(a) and (b)'],
          ['C08', '(c)(8)', 'Applicant with a pending asylum application, generally after the 150-day waiting period'],
          ['A12', '(a)(12)', 'Person granted Temporary Protected Status (TPS)'],
          ['C19', '(c)(19)', 'TPS applicant with a pending Form I-821 whom USCIS finds prima facie eligible'],
        ],
      },
      links: [
        {
          label: 'H-4 EAD for spouses of OPT and H-1B workers',
          href: '/blog/h4-ead-opt-spouse-work-authorization',
        },
        { label: 'H-4 EAD case tracking', href: '/blog/h4-ead-case-status-tracking' },
        { label: 'Green card after OPT', href: '/blog/green-card-after-opt' },
      ],
      sources: [src.i765Instructions, src.reg, src.m274Extensions],
    },
    {
      heading: 'Check the code the day the card arrives',
      paragraphs: [
        'Open the envelope as soon as it comes. Compare the card with your approval notice and your receipt notice. Do this before your first day of work, not after.',
        'Look at the Category first. A post-completion OPT card should say C03B. A STEM OPT card should say C03C. Then check your name, date of birth and the validity dates.',
        'Scan the front and back of the card and store the file safely. You will need the card details for Form I-9 and, on OPT, for SEVP Portal reporting.',
      ],
      numbered: [
        'Find the category you applied under on the I-797C receipt notice.',
        'Read the code under "Category" on the front of the card.',
        'Confirm they match, ignoring a trailing P.',
        'Check your name, date of birth and the "Card Expires" date.',
        'Scan the card and keep the approval and receipt notices together.',
      ],
      links: [
        { label: 'EAD card status: check it and know when it arrives', href: '/blog/ead-card-status-check' },
        { label: 'SEVP Portal guide for OPT', href: '/blog/sevp-portal-guide-opt' },
      ],
      sources: [src.m274Extensions, src.autoExtension],
    },
    {
      heading: 'If the wrong category is printed',
      paragraphs: [
        'First, work out whose error it is. Compare the card with what you entered in Item Number 27 of your I-765. If you entered the right category and the card shows another, the error is likely USCIS’s.',
        'For a USCIS error, USCIS says it will correct the card at no additional cost. You do not need a new I-765 or a filing fee. If no evidence is needed, submit an online service request and choose "EAD Replacement due to USCIS Error". Then return the card by USPS.',
        'If evidence is needed, or you prefer mail, send a letter explaining the error with the evidence and the card. USCIS lists its Lee’s Summit, Missouri production facility for this. It says processing takes about 30 days from receiving the card, not counting mail time.',
        'If you made an error in card data, such as a misspelled name or wrong date of birth, the rules differ. USCIS says you file a new Form I-765 with any required fee and return the card with the error. The instructions call this a correction not due to USCIS error, Item Number 1.b.',
        'A category you entered incorrectly is different. If you chose (c)(3)(A) instead of (c)(3)(B), the card reflects what USCIS approved, so a replacement would reprint the same code. Contact your DSO right away. A new application under the correct category may be needed, with a new DSO recommendation.',
        'The OPT filing windows still apply to that new application. For post-completion OPT, you must file no later than 60 days after your program end date and within 30 days of the DSO recommendation. Ask your DSO before you start work on a card with the wrong category.',
      ],
      links: [
        {
          label: 'EAD lost, stolen, incorrect or never delivered',
          href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
        },
        { label: 'Form I-765 and EAD application guide', href: '/blog/form-i765-ead-application-guide' },
      ],
      sources: [src.ead, src.i765Instructions],
    },
    {
      heading: 'Using the card for Form I-9',
      paragraphs: [
        'For an F-1 student on OPT, the M-274 says the EAD establishes both identity and employment authorization for Form I-9. Your employer records the card details and the "Card Expires" date.',
        'For STEM OPT, the M-274 adds one case. If you timely filed a C03C application and it is still pending, you may present your expired EAD with an I-20 endorsed by your DSO recommending the STEM extension. The employer then enters a date 180 days from the "Card Expires" date and must reverify by that date.',
        'For most other categories, the 2025 change matters. USCIS says most people who file an EAD renewal on or after October 30, 2025 do not get an automatic extension, unless the law or a Federal Register notice provides one. Check your category before relying on a pending renewal.',
      ],
      links: [
        { label: 'Form I-9 complete guide', href: '/blog/form-i9-complete-guide' },
        {
          label: 'Can you start work before the OPT EAD arrives?',
          href: '/blog/can-you-start-work-before-opt-ead-arrives',
        },
      ],
      sources: [src.m274Students, src.m274Extensions, src.autoExtension],
    },
    {
      heading: 'Example: Priya’s card says C03A instead of C03B',
      paragraphs: [
        'Fictional example: Priya graduated in May and filed for post-completion OPT. Her I-765 lists (c)(3)(B) in Item Number 27. Her receipt notice shows the same category.',
        'Her card arrives in July with C03A under Category. Her name and dates look right. Her start date is two weeks away.',
        'Priya scans the card, the receipt notice and a copy of her filed I-765. Because she entered the right category, she treats it as a USCIS error. She asks her DSO, submits a service request for an EAD replacement due to USCIS error and returns the card by USPS. She tells her employer the new start date depends on the corrected card.',
        'The habit that helped Priya was simple. She checked the code on the day the card arrived, while there was still time to fix it.',
      ],
    },
  ],
  checklist: [
    'Know your I-765 category, for example (c)(3)(B), and its card code, C03B.',
    'Compare the card Category with the I-797C receipt notice on arrival.',
    'Check name, date of birth and the "Card Expires" date the same day.',
    'Scan the card front and back before using it for Form I-9.',
    'Report a USCIS printing error through the USCIS EAD correction process.',
  ],
  mistakes: [
    'Calling C03B a visa category. It is an employment authorization category.',
    'Starting work on a card whose category does not match the approval.',
    'Filing a new I-765 with a fee for an error USCIS made.',
    'Treating a trailing P, as in C09P, as an error. Employers are told to disregard the P when comparing codes.',
    'Relying on an automatic extension for a renewal filed on or after October 30, 2025 without checking your category.',
  ],
  faq: [
    {
      question: 'What does C03B mean on an EAD card?',
      answer:
        'C03B is post-completion Optional Practical Training for F-1 students. It matches Form I-765 eligibility category (c)(3)(B), which allows up to 12 months of OPT after the program ends.',
    },
    {
      question: 'What is the difference between C03A, C03B and C03C?',
      answer:
        'C03A is pre-completion OPT, used before you finish your program. C03B is post-completion OPT, up to 12 months after the program. C03C is the 24-month STEM OPT extension that follows post-completion OPT.',
    },
    {
      question: 'Is C03B a visa?',
      answer:
        'No. It is the category under which USCIS approved your work permission. An F-1 student on OPT remains in F-1 status, supported by the I-20 and I-94. The visa stamp is only for entering the United States.',
    },
    {
      question: 'Where is the category code on the EAD?',
      answer:
        'On the front of the card, under "Category". The USCIS Handbook for Employers shows the category there and the expiration date next to "Card Expires".',
    },
    {
      question: 'What should I do if my EAD shows the wrong category?',
      answer:
        'If USCIS made the error, request a replacement due to USCIS error and return the card by USPS. There is no fee and no new I-765. If you entered the wrong category yourself, the card reflects what was approved. Contact your DSO right away, because a new application under the correct category may be needed and the OPT filing windows still apply.',
    },
    {
      question: 'What does the P in C09P mean?',
      answer:
        'The M-274 notes that some codes include the letter P, such as C09P. It tells employers to disregard the P when comparing the card with the receipt notice.',
    },
  ],
  sources: [
    src.i765,
    src.i765Instructions,
    src.reg,
    src.m274Extensions,
    src.m274Students,
    src.ead,
    src.autoExtension,
    src.i765Data,
  ],
  related: [
    { label: 'OPT EAD card guide', href: '/blog/opt-ead-card-guide' },
    { label: 'EAD card status check', href: '/blog/ead-card-status-check' },
    {
      label: 'EAD lost, stolen, incorrect or never delivered',
      href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
    },
    { label: 'Form I-9 complete guide', href: '/blog/form-i9-complete-guide' },
  ],
});
