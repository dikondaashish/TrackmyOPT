import { source } from '../shared';
import { gap, gapSources } from './shared';

export const reducedCourseLoadF1OptImpactArticle = gap({
    slug: 'reduced-course-load-f1-opt-impact',
    title:
      'Reduced Course Load (RCL) and OPT: How Part-Time Enrollment Affects Status and Timing',
    seoTitle: 'Reduced Course Load F-1: Impact on OPT Eligibility',
    description:
      'Learn when a DSO-authorized reduced course load keeps F-1 status valid, which RCL reasons are allowed, and how RCL timing interacts with OPT recommendations.',
    category: 'F-1 Compliance',
    tags: [
      'reduced course load',
      'RCL F-1',
      'medical RCL',
      'OPT eligibility',
    ],
    readTime: '10 min read',
    cta: 'opt-timeline',
    image: '/blog/topic-gaps-2026-10/reduced-course-load-f1-opt-impact.webp',
    imageAlt: 'Fictional international student and advisor reviewing a reduced course load authorization form',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'A reduced course load is valid for F-1 status only when your DSO authorizes it in SEVIS for an allowed reason—such as certain academic difficulties, medical conditions, or a final-term reduction when fewer credits remain. Unauthorized part-time enrollment is a status violation and can block OPT. Authorized RCL does not by itself grant work permission; OPT still needs its own recommendation and EAD.',
    keyTakeaways: [
      'RCL must be authorized before you drop below full time.',
      'Medical RCL and academic RCL have different limits and documentation rules.',
      'Final-term RCL cannot normally be online-only.',
    ],
    sections: [
      {
        heading: 'Authorized reasons for RCL',
        paragraphs: [
          'The USCIS Policy Manual and school ISS offices describe common RCL categories: initial academic difficulty (with limits on how often and how long), medical conditions supported by documentation, and a final academic term when you need fewer than a full load to complete the program. Your school may have stricter internal deadlines than the minimum federal framework.',
          'Dropping classes first and asking forgiveness later is not a safe plan. Unauthorized under-enrollment can terminate SEVIS or create a status gap that appears during OPT review.',
        ],
        sources: [gapSources.enrollment, gapSources.fullCourse],
      },
      {
        heading: 'How RCL interacts with OPT timing',
        paragraphs: [
          'OPT still requires a full academic year of study (with limited exceptions defined in the rules) and a proper DSO recommendation. Time spent on authorized RCL is not the same as falling out of status, but it can change when your program end date arrives and when you are ready for post-completion OPT.',
          'If medical RCL pauses progress, ask how the program end date and OPT filing window will move. If you use final-term RCL, confirm that remaining courses meet in-person rules and that the OPT recommendation dates still fit your job plan.',
        ],
        links: [
          {
            label: 'Spring graduates OPT application timing',
            href: '/blog/spring-graduates-opt-application-timing-2026',
          },
          {
            label: 'OPT I-20 30-day rule and I-765 deadline',
            href: '/blog/opt-i20-30-day-rule-i765-deadline',
          },
        ],
      },
      {
        heading: 'Work during RCL',
        paragraphs: [
          'RCL is about enrollment status, not employment authorization. On-campus work, CPT, and OPT each have separate rules. Do not assume that a medical RCL letter allows off-campus work, and do not assume that being below full time automatically starts unemployment counting on OPT—you must already hold the correct EAD category.',
        ],
        note: 'If you are already on post-completion OPT, you are not usually in a full-course RCL situation. Contact the DSO before mixing leave, withdrawal, or new enrollment with OPT.',
      },
      {
        heading: 'Fictional example: Nora’s medical RCL',
        paragraphs: [
          'Nora is fictional. She obtains DSO-authorized medical RCL with supporting documentation for one term, remains in status, and delays her thesis completion. Before requesting OPT, she and the DSO reset the expected program end date and filing calendar so the I-765 window still works for her employer’s start date.',
        ],
      },
    ],
    checklist: [
      'Request RCL authorization from the DSO before dropping below full time.',
      'Save medical or academic documentation the school requires.',
      'Confirm SEVIS shows the authorized RCL reason and dates.',
      'Ask how RCL changes the program end date and OPT calendar.',
      'Verify final-term courses are not online-only if that limit applies.',
    ],
    mistakes: [
      'Under-enrolling without DSO authorization.',
      'Using an expired medical RCL authorization for a later term.',
      'Assuming RCL creates OPT or CPT permission.',
    ],
    faq: [
      {
        question: 'Does medical RCL stop my OPT unemployment clock?',
        answer:
          'RCL applies to enrolled students maintaining status with DSO authorization. Post-completion OPT unemployment rules are separate. If you are on OPT, ask the DSO how leave or inability to work is treated for reporting and unemployment counting.',
      },
      {
        question: 'Can I get OPT after multiple RCL terms?',
        answer:
          'Authorized RCL can keep status valid, but repeated or improper RCL, or failure to complete the program, can create problems. Have the DSO review your full SEVIS history before filing.',
      },
      {
        question: 'Is final-quarter part-time enrollment automatic?',
        answer:
          'No. Final-term RCL still requires DSO authorization and must meet the school’s and federal rules, including limits on online-only remaining coursework.',
      },
    ],
    sources: [gapSources.enrollment, gapSources.fullCourse, source.opt],
    related: [
      {
        label: 'Academic probation and OPT',
        href: '/blog/academic-probation-f1-student-opt',
      },
      {
        label: 'Withdrawing from classes on F-1',
        href: '/blog/withdrawing-from-classes-f1-visa',
      },
      {
        label: 'Fall out of F-1 status options',
        href: '/blog/fall-out-of-f1-status-options',
      },
    ],
  });
