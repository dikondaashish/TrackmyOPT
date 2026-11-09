import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// The exact SEVP Portal field text "explain how this job relates to the
// degree that qualified you for this opt" (59 impressions at position 1.9)
// and "relation to field of study: *required explain how this job
// relates..." (45) had no page with worked answers. Every rule below was
// checked on 2026-11-09 against the SEVP policy guidance of September 27,
// 2019 (direct relationship), the SEVP Portal Student User Guide (revision
// of September 5, 2024), 8 CFR 214.2(f) and the Study in the States OPT
// page. SEVP does not publish a character limit for the field, so none is
// stated. The eight sample answers are written for this guide; they are not
// SEVP text.

const src = {
  directGuidance: {
    label:
      'SEVP Policy Guidance: Practical Training, Determining a Direct Relationship Between Employment and a Student’s Major Area of Study (September 27, 2019)',
    publisher: 'ICE Student and Exchange Visitor Program',
    url: 'https://www.ice.gov/doclib/sevis/pdf/optDirectlyRelatedGuidance.pdf',
  },
  portalGuide: {
    label: 'SEVP Portal Student User Guide',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/assets/SEVP%20Portal%20Student%20User%20Guide.pdf',
  },
  cfr2142: {
    label: '8 CFR 214.2(f): F-1 students, including practical training',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  sitsOpt: {
    label: 'F-1 Optional Practical Training (OPT)',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-optional-practical-training-opt',
  },
  practicalTraining: {
    label: 'Practical Training',
    publisher: 'ICE Student and Exchange Visitor Program',
    url: 'https://www.ice.gov/sevis/practical-training',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'explain-how-job-relates-to-degree-opt-examples';

export const jobRelatedToDegreeAnswers: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'Explain How This Job Relates to the Degree That Qualified You for This OPT: What to Write, With 8 Examples',
  seoTitle: 'How Your Job Relates to Your Degree: 8 OPT Answer Examples',
  description:
    'What to write in the SEVP Portal "Relation to Field of Study" field: the legal standard, the five details SEVP asks for, and eight sample answers by major to adapt for your own job.',
  category: 'OPT Rules',
  tags: [
    'relation to field of study',
    'SEVP Portal',
    'OPT directly related',
    'OPT employer reporting',
    'explain how job relates to degree',
    'OPT examples',
  ],
  readTime: '9 min read',
  publishedDate: '2026-11-04',
  modifiedDate: '2026-11-09',
  showContents: true,
  cta: 'opt-timeline',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: how to explain in the SEVP Portal how your OPT job relates to your degree, with sample answers by major.',
  imageCaption:
    'SEVP asks for a short written explanation that links your daily duties to your degree. Generated from the SEVP guidance described in this guide.',
  directAnswer:
    'The SEVP Portal field "Relation to Field of Study: Explain how this job relates to the degree that qualified you for this OPT" is required when you add an employer. Write a short paragraph with your job title, employer, major, whether you work full time or your average weekly hours, and your regular duties. Then name the courses or skills from your degree that those duties use.',
  keyTakeaways: [
    'OPT work must be directly related to your major area of study under 8 CFR 214.2(f)(10)(ii)(A).',
    'SEVP guidance asks for five details: job title, employer name, major, full time or average weekly hours, and a brief explanation linking your duties to your degree.',
    'For this SEVP policy, full time means 20 hours or more per week.',
    'A matching company name is not enough. SEVP says students must describe their duties and explain how those duties relate to their studies.',
    'Students on STEM OPT cannot add employers in the Portal. The DSO enters them in SEVIS from a completed Form I-983.',
  ],
  sections: [
    {
      heading: 'Where you see "Explain how this job relates to the degree"',
      paragraphs: [
        'You see this prompt in the SEVP Portal when you add an employer during post-completion OPT. The field is labeled "Relation to Field of Study" and marked as required. You cannot save the employer until it is filled in.',
        'The same field appears when you edit an employer during STEM OPT. On STEM OPT you cannot add a new employer in the Portal yourself. You give your DSO a completed Form I-983, and the DSO enters the employer in SEVIS.',
        'Some schools ask for this explanation on their own forms instead of, or in addition to, the Portal. SEVP guidance lets the DSO enter it in SEVIS or keep it in your school file. Either way, the content is the same.',
        'The Portal also sets date rules. Your employment start date cannot be before your OPT start date. It also cannot be more than 10 days in the past when you enter it.',
      ],
      links: [
        { label: 'SEVP Portal guide for OPT students', href: '/blog/sevp-portal-guide-opt' },
        { label: 'ISSS, DSO and PDSO: who does what', href: '/blog/isss-dso-pdso-meaning' },
      ],
      sources: [src.portalGuide, src.directGuidance],
    },
    {
      heading: 'The legal standard: "directly related to the major area of study"',
      paragraphs: [
        'The rule comes from 8 CFR 214.2(f)(10)(ii)(A). It lets a student apply for OPT that is directly related to the student’s major area of study. For the STEM OPT extension, the training must be directly related to the degree that qualifies the student for the extension.',
        'SEVP explained how to show that link in policy guidance dated September 27, 2019. It says the student is responsible for describing how the job relates to the major. The DSO must review that description and keep it.',
        'The DSO asks whether there is a logical connection between your duties and your major. SEVP says the decision is made case by case. If the explanation is not clear enough, the DSO should ask you for more evidence.',
        'SEVP gives two warnings. A job can look unrelated but still qualify, such as a music graduate who performs at a restaurant. A job can also look related but need more detail, such as an accounting graduate at an accounting firm. Duties decide the answer, not the employer’s name.',
      ],
      links: [
        { label: 'Does your OPT job have to relate to your degree?', href: '/blog/opt-job-related-to-degree' },
      ],
      sources: [src.cfr2142, src.directGuidance, src.practicalTraining],
    },
    {
      heading: 'What a good answer contains',
      paragraphs: [
        'SEVP lists what the written explanation should include. The SEVP Portal Student User Guide repeats the same list and points back to the 2019 guidance.',
        'SEVP asks for a brief explanation. It does not publish a word count. The Portal shows a characters-remaining counter, so keep the answer short and specific.',
      ],
      numbered: [
        'Your job title.',
        'Your employer’s name.',
        'Your major area of study, as on your I-20.',
        'Whether you work full time (20 or more hours a week) or your average hours per week.',
        'Your regular duties and how they directly use your degree, naming specific courses or skills.',
      ],
      bullets: [
        'Write in the first person and in plain sentences.',
        'Name two or three real courses or skill areas from your transcript.',
        'Describe what you do most days, not the company’s mission.',
        'Make sure the answer matches your offer letter and any Form I-983.',
        'Keep a copy. SEVP says the DSO must retain it, and SEVP may request it in a compliance review.',
      ],
      note: 'Answers in the Portal are official statements. The Portal warns that materially false information may lead to criminal prosecution. Describe your real job.',
      sources: [src.directGuidance, src.portalGuide],
    },
    {
      heading: 'SEVP’s own sample answers',
      paragraphs: [
        'The 2019 guidance ends with five sample explanations. They cover electrical engineering, business, music, computer science and kinesiology. The Portal guide reprints the electrical engineering and music samples.',
        'Most samples follow the same shape. They give the degree, the job title and employer, the hours or full-time status, the main duties, and the coursework those duties draw on. The samples run two to four sentences. Use them as the model for length and tone.',
      ],
      sources: [src.directGuidance, src.portalGuide],
    },
    {
      heading: 'Eight sample answers by major',
      paragraphs: [
        'These are examples to adapt, not text to copy. Replace every detail with your real title, employer, hours, duties and courses. A copied answer that does not match your job can create problems with your DSO and your records.',
        'Each example follows the SEVP pattern: degree, title and employer, hours, duties, and the coursework those duties use.',
      ],
      bullets: [
        'Computer science (MS): I work full time as a Software Engineer at [employer]. I design and test backend services and improve the speed of database queries. This work applies what I studied in my algorithms, distributed systems and database courses.',
        'Data science (MS): I work full time as a Data Analyst at [employer]. I clean large datasets, build forecasting models in Python and present results to product teams. My duties use the statistical modeling, machine learning and data visualization courses in my degree.',
        'Mechanical engineering (MS): I work full time as a Design Engineer at [employer]. I create 3D models of machine parts, run stress simulations and review test results. This work relies on my coursework in solid mechanics, finite element analysis and machine design.',
        'Electrical engineering (BS): I work full time as a Hardware Test Engineer at [employer]. I design test plans for circuit boards and diagnose signal and power faults. These duties apply the circuit analysis, electronics and signal processing courses from my degree.',
        'Business analytics (MS): I work full time as a Business Analyst at [employer]. I build sales dashboards, write SQL queries and model pricing scenarios for managers. My work uses my courses in data mining, optimization and business statistics.',
        'MBA with a finance concentration: I work full time as a Financial Analyst at [employer]. I prepare monthly forecasts, build valuation models and analyze budget variances for leadership. These duties draw on my corporate finance, financial modeling and managerial accounting courses.',
        'Biotechnology (MS): I work full time as a Research Associate at [employer]. I run cell culture and PCR assays and record results under laboratory quality standards. This work applies the molecular biology, bioprocessing and laboratory methods courses in my program.',
        'Public health (MPH): I work 30 hours a week as a Program Evaluation Analyst at [employer]. I design surveys, analyze health outcome data and write reports for community programs. My duties use my coursework in epidemiology, biostatistics and program evaluation.',
      ],
      note: 'Study in the States says post-completion OPT work must be at least 20 hours per week. If you are not full time, give your average weekly hours instead of "full time".',
      sources: [src.directGuidance, src.sitsOpt],
    },
    {
      heading: 'Unpaid, volunteer and self-employed work',
      paragraphs: [
        'If your role is unpaid, a volunteer position or your own business, the explanation needs extra care. The employer name may say little about what you actually do.',
        'SEVP says the DSO judges the link from your duties. Describe them concretely, and keep evidence of your duties and hours in case your DSO asks. The guides below explain which unpaid roles can count on OPT.',
      ],
      links: [
        { label: 'Volunteer and unpaid work on OPT: the rules', href: '/blog/volunteer-work-opt-employment-rules' },
        { label: 'OPT employment evidence checklist', href: '/blog/opt-employment-evidence-checklist' },
      ],
      sources: [src.directGuidance],
    },
    {
      heading: 'When to submit it and what happens next',
      paragraphs: [
        'Study in the States says students on OPT must report changes in name, address and employment information to the DSO within 10 days. Add a new employer in the Portal within that window.',
        'When you change jobs, do not overwrite the old employer. The Portal guide says to enter an end date for the old job and add the new employer as a separate entry.',
        'SEVIS counts each day of an OPT period without employer information as unemployment. A missing or late employer entry can therefore add days to your unemployment count.',
      ],
      links: [
        { label: 'When the OPT unemployment clock starts', href: '/blog/when-does-opt-unemployment-clock-start' },
      ],
      sources: [src.sitsOpt, src.portalGuide],
    },
    {
      heading: 'Example: Priya writes her answer before saving',
      paragraphs: [
        'Fictional example: Priya finished an MS in data science and started as a Marketing Analyst. The title sounds far from her degree. She worries her DSO will question it.',
        'She lists her real duties: building customer segmentation models, running A/B test analysis in Python and reporting results to the marketing team. She matches them to her machine learning, experimental design and statistics courses.',
        'Her final answer is three sentences. It names her title, employer and full-time status, her three main duties and the three courses. She saves the employer in the Portal four days after her start date and keeps a copy with her offer letter.',
      ],
    },
  ],
  checklist: [
    'Have your offer letter, job title, start date and weekly hours ready.',
    'Pick two or three courses from your transcript that your duties use.',
    'Write three or four sentences: degree, title and employer, hours, duties and courses.',
    'Add the employer in the SEVP Portal within 10 days of starting.',
    'Save a copy of your answer with your OPT employment records.',
  ],
  mistakes: [
    'Writing one vague line such as "This job uses my degree."',
    'Describing the company instead of your own daily duties.',
    'Copying a sample answer that does not match your real job.',
    'Leaving out your hours or full-time status.',
    'Overwriting an old employer instead of ending it and adding the new one.',
  ],
  faq: [
    {
      question: 'What should I write for "Explain how this job relates to the degree that qualified you for this OPT"?',
      answer:
        'Give your job title, employer, major and full-time status or average weekly hours. Then describe your regular duties and name the courses or skills from your degree that they use. SEVP asks for a brief explanation.',
    },
    {
      question: 'Is the Relation to Field of Study field required?',
      answer:
        'Yes. The SEVP Portal Student User Guide marks it as required when you add an employer during post-completion OPT. You cannot save the employer without it.',
    },
    {
      question: 'How long should my answer be?',
      answer:
        'SEVP does not publish a word count. It asks for a brief explanation, and its own samples run two to four sentences. The Portal shows a characters-remaining counter as you type.',
    },
    {
      question: 'Can I copy one of the sample answers?',
      answer:
        'No. The samples show structure only. Your answer must describe your real title, duties, hours and courses. Portal entries are official statements, and false information can carry penalties.',
    },
    {
      question: 'What if my DSO says the explanation is not enough?',
      answer:
        'SEVP guidance says the DSO should ask for more evidence when the link is unclear. A job description or a letter from your employer describing your duties can help. Ask your DSO what they need.',
    },
    {
      question: 'Do STEM OPT students fill in this field?',
      answer:
        'STEM OPT students cannot add employers in the Portal. They submit a completed Form I-983 to the DSO, who enters the employer in SEVIS. STEM OPT students can still edit the Relation to Field of Study field for an existing employer.',
    },
  ],
  sources: [src.directGuidance, src.portalGuide, src.cfr2142, src.sitsOpt, src.practicalTraining],
  related: [
    { label: 'Does your OPT job have to relate to your degree?', href: '/blog/opt-job-related-to-degree' },
    { label: 'SEVP Portal guide for OPT students', href: '/blog/sevp-portal-guide-opt' },
    { label: 'OPT employment evidence checklist', href: '/blog/opt-employment-evidence-checklist' },
    { label: 'Volunteer and unpaid work on OPT', href: '/blog/volunteer-work-opt-employment-rules' },
  ],
  statusNote:
    'TrackMyOPT is a case tracker, not legal advice. SEVIS and your DSO’s records are the official record. Ask your DSO if you are unsure whether a job qualifies.',
});
