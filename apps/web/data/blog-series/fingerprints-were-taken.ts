import { defineArticle } from './shared';
import {
  STATUS_GUIDE_DATE,
  TRACKER_DATA_NOTE,
  statusSources as src,
} from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "case was updated to show fingerprints were taken", "what
// next", "i-765", "meaning", "reddit". The tracker shows most I-765 histories
// never display the message, which is the worry behind half of these searches.

const SLUG = 'fingerprints-were-taken-uscis-status-i765';

export const fingerprintsWereTakenGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    '"Fingerprints Were Taken": What the USCIS Status Means and What Comes Next',
  seoTitle: 'Fingerprints Were Taken: USCIS Status Meaning, What Next',
  description:
    '"Case Was Updated To Show Fingerprints Were Taken" means USCIS logged your biometrics. Most I-765 cases never show it. What comes next, how long it takes, and what to do if nothing changes.',
  category: 'USCIS',
  tags: [
    'fingerprints were taken',
    'case was updated to show fingerprints were taken',
    'I-765 biometrics what next',
    'biometrics appointment status',
    'OPT biometrics',
  ],
  readTime: '5 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: biometrics notices came a median of 7 days after receipt in 1,980 tracked I-765 cases.',
  imageCaption:
    'Biometrics timing in tracked I-765 cases, read on November 20, 2026.',
  dataNote: TRACKER_DATA_NOTE,
  directAnswer:
    '"Case Was Updated To Show Fingerprints Were Taken" means USCIS recorded the biometrics from your appointment. It is a checkpoint, not a decision. For Form I-765 the message is rare: of 1,980 tracked cases with a biometrics appointment, only 2 showed it. If your status still says an appointment was scheduled after you attended, that is normal. Approval came a median of 125 days after the appointment was scheduled.',
  keyTakeaways: [
    'The message confirms your biometrics are on file. No action is needed.',
    'Most I-765 cases skip it. The status often stays at "appointment scheduled".',
    'Biometrics notices came a median of 7 days after receipt in tracked cases.',
    'Processing time still counts from the receipt date, not from biometrics.',
  ],
  sections: [
    {
      heading: 'What the message means',
      paragraphs: [
        'USCIS collects fingerprints, a photo and a signature at an Application Support Center. It uses them to confirm your identity, run background checks and print the card.',
        'The message says that step is done. It does not say an officer has reviewed your case.',
      ],
      table: {
        caption: 'Biometrics messages and what each one asks of you.',
        columns: ['Status message', 'What it means', 'What to do'],
        rows: [
          ['Biometrics appointment was scheduled', 'USCIS mailed an appointment notice.', 'Find the notice in your account and attend.'],
          ['Fingerprints were taken', 'Your biometrics are on file.', 'Nothing. Keep your appointment notice.'],
          ['Case is being actively reviewed', 'The case is in line. Nothing is missing.', 'Nothing.'],
          ['Case was approved', 'The I-765 is approved.', 'Check your mailing address.'],
        ],
      },
      sources: [src.biometrics, src.status],
    },
    {
      heading: 'My status did not change after the appointment',
      figure: {
        src: '/blog/illustrations/fingerprints-were-taken-uscis-status-i765.webp',
        alt: 'Painted illustration of a small fingerprint scanner glowing on an office counter beside a blank clipboard, with an empty chair behind.',
        caption: 'Biometrics are a checkpoint inside the case, not a decision. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'That is the usual result for an I-765. In tracked cases, 1,980 had a biometrics appointment scheduled and only 2 histories ever showed "fingerprints were taken".',
        'The appointment notice you brought is your proof that you attended. Keep it with your receipt notice.',
      ],
      links: [
        { label: 'OPT biometrics appointment in 2026', href: '/blog/opt-biometrics-appointment-2026' },
        { label: '"Case Is Being Actively Reviewed": what it means', href: '/blog/case-is-being-actively-reviewed-uscis-meaning' },
      ],
      sources: [src.status],
    },
    {
      heading: 'How long each step takes: tracked cases',
      paragraphs: [
        'USCIS does not start a new clock at biometrics. The posted I-765 processing time runs from the receipt date. These figures show where the appointment falls inside it.',
      ],
      table: {
        caption: 'Biometrics timing in tracked I-765 cases, read on November 20, 2026.',
        columns: ['Measure', 'Cases', 'Median', 'Middle half', '9 in 10 within'],
        rows: [
          ['Receipt to appointment scheduled', '1,980', '7 days', '4 to 13 days', '22 days'],
          ['Appointment scheduled to approval', '1,376', '125 days', '85 to 155 days', '175 days'],
        ],
      },
      note: 'The longest gap from scheduling to approval was 228 days. The figures mix regular and premium cases.',
      links: [
        { label: 'I-765 processing time after biometrics', href: '/blog/i-765-processing-time-after-biometrics' },
        { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
      ],
      sources: [src.status, src.times],
    },
    {
      heading: 'If you have not attended yet',
      paragraphs: [
        'The rules for the appointment are strict. Missing it can end the case.',
      ],
      bullets: [
        'Bring the appointment notice and a valid photo ID, such as your passport.',
        'To reschedule, ask through your USCIS online account before the appointment time and give a good reason.',
        'If you skip the appointment without rescheduling, USCIS may treat the application as abandoned and deny it.',
      ],
      sources: [src.biometrics],
    },
    {
      heading: 'What comes next',
      paragraphs: [
        'After biometrics the case waits for an officer. The next message is usually "actively reviewed", a request for evidence, or approval.',
        'If you paid for premium processing, USCIS starts the 30 business days only when it has everything it needs to decide the case.',
      ],
      links: [
        { label: 'Premium processing: business days or calendar days?', href: '/blog/premium-processing-business-days-or-calendar-days' },
        { label: '"Card Is Being Produced": how long it takes', href: '/blog/card-is-being-produced-how-long' },
        { label: 'OPT RFE: reasons and how to respond', href: '/blog/opt-rfe-request-for-evidence-i765' },
      ],
      sources: [src.premium, src.status],
    },
  ],
  checklist: [
    'Keep the appointment notice with your receipt notice.',
    'Check your USCIS account weekly for a notice.',
    'Keep your mailing address current.',
    'Compare your receipt date with posted processing times.',
  ],
  mistakes: [
    'Assuming the case is stuck because the status did not change.',
    'Counting processing time from the biometrics date.',
    'Asking to reschedule after the appointment time has passed.',
    'Travelling abroad right after filing and missing the appointment.',
  ],
  faq: [
    {
      question: 'What does "fingerprints were taken" mean?',
      answer:
        'USCIS recorded the biometrics from your appointment. It is a checkpoint. It is not an approval and no action is needed.',
    },
    {
      question: 'What comes after fingerprints are taken for an I-765?',
      answer:
        'The case waits for review. The next message is usually "actively reviewed", a request for evidence, or approval.',
    },
    {
      question: 'How long after biometrics is an I-765 approved?',
      answer:
        'USCIS gives no time from biometrics. In 1,376 tracked cases, approval came a median of 125 days after the appointment was scheduled.',
    },
    {
      question: 'My status still says the appointment was scheduled. Is that a problem?',
      answer:
        'No. Only 2 of 1,980 tracked I-765 cases ever showed "fingerprints were taken". The status usually stays the same until review or approval.',
    },
    {
      question: 'Can I reschedule a biometrics appointment?',
      answer:
        'Yes, through your USCIS online account, before the appointment time, with a good reason. USCIS may deny a case if you miss the appointment.',
    },
  ],
  sources: [src.biometrics, src.status, src.times, src.premium],
  related: [
    { label: 'I-765 processing time after biometrics', href: '/blog/i-765-processing-time-after-biometrics' },
    { label: 'OPT biometrics appointment in 2026', href: '/blog/opt-biometrics-appointment-2026' },
    { label: '"Case Is Being Actively Reviewed": what it means', href: '/blog/case-is-being-actively-reviewed-uscis-meaning' },
    { label: 'EAD card status: every message explained', href: '/blog/ead-card-status-check' },
  ],
});
