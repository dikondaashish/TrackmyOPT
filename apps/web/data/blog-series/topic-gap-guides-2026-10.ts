import { defineArticle, source, standardRelated } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

const gapSources = {
  practicalTraining: {
    label: 'USCIS Policy Manual: Practical Training (Vol. 2, Part F, Ch. 5)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-5',
  },
  enrollment: {
    label: 'USCIS Policy Manual: Courses, Full Course of Study, and RCL (Vol. 2, Part F, Ch. 3)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-2-part-f-chapter-3',
  },
  fullCourse: {
    label: 'Full Course of Study',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/students/study/full-course-of-study',
  },
  optHub: {
    label: 'F-1 Optional Practical Training (OPT)',
    publisher: 'Study in the States',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-optional-practical-training-opt',
  },
  h1bPortability: {
    label: 'H-1B Specialty Occupations',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  noidRfe: {
    label: '8 CFR 103.2(b)(8): Requests for evidence and notices of intent to deny',
    publisher: 'eCFR / Office of the Federal Register',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-A/part-103/section-103.2',
  },
  itin: {
    label: 'Individual Taxpayer Identification Number (ITIN)',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/individual-taxpayer-identification-number',
  },
  ssn: {
    label: 'International Students and Social Security Numbers',
    publisher: 'Social Security Administration',
    url: 'https://www.ssa.gov/pubs/EN-05-10181.pdf',
  },
  cip: {
    label: 'STEM Designated Degree Program List',
    publisher: 'ICE / DHS',
    url: 'https://www.ice.gov/doclib/sevis/pdf/stemList2024.pdf',
  },
} satisfies Record<string, ArticleSource>;

function gap(
  article: Omit<
    ResearchArticle,
    'publishedDate' | 'modifiedDate' | 'showContents'
  >
): ResearchArticle {
  return defineArticle({
    ...article,
    publishedDate: '2026-10-16',
    modifiedDate: '2026-10-16',
    showContents: true,
  });
}

export const topicGapGuidesOctober2026: ResearchArticle[] = [
  gap({
    slug: 'phd-dissertation-opt-eligibility-timing',
    title:
      'PhD and Dissertation OPT: When You Can File Pre-Completion vs Post-Completion',
    seoTitle: 'PhD Dissertation OPT Timing: Pre- vs Post-Completion',
    description:
      'Learn how PhD coursework completion, dissertation stages, and DSO program-end dates affect pre-completion and post-completion OPT eligibility for F-1 doctoral students.',
    category: 'OPT Basics',
    tags: [
      'PhD OPT',
      'dissertation OPT',
      'pre-completion OPT',
      'doctoral students',
    ],
    readTime: '11 min read',
    cta: 'opt-timeline',
    directAnswer:
      'PhD students may become eligible for OPT after one full academic year in an SEVP-certified program, but the pre-completion versus post-completion label depends on whether the DSO treats your program as still in progress or completed. Many schools allow doctoral students who finished required coursework and are writing a dissertation to request either pre-completion OPT (often part-time while enrolled) or post-completion OPT once the program-end date and recommendation support that classification. Your school’s completion definition—not a social-media rule of thumb—controls the I-20 recommendation.',
    keyTakeaways: [
      'OPT is generally available once per higher education level, including a doctoral level.',
      'Coursework finished does not automatically mean post-completion OPT; the DSO’s program-end and recommendation matter.',
      'Full-time CPT of 12 months or more at the same degree level can make you ineligible for OPT at that level.',
    ],
    sections: [
      {
        heading: 'What “completion” means for a PhD',
        paragraphs: [
          'USCIS and SEVP treat OPT as practical training tied to a degree level. For doctoral students, schools differ on whether dissertation-only enrollment counts as still pursuing the degree or as having completed coursework for post-completion purposes. Ask your DSO which SEVIS recommendation they can issue for your exact stage: remaining required courses, candidacy, dissertation writing, defense scheduled, or degree conferred.',
          'Do not pick a start date until the DSO confirms the recommendation type. Filing the wrong category can produce an RFE, delay, or denial.',
        ],
        bullets: [
          'Confirm one academic year of full-time study already completed',
          'Ask whether remaining registration is dissertation-only or required coursework',
          'Confirm the program end date the DSO will enter on the OPT I-20',
          'Separate academic defense deadlines from USCIS filing windows',
        ],
        sources: [gapSources.optHub, gapSources.practicalTraining],
      },
      {
        heading: 'Pre-completion vs post-completion for doctoral work',
        paragraphs: [
          'Pre-completion OPT is used while you are still enrolled in the program. While school is in session, pre-completion OPT is limited to part-time work (20 hours or fewer per week). Full-time pre-completion is generally limited to official school breaks.',
          'Post-completion OPT is for after the program end date reflected for the recommendation. Post-completion employment must be at least 20 hours per week and related to the major. Time used in pre-completion OPT reduces the 12-month pool available after completion at that level.',
        ],
        note: 'If you already used months of pre-completion OPT, ask the DSO to calculate remaining days before you plan a 12-month post-completion EAD.',
        links: [
          {
            label: 'Pre-completion OPT vs CPT',
            href: '/blog/pre-completion-opt-vs-cpt',
          },
          {
            label: 'What counts as 20 hours on OPT',
            href: '/blog/what-counts-as-20-hours-on-opt',
          },
        ],
      },
      {
        heading: 'Fictional example: Mei finishes coursework mid-year',
        paragraphs: [
          'Mei is fictional. She finished PhD coursework in May 2026 and is writing her dissertation with continued enrollment. Her DSO explains two paths: (1) part-time pre-completion OPT while she remains enrolled, or (2) post-completion OPT if the school can set a program-end date consistent with its academic rules and SEVIS practice. Mei chooses based on whether she still needs full-time enrollment and funding, not based on a friend’s filing at another university.',
        ],
      },
      {
        heading: 'STEM OPT after a doctoral STEM degree',
        paragraphs: [
          'If the doctoral CIP code is on the STEM Designated Degree Program List and you meet employer and Form I-983 requirements, you may later request a STEM OPT extension after a qualifying post-completion OPT period. A non-STEM master’s followed by a STEM PhD follows the CIP and degree that support the STEM recommendation—do not assume every prior degree transfers.',
        ],
        links: [
          {
            label: 'Is my degree STEM eligible? CIP code guide',
            href: '/blog/is-my-degree-stem-eligible-cip-code',
          },
          {
            label: 'I-983 training plan guide',
            href: '/blog/i-983-training-plan-guide',
          },
        ],
      },
    ],
    checklist: [
      'Meet with the DSO before picking an OPT start date or category.',
      'List all full-time CPT authorizations at the doctoral level.',
      'Confirm remaining OPT months if any pre-completion time was used.',
      'Keep offer letters that show hours and degree-related duties.',
      'Calendar the I-765 filing window from the OPT I-20 recommendation date.',
    ],
    mistakes: [
      'Assuming “ABD” automatically equals post-completion OPT at every school.',
      'Filing post-completion OPT while the school still treats you as enrolled without confirming the recommendation.',
      'Ignoring prior full-time CPT that may block OPT at the same level.',
    ],
    faq: [
      {
        question: 'Can I work full-time on OPT while finishing my dissertation?',
        answer:
          'Only if you have the correct authorization category and hour rules for that stage. Pre-completion while school is in session is generally part-time; post-completion requires the post-completion EAD and at least 20 hours per week. Confirm with your DSO.',
      },
      {
        question: 'Do I get a new 12 months of OPT after a PhD if I already used OPT after my master’s?',
        answer:
          'Generally yes at a higher education level, subject to eligibility rules, prior CPT at that level, and proper DSO recommendation. Prior OPT at a lower level does not usually consume the doctoral-level allotment.',
      },
      {
        question: 'Does defending my thesis automatically start OPT?',
        answer:
          'No. OPT requires a DSO recommendation and a USCIS-approved EAD for the authorized dates. A defense date alone is not work authorization.',
      },
    ],
    sources: [
      gapSources.optHub,
      gapSources.practicalTraining,
      source.opt,
      gapSources.cip,
    ],
    related: [
      {
        label: 'OPT application checklist 2026',
        href: '/blog/opt-application-checklist-2026',
      },
      {
        label: 'Spring graduates OPT timing',
        href: '/blog/spring-graduates-opt-application-timing-2026',
      },
      {
        label: 'Second master’s OPT eligibility',
        href: '/blog/second-masters-opt-eligibility',
      },
      ...standardRelated.slice(0, 1),
    ],
  }),

  gap({
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
  }),

  gap({
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
  }),

  gap({
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
  }),

  gap({
    slug: 'h1b-transfer-portability-while-on-opt',
    title:
      'Changing Employers While on OPT or Early H-1B: Transfer, Portability, and New Petitions',
    seoTitle: 'H-1B Transfer vs New Petition While on OPT',
    description:
      'Clarify the difference between an H-1B transfer/portability and a new H-1B petition while you are still on OPT, including when you can start work for a new employer.',
    category: 'H-1B',
    tags: [
      'H-1B transfer',
      'H-1B portability',
      'change employer OPT',
      'AC21',
    ],
    readTime: '11 min read',
    cta: 'sponsors',
    directAnswer:
      '“H-1B transfer” usually means a new employer files an H-1B petition so you can move into or between H-1B employment. AC21 portability that lets some workers start with a new H-1B employer upon a nonfrivolous filing generally applies when you are already in H-1B status (with additional conditions). If you are still only on OPT, a new employer typically needs its own petition strategy—often a change of status or consular path—and you may continue OPT work for that employer only if the job is degree-related and your OPT EAD remains valid, plus any STEM reporting rules.',
    keyTakeaways: [
      'OPT employment changes and H-1B petition changes are different legal tracks.',
      'Portability rules for starting work on a pending H-1B transfer generally require already being in H-1B status.',
      'Cap-exempt vs cap-subject filings change timing and lottery risk.',
    ],
    sections: [
      {
        heading: 'Still on OPT: changing jobs is an OPT problem first',
        paragraphs: [
          'On post-completion OPT you may change employers if the new role is directly related to your major, you report updates as required, and you stay within unemployment limits. STEM OPT adds E-Verify, Form I-983, and material-change reporting duties before or when you switch.',
          'A promise that “our lawyer will file H-1B” does not replace OPT compliance. Keep working only within OPT rules until an H-1B approval or lawful portability condition actually authorizes H-1B employment.',
        ],
        links: [
          {
            label: 'Change employers on STEM OPT',
            href: '/blog/change-employers-stem-opt',
          },
          {
            label: 'Change employer while STEM OPT pending',
            href: '/blog/change-employer-stem-opt-pending',
          },
          {
            label: 'OPT reporting requirements and DSO',
            href: '/blog/opt-reporting-requirements-dso',
          },
        ],
      },
      {
        heading: 'When H-1B “transfer” / portability language applies',
        paragraphs: [
          'Once you are in H-1B status, a new employer may file a petition and, when portability conditions are met, you may be able to begin working for that new petitioner upon a nonfrivolous filing rather than waiting for approval. Those conditions and evidence standards are technical—paystubs, prior status maintenance, and petition details matter.',
          'If you are still F-1/OPT and have never been admitted or changed to H-1B, you are usually looking at a new H-1B petition with COS or consular processing—not classic portability from an existing H-1B period of stay.',
        ],
        sources: [gapSources.h1bPortability, source.capgap],
      },
      {
        heading: 'Cap-subject vs cap-exempt moves',
        paragraphs: [
          'Moving to a cap-exempt employer can sometimes allow an H-1B filing outside the lottery, subject to the employer’s qualifying status and the role. Moving from cap-exempt to cap-subject employment can reintroduce lottery and timing issues. Verify the legal entity on the petition, not only the brand name on your offer letter.',
        ],
        links: [
          {
            label: 'Find cap-exempt H-1B employers',
            href: '/blog/find-cap-exempt-h1b-employers',
          },
          {
            label: 'Top H-1B sponsor companies 2026',
            href: '/blog/top-h1b-sponsor-companies-2026',
          },
        ],
      },
      {
        heading: 'Fictional example: Priya’s startup offer',
        paragraphs: [
          'Priya is fictional and currently on STEM OPT. A startup offers to “transfer her H-1B,” but she has never held H-1B status. Counsel explains the company must file a new petition (likely COS or consular) and that until H-1B is authorized she may work there only under STEM OPT rules with a new I-983. The word “transfer” in the offer email was recruiting language, not a legal category she already possessed.',
        ],
      },
    ],
    checklist: [
      'Write down your current status: OPT, STEM OPT, or H-1B.',
      'Ask whether the new filing is cap-subject or cap-exempt.',
      'If still on OPT/STEM OPT, complete reporting and I-983 steps before starting.',
      'If already H-1B, ask counsel whether portability conditions are met before starting.',
      'Keep copies of every I-797 and employment verification letter.',
    ],
    mistakes: [
      'Starting H-1B work on a pending petition while still only on OPT and calling it portability.',
      'Ignoring STEM I-983 updates when changing employers.',
      'Assuming any new employer can “transfer” without a new petition.',
    ],
    faq: [
      {
        question: 'Can I work for the new H-1B employer on OPT while the petition is pending?',
        answer:
          'Possibly under OPT/STEM OPT rules if the job is degree-related and you meet reporting requirements. That is OPT work, not H-1B portability. Confirm both tracks separately.',
      },
      {
        question: 'Does an H-1B transfer reset my OPT unemployment days?',
        answer:
          'No. Unemployment counting follows OPT/STEM OPT rules while you remain in those categories. H-1B status ends the OPT employment framework once you properly begin H-1B.',
      },
      {
        question: 'Can I hold two H-1B petitions?',
        answer:
          'Concurrent or sequential filings are sometimes used, but status, cap, and work-start rules are fact-specific. Get counsel before relying on multiple pending petitions.',
      },
    ],
    sources: [gapSources.h1bPortability, source.capgap, source.opt, source.stem],
    related: [
      { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
      {
        label: 'H-1B COS vs consular processing from OPT',
        href: '/blog/h1b-change-of-status-vs-consular-processing-opt',
      },
      {
        label: 'Laid off on STEM OPT',
        href: '/blog/laid-off-on-stem-opt',
      },
    ],
  }),

  gap({
    slug: 'uscis-noid-response-guide-opt',
    title:
      'USCIS NOID on an OPT or STEM OPT Case: How to Read and Respond',
    seoTitle: 'USCIS NOID Response Guide for OPT / I-765',
    description:
      'Understand a Notice of Intent to Deny (NOID) on Form I-765 for OPT or STEM OPT: deadlines, how it differs from an RFE, and how to submit a complete response.',
    category: 'USCIS',
    tags: ['NOID USCIS', 'OPT denial risk', 'I-765 NOID', 'RFE vs NOID'],
    readTime: '10 min read',
    cta: 'case-status',
    directAnswer:
      'A Notice of Intent to Deny (NOID) means USCIS is prepared to deny your filing unless you overcome the stated grounds with a timely, complete response. For many immigration filings, the NOID response period cannot exceed 30 days, and the deadline printed on your notice controls. A NOID is more serious than a routine RFE: treat it as an urgent, organized rebuttal with evidence—not a partial upload.',
    keyTakeaways: [
      'The notice deadline controls; do not assume you can get an extension.',
      'Answer every stated ground of intended denial.',
      'Keep proof of timely delivery or online upload.',
    ],
    sections: [
      {
        heading: 'NOID vs RFE vs denial',
        paragraphs: [
          'An RFE asks for missing or additional evidence and often appears when the officer believes the case could still be approved with more documents. A NOID states that the officer intends to deny and explains why. A denial is a decision; appeal or refiling options depend on the form and basis.',
          'USCIS policy changes around denying without first issuing an RFE or NOID make complete initial filings even more important—but if you receive a NOID, focus on that notice’s text and deadline.',
        ],
        links: [
          {
            label: 'USCIS deny without RFE policy 2026',
            href: '/blog/uscis-deny-without-rfe-policy-2026',
          },
          {
            label: 'OPT application denied',
            href: '/blog/opt-application-denied',
          },
        ],
        sources: [gapSources.noidRfe],
      },
      {
        heading: 'Build a complete response package',
        paragraphs: [
          'Copy the NOID’s numbered issues into a checklist. For each issue, attach evidence and a short written explanation that cites the document. Common OPT/STEM OPT themes include identity documents, degree evidence, STEM CIP and I-983 problems, employer E-Verify issues, photographs, signatures, or status maintenance questions.',
          'Do not send a placeholder “more to follow” package if the notice expects a full response by the deadline. Incomplete responses can still lead to denial.',
        ],
        bullets: [
          'Cover letter mapping each NOID point to exhibits',
          'Legible copies of requested civil and academic documents',
          'Employer letters on letterhead when the issue is job or training related',
          'SEVIS/I-20 pages that match the claim you are making',
        ],
      },
      {
        heading: 'Fictional example: Leo’s STEM I-983 NOID',
        paragraphs: [
          'Leo is fictional. His STEM OPT NOID questions whether the Form I-983 goals are measurable and whether the employer is enrolled in E-Verify. He and the employer revise the training plan, attach E-Verify documentation, and submit a point-by-point response before the printed deadline rather than arguing generically that “the job is STEM.”',
        ],
        links: [
          {
            label: 'I-983 training plan guide',
            href: '/blog/i-983-training-plan-guide',
          },
          {
            label: 'Employer refuses Form I-983',
            href: '/blog/employer-refuses-form-i983',
          },
        ],
      },
    ],
    checklist: [
      'Calendar the exact response deadline from the NOID.',
      'List every intended denial ground in a response outline.',
      'Gather exhibits and label them to match the outline.',
      'Have your DSO or counsel review status-related allegations.',
      'Retain upload receipts or mailing proof.',
    ],
    mistakes: [
      'Missing the NOID deadline while waiting for “more time.”',
      'Answering only the easiest issue and ignoring others.',
      'Submitting unreadable scans or unlabeled bulk PDFs.',
    ],
    faq: [
      {
        question: 'Is a NOID the same as a denial?',
        answer:
          'No. A NOID is a warning that denial is intended unless you overcome the issues. You still have a chance to respond before a final denial decision.',
      },
      {
        question: 'Can I get more than 30 days?',
        answer:
          'Regulations limit NOID response periods and generally do not allow extensions. Follow the date on your notice and seek counsel immediately if the deadline is close.',
      },
      {
        question: 'Should I also upload unsolicited extra evidence after responding?',
        answer:
          'Focus on a complete timely response to the NOID. Unsolicited evidence rules differ; see our unsolicited evidence guide and prefer counsel for strategy.',
      },
    ],
    sources: [gapSources.noidRfe, source.i765, source.opt],
    related: [
      {
        label: 'USCIS unsolicited evidence on OPT',
        href: '/blog/uscis-unsolicited-evidence-opt',
      },
      {
        label: 'Track USCIS case status',
        href: '/blog/uscis-case-status-tracking-guide',
      },
      {
        label: 'myProgress taking longer than expected',
        href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
      },
    ],
  }),

  gap({
    slug: 'itin-vs-ssn-f1-opt-students',
    title: 'ITIN vs SSN for F-1 and OPT Students: Which Tax ID You Need',
    seoTitle: 'ITIN vs SSN for F-1 / OPT Students',
    description:
      'Learn when F-1 students need a Social Security number versus an ITIN, how OPT work authorization connects to SSN applications, and common tax-filing mix-ups.',
    category: 'Tax & Finance',
    tags: ['ITIN', 'SSN F-1', 'OPT taxes', 'Form W-7'],
    readTime: '9 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A Social Security number (SSN) is for people authorized to work in the United States and is what most OPT employees use for payroll. An Individual Taxpayer Identification Number (ITIN) is a tax processing number for people who need to file or report U.S. taxes but are not eligible for an SSN. If you are eligible for an SSN, you generally should not apply for an ITIN instead. Work authorization documents and SSA rules control SSN issuance—not a bank’s preference alone.',
    keyTakeaways: [
      'SSN ≠ immigration status proof; it is a tax and wage-reporting number.',
      'ITIN does not authorize employment.',
      'Many F-1 students need Form 8843 even with little or no U.S. income—ask a tax professional about your year.',
    ],
    sections: [
      {
        heading: 'When to apply for an SSN',
        paragraphs: [
          'F-1 students commonly apply for an SSN after they have authorization for on-campus work, CPT, or OPT and the required documentation for the Social Security Administration. For OPT, that usually includes passport, I-20, I-94, and the EAD (or other acceptable evidence per current SSA instructions).',
          'Employers use the SSN for wage reporting. Getting an SSN does not extend OPT or replace SEVIS reporting.',
        ],
        links: [
          {
            label: 'How to get an SSN on OPT',
            href: '/blog/how-to-get-ssn-on-opt',
          },
          {
            label: 'First U.S. paycheck and W-4',
            href: '/blog/first-us-paycheck-deductions-w4',
          },
        ],
        sources: [gapSources.ssn],
      },
      {
        heading: 'When an ITIN appears instead',
        paragraphs: [
          'An ITIN may be relevant when someone must comply with U.S. tax filing or reporting rules but is not eligible for an SSN—for example certain dependents, treaty claimants, or students with specific filing needs before work authorization. ITIN applications generally use Form W-7 and supporting identification documents.',
          'If you later become eligible for an SSN, IRS guidance describes transitioning away from the ITIN for wage reporting. Do not hold two active identification strategies casually; follow IRS instructions.',
        ],
        sources: [gapSources.itin, source.pub519],
      },
      {
        heading: 'Fictional example: bank account vs payroll',
        paragraphs: [
          'Daniel is fictional. A bank asks for a U.S. tax ID to open an account before his OPT EAD arrives. A friend tells him to get an ITIN immediately. Daniel confirms with ISS and a tax preparer that he will be SSN-eligible once the EAD arrives, so he avoids an unnecessary ITIN filing that would not authorize work and might confuse later payroll onboarding.',
        ],
      },
    ],
    checklist: [
      'Confirm whether you are eligible for an SSN before filing Form W-7.',
      'Bring the documents SSA currently lists for F-1/OPT applicants.',
      'Give payroll the SSN only through secure employer channels.',
      'Keep ITIN letters separate from EAD/SSN cards.',
      'Use a qualified tax preparer for 1040-NR vs 1040 questions.',
    ],
    mistakes: [
      'Thinking an ITIN authorizes OPT employment.',
      'Skipping SSA rules and using a made-up number on a W-4.',
      'Sharing SSN images in public chats or unsecured email.',
    ],
    faq: [
      {
        question: 'Can I start OPT work without an SSN?',
        answer:
          'Work authorization comes from the EAD and OPT rules, not the SSN. Payroll may need an SSN soon after hire; follow SSA and employer instructions. Do not work before your EAD start date.',
      },
      {
        question: 'Do F-2 dependents get SSNs?',
        answer:
          'F-2 dependents are generally not employment-authorized and usually are not eligible for SSNs for work. Tax ID needs can differ; verify with SSA/IRS guidance for the dependent’s situation.',
      },
      {
        question: 'Is an ITIN required to file Form 8843?',
        answer:
          'Form 8843 filing requirements depend on your facts. Many students file 8843 with or without wage income. Confirm current IRS instructions for your tax year.',
      },
    ],
    sources: [
      gapSources.ssn,
      gapSources.itin,
      source.pub519,
      source.form8843,
    ],
    related: [
      {
        label: 'F-1 student tax filing guide 2026',
        href: '/blog/f1-student-tax-filing-guide-2026',
      },
      {
        label: 'Form 8843 for F-1 students with zero income',
        href: '/blog/form-8843-f1-students-zero-income',
      },
      {
        label: '1040-NR vs 1040 five-calendar-year rule',
        href: '/blog/1040nr-vs-1040-five-calendar-year-rule-f1',
      },
    ],
  }),

  gap({
    slug: 'dual-degree-joint-program-opt-eligibility',
    title:
      'Dual Degrees and Joint Programs: Which Major Controls OPT and STEM OPT',
    seoTitle: 'Dual Degree / Joint Program OPT and STEM Eligibility',
    description:
      'Figure out how double majors, dual degrees, and joint programs affect OPT degree-level limits, CIP codes, and STEM OPT recommendations.',
    category: 'STEM OPT',
    tags: [
      'dual degree OPT',
      'double major OPT',
      'joint program',
      'CIP code STEM',
    ],
    readTime: '10 min read',
    cta: 'opt-timeline',
    directAnswer:
      'OPT is tied to your education level and to employment directly related to your major area of study. Dual degrees, double majors, and joint programs can create confusion about which CIP code appears on the I-20, which degree level consumes the 12-month OPT allotment, and which credential supports a STEM OPT extension. The DSO’s SEVIS record and the CIP on the recommendation—not marketing program names—control the analysis.',
    keyTakeaways: [
      'Confirm whether you are completing one level or two sequential levels.',
      'STEM OPT requires a qualifying STEM CIP on the relevant degree.',
      'Job duties must relate to the major used for the OPT recommendation.',
    ],
    sections: [
      {
        heading: 'Dual degree vs double major vs joint program',
        paragraphs: [
          'A double major often remains one degree level (for example, one bachelor’s) with two fields. A dual degree may confer two credentials that might be at the same or different levels depending on the school. Joint or pathway programs may share coursework across institutions or levels.',
          'Ask the registrar and DSO: How many Form I-20 program levels exist? Which CIP codes are assigned? When does each program end for SEVIS?',
        ],
        sources: [gapSources.optHub, gapSources.cip],
      },
      {
        heading: 'OPT months and degree level',
        paragraphs: [
          'Students are generally eligible for 12 months of OPT per higher education level. Completing two majors at the same level usually does not create two separate 12-month allotments. Completing a new higher level (bachelor’s then master’s) typically creates a new allotment, subject to CPT and other eligibility rules.',
          'If your school splits OPT across credentials at the same level, that is a SEVIS/school procedure question—get it in writing before filing I-765.',
        ],
        links: [
          {
            label: 'Second master’s OPT eligibility',
            href: '/blog/second-masters-opt-eligibility',
          },
          {
            label: 'Changing majors and OPT impact',
            href: '/blog/changing-majors-f1-student-opt-impact',
          },
        ],
      },
      {
        heading: 'STEM OPT: which CIP wins',
        paragraphs: [
          'STEM OPT extensions require a degree with a CIP code on the STEM Designated Degree Program List, plus an E-Verify employer and Form I-983. If only one of two fields is STEM, you generally need the STEM credential and CIP to support the STEM recommendation. A non-STEM major’s job offer cannot be propped up by an unused STEM major on a transcript alone without the proper SEVIS/STEM recommendation basis.',
        ],
        links: [
          {
            label: 'Is my degree STEM eligible?',
            href: '/blog/is-my-degree-stem-eligible-cip-code',
          },
          {
            label: 'OPT job related to degree',
            href: '/blog/opt-job-related-to-degree',
          },
        ],
      },
      {
        heading: 'Fictional example: dual MBA / MS',
        paragraphs: [
          'Aisha is fictional and finishes a joint MBA/MS program. The MS CIP is STEM-listed; the MBA CIP is not. For STEM OPT she and the DSO confirm the STEM MS is the basis for the extension and that her training plan duties relate to that STEM field—not only to general MBA coursework.',
        ],
      },
    ],
    checklist: [
      'List every program level and CIP on your I-20 history.',
      'Ask which credential will support the OPT recommendation.',
      'If pursuing STEM OPT, confirm the STEM CIP and diploma/transcript evidence.',
      'Align job duties with the major used for OPT/STEM OPT.',
      'Keep both diplomas/transcripts when two credentials are awarded.',
    ],
    mistakes: [
      'Assuming two majors equal two OPT periods at the same level.',
      'Using a STEM-sounding concentration that is not the CIP on SEVIS.',
      'Writing an I-983 for duties unrelated to the STEM major.',
    ],
    faq: [
      {
        question: 'Can I use my STEM minor for STEM OPT?',
        answer:
          'STEM OPT is based on a qualifying degree CIP, not a minor alone. Confirm the listed CIP on the degree that will support the recommendation.',
      },
      {
        question: 'What if my joint program has two schools?',
        answer:
          'The SEVP-certified school that maintains your SEVIS record and issues the OPT recommendation is critical. Clarify which school’s DSO recommends OPT before filing.',
      },
      {
        question: 'Do I file two I-765 applications for a dual degree?',
        answer:
          'Usually you file based on the recommendation the DSO issues for the relevant program completion. Do not invent a second filing without school guidance.',
      },
    ],
    sources: [gapSources.optHub, gapSources.cip, source.stem, source.opt],
    related: [
      {
        label: 'STEM OPT extension guide',
        href: '/blog/stem-opt-extension-guide',
      },
      {
        label: 'OPT for non-STEM majors',
        href: '/blog/opt-non-stem-majors-guide',
      },
      {
        label: 'MBA students career paths on OPT',
        href: '/blog/opt-mba-students-career-paths',
      },
    ],
  }),

  gap({
    slug: 'part-time-opt-complete-guide',
    title: 'Part-Time OPT Explained: Pre-Completion Limits and the 20-Hour Rule',
    seoTitle: 'Part-Time OPT Guide: Pre-Completion and 20-Hour Rules',
    description:
      'Learn when F-1 students can work part-time on OPT, how pre-completion part-time limits work while school is in session, and why post-completion OPT requires 20+ hours.',
    category: 'OPT Basics',
    tags: [
      'part-time OPT',
      'pre-completion OPT',
      '20 hour OPT rule',
      'OPT unemployment',
    ],
    readTime: '9 min read',
    cta: 'unemployment',
    directAnswer:
      'Part-time OPT usually refers to pre-completion OPT while you are still enrolled: during the academic term, pre-completion OPT is limited to 20 hours per week or fewer. After you begin post-completion OPT, employment must be at least 20 hours per week in a job related to your major; dropping below that can start or continue unemployment-day counting. “Part-time” in an offer letter does not override these immigration hour rules.',
    keyTakeaways: [
      'Pre-completion part-time ≠ post-completion under-20-hours.',
      'Post-completion OPT has a 20-hour minimum for qualifying employment.',
      'Pre-completion time used reduces remaining post-completion months.',
    ],
    sections: [
      {
        heading: 'Pre-completion OPT while school is in session',
        paragraphs: [
          'If you have a pre-completion OPT EAD and school is in session, you are generally limited to part-time work (20 hours or fewer per week). During official school breaks, full-time pre-completion work may be allowed. Always match the dates on your EAD and the school calendar.',
          'CPT is a separate authorization. Do not combine assumptions across CPT and OPT hour rules without DSO confirmation.',
        ],
        links: [
          {
            label: 'Pre-completion OPT vs CPT',
            href: '/blog/pre-completion-opt-vs-cpt',
          },
        ],
        sources: [gapSources.practicalTraining, gapSources.optHub],
      },
      {
        heading: 'Post-completion OPT and the 20-hour floor',
        paragraphs: [
          'On post-completion OPT, qualifying employment is generally at least 20 hours per week. Multiple jobs can sometimes combine to meet the threshold if each is related to your major and properly reported. Falling below 20 hours can consume unemployment days toward the 90-day (or STEM 150-day) limit.',
        ],
        links: [
          {
            label: 'What counts as 20 hours on OPT',
            href: '/blog/what-counts-as-20-hours-on-opt',
          },
          {
            label: '90-day unemployment rule',
            href: '/blog/90-day-unemployment-rule-opt',
          },
          {
            label: 'Multiple jobs on OPT',
            href: '/blog/multiple-jobs-opt-two-employers',
          },
        ],
      },
      {
        heading: 'Fictional example: internship that “goes part-time”',
        paragraphs: [
          'Jonas is fictional and on post-completion OPT. His internship cuts him to 15 hours per week. Unless he adds related work to reach 20 hours or accepts unemployment-day counting, he risks burning OPT unemployment. The employer’s “part-time intern” label does not create a special immigration exception.',
        ],
      },
    ],
    checklist: [
      'Confirm whether your EAD is pre-completion or post-completion.',
      'Map weekly hours to the school-in-session calendar if pre-completion.',
      'Keep paystubs or hour logs that show the 20-hour threshold when required.',
      'Report employer and hour changes through the required portal/DSO process.',
      'Track unemployment days if hours drop below 20 on post-completion OPT.',
    ],
    mistakes: [
      'Working full-time on pre-completion OPT during the academic term.',
      'Assuming unpaid or volunteer roles automatically satisfy hour rules.',
      'Ignoring that pre-completion months reduce post-completion availability.',
    ],
    faq: [
      {
        question: 'Can post-completion OPT be part-time?',
        answer:
          'Post-completion employment must generally be at least 20 hours per week. Less than that typically does not qualify as employment for stopping the unemployment clock.',
      },
      {
        question: 'Do two 10-hour jobs count?',
        answer:
          'They may combine to meet 20 hours if both are related to your major and correctly reported. Keep clear records for each employer.',
      },
      {
        question: 'Does STEM OPT use the same 20-hour idea?',
        answer:
          'STEM OPT also expects qualifying engagement with the employer under the training plan and hour expectations used for unemployment rules. Follow STEM reporting and I-983 duties.',
      },
    ],
    sources: [gapSources.practicalTraining, gapSources.optHub, source.opt],
    related: [
      {
        label: 'Volunteer work and OPT unemployment',
        href: '/blog/volunteer-work-opt-employment-rules',
      },
      {
        label: 'When the OPT unemployment clock starts',
        href: '/blog/when-does-opt-unemployment-clock-start',
      },
      {
        label: 'OPT unemployment days calculator guide',
        href: '/blog/opt-unemployment-days-calculator-guide',
      },
    ],
  }),

  gap({
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
  }),
];
