import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "ioe case status", "ioe", "elis case status", "uscis case status a number"
// and "i797 tracking" rank at position 11 to 12 against the generic case
// status guide because that guide only has an anchor for them. This page
// answers the receipt-number questions directly and sends readers on to the
// tracking and troubleshooting guides.

const src = {
  status: {
    label: 'Case Status Online',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  account: {
    label: 'How to Create a USCIS Online Account',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/file-online/how-to-create-a-uscis-online-account',
  },
  elis: {
    label: 'DHS/USCIS/PIA-056: USCIS Electronic Immigration System (USCIS ELIS)',
    publisher: 'U.S. Department of Homeland Security',
    url: 'https://www.dhs.gov/publication/dhsuscispia-056-uscis-electronic-immigration-system-uscis-elis',
  },
  i797: {
    label: 'Form I-797: Types and Functions',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/form-i-797-types-and-functions',
  },
  aNumber: {
    label: 'Glossary: Alien Registration Number',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/tools/glossary?topic_id=a',
  },
  centers: {
    label: 'USCIS Service and Office Locator',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/about-us/find-a-uscis-office',
  },
  paperAccess: {
    label: 'How Do I Get a New Online Access Code?',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/about-us/contact-us/how-do-i-get-a-new-online-access-code',
  },
  eRequest: {
    label: 'e-Request: case inquiries and nondelivery',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'ioe-receipt-number-elis-case-status';

export const ioeReceiptNumberGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'case-status',
  title:
    'IOE Receipt Numbers and ELIS Case Status Explained: IOE, EAC, WAC, LIN and Your A-Number',
  seoTitle: 'IOE Receipt Number & ELIS Case Status Explained (2026)',
  description:
    'What an IOE receipt number is, how it differs from EAC, WAC, LIN and SRC numbers, what ELIS means, why an A-number cannot check a case, and where to track an IOE case.',
  category: 'USCIS',
  tags: [
    'IOE receipt number',
    'IOE case status',
    'ELIS case status',
    'A-number',
    'USCIS receipt number',
    'I-797 tracking',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the parts of a USCIS receipt number, IOE prefix and ten digits.',
  imageCaption:
    'A receipt number is three letters and ten digits. The letters say which system or center logged the case; the digits identify it.',
  directAnswer:
    'IOE is the receipt-number prefix USCIS gives to cases processed in its Electronic Immigration System, called ELIS. It covers every form filed online and a growing share of paper filings that are scanned into the same system. An IOE case is checked in exactly the same places as an EAC, WAC, LIN or SRC case: USCIS Case Status Online or your USCIS online account, using the full 13-character receipt number. There is no separate "ELIS case status" website, and an A-number cannot be used to check a case.',
  keyTakeaways: [
    'IOE means the case lives in ELIS, the USCIS online case system. It is not a service center and says nothing about speed.',
    'Check any receipt, IOE or otherwise, at USCIS Case Status Online. Searches for "IOE case status" or "ELIS case status" land on generic guides because the answer is the same tool.',
    'The A-number identifies you, not a case. It appears on the EAD and on notices, but Case Status Online only accepts receipt numbers.',
    'An I-797 notice is not tracked in the mail. The card is: once the status says "Card Was Mailed", the USPS tracking number appears in your online account.',
  ],
  sections: [
    {
      heading: 'Anatomy of a USCIS receipt number',
      paragraphs: [
        'Every application or petition USCIS accepts gets a 13-character receipt number: three letters followed by ten digits, printed in the top-left box of the Form I-797C Notice of Action and shown in your online account. The letters identify the system or office that logged the case. For paper receipts from the service centers, the ten digits encode the fiscal year, the working day the case was logged and a sequence number; IOE digits are a plain identifier and do not follow that pattern.',
        'The same person can hold several receipt numbers at once. An F-1 student who files Form I-765 for OPT and later a Form I-539 or a Form I-129 petition through an employer will have a different receipt for each, each with its own status. Match the form number printed on the notice to the case you want to check.',
        'Always enter the number without spaces or dashes, and double-check the characters that are easy to confuse: the letter O never appears after the prefix, so a round character in the digits is a zero. The receipt number troubleshooting guide covers the errors that follow a mistyped number.',
      ],
      table: {
        caption: 'Receipt-number prefixes and what they mean.',
        columns: ['Prefix', 'Where the case was logged', 'Typical forms'],
        rows: [
          ['IOE', 'ELIS, the USCIS Electronic Immigration System (online filings and scanned paper filings)', 'I-765 for OPT and STEM OPT, I-539, I-130, I-90, N-400, many I-129 and I-140 petitions'],
          ['EAC', 'Vermont Service Center (the Eastern Adjudication Center code)', 'Older I-765 and I-539 cases, I-129 petitions'],
          ['WAC', 'California Service Center (Western Adjudication Center)', 'I-129, I-140, older I-765 cases'],
          ['LIN', 'Nebraska Service Center (Lincoln)', 'I-140, I-485, I-765 filed with adjustment'],
          ['SRC', 'Texas Service Center (Southern Regional Center)', 'I-140, I-129, I-485'],
          ['NBC / MSC', 'National Benefits Center (Missouri)', 'I-485 packages, I-765 and I-131 filed with them'],
          ['YSC', 'Potomac Service Center', 'I-539 and I-765 for dependants, some I-129'],
        ],
      },
      links: [
        {
          label: 'Receipt number not working? Causes and fixes',
          href: '/blog/opt-receipt-number-not-working',
        },
        {
          label: 'What is a USCIS receipt number',
          href: '/answers/what-is-uscis-receipt-number',
        },
      ],
      sources: [src.i797, src.centers],
    },
    {
      heading: 'What IOE and ELIS actually mean',
      paragraphs: [
        'ELIS, the USCIS Electronic Immigration System, is the agency’s online case-management platform. Any form filed through a myUSCIS account is created in ELIS and receives an IOE receipt. USCIS also scans a growing share of paper filings into ELIS at intake, which is why a paper I-765 mailed to a lockbox can come back with an IOE number rather than the service-center prefix an older guide told you to expect.',
        'The prefix changes where the case is stored, not who decides it or how fast. IOE cases are routed to whichever service center or field office has capacity for that form, and the processing time to use is still the one USCIS publishes for the form and category. Treat forum claims that "IOE cases are faster" or "IOE cases get stuck" as anecdotes.',
        'There is no public ELIS website for applicants. People searching for "ELIS case status" are looking for one of two things: the public Case Status Online tool, which accepts any receipt including IOE, or the myUSCIS account, which shows the ELIS case history, notices, requests for evidence and, after approval, the USPS tracking number for the card. Both are described in the next section.',
      ],
      bullets: [
        'IOE prefix = case created or scanned into ELIS.',
        'ELIS is internal; applicants reach it through myUSCIS and Case Status Online.',
        'Processing time depends on the form and category, not on the prefix.',
      ],
      sources: [src.elis, src.account],
    },
    {
      heading: 'Where to check an IOE case status',
      paragraphs: [
        'USCIS Case Status Online is the public tool. Enter the full receipt number and it returns the latest status message, for example "Case Was Received" or "Case Was Approved". It needs no account, works for every prefix, and shows only the current message, not the history.',
        'Your USCIS online account adds the history, the notices as PDFs, secure messages, the ability to respond to a request for evidence, an address change form and, for I-765 cases filed online, the myProgress estimate. If you filed on paper and received an IOE receipt, the separate Account Access Notice includes an online access code. Sign in, choose to add a paper-filed case, and enter the receipt number, the code and your date of birth. The code expires, but USCIS will email a new one on request. Most, though not all, IOE paper cases can be added this way.',
        'A tracker such as TrackMyOPT stores the receipt, checks Case Status Online for you and emails you when the message changes. It reads the same public status as the USCIS tool, so it works for IOE and service-center receipts alike, and it keeps several cases in one list, for example an I-765 and a spouse’s I-539.',
      ],
      numbered: [
        'Copy the 13-character receipt from the I-797C notice or your account.',
        'Enter it at USCIS Case Status Online for the current message.',
        'Add the case to your myUSCIS account for history, notices and USPS tracking.',
        'Optionally save it in a tracker to be alerted when the message changes.',
      ],
      links: [
        {
          label: 'USCIS case status tracking guide: every status message explained',
          href: '/blog/uscis-case-status-tracking-guide',
        },
        {
          label: 'How TrackMyOPT case tracking works',
          href: '/features/case-status',
        },
      ],
      sources: [src.status, src.paperAccess],
    },
    {
      heading: 'Your A-number: what it is for and why it will not check a case',
      paragraphs: [
        'The A-number, formally the Alien Registration Number, is an 8 or 9 digit number that identifies a person in USCIS records, written as A followed by the digits, for example A123456789. Most F-1 students receive one when their first EAD is approved; it is printed on the card as "USCIS#" and appears on later I-797 notices. People who adjust status or receive other benefits keep the same number for life.',
        'Because it identifies you rather than a filing, the A-number cannot be entered in Case Status Online, which only accepts receipt numbers. Searches for "USCIS case status A number" end at the same answer: find the receipt number for the specific case. The A-number is used instead on later forms, on the Form I-9 for employment verification, at immigration court and when you create or verify a myUSCIS account.',
        'Keep the A-number, the receipt numbers and the SEVIS ID separate in your records. The SEVIS ID (N followed by ten digits) identifies your student record and is used with your DSO and the SEVP Portal, never with USCIS Case Status Online. Entering it in the status tool is one of the most common reasons a "receipt number" returns no result.',
      ],
      table: {
        caption: 'The numbers an OPT applicant carries, and where each one is used.',
        columns: ['Number', 'Format', 'Identifies', 'Used for'],
        rows: [
          ['Receipt number', '3 letters + 10 digits (IOE0123456789)', 'One application or petition', 'Case Status Online, myUSCIS, e-Request, case inquiries'],
          ['A-number (USCIS#)', 'A + 8 or 9 digits', 'You, across all cases', 'Later forms, Form I-9, EAD card, immigration court'],
          ['SEVIS ID', 'N + 10 digits', 'Your F-1 student record', 'Form I-20, SEVP Portal, DSO reporting'],
          ['I-94 number', '11 characters', 'One admission to the United States', 'Proof of status, Form I-9, travel history'],
          ['Online access code', 'Printed on the paper receipt notice', 'Links a paper case to your account', 'myUSCIS only, once'],
        ],
      },
      links: [
        {
          label: 'Where to find your I-94 and travel history',
          href: '/blog/i94-travel-history-opt-h1b',
        },
        {
          label: 'SEVP Portal guide for OPT',
          href: '/blog/sevp-portal-guide-opt',
        },
      ],
      sources: [src.aNumber, src.i797],
    },
    {
      heading: '"I-797 tracking": what can and cannot be tracked',
      paragraphs: [
        'Form I-797 is the family of notices USCIS mails: the I-797C receipt and biometrics notices, the I-797 approval notice, and the notices for requests for evidence and decisions. They travel by ordinary first-class mail and have no tracking number. The only way to know a notice exists is the status message or the PDF in your online account, which often appears before the paper arrives.',
        'The card is different. An EAD or green card is sent by USPS Priority Mail with tracking, and once the status reads "Card Was Mailed To Me" the tracking number appears in your USCIS online account. Use it with USPS Informed Delivery to see the envelope on delivery day. If the card has not arrived 30 days after that status, file a nondelivery e-Request.',
        'If an I-797 approval notice itself goes missing, you can request a replacement by filing Form I-824 or, for some notices, through a secure message in your account. For OPT applicants the EAD card, not the approval notice, is the document employers need, so a lost notice rarely blocks work.',
      ],
      links: [
        {
          label: 'EAD card status: when the card ships and what to do if it is late',
          href: '/blog/ead-card-status-check',
        },
        {
          label: 'EAD card lost, stolen, incorrect or never delivered',
          href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
        },
      ],
      sources: [src.i797, src.eRequest],
    },
    {
      heading: 'Example: Wei types his A-number into the status tool',
      paragraphs: [
        'Fictional example: Wei filed a STEM OPT I-765 online and gets a receipt with an IOE prefix. A week later a forum thread tells him IOE cases are "stuck in ELIS" and that he should check "ELIS status" with his A-number. He enters the A-number from his current EAD into Case Status Online and gets an error.',
        'He goes back to the I-797C notice, copies the 13-character receipt, and the tool returns "Case Was Received". He opens the case in his myUSCIS account, sees the receipt PDF and a myProgress estimate, and saves the receipt in a tracker so he stops checking the thread.',
        'The lesson is the one every receipt question comes back to: the prefix is a filing label, the A-number is a person, and the only key that opens a case is the receipt number for that case.',
      ],
    },
  ],
  checklist: [
    'Record each receipt number with the form it belongs to.',
    'Check status with the receipt at Case Status Online; use the A-number only where a form asks for it.',
    'Add paper-filed IOE cases to your myUSCIS account with the access code on the notice.',
    'Watch for "Card Was Mailed" and copy the USPS tracking number from your account.',
  ],
  mistakes: [
    'Treating the IOE prefix as a sign of a fast or slow case.',
    'Entering an A-number or SEVIS ID in Case Status Online.',
    'Waiting for a tracked I-797 notice that was sent by ordinary mail.',
    'Checking a companion form’s receipt and assuming it reflects the I-765.',
  ],
  faq: [
    {
      question: 'What does an IOE receipt number mean?',
      answer:
        'IOE is the prefix for cases processed in the USCIS Electronic Immigration System (ELIS): every online filing and many paper filings scanned into the system. It identifies where the case record lives, not a service center or a processing speed.',
    },
    {
      question: 'How do I check an IOE case status?',
      answer:
        'Enter the full 13-character receipt number at USCIS Case Status Online, or open the case in your myUSCIS account for the history, notices and card tracking. IOE cases are checked exactly like EAC, WAC, LIN or SRC cases.',
    },
    {
      question: 'Is there an ELIS case status website?',
      answer:
        'No. ELIS is an internal USCIS system. Applicants reach their ELIS case through Case Status Online or the myUSCIS account.',
    },
    {
      question: 'Can I check USCIS case status with my A-number?',
      answer:
        'No. Case Status Online accepts only receipt numbers. The A-number identifies you across all cases and is used on forms, the EAD card and Form I-9, not in the status tool.',
    },
    {
      question: 'Why did my paper I-765 get an IOE number instead of EAC or WAC?',
      answer:
        'USCIS now scans many paper filings into ELIS at intake, so they receive IOE receipts. The case is handled the same way; use the processing time for Form I-765 and your category.',
    },
    {
      question: 'Can I track an I-797 notice in the mail?',
      answer:
        'No. I-797 notices are sent by ordinary mail without tracking. Only the card is tracked: after "Card Was Mailed" the USPS tracking number appears in your USCIS online account.',
    },
  ],
  sources: [
    src.status,
    src.account,
    src.paperAccess,
    src.elis,
    src.i797,
    src.aNumber,
    src.centers,
    src.eRequest,
  ],
  related: [
    {
      label: 'USCIS case status tracking guide',
      href: '/blog/uscis-case-status-tracking-guide',
    },
    {
      label: 'OPT receipt number not working',
      href: '/blog/opt-receipt-number-not-working',
    },
    {
      label: 'EAD card status check',
      href: '/blog/ead-card-status-check',
    },
    {
      label: 'I-140 tracker: status, processing time and alerts',
      href: '/blog/i-140-case-status-tracking',
    },
  ],
});
