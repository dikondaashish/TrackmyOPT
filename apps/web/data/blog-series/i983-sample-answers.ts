import { defineArticle } from './shared';
import { PLANNING_GUIDE_DATE, planningSources as src } from './planning-guides-shared';
import type { ResearchArticle } from './types';

// Search Console: "i-983" 622 impressions in 28 days at position 10+.
// Autocomplete: "i-983 sample answers", "i 983 student role example",
// "i-983 12 month evaluation sample", "i-983 final evaluation example".
// The existing guide explains the form; this post gives worked answers.

const SLUG = 'form-i-983-sample-answers';

export const i983SampleAnswersGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'Form I-983 Sample Answers: Section 5, 12-Month and Final Evaluation',
  seoTitle: 'Form I-983 Sample Answers: Section 5 and Evaluations',
  description:
    'Sample answers for Form I-983 Section 5 and both evaluations, with what each box asks, the 10-day deadlines and the mistakes that get a training plan sent back.',
  category: 'STEM OPT',
  tags: [
    'I-983 sample answers',
    'Form I-983 Section 5 example',
    'I-983 12-month evaluation sample',
    'I-983 final evaluation example',
    'STEM OPT training plan',
  ],
  readTime: '7 min read',
  publishedDate: PLANNING_GUIDE_DATE,
  modifiedDate: PLANNING_GUIDE_DATE,
  showContents: true,
  cta: 'stem-opt',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: Form I-983 sample answers for the four Section 5 boxes and two evaluations.',
  imageCaption: 'Four Section 5 boxes, two evaluations, 10 days for each deadline.',
  directAnswer:
    'Section 5 of Form I-983 has four boxes: student role, goals and objectives, employer oversight, and measures and assessments. A good answer names your degree, lists real tasks, gives a timeline for the whole period, and says who reviews your work and how often. The samples below are fictional. Use their structure and write your own facts.',
  keyTakeaways: [
    'Explain how the job uses your STEM degree. Saying it is related is not enough.',
    'Cover the full STEM OPT period with a timeline, in your own words, not the job description.',
    'The 12-month and final evaluations are self-evaluations that your employer signs.',
    'Each evaluation and a new-employer I-983 are due to your DSO within 10 days.',
  ],
  sections: [
    {
      heading: 'What gets a training plan sent back',
      paragraphs: [
        'The DSO checks that the form is complete and that it answers each question. These are the usual reasons schools ask for a revision.',
      ],
      bullets: [
        'The role box never explains the link to your degree.',
        'The goals box copies the job description or has no timeline.',
        'The plan covers a few months, not the whole STEM OPT period.',
        'A box says "see attached". Answers must fit in the form.',
        'The supervisor works for a client, not for your employer.',
        'The start date is your original hire date, not your STEM OPT start date.',
      ],
      note: 'Schools differ on style. Ohio State does not accept plans written in the first person. Third person is the safe choice for Section 5.',
      sources: [src.osuI983, src.isuI983, src.i983Instructions],
    },
    {
      heading: 'Student Role: sample answer',
      paragraphs: [
        'The form asks you to describe the role and how it is directly related to the knowledge from your qualifying STEM degree. Name the job title, the tasks and the degree.',
        'Sample: "The student will work as a Data Analyst on the Operations Analytics team. She will build SQL and Python pipelines for shipment data, design dashboards for the operations team, and build models that forecast delivery times. These tasks apply her M.S. in Data Science coursework in statistical modeling, machine learning and database systems."',
      ],
      sources: [src.i983, src.i983Instructions],
    },
    {
      heading: 'Goals and Objectives: sample answer',
      figure: {
        src: `/blog/illustrations/${SLUG}.webp`,
        alt: 'Painted illustration of a mentor and a younger employee reviewing a blank form on a clipboard at an office table.',
        caption: 'Draft the plan with your supervisor. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'The form asks for the specific knowledge, skills or techniques you will learn and how you will reach them. The instructions also ask for the timeline.',
        'Sample: "Months 1 to 6: learn the company data warehouse and code review process, and deliver two production dashboards. Months 7 to 12: build and validate a delivery-time forecasting model, and present the results to operations leads. Months 13 to 24: own the model in production, add monitoring for data drift, and lead one cross-team analytics project. She will reach these goals through weekly meetings with her supervisor, code reviews by senior analysts, and the company training on cloud data tools."',
      ],
      sources: [src.i983, src.i983Instructions, src.cfrStem],
    },
    {
      heading: 'Employer Oversight: sample answer',
      paragraphs: [
        'The form asks how the employer supervises people in positions like yours. If the company has a training program or policy, describing it can be enough.',
        'Sample: "The student reports to the Analytics Manager, a company employee who works at the same site. They meet one-on-one every week. Senior analysts review all code before release. The company applies its standard onboarding and mentoring program for new analysts."',
      ],
      sources: [src.i983, src.i983Instructions],
    },
    {
      heading: 'Measures and Assessments: sample answer',
      paragraphs: [
        'The form asks how the employer confirms that you are gaining new knowledge and skills.',
        'Sample: "The supervisor reviews progress against the goals above each quarter and records it in the company performance system. Skills are measured by completed projects, code review feedback and model accuracy targets. The student receives a written review at 6 and 12 months, the same as other analysts."',
      ],
      sources: [src.i983, src.i983Instructions],
    },
    {
      heading: 'Section 3 fields people get wrong',
      paragraphs: ['Your employer fills in Section 3. Check these before anyone signs.'],
      table: {
        caption: 'Form I-983 Section 3 fields and what to enter.',
        columns: ['Field', 'What to enter'],
        rows: [
          ['Start date of employment', 'The day STEM OPT training with this employer begins'],
          ['Hours per week', 'The agreed average. The minimum is 20'],
          ['Annual salary', 'A yearly dollar figure. Convert hourly pay to a year'],
          ['Other compensation', 'Housing, stipends or similar, with a value'],
          ['Full-time employees', 'The count in the United States'],
          ['EIN', 'The tax ID number, not the E-Verify company ID'],
          ['NAICS code', 'Ask HR. Do not guess'],
        ],
      },
      links: [
        { label: 'E-Verify number or EIN on the I-765 and I-983', href: '/blog/everify-number-vs-ein-i765-i983' },
      ],
      sources: [src.i983Instructions],
    },
    {
      heading: '12-month evaluation: sample answer',
      paragraphs: [
        'This is a self-evaluation. You write it and sign it, and your employer signs to confirm it is accurate. The date range starts on your STEM OPT start date, not your hire date.',
        'The form asks you to use the measures in your plan, discuss accomplishments, and say whether any goals changed.',
        'Sample: "From 07-01-2026 to 06-30-2027, I met the first-year goals in my training plan. I built two operations dashboards that the team uses daily, and a delivery-time forecasting model that passed validation. I learned the company data warehouse, code review process and cloud tools through weekly meetings with my supervisor. My goals for the next period are unchanged, with one addition: I will add drift monitoring to the model."',
      ],
      sources: [src.i983, src.i983Instructions, src.cfrStem],
    },
    {
      heading: 'Final evaluation: sample answer',
      paragraphs: [
        'The final evaluation covers the whole STEM OPT period with that employer. You also owe one when you leave an employer early.',
        'Sample: "From 07-01-2026 to 06-30-2028, I completed the goals in my training plan. I moved from building dashboards under review to owning the forecasting model in production. I added monitoring, led one cross-team project and trained two new analysts on the pipeline. I applied the statistical modeling and machine learning from my degree and gained skills in production deployment. No goals changed after the 12-month evaluation."',
      ],
      sources: [src.i983, src.i983Instructions, src.i983Students],
    },
    {
      heading: 'Deadlines and signatures',
      paragraphs: ['Every I-983 deadline runs to your DSO, not to USCIS.'],
      table: {
        caption: 'Form I-983 deadlines.',
        columns: ['Event', 'What is due', 'Deadline'],
        rows: [
          ['New employer', 'A new Form I-983', 'Within 10 days of starting'],
          ['12 months of STEM OPT', 'First evaluation', 'Within 10 days after the period ends'],
          ['STEM OPT ends, or you leave the employer', 'Final evaluation', 'Within 10 days'],
          ['Material change to the plan', 'A modified Form I-983', 'At the earliest opportunity'],
        ],
      },
      bullets: [
        'The employer signer must have signatory authority and know your goals and performance.',
        'You cannot sign for the employer.',
        'ICE accepts handwritten and electronic signatures. Some schools reject a typed name.',
        'Download the form from ice.gov. The current file shows an expiration date of 4/30/2029.',
      ],
      links: [
        { label: 'Form I-983 training plan guide', href: '/blog/i-983-training-plan-guide' },
        { label: 'Material changes that need a new I-983', href: '/blog/stem-opt-material-changes-new-i983' },
        { label: 'If your employer refuses to sign the I-983', href: '/blog/employer-refuses-form-i983' },
      ],
      sources: [src.i983Instructions, src.cfrStem, src.i983Overview],
    },
  ],
  checklist: [
    'Download the current form from ice.gov.',
    'Write each Section 5 answer in your own words.',
    'Check the start date, hours and salary in Section 3.',
    'Get both employer signatures, Sections 4 and 6.',
    'Send the form to your DSO and keep a copy.',
    'Set reminders for the 12-month and final evaluations.',
  ],
  mistakes: [
    'Copying the job description into the goals box.',
    'Leaving out how the job uses your degree.',
    'Naming a client employee as the supervisor.',
    'Missing the 10-day deadline for an evaluation.',
    'Using a sample answer without changing the facts.',
  ],
  faq: [
    {
      question: 'Can I copy an I-983 sample answer?',
      answer:
        'No. The form is signed under penalty of perjury, and it must describe your real job. Use a sample for structure and write your own tasks, goals and supervisor.',
    },
    {
      question: 'Who writes Section 5 of the I-983?',
      answer:
        'The form says Section 5 is completed by the student and the employer. In practice many students draft it and the supervisor edits and approves it.',
    },
    {
      question: 'Who writes the I-983 12-month evaluation?',
      answer:
        'You do. It is a self-evaluation. Your employer reviews it and signs to confirm it is accurate.',
    },
    {
      question: 'When is the 12-month evaluation due?',
      answer:
        'Within 10 days after the first 12 months of STEM OPT end. The clock starts on your STEM OPT start date, not your hire date.',
    },
    {
      question: 'Do I send Form I-983 to USCIS?',
      answer:
        'No. It goes to your DSO, who needs it before recommending STEM OPT. USCIS or ICE may ask to see it later.',
    },
    {
      question: 'How long should each I-983 answer be?',
      answer:
        'There is no word limit. The answer must fit in the box on the form. Three to five clear sentences are usually enough.',
    },
  ],
  sources: [
    src.i983,
    src.i983Instructions,
    src.i983Students,
    src.i983Overview,
    src.cfrStem,
    src.osuI983,
    src.isuI983,
  ],
  related: [
    { label: 'Form I-983 training plan guide', href: '/blog/i-983-training-plan-guide' },
    { label: 'If your employer refuses to sign the I-983', href: '/blog/employer-refuses-form-i983' },
    { label: 'Material changes that need a new I-983', href: '/blog/stem-opt-material-changes-new-i983' },
    { label: 'STEM OPT extension guide', href: '/blog/stem-opt-extension-guide' },
  ],
});
