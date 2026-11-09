import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// Two short explainers for query families that rank 5 to 9 with no page:
// "isss" (1,806 impressions), "pdso" (991), "sevis id" (895), "sevp login" (641).

const src = {
  dso: {
    label: 'Designated School Officials',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/schools/designated-school-officials',
  },
  i20: {
    label: 'Students and the Form I-20',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20',
  },
  sevpPortal: {
    label: 'SEVP Portal Help',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevp-portal-help',
  },
  sevis: {
    label: 'Student and Exchange Visitor Program (SEVP) and SEVIS',
    publisher: 'U.S. Immigration and Customs Enforcement',
    url: 'https://www.ice.gov/sevis',
  },
  sevisFee: {
    label: 'I-901 SEVIS Fee payment',
    publisher: 'U.S. Immigration and Customs Enforcement',
    url: 'https://www.fmjfee.com/',
  },
  cfr: {
    label: '8 CFR 214.3: Approval of schools and designated school officials',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.3',
  },
  optReporting: {
    label: 'Optional Practical Training for F-1 Students',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students',
  },
} satisfies Record<string, ArticleSource>;

const ISSS_SLUG = 'isss-dso-pdso-meaning';
const SEVIS_SLUG = 'sevis-id-where-to-find';

export const isssDsoPdsoGuide: ResearchArticle = defineArticle({
  slug: ISSS_SLUG,
  title:
    'ISSS, DSO and PDSO: Who They Are, What Each One Can Do for Your F-1 Status, and When to Contact Them',
  seoTitle: 'ISSS, DSO and PDSO Explained: Who Handles Your F-1 and OPT',
  description:
    'ISSS is your school’s international student office; a DSO is the staff member authorised to update SEVIS and sign your I-20; the PDSO is the lead DSO. What each can and cannot do for OPT, STEM OPT, travel and status problems.',
  category: 'Academics',
  tags: ['ISSS', 'DSO', 'PDSO', 'international student office', 'SEVIS', 'F-1 status'],
  readTime: '6 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  cta: 'opt-timeline',
  image: `/blog/${ISSS_SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: ISSS office, DSO and PDSO roles in the F-1 status chain.',
  imageCaption:
    'Three names for the people who manage your SEVIS record. Generated from the DHS role descriptions in this guide.',
  directAnswer:
    'ISSS (International Student and Scholar Services, sometimes ISS, OIS or OISS) is the office at your school that serves international students. A DSO (Designated School Official) is a named employee of that office whom the school has registered with SEVP, and only a DSO can update your SEVIS record, issue or sign an I-20, recommend OPT or STEM OPT, and authorise CPT. The PDSO (Principal Designated School Official) is the lead DSO who manages the school’s SEVP certification and the other DSOs. For almost everything, you contact ISSS and a DSO handles it.',
  keyTakeaways: [
    'ISSS is the office; DSO and PDSO are job roles inside it that SEVP recognises.',
    'Only a DSO can touch your SEVIS record: I-20s, OPT recommendations, CPT, reduced course loads, transfers and travel signatures.',
    'DSOs advise on status rules but are not your immigration lawyer and cannot change a USCIS decision.',
    'After graduation you still need the DSO: the OPT recommendation, STEM OPT I-983 review and SEVP Portal problems all go through them.',
  ],
  sections: [
    {
      heading: 'ISSS: the office',
      paragraphs: [
        'Most U.S. schools group international student advising into one office. The name varies: International Student and Scholar Services (ISSS), International Student Services (ISS), Office of International Students (OIS), Office of International Students and Scholars (OISS) or Office of Global Engagement. Whatever the sign on the door says, this is where F-1 and J-1 students go for immigration paperwork, orientation, and advice on maintaining status.',
        'ISSS staff who are not DSOs can answer general questions and book appointments but cannot update SEVIS. If an email signature or a web page lists someone as an "international student advisor" without the DSO title, confirm whether they are a DSO before relying on them for an I-20 or a reporting deadline.',
      ],
      sources: [src.dso],
    },
    {
      heading: 'DSO: the person who can change your SEVIS record',
      paragraphs: [
        'A Designated School Official is an employee the school has named on its Form I-17 petition to SEVP and who has access to the Student and Exchange Visitor Information System (SEVIS). Federal regulation requires a DSO to be a U.S. citizen or permanent resident and limits the number of DSOs a school may designate. Everything that changes your record in SEVIS is a DSO action.',
      ],
      table: {
        caption: 'What a DSO does for an F-1 student, by stage.',
        columns: ['Stage', 'DSO actions'],
        rows: [
          ['Before arrival', 'Issues the initial I-20 and SEVIS ID; registers you in SEVIS after you arrive and enrol'],
          ['During study', 'Travel signatures on the I-20, reduced course load approvals, program extensions, change of major or level, SEVIS transfers, CPT authorisation'],
          ['OPT', 'Enters the OPT recommendation in SEVIS and issues the OPT I-20 you file with Form I-765; updates employer information'],
          ['STEM OPT', 'Reviews and signs the I-983 training plan, issues the STEM OPT I-20, records the six-month validation and employer changes'],
          ['Problems', 'Records unemployment, reinstatement requests, status corrections, SEVIS termination and the reasons for it'],
        ],
      },
      note: 'A DSO must act within the regulations. They cannot backdate an OPT recommendation, approve CPT that does not fit the degree, or keep a record active after you fall out of status. When a DSO says no, the answer is usually the rule, not the person.',
      sources: [src.dso, src.cfr, src.optReporting],
    },
    {
      heading: 'PDSO: the lead DSO',
      paragraphs: [
        'Each SEVP-certified school has exactly one Principal Designated School Official. The PDSO is the school’s point of contact with SEVP, keeps the school’s certification current, submits the I-17 updates that add or remove DSOs, and can do everything a DSO can do. Students rarely need the PDSO directly. You might be referred to the PDSO for an unusual case, a complaint about a DSO decision, or when the school’s certification itself is in question.',
        'Searches for "PDSO" often come from students whose I-20 is signed by the PDSO and who wonder whether that matters. It does not: a PDSO signature and a DSO signature carry the same weight on an I-20.',
      ],
      sources: [src.cfr],
    },
    {
      heading: 'What ISSS and DSOs cannot do',
      paragraphs: [
        'DSOs are immigration compliance officers for the school, not attorneys for the student. They cannot represent you before USCIS, file your I-765, speed up a pending OPT case, argue an RFE, or give legal advice about a denial, a visa refusal or a change of status to H-1B. For those, the DSO will usually refer you to the school’s immigration counsel or to an outside attorney.',
        'They also cannot see your USCIS case. SEVIS shows the OPT recommendation and, once USCIS approves it, the EAD dates; it does not show the receipt status in between. For that you use USCIS Case Status Online or a tracker.',
      ],
      bullets: [
        'DSO: SEVIS record, I-20, OPT and STEM recommendations, CPT, reporting.',
        'Attorney: USCIS filings beyond the I-765, RFEs, denials, H-1B and green card strategy.',
        'You: filing the I-765 on time, SEVP Portal updates, tracking the USCIS case.',
      ],
      links: [
        { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
        { label: 'OPT reporting requirements and the DSO', href: '/blog/opt-reporting-requirements-dso' },
      ],
      sources: [src.dso, src.sevpPortal],
    },
    {
      heading: 'When to contact ISSS after graduation',
      paragraphs: [
        'Your relationship with the DSO continues through OPT and STEM OPT. Contact ISSS within 10 days of starting a job, changing employers, moving or losing a job, so the DSO can confirm the SEVIS record matches the SEVP Portal. Ask for a new I-20 before travelling if the travel signature is older than six months during OPT. Ask the DSO before the STEM OPT application window opens, because the I-983 review takes time, and again at the 6, 12, 18 and 24 month validation points.',
        'If the SEVP Portal locks you out, ISSS can reset access. If the SEVP Portal and the I-20 disagree about an employer or an end date, the DSO corrects SEVIS; you cannot.',
      ],
      numbered: [
        'New job, employer change, move or unemployment: within 10 days.',
        'Travel on OPT: travel signature under six months old.',
        'STEM OPT: I-983 review before the 90-day filing window, validations every six months.',
        'Portal lockout or SEVIS mismatch: ISSS, not USCIS.',
      ],
      links: [
        { label: 'SEVP Portal guide for OPT and STEM OPT', href: '/blog/sevp-portal-guide-opt' },
        { label: 'STEM OPT six-month validation report', href: '/blog/stem-opt-six-month-validation-report' },
      ],
      sources: [src.sevpPortal, src.optReporting],
    },
  ],
  checklist: [
    'Know the name and email of your assigned DSO.',
    'Confirm the person updating your SEVIS record holds the DSO title.',
    'Report employment and address changes to the DSO within 10 days.',
    'Use an attorney, not the DSO, for USCIS disputes beyond the I-765.',
  ],
  mistakes: [
    'Emailing a general ISSS inbox for a deadline-critical I-20 without confirming a DSO received it.',
    'Expecting the DSO to see or speed up a pending USCIS case.',
    'Assuming a PDSO signature is required on an I-20.',
  ],
  faq: [
    {
      question: 'What does ISSS stand for?',
      answer:
        'International Student and Scholar Services, the office that advises international students at a U.S. school. Other schools call it ISS, OIS, OISS or the international office.',
    },
    {
      question: 'What is the difference between a DSO and a PDSO?',
      answer:
        'Both can update SEVIS and sign an I-20. The PDSO is the lead DSO who manages the school’s SEVP certification and the list of DSOs. Students usually work with a DSO.',
    },
    {
      question: 'Can a DSO see my OPT case status?',
      answer:
        'No. SEVIS shows the OPT recommendation and, after approval, the EAD dates. The USCIS receipt status in between is visible only through USCIS Case Status Online or your USCIS account.',
    },
    {
      question: 'Is a DSO an immigration lawyer?',
      answer:
        'No. A DSO advises on F-1 rules and manages the SEVIS record. Legal advice and representation before USCIS come from an attorney.',
    },
  ],
  sources: [src.dso, src.cfr, src.sevpPortal, src.optReporting, src.sevis],
  related: [
    { label: 'Where to find your SEVIS ID', href: `/blog/${SEVIS_SLUG}` },
    { label: 'SEVP Portal guide for OPT', href: '/blog/sevp-portal-guide-opt' },
    { label: 'OPT reporting requirements and the DSO', href: '/blog/opt-reporting-requirements-dso' },
    { label: 'What happens when SEVIS is terminated', href: '/blog/sevis-terminated-reasons-recovery-options' },
  ],
});

export const sevisIdGuide: ResearchArticle = defineArticle({
  slug: SEVIS_SLUG,
  title:
    'SEVIS ID: Where to Find It on Your I-20, What It Is Used For, and What to Do If It Changes',
  seoTitle: 'SEVIS ID: Where to Find It on the I-20 and What It Is For',
  description:
    'Your SEVIS ID is the N-number at the top of Form I-20. Where it appears, when you need it (I-901 fee, visa interview, I-765, SEVP Portal), and why it stays the same across schools but can change after a status break.',
  category: 'Academics',
  tags: ['SEVIS ID', 'SEVIS number', 'Form I-20', 'I-901 fee', 'SEVP Portal login'],
  readTime: '5 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  cta: 'opt-timeline',
  image: `/blog/${SEVIS_SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the SEVIS ID location on Form I-20 and the forms that ask for it.',
  imageCaption:
    'The N-number at the top of the I-20 follows you through every F-1 form. Generated from the DHS descriptions in this guide.',
  directAnswer:
    'Your SEVIS ID is the identifier that starts with the letter N followed by ten digits, printed at the top left of Form I-20 above your name. It identifies your record in the Student and Exchange Visitor Information System. You need it to pay the I-901 SEVIS fee, at the visa interview, on Form I-765 for OPT, and to activate the SEVP Portal. It normally stays the same when you transfer schools or change levels, and changes only when a new SEVIS record is created, for example after a reinstatement or a new initial entry.',
  keyTakeaways: [
    'Format: N plus ten digits, for example N0012345678. It is on every I-20 you have received.',
    'It is not the I-20 school code, the I-94 number, the SEVIS fee receipt number or the USCIS receipt number.',
    'Transfers and level changes keep the same SEVIS ID; a new initial I-20 after a status break creates a new one.',
    'The SEVP Portal activation email asks for the SEVIS ID exactly as printed on the current I-20.',
  ],
  sections: [
    {
      heading: 'Where the SEVIS ID is on Form I-20',
      paragraphs: [
        'Open any Form I-20. In the top left corner, above the student information block, is a line labelled "SEVIS ID" followed by a number beginning with N and ten digits. The same number appears on every page of the I-20 and on the DS-2019 for J-1 students. It does not change between the initial I-20, an OPT I-20 and a STEM OPT I-20 issued by the same school.',
      ],
      table: {
        caption: 'Numbers on your documents that are often confused with the SEVIS ID.',
        columns: ['Number', 'Where it is', 'Format', 'Used for'],
        rows: [
          ['SEVIS ID', 'Top left of the I-20, every page', 'N + 10 digits', 'Your SEVIS record'],
          ['School code', 'I-20 "School Information" block', 'Letters and digits like BOS214F00123000', 'Identifies the school and campus in SEVIS'],
          ['I-94 number', 'CBP I-94 website or paper I-94', '11 characters', 'Your most recent admission record'],
          ['I-901 fee receipt', 'FMJfee.com confirmation', 'Payment confirmation', 'Proof of the SEVIS fee for the visa interview'],
          ['USCIS receipt number', 'I-797C notice', '3 letters + 10 digits', 'A USCIS application such as the I-765 for OPT'],
        ],
      },
      sources: [src.i20],
    },
    {
      heading: 'When you need the SEVIS ID',
      paragraphs: [
        'The SEVIS ID appears early and often. You enter it to pay the I-901 SEVIS fee before the visa interview, and the consulate matches it to your visa application. Form I-765 for OPT asks for it in the F-1 section. The SEVP Portal invitation email, sent after USCIS approves OPT, asks for the SEVIS ID to activate your account. Employers do not need it; it is not an I-9 document.',
      ],
      numbered: [
        'I-901 SEVIS fee payment at FMJfee.com, before the visa interview.',
        'Visa application and interview (DS-160 asks for it).',
        'Form I-765 for OPT and STEM OPT.',
        'SEVP Portal activation and login help.',
        'Any email to ISSS about your record: include it so the DSO can find you in SEVIS.',
      ],
      links: [
        { label: 'Form I-765 and EAD application guide', href: '/blog/form-i765-ead-application-guide' },
        { label: 'SEVP Portal guide: login, unlock and reporting', href: '/blog/sevp-portal-guide-opt' },
      ],
      sources: [src.sevisFee, src.sevpPortal, src.optReporting],
    },
    {
      heading: 'Does the SEVIS ID change?',
      paragraphs: [
        'Not usually. When you transfer to another school, change from a bachelor’s to a master’s at the same school, or move from OPT to STEM OPT, the DSO works in the same SEVIS record and the ID stays the same. The I-901 fee you paid attaches to that record.',
        'A new SEVIS ID is created when a new initial record is made: a reinstatement denied and re-entry on a new initial I-20, a change of status to F-1 approved by USCIS on a new record, a return to the United States after a long absence with a new initial I-20, or a transfer that was not completed before the old record was terminated. A new SEVIS ID usually means a new I-901 fee, and your OPT history is tied to the old record, so ask the DSO how the new record affects OPT eligibility at the same degree level.',
      ],
      note: 'If you have two I-20s with different SEVIS IDs, use the one on the I-20 that is currently active. The DSO can tell you which record is active; the SEVP Portal will only accept the active one.',
      links: [
        { label: 'SEVIS transfer guide and its effect on OPT', href: '/blog/sevis-transfer-guide-opt-impact' },
        { label: 'SEVIS terminated: reasons and recovery options', href: '/blog/sevis-terminated-reasons-recovery-options' },
      ],
      sources: [src.i20, src.sevis],
    },
    {
      heading: 'Lost your I-20? Getting the SEVIS ID back',
      paragraphs: [
        'The DSO can look up your SEVIS ID and reissue the I-20. Check old emails from the school first; admission packets, OPT I-20 emails and SEVP Portal invitations all contain it. The I-901 payment confirmation from FMJfee.com also shows it. Do not post the number in public forums; combined with your name and date of birth it identifies your immigration record.',
      ],
      links: [
        { label: 'Who ISSS, DSO and PDSO are and when to contact them', href: `/blog/${ISSS_SLUG}` },
        { label: 'Immigration documents to keep on OPT', href: '/blog/immigration-documents-to-keep-on-opt' },
      ],
      sources: [src.dso],
    },
  ],
  checklist: [
    'Save a scan of every I-20 and note the SEVIS ID.',
    'Use the SEVIS ID from the currently active I-20.',
    'Include it in every email to the DSO.',
    'Keep it off public forums and job applications.',
  ],
  mistakes: [
    'Entering the school code or I-94 number where a form asks for the SEVIS ID.',
    'Using an old SEVIS ID after a new initial record was created.',
    'Assuming a transfer gives you a new SEVIS ID and paying the I-901 fee again.',
  ],
  faq: [
    {
      question: 'Where is the SEVIS ID on the I-20?',
      answer:
        'Top left of the first page, labelled "SEVIS ID", starting with N and followed by ten digits. It repeats on every page.',
    },
    {
      question: 'Is the SEVIS ID the same as the SEVIS number?',
      answer:
        'Yes. "SEVIS number", "SEVIS ID" and "N-number" all refer to the same identifier.',
    },
    {
      question: 'Does my SEVIS ID change when I transfer schools?',
      answer:
        'No. A completed SEVIS transfer moves the same record to the new school. A new ID is created only when a new initial record is made.',
    },
    {
      question: 'What SEVIS ID does the SEVP Portal want?',
      answer:
        'The one on your current, active I-20, typed exactly as printed. If the portal rejects it, the invitation may have expired or the record may not be active; contact your DSO.',
    },
  ],
  sources: [src.i20, src.sevisFee, src.sevpPortal, src.sevis, src.dso],
  related: [
    { label: 'ISSS, DSO and PDSO explained', href: `/blog/${ISSS_SLUG}` },
    { label: 'SEVP Portal guide for OPT', href: '/blog/sevp-portal-guide-opt' },
    { label: 'F-1 status, I-20 and I-94 differences', href: '/blog/f1-visa-status-i20-i94-differences' },
  ],
});

export const sevisDsoExplainers: ResearchArticle[] = [isssDsoPdsoGuide, sevisIdGuide];
