import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const changeAddressOnOptSevpPortalUscisArticle = platformGap({
  slug: 'change-address-on-opt-sevp-portal-uscis',
  title:
    'How to Change Your Address on OPT: SEVP Portal, USCIS AR-11, and Your Pending Case',
  seoTitle: 'Change Address on OPT: SEVP Portal and USCIS AR-11',
  description:
    'Moving on OPT or STEM OPT? Update your address in the SEVP Portal within 10 days, file AR-11 with USCIS, update any pending I-765 case, and protect EAD card delivery.',
  category: 'Compliance',
  tags: [
    'change address OPT',
    'SEVP Portal address',
    'AR-11',
    'EAD card delivery',
  ],
  readTime: '7 min read',
  cta: 'uscis-tracking',
  imageAlt:
    'Illustration of a person carrying a moving box toward a house under a large map pin',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'When you move on OPT, make three separate updates. First, report your new address to SEVP within 10 days, through the SEVP Portal on post-completion OPT or through your DSO if your school requires it. Second, notify USCIS within 10 days with Form AR-11, which you can file online. Third, if your I-765 is still pending, update the address on that case too, because AR-11 alone may not redirect a card that is already being produced. Add USPS mail forwarding as a backup.',
  keyTakeaways: [
    'SEVP and USCIS are separate systems, so update both.',
    'Both expect updates within 10 days of moving.',
    'A pending I-765 needs its own address update to protect card delivery.',
    'USPS forwarding helps with letters, but EAD cards are often not forwarded.',
  ],
  sections: [
    {
      heading: 'Update 1: SEVP (your SEVIS record)',
      paragraphs: [
        'Students on post-completion OPT and STEM OPT must report changes to their residential address within 10 days. Once your OPT is approved, you can usually do this yourself in the SEVP Portal. Some schools ask STEM OPT students to report through the DSO as well, so follow your school’s process.',
      ],
      links: [
        {
          label: 'SEVP Portal guide for OPT',
          href: '/blog/sevp-portal-guide-opt',
        },
        {
          label: 'OPT reporting requirements',
          href: '/blog/opt-reporting-requirements-dso',
        },
      ],
      sources: [platformSources.sevpPortal, platformSources.optReporting],
    },
    {
      heading: 'Update 2: USCIS Form AR-11',
      paragraphs: [
        'Most noncitizens in the United States must notify USCIS of a new address within 10 days of moving. You can submit AR-11 online through the USCIS address-change page, and save the confirmation.',
      ],
      sources: [platformSources.ar11],
    },
    {
      heading: 'Update 3: your pending I-765',
      paragraphs: [
        'If your OPT or STEM OPT application is still pending, use the USCIS online change-of-address tool and include your receipt number, so the address is updated on that specific case. If your case already shows card production or “card was mailed,” an address change may come too late. Contact USCIS and watch the USPS tracking number.',
      ],
      links: [
        {
          label: 'Moving while OPT is pending: EAD delivery',
          href: '/blog/moving-while-opt-pending-ead-delivery',
        },
        {
          label: 'EAD card lost, stolen, or never delivered',
          href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
        },
      ],
    },
    {
      heading: 'Moving for a new job or to a new state',
      paragraphs: [
        'If the move comes with a new employer or worksite, report the employer change too. On STEM OPT, a new worksite can be a material change that requires an updated I-983. A move across states can also affect state taxes, your driver’s license, and car insurance.',
      ],
      links: [
        {
          label: 'Relocating for an OPT job',
          href: '/blog/relocating-for-opt-job-moving-states',
        },
        {
          label: 'STEM OPT material changes and a new I-983',
          href: '/blog/stem-opt-material-changes-new-i983',
        },
        {
          label: 'OPT taxes when moving states',
          href: '/blog/opt-taxes-moving-states-part-year-multistate',
        },
      ],
    },
    {
      heading: 'Fictional example: moving mid-application',
      paragraphs: [
        'Nadia is fictional. Her I-765 is pending when she moves from Ohio to Texas for a job. Within a week she files AR-11 with her receipt number, sets up USPS forwarding, and once her OPT is approved, updates her address and employer in the SEVP Portal. Her card arrives at the new address.',
      ],
    },
  ],
  checklist: [
    'Update your address in the SEVP Portal or through your DSO within 10 days.',
    'File AR-11 online and save the confirmation.',
    'Add your receipt number to update any pending case.',
    'Set up USPS mail forwarding.',
    'Report employer or worksite changes if the move involves a new job.',
  ],
  mistakes: [
    'Assuming one update reaches every agency.',
    'Updating SEVP but not USCIS.',
    'Relying on USPS forwarding for an EAD card.',
    'Forgetting the I-983 when a STEM worksite changes.',
  ],
  faq: [
    {
      question: 'Do I report my address to SEVP or my DSO?',
      answer:
        'On approved post-completion OPT, usually the SEVP Portal. Follow your school’s instructions, especially on STEM OPT.',
    },
    {
      question: 'Is AR-11 required if I already updated the SEVP Portal?',
      answer:
        'Yes. SEVP and USCIS are separate agencies with separate records.',
    },
    {
      question: 'What if my EAD was already mailed to my old address?',
      answer:
        'Track it with USPS and contact USCIS. If it is returned or lost, follow the replacement process.',
    },
  ],
  sources: [
    platformSources.sevpPortal,
    platformSources.ar11,
    platformSources.optReporting,
    source.opt,
  ],
  related: [
    {
      label: 'Form I-765 and EAD application guide',
      href: '/blog/form-i765-ead-application-guide',
    },
    {
      label: 'Driver’s license on OPT by state',
      href: '/blog/drivers-license-opt-state-requirements',
    },
    {
      label: 'Renting an apartment without U.S. credit history',
      href: '/blog/renting-apartment-without-us-credit-history',
    },
  ],
});
