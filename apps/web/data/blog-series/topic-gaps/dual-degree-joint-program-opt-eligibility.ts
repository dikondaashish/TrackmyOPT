import { source } from '../shared';
import { gap, gapSources } from './shared';

export const dualDegreeJointProgramOptEligibilityArticle = gap({
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
    image: '/blog/topic-gaps-2026-10/dual-degree-joint-program-opt-eligibility.webp',
    imageAlt: 'Fictional dual-degree graduate reviewing two diplomas and CIP program codes',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
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
  });
