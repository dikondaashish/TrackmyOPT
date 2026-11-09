import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// Google autocomplete for "opt travel signature", "opt travel signature
// validity", "opt travel documents" and "opt travel outside us" had no
// dedicated guide. Rules checked on 2026-11-09 against 8 CFR 214.2(f)(13)(ii)
// (unchanged in the postponed DHS fixed-admission rule text), the ICE SEVP
// travel FAQ, the Study in the States travel page, and school guidance from
// the University of Washington and Cornell for the I-20 page and STEM OPT
// practice. The regulation names only the post-completion EAD; the STEM OPT
// six-month window is stated as school guidance, not as regulation text.

const src = {
  cfr2142: {
    label: '8 CFR 214.2(f)(13)(ii): reentry with a post-completion OPT EAD',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  iceTravel: {
    label: 'Travel (SEVP frequently asked questions)',
    publisher: 'ICE Student and Exchange Visitor Program',
    url: 'https://www.ice.gov/sevis/travel',
  },
  sitsTravel: {
    label: 'Traveling as an F or M Student',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/students/study/traveling-as-an-f-or-m-student',
  },
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  uw: {
    label: 'Travel Signatures',
    publisher: 'University of Washington, International Student Services',
    url: 'https://iss.washington.edu/travel/travel-signatures/',
  },
  cornell: {
    label: 'Travel on OPT and STEM Extension',
    publisher: 'Cornell University, Office of Global Learning',
    url: 'https://international.globallearning.cornell.edu/travel/travel-opt',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'opt-travel-signature-i20';

export const optTravelSignature: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'OPT Travel Signature: How Long the I-20 Endorsement Lasts and What to Carry When You Travel on OPT',
  seoTitle: 'OPT Travel Signature: I-20 Validity and Documents to Carry',
  description:
    'The DSO travel signature on your I-20 is valid for six months during post-completion OPT. Learn what documents to carry, the risks of travel while OPT is pending, and how to request a signature.',
  category: 'Travel',
  tags: [
    'OPT travel signature',
    'I-20 travel signature validity',
    'OPT travel documents',
    'travel outside US on OPT',
    'STEM OPT travel',
    'F-1 reentry',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-09',
  modifiedDate: '2026-11-09',
  showContents: true,
  cta: 'opt-timeline',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the OPT travel signature on page 2 of the I-20, its six-month validity and the documents to carry for reentry.',
  imageCaption:
    'On post-completion OPT, the reentry endorsement must be no older than six months. Generated from the rules described in this guide.',
  directAnswer:
    'On post-completion OPT, you reenter with your unexpired EAD and a Form I-20 endorsed for travel by your DSO within the last six months. That endorsement is the travel signature on page 2 of the I-20. Also carry a passport valid at least six months past your reentry date, a valid F-1 visa unless an exception applies, and a letter of employment if you have one.',
  keyTakeaways: [
    'Under 8 CFR 214.2(f)(13)(ii), an OPT EAD must be used with an I-20 endorsed for reentry by the DSO within the last six months.',
    'Students still in their program generally have a travel signature valid for one year. OPT shortens that to six months.',
    'Schools such as Cornell apply the same six-month window during the STEM OPT extension. Confirm with your DSO.',
    'Study in the States does not recommend leaving the United States while a practical training application is pending.',
    'If you exceed the unemployment limit while abroad, SEVP says you will not be eligible to reenter in F-1 status.',
  ],
  sections: [
    {
      heading: 'What the OPT travel signature is',
      paragraphs: [
        'The travel signature is a DSO endorsement for reentry on your Form I-20. On the current I-20 it appears on page 2. Your DSO signs and dates it after checking your SEVIS record.',
        'SEVP says you must have a current I-20 endorsed for travel. It also says your DSO needs to verify that your SEVIS record is accurate and up to date before signing. On OPT, that means your address and employer should already be reported.',
      ],
      links: [
        { label: 'ISSS, DSO and PDSO: who does what', href: '/blog/isss-dso-pdso-meaning' },
      ],
      sources: [src.iceTravel, src.uw],
    },
    {
      heading: 'How long a travel signature is valid on OPT',
      paragraphs: [
        'The rule is in 8 CFR 214.2(f)(13)(ii). A student with an unexpired EAD for post-completion practical training may return to resume employment after a temporary absence. The EAD must be used with an I-20 endorsed for reentry by the DSO within the last six months.',
        'For students still in their program, Study in the States asks that the I-20 be signed within the last year. OPT shortens that to six months. Count the six months to the day you reenter, not the day you leave.',
        'The regulation names the post-completion OPT EAD. Schools such as Cornell and the University of Washington apply a six-month window during OPT, and Cornell applies it during the STEM OPT extension as well. Ask your DSO how your school handles STEM OPT.',
      ],
      table: {
        caption: 'Travel signature validity by stage. Check with your DSO before every trip.',
        columns: ['Your stage', 'How recent the signature must be', 'Source'],
        rows: [
          ['In your program (F-1 student)', 'Within the last year', 'Study in the States'],
          ['Post-completion OPT with an EAD', 'Within the last six months', '8 CFR 214.2(f)(13)(ii)'],
          ['STEM OPT extension with an EAD', 'Within the last six months (school guidance)', 'Cornell; your DSO'],
        ],
      },
      sources: [src.cfr2142, src.sitsTravel, src.uw, src.cornell],
    },
    {
      heading: 'Documents to carry when you travel on OPT',
      paragraphs: [
        'Hand-carry your documents. Do not put them in checked baggage. The CBP officer at the port of entry decides whether to admit you.',
      ],
      table: {
        caption: 'Reentry documents on post-completion OPT, with what each needs to show.',
        columns: ['Document', 'What it needs to show', 'Where the rule comes from'],
        rows: [
          ['Passport', 'Valid for at least six months after the date of your reentry', 'ICE SEVP travel FAQ'],
          ['F-1 visa', 'Valid, unless automatic revalidation or a visa exemption applies', 'ICE SEVP travel FAQ'],
          ['Form I-20', 'Travel signature from your DSO within the last six months', '8 CFR 214.2(f)(13)(ii)'],
          ['EAD card', 'Unexpired, in hand. USCIS mails it only to a U.S. address', '8 CFR 214.2(f)(13)(ii); ICE SEVP'],
          ['Letter of employment', 'Your job, if you have one. SEVP lists it for reentry on OPT', 'ICE SEVP travel FAQ'],
        ],
      },
      bullets: [
        'If you lack a required signed document, a CBP officer may issue Form I-515A. It admits you for 30 days while you send the proper documents to SEVP.',
        'If you are sent to secondary inspection, stay calm and answer directly. Our guide below explains the process.',
      ],
      links: [
        { label: 'Can you travel on OPT? Complete guide', href: '/blog/can-you-travel-on-opt-complete-guide' },
        { label: 'CBP secondary inspection for F-1 students', href: '/blog/cbp-secondary-inspection-f1-students' },
      ],
      sources: [src.iceTravel, src.sitsTravel, src.cfr2142],
    },
    {
      heading: 'If your F-1 visa has expired',
      paragraphs: [
        'SEVP says you can stay in the United States on an expired F-1 visa as long as you maintain your status. You need a valid visa to reenter after most trips abroad.',
        'The State Department recommends applying in your home country. You can apply in a third country, but you cannot return until the visa is issued. SEVP says to bring your endorsed I-20, proof of funds, evidence of ties to home, and your OPT approval documents and EAD.',
        'Automatic visa revalidation can let an expired visa count for a single trip of less than 30 days to Canada, Mexico or an adjacent island. You need a valid I-20 and an unexpired I-94. You cannot use it if you apply for a new visa during the trip, and other exceptions apply.',
      ],
      links: [
        { label: 'Renewing your F-1 visa on OPT', href: '/blog/renewing-f1-visa-on-opt' },
        {
          label: 'Automatic visa revalidation: Canada and Mexico trips',
          href: '/blog/automatic-visa-revalidation-f1-canada-mexico',
        },
      ],
      sources: [src.iceTravel],
    },
    {
      heading: 'Travel while your OPT application is pending',
      paragraphs: [
        'Study in the States says it is not recommended to leave the United States with a pending practical training application. SEVP’s travel FAQ says travel during this time should be undertaken with caution.',
        'Three risks are documented. USCIS may send a request for evidence while you are away, and it sends requests only to your U.S. address. If USCIS approves your OPT, you are expected to have the EAD in hand to reenter. USCIS can mail the EAD only to a U.S. address.',
        'The risk is higher after your program end date. Cornell warns that if your OPT is denied while you are abroad, you cannot reenter in F-1 status to reapply. Cornell also recommends waiting until USCIS approves a pending STEM OPT extension before you travel.',
        'SEVP also says you cannot reenter during the 60-day grace period after your program or OPT ends. That period is only to prepare to leave.',
      ],
      note: 'A DHS rule on a fixed time period of admission was postponed by a federal court on September 14, 2026. USCIS says it is applying the previous rules, including the 60-day grace period. Check with your DSO before you travel.',
      sources: [src.sitsTravel, src.iceTravel, src.cornell, src.i765],
    },
    {
      heading: 'Travel while you are unemployed on OPT',
      paragraphs: [
        'Post-completion OPT allows 90 days of unemployment in total, and 150 days including a STEM OPT extension. SEVP’s travel FAQ says that if you exceed the unemployment limit while outside the United States, you will not be eligible to reenter in F-1 status.',
        'Before a trip without a job, ask your DSO for your current unemployment count. Plan your return well before you reach the limit. If you have an offer, carry the offer letter.',
      ],
      sources: [src.iceTravel, src.cfr2142, src.cornell],
    },
    {
      heading: 'How to request a travel signature from your international office',
      paragraphs: [
        'Each school runs its own process. Many, such as the University of Washington, take requests online and send a confirmation when the signature is done.',
      ],
      numbered: [
        'Check the date of your last travel signature on page 2 of your I-20.',
        'Update your address and employer in the SEVP Portal, so your SEVIS record is current.',
        'Submit your school’s travel signature request well before you leave.',
        'Confirm the new signature date covers your reentry date.',
        'Pack the I-20 with your passport, visa and EAD in your carry-on.',
      ],
      sources: [src.uw, src.iceTravel],
    },
    {
      heading: 'Example: Lin plans a December trip on OPT',
      paragraphs: [
        'Fictional example: Lin is on post-completion OPT and works full time. Her last travel signature is dated May 2, and she plans to fly home on December 18 and return on January 6.',
        'May 2 is more than six months before January 6. Lin updates her address in the SEVP Portal and requests a new signature from her ISSS office in late November.',
        'Her F-1 visa is still valid. She packs her passport, I-20 with the new signature, EAD card and a recent employment letter in her carry-on bag.',
      ],
    },
  ],
  checklist: [
    'Travel signature on page 2 of the I-20 no older than six months on your reentry date.',
    'Passport valid at least six months past your reentry date.',
    'Valid F-1 visa, or a confirmed exception such as automatic revalidation.',
    'Unexpired EAD card in hand.',
    'Employment letter or offer letter, and your unemployment count checked.',
  ],
  mistakes: [
    'Relying on a one-year student signature after your program has ended.',
    'Counting six months to the departure date instead of the reentry date.',
    'Leaving the country while OPT is pending without talking to your DSO.',
    'Putting the I-20 or EAD in checked baggage.',
    'Traveling near the 90-day unemployment limit.',
  ],
  faq: [
    {
      question: 'How long is an OPT travel signature valid?',
      answer:
        'Six months. Under 8 CFR 214.2(f)(13)(ii), an OPT EAD must be used with an I-20 endorsed for reentry by the DSO within the last six months.',
    },
    {
      question: 'Where is the travel signature on the I-20?',
      answer:
        'On page 2 of the current Form I-20, in the travel endorsement section. Your DSO signs and dates it.',
    },
    {
      question: 'Is the STEM OPT travel signature also valid for six months?',
      answer:
        'Schools such as Cornell apply the same six-month window during the STEM OPT extension. The regulation names the post-completion OPT EAD, so confirm your school’s practice with your DSO.',
    },
    {
      question: 'Can I travel while my OPT application is pending?',
      answer:
        'It is not recommended. USCIS may send a request for evidence to your U.S. address while you are away. If OPT is approved, you are expected to have the EAD in hand to reenter.',
    },
    {
      question: 'What documents do I need to travel on OPT?',
      answer:
        'A passport valid six months past reentry, a valid F-1 visa unless an exception applies, an I-20 signed for travel within six months, your unexpired EAD, and a letter of employment if you have one.',
    },
    {
      question: 'Can I travel outside the US during OPT unemployment?',
      answer:
        'You can, but plan carefully. SEVP says that if you exceed the unemployment limit while outside the United States, you will not be eligible to reenter in F-1 status.',
    },
  ],
  sources: [src.cfr2142, src.iceTravel, src.sitsTravel, src.i765, src.uw, src.cornell],
  related: [
    { label: 'Can you travel on OPT? Complete guide', href: '/blog/can-you-travel-on-opt-complete-guide' },
    { label: 'Renewing your F-1 visa on OPT', href: '/blog/renewing-f1-visa-on-opt' },
    {
      label: 'Automatic visa revalidation for F-1 students',
      href: '/blog/automatic-visa-revalidation-f1-canada-mexico',
    },
    { label: 'CBP secondary inspection for F-1 students', href: '/blog/cbp-secondary-inspection-f1-students' },
  ],
  statusNote:
    'TrackMyOPT is a case tracker, not legal advice. Your I-20, EAD, visa and SEVIS record are the official record, and CBP decides admission at the port of entry. Talk to your DSO before you travel.',
});
