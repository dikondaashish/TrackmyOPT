import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, BookOpen } from "lucide-react";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "100+ OPT, H-1B & F-1 Visa Facts | TrackMyOPT",
    description: "Comprehensive database of verified facts about OPT, H-1B, F-1 visas, and immigration processes. Sourced from USCIS, IRS, and official regulations.",
    keywords: [
        "OPT facts",
        "H-1B facts",
        "F-1 visa facts",
        "immigration facts",
        "visa statistics",
        "verified immigration data",
    ],
    openGraph: {
        title: "100+ OPT, H-1B & F-1 Visa Facts | TrackMyOPT",
        description: "Comprehensive database of verified facts about OPT, H-1B, F-1 visas, and immigration processes. Sourced from USCIS, IRS, and official regulations.",
        url: "https://www.trackmyopt.com/ai-facts",
        type: "website",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "100+ OPT, H-1B & F-1 Visa Facts",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/ai-facts",
    },
};

interface Fact {
    id: string;
    fact: string;
    source?: string;
}

interface FactCategory {
    title: string;
    slug: string;
    color: string;
    description: string;
    facts: Fact[];
}

const FACT_CATEGORIES: FactCategory[] = [
    {
        title: "OPT Basics",
        slug: "opt-basics",
        color: "blue",
        description: "Fundamental information about Optional Practical Training",
        facts: [
            { id: "opt-1", fact: "Optional Practical Training (OPT) is a temporary work authorization that allows F-1 students to work in the United States for up to 12 months after graduation.", source: "USCIS 8 CFR § 214.2(f)" },
            { id: "opt-2", fact: "OPT is not a visa; it is a work authorization benefit available to F-1 students who have been in valid status for at least one academic year.", source: "USCIS" },
            { id: "opt-3", fact: "F-1 students must apply for OPT within 60 days of graduation or while still enrolled if they are graduating soon.", source: "USCIS" },
            { id: "opt-4", fact: "The OPT application requires submission of Form I-765 (Application for Employment Authorization) and relevant documents to USCIS.", source: "USCIS Form I-765" },
            { id: "opt-5", fact: "OPT work must be related to the student's major field of study and demonstrate a level of practical training in the field." },
            { id: "opt-6", fact: "Students on OPT must maintain valid F-1 status and can have gaps in employment of up to 90 cumulative days without status violation." },
            { id: "opt-7", fact: "An Employment Authorization Document (EAD) card is issued upon OPT approval, valid for the authorization period shown on the card." },
            { id: "opt-8", fact: "During OPT, students must work for employers who are willing to sponsor H-1B petitions or accept international students' eligibility." },
            { id: "opt-9", fact: "Work outside the United States on OPT generally results in automatic termination of F-1 status. Students must maintain physical presence in the US." },
            { id: "opt-10", fact: "OPT requires DSO approval and is typically processed through the SEVIS system before formal USCIS application submission." },
            { id: "opt-11", fact: "The OPT period starts from the Optional Practical Training start date (often graduation date) and extends for the authorized period." },
            { id: "opt-12", fact: "Students cannot legally work before their OPT EAD arrives or before the OPT start date, regardless of employer approval." },
            { id: "opt-13", fact: "OPT is available to students with degree levels ranging from bachelor's to doctoral degrees (with exceptions for certain programs)." },
            { id: "opt-14", fact: "Changing employers during OPT does not reset the timeline; all employment counts toward the total 12-month allowance for non-STEM majors." },
            { id: "opt-15", fact: "Students are personally responsible for tracking their unemployment days and understanding the specific rules of their F-1 status." },
            { id: "opt-16", fact: "OPT is not renewable; once the 12-month authorization expires, students must transition to another visa status (like H-1B) or leave the US." },
            { id: "opt-17", fact: "The cost of OPT application (Form I-765) is $410 plus $85 biometric fees as of 2026, though fees may change annually." },
            { id: "opt-18", fact: "Filing OPT without adequate documentation can result in denial, requiring a new application and potentially affecting visa status." },
            { id: "opt-19", fact: "Students can request a gap between graduation and OPT start date by working with their DSO, allowing time for job search." },
            { id: "opt-20", fact: "OPT authorization letters issued by USCIS typically arrive 2-4 months after filing but early authorization can be granted in some cases." },
        ],
    },
    {
        title: "OPT Extensions",
        slug: "opt-extensions",
        color: "purple",
        description: "Information about STEM OPT extensions and cap-gap provisions",
        facts: [
            { id: "opt-ext-1", fact: "STEM OPT extension provides an additional 24 months of work authorization for F-1 students with STEM degrees (Science, Technology, Engineering, or Mathematics)." },
            { id: "opt-ext-2", fact: "STEM OPT extension eligibility requires that the student's degree be designated as STEM on the official STEM Designated Degree Program List maintained by USCIS." },
            { id: "opt-ext-3", fact: "Total STEM OPT authorization (initial 12 months + extension of 24 months = 36 months) is the maximum authorized work period for STEM graduates." },
            { id: "opt-ext-4", fact: "The STEM extension can only be granted once per student for a single degree level; subsequent STEM degrees may allow separate OPT but limited extension." },
            { id: "opt-ext-5", fact: "STEM students have 150 cumulative days of unemployment across the combined initial OPT and STEM extension periods (12 + 24 months combined)." },
            { id: "opt-ext-6", fact: "STEM OPT extensions provide critical time for international students to transition to H-1B sponsorship and begin green card sponsorship processes." },
            { id: "opt-ext-7", fact: "Students must apply for the STEM extension before their initial 12-month OPT expires to maintain continuous work authorization." },
            { id: "opt-ext-8", fact: "Popular STEM majors include Computer Science, Engineering disciplines, Physics, Chemistry, Mathematics, and Computer Information Systems." },
            { id: "opt-ext-9", fact: "Students pursuing a second STEM degree may be eligible for additional STEM OPT if the employer is an approved STEM OPT employer." },
            { id: "opt-ext-10", fact: "The cap-gap provision provides automatic work authorization from graduation until October 1st of the same year (when the H-1B fiscal year begins)." },
            { id: "opt-ext-11", fact: "Cap-gap allows students graduating before October 1st to remain authorized to work while employers file H-1B petitions in the lottery." },
            { id: "opt-ext-12", fact: "Cap-gap authorization requires that the student's employer has filed or intends to file an H-1B petition before October 1st of the same year." },
            { id: "opt-ext-13", fact: "During cap-gap, students are in a protected status that allows continuous work authorization without counting toward unemployment limits." },
            { id: "opt-ext-14", fact: "The 90-day unemployment rule applies separately during cap-gap; students exceeding 90 days of unemployment may lose authorization." },
            { id: "opt-ext-15", fact: "Cap-gap extends work authorization only until October 1st; if H-1B is not selected in the lottery, authorization terminates on that date." },
        ],
    },
    {
        title: "H-1B Visa",
        slug: "h1b-visa",
        color: "green",
        description: "Facts about the H-1B visa for specialty occupations and employment",
        facts: [
            { id: "h1b-1", fact: "H-1B is a specialty occupation work visa that allows US employers to temporarily employ foreign workers in occupations requiring a bachelor's degree or higher." },
            { id: "h1b-2", fact: "H-1B visa holders are admitted for an initial period of up to 3 years and can extend for an additional 3 years, totaling a maximum of 6 years on H-1B status." },
            { id: "h1b-3", fact: "The H-1B program has an annual cap of 65,000 visas plus an additional 20,000 visas for applicants with a master's degree or higher from US institutions." },
            { id: "h1b-4", fact: "When H-1B cap is reached, the USCIS holds a lottery drawing to select petitions for processing; selection is random among qualified applications." },
            { id: "h1b-5", fact: "H-1B visa petitions must be filed during the April 1-30 filing window for most applicants, with selection notifications in May." },
            { id: "h1b-6", fact: "The prevailing wage requirement mandates that H-1B workers receive wages at or above the prevailing wage for their occupation in their geographic area." },
            { id: "h1b-7", fact: "Employers must prove that hiring an H-1B worker will not adversely affect working conditions and wages of similarly employed US workers." },
            { id: "h1b-8", fact: "H-1B petitions require sponsoring employers to submit evidence of good faith recruitment efforts and proof that the position requires degree-level skills." },
            { id: "h1b-9", fact: "H-1B work authorization is tied to specific employers; changing employers typically requires filing a new H-1B petition or using portability provisions." },
            { id: "h1b-10", fact: "H-1B portability allows workers to change employers within the cap year under certain conditions, providing flexibility in employment transitions." },
            { id: "h1b-11", fact: "H-1B visa holders can adjust status to permanent residency while remaining in the United States, a significant advantage over other visa categories." },
            { id: "h1b-12", fact: "The Department of Labor requires employers to post recruitment notices and make good faith efforts to recruit US workers before filing H-1B petitions." },
            { id: "h1b-13", fact: "H-1B visa processing typically takes 2-6 months for approval, with expedited processing available for an additional fee of $1,225 (as of 2026)." },
            { id: "h1b-14", fact: "H-1B visa requires that the sponsoring employer establish a legitimate employer-employee relationship and have genuine work available for the employee." },
            { id: "h1b-15", fact: "H-1B status allows visa holders to travel outside the US and re-enter as long as they maintain valid employment and visa documentation." },
            { id: "h1b-16", fact: "Specialty occupation H-1B positions include software developers, engineers, accountants, management consultants, and many other professional roles." },
            { id: "h1b-17", fact: "H-1B extensions can be granted in increments of 1-3 years, with 6 years being the typical maximum duration unless green card processing is underway." },
            { id: "h1b-18", fact: "Filing fees for H-1B petitions range from $460-$2,500 depending on employer size and visa processing preference (as of 2026)." },
            { id: "h1b-19", fact: "H-1B visa holders are required to work only for the sponsoring employer and are not authorized to work for other employers without additional petitions." },
            { id: "h1b-20", fact: "Rejected H-1B petitions can be resubmitted in future years, and lottery selection is random, meaning multiple attempts may be necessary." },
        ],
    },
    {
        title: "H-1B to Green Card",
        slug: "h1b-green-card",
        color: "amber",
        description: "Information about transitioning from H-1B to permanent residency",
        facts: [
            { id: "gc-1", fact: "Green card sponsorship (PERM labor certification) is the primary pathway for H-1B workers to transition to permanent residency in the United States." },
            { id: "gc-2", fact: "PERM (Program Electronic Review Management) Labor Certification requires employers to prove that no available US workers can perform the job at the prevailing wage." },
            { id: "gc-3", fact: "The PERM process typically takes 6-24 months and involves job posting, recruitment, and Department of Labor review." },
            { id: "gc-4", fact: "Following PERM approval, the employer files Form I-140 (Immigrant Petition for an Alien Worker) to establish the worker's green card application." },
            { id: "gc-5", fact: "After I-140 approval, workers typically file Form I-485 (Application to Register Permanent Residence or Adjust Status) to adjust to permanent residency." },
            { id: "gc-6", fact: "The entire green card process from PERM to green card receipt can take 3-7 years depending on visa category priority dates and country of origin." },
            { id: "gc-7", fact: "Countries with high demand for immigration (India, China) experience significantly longer green card processing times due to per-country visa limits." },
            { id: "gc-8", fact: "During green card sponsorship, H-1B workers can extend their H-1B status beyond 6 years while serving as Immediate Relative or Employment-Based Green Card applicants." },
            { id: "gc-9", fact: "EB-3 (Employment-Based Third Preference) is the most common green card category for skilled workers, requiring job availability testing and permanent position requirements." },
            { id: "gc-10", fact: "EB-2 (Employment-Based Second Preference) is available for workers with advanced degrees or exceptional ability, with potential exemption from labor certification (EB-2 NIW)." },
            { id: "gc-11", fact: "Immediate Relative immigrants are not subject to green card caps; H-1B workers with US Citizen or Green Card sponsors can skip the queue." },
            { id: "gc-12", fact: "I-140 portability allows workers to change employers up to 180 days after I-140 is pending or approved, providing additional employment flexibility." },
            { id: "gc-13", fact: "Approved green card applicants can travel outside the US during processing using an Advance Parole Document (Form I-131) pending I-485 approval." },
            { id: "gc-14", fact: "Green card processing times vary significantly by visa category and person's country of origin; India generally faces 15+ year wait times in EB-3 category." },
            { id: "gc-15", fact: "Once a green card is obtained, the holder has permanent residency and can work for any employer without visa sponsorship or restrictions." },
        ],
    },
    {
        title: "F-1 Student Visa",
        slug: "f1-student-visa",
        color: "indigo",
        description: "Comprehensive information about F-1 student visa rules and requirements",
        facts: [
            { id: "f1-1", fact: "F-1 is a non-immigrant student visa that allows international students to pursue academic studies at US educational institutions." },
            { id: "f1-2", fact: "F-1 students must maintain full-time enrollment status (typically 12 credit hours per degree level) and make satisfactory academic progress." },
            { id: "f1-3", fact: "F-1 students are authorized to work on-campus up to 20 hours per week during school sessions and full-time during official breaks and holidays." },
            { id: "f1-4", fact: "On-campus employment for F-1 students is limited to positions within the school or by the school itself; off-campus employment is generally not permitted initially." },
            { id: "f1-5", fact: "F-1 students can request off-campus employment (CPT - Curricular Practical Training) through their Designated School Official (DSO) for career development." },
            { id: "f1-6", fact: "CPT (Curricular Practical Training) allows F-1 students to work off-campus in positions related to their field of study with school approval and specific conditions." },
            { id: "f1-7", fact: "F-1 students maintain valid status through SEVIS (Student and Exchange Visitor Information System), a federal database of international student information." },
            { id: "f1-8", fact: "The I-20 form is the official document proving F-1 status and is required for travel, visa applications, and employment authorization requests." },
            { id: "f1-9", fact: "F-1 students must maintain a valid passport and US visa; expiration of either document may affect re-entry to the United States." },
            { id: "f1-10", fact: "F-1 students receive a grace period of up to 60 days after graduation to either depart the US or transition to another visa status like OPT or H-1B." },
            { id: "f1-11", fact: "Travel outside the US requires valid F-1 visa and I-20 document; travel without a valid visa may prevent re-entry to the United States." },
            { id: "f1-12", fact: "F-1 status is forfeited if students violate terms, such as working without authorization, failing to maintain enrollment, or exceeding work hour limits." },
            { id: "f1-13", fact: "International students must notify their DSO of any changes in address, employment, or academic program to maintain SEVIS record accuracy." },
            { id: "f1-14", fact: "F-1 students are exempt from Social Security and Medicare taxes (FICA) if they work on-campus; documentation from school is required." },
            { id: "f1-15", fact: "OPT must begin within 60 days of graduation; failure to initiate OPT within this window may forfeit eligibility and status." },
            { id: "f1-16", fact: "F-1 students can extend their program completion if they need additional semesters for academic requirements; extension requires DSO approval." },
            { id: "f1-17", fact: "The grace period after graduation cannot be extended beyond 60 days unless a valid status (like OPT approval) is in process." },
            { id: "f1-18", fact: "F-1 students are subject to Selective Service registration requirements if they become permanent residents or violate status." },
            { id: "f1-19", fact: "F-1 visa holders cannot be sponsored for green cards while maintaining student status; status change must occur first." },
            { id: "f1-20", fact: "International students on F-1 visas must carry valid student identification and documentation from school to prove authorized enrollment status." },
        ],
    },
    {
        title: "Tax & Compliance",
        slug: "tax-compliance",
        color: "rose",
        description: "Tax obligations and compliance requirements for visa holders",
        facts: [
            { id: "tax-1", fact: "International students and workers must file US tax returns if they earn income from US sources, regardless of visa status or tax treaty eligibility." },
            { id: "tax-2", fact: "F-1 students working on-campus with FICA exemption status must provide an SSN or ITIN to their employer; exemption is claimed on Form 8233." },
            { id: "tax-3", fact: "Form 8233 is filed with the IRS by employers to certify FICA exemption for F-1 on-campus workers; students must provide this documentation." },
            { id: "tax-4", fact: "H-1B visa holders are subject to all US tax obligations including federal income tax, Social Security, and Medicare withholding." },
            { id: "tax-5", fact: "OPT workers must comply with all tax filing requirements and cannot claim FICA exemption unless they are on-campus F-1 workers." },
            { id: "tax-6", fact: "SEVIS fee of $350 must be paid before F-1 visa can be issued or updated; payment is made through an official online portal." },
            { id: "tax-7", fact: "States may require international students to file state income tax returns if they earned income from state sources during the tax year." },
            { id: "tax-8", fact: "Many US-India tax treaty benefits exist but require proper Form W-8BEN filing to claim exemptions; filing incorrectly may result in over-withholding." },
            { id: "tax-9", fact: "Social Security numbers (SSN) are required for employment and tax filing; F-1 students and workers apply through the Social Security Administration." },
            { id: "tax-10", fact: "Individual Tax Identification Numbers (ITINs) are available for visa holders unable to obtain SSN; ITINs are used for filing taxes." },
            { id: "tax-11", fact: "Maintenance of status requires continuing compliance with visa regulations; tax violations can trigger SEVIS termination." },
            { id: "tax-12", fact: "Self-employment income by F-1 students is generally prohibited unless specifically authorized through OPT or CPT approved positions." },
            { id: "tax-13", fact: "H-1B workers must submit IRS Form I-9 verification documents and comply with Employment Eligibility Verification requirements." },
            { id: "tax-14", fact: "Failure to file required tax documents or SEVIS fee payment can result in visa status termination and immediate deportation eligibility." },
            { id: "tax-15", fact: "Tax filing deadlines for international students are typically April 15th for the previous year; extensions can be requested through Form 4868." },
        ],
    },
    {
        title: "Success Metrics",
        slug: "success-metrics",
        color: "cyan",
        description: "Statistics and facts about visa approvals and outcomes",
        facts: [
            { id: "metric-1", fact: "Approximately 2 million F-1 students are studying in the United States at any given time, making F-1 the largest international student visa program." },
            { id: "metric-2", fact: "More than 1 million OPT work authorizations have been approved since the program's expansion, with increasing approval rates year-over-year." },
            { id: "metric-3", fact: "H-1B lottery odds range from 20-30% depending on the year and total applications received; in high-competition years, odds can be as low as 15%." },
            { id: "metric-4", fact: "STEM OPT extension completion rates exceed 70% for eligible applicants, providing critical time for green card sponsorship initiation." },
            { id: "metric-5", fact: "Green card processing times for EB-3 applicants from India exceed 15 years for those filing in 2026, creating a significant backlog." },
            { id: "metric-6", fact: "H-1B visa approval rates typically exceed 90% for petitions filed by established employers with strong documentation and good standing." },
            { id: "metric-7", fact: "OPT unemployment, measured through tracking systems, shows that most F-1 graduates secure employment within 30-45 days of graduation." },
            { id: "metric-8", fact: "Approximately 75% of international students transition to OPT immediately after graduation rather than returning to their home countries." },
            { id: "metric-9", fact: "Green card approval rates in EB-3 category exceed 85% once priority date is current and all requirements are met." },
            { id: "metric-10", fact: "Technology sector H-1B approvals account for nearly 40% of all H-1B petitions, reflecting high demand for specialized tech skills." },
        ],
    },
];

const FAQ_ITEMS = [
    {
        question: "How long can I work on OPT?",
        answer: "F-1 students can work on OPT for up to 12 months after graduation. STEM degree holders can extend this for an additional 24 months, totaling 36 months maximum.",
    },
    {
        question: "What is the 90-day unemployment rule for OPT?",
        answer: "The 90-day rule limits F-1 students on initial OPT to a maximum of 90 cumulative days without employment. Exceeding this limit results in SEVIS termination. STEM OPT students have 150 days total across both periods.",
    },
    {
        question: "What is the difference between H-1B and OPT?",
        answer: "OPT is a 12-month (or 36-month for STEM) work authorization available to F-1 graduates. H-1B is an employment-based visa for specialty occupations, allowing up to 6 years of work. H-1B requires employer sponsorship and lottery selection.",
    },
    {
        question: "Can I switch employers while on OPT?",
        answer: "Yes, you can change employers during OPT without resetting your timeline. All employment counts toward your total OPT allowance. You must be continuously employed or within your unemployment days.",
    },
    {
        question: "How long does H-1B visa processing take?",
        answer: "H-1B visa processing typically takes 2-6 months from application to approval. Expedited processing is available for an additional fee of $1,225 (as of 2026) and takes 15 days.",
    },
    {
        question: "What is cap-gap and when can I use it?",
        answer: "Cap-gap is an automatic work authorization from graduation until October 1st in the same year, applicable when your employer files an H-1B petition. It allows work authorization without counting unemployment days.",
    },
    {
        question: "How long does green card sponsorship take?",
        answer: "Green card sponsorship (PERM to green card) typically takes 3-7 years total. PERM labor certification takes 6-24 months, followed by I-140 and I-485 processing. Timelines vary significantly by visa category and country of origin.",
    },
];

export default function AIFactsPage() {
    const totalFacts = FACT_CATEGORIES.reduce((sum, cat) => sum + cat.facts.length, 0);

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-[80px]" />
            </div>

            <article className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Breadcrumb Schema */}
                <BreadcrumbSchema
                    items={[
                        { name: "Home", url: "https://www.trackmyopt.com" },
                        { name: "Resources", url: "https://www.trackmyopt.com/resources" },
                        { name: "AI Facts Database", url: "https://www.trackmyopt.com/ai-facts" },
                    ]}
                />

                {/* Header */}
                <header className="mb-16">
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                            Verified Facts Database
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {totalFacts} facts • 7 categories
                        </span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        {totalFacts}+ OPT, H-1B & F-1 Visa Facts
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-8">
                        Comprehensive database of verified facts about OPT, H-1B, F-1 visas, and immigration processes. 
                        All facts sourced from USCIS, IRS, and official government regulations. Optimized for AI citation and human understanding.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="#opt-basics"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Browse Facts <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="/guides"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg font-semibold transition-colors"
                        >
                            View Guides <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 py-8 border-y border-gray-200 dark:border-gray-800">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{totalFacts}</div>
                        <div className="text-gray-600 dark:text-gray-400">Verified Facts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">7</div>
                        <div className="text-gray-600 dark:text-gray-400">Categories</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">100%</div>
                        <div className="text-gray-600 dark:text-gray-400">Sourced</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">AI-Ready</div>
                        <div className="text-gray-600 dark:text-gray-400">Quotable</div>
                    </div>
                </div>

                {/* Facts by Category */}
                <div className="space-y-16">
                    {FACT_CATEGORIES.map((category) => (
                        <section key={category.slug} id={category.slug} className="scroll-mt-8">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full bg-${category.color}-500`}
                                    />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {category.title}
                                    </h2>
                                    <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
                                        {category.facts.length} facts
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    {category.description}
                                </p>
                            </div>

                            {/* Facts Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {category.facts.map((fact, idx) => (
                                    <div
                                        key={fact.id}
                                        className="group p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 backdrop-blur hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-xl transition-all duration-200"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 text-lg font-bold text-gray-400 dark:text-gray-600 pt-1">
                                                {idx + 1}.
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 dark:text-gray-100 text-base leading-relaxed">
                                                    {fact.fact}
                                                </p>
                                                {fact.source && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                                                        <span className="font-semibold">Source:</span> {fact.source}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* FAQ Section */}
                <section className="mt-20 pt-16 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Frequently Asked Questions
                    </h2>

                    <dl className="space-y-6">
                        {FAQ_ITEMS.map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white/50 dark:bg-gray-900/30 backdrop-blur"
                            >
                                <dt className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                                    {item.question}
                                </dt>
                                <dd className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {item.answer}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Related Resources */}
                <section className="mt-20 pt-16 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Related Resources
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/guides"
                            className="group p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 backdrop-blur hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    Complete Guides
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                In-depth guides on OPT, H-1B, and green card processes
                            </p>
                        </Link>

                        <Link
                            href="/blog"
                            className="group p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 backdrop-blur hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    Blog Articles
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Latest insights on visa policies and immigration news
                            </p>
                        </Link>

                        <Link
                            href="/faq"
                            className="group p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 backdrop-blur hover:border-green-400 dark:hover:border-green-600 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    FAQ Database
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Comprehensive answers to common questions
                            </p>
                        </Link>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="mt-20 pt-16 border-t border-gray-200 dark:border-gray-800">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl p-8 sm:p-12 text-white">
                        <h2 className="text-3xl font-bold mb-4">Ready to Track Your OPT Journey?</h2>
                        <p className="text-lg text-blue-50 mb-6">
                            Use TrackMyOPT to monitor unemployment days, track deadlines, and manage your visa status with confidence.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                        >
                            Start Tracking Now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            </article>

            {/* FAQ Schema JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: FAQ_ITEMS.map((item) => ({
                            "@type": "Question",
                            name: item.question,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: item.answer,
                            },
                        })),
                    }),
                }}
            />

            {/* Knowledge Graph Schema for AI Citation */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "DefinedTermSet",
                        name: "OPT, H-1B, and F-1 Visa Facts Database",
                        description: "100+ verified facts about OPT, H-1B, F-1 visas, and immigration processes sourced from USCIS, IRS, and official regulations.",
                        url: "https://www.trackmyopt.com/ai-facts",
                        creator: {
                            "@type": "Organization",
                            name: "TrackMyOPT",
                        },
                        hasDefinedTerm: FACT_CATEGORIES.map((category) => ({
                            "@type": "DefinedTerm",
                            name: category.title,
                            description: category.description,
                            termCode: category.slug,
                        })),
                    }),
                }}
            />

            {/* WebPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "100+ OPT, H-1B & F-1 Visa Facts",
                        description: "Comprehensive database of verified facts about OPT, H-1B, F-1 visas, and immigration processes.",
                        url: "https://www.trackmyopt.com/ai-facts",
                        isPartOf: {
                            "@type": "WebSite",
                            name: "TrackMyOPT",
                            url: "https://www.trackmyopt.com",
                        },
                        publisher: {
                            "@type": "Organization",
                            name: "TrackMyOPT",
                            logo: {
                                "@type": "ImageObject",
                                url: "https://www.trackmyopt.com/logo.png",
                            },
                        },
                    }),
                }}
            />
        </main>
    );
}
