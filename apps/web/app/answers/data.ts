export interface FAQItem {
  question: string;
  answer: string;
}

export interface AnswerPageData {
  slug: string;
  question: string;
  shortAnswer: string;
  category: "opt-basics" | "stem-opt" | "tax-finance" | "health" | "career" | "h1b";
  faqItems: FAQItem[];
  relatedBlogPost?: string;
  relatedFeaturePage?: string;
  lastUpdated: string;
}

export const answers: Record<string, AnswerPageData> = {
  "what-is-opt": {
    slug: "what-is-opt",
    question: "What is OPT (Optional Practical Training)?",
    shortAnswer: "OPT is a U.S. federal work permit allowing F-1 visa students to work in their field of study for up to 12 months after graduation, without requiring employer sponsorship.",
    category: "opt-basics",
    faqItems: [
      { question: "How long can I work on OPT?", answer: "The standard OPT period is 12 months (1 year). STEM degree holders can extend for an additional 24 months with employer sponsorship." },
      { question: "Do I need an employer to apply for OPT?", answer: "No. You can apply for OPT before or after securing employment. OPT provides work authorization; you do not need a job offer to apply." },
      { question: "What is the 90-day unemployment rule?", answer: "F-1 students on OPT can only be unemployed for a cumulative 90 days. Exceeding this limit puts you out of status and terminates your OPT." },
      { question: "Can I work for any employer?", answer: "Yes. OPT allows you to work for any U.S. employer in your field of study. You have complete flexibility in job changes." },
    ],
    relatedBlogPost: "opt-application-checklist-2026",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "what-is-stem-opt": {
    slug: "what-is-stem-opt",
    question: "What is STEM OPT Extension?",
    shortAnswer: "STEM OPT is a 24-month work authorization extension available to F-1 students who graduated with a STEM degree. It allows an additional 2 years of work without requiring a visa sponsor.",
    category: "stem-opt",
    faqItems: [
      { question: "Which degrees qualify for STEM OPT?", answer: "STEM degrees are identified by specific Classification of Instructional Programs (CIP) codes. Engineering, computer science, mathematics, and life sciences typically qualify. Check USCIS.gov for the full CIP code list." },
      { question: "What is the 24-month STEM OPT extension?", answer: "After your initial 12-month OPT ends, you can apply for a 24-month extension if your degree is STEM-designated. This allows up to 36 months total OPT." },
      { question: "How much does STEM OPT cost?", answer: "STEM OPT extension costs $410 in filing fees (as of 2026). There are no employer sponsorship costs or attorney requirements." },
      { question: "Can I change employers during STEM OPT?", answer: "Yes. STEM OPT allows unlimited employer changes. You have complete flexibility to switch jobs without employer notification." },
    ],
    relatedBlogPost: "stem-opt-extension-guide",
    relatedFeaturePage: "/features/extension",
    lastUpdated: "2026-03-10",
  },

  "what-is-h1b": {
    slug: "what-is-h1b",
    question: "What is H-1B Visa?",
    shortAnswer: "H-1B is a U.S. work visa allowing employers to hire foreign workers in specialty occupations. It requires employer sponsorship and is subject to annual caps and lottery.",
    category: "h1b",
    faqItems: [
      { question: "Who can apply for H-1B?", answer: "You must have a job offer from a U.S. employer, a bachelor's degree or higher, and work in a specialty occupation (requires specific educational requirements)." },
      { question: "How long is H-1B valid?", answer: "H-1B is granted for 3-year periods, renewable for up to 6 years total. After 6 years, you must leave the U.S. or transition to another visa status." },
      { question: "What is the H-1B lottery?", answer: "The H-1B visa has annual caps (65,000 regular + 20,000 advanced degree cap). When applications exceed caps, USCIS conducts a random lottery to select petitions." },
      { question: "Can I change employers on H-1B?", answer: "Yes, but your current employer must remain your sponsor during transitions. Your new employer must file an H-1B amendment for the change." },
    ],
    relatedBlogPost: "opt-to-h1b-transition",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-10",
  },

  "do-f1-students-pay-taxes": {
    slug: "do-f1-students-pay-taxes",
    question: "Do F-1 Students Pay Taxes?",
    shortAnswer: "Yes. As an F-1 student, you must file U.S. tax returns if you have taxable income (work, scholarships, or interest). Your visa status determines whether you're a resident or non-resident alien for tax purposes.",
    category: "tax-finance",
    faqItems: [
      { question: "What is the difference between resident and non-resident aliens for taxes?", answer: "Non-resident aliens are taxed only on U.S.-source income and must file Form 1040-NR. Resident aliens (after 5+ years or substantial presence) file Form 1040 like U.S. citizens." },
      { question: "Do I need to file taxes on OPT income?", answer: "Yes. OPT income is U.S.-source income and is always taxable, regardless of residency status. You must report it on your tax return." },
      { question: "What about FICA taxes (Social Security/Medicare)?", answer: "F-1 students are typically exempt from FICA taxes. You must claim this exemption by filing Form 8843 with your tax return." },
      { question: "What is a tax treaty benefit?", answer: "Tax treaties between the U.S. and your home country may reduce your tax burden. Canada, India, and many other nations have treaties that benefit students and workers." },
    ],
    relatedBlogPost: "f1-student-tax-filing-guide",
    relatedFeaturePage: "/features/tax-filing",
    lastUpdated: "2026-03-10",
  },

  "how-long-is-opt-valid": {
    slug: "how-long-is-opt-valid",
    question: "How Long is OPT Valid For?",
    shortAnswer: "Standard OPT is valid for 12 months. After that, you can extend for 24 additional months if you have a STEM degree and employer sponsorship.",
    category: "opt-basics",
    faqItems: [
      { question: "Does the 12-month clock start immediately?", answer: "No. The 12-month clock starts when your OPT permit (EAD) is approved and issued, not when you apply. You can apply 6 months before graduation." },
      { question: "What if I don't use my OPT immediately?", answer: "Your OPT period must start within 14 months of your graduation date. If unused after 14 months, it expires." },
      { question: "Can I use OPT after leaving the U.S.?", answer: "No. OPT is only valid while you're in the U.S. If you leave, your work authorization ends, and re-entering on OPT is not possible." },
      { question: "What happens when OPT expires?", answer: "If you don't have another visa status, you must leave the U.S. within 60 days of OPT expiration. Plan your next steps in advance." },
    ],
    relatedBlogPost: "opt-extension-guide",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "can-i-apply-for-opt-without-job": {
    slug: "can-i-apply-for-opt-without-job",
    question: "Can I Apply for OPT Without a Job Offer?",
    shortAnswer: "Yes. You can apply for OPT before or after finding employment. OPT provides work authorization; you don't need a job offer to apply.",
    category: "opt-basics",
    faqItems: [
      { question: "How do I apply for OPT?", answer: "File Form I-765 (work permit application) with USCIS at least 6 months before your OPT start date. Include your I-20, passport, and supporting documents." },
      { question: "How long does OPT approval take?", answer: "OPT approval typically takes 4-8 weeks, though processing times vary by USCIS office. Plan ahead when applying near your graduation date." },
      { question: "Can I work while my OPT is pending?", answer: "No. You must wait for official OPT approval (EAD issued). Working without authorization is illegal and can jeopardize your immigration status." },
      { question: "What if I get a job offer after applying for OPT?", answer: "You can start work as soon as your OPT approval comes through. No employer notification or changes to your application are necessary." },
    ],
    relatedBlogPost: "opt-application-checklist-2026",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "what-is-the-90-day-unemployment-rule": {
    slug: "what-is-the-90-day-unemployment-rule",
    question: "What is the 90-Day Unemployment Rule on OPT?",
    shortAnswer: "F-1 students on OPT can only be unemployed for a cumulative 90 days. If you exceed this limit, you're out of status and must leave the U.S. immediately.",
    category: "opt-basics",
    faqItems: [
      { question: "How is the 90-day limit counted?", answer: "It's 90 cumulative days of unemployment during your entire OPT period, not consecutive days. Weekends and holidays count toward this limit." },
      { question: "What counts as unemployment?", answer: "Any period when you're not employed in your field of study, even if you're job hunting. Not working = unemployment day, regardless of reason." },
      { question: "What if I go over 90 days?", answer: "You lose OPT authorization immediately and are out of status. You must leave the U.S. within 15 days, unless you apply for another visa status." },
      { question: "Can I pause the 90-day count?", answer: "No. The 90-day count is cumulative throughout your OPT. There is no way to 'pause' or 'reset' the unemployment counter." },
    ],
    relatedBlogPost: "90-day-unemployment-rule-opt",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-10",
  },

  "can-i-travel-on-opt": {
    slug: "can-i-travel-on-opt",
    question: "Can I Travel Internationally on OPT?",
    shortAnswer: "No. You cannot leave the U.S. while on OPT. Departing the U.S. on OPT automatically terminates your work authorization.",
    category: "opt-basics",
    faqItems: [
      { question: "What if I need to go abroad?", answer: "If you need to travel outside the U.S. on OPT, your OPT ends automatically. You would need to apply for a new visa (H-1B, L-1, etc.) or F-1 to return." },
      { question: "What documents do I need to re-enter the U.S. on OPT?", answer: "You'll need a valid passport, OPT permit (EAD), I-20 endorsed for OPT, and employer documentation. But travel itself ends OPT." },
      { question: "What if my employer transfers me abroad?", answer: "You must depart on OPT (ending it), notify USCIS, and potentially apply for L-1 visa sponsorship or another work visa from abroad." },
      { question: "Can I travel during OPT processing?", answer: "No. While your OPT application is pending (before EAD approval), you cannot travel. During processing, you must remain in the U.S." },
    ],
    relatedBlogPost: "can-you-travel-on-opt",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "what-is-ead-card": {
    slug: "what-is-ead-card",
    question: "What is an EAD Card?",
    shortAnswer: "An EAD (Employment Authorization Document) card is your physical work permit, issued by USCIS. It proves you're legally authorized to work in the U.S. on OPT.",
    category: "opt-basics",
    faqItems: [
      { question: "How long does it take to get my EAD card?", answer: "After OPT approval, physical EAD cards are mailed to you (usually 2-4 weeks). You can start working with your approval notice before receiving the card." },
      { question: "Do I need the physical EAD card to work?", answer: "You can start work with your approval notice (I-797 or receipt notice). The physical card is recommended for employment verification, but not always required." },
      { question: "How long is the EAD valid?", answer: "The EAD is valid for the duration of your OPT authorization (typically 12 months, extendable to 36 months with STEM extension)." },
      { question: "What if my EAD card gets lost or damaged?", answer: "Contact USCIS to request a replacement. It costs $50-100 for a replacement card, and you have authorized work methods during processing." },
    ],
    relatedBlogPost: "opt-ead-card-guide",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "what-is-i-983-training-plan": {
    slug: "what-is-i-983-training-plan",
    question: "What is the I-983 Training Plan?",
    shortAnswer: "The I-983 is a form required for STEM OPT extension applications. It documents your employer's plan to train you in the field of study during your extension period.",
    category: "stem-opt",
    faqItems: [
      { question: "Who needs to complete the I-983?", answer: "Only STEM degree holders applying for the 24-month extension need the I-983. Regular OPT applicants do not need this form." },
      { question: "What information does the I-983 require?", answer: "The form requires employer contact information, job title, salary, a detailed job description, your supervisor's name, and a specific training plan detailing skills you'll develop." },
      { question: "Does my employer need to sign the I-983?", answer: "Yes. Your employer or HR representative must sign the form, confirming they will provide the training described in the plan." },
      { question: "What if my employer refuses to complete the I-983?", answer: "If your employer won't cooperate, you cannot apply for STEM OPT extension. You may need to find a cooperative employer or explore other visa options." },
    ],
    relatedBlogPost: "i-983-training-plan-guide",
    relatedFeaturePage: "/features/extension",
    lastUpdated: "2026-03-10",
  },

  "how-to-extend-opt": {
    slug: "how-to-extend-opt",
    question: "How do I Extend My OPT?",
    shortAnswer: "To extend OPT, you must have a STEM degree and file Form I-765 with the I-983 training plan 60-90 days before your current OPT expires.",
    category: "opt-basics",
    faqItems: [
      { question: "What is the cost to extend OPT?", answer: "$410 filing fee (2026) for the I-765 form. Some STEM OPT extensions have reduced fees if filed within timelines." },
      { question: "Can I extend OPT if I'm not in STEM?", answer: "No. Only STEM degree holders can extend OPT. Non-STEM graduates must transition to another visa status (H-1B, L-1) after 12 months." },
      { question: "What happens during the extension approval process?", answer: "While your extension application is pending, you receive an automatic 180-day extension of your current EAD, allowing work to continue uninterrupted." },
      { question: "When should I file for extension?", answer: "File 60-90 days before your current OPT expires. Filing earlier is allowed. Late filing (after OPT ends) is not possible." },
    ],
    relatedBlogPost: "opt-extension-guide",
    relatedFeaturePage: "/features/extension",
    lastUpdated: "2026-03-10",
  },

  "opt-vs-cpt": {
    slug: "opt-vs-cpt",
    question: "What's the Difference Between OPT and CPT?",
    shortAnswer: "OPT is post-graduation work authorization (12-36 months after graduation), while CPT is work authorization during studies. CPT is limited and can impact your OPT eligibility.",
    category: "opt-basics",
    faqItems: [
      { question: "When can I use CPT vs OPT?", answer: "CPT is available during your studies (while enrolled). OPT is available after graduation. You cannot use both simultaneously." },
      { question: "How much CPT can I use before it affects OPT?", answer: "If you use more than 12 months of full-time CPT (or equivalent), you lose OPT eligibility. 1 month of full-time = 3 months reduced OPT duration." },
      { question: "Is CPT paid?", answer: "Yes. CPT is paid work. It's more regulated than OPT — your job must be related to your field of study and formally arranged with your school." },
      { question: "How do I apply for CPT?", answer: "Get your I-20 endorsed by your international student office (DSO) for CPT work. Your employer does not file anything with USCIS." },
    ],
    relatedBlogPost: "day-1-cpt-vs-opt",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "opt-health-insurance": {
    slug: "opt-health-insurance",
    question: "Do I Need Health Insurance on OPT?",
    shortAnswer: "No mandate exists, but health insurance is highly recommended. Many employers provide coverage. If not, you can enroll in the ACA marketplace during special enrollment.",
    category: "health",
    faqItems: [
      { question: "What health insurance options do I have?", answer: "Employer coverage (if offered), ACA marketplace plans, indivual insurance plans, or your home country insurance (if eligible)." },
      { question: "How much does ACA marketplace insurance cost?", answer: "ACA plans range from $50-300+ per month depending on your age, location, and the plan metal level (Bronze, Silver, Gold, Platinum)." },
      { question: "Can I get insurance if I miss the enrollment deadline?", answer: "Yes, as an OPT holder losing student coverage, you qualify for a Special Enrollment Period (30-60 days after coverage ends) to enroll." },
      { question: "Is insurance mandatory?", answer: "No federal mandate for adults. However, some states have penalties for uninsured adults, and many employers require health coverage." },
    ],
    relatedBlogPost: "opt-health-insurance-guide",
    relatedFeaturePage: "/features/health-insurance",
    lastUpdated: "2026-03-10",
  },

  "opt-salary-expectations": {
    slug: "opt-salary-expectations",
    question: "What Salary Can I Expect on OPT?",
    shortAnswer: "OPT salaries vary by field and location. Entry-level engineering/tech typically pays $60K-80K, consulting/finance $55K-70K, and other fields $40K-60K.",
    category: "career",
    faqItems: [
      { question: "Does my employer have to pay a minimum salary for OPT?", answer: "No legal minimum for OPT. Non-STEM OPT has no prevailing wage requirement. STEM OPT employers must meet prevailing wage for their region." },
      { question: "Can I negotiate salary on OPT?", answer: "Yes. OPT provides work authorization, so you can negotiate like any other employee. You have complete flexibility." },
      { question: "Which fields pay the most on OPT?", answer: "Tech, engineering, and finance pay highest ($70K-150K+). Consulting, accounting, and healthcare pay mid-range ($50K-90K). Other fields vary." },
      { question: "Do I pay Social Security/Medicare taxes on OPT income?", answer: "F-1 students are typically exempt from FICA taxes on OPT income. Claim the exemption on your tax return (Form 8843)." },
    ],
    relatedBlogPost: "f1-visa-jobs-guide",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-10",
  },

  "ats-and-automatic-extensions": {
    slug: "ats-and-automatic-extensions",
    question: "What is the Automatic 180-Day Extension on OPT?",
    shortAnswer: "If you file for STEM OPT extension before your current OPT expires, you automatically receive a 180-day extension to continue working while your application is processed.",
    category: "stem-opt",
    faqItems: [
      { question: "When do I get the 180-day extension?", answer: "The 180-day extension is automatic when your extension application (I-765 with I-983) is received by USCIS before your current EAD expires." },
      { question: "Can I work during the 180-day extension?", answer: "Yes. The 180-day extension is an active work permit, allowing you to continue employment uninterrupted while USCIS processes your application." },
      { question: "What if my application is denied after the 180-day extension?", answer: "If denied, your 180-day extension ends immediately. You would have 60 days to depart or apply for another visa status." },
      { question: "Do I need anything else to work during the 180-day extension?", answer: "Your work permit issued during the 180-day extension is sufficient. No other documentation required beyond your approval notice." },
    ],
    relatedBlogPost: "stem-opt-extension-guide",
    relatedFeaturePage: "/features/extension",
    lastUpdated: "2026-03-10",
  },

  "opt-job-search-timeline": {
    slug: "opt-job-search-timeline",
    question: "When Should I Start Job Searching for OPT?",
    shortAnswer: "Start 3-6 months before graduation. Submit OPT application 6 months before intended start date, and aim to secure employment before your OPT officially begins.",
    category: "career",
    faqItems: [
      { question: "When can I apply for OPT?", answer: "You can apply 6 months before graduation, but no earlier. Your application starts the OPT clock when approved, not when submitted." },
      { question: "What if I can't find a job before OPT starts?", answer: "Many students start OPT without employment. You can use the unemployment cushion (90 days) to job search. Have a plan by Day 75." },
      { question: "How long does job searching typically take?", answer: "Average OPT job search takes 2-4 months after graduation. Start early, network, and apply to high-volume hiring periods (post-graduation season)." },
      { question: "What's the best industry for finding OPT jobs?", answer: "Tech, engineering, consulting, finance, and accounting have the highest OPT hiring. Healthcare and education also hire OPT workers frequently." },
    ],
    relatedBlogPost: "f1-visa-jobs-guide",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-10",
  },

  "opt-cap-gap-extension": {
    slug: "opt-cap-gap-extension",
    question: "What is the Cap-Gap Extension?",
    shortAnswer: "If your employer files an H-1B petition for you, your OPT is automatically extended until October 1 (or petition decision), even if your original OPT expires.",
    category: "h1b",
    faqItems: [
      { question: "How does cap-gap work?", answer: "Cap-gap is automatic. When an H-1B petition is filed on your behalf before OPT expiration, your work authorization continues until October 1 or petition decision." },
      { question: "Do I need to do anything for cap-gap?", answer: "No. Your employer's H-1B filing automatically triggers cap-gap status. You don't need to file a separate application." },
      { question: "Can I work during cap-gap?", answer: "Yes. Cap-gap allows continuation of work authorization uninterrupted between OPT expiration and H-1B start date (October 1)." },
      { question: "What if my H-1B petition is denied?", answer: "If your H-1B is denied, cap-gap ends immediately, and you must leave the U.S. within 60 days unless you have another status." },
    ],
    relatedBlogPost: "h1b-cap-gap-extension",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-10",
  },

  "h1b-approval-rates": {
    slug: "h1b-approval-rates",
    question: "What Are H-1B Approval Rates?",
    shortAnswer: "H-1B approval rates are typically 90%+ for complete, accurate applications. Denials usually result from errors, employer issues, or fraud red flags.",
    category: "h1b",
    faqItems: [
      { question: "What causes H-1B denials?", answer: "Common reasons: incomplete forms, employer doesn't meet requirements, job title doesn't match specialty occupation, salary below prevailing wage, or fraud indicators." },
      { question: "How long does H-1B approval take?", answer: "Processing typically takes 2-4 weeks (regular) or 6 months (if RFE/additional evidence requested). Premium processing: 15 days." },
      { question: "What's the H-1B lottery odds?", answer: "When applications exceed caps, USCIS runs a lottery. Odds depend on applications received that year — recently 20-35% for regular cap, 40-50% for advanced degree." },
      { question: "Can I stay in the U.S. while H-1B is pending?", answer: "Yes. With valid OPT or cap-gap extension, you can stay and work while H-1B is pending. If approved, status automatically changes October 1." },
    ],
    relatedBlogPost: "h1b-approval-rates-by-company",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-10",
  },

  "stem-opt-employer-requirements": {
    slug: "stem-opt-employer-requirements",
    question: "What Are the STEM OPT Employer Requirements?",
    shortAnswer: "STEM OPT employers must be enrolled in E-Verify, provide a detailed training plan (I-983), and meet prevailing wage and reporting obligations throughout your employment.",
    category: "stem-opt",
    faqItems: [
      { question: "Must my employer be enrolled in E-Verify?", answer: "Yes. For STEM OPT, your employer MUST be E-Verify enrolled. This is a non-negotiable requirement. You can't work for non-E-Verify employers on STEM OPT." },
      { question: "What salary must my employer pay?", answer: "Your salary must meet or exceed the prevailing wage for your occupation and location (determined by Department of Labor). Typically 110-120% of average for the role." },
      { question: "What documentation does my employer need?", answer: "I-983 training plan (signed), DS-160 approval from your school, your current I-20, and E-Verify enrollment verification. Your DSO also verifies." },
      { question: "Are there other obligations my employer must understand?", answer: "Yes. They must report your employment to USCIS, maintain I-983 compliance records, and allow optional reporting requests (OPT-related notifications)." },
    ],
    relatedBlogPost: "stem-opt-employer-requirements",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-10",
  },

  "top-h1b-sponsors": {
    slug: "top-h1b-sponsors",
    question: "Which Companies Sponsor the Most H-1B Visas?",
    shortAnswer: "Top H-1B sponsors in 2026 include tech giants (Google, Microsoft, Apple, Amazon), consulting firms (Deloitte, Accenture), and IT staffing companies (Cognizant, Infosys).",
    category: "h1b",
    faqItems: [
      { question: "What industries sponsor H-1B most?", answer: "Tech/IT (40%), consulting (20%), finance (15%), healthcare (10%), and other (15%). Tech dominates H-1B sponsorships." },
      { question: "Do large companies or startups sponsor more H-1B?", answer: "Large companies have higher volume (resources, compliance), but startups increasingly sponsor. Pre-IPO startups often have H-1B budgets." },
      { question: "Is it harder to get H-1B from smaller companies?", answer: "Not necessarily harder, but smaller companies may have fewer resources and slower processing. Selection odds depend on lottery, not company size." },
      { question: "What should I look for in an H-1B sponsoring employer?", answer: "Look for companies sponsored 10+ H-1Bs, positive employee reviews about visa support, clear sponsorship communication, and legal compliance history." },
    ],
    relatedBlogPost: "top-h1b-sponsor-companies-2026",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-10",
  },

  "opt-application-denied": {
    slug: "opt-application-denied",
    question: "What If My OPT Application Is Denied?",
    shortAnswer: "If denied, you lose work authorization immediately. You have 60 days to depart the U.S. or file for another visa status. You can appeal or re-apply if errors existed.",
    category: "opt-basics",
    faqItems: [
      { question: "Why would an OPT application be denied?", answer: "Common reasons: incomplete forms, missing signature, missed deadline (after graduation date), F-1 status already lost, or fraud indicators." },
      { question: "Can I appeal a denial?", answer: "No direct appeal exists for I-765 denials. However, you can file a Motion to Reopen if you have new evidence or USCIS made an error." },
      { question: "What happens to my visa status after denial?", answer: "Your authorized visa status (F-1) remains until 60 days expire. During this grace period, you can arrange departure or apply for another status (H-1B, L-1)." },
      { question: "Can I reapply after denial?", answer: "Typically no. OPT is a one-time authorization. If denied, your eligibility generally expires. Consult an immigration attorney for exceptions." },
    ],
    relatedBlogPost: "opt-application-denied",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "uscis-case-status-tracking": {
    slug: "uscis-case-status-tracking",
    question: "How Do I Track My USCIS Case Status?",
    shortAnswer: "Track via USCIS.gov using your receipt number (starts with EAC, SRC, or LIN), or use government-authorized platforms like TrackMyOPT for streamlined updates and alerts.",
    category: "opt-basics",
    faqItems: [
      { question: "Where do I get my receipt number?", answer: "Your receipt number (I-797 notice) is mailed with your OPT filing confirmation. It starts with EAC (East), SRC (Suburban), or LIN (Lincoln) codes." },
      { question: "How often should I check my case status?", answer: "Check weekly if your case should be approved soon (near typical processing time). Status updates may lag — phones/emails from USCIS have priority." },
      { question: "What do different case statuses mean?", answer: "Filed/Pending: Awaiting processing. Approved: Authorization granted. Request for Evidence (RFE): USCIS needs more information. Denied/Rejected: Application rejected." },
      { question: "What if my status hasn't updated in a long time?", answer: "Processing times vary. If beyond typical time, file an expedite request or contact your local USCIS office. TrackMyOPT alerts automate this monitoring." },
    ],
    relatedBlogPost: "uscis-case-status-tracking-guide",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "opt-to-h1b-transition": {
    slug: "opt-to-h1b-transition",
    question: "How Do I Transition From OPT to H-1B?",
    shortAnswer: "Your employer files an H-1B petition during the annual lottery window (March-April for 12-month OPT holders). Cap-gap automatically extends your work authorization until October 1.",
    category: "h1b",
    faqItems: [
      { question: "When can my employer file H-1B for me?", answer: "Filing opens in early March for an October 1 start date. For 12-month OPT holders, file near the end of your OPT (Feb-March) to benefit from cap-gap extension." },
      { question: "What happens if H-1B lottery doesn't select my petition?", answer: "If not selected, cap-gap ends, and you must depart within 60 days unless you have another status. Start planning alternative visas (L-1, EB green card sponsorship)." },
      { question: "Can I stay in the U.S. while waiting for H-1B results?", answer: "Yes. Cap-gap (automatic OPT extension) allows you to stay and work while H-1B is pending, as long as OPT hasn't expired." },
      { question: "What do I need to do to prepare for H-1B transition?", answer: "Ensure your employer is ready to sponsor, understand H-1B requirements, discuss timing and budget with HR, and keep documents (degree, passport, etc.) updated." },
    ],
    relatedBlogPost: "opt-to-h1b-transition",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-10",
  },

  "what-happens-if-opt-expires": {
    slug: "what-happens-if-opt-expires",
    question: "What Happens If OPT Expires?",
    shortAnswer: "When OPT expires without an extension or visa status transition (H-1B, L-1), you become out of status and must depart the U.S. within 60 days.",
    category: "opt-basics",
    faqItems: [
      { question: "Do I get a grace period after OPT expires?", answer: "Yes. You have a 60-day grace period to depart the U.S., apply for another status (H-1B, L-1), or find extension options. Beyond 60 days, you're overstaying." },
      { question: "Can I work after OPT expires?", answer: "No. Once OPT ends and you're out of status, working is illegal and can result in deportation and future visa denials." },
      { question: "What are my options when OPT expires?", answer: "Depart the U.S., apply for H-1B (if employer files by deadline), apply for L-1 visa (if employer has international operations), or file for green card sponsorship." },
      { question: "What if I overstay after OPT expires?", answer: "Overstaying triggers deportation proceedings. Even one day overstay triggers a 3-year re-entry bar. Consult an immigration attorney immediately if this happens." },
    ],
    relatedBlogPost: "what-happens-if-opt-expires",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "stem-opt-unemployment-limit": {
    slug: "stem-opt-unemployment-limit",
    question: "What Is the Unemployment Limit During STEM OPT?",
    shortAnswer: "STEM OPT has a 60-day unemployment limit (vs 90 days for regular OPT). If you exceed 60 cumulative days unemployed, your STEM OPT authorization ends immediately.",
    category: "stem-opt",
    faqItems: [
      { question: "Is the unemployment limit different for STEM OPT?", answer: "Yes. STEM OPT has a 60-day unemployment limit. Regular OPT has 90 days. The difference is significant — STEM rules are stricter." },
      { question: "How is the 60-day limit counted?", answer: "It's 60 cumulative days of unemployment during your STEM OPT extension period only. Unemployment from your initial OPT doesn't count toward the 60-day limit." },
      { question: "What happens if I exceed the 60-day limit?", answer: "Your STEM OPT authorization immediately terminates. You become out of status and must depart the U.S. within 15 days." },
      { question: "Can I extend STEM OPT if I'm unemployed at the end?", answer: "No. STEM OPT is a fixed 24-month extension. It does not extend further. Plan your next visa status before completion." },
    ],
    relatedBlogPost: "stem-opt-unemployment-limit",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-10",
  },

  "opt-processing-time": {
    slug: "opt-processing-time",
    question: "How Long Does OPT Processing Take?",
    shortAnswer: "OPT processing typically takes 4-8 weeks for approval after submission. Timeline varies by USCIS office. Standard processing is slower than premium processing (15 days).",
    category: "opt-basics",
    faqItems: [
      { question: "What's the average OPT processing time?", answer: "4-8 weeks (standard processing). Some offices process faster (3-4 weeks), others slower (8-12 weeks). Check your local USCIS office timeline." },
      { question: "Can I speed up OPT processing?", answer: "Yes. Premium processing (I-907) costs $1,500-2,000 and guarantees 15-day processing. However, approval is not guaranteed — only processing speed." },
      { question: "What if my OPT takes longer than expected?", answer: "If beyond typical timeline, contact USCIS via phone or in-person appointment. Request for Evidence (RFE) can extend processing by several weeks." },
      { question: "When should I apply for OPT to avoid delays?", answer: "Apply 6 months before intended OPT start date. This provides buffer for processing delays without risking missed graduation date." },
    ],
    relatedBlogPost: "opt-processing-time-2026",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "resume-ats-friendly": {
    slug: "resume-ats-friendly",
    question: "How Do I Make My Resume ATS-Friendly?",
    shortAnswer: "Use standard formatting, include keywords from job postings, save as .docx/.pdf (not designs), use bullet points, and avoid images/graphics to pass ATS software scanning.",
    category: "career",
    faqItems: [
      { question: "What formatting breaks ATS systems?", answer: "Avoid: fancy fonts, graphics, images, columns, tables, text boxes. Use: standard fonts (Arial, Calibri), single-column layout, clear section headers." },
      { question: "How do I add keywords for ATS?", answer: "Mirror keywords from the job posting. If posting mentions 'Python, AWS, MySQL,' include these skills in your resume (if honest). ATS scans for keyword matches." },
      { question: "Should I include an objective or summary?", answer: "Optional but recommended. A brief professional summary (2-3 lines) can help ATS identify your role match. Skip lengthy objectives." },
      { question: "How long should my resume be?", answer: "1 page for entry-level (like OPT candidates), 2 pages for experienced professionals. ATS systems can handle longer resumes, but concise is preferred." },
    ],
    relatedBlogPost: "ats-resume-international-students",
    relatedFeaturePage: "/features/resume-ai",
    lastUpdated: "2026-03-10",
  },

  "f1-visa-job-search": {
    slug: "f1-visa-job-search",
    question: "How Do I Find F-1 Visa-Friendly Jobs?",
    shortAnswer: "Target companies with H-1B sponsorship history, tech/consulting/finance roles, and use job boards filtering for visa sponsorship. Networking is crucial for OPT and H-1B opportunities.",
    category: "career",
    faqItems: [
      { question: "Which job sites list visa-sponsoring companies?", answer: "LinkedIn (filter 'visa sponsorship'), Indeed, Glassdoor, Levels.fyi, Y Combinator, and niche sites like OPTical.jobs list sponsoring employers." },
      { question: "What company sizes sponsor H-1B most?", answer: "Large tech/consulting companies (Google, Microsoft, Accenture) sponsor heavily. Some mid-size and startups also sponsor — check their history." },
      { question: "How do I know if a company sponsors H-1B?", answer: "Check USCIS H-1B disclosure data (public records), research on Glassdoor/LinkedIn, or ask HR directly during interviews." },
      { question: "Should I disclose visa status on applications?", answer: "You can mention 'actively seeking sponsorship' in your resume/cover letter, or wait until interviews when asked. Being upfront filters non-sponsors." },
    ],
    relatedBlogPost: "f1-visa-jobs-guide",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-10",
  },

  "international-student-tax-filing": {
    slug: "international-student-tax-filing",
    question: "How Do International Students File Taxes?",
    shortAnswer: "F-1 students typically file Form 1040-NR as non-resident aliens, claiming FICA exemption via Form 8843, and may benefit from tax treaties with their home country.",
    category: "tax-finance",
    faqItems: [
      { question: "What form do F-1 students file?", answer: "Typically Form 1040-NR (U.S. Non-resident Alien Tax Return). File 1040-NR if you're classified as a non-resident alien for tax purposes." },
      { question: "When do I become a resident alien for tax purposes?", answer: "After 5+ calendar years in the U.S., or by meeting the 'substantial presence' test (183+ days in the past 3 years), you become a resident alien." },
      { question: "What is Form 8843?", answer: "Form 8843 claims FICA tax exemption. F-1 students are exempt from Social Security/Medicare taxes on wages. File this to claim the exemption." },
      { question: "Do I qualify for tax treaty benefits?", answer: "Many countries have tax treaties with the U.S. reducing taxes on scholarships, fellowships, and wages. Check if your home country has a treaty." },
    ],
    relatedBlogPost: "f1-student-tax-filing-guide",
    relatedFeaturePage: "/features/tax-filing",
    lastUpdated: "2026-03-10",
  },

  "green-card-sponsorship-from-employment": {
    slug: "green-card-sponsorship-from-employment",
    question: "Can My Employer Sponsor Me for a Green Card?",
    shortAnswer: "Yes. Employers can sponsor green cards (EB-3 skilled worker or EB-1C specialty occupation). Process takes 3-10 years and requires labor certification (PERM).",
    category: "career",
    faqItems: [
      { question: "What is the green card sponsorship process?", answer: "Step 1: Labor Certification (PERM, 6-18 months). Step 2: Immigration Petition (I-140, 4-6 months). Step 3: Consular Processing (4-12 months). Total: 3-10 years typical." },
      { question: "How much does employer green card sponsorship cost?", answer: "Employer typically pays $5,000-15,000 in total legal and filing fees. Some employers require employees to contribute; terms vary by company." },
      { question: "Do I need to stay with one employer for the entire green card process?", answer: "No. After I-140 approval, you can change employers if your new role is 'same or similar.' Before I-140, changing employers restarts the process." },
      { question: "How long can I stay on H-1B while green card is pending?", answer: "You can extend H-1B beyond 6 years if a green card petition (I-140) is pending. Extensions called 'AC21 extensions.' Total possible: 8-10+ years." },
    ],
    relatedBlogPost: "opt-to-h1b-transition",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-10",
  },

  "f1-visa-departure-requirements": {
    slug: "f1-visa-departure-requirements",
    question: "What Do I Need to Do When Leaving the U.S. on F-1?",
    shortAnswer: "Get your I-20 signed by your school indicating departure, exit the U.S. legally within your grace period, and notify USCIS if transitioning to another visa status.",
    category: "opt-basics",
    faqItems: [
      { question: "What documents do I need to depart on F-1?", answer: "Valid passport, I-20 (signed by DSO indicating completion/departure), and proof of departure (flight booking or exit record). USCIS doesn't require advance notice." },
      { question: "Do I need USCIS permission to leave?", answer: "No. USCIS doesn't approve departures. Just ensure you're in valid status (F-1 with endorsed I-20) when you leave." },
      { question: "What if I don't get my I-20 signed for departure?", answer: "Departing without signed I-20 may result in 'unlawful departure' records, complicating re-entry. Always get DSO signature before leaving." },
      { question: "Can I return to the U.S. after leaving on F-1?", answer: "Yes. Re-entry is possible with a new I-20 and valid F-1 status (or another visa). Unlawful departures complicate re-entry." },
    ],
    relatedBlogPost: "can-you-travel-on-opt",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-10",
  },

  "can-i-be-self-employed-on-opt": {
    slug: "can-i-be-self-employed-on-opt",
    question: "Can I Be Self-Employed on OPT?",
    shortAnswer: "No. OPT requires you to be employed by a U.S. employer. Self-employment, freelancing, and independent contracting do not qualify as valid OPT employment.",
    category: "opt-basics",
    faqItems: [
      { question: "What counts as valid OPT employment?", answer: "Valid OPT employment means being employed by a U.S. business, corporation, non-profit, or government agency. You must be on their payroll with W-2 or proper contractor documentation." },
      { question: "Can I work as a freelancer or contractor?", answer: "Freelancing and 1099 contracting can be valid if you have an ongoing contract with a primary U.S. employer. Sporadic gig work or multiple short-term contracts don't qualify." },
      { question: "Can I start my own business on OPT?", answer: "No. Owning or operating your own business is not permitted on OPT. You must be employed by another entity. Consider H-1B or green card sponsorship to explore entrepreneurship." },
      { question: "What if I want to become an entrepreneur?", answer: "After OPT ends, you can explore L-1 visa (if your business qualifies) or EB green card sponsorship. You cannot operate a business while on F-1 or OPT." },
    ],
    relatedBlogPost: "opt-employment-requirements",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-12",
  },

  "what-is-rfe-uscis": {
    slug: "what-is-rfe-uscis",
    question: "What is a Request for Evidence (RFE)?",
    shortAnswer: "An RFE is an official USCIS request for additional documents or information to process your application. Responding promptly (within deadlines) is critical to avoid denial.",
    category: "opt-basics",
    faqItems: [
      { question: "Why would USCIS send me an RFE?", answer: "USCIS sends RFEs when they need clarification, missing documents, or additional evidence. Common triggers: incomplete forms, signature issues, unclear job description, or identity verification needs." },
      { question: "How much time do I have to respond to an RFE?", answer: "You typically have 30-99 days to respond to an RFE (deadline stated in the notice). Missing the deadline results in automatic denial unless you file a motion." },
      { question: "What should I include in my RFE response?", answer: "Include all requested documents, a cover letter explaining each item, copies of original documents, and correspondence references (receipt number). Send via registered mail for proof of delivery." },
      { question: "What happens after I submit my RFE response?", answer: "USCIS reviews your new evidence. Processing continues normally. If satisfied, your application is approved. If not, you may receive another RFE or denial." },
    ],
    relatedBlogPost: "uscis-rfe-guide",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-12",
  },

  "what-is-e-verify": {
    slug: "what-is-e-verify",
    question: "What is E-Verify?",
    shortAnswer: "E-Verify is a federal system that confirms your work authorization and identity. STEM OPT employers MUST be E-Verify enrolled; non-STEM OPT employers may be required depending on federal contracts.",
    category: "opt-basics",
    faqItems: [
      { question: "How does E-Verify work?", answer: "On your first day, your employer enters your I-9 information (passport, EAD card) into E-Verify. The system verifies your data against SSA and DHS records within 72 hours." },
      { question: "What if E-Verify shows a mismatch?", answer: "E-Verify notifications may indicate a mismatch. You have 10 days to resolve with SSA. Most mismatches are resolved quickly through SSA's tentative non-confirmation process." },
      { question: "Is E-Verify mandatory for all employers?", answer: "E-Verify is mandatory for STEM OPT employers. For non-STEM OPT, it's required only if your employer has federal contracts. Private employers may use it voluntarily." },
      { question: "Does E-Verify affect my privacy or status?", answer: "E-Verify is a federal employment verification system. It doesn't affect your visa status negatively. Your information is matched against government records for work eligibility." },
    ],
    relatedBlogPost: "e-verify-guide-opt",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-12",
  },

  "what-is-curricular-practical-training": {
    slug: "what-is-curricular-practical-training",
    question: "What is Curricular Practical Training (CPT)?",
    shortAnswer: "CPT is paid work experience during your academic program (while enrolled). It counts toward your degree requirements and is authorized by your international student advisor (DSO).",
    category: "opt-basics",
    faqItems: [
      { question: "How is CPT different from OPT?", answer: "CPT happens during studies (while enrolled in school). OPT happens after graduation. CPT counts toward your degree; OPT does not. Excessive CPT reduces your OPT duration." },
      { question: "How much CPT can I use?", answer: "You can use CPT throughout your academic career. If you use more than 12 months of full-time CPT, your OPT is reduced proportionally (1 month full-time = 3 months OPT reduction)." },
      { question: "How do I apply for CPT?", answer: "Meet with your International Student Office (DSO) with your job offer letter. Your DSO endorses your I-20 for CPT work. No USCIS filing required — authorization is through your school." },
      { question: "Can I work full-time or part-time on CPT?", answer: "Part-time CPT (10-20 hours/week during school) doesn't reduce OPT. Full-time CPT (40+ hours/week) counts toward the 12-month limit. Your DSO determines eligibility based on semester schedule." },
    ],
    relatedBlogPost: "day-1-cpt-vs-opt",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-12",
  },

  "what-is-dso-international-student-advisor": {
    slug: "what-is-dso-international-student-advisor",
    question: "What is a DSO (Designated School Official)?",
    shortAnswer: "A DSO is your international student advisor at your school. They maintain your I-20, authorize work permissions (OPT/CPT), report to SEVIS, and ensure F-1 compliance throughout your stay.",
    category: "opt-basics",
    faqItems: [
      { question: "What are my DSO's responsibilities?", answer: "Your DSO manages your I-20 document, certifies OPT/CPT applications, reports employment to SEVIS (Student Tracking System), verifies your full-time enrollment, and ensures visa status compliance." },
      { question: "When do I need to contact my DSO?", answer: "Contact your DSO for OPT/CPT authorization, I-20 updates, address changes, travel endorsements, visa status questions, or any immigration-related concerns. Early communication is crucial." },
      { question: "What information does my DSO have access to?", answer: "Your DSO has access to SEVIS records: enrollment status, F-1 authorization dates, OPT/CPT history, employment details, passport/visa status, and dependent information. They report to federal authorities." },
      { question: "What if I can't reach my DSO?", answer: "Most schools have multiple DSO staff. Contact the international student office directly. Many schools offer email/phone support. Issues affecting status warrant urgent follow-up." },
    ],
    relatedBlogPost: "international-student-office-guide",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-12",
  },

  "how-long-grace-period-after-opt": {
    slug: "how-long-grace-period-after-opt",
    question: "How Long is the Grace Period After OPT Expires?",
    shortAnswer: "You have a 60-day grace period after OPT expires to depart the U.S., apply for another visa status, or resolve status issues. Beyond 60 days, you're overstaying.",
    category: "opt-basics",
    faqItems: [
      { question: "When does the 60-day grace period start?", answer: "The grace period begins on the date your OPT authorization expires (shown on your EAD card). You must depart or transition to another status by day 60." },
      { question: "Can I work during the grace period?", answer: "No. Once OPT expires, you're technically out of status. Working during the grace period is illegal, even if you're actively processing for H-1B or another visa." },
      { question: "What should I do during the grace period?", answer: "Finalize travel plans, visit family, or prepare for H-1B filing (if eligible). Do not work. If applying for H-1B, ensure it's filed before OPT expires to trigger cap-gap." },
      { question: "What if I can't leave in 60 days?", answer: "If facing hardship, consult an immigration attorney immediately. Overstaying triggers a 3-year re-entry bar and potential deportation. Options are limited once the grace period expires." },
    ],
    relatedBlogPost: "opt-grace-period-guide",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-12",
  },

  "can-i-work-remotely-on-opt": {
    slug: "can-i-work-remotely-on-opt",
    question: "Can I Work Remotely on OPT?",
    shortAnswer: "Yes, you can work remotely on OPT for a U.S. employer. The work must be in your field, and you must be physically in the U.S. (remote does not mean traveling abroad).",
    category: "opt-basics",
    faqItems: [
      { question: "Do I need special approval to work from home on OPT?", answer: "No. Remote work does not require additional OPT authorization. Your employer can have you work from home, a coffee shop, or another location as long as you're in the U.S." },
      { question: "Can I work remotely for a foreign company?", answer: "Working for a foreign company remotely from the U.S. is not valid OPT employment. You must be employed by a U.S. entity (even if they're a subsidiary of a foreign company)." },
      { question: "What if my employer wants me to work from my home country?", answer: "You cannot work remotely from abroad on OPT. OPT requires you to be physically in the U.S. If you travel outside, OPT terminates. You would need a work visa for your home country." },
      { question: "Are there compliance requirements for remote work?", answer: "No special compliance for remote work. Maintain your employment in your field, keep 90-day unemployment rule compliance, and ensure your employer meets all standard OPT requirements." },
    ],
    relatedBlogPost: "remote-work-on-opt",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-12",
  },

  "what-is-perm-labor-certification": {
    slug: "what-is-perm-labor-certification",
    question: "What is PERM Labor Certification?",
    shortAnswer: "PERM is the first step in employer-sponsored green card sponsorship. It proves no available U.S. workers exist for your position, clearing the path for visa sponsorship.",
    category: "career",
    faqItems: [
      { question: "When does my employer need to file PERM?", answer: "PERM is typically filed 1-2 years into your employment, after your employer is confident in long-term sponsorship. Timing varies by industry and company policy." },
      { question: "How long does PERM labor certification take?", answer: "PERM processing averages 6-24 months depending on your occupation and labor market. Some cases are expedited; others face audit requirements extending timelines." },
      { question: "Can I work while PERM is pending?", answer: "Yes. While PERM is pending, continue working on OPT (or any valid status). PERM approval doesn't grant work authorization — it simply clears the path for visa sponsorship." },
      { question: "What happens after PERM is approved?", answer: "Once PERM is approved, your employer can file for EB-3 green card sponsorship (I-140). This is the next step toward permanent residency and typically takes 2-5 years total." },
    ],
    relatedBlogPost: "perm-labor-certification-guide",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-12",
  },

  "can-i-have-multiple-jobs-on-opt": {
    slug: "can-i-have-multiple-jobs-on-opt",
    question: "Can I Have Multiple Jobs on OPT?",
    shortAnswer: "Yes. OPT allows you to work multiple jobs simultaneously, as long as both are in your field of study and you maintain valid employment status (not exceeding 90 days unemployment).",
    category: "opt-basics",
    faqItems: [
      { question: "Do I need approval to work multiple jobs?", answer: "No approval needed. However, you must report all employers to maintain accurate employment records. Your DSO may request employment verification for compliance." },
      { question: "How many jobs can I work simultaneously?", answer: "No legal limit. You can work 2, 3, or more jobs simultaneously. Both must be in your field, and total time should allow valid employment status throughout your OPT." },
      { question: "What if I switch from one job to another?", answer: "Job switching is permitted on OPT. When leaving one employer, your unemployment clock starts. Find new employment within 90 cumulative days to maintain compliance." },
      { question: "Does working multiple jobs affect the 90-day unemployment rule?", answer: "Working multiple jobs helps you stay compliant. Each day you're employed (even part-time) at any job counts as 'employed,' not unemployment. This protects your status." },
    ],
    relatedBlogPost: "multiple-jobs-on-opt",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-12",
  },

  "what-counts-as-full-time-employment": {
    slug: "what-counts-as-full-time-employment",
    question: "What Counts as Full-Time Employment on OPT?",
    shortAnswer: "Full-time employment on OPT is typically 40+ hours per week in your field of study. Part-time work counts as employment but may not satisfy STEM OPT employment minimums.",
    category: "opt-basics",
    faqItems: [
      { question: "What is the minimum hours for full-time on OPT?", answer: "Full-time is generally defined as 40 hours/week in your employment contract. Some employers define full-time as 35+ hours. Part-time (20-39 hours/week) is also valid OPT employment." },
      { question: "Does STEM OPT require full-time employment?", answer: "STEM OPT does not mandate full-time. However, your I-983 training plan should reflect your actual work hours and ensure skills development aligns with your contract." },
      { question: "Can I work part-time on OPT?", answer: "Yes. Part-time employment (any hours) is valid OPT work. However, ensure you're not exceeding 90 days cumulative unemployment. Multiple part-time jobs can cover compliance." },
      { question: "What if my employment status changes from full-time to part-time?", answer: "Status changes are permitted. Notify your employer and consider informing your DSO. Part-time work still counts as employment, protecting your 90-day unemployment limit." },
    ],
    relatedBlogPost: "opt-employment-requirements",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-12",
  },

  "can-i-work-for-my-own-startup-on-opt": {
    slug: "can-i-work-for-my-own-startup-on-opt",
    question: "Can I Work for My Own Startup on OPT?",
    shortAnswer: "No. OPT requires you to be employed by an existing U.S. business. Ownership or founding does not qualify. Consider H-1B visa or green card sponsorship for startup opportunities.",
    category: "opt-basics",
    faqItems: [
      { question: "What if I'm joining an early-stage startup as an employee?", answer: "You can work for a startup as an employee (on payroll), even if it's early-stage. The startup must be a registered U.S. business entity with proper payroll systems." },
      { question: "Can I be a co-founder while on OPT?", answer: "No. Co-founders own equity and make business decisions, disqualifying them from OPT. USCIS considers ownership as self-employment, not valid employment." },
      { question: "What if I have equity but work as an employee?", answer: "Having equity (stock options) while being a formal W-2 employee may be acceptable, depending on your role and USCIS interpretation. Consult an immigration attorney before accepting equity." },
      { question: "When can I start my own company?", answer: "After OPT or another valid status. H-1B visa allows employment only; you'd need EB green card sponsorship or an investor visa (like E-2) to explore entrepreneurship." },
    ],
    relatedBlogPost: "entrepreneurship-and-visas",
    relatedFeaturePage: "/features/job-tracker",
    lastUpdated: "2026-03-12",
  },

  "what-if-company-goes-bankrupt-on-opt": {
    slug: "what-if-company-goes-bankrupt-on-opt",
    question: "What If My Company Goes Bankrupt While I'm on OPT?",
    shortAnswer: "If your employer files bankruptcy, your OPT continues as long as the company still operates. If it permanently closes, you have 90 days to find new employment before risking out-of-status.",
    category: "opt-basics",
    faqItems: [
      { question: "Does my OPT end automatically if my employer closes?", answer: "No. Your OPT authorization (EAD) remains valid even if your employer closes. You can immediately seek new employment in your field without losing OPT status." },
      { question: "What if I'm laid off due to bankruptcy?", answer: "Layoffs don't affect OPT directly. However, you're now unemployed. You have 90 cumulative days to find new employment. Start job searching immediately to avoid exceeding this limit." },
      { question: "Do I need to inform USCIS if my employer closes?", answer: "You should notify your DSO of employment changes for record-keeping. USCIS doesn't require direct notification, but your DSO may report employment status changes." },
      { question: "What if I can't find a job before the 90-day limit?", answer: "After 90 days of cumulative unemployment, you're out of status. You must depart or apply for another visa status (H-1B, green card sponsorship) to remain legally." },
    ],
    relatedBlogPost: "job-loss-on-opt",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-12",
  },

  "can-i-defer-opt-start-date": {
    slug: "can-i-defer-opt-start-date",
    question: "Can I Defer My OPT Start Date?",
    shortAnswer: "Yes. Your OPT must begin within 14 months of graduation, but you can choose when to start within that window. Deferring is useful for additional studies or planning.",
    category: "opt-basics",
    faqItems: [
      { question: "How do I defer my OPT start date?", answer: "When filing your OPT application (I-765), specify your intended start date. USCIS will process it for that date (typically 30-60 days before your preferred start)." },
      { question: "What's the latest I can start OPT after graduation?", answer: "OPT must begin within 14 months of your graduation date. If you graduate in May, you must start OPT by July of the following year at the latest." },
      { question: "Why would I defer OPT?", answer: "Common reasons: pursuing additional certifications, higher studies (masters), family obligations, or waiting for a better job market. Deferral is strategic." },
      { question: "Can I work on other visas while deferring OPT?", answer: "You cannot work while deferring. If you need to work before OPT, apply for CPT during studies. After graduation without OPT, you're not authorized to work." },
    ],
    relatedBlogPost: "opt-start-date-deferral",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-12",
  },

  "what-is-form-i-129-h1b": {
    slug: "what-is-form-i-129-h1b",
    question: "What is Form I-129 (H-1B Petition)?",
    shortAnswer: "Form I-129 is the H-1B visa petition filed by your employer with USCIS. It requests work authorization for you and requires evidence of specialty occupation employment and prevailing wage.",
    category: "h1b",
    faqItems: [
      { question: "Who files Form I-129?", answer: "Your employer's HR or immigration attorney files Form I-129 with USCIS. You don't file directly. Your employer pays all filing fees ($460-$1,500+, depending on company size and premium processing)." },
      { question: "What information is required on Form I-129?", answer: "Required: employer details, your personal information, job title, job description (proving specialty occupation), location, salary (meeting prevailing wage), education/credentials, and prior work history." },
      { question: "When can my employer file I-129?", answer: "Filings open in early March each year for October 1 start dates. Your employer files in March if the position starts October 1. Filing windows vary by visa category." },
      { question: "How long is I-129 processing after filing?", answer: "Regular processing takes 2-4 weeks. Premium processing (additional $1,500 fee) guarantees 15-day response. After cap lottery (if needed), processing continues, totaling 2-6 months." },
    ],
    relatedBlogPost: "i-129-h1b-petition-guide",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-12",
  },

  "can-i-apply-for-green-card-directly": {
    slug: "can-i-apply-for-green-card-directly",
    question: "Can I Apply for a Green Card Directly Without H-1B?",
    shortAnswer: "Yes. Your employer can sponsor you for a green card directly from OPT (EB-3 category). Requiring H-1B is not a must, though H-1B is often easier logistically.",
    category: "career",
    faqItems: [
      { question: "What's the process for direct green card sponsorship?", answer: "Your employer files PERM labor certification first (proving no U.S. workers available), then EB-3 immigrant petition (I-140), then adjustment of status or consular processing." },
      { question: "How long does direct green card sponsorship take?", answer: "Total timeline: 5-10 years. PERM (1-2 years), I-140 (0.5-1 year), visa processing (2-3 years), plus potential visa bulletin waits depending on your country." },
      { question: "Is direct sponsorship easier than H-1B?", answer: "H-1B is quicker (annual lottery, 12-36 months total) but temporary. Green card sponsorship takes longer but grants permanent residency. Choice depends on timeline and career goals." },
      { question: "Can I stay on OPT while my green card is processed?", answer: "Typically yes. You can remain on OPT (and renew STEM extension if eligible) while PERM and I-140 are pending. Your employer maintains your employment." },
    ],
    relatedBlogPost: "green-card-sponsorship-guide",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-12",
  },

  "what-is-visa-transfer-vs-change-of-status": {
    slug: "what-is-visa-transfer-vs-change-of-status",
    question: "What is Visa Transfer vs Change of Status?",
    shortAnswer: "Visa transfer is changing visas at a U.S. port of entry (consulate abroad). Change of status adjusts your visa while in the U.S. through USCIS. Change of status is faster and available for some workers.",
    category: "h1b",
    faqItems: [
      { question: "What is Change of Status (COS)?", answer: "COS adjusts your visa status while you're in the U.S. without leaving and returning to your home country. Your employer files I-539 or I-140, and USCIS processes it at a local office." },
      { question: "What is Consular Processing?", answer: "Consular processing requires you to interview at a U.S. embassy/consulate in your home country. Your visa is stamped in your passport, allowing re-entry to the U.S. with the new status." },
      { question: "Which is faster: COS or consular processing?", answer: "COS is typically faster (4-6 months local processing). Consular is slower (6-12+ months depending on country). Medical and security clearances extend timelines for consular." },
      { question: "Can I choose COS or consular processing?", answer: "For H-1B, COS is generally available if you're in the U.S. on a valid visa (OPT qualifies). Some fields/nationalities may require consular. Consult your immigration attorney." },
    ],
    relatedBlogPost: "h1b-change-of-status-guide",
    relatedFeaturePage: "/features/sponsors",
    lastUpdated: "2026-03-12",
  },

  "how-long-does-rfe-response-take": {
    slug: "how-long-does-rfe-response-take",
    question: "How Long Does USCIS Take to Respond to My RFE?",
    shortAnswer: "After submitting an RFE response, USCIS typically reviews within 30 days to 6 months depending on case complexity. Processing times vary significantly by office location.",
    category: "opt-basics",
    faqItems: [
      { question: "When should I expect a response to my RFE?", answer: "USCIS targets 30-90 days for RFE review, but complex cases may require 6+ months. Tracking via your receipt number on USCIS.gov provides updates. Contact your local USCIS office if significantly delayed." },
      { question: "What happens if USCIS doesn't respond by the expected time?", answer: "processing delays are common. If your expected approval time passes, file an N-652 expedite request or contact your local USCIS office. Some delays are routine; excessive delays warrant inquiry." },
      { question: "Can I work while waiting for RFE response?", answer: "If your original OPT EAD is still valid, you can continue working. If your EAD expires while RFE is pending, working is not authorized unless you have another status (cap-gap, etc.)." },
      { question: "What if USCIS denies my RFE response?", answer: "Denial usually means your evidence was insufficient. You can file a Motion to Reopen if you have new evidence. For OPT specifically, re-applying is rare after denial; consult an immigration attorney." },
    ],
    relatedBlogPost: "uscis-rfe-response-timeline",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-12",
  },

  "can-i-study-part-time-while-on-opt": {
    slug: "can-i-study-part-time-while-on-opt",
    question: "Can I Study Part-Time While on OPT?",
    shortAnswer: "Yes. You can pursue part-time studies (online courses, evening classes) while on OPT without affecting your work authorization. Full-time re-enrollment may change your status.",
    category: "opt-basics",
    faqItems: [
      { question: "Can I take evening classes while working on OPT?", answer: "Yes. Attending evening or part-time classes while on OPT is permitted and doesn't require any changes to your authorization. Your OPT status remains unchanged." },
      { question: "What if I want to enroll full-time in another program?", answer: "Full-time re-enrollment switches your status back to F-1 student. This ends OPT. You'd need to reapply for OPT after graduating from the new program." },
      { question: "Can I take online courses while on OPT?", answer: "Yes. Online courses and part-time distance learning are permitted. Most aren't considered 'enrollment' for immigration purposes. Part-time online studies don't affect your OPT." },
      { question: "Do I need to inform my DSO if I'm taking classes?", answer: "Informing your DSO of part-time classes is optional (no official requirement). However, if you enroll full-time later, you must notify your DSO to switch back to F-1 status." },
    ],
    relatedBlogPost: "continuing-education-on-opt",
    relatedFeaturePage: "/features/case-status",
    lastUpdated: "2026-03-12",
  },

  "what-happens-if-i-violate-opt-conditions": {
    slug: "what-happens-if-i-violate-opt-conditions",
    question: "What Happens If I Violate OPT Conditions?",
    shortAnswer: "Violating OPT conditions (working off-the-books, out of field, exceeding 90 days unemployment) results in loss of status, potential deportation, and bars from future visa sponsorship.",
    category: "opt-basics",
    faqItems: [
      { question: "What are the main OPT violations?", answer: "Major violations: working without authorization, working outside your field of study, exceeding 90-day unemployment, working for non-approved employers, or failing to maintain valid identity documents." },
      { question: "What if I unknowingly violate OPT?", answer: "Accidental violations can still result in out-of-status determination. USCIS doesn't typically differentiate intent. However, documentation of the accident helps in appeals (consult an attorney immediately)." },
      { question: "What are the consequences of OPT violation?", answer: "You lose OPT authorization immediately, become out of status, and must depart within 60 days. Subsequent violations trigger deportation proceedings and a 3-10 year re-entry bar." },
      { question: "Can I recover from an OPT violation?", answer: "Recovery is difficult but possible with legal intervention. Consult an immigration attorney immediately to explore options: reinstatement, Cancellation of Removal, or voluntary departure with future waivers." },
    ],
    relatedBlogPost: "opt-violations-consequences",
    relatedFeaturePage: "/features/compliance",
    lastUpdated: "2026-03-12",
  },
};
