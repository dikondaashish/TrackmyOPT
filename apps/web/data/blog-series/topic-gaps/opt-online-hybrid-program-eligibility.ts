import { source } from '../shared';
import { gap, gapSources } from './shared';

export const optOnlineHybridProgramEligibilityArticle = gap({
    slug: 'opt-online-hybrid-program-eligibility',
    title:
      'Online and Hybrid F-1 Programs: How Distance Learning Limits Affect OPT Eligibility',
    seoTitle: 'Online/Hybrid F-1 Courses and OPT Eligibility',
    description:
      'Understand F-1 online and hybrid course limits, when a class counts as distance learning, and how enrollment mistakes can put OPT and status at risk.',
    category: 'F-1 Compliance',
    tags: [
      'online courses F-1',
      'hybrid program OPT',
      'distance learning',
      'full course of study',
    ],
    readTime: '10 min read',
    cta: 'opt-timeline',
    image: '/blog/topic-gaps-2026-10/opt-online-hybrid-program-eligibility.webp',
    imageAlt: 'Fictional F-1 student balancing a laptop and campus classroom for hybrid enrollment',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'F-1 students may generally count only one online or distance-learning class (or three credits) toward a full course of study each academic session. A course that does not require physical attendance for classes, exams, or other integral activities is treated as online for this limit. Hybrid courses that require in-person components are often treated differently if you actually attend those components. Violating online limits can jeopardize status and later OPT benefits—confirm modality with your DSO before trusting a course catalog label alone.',
    keyTakeaways: [
      'Online limits apply while you are maintaining a full course of study—not as a separate “OPT online rule.”',
      'Hybrid labeling varies by school; physical-attendance requirements matter.',
      'A final remaining course generally cannot be online-only for F-1 completion rules.',
    ],
    sections: [
      {
        heading: 'The regulatory online limit',
        paragraphs: [
          'Study in the States and the USCIS Policy Manual explain that only one class or three credits per session may count toward full-time enrollment if the class is online or distance learning without required physical attendance for integral purposes. English language training students generally cannot count online classes toward a full course of study.',
          'Taking extra online classes beyond the countable limit does not automatically fix a shortfall in in-person credits. Build the schedule so enough countable credits are in-person or otherwise allowed.',
        ],
        sources: [gapSources.fullCourse, gapSources.enrollment],
      },
      {
        heading: 'Hybrid courses: ask what “integral attendance” means',
        paragraphs: [
          'Schools use labels like hybrid, HyFlex, remote, and flipped classroom differently. For immigration purposes, the question is whether the course requires your physical attendance for classes, examinations, or other purposes integral to completion. If it does, many schools treat it as not counting against the online limit—provided you attend the required in-person pieces.',
          'Keep records of required on-campus sessions. If you never attend the in-person components of a hybrid course, your school may later treat the enrollment as online for status purposes.',
        ],
        note: 'Do not rely on a friend’s modality interpretation at another university. Use your DSO’s written guidance for your campus registration system.',
      },
      {
        heading: 'How this connects to OPT',
        paragraphs: [
          'OPT eligibility assumes you maintained valid F-1 status and met the academic-year and program rules. Unapproved online overloads, a final term that is only online, or a program that never required physical presence can create status problems that surface when a DSO reviews an OPT recommendation or when USCIS adjudicates Form I-765.',
          'Post-completion OPT itself is employment authorization after the program—not permission to complete an entire degree online. If you are already on post-completion OPT, recreational study has separate limits; starting a new degree program can terminate OPT.',
        ],
        links: [
          {
            label: 'Fall out of F-1 status options',
            href: '/blog/fall-out-of-f1-status-options',
          },
          {
            label: 'SEVIS transfer and OPT impact',
            href: '/blog/sevis-transfer-guide-opt-impact',
          },
        ],
      },
      {
        heading: 'Fictional example: Sam builds a “mostly remote” semester',
        paragraphs: [
          'Sam is fictional. He registers for three fully online courses and one hybrid course he never attends in person. His DSO later flags that only limited online credits can count toward full time and that the hybrid course may be treated as online without attendance. Sam adjusts the schedule before the add/drop deadline instead of waiting until an OPT recommendation review.',
        ],
      },
    ],
    checklist: [
      'Ask the DSO which catalog modalities count as online for F-1 rules.',
      'Ensure enough in-person or otherwise countable credits each required term.',
      'Avoid an online-only final required course.',
      'Save syllabi that show required physical attendance for hybrid classes.',
      'Resolve enrollment questions before requesting an OPT I-20.',
    ],
    mistakes: [
      'Assuming every “hybrid” course automatically counts as in-person.',
      'Using COVID-era temporary flexibilities that no longer apply.',
      'Waiting until OPT filing to discover a past online overload.',
    ],
    faq: [
      {
        question: 'Can I finish my last class online and still get OPT?',
        answer:
          'If you need only one course to finish, F-1 rules generally require that course to have a physical presence requirement. Ask your DSO before registering for an online-only final course.',
      },
      {
        question: 'Do online limits apply on post-completion OPT?',
        answer:
          'Post-completion OPT is not a full-course-of-study enrollment period. Starting a new degree or transferring schools can end OPT. Ask the DSO before enrolling in a new program.',
      },
      {
        question: 'Are summer online classes treated the same?',
        answer:
          'If summer is not a required term for you, enrollment rules can differ. If you treat summer as a normal academic term for status, confirm full-time and online-limit rules with the DSO.',
      },
    ],
    sources: [
      gapSources.fullCourse,
      gapSources.enrollment,
      gapSources.optHub,
      source.opt,
    ],
    related: [
      {
        label: 'F-1 status vs I-20 vs I-94',
        href: '/blog/f1-visa-status-i20-i94-differences',
      },
      {
        label: 'Academic probation and OPT',
        href: '/blog/academic-probation-f1-student-opt',
      },
      {
        label: 'Withdrawing from classes on F-1',
        href: '/blog/withdrawing-from-classes-f1-visa',
      },
    ],
  });
