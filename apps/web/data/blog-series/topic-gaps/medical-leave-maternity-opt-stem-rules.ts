import { source } from '../shared';
import { gap, gapSources } from './shared';

export const medicalLeaveMaternityOptStemRulesArticle = gap({
    slug: 'medical-leave-maternity-opt-stem-rules',
    title:
      'Medical Leave and Maternity on OPT or STEM OPT: Status, Hours, and Reporting',
    seoTitle: 'Medical Leave / Maternity on OPT and STEM OPT',
    description:
      'Understand what happens to F-1 OPT or STEM OPT when you need medical leave or maternity time away from work: unemployment days, employer reporting, and when to call your DSO.',
    category: 'OPT Basics',
    tags: [
      'medical leave OPT',
      'maternity OPT',
      'STEM OPT leave',
      'unemployment days',
    ],
    readTime: '10 min read',
    cta: 'unemployment',
    image: '/blog/topic-gaps-2026-10/medical-leave-maternity-opt-stem-rules.webp',
    imageAlt: 'Fictional STEM OPT professional planning medical leave with calendar and training plan folder',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'There is no automatic “pause button” that freezes OPT or STEM OPT merely because you are pregnant, recovering, or on employer medical leave. If you stop working or drop below qualifying hours, unemployment-day rules may apply unless your situation still qualifies as employment under current guidance and school instructions. Employer FMLA-style leave, SEVIS reporting, and Form I-983 obligations are separate questions—coordinate HR, your DSO, and qualified counsel before assuming unpaid leave keeps you safely employed for immigration purposes.',
    keyTakeaways: [
      'Employer leave policies ≠ immigration unemployment rules.',
      'STEM OPT may require I-983 and reporting updates when training pauses or duties change.',
      'Get written clarification before a long leave; do not rely on Slack advice.',
    ],
    sections: [
      {
        heading: 'Separate three calendars',
        paragraphs: [
          'Keep employer leave entitlement, F-1/OPT unemployment counting, and EAD end dates on separate calendars. A company may approve eight weeks of leave while immigration rules still treat you as unemployed if you are not engaged in qualifying practical training hours.',
          'For STEM OPT, a material change in the training plan—such as a long pause in training activities—may require an updated I-983 and DSO reporting. Ask early, not after returning.',
        ],
        links: [
          {
            label: 'STEM OPT material changes and new I-983',
            href: '/blog/stem-opt-material-changes-new-i983',
          },
          {
            label: '90-day unemployment rule',
            href: '/blog/90-day-unemployment-rule-opt',
          },
          {
            label: 'STEM OPT unemployment limit',
            href: '/blog/stem-opt-unemployment-limit',
          },
        ],
      },
      {
        heading: 'Medical leave while still enrolled (not yet on OPT)',
        paragraphs: [
          'If you are still studying, ask about DSO-authorized medical reduced course load or a medical leave process that keeps SEVIS accurate. Unauthorized withdrawal can create status problems before OPT even begins.',
        ],
        links: [
          {
            label: 'Reduced course load and OPT impact',
            href: '/blog/reduced-course-load-f1-opt-impact',
          },
        ],
      },
      {
        heading: 'Fictional example: Anika’s STEM OPT leave',
        paragraphs: [
          'Anika is fictional and on STEM OPT. Her employer approves parental leave. Before leave starts, she asks HR whether she remains an employee, asks the DSO whether unemployment days will run, and updates the I-983 if training activities pause. She documents every answer with dates instead of assuming “on leave” equals “employed for OPT.”',
        ],
      },
      {
        heading: 'Travel and dependent planning',
        paragraphs: [
          'Medical or parental situations sometimes involve travel. OPT travel still requires a valid EAD, travel signature, and visa considerations. F-2 or other dependent plans are separate filings. Do not combine travel myths with leave myths.',
        ],
        links: [
          {
            label: 'Travel on OPT complete guide',
            href: '/blog/can-you-travel-on-opt-complete-guide',
          },
          {
            label: 'F-2 dependent visa rules for OPT students',
            href: '/blog/f2-dependent-visa-rules-opt-students',
          },
        ],
      },
    ],
    checklist: [
      'Ask HR whether you remain employed and what hours/status they will report.',
      'Ask the DSO how leave affects unemployment counting and STEM reporting.',
      'Update I-983 / SEVP portal information when required.',
      'Track remaining unemployment days before approving a long unpaid leave.',
      'Consult qualified counsel for complex medical or parental timelines.',
    ],
    mistakes: [
      'Assuming employer FMLA automatically protects OPT status.',
      'Failing to report a STEM training pause.',
      'Burning the entire unemployment allotment during an unplanned gap.',
    ],
    faq: [
      {
        question: 'Does maternity leave stop the OPT unemployment clock?',
        answer:
          'Not automatically. If you are not engaged in qualifying OPT employment for the required hours, unemployment days may accrue. Confirm with your DSO for your facts.',
      },
      {
        question: 'Can I volunteer during medical leave to stop the clock?',
        answer:
          'Only if the activity meets OPT employment rules (including hour and degree-relation requirements) and is properly reported. See our volunteer guide; medical leave does not create a special volunteer exception.',
      },
      {
        question: 'What if my EAD expires during leave?',
        answer:
          'You generally cannot continue OPT work after the EAD ends unless another authorization applies (such as a properly continuing STEM extension scenario). Plan filings before leave when possible.',
      },
    ],
    sources: [source.opt, source.stem, source.i983, gapSources.practicalTraining],
    related: [
      {
        label: 'Health insurance between graduation and your first OPT job',
        href: '/blog/health-insurance-gap-after-graduation-opt',
      },
      {
        label: 'OPT anxiety and mental health',
        href: '/blog/opt-anxiety-mental-health-international-students',
      },
      {
        label: 'What happens if OPT expires',
        href: '/blog/what-happens-if-opt-expires',
      },
      {
        label: '60-day grace period for F-1 students',
        href: '/blog/60-day-grace-period-f1-students',
      },
    ],
  });
