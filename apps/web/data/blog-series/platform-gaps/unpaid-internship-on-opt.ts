import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const unpaidInternshipOnOptArticle = platformGap({
  slug: 'unpaid-internship-on-opt',
  title: 'Can You Do an Unpaid Internship on OPT? Rules for OPT vs STEM OPT',
  seoTitle: 'Unpaid Internship on OPT: What Counts and What Doesn’t',
  description:
    'Unpaid internships can count as employment on post-completion OPT if they meet the hours, degree-relation, and labor-law conditions. STEM OPT requires paid work. Here is how to document it.',
  category: 'OPT Employment',
  tags: [
    'unpaid internship OPT',
    'unpaid OPT employment',
    'OPT volunteer',
    'STEM OPT paid',
  ],
  readTime: '8 min read',
  cta: 'unemployment',
  imageAlt:
    'Illustration of an intern filling in a clipboard timesheet beside an hourglass in a small office',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'On post-completion OPT, an unpaid internship can count as employment if it is directly related to your degree, averages at least 20 hours a week, and does not violate U.S. labor laws. Many for-profit unpaid internships fail that last test. STEM OPT is different. It requires a paid, bona fide employer-employee relationship with an E-Verify employer under a Form I-983 training plan, so unpaid roles do not qualify. Whatever the role, keep written evidence of your duties, hours, and supervisor.',
  keyTakeaways: [
    'Post-completion OPT: unpaid work can qualify when it is related to your degree, 20+ hours a week, and lawful.',
    'STEM OPT: unpaid positions do not qualify.',
    'Labor law matters: many for-profit companies cannot legally use unpaid interns for productive work.',
    'Documentation protects you in future H-1B or green card filings.',
  ],
  sections: [
    {
      heading: 'What SEVP says about unpaid work on OPT',
      paragraphs: [
        'SEVP guidance recognizes that students on post-completion OPT may work as volunteers or unpaid interns, as long as the work does not violate labor laws. The work must still be directly related to your field of study and meet the minimum of 20 hours a week to count as employment for unemployment purposes.',
        'You must report the position like any other employer: employer name, address, start date, and how the role relates to your degree.',
      ],
      links: [
        {
          label: 'Volunteer work and OPT employment rules',
          href: '/blog/volunteer-work-opt-employment-rules',
        },
        {
          label: 'What counts as 20 hours on OPT',
          href: '/blog/what-counts-as-20-hours-on-opt',
        },
      ],
      sources: [source.sevpEmployment],
    },
    {
      heading: 'The labor-law test',
      paragraphs: [
        'Under the Fair Labor Standards Act, a for-profit employer can only offer an unpaid internship when the intern, not the employer, is the “primary beneficiary.” Courts look at whether the internship provides training similar to an educational environment, is tied to formal education, and does not displace paid employees.',
        'Many unpaid roles at for-profit companies do not meet this test. Nonprofits and public agencies have more room for volunteer roles, but the work still has to relate to your degree.',
      ],
      sources: [platformSources.flsaInterns],
    },
    {
      heading: 'Why STEM OPT is different',
      paragraphs: [
        'STEM OPT rules require a bona fide employer-employee relationship, compensation comparable to similarly situated U.S. workers, an E-Verify-enrolled employer, and a signed Form I-983 training plan. Unpaid internships and volunteer roles do not satisfy these requirements.',
      ],
      links: [
        {
          label: 'STEM OPT employer requirements',
          href: '/blog/stem-opt-employer-requirements',
        },
      ],
      sources: [platformSources.stemRule, source.stem],
    },
    {
      heading: 'How to document an unpaid internship',
      bullets: [
        'An offer or agreement letter on letterhead with your title, duties, start date, and weekly hours.',
        'A short description of how the duties relate to your degree.',
        'Your supervisor’s name and contact details.',
        'Weekly hour logs or timesheets.',
        'An end-date letter when the internship ends.',
      ],
      paragraphs: [
        'These documents can matter years later when an H-1B or green card officer asks about gaps or unemployment periods during OPT.',
      ],
      links: [
        {
          label: 'OPT employment evidence checklist',
          href: '/blog/opt-employment-evidence-checklist',
        },
      ],
    },
    {
      heading: 'Fictional example: a nonprofit research role',
      paragraphs: [
        'Daniel is fictional, with a public health master’s degree on post-completion OPT. He accepts a 25-hour-a-week unpaid data role at a nonprofit health organization. He gets a letter describing his epidemiology duties and hours, reports the employer in the SEVP Portal, and keeps weekly logs. When he later moves to a paid STEM-eligible role, he cannot use the unpaid role for STEM OPT. He needs a paid employer enrolled in E-Verify.',
      ],
    },
  ],
  checklist: [
    'Confirm the role is directly related to your degree.',
    'Confirm at least 20 hours a week.',
    'Check that the internship is lawful under the FLSA if the employer is for-profit.',
    'Get a letter describing your duties and hours.',
    'Report the employer to SEVP within the required window.',
    'Plan a paid, E-Verify employer before STEM OPT.',
  ],
  mistakes: [
    'Working unpaid for a for-profit employer in a role that fails the primary-beneficiary test.',
    'Accepting fewer than 20 hours a week and assuming the unemployment clock stopped.',
    'Assuming an unpaid role can carry over into STEM OPT.',
    'Failing to keep proof of duties and hours.',
  ],
  faq: [
    {
      question: 'Does an unpaid internship stop the OPT unemployment clock?',
      answer:
        'On post-completion OPT it can, if it is related to your degree, 20+ hours a week, and lawful. Report it like any other job.',
    },
    {
      question: 'Can I do an unpaid internship on STEM OPT?',
      answer:
        'No. STEM OPT requires a paid employer-employee relationship with an E-Verify employer under Form I-983.',
    },
    {
      question: 'Is a stipend the same as being paid?',
      answer:
        'Not always. For STEM OPT, compensation must be comparable to similarly situated U.S. workers. Ask your DSO if you are unsure.',
    },
  ],
  sources: [
    source.sevpEmployment,
    platformSources.flsaInterns,
    platformSources.stemRule,
    source.stem,
  ],
  related: [
    {
      label: 'Part-time OPT complete guide',
      href: '/blog/part-time-opt-complete-guide',
    },
    {
      label: 'Freelance and gig work on OPT',
      href: '/blog/freelance-gig-work-uber-doordash-opt',
    },
    {
      label: '90-day unemployment rule',
      href: '/blog/90-day-unemployment-rule-opt',
    },
  ],
});
