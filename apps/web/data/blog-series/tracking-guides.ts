import { defineArticle, source } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

export const trackingSources = {
  status: {
    label: 'Check your immigration case status',
    publisher: 'USAGov',
    url: 'https://www.usa.gov/immigration-case-status',
  },
  times: {
    label: 'Check Case Processing Times',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/',
  },
  timesFaq: {
    label: 'Processing Times FAQs',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/processing-times-faqs',
  },
  requests: {
    label: 'Case inquiries and nondelivery requests',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
  i140: {
    label: 'Form I-140 instructions',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/forms/i-140instr.pdf',
  },
  progress: {
    label: 'USCIS Expands myProgress to Form I-765 and Form I-131',
    publisher: 'USCIS',
    url: 'https://content.govdelivery.com/accounts/USDHSCIS/bulletins/364ce40',
  },
  premium: {
    label: '8 CFR 106.4: Premium processing service',
    publisher: 'eCFR / Office of the Federal Register',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-106/section-106.4',
  },
  h4: {
    label: 'Employment authorization for certain H-4 dependent spouses',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/employment-authorization-for-certain-h-4-dependent-spouses',
  },
  renewals: {
    label: '8 CFR 274a.13: Employment authorization renewals',
    publisher: 'eCFR / Office of the Federal Register',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.13',
  },
  address: {
    label: 'How to Change Your Address',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/addresschange',
  },
  sevpAddress: {
    label: 'SEVP Portal: Update Your Information',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/sevp-portal-help/maintain-information/update-your-information',
  },
  asu: {
    label: 'Post-OPT guidance: address changes and EAD delivery',
    publisher: 'Arizona State University ISSC',
    url: 'https://issc.asu.edu/f-1j-1-students/employment/off-campus-after',
  },
  cap: {
    label: '8 CFR 214.2(h)(8): H-1B cap exemptions',
    publisher: 'eCFR / Office of the Federal Register',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2#p-214.2(h)(8)',
  },
  hub: {
    label: 'H-1B Employer Data Hub',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub',
  },
} satisfies Record<string, ArticleSource>;

const s = trackingSources;
const monitoringFlow = {
  src: '/blog/flows/case-monitoring.gif',
  poster: '/blog/flows/case-monitoring.png',
  alt: 'Four steps: save the receipt, check official status, read any notice, and choose the next action.',
  caption:
    'A monitoring routine, not a predicted USCIS schedule. A case may stay at the same status for a long time.',
  steps: [
    'Save the receipt',
    'Check official status',
    'Read any notice',
    'Choose the next action',
  ],
};
const deliveryFlow = {
  src: '/blog/flows/ead-delivery.gif',
  poster: '/blog/flows/ead-delivery.png',
  alt: 'After approval: card production, mailing, and delivery are separate milestones.',
  caption:
    'Illustrative milestones after an EAD approval. Messages can appear in a different order; there is no fixed delivery timeline.',
  steps: [
    'Approval recorded',
    'Card produced',
    'Card mailed',
    'Delivery checked',
  ],
};

function guide(
  article: Omit<
    ResearchArticle,
    'publishedDate' | 'modifiedDate' | 'showContents'
  >
): ResearchArticle {
  return defineArticle({
    ...article,
    publishedDate: '2026-10-11',
    modifiedDate: '2026-10-11',
    showContents: true,
  });
}

export const trackingGuides: ResearchArticle[] = [
  guide({
    slug: 'opt-receipt-number-not-working',
    title: 'OPT Receipt Number Not Working—or Receipt Notice Missing?',
    seoTitle: 'OPT Receipt Number Not Working? Troubleshooting Steps',
    description:
      'Troubleshoot an invalid OPT receipt number, a missing I-797C notice, or an unavailable USCIS status without guessing what happened to your application.',
    category: 'USCIS',
    tags: [
      'OPT receipt number not working',
      'USCIS receipt invalid',
      'OPT receipt notice missing',
      'I-797C not received',
    ],
    readTime: '6 min read',
    image: '/blog/opt-receipt-number-not-working.webp',
    imageAlt:
      'Illustration of a student checking an OPT receipt document with a magnifying glass.',
    imageCaption:
      'Illustration: verify the document and the number before interpreting an error message.',
    directAnswer:
      'If your OPT receipt number is not working, compare it with the I-765 receipt notice and try the official USCIS status tool without spaces or hyphens. An invalid result or failed lookup is not a verified pending case or a denial. If the receipt itself is missing, check the online account, filing records, and USCIS contact or nondelivery guidance.',
    keyTakeaways: [
      'A USCIS receipt number is different from an A-Number, account number, SEVIS ID, or payment confirmation.',
      'A failed third-party lookup does not establish a USCIS decision.',
      'Preserve filing evidence and involve your DSO if an OPT deadline is close.',
    ],
    sections: [
      {
        heading: 'First, check which number you are entering',
        paragraphs: [
          'Find the notice or online-account record for your Form I-765. The USCIS receipt generally has three letters and ten digits. A SEVIS ID on the I-20, a USCIS online account number, an A-Number, and a payment reference serve different purposes. Typing one into the case-status field will not retrieve the OPT application.',
          'Copy the receipt carefully and remove spaces or hyphens. Watch for characters introduced by a scan or copied PDF: an extra space, a letter mistaken for a digit, or text from the next line can change the input. Compare it with the document before trying several guesses. Never invent a receipt number from a delivery or payment reference.',
        ],
        numbered: [
          'Confirm the document belongs to Form I-765 and to you.',
          'Locate the field labeled receipt number.',
          'Compare every character with the original.',
          'Use the official USCIS tool to test the same number.',
        ],
        sources: [s.status],
        links: [
          {
            label: 'What is a USCIS receipt number?',
            href: '/answers/what-is-uscis-receipt-number',
          },
        ],
      },
      {
        heading: 'Distinguish an invalid number from an unavailable check',
        paragraphs: [
          'An invalid-number message, a temporarily unavailable website, and a third-party connection error are different problems. If the official tool returns a status but another service cannot retrieve it, the failed connection does not mean USCIS rejected the application. Record what each tool actually says and try again later if the service is unavailable.',
          'If the official tool also cannot find the receipt, double-check the original notice and the online account. A recently issued receipt may not be visible everywhere immediately. There is no universal activation timer that lets a blog promise the exact hour it will appear. Persistent inconsistencies should be raised through the official contact process.',
          'Keep screenshots of the error privately, with the date and tool used. Share sensitive documents only through an appropriate secure channel if an adviser needs them. Do not post your entire receipt in a group chat to ask strangers whether it looks valid.',
        ],
        sources: [s.status],
        visual: monitoringFlow,
      },
      {
        heading: 'If you filed online but cannot find the receipt notice',
        paragraphs: [
          'Sign in to the USCIS account used for the filing and review the case and Documents areas, where available. Check whether the application was actually submitted rather than left as a draft. Save the submission and payment records that exist; a draft or a payment screen alone should not be treated as a confirmed accepted filing.',
          'Use the USCIS account-help or contact process when you cannot access the submitted case. Describe the problem precisely: account access, a missing notice, or a receipt the status tool cannot find. That is more useful than reporting only that “OPT is not working.” Your DSO can help you review the OPT timeline, but cannot repair a USCIS website account.',
        ],
        sources: [source.i765],
        links: [
          {
            label: 'Form I-765 filing and document guide',
            href: '/blog/form-i765-ead-application-guide',
          },
        ],
      },
      {
        heading: 'If you mailed the application and no receipt arrived',
        paragraphs: [
          'Review the mailing receipt, delivery record, copy of the packet, payment information, and the address used. Delivery to a mailing facility is evidence of delivery; it is not an approval and does not by itself prove USCIS accepted the application. An application can also be rejected for a filing problem, so check for returned mail or an official rejection notice.',
          'USCIS provides contact and lockbox-support guidance for receipt problems. Follow the current instructions for your filing situation rather than repeatedly sending a new application. A duplicate filing or an improvised correction may create additional problems. If your filing window is close to ending, contact your DSO and, where necessary, an immigration attorney promptly.',
          'When you do have a receipt but the paper notice did not arrive, check the official e-Request nondelivery options and address records. The tool sets its own eligibility conditions. Do not assume that a fixed number of days quoted in a forum applies to every notice or every contact route.',
        ],
        sources: [s.requests, source.i765],
        links: [
          {
            label: 'USCIS Contact Center and filing help',
            href: 'https://www.uscis.gov/contactcenter',
          },
          {
            label: 'OPT application timing and deadlines',
            href: '/blog/spring-graduates-opt-application-timing-2026',
          },
        ],
      },
      {
        heading: 'Example: Dev enters his SEVIS ID instead of the receipt',
        paragraphs: [
          'Fictional example: Dev files an OPT I-765 online, then enters the number from the top of his I-20 into a case tracker. The lookup fails, and he worries the application was denied.',
          'He opens the submitted I-765 case in his USCIS account and finds its receipt. He tests that number in the official status tool and sees a recorded receipt message. The problem was the identifier, not a negative USCIS decision. Dev saves the correct number and checks the notices in the account.',
          'A different student might discover that the application remained a draft or that a mailed packet was returned. Those situations need different actions. The purpose of troubleshooting is to identify the actual problem before assuming every failure is just a harmless website delay.',
        ],
      },
      {
        heading: 'Once the receipt works, use a simple monitoring routine',
        paragraphs: [
          'Keep the correct receipt and the original filing records together. Check the official status, read notices, and verify your address if you move. TrackMyOPT supports free manual checks and Pro daily monitoring with email when a change is detected. It cannot recover a missing filing or replace USCIS account support.',
          'Only treat the case as verified pending when a successful lookup supports that status. Unknown results and connection failures should remain unknown. This distinction helps you choose the right next step and keeps estimates from being built on a case state that was never confirmed.',
        ],
        links: [
          {
            label: 'Moving while OPT is pending',
            href: '/blog/moving-while-opt-pending-ead-delivery',
          },
        ],
      },
    ],
    checklist: [
      'Verify the I-765 receipt rather than another identifier.',
      'Test the official USCIS tool and review account documents.',
      'Keep submission, payment, and mailing evidence privately.',
      'Use official help and involve the DSO when a filing deadline is at risk.',
    ],
    mistakes: [
      'Assuming an error message means the case is denied.',
      'Treating a delivery scan or payment record as an approval.',
      'Filing a duplicate application before understanding the problem.',
    ],
    faq: [
      {
        question: 'Is my SEVIS ID the same as my USCIS receipt?',
        answer:
          'No. A SEVIS ID identifies the student record. The USCIS receipt identifies the application or petition in the USCIS case-status system.',
      },
      {
        question: 'Does an invalid receipt mean my OPT was denied?',
        answer:
          'No. It may indicate the wrong number or a lookup problem. A USCIS decision must be verified from the official status or notice.',
      },
      {
        question: 'How long does a new receipt take to appear?',
        answer:
          'Visibility can vary. This guide does not promise a fixed activation period. Compare the notice and account, and use official support for a persistent mismatch.',
      },
      {
        question: 'Should I submit another I-765 if my receipt is missing?',
        answer:
          'Do not assume a duplicate filing is the solution. Review filing evidence and current USCIS contact guidance with your DSO or an attorney, especially near a deadline.',
      },
    ],
    sources: [s.status, s.requests, source.i765],
    related: [
      {
        label: 'USCIS case status guide',
        href: '/blog/uscis-case-status-tracking-guide',
      },
      {
        label: 'OPT myProgress explained',
        href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
      },
      {
        label: 'OPT application checklist',
        href: '/blog/opt-application-checklist-2026',
      },
    ],
    cta: 'uscis-tracking',
  }),
  guide({
    slug: 'moving-while-opt-pending-ead-delivery',
    title: 'Moving While OPT or STEM OPT Is Pending: Protect Your EAD Delivery',
    seoTitle: 'Moving While OPT Is Pending: USCIS Address and EAD Delivery',
    description:
      'Moving with a pending OPT or STEM OPT application? Update USCIS and your student records, save confirmation, and watch EAD delivery separately.',
    category: 'OPT Basics',
    tags: [
      'moving while OPT pending',
      'OPT address change',
      'STEM OPT EAD delivery',
      'USCIS change of address',
    ],
    readTime: '6 min read',
    image: '/blog/moving-while-opt-pending-ead-delivery.webp',
    imageAlt:
      'Illustration of a student with moving boxes, an OPT checklist, and a mailbox.',
    imageCaption:
      'Illustration: a move affects several records, and each update needs its own confirmation.',
    directAnswer:
      'If you move while OPT or STEM OPT is pending, update USCIS through its current address-change process and update your DSO/SEVIS records separately. USPS forwarding does not update USCIS or forward USCIS mail. An address update may not redirect a card already in production or transit, so save confirmations and monitor delivery.',
    keyTakeaways: [
      'USCIS, the school/SEVIS record, and USPS are separate systems.',
      'List each pending receipt required by the USCIS address-change process.',
      'If a card or notice is missing, use the official delivery and nondelivery guidance.',
    ],
    sections: [
      {
        heading: 'Why one address update is not enough',
        paragraphs: [
          'Moving is ordinary; losing an immigration notice should not be part of the plan. A student may have a school address record, a SEVIS record, a pending USCIS application, and a USPS mailing arrangement. Updating one of those does not automatically update the others. Start with a short list of the records you need to change.',
          'USCIS explicitly says that changing an address with USPS does not change it with USCIS, and USPS does not forward USCIS mail. Ordinary mail forwarding can still be useful for other mail, but it is not an EAD-delivery plan. Use the current USCIS address-change process for the pending application itself.',
          'Most noncitizens subject to address reporting must report a move to USCIS within 10 days. F-1 students also have student-record reporting responsibilities. Check your DSO’s process promptly and do not assume an employer’s payroll update satisfies either immigration requirement.',
        ],
        sources: [s.address, s.sevpAddress],
      },
      {
        heading: 'Update USCIS and keep the confirmation',
        paragraphs: [
          'Follow the official USCIS address-change instructions for your case, including the online-account route where available. Have the new physical and mailing details ready, along with every pending receipt that needs the update. Distinguish the address where you live from the address where USCIS should mail documents when the form allows that distinction.',
          'Review the spelling, apartment or unit number, and ZIP code before submitting. Save the confirmation and the date. If several cases are pending, verify that the process covers the relevant receipts rather than assuming a single account-profile change applies to all of them.',
          'An address change is not a guarantee that mail already prepared or dispatched will be redirected. If the case is near card production or mailing, contact USCIS through the current official process when you cannot confirm the destination. A landlord or roommate can alert you to mail, but cannot correct the agency’s address record.',
        ],
        numbered: [
          'Open the official USCIS address-change page.',
          'Identify the pending receipts and accurate new address.',
          'Submit through the process USCIS specifies.',
          'Save confirmation and check follow-up instructions.',
        ],
        sources: [s.address, s.asu],
      },
      {
        heading: 'Tell your DSO and update the correct student record',
        paragraphs: [
          'Ask the international-student office how it wants you to report the move. During a pending initial OPT application, the SEVP Portal may not yet be available to you. Do not wait for a portal invitation before telling the DSO that your address changed.',
          'When you have authorized OPT and portal access, follow the school and SEVP instructions for address updates. STEM OPT has additional reporting and training-plan obligations, so ask whether the move also changes a worksite or any I-983 information. A home-address move and an employer or training-location change are different questions.',
          'Keep a copy of your school submission or confirmation. This creates a clear record of what you reported and when. It also helps if the school asks you to correct a field or provide additional information later.',
        ],
        sources: [s.sevpAddress, source.stem],
        links: [
          {
            label: 'I-983 training plan and material changes',
            href: '/blog/i-983-training-plan-guide',
          },
        ],
        visual: {
          src: '/blog/flows/address-change.gif',
          poster: '/blog/flows/address-change.png',
          alt: 'Moving checklist: update USCIS, tell the DSO, save confirmations, and check delivery.',
          caption:
            'Separate records need separate updates. This checklist does not guarantee redirection of a card already mailed.',
          steps: [
            'Update USCIS',
            'Tell your DSO',
            'Save confirmations',
            'Check delivery',
          ],
        },
      },
      {
        heading: 'If the card is mailed, delivered elsewhere, or missing',
        paragraphs: [
          'Check the official status and any available postal tracking. “Mailed” and “delivered” describe different steps. Confirm the destination when possible and compare the tracking details with what actually arrived. A tracking status alone cannot tell you whether the EAD is physically in your possession.',
          'For a missing notice or card, use the current USCIS e-Request nondelivery options and any instructions in your account. If postal tracking reports delivery but the card is missing, contact the postal service and USCIS as directed. Save the tracking record and dates so the problem can be explained clearly.',
          'Do not assume that a replacement request, an approval screenshot, or a tracking page is enough for employment documentation. Ask the employer’s I-9 team and a qualified adviser what is acceptable in your particular circumstances. A replacement process can involve additional steps and fees; verify the current instructions before filing anything.',
        ],
        sources: [s.requests, source.i765],
      },
      {
        heading: 'Example: Aisha moves from campus housing during the wait',
        paragraphs: [
          'Fictional example: Aisha has a pending OPT I-765 and must leave campus housing for a new apartment. She sets up ordinary USPS forwarding, then learns that USCIS mail is not covered by that plan.',
          'She uses the USCIS address-change process for her pending receipt and separately tells her DSO. She saves both confirmations and checks her apartment number carefully. When a card-production update appears, she watches the official mailing information rather than assuming forwarding will handle it.',
          'If the card is already headed to the old address, Aisha follows the current USCIS and postal instructions. The earlier confirmations help document the move, but they do not guarantee that a mailing prepared before the update can be intercepted. This is why updating early matters.',
        ],
      },
      {
        heading: 'Keep your move checklist short and usable',
        paragraphs: [
          'You do not need to check every system every hour. Make the required updates, keep their confirmations, and use a steady notice-and-delivery routine. TrackMyOPT can help monitor a saved receipt, but it does not submit your USCIS address change or update SEVIS for you.',
          'If the move affects your job or training location, handle that reporting question separately with the DSO and employer. If it affects international travel, review the travel documents before leaving. A clean address record is one part of compliance, not a replacement for the other requirements.',
        ],
        links: [
          {
            label: 'Relocating for an OPT job',
            href: '/blog/relocating-for-opt-job-moving-states',
          },
          {
            label: 'Travel on OPT: documents and risks',
            href: '/blog/can-you-travel-on-opt-complete-guide',
          },
        ],
      },
    ],
    checklist: [
      'Update USCIS for the relevant pending receipts.',
      'Report the move through the DSO/SEVP process that applies.',
      'Save both confirmations and verify unit and ZIP details.',
      'Monitor official delivery updates and use nondelivery guidance if needed.',
    ],
    mistakes: [
      'Relying on USPS forwarding for an EAD.',
      'Assuming a school update also updates USCIS.',
      'Waiting for a portal invitation before reporting a pending-OPT move.',
    ],
    faq: [
      {
        question: 'Will USPS forward my EAD to my new address?',
        answer:
          'USCIS says USPS does not forward USCIS mail. Update USCIS directly and follow current delivery guidance; ordinary forwarding is not enough.',
      },
      {
        question: 'Does updating my DSO change my USCIS mailing address?',
        answer:
          'Do not assume so. Update the student record and the pending USCIS case through their separate processes.',
      },
      {
        question: 'What if I cannot access the SEVP Portal yet?',
        answer:
          'Contact your DSO promptly and follow the school’s reporting instructions. Pending initial OPT applicants may not yet have portal access.',
      },
      {
        question: 'Can an address update redirect a card already mailed?',
        answer:
          'It is not guaranteed. Check the official tracking and contact USCIS and the postal service as directed for the specific delivery problem.',
      },
    ],
    sources: [
      s.address,
      s.sevpAddress,
      s.asu,
      s.requests,
      source.i765,
      source.stem,
    ],
    related: [
      {
        label: 'Relocating for an OPT job',
        href: '/blog/relocating-for-opt-job-moving-states',
      },
      {
        label: 'OPT receipt troubleshooting',
        href: '/blog/opt-receipt-number-not-working',
      },
      {
        label: 'I-983 training plan guide',
        href: '/blog/i-983-training-plan-guide',
      },
    ],
    cta: 'uscis-tracking',
  }),
  guide({
    slug: 'find-cap-exempt-h1b-employers',
    title: 'How to Find Cap-Exempt H-1B Employers While on OPT',
    seoTitle: 'Find Cap-Exempt H-1B Employers: An OPT Job-Search Guide',
    description:
      'Build a cap-exempt H-1B employer shortlist, check the actual hiring entity and role, and ask better sponsorship questions while protecting your OPT timeline.',
    category: 'H-1B',
    tags: [
      'cap exempt H1B employers',
      'H1B university jobs',
      'OPT cap exempt sponsorship',
      'nonprofit research H1B',
    ],
    readTime: '6 min read',
    image: '/blog/find-cap-exempt-h1b-employers.webp',
    imageAlt:
      'Illustration of a graduate building an H-1B employer shortlist near a university and research campus.',
    imageCaption:
      'Illustration: a shortlist starts with employers and roles, then needs direct verification.',
    directAnswer:
      'Start a cap-exempt H-1B search with universities, qualifying affiliated nonprofits, nonprofit research organizations, and governmental research organizations. Then verify the legal employer, the specific role, and willingness to sponsor. A nonprofit label, hospital name, or past H-1B filing does not by itself prove that a new job is cap-exempt.',
    keyTakeaways: [
      'Cap exemption depends on qualifying legal facts, not a brand label.',
      'Filing history is a research lead, not a current job offer or sponsorship promise.',
      'OPT and STEM OPT requirements still apply while you search and while an employer plans a petition.',
    ],
    sections: [
      {
        heading: 'Which employers can be cap-exempt?',
        paragraphs: [
          'The H-1B rules recognize cap-exempt pathways involving institutions of higher education, qualifying related or affiliated nonprofit entities, nonprofit research organizations, and governmental research organizations. The details matter. For example, the research-organization definition involves qualifying research as a fundamental activity, not simply a company saying it does innovative work.',
          'A nonprofit hospital is not automatically cap-exempt. A university-affiliated name is not enough either: the hiring entity and the relevant relationship must meet the rules. Some roles performed at qualifying organizations raise additional fact-specific questions. Have the employer’s immigration team or counsel verify the basis rather than trying to decide it from a careers-page logo.',
          'Cap-exempt does not mean every role qualifies for H-1B classification. The position, degree requirements, wage obligations, employer relationship, and other petition requirements still need review. Use the exemption as a way to build a more focused search, not as a guarantee of visa eligibility.',
        ],
        sources: [s.cap],
      },
      {
        heading: 'Build a shortlist around work you can actually do',
        paragraphs: [
          'Start with roles that fit your degree and experience: research software, data analysis, laboratory work, engineering, or other relevant specialty roles. Search the institution’s own careers site, not only general job boards. Record the employer’s legal name, the job link, location, required degree, and the skills you can demonstrate.',
          'A useful search is narrower than “all universities that sponsor.” Choose a few regions and role families, then investigate the exact employers. A research institute’s analyst role may be a better match than a university role whose required degree does not fit yours. Keep the job duties and qualifications central to the search.',
          'Use a small table for each lead: legal employer, current role, degree match, past filing evidence, sponsorship answer, and next action. Mark anything unverified clearly. This prevents an old list from turning into an assumed promise when the organization’s hiring policy changes.',
        ],
        bullets: [
          'Search official careers pages for roles aligned with your degree.',
          'Identify the legal entity that would hire and file the petition.',
          'Save the current job description and application deadline.',
          'Separate verified sponsorship answers from research assumptions.',
        ],
      },
      {
        heading: 'Use H-1B filing history as evidence, then verify',
        paragraphs: [
          'The USCIS H-1B Employer Data Hub can help you see historical petition activity. TrackMyOPT’s sponsor research also brings filing history and career links into one place. Neither source establishes that a specific vacancy is open to sponsorship today or that every filing by an employer was cap-exempt.',
          'Names can differ across a careers page, a university system, a hospital affiliate, and a filing record. Match the legal entity carefully before drawing a conclusion. A similarly named organization or a subsidiary may have a different sponsorship policy and legal basis.',
          'Once a role looks relevant, check the job posting for explicit sponsorship language. If the language is unclear, ask the recruiter whether the institution considers H-1B sponsorship for that role and who verifies cap exemption. An honest “unverified” is more useful than labeling a whole organization guaranteed cap-exempt.',
        ],
        sources: [s.hub],
        links: [
          {
            label: 'H-1B sponsor research features',
            href: '/features/sponsors',
          },
        ],
      },
      {
        heading: 'Ask sponsorship questions at the right level',
        paragraphs: [
          'A recruiter may know the hiring policy without being able to provide an immigration analysis. Ask a practical question first: “Does this position consider candidates who currently have OPT and may need H-1B sponsorship?” If yes, ask whether the employer’s immigration team reviews the cap-exempt route for this particular hiring entity and role.',
          'Avoid presenting a blog as proof that the employer is exempt. Instead, share the work authorization you currently have, its end date, and the sponsorship you may need. Keep the question brief and factual. Detailed status or petition questions belong with the employer’s immigration team and your own adviser.',
          'If the employer does not sponsor the role, update your shortlist and move on. Repeatedly arguing that the organization should qualify will not change its budget or hiring policy. Spend the saved time on roles with a stronger degree match and a clearer sponsorship answer.',
        ],
        note: 'Suggested question: “I currently have OPT through [date]. Does this role consider future H-1B sponsorship, and can your immigration team confirm whether the hiring entity uses a cap-exempt route?”',
      },
      {
        heading: 'Example: Luis verifies a university-affiliated employer',
        paragraphs: [
          'Fictional example: Luis is an engineering graduate on OPT. He finds a data-engineering vacancy at an organization whose name mentions a university. He initially assumes that the job avoids the H-1B cap.',
          'He records the legal employer from the posting and checks its career page and filing history. The recruiter confirms that the role can be considered for sponsorship, but says the immigration team must review the employer relationship and petition requirements. Luis applies with a resume tailored to the actual role while keeping the exemption marked “needs legal confirmation.”',
          'This approach gives Luis a credible lead without promising an outcome. A different role at a similarly named affiliate might not have the same sponsorship policy. The verification belongs to the specific job and employer, not to the university name in a search result.',
        ],
      },
      {
        heading: 'Protect your OPT timeline during the search',
        paragraphs: [
          'A possible future H-1B petition does not pause OPT unemployment limits or create permission to work. Keep your current OPT dates, qualifying employment, and reporting responsibilities up to date. If you need STEM OPT, verify the employer and training-plan requirements independently rather than assuming H-1B sponsorship satisfies them.',
          'Moving from cap-exempt employment to a cap-subject employer can raise new cap questions. Do not assume that an earlier cap-exempt approval permanently eliminates the lottery for every later job. Discuss any transition with qualified immigration counsel before relying on it.',
          'Review the shortlist weekly: remove closed roles, follow up on clear sponsorship answers, and improve applications for realistic matches. A focused list with current evidence is more useful than a long collection of employers whose jobs, policies, or legal entities you have never checked.',
        ],
        sources: [s.cap, source.opt, source.stem],
        links: [
          { label: 'OPT unemployment-day tracking', href: '/tools/opt-clock' },
          {
            label: 'I-983 training plan requirements',
            href: '/blog/i-983-training-plan-guide',
          },
        ],
      },
    ],
    checklist: [
      'Choose degree-relevant roles and official careers pages.',
      'Identify the legal hiring entity.',
      'Check filing history without treating it as a promise.',
      'Ask about the specific role and have counsel verify the cap-exempt basis.',
      'Keep OPT employment and reporting requirements current.',
    ],
    mistakes: [
      'Assuming every nonprofit or hospital is cap-exempt.',
      'Treating historical filing data as current sponsorship approval.',
      'Assuming a potential H-1B petition pauses OPT requirements.',
    ],
    faq: [
      {
        question: 'Are all universities and nonprofit hospitals cap-exempt?',
        answer:
          'Qualifying institutions and organizations can use cap-exempt pathways, but a name or nonprofit label alone is not enough. Verify the legal employer and applicable basis with its immigration team.',
      },
      {
        question:
          'Does past H-1B filing history prove an employer will sponsor me?',
        answer:
          'No. It is historical evidence and a useful lead. The current vacancy, sponsorship policy, legal employer, and petition requirements still need review.',
      },
      {
        question:
          'Can I move from a cap-exempt employer to any private company?',
        answer:
          'A move to a cap-subject employer can raise cap and timing questions. Do not assume the earlier exemption carries over; get a review of the proposed transition.',
      },
      {
        question: 'Does a cap-exempt offer stop OPT unemployment days?',
        answer:
          'A future offer or petition alone does not stop the count. Qualifying employment and the applicable OPT rules determine your position.',
      },
    ],
    sources: [s.cap, s.hub, source.opt, source.stem],
    related: [
      {
        label: 'H-1B alternatives for OPT students',
        href: '/blog/h1b-alternatives-work-visas',
      },
      { label: 'H-1B sponsor research', href: '/features/sponsors' },
      { label: 'OPT unemployment tracker', href: '/tools/opt-clock' },
    ],
    cta: 'sponsors',
  }),
  guide({
    slug: 'i-140-case-status-tracking',
    title: 'How to Track Your I-140 Case: Status Messages, Delays and Alerts',
    seoTitle: 'I-140 Case Status: Tracking, Delays and Alerts',
    description:
      'Check your I-140 case status, understand review and RFE updates, and find the right next step when an employment-based petition seems stuck.',
    category: 'USCIS',
    tags: [
      'I-140 case status',
      'I-140 tracking',
      'I-140 processing time',
      'USCIS receipt number',
    ],
    readTime: '6 min read',
    image: '/blog/i-140-case-status-tracking.webp',
    imageAlt:
      'Illustration of a professional checking an I-140 folder and a case timeline at a desk.',
    imageCaption:
      'Illustration: keep the petition, its official updates, and the next immigration step separate.',
    directAnswer:
      'To check an I-140 case status, enter the petition’s receipt number in USCIS Case Status Online. Read any notice with the petitioner or attorney. A pending or actively reviewed message does not reveal your place in a queue, and an I-140 approval does not itself grant a green card or permission to work.',
    keyTakeaways: [
      'Use the I-140 receipt—not an I-485, I-765, or labor-certification number.',
      'A status message describes a recorded action; it is not a decision-date prediction.',
      'An employer-filed petition may require coordination with the employer or its attorney.',
    ],
    sections: [
      {
        heading: 'Find the correct I-140 receipt number',
        paragraphs: [
          'An employment-based process can involve several documents that look equally important. Start with the USCIS notice for Form I-140, Immigrant Petition for Alien Workers. Check the form number before copying the receipt. A priority date, employer reference number, or Department of Labor case number will not retrieve the I-140 in the USCIS status tool.',
          'The USCIS receipt generally has three letters and ten digits. Remove spaces and hyphens when entering it, and copy the characters carefully. If the employer filed the petition, ask its immigration team for the receipt and a way to receive important notices. A beneficiary may be able to see a public status while still needing the petitioner to handle a request.',
        ],
        numbered: [
          'Open the official Case Status Online tool from the USAGov link below.',
          'Enter the I-140 receipt exactly as shown on the notice.',
          'Record the status and action date, then check any corresponding notice.',
          'Keep separate receipts for any other applications.',
        ],
        sources: [s.status, s.i140],
      },
      {
        heading: 'What common I-140 status messages mean',
        paragraphs: [
          '“Case Was Received” confirms a recorded receipt. It does not mean the petition has passed a full eligibility review. “Case Is Being Actively Reviewed” also does not establish that approval is close. Avoid treating either message as a countdown, especially when comparing your petition with someone whose category or processing track differs.',
          '“Request for Evidence Was Sent” means there is a notice to read and a response to organize. Ask the petitioner or attorney about the actual request and deadline; the short public message cannot tell you which evidence is needed. A notice of intent to deny or a denial deserves prompt professional review rather than another routine tracking check.',
          'If the petition is approved, save the approval notice and discuss the next step. Visa availability, adjustment of status or consular processing, and any separate work authorization still matter. Do not use an I-140 approval screenshot as proof that you can start a job or that a green card has been issued.',
        ],
        bullets: [
          'Received or reviewing: monitor notices and verify the right processing comparison.',
          'RFE: read the notice and coordinate a complete, timely response.',
          'Approved: confirm the notice and plan the next immigration step.',
          'Denied or NOID: review the notice promptly with the petitioner and counsel.',
        ],
        sources: [s.i140],
        links: [
          {
            label: 'Understand an RFE and the response deadline',
            href: '/answers/what-is-rfe-uscis',
          },
        ],
      },
      {
        heading: 'Is your I-140 outside normal processing time?',
        paragraphs: [
          'Open the USCIS processing-times tool and choose Form I-140, the appropriate petition category, and the office or grouping requested by the tool. Use your notice and the petitioner’s records to resolve uncertainty. Receipt prefixes alone are not a reliable way to decide which processing-time selection applies.',
          'The tool’s published processing time describes completed cases in a particular group. It is not your individual deadline. Use its inquiry-date function to check whether a service request is available. For an employer-filed petition, coordinate with the petitioner or authorized representative before submitting a request.',
          'Premium processing has different action periods for different I-140 classifications. Do not borrow the OPT I-765 premium clock or a friend’s I-140 timeline. If an I-907 was filed, ask the attorney which classification, receipt date, and any RFE restart govern the clock.',
        ],
        sources: [s.times, s.timesFaq, s.premium],
      },
      {
        heading: 'Example: Arjun sees no change after a colleague is approved',
        paragraphs: [
          'Fictional example: Arjun’s employer filed an I-140. A colleague says their petition was approved, while Arjun still sees “Case Was Received.” Arjun worries that his petition has been forgotten.',
          'He asks the immigration team to confirm his receipt, category, and whether premium processing was requested. He checks the correct official processing group and keeps the contact details for notices. This produces a useful action plan; a comparison with an unexplained approval screenshot does not.',
          'If an RFE arrives, the plan changes immediately: the team reads it, identifies who supplies each document, and works backward from the notice deadline. Arjun’s tracking routine helps him notice an update, but neither the routine nor an alert improves the petition’s legal merits.',
        ],
        visual: monitoringFlow,
      },
      {
        heading: 'Choose a useful alert routine',
        paragraphs: [
          'You can check USCIS directly and use account features available for your case. TrackMyOPT can also keep the receipt in one dashboard: manual checks stay free, while Pro adds daily checks and email when a status change is detected. An alert is a reminder to inspect the official update, not a substitute for the notice.',
          'TrackMyOPT’s community decision-window tool currently supports eligible OPT and STEM OPT comparisons, not I-140 approval predictions. For an I-140, focus on the official status, the right processing-time category, and coordination with the petitioner. Keep receipts and notices out of public posts and screenshots.',
        ],
        links: [
          {
            label: 'See the USCIS case-tracking features',
            href: '/features/case-status',
          },
        ],
      },
    ],
    checklist: [
      'Confirm Form I-140 and the correct receipt.',
      'Ask who receives notices and who will respond.',
      'Use the correct USCIS processing group and inquiry date.',
      'Review action-required notices promptly; save the full notice securely.',
    ],
    mistakes: [
      'Assuming “actively reviewed” means approval is imminent.',
      'Mixing an I-140 approval with a green card or work permit.',
      'Applying an OPT estimate to an I-140 petition.',
    ],
    faq: [
      {
        question: 'Can I check an I-140 case without a USCIS account?',
        answer:
          'The public Case Status Online tool uses the receipt number. Access to petition documents and authority to make requests are separate matters; coordinate with the petitioner or attorney.',
      },
      {
        question: 'Why has my I-140 status not changed?',
        answer:
          'A public status can stay unchanged between recorded actions. Check notices and the relevant official processing group; the status alone cannot diagnose the cause of a delay.',
      },
      {
        question: 'Does I-140 approval let me work?',
        answer:
          'An I-140 approval alone does not grant employment authorization or permanent residence. Confirm the separate status or authorization that covers the work.',
      },
      {
        question: 'Can TrackMyOPT predict my I-140 approval date?',
        answer:
          'TrackMyOPT can track recorded USCIS status changes. Its community decision-window estimates support OPT/STEM cases when enough comparable data exists, not I-140 petitions.',
      },
    ],
    sources: [s.status, s.i140, s.times, s.timesFaq, s.premium],
    related: [
      {
        label: 'USCIS case status tracking guide',
        href: '/blog/uscis-case-status-tracking-guide',
      },
      {
        label: 'Employment-based green card guide',
        href: '/blog/green-card-after-opt',
      },
      {
        label: 'What is a USCIS receipt number?',
        href: '/answers/what-is-uscis-receipt-number',
      },
    ],
    cta: 'uscis-tracking',
  }),
  guide({
    slug: 'uscis-myprogress-taking-longer-than-expected-opt',
    title:
      'USCIS myProgress Says “Taking Longer Than Expected” for OPT—What Now?',
    seoTitle: 'OPT myProgress: “Taking Longer Than Expected” Explained',
    description:
      'Understand the USCIS myProgress estimate for OPT, what a changed countdown means, and how to plan your next step without treating it as a deadline.',
    category: 'USCIS',
    tags: [
      'OPT myProgress',
      'taking longer than expected USCIS',
      'I-765 estimated time',
      'OPT processing delay',
    ],
    readTime: '6 min read',
    image: '/blog/uscis-myprogress-taking-longer-than-expected-opt.webp',
    imageAlt:
      'Illustration of a student comparing a myProgress calendar with a checklist.',
    imageCaption:
      'Illustration: an estimated wait helps with planning, but the official notice controls the outcome.',
    directAnswer:
      '“Taking longer than expected” in USCIS myProgress is an estimate update, not a denial or a guaranteed new deadline. Check your I-765 status and documents, look for any action-required notice, and use the public USCIS processing-times inquiry tool to see whether you can request an update.',
    keyTakeaways: [
      'myProgress estimates may move, disappear, or be inaccurate for an individual case.',
      'A shorter estimate does not authorize work or guarantee an EAD arrival date.',
      'Inquiry eligibility comes from the public processing-times tool, not the myProgress countdown.',
    ],
    sections: [
      {
        heading: 'What myProgress measures—and what it cannot tell you',
        paragraphs: [
          'USCIS introduced myProgress for eligible online-account cases, including Form I-765, to show an estimated wait for certain milestones. Its announcement explains that the estimate draws on historical patterns in similar cases. Individual circumstances can make the estimate too short or too long; it is not a promise that an officer will decide your case on a particular date.',
          'Availability and the account interface can differ by case. If you do not see a myProgress tab, that fact alone is not a negative decision. Use the case status and notices that are available to you. Avoid searching for a hidden meaning in every interface change when no USCIS notice supports that interpretation.',
        ],
        sources: [s.progress],
      },
      {
        heading: 'Estimate, official status, and processing time are different',
        paragraphs: [
          'The easiest way to avoid confusion is to give each information source a separate job. myProgress is an individual planning estimate. Case Status Online describes a recorded action on your receipt. The public processing-times tool describes a group of completed cases and provides the process for checking whether an inquiry is available.',
          'None of these is a substitute for the full notice. A request for evidence may have a response deadline even while a dashboard still shows a long wait. An approval may be followed by separate card-production and mailing steps. Checking only the countdown can cause you to miss the information that actually requires action.',
        ],
        bullets: [
          'myProgress: a changing estimate, not a filing or work deadline.',
          'Case status and documents: recorded actions and notices.',
          'Public processing tool: the correct comparison and inquiry eligibility.',
          'EAD and applicable rules: the documents and dates that govern work.',
        ],
        sources: [s.progress, s.timesFaq],
        visual: deliveryFlow,
      },
      {
        heading: 'What to do when the countdown reaches zero or changes',
        paragraphs: [
          'First, check the status and Documents area, where available, for a new notice. If there is an RFE, biometrics appointment, or other request, follow the instructions in that notice. Do not send random extra evidence simply because an estimate changed; it may not address any issue USCIS has identified.',
          'Second, open the public processing-times tool. Select Form I-765, the correct OPT category, and the office or grouping the tool requests. Use the receipt date to check the inquiry date. Keep the result and the date you checked it so you can explain the situation accurately to your DSO or a USCIS contact.',
          'Third, review your practical plan. Tell an employer that the application is pending and distinguish the requested OPT start date from the authorization you ultimately receive. Arrange flexibility before promising a first workday. A forum comment about someone else’s approval cannot determine your lawful start date.',
        ],
        numbered: [
          'Read current status and available notices.',
          'Act on any specific request and its deadline.',
          'Check official inquiry eligibility.',
          'Update your employer and DSO with facts, not an estimated approval promise.',
        ],
        sources: [s.times, source.opt],
        links: [
          {
            label: 'OPT processing times and the inquiry process',
            href: '/blog/opt-processing-time-2026',
          },
          {
            label: 'How to respond to an RFE',
            href: '/answers/what-is-rfe-uscis',
          },
        ],
      },
      {
        heading: 'Example: Maya’s estimate changes from one week to longer',
        paragraphs: [
          'Fictional example: Maya has a pending post-completion OPT application. Her account first estimates one week, then displays “taking longer than expected.” She has already told a recruiter she hopes to start soon.',
          'Maya checks the official status and finds no new request. She checks the public inquiry tool and asks her DSO to review her OPT dates. She then tells the recruiter that she cannot confirm a start date from myProgress alone. She keeps checking notices while discussing a flexible start with the employer.',
          'If Maya later receives approval, she still checks the EAD dates and delivery. If she receives an RFE instead, she follows that notice. Both outcomes are possible; an animation or a countdown cannot decide which will happen.',
        ],
      },
      {
        heading: 'Should you consider premium processing or an estimate tool?',
        paragraphs: [
          'Eligible F-1 OPT/STEM I-765 filings have a premium-processing option through Form I-907. As of this update, the additional fee is $1,780 and the applicable action period is 30 business days, subject to the governing rules. This is an optional USCIS service, separate from any TrackMyOPT subscription. It does not promise approval or card delivery within that period.',
          'Use community timelines as a second planning reference only when the comparison fits your case. TrackMyOPT’s OPT decision-window tool shows an estimated range and sample information when enough comparable data exists. A small or mismatched sample is a reason for caution, not a reason to manufacture an exact date.',
          'Daily monitoring can save repeated manual checks, but it cannot speed up adjudication. Keep your planning estimate, official notices, and work-authorization requirements separate. That gives you a clearer next step even when the wait itself remains uncertain.',
        ],
        sources: [s.premium, source.pp],
        links: [
          {
            label: 'OPT premium processing: fee, clock, and tradeoffs',
            href: '/blog/opt-premium-processing-fee-increase-1780',
          },
        ],
      },
    ],
    checklist: [
      'Check status and documents before interpreting the estimate.',
      'Use the correct I-765 category in the USCIS inquiry tool.',
      'Ask your DSO about your dates and work-start requirements.',
      'Keep an employer plan that can accommodate a delayed decision or delivery.',
    ],
    mistakes: [
      'Treating a countdown as a promised approval date.',
      'Starting work because myProgress reached zero.',
      'Comparing regular OPT with an unrelated form or premium case.',
    ],
    faq: [
      {
        question:
          'Does “taking longer than expected” mean my OPT will be denied?',
        answer:
          'No. That estimate message alone is not a decision. Read the official case status and any notices to determine what USCIS has actually recorded.',
      },
      {
        question: 'Can I submit an inquiry when myProgress runs out?',
        answer:
          'A myProgress countdown does not establish inquiry eligibility. Use the public USCIS processing-times tool and its receipt-date inquiry process.',
      },
      {
        question: 'Why did my estimated time increase?',
        answer:
          'USCIS says the estimate can understate or overstate the wait for an individual case. A changed estimate alone does not explain what happened inside your case.',
      },
      {
        question: 'Can TrackMyOPT replace myProgress?',
        answer:
          'It offers a separate OPT/STEM community planning estimate and case tracking. It does not replace USCIS notices, decide eligibility, or guarantee a decision date.',
      },
    ],
    sources: [
      s.progress,
      s.times,
      s.timesFaq,
      s.premium,
      source.pp,
      source.opt,
    ],
    related: [
      {
        label: 'OPT processing time guide',
        href: '/blog/opt-processing-time-2026',
      },
      {
        label: 'STEM OPT processing time guide',
        href: '/blog/stem-opt-processing-time-2026',
      },
      {
        label: 'OPT receipt troubleshooting',
        href: '/blog/opt-receipt-number-not-working',
      },
    ],
    cta: 'case-status',
  }),
  guide({
    slug: 'h4-ead-case-status-tracking',
    title: 'H-4 EAD Case Tracking: How to Check Status and Understand Updates',
    seoTitle: 'H-4 EAD Case Status: Tracking, Delays and Card Updates',
    description:
      'Track your H-4 EAD I-765 receipt, understand status and delivery updates, and keep work-authorization questions separate from a pending-case estimate.',
    category: 'USCIS',
    tags: [
      'H4 EAD case status',
      'H-4 EAD tracking',
      'H4 EAD processing time',
      'I-765 c26',
    ],
    readTime: '6 min read',
    image: '/blog/h4-ead-case-status-tracking.webp',
    imageAlt:
      'Illustration of a professional checking an H-4 EAD folder and status alerts.',
    imageCaption:
      'Illustration: track the I-765 receipt separately from related H-4 and H-1B applications.',
    directAnswer:
      'Check an H-4 EAD with the Form I-765 receipt number in USCIS Case Status Online. Keep it separate from any I-539 or I-129 receipt. A pending case or approval of a related application does not by itself authorize work; read the EAD, current rules, and any USCIS notices that apply to your situation.',
    keyTakeaways: [
      'H-4 EAD tracking usually means checking an I-765 under category (c)(26).',
      'Related applications have separate receipts, updates, and legal effects.',
      'A renewal receipt is not automatically proof of continued work authorization.',
    ],
    sections: [
      {
        heading: 'Which receipt should you use for an H-4 EAD?',
        paragraphs: [
          'Locate the USCIS notice for the Form I-765 employment-authorization application. Confirm the form number and applicant name before using the receipt. Families sometimes have an H-1B petition, an H-4 extension or change-of-status application, and an H-4 EAD application pending at the same time. Seeing an update on one does not mean all three received the same decision.',
          'Enter the I-765 receipt in the official public status tool. A USCIS receipt generally contains three letters followed by ten digits. Keep separate records for the I-539 and I-129 if those exist. When talking to an attorney or USCIS, say which form and receipt you are asking about rather than referring only to “our family’s case.”',
          'H-4 EAD eligibility is narrower than simply being married to an H-1B worker. USCIS describes specific qualifying circumstances involving the principal H-1B worker. This guide explains tracking; it does not establish that a particular spouse qualifies. Use the official eligibility page and professional advice for that question.',
        ],
        numbered: [
          'Find the I-765 receipt notice.',
          'Check that it belongs to the H-4 EAD applicant.',
          'Enter it in Case Status Online without spaces or hyphens.',
          'Save the update date and read any related notice.',
        ],
        sources: [s.status, s.h4],
      },
      {
        heading: 'Understand review, RFE, approval, and card updates',
        paragraphs: [
          '“Received” and “actively reviewed” are pending-case messages. Neither tells you how many cases are ahead of yours or establishes a decision date. If USCIS requests evidence, the full notice—not the public summary—explains what to submit, where to send it, and the response deadline.',
          'An approval update is different from card production and mailing. If a card-related message appears, look for tracking information in your USCIS account or status details, where available. Check that the mailing address is correct and follow the official nondelivery process if a notice or card is missing.',
          'Treat a denial or notice of intent to deny as an action-required event. Save the notice and contact the attorney or adviser handling the case promptly. Do not assume that refreshing a status page will resolve an eligibility question or preserve a response deadline.',
        ],
        sources: [s.requests],
        visual: deliveryFlow,
        links: [
          {
            label: 'RFE meaning and response steps',
            href: '/answers/what-is-rfe-uscis',
          },
        ],
      },
      {
        heading: 'How to compare H-4 EAD processing times',
        paragraphs: [
          'In the official processing-times tool, select Form I-765 and the relevant H-4 spouse category. Use the office or grouping requested by the current tool. An OPT processing-time article covers a different eligibility category, so its wait estimates and premium-processing instructions are not a shortcut for an H-4 EAD.',
          'The published processing figure describes a group of completed cases, not a personalized countdown. Use your receipt date in the inquiry tool to see whether a service request is available. Keep a record of an inquiry rather than repeatedly creating requests for the same issue.',
          'Do not assume that premium processing of a related H-1B petition also guarantees a decision on a separate H-4 EAD. Check the current USCIS Form I-907 eligibility and the actual request with counsel. The fact that regulations describe potential premium services does not mean every category is currently available.',
        ],
        sources: [s.times, s.timesFaq, source.pp],
      },
      {
        heading: 'A pending renewal does not always extend permission to work',
        paragraphs: [
          'This is an important distinction for renewal applicants. Under the current regulation, an EAD renewal filed on or after October 30, 2025 generally does not automatically extend the expiring card or employment authorization, subject to specified exceptions. Do not apply an old “540-day extension” article to a new H-4 EAD renewal without checking the governing rule.',
          'Older qualifying filings may involve different rules, and H-4 status documentation can matter. Ask counsel and the employer’s I-9 team to review the filing date, current EAD, I-94, receipt, and applicable exception before relying on continued employment. A tracking dashboard can organize those dates; it cannot decide authorization.',
          'For an initial EAD application, avoid agreeing to start work based only on a pending receipt or a related H-4 approval. Confirm the authorization and documentation required for the proposed work before the start date.',
        ],
        sources: [s.renewals, s.h4],
      },
      {
        heading:
          'Example: Priya’s H-4 extension is approved but the EAD is pending',
        paragraphs: [
          'Fictional example: Priya sees an approval on her I-539 receipt and thinks her I-765 must also be approved. A recruiter asks her to begin next Monday.',
          'She opens the separate I-765 record and finds that the EAD is still pending. She asks her attorney and the employer’s I-9 team which documents authorize the work, rather than treating the I-539 update as an EAD approval. She gives the recruiter a factual update and discusses a flexible start.',
          'Priya saves both receipts and monitors them separately. When an EAD update arrives, she reads the notice and checks the card dates and delivery. This avoids a common mix-up while giving her a concrete routine during the wait.',
        ],
        visual: monitoringFlow,
      },
      {
        heading: 'Use alerts to reduce repeated checks',
        paragraphs: [
          'USCIS remains the source for the official status and notices. TrackMyOPT offers free manual receipt checks and Pro daily monitoring with email when a status change is detected. Continue reading official notices and keeping your address current even when an alert service is enabled.',
          'The OPT/STEM community decision-window tool does not currently estimate H-4 EAD decisions. For H-4 EAD, use the correct official processing group, the receipt’s status, and qualified advice on work authorization. Never upload a full receipt notice to a public forum just to compare dates.',
        ],
        links: [
          {
            label: 'USCIS tracker features and monitoring options',
            href: '/features/case-status',
          },
        ],
      },
    ],
    checklist: [
      'Separate I-765, I-539, and I-129 receipts.',
      'Choose the H-4 I-765 category in the official processing tool.',
      'Act on notices and keep the mailing address current.',
      'Verify work authorization before starting or continuing employment.',
    ],
    mistakes: [
      'Using OPT timelines or premium instructions for an H-4 EAD.',
      'Treating a related approval as an EAD decision.',
      'Relying on an outdated automatic-extension claim.',
    ],
    faq: [
      {
        question: 'Which receipt tracks my H-4 EAD?',
        answer:
          'Use the receipt for Form I-765. An I-539 or the principal worker’s I-129 receipt tracks a different application or petition.',
      },
      {
        question: 'Does H-4 approval mean the EAD is approved?',
        answer:
          'No. Check the separate I-765 status and notice, and confirm the employment-authorization requirements that apply to you.',
      },
      {
        question: 'Can I work while my H-4 EAD renewal is pending?',
        answer:
          'A pending receipt alone does not answer that question. Current rules generally end automatic extensions for renewals filed on or after October 30, 2025, subject to exceptions. Have counsel and the employer review your documents and filing date.',
      },
      {
        question: 'Can TrackMyOPT estimate my H-4 EAD approval date?',
        answer:
          'It can track recorded status changes. Its community decision-window estimates currently support OPT/STEM comparisons, not H-4 EAD cases.',
      },
    ],
    sources: [
      s.status,
      s.h4,
      s.times,
      s.timesFaq,
      s.requests,
      s.renewals,
      source.pp,
    ],
    related: [
      {
        label: 'H-4 EAD eligibility overview',
        href: '/blog/h4-ead-opt-spouse-work-authorization',
      },
      {
        label: 'USCIS tracking guide',
        href: '/blog/uscis-case-status-tracking-guide',
      },
      {
        label: 'Receipt number basics',
        href: '/answers/what-is-uscis-receipt-number',
      },
    ],
    cta: 'uscis-tracking',
  }),
];
