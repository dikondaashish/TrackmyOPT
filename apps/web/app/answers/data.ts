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
};
