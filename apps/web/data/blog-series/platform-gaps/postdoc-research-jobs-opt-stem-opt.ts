import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const postdocResearchJobsOptStemOptArticle = platformGap({
  slug: 'postdoc-research-jobs-opt-stem-opt',
  title:
    'Postdocs and Research Jobs on OPT and STEM OPT: Rules, H-1B, and J-1 Options',
  seoTitle: 'Postdoc on OPT or STEM OPT: Rules and H-1B Options',
  description:
    'Starting a postdoc or research role after your PhD? Learn how OPT and STEM OPT apply, E-Verify and I-983 requirements at universities, cap-exempt H-1B timing, and when J-1 is used instead.',
  category: 'OPT Employment',
  tags: [
    'postdoc OPT',
    'research assistant OPT',
    'cap-exempt H-1B',
    'STEM OPT university',
  ],
  readTime: '9 min read',
  cta: 'opt-timeline',
  imageAlt:
    'Illustration of a researcher taking notes at a lab bench with flasks and a microscope',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'A postdoc or research position can be qualifying employment on post-completion OPT when it is directly related to your degree and at least 20 hours a week. For STEM OPT, the university or institute must be enrolled in E-Verify, pay you as an employee, and sign Form I-983. Fellowships paid as stipends without an employer-employee relationship may not qualify. Many universities and affiliated nonprofit research organizations are cap-exempt H-1B employers, so they can file H-1B petitions at any time of year, without the lottery.',
  keyTakeaways: [
    'Research roles count on OPT when they are related to your degree and 20+ hours a week.',
    'STEM OPT needs a paid employer relationship, E-Verify, and an I-983.',
    'Universities and affiliated research nonprofits are often cap-exempt for H-1B.',
    'Some institutions sponsor J-1 research scholars instead, which has different rules.',
  ],
  sections: [
    {
      heading: 'Postdocs on post-completion OPT',
      paragraphs: [
        'Postdoctoral research is a common OPT use after a PhD. The role must be directly related to your field and reported like any OPT employment. Paid appointments clearly count. Unpaid or fellowship-funded arrangements need a closer look at hours, duties, and documentation.',
      ],
      links: [
        {
          label: 'PhD dissertation and OPT timing',
          href: '/blog/phd-dissertation-opt-eligibility-timing',
        },
        {
          label: 'Unpaid internships on OPT',
          href: '/blog/unpaid-internship-on-opt',
        },
      ],
      sources: [source.sevpEmployment],
    },
    {
      heading: 'STEM OPT at a university',
      paragraphs: [
        'Universities can be STEM OPT employers, but they must meet the same rules as companies: E-Verify enrollment, a bona fide employer-employee relationship, comparable compensation, and a signed I-983 with a training plan and evaluations. Ask early whether the department’s HR team has handled STEM OPT before.',
        'Fellowships paid directly by an outside foundation, with no employment relationship with the university, often do not meet STEM OPT requirements.',
      ],
      links: [
        {
          label: 'I-983 training plan guide',
          href: '/blog/i-983-training-plan-guide',
        },
        {
          label: 'Check if an employer uses E-Verify',
          href: '/blog/check-employer-e-verify-stem-opt-offer',
        },
      ],
      sources: [platformSources.stemRule, source.i983],
    },
    {
      heading: 'Cap-exempt H-1B: the big advantage',
      paragraphs: [
        'Institutions of higher education, their affiliated nonprofits, and nonprofit or government research organizations are exempt from the H-1B cap. They can file a petition at any time of year, outside the March registration lottery. For PhD graduates, this often makes a postdoc a reliable path from OPT to H-1B.',
        'If you later move to a cap-subject employer, such as a private company, you generally need to be selected in the H-1B lottery unless you were previously counted against the cap.',
      ],
      links: [
        {
          label: 'Find cap-exempt H-1B employers',
          href: '/blog/find-cap-exempt-h1b-employers',
        },
        {
          label: 'H-1B alternatives and other work visas',
          href: '/blog/h1b-alternatives-work-visas',
        },
      ],
      sources: [platformSources.capExempt],
    },
    {
      heading: 'When J-1 research scholar status comes up',
      paragraphs: [
        'Some institutions bring in postdocs on J-1 Research Scholar status instead of using OPT or H-1B. J-1 status has its own rules, including possible two-year home residency requirements and limits on returning to J status. Compare the options carefully before you leave F-1.',
      ],
      links: [
        {
          label: 'J-1 vs F-1 OPT differences',
          href: '/blog/j1-visa-vs-f1-visa-opt-differences',
        },
        {
          label: 'J-1 waiver and the 212(e) home residency rule',
          href: '/blog/j1-waiver-212e-two-year-home-residency',
        },
      ],
      sources: [platformSources.jVisaResearch],
    },
    {
      heading: 'Fictional example: OPT to cap-exempt H-1B',
      paragraphs: [
        'Maya is fictional, with a PhD in chemistry. She starts a paid postdoc at her university on post-completion OPT. The university is enrolled in E-Verify and signs her I-983 when she applies for STEM OPT. Because the university is cap-exempt, it files her H-1B in the autumn, without waiting for the lottery.',
      ],
    },
  ],
  checklist: [
    'Confirm the appointment is paid employment and at least 20 hours a week.',
    'Confirm E-Verify enrollment and I-983 support for STEM OPT.',
    'Ask whether the institution is cap-exempt and files H-1B petitions.',
    'Compare J-1 sponsorship if offered.',
    'Report the employer through the SEVP Portal on time.',
  ],
  mistakes: [
    'Assuming every fellowship qualifies for STEM OPT.',
    'Leaving a cap-exempt job without planning for the lottery.',
    'Switching to J-1 without checking home-residency rules.',
    'Starting before the EAD start date.',
  ],
  faq: [
    {
      question: 'Can I do a postdoc on OPT?',
      answer:
        'Yes, if it is related to your degree, at least 20 hours a week, and reported correctly.',
    },
    {
      question: 'Are universities exempt from the H-1B cap?',
      answer:
        'Institutions of higher education and their related or affiliated nonprofits are cap-exempt, as are nonprofit and government research organizations.',
    },
    {
      question: 'Does a fellowship count for STEM OPT?',
      answer:
        'Only if there is a bona fide paid employer-employee relationship with an E-Verify employer that signs the I-983.',
    },
  ],
  sources: [
    source.sevpEmployment,
    platformSources.stemRule,
    platformSources.capExempt,
    platformSources.jVisaResearch,
  ],
  related: [
    {
      label: 'STEM OPT extension guide',
      href: '/blog/stem-opt-extension-guide',
    },
    {
      label: 'EB-2 NIW green card while on OPT',
      href: '/blog/eb2-niw-green-card-opt',
    },
    {
      label: 'O-1 visa for international students',
      href: '/blog/o1-visa-international-students-opt',
    },
  ],
});
