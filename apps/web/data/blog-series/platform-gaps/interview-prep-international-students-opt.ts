import { platformGap, platformSources } from './shared';

export const interviewPrepInternationalStudentsOptArticle = platformGap({
  slug: 'interview-prep-international-students-opt',
  title:
    'Interview Prep for International Students: Work Authorization, STAR Stories, and Offers',
  seoTitle: 'Interview Prep for International Students on OPT',
  description:
    'A practical interview guide for F-1 and OPT candidates: answering work-authorization questions legally and clearly, explaining OPT and STEM OPT, building STAR stories, and closing strong.',
  category: 'Career',
  tags: [
    'interview tips international students',
    'work authorization question',
    'STAR method',
    'OPT interview',
  ],
  readTime: '10 min read',
  cta: 'resume',
  imageAlt: 'Illustrated video interview on a laptop with speech bubbles',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Prepare for interviews as an international student in three layers. First, a clear, accurate 20-second answer about work authorization: you are authorized on OPT from a given date, may be eligible for a 24-month STEM extension, and will or will not need future sponsorship. Second, five or six STAR stories (Situation, Task, Action, Result) with measurable results. Third, questions that show you understand the team. Employers may lawfully ask whether you are authorized to work and whether you will need sponsorship. Answer those directly, then steer back to your skills.',
  keyTakeaways: [
    'Prepare one honest, confident work-authorization answer and practice it.',
    'Explain OPT simply: you can start on a set date, without sponsorship for an initial period.',
    'STAR stories with numbers beat general claims.',
    'Know what employers can lawfully ask, and what they generally cannot.',
  ],
  sections: [
    {
      heading: 'The work-authorization answer',
      paragraphs: [
        'The two common lawful questions are “Are you legally authorized to work in the United States?” and “Will you now or in the future require sponsorship for employment visa status?” Answer both accurately.',
        'Example: “Yes, I am authorized to work on OPT starting in June, and my degree qualifies for a 24-month STEM extension, so I can work for up to three years without sponsorship. For long-term employment I would need H-1B sponsorship.” Adjust it to your facts.',
      ],
      links: [
        {
          label: 'How to answer the sponsorship question',
          href: '/blog/how-to-answer-sponsorship-question',
        },
        {
          label: 'Is my degree STEM-eligible?',
          href: '/blog/is-my-degree-stem-eligible-cip-code',
        },
      ],
    },
    {
      heading: 'What employers can and cannot ask',
      paragraphs: [
        'Employers generally should not ask about your national origin or your specific visa type before an offer, and should not demand particular immigration documents. They can ask about authorization and sponsorship needs. If a question feels discriminatory, you can steer back to your authorization and skills. You can also learn more from the Department of Justice’s Immigrant and Employee Rights Section.',
      ],
      sources: [platformSources.discrimination],
    },
    {
      heading: 'Build five STAR stories',
      paragraphs: ['Cover the themes most interviews test:'],
      bullets: [
        'A technical or analytical problem you solved, with a measurable result.',
        'A team conflict or disagreement you helped resolve.',
        'A time you learned something quickly.',
        'A failure, and what you changed afterward.',
        'Leading or influencing without formal authority.',
      ],
      note: 'Keep each story under two minutes. Lead with the result if the interviewer seems short on time.',
    },
    {
      heading: 'Communicating across cultures',
      paragraphs: [
        'U.S. interviews often reward talking about your own contribution (“I designed…”) rather than only the team’s work. Practice saying your numbers out loud. Pause and ask a clarifying question rather than guessing at an unfamiliar idiom. These are learnable habits, not personality changes.',
      ],
      links: [
        {
          label: 'OPT anxiety and mental health',
          href: '/blog/opt-anxiety-mental-health-international-students',
        },
      ],
    },
    {
      heading: 'Questions to ask the interviewer',
      bullets: [
        'What does success look like in this role after six months?',
        'How does the team review and support new graduates?',
        'Has the company supported OPT, STEM OPT, or H-1B employees in this team before?',
        'What are the next steps and timeline?',
      ],
      paragraphs: [
        'Ask the sponsorship question to the recruiter rather than a peer interviewer, unless the interviewer brings it up.',
      ],
    },
    {
      heading: 'After the interview',
      paragraphs: [
        'Send a short thank-you note within a day. Update your job tracker with the stage and next steps. If an offer comes, check the details OPT reporting needs before you accept.',
      ],
      links: [
        {
          label: 'Organize your OPT job search',
          href: '/blog/organize-opt-job-search-tracker-unemployment-days',
        },
        {
          label: 'Background checks and offer letters',
          href: '/blog/background-check-offer-letter-international-students',
        },
      ],
    },
  ],
  checklist: [
    'Write and rehearse your work-authorization answer.',
    'Prepare five STAR stories with metrics.',
    'Research the team’s products and recent news.',
    'Check the employer’s filing history.',
    'Prepare three questions to ask.',
    'Send a thank-you note and update your tracker.',
  ],
  mistakes: [
    'Giving a vague or evasive sponsorship answer.',
    'Over-explaining immigration rules during a technical interview.',
    'Describing only team achievements, never your own role.',
    'Forgetting to follow up.',
  ],
  faq: [
    {
      question: 'Should I bring up OPT before I am asked?',
      answer:
        'Usually there is no need. Answer clearly when asked, or mention it with the recruiter when discussing start dates.',
    },
    {
      question: 'Can I say I do not need sponsorship?',
      answer:
        'Only if it is true. OPT and STEM OPT do not require sponsorship, but long-term H-1B employment usually does. Answer accurately for the timeframe asked.',
    },
    {
      question: 'Can an interviewer ask which country I am from?',
      answer:
        'Questions about national origin are generally inappropriate in hiring decisions. You can redirect to your authorization to work.',
    },
  ],
  sources: [platformSources.discrimination, platformSources.i9],
  related: [
    {
      label: 'Cold emailing recruiters as an F-1 student',
      href: '/blog/cold-email-recruiters-f1-opt-students',
    },
    {
      label: 'Networking for sponsorship',
      href: '/blog/networking-international-student-sponsorship',
    },
    {
      label: 'Salary negotiation for international workers',
      href: '/blog/salary-negotiation-international-workers-opt',
    },
  ],
});
