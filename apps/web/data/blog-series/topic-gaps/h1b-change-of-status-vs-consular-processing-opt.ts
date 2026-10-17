import { source } from '../shared';
import { gap, gapSources } from './shared';

export const h1bChangeOfStatusVsConsularProcessingOptArticle = gap({
    slug: 'h1b-change-of-status-vs-consular-processing-opt',
    title:
      'H-1B Change of Status vs Consular Processing from OPT: Cap-Gap, Travel, and Work Dates',
    seoTitle: 'H-1B COS vs Consular Processing from OPT Explained',
    description:
      'Compare H-1B change of status and consular processing while on OPT: who gets cap-gap, when work must stop, and how travel can abandon a pending COS request.',
    category: 'H-1B',
    tags: [
      'H-1B change of status',
      'consular processing',
      'cap-gap',
      'OPT to H-1B',
    ],
    readTime: '12 min read',
    cta: 'sponsors',
    image: '/blog/topic-gaps-2026-10/h1b-change-of-status-vs-consular-processing-opt.webp',
    imageAlt: 'Fictional graduate comparing change-of-status and consular processing paths on a desk timeline',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'Change of status (COS) asks USCIS to move you from F-1/OPT to H-1B inside the United States, usually with an October 1 start for a cap-subject petition. Consular processing asks USCIS to approve the petition so you can apply for an H-1B visa abroad and then seek admission. Cap-gap status and work extensions generally attach to a timely, qualifying cap-subject petition that requests change of status—not to a consular-notification filing alone. Leaving the United States while a COS request is pending can abandon that request.',
    keyTakeaways: [
      'Cap-gap is not created by lottery selection alone; a qualifying petition must be filed.',
      'Consular notification does not provide the same F-1/OPT bridge as a COS request.',
      'Travel plans must be coordinated with counsel and the employer before you leave.',
    ],
    sections: [
      {
        heading: 'The two filing routes in plain terms',
        paragraphs: [
          'With COS, you stay in the United States (if eligible), maintain status through the bridge period when it applies, and typically begin H-1B employment on the approved start date without a visa stamp if you do not travel. With consular processing, the petition may be approved while you are still on OPT, but you normally must leave, obtain the visa, and be admitted in H-1B status before you can work as an H-1B worker.',
          'Employers sometimes change the requested action after filing. Read your I-797 receipt and ask whether the petition requests COS, consular notification, or both options in the alternative.',
        ],
        bullets: [
          'COS: remain in U.S.; cap-gap may extend F-1/OPT when requirements are met',
          'Consular: petition approval ≠ work authorization until visa and admission',
          'Hybrid plans: travel can convert a COS strategy into a consular outcome',
        ],
        sources: [source.capgap, gapSources.practicalTraining],
      },
      {
        heading: 'Cap-gap and when OPT work can continue',
        paragraphs: [
          'When a timely cap-subject H-1B petition requesting COS is properly filed for an eligible F-1 student on OPT, USCIS guidance describes an automatic extension of F-1 status and, in qualifying cases, employment authorization through the cap-gap period toward the next fiscal-year start. If the petition is rejected, denied, revoked, or withdrawn, that bridge can end.',
          'A consular-notification petition generally does not create the same work bridge. If your OPT EAD ends before you complete consular processing and admission, you may need to stop work and leave when status ends, subject to grace-period rules.',
        ],
        links: [
          {
            label: 'H-1B cap-gap extension guide',
            href: '/blog/h1b-cap-gap-extension',
          },
          {
            label:
              'Cap-gap after denial, rejection, withdrawal, or layoff',
            href: '/blog/h1b-cap-gap-denial-rejection-withdrawal-layoff',
          },
        ],
      },
      {
        heading: 'Travel while a COS request is pending',
        paragraphs: [
          'International travel during a pending change-of-status request is a common way students accidentally abandon COS. Reentering on F-1 after abandoning COS may leave you needing consular H-1B processing later even if the underlying petition is approved. Do not book flights based on a coworker’s experience.',
        ],
        note: 'If you must travel, get written confirmation from the employer’s immigration counsel about the effect on COS, cap-gap, and reentry documents before you depart.',
        links: [
          {
            label: 'Travel on OPT complete guide',
            href: '/blog/can-you-travel-on-opt-complete-guide',
          },
        ],
      },
      {
        heading: 'Fictional example: Arjun’s October 1 plan',
        paragraphs: [
          'Arjun is fictional. His employer files a timely cap-subject H-1B with COS while his OPT EAD ends in June. With qualifying cap-gap, he may continue working under the bridge rules toward October 1. His roommate’s employer filed for consular notification only; that roommate must plan exit, visa interview, and H-1B admission before starting H-1B work. Same lottery year, different work calendars.',
        ],
      },
    ],
    checklist: [
      'Confirm whether the petition requests change of status or consular notification.',
      'Save the I-797 receipt and requested H-1B start date.',
      'Ask the DSO about a cap-gap I-20 only after required evidence exists.',
      'Freeze travel plans until counsel confirms the effect on COS.',
      'Track OPT EAD end date separately from the H-1B start date.',
    ],
    mistakes: [
      'Assuming lottery selection extends OPT work authorization.',
      'Treating consular notification like cap-gap.',
      'Traveling during pending COS without checking abandonment risk.',
    ],
    faq: [
      {
        question: 'Can I switch from COS to consular processing later?',
        answer:
          'Sometimes employers amend strategy, but the timing, travel, and work-authorization consequences change. Ask counsel before assuming you can freely flip routes.',
      },
      {
        question: 'If my H-1B petition is approved for consular processing, can I keep working on OPT?',
        answer:
          'You may continue OPT only while your OPT EAD and F-1 status remain valid. Petition approval alone does not extend OPT the way a qualifying COS cap-gap filing can.',
      },
      {
        question: 'Do I need an H-1B visa stamp if I never leave after COS approval?',
        answer:
          'Many people who change status inside the United States and do not travel can begin H-1B employment based on the approval and start date, but any later trip usually requires a visa stamp. Confirm with counsel for your facts.',
      },
    ],
    sources: [source.capgap, source.opt, gapSources.practicalTraining],
    related: [
      {
        label: 'How to get your I-94 and travel history',
        href: '/blog/i94-travel-history-opt-h1b',
      },
      { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
      {
        label: 'FY2027 H-1B no second lottery backup plan',
        href: '/blog/fy2027-h1b-no-second-lottery-opt-backup-plan',
      },
      {
        label: 'Find cap-exempt H-1B employers',
        href: '/blog/find-cap-exempt-h1b-employers',
      },
    ],
  });
