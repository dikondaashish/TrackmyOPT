import Link from "next/link";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import {
    GraduationCap,
    FlaskConical,
    Clock,
    Briefcase,
    FileText,
    ArrowRightLeft,
    DollarSign,
    Heart,
    Database,
    ArrowRight,
    BookOpen,
    CheckCircle2,
} from "lucide-react";

const categories = [
    {
        id: "opt-basics",
        label: "OPT Basics",
        description: "Core facts about Optional Practical Training for F-1 students",
        icon: GraduationCap,
        color: "blue",
        facts: [
            "OPT (Optional Practical Training) allows F-1 students to work in the United States for up to 12 months after completing their degree.",
            "OPT is authorized by USCIS and requires approval of Form I-765, Application for Employment Authorization.",
            "F-1 students may apply for pre-completion OPT while still enrolled in school, working part-time (20 hours/week) during the academic year or full-time during breaks.",
            "Post-completion OPT begins after the student's program end date and allows full-time employment for up to 12 months.",
            "Pre-completion OPT time used is deducted from the 12-month post-completion OPT period at a rate of one day for every two days of part-time work.",
            "Students must apply for OPT no earlier than 90 days before their program end date and no later than 60 days after.",
            "OPT employment must be directly related to the student's major field of study as listed on their I-20.",
            "An Employment Authorization Document (EAD) card is issued upon OPT approval, and students may not begin working until the EAD start date.",
            "Students on post-completion OPT must report any changes in employment, address, or name to their DSO within 10 days.",
            "Each higher level of education (bachelor's, master's, doctorate) qualifies for a new 12-month OPT period.",
            "OPT is available to F-1 students who have been enrolled full-time for at least one full academic year.",
            "Students may not accrue more than 90 days of unemployment while on post-completion OPT.",
            "OPT authorization ends automatically if the student transfers to a new school or begins a new program of study at a higher education level.",
            "Volunteering or unpaid internships may count as employment for OPT purposes if the work is directly related to the student's field of study.",
            "The OPT EAD card lists the student's employer as \"Not Applicable\" because the student may work for any employer in their field of study.",
        ],
    },
    {
        id: "stem-opt",
        label: "STEM OPT Extension",
        description: "Facts about the 24-month STEM OPT extension program",
        icon: FlaskConical,
        color: "emerald",
        facts: [
            "The STEM OPT extension adds 24 months of work authorization beyond the initial 12-month OPT, for a total of 36 months.",
            "STEM OPT is available only to students who earned a degree in a STEM-designated field listed on the DHS STEM Designated Degree Program List.",
            "To qualify for STEM OPT, the student must be employed by an employer enrolled in E-Verify.",
            "A Form I-983, Training Plan for STEM OPT Students, must be completed and signed by both the student and the employer before filing the STEM OPT extension.",
            "Students must apply for the STEM OPT extension before their initial 12-month OPT expires.",
            "STEM OPT applicants are allowed a maximum of 150 days of unemployment throughout the entire 36-month OPT period (initial + extension combined).",
            "Students on STEM OPT must report to their DSO every six months to confirm employment status, and the DSO must validate the student's SEVIS record.",
            "A student may receive a maximum of two STEM OPT extensions in their lifetime, each based on a different qualifying STEM degree.",
            "The employer must attest on Form I-983 that the STEM OPT student will not replace a full-time, part-time, temporary, or permanent U.S. worker.",
            "STEM OPT students must be paid at a rate commensurate with similarly situated U.S. workers; they cannot be unpaid.",
            "If a STEM OPT application is filed on time (before the initial OPT expires), the student receives an automatic 180-day employment authorization extension while the application is pending.",
            "The DHS STEM Designated Degree Program List is updated periodically and includes fields such as computer science, engineering, mathematics, biological sciences, and physical sciences.",
        ],
    },
    {
        id: "timelines",
        label: "Timelines & Deadlines",
        description: "Critical dates, processing times, and grace periods",
        icon: Clock,
        color: "purple",
        facts: [
            "F-1 students have a 60-day grace period after their OPT end date to depart the United States, change status, or transfer to a new school.",
            "OPT applications should be filed no earlier than 90 days before the program end date and no later than 60 days after.",
            "USCIS processing time for Form I-765 (OPT EAD) typically ranges from 3 to 5 months, though times can vary.",
            "Students may request expedited processing of Form I-765 if they can demonstrate severe financial loss, emergency situations, or other qualifying criteria.",
            "The STEM OPT extension application must be received by USCIS before the expiration of the initial 12-month OPT EAD.",
            "An F-1 student's program end date is listed on their I-20 and determines the start of OPT eligibility windows.",
            "Students who apply for a change of status (e.g., F-1 to H-1B) before their OPT expires may remain in the US while the application is pending.",
            "The H-1B cap-gap extension automatically extends F-1 status and OPT work authorization from April 1 through September 30 for students with pending or approved H-1B petitions.",
            "F-1 students entering the US for the first time may arrive up to 30 days before their program start date.",
            "A student on post-completion OPT must secure employment within 90 days of the OPT start date or the OPT end date, whichever is earlier, to avoid exceeding the unemployment limit.",
            "DSOs must report the completion, withdrawal, or termination of a student's program in SEVIS within 21 days.",
            "The annual H-1B registration period typically opens in early March, with petitions filed starting April 1 for an October 1 start date.",
        ],
    },
    {
        id: "employment",
        label: "Employment Rules",
        description: "Work authorization rules, employer requirements, and compliance",
        icon: Briefcase,
        color: "amber",
        facts: [
            "F-1 students on post-completion OPT may work for multiple employers simultaneously, as long as all employment is related to their field of study.",
            "Self-employment is permitted on OPT if the student has proper business licenses, works in their field of study, and actively engages in the business.",
            "F-1 students on OPT may work as independent contractors (1099) as long as the work is related to their major.",
            "An F-1 student may not begin any employment, including OPT, until they have received their EAD card and the employment start date has been reached.",
            "On-campus employment is permitted for F-1 students during their studies, limited to 20 hours per week while school is in session.",
            "Curricular Practical Training (CPT) is an alternative to OPT that allows employment during the student's program, but 12 months or more of full-time CPT eliminates post-completion OPT eligibility.",
            "Severe Economic Hardship employment authorization may be granted to F-1 students who experience unforeseen financial difficulties beyond their control.",
            "F-1 students with pending OPT applications may not work until they receive EAD approval, except for students with a pending STEM OPT extension who receive the 180-day auto-extension.",
            "Employment for OPT purposes includes paid employment, self-employment, contract work (including short-term gigs), employment through staffing agencies, and work for hire.",
            "Employer changes while on OPT must be reported to the student's DSO within 10 days so the DSO can update SEVIS.",
            "F-1 students may not work off-campus without specific USCIS or DSO authorization such as OPT, CPT, or economic hardship.",
            "An employer is not required to sponsor an F-1 student for OPT; the student applies for OPT independently through USCIS.",
            "Day-one CPT programs are permitted by regulation, but USCIS may scrutinize them and they can affect future immigration benefits.",
            "STEM OPT employers must have a bona fide employer-employee relationship with the student, meaning staffing or temp agencies cannot be the direct employer.",
            "Remote work is permitted on OPT, provided the employment is in the student's field of study and the employer is a US-based entity.",
        ],
    },
    {
        id: "uscis-forms",
        label: "USCIS & Forms",
        description: "Immigration forms, SEVP Portal, and USCIS procedures",
        icon: FileText,
        color: "cyan",
        facts: [
            "Form I-765 is the application used to request an Employment Authorization Document (EAD) for OPT.",
            "Form I-20, Certificate of Eligibility for Nonimmigrant Student Status, must be updated with an OPT recommendation by the student's DSO before filing I-765.",
            "Form I-983, Training Plan for STEM OPT Students, is required for the STEM OPT extension and must be signed by both the student and employer.",
            "Form I-94, Arrival/Departure Record, documents a student's legal entry into the US and can be retrieved online at i94.cbp.dhs.gov.",
            "SEVIS (Student and Exchange Visitor Information System) is the database used by DSOs and the government to track F-1 students' immigration status.",
            "The SEVP Portal (sevp.ice.gov/opt) allows OPT students to report employment information, employer changes, and address updates directly.",
            "Each F-1 student is assigned a unique SEVIS ID number (beginning with N) that appears on their I-20 and is used across all immigration documents.",
            "Form I-797, Notice of Action, is sent by USCIS to confirm receipt of a petition (receipt notice) or approval/denial of a benefit.",
            "Students must retain copies of all I-20s ever issued to them, as they may be needed for future immigration applications.",
            "USCIS case status can be checked online at egov.uscis.gov/casestatus using the receipt number from Form I-797.",
            "A student's DSO (Designated School Official) is the primary point of contact for all OPT-related SEVIS updates and I-20 endorsements.",
            "Form I-539 is used to apply for a change of nonimmigrant status or extension of stay in the United States.",
        ],
    },
    {
        id: "h1b-transition",
        label: "H-1B Transition",
        description: "Transitioning from OPT to H-1B work visa",
        icon: ArrowRightLeft,
        color: "rose",
        facts: [
            "The H-1B visa allows US employers to temporarily employ foreign workers in specialty occupations requiring at least a bachelor's degree.",
            "The annual H-1B regular cap is 65,000 visas, with an additional 20,000 reserved for applicants holding a US master's degree or higher.",
            "H-1B petitions are filed by the employer on behalf of the foreign worker using Form I-129, Petition for Nonimmigrant Worker.",
            "Since 2020, USCIS has used an electronic registration system for the H-1B lottery; selected registrants are then invited to file full petitions.",
            "The H-1B cap-gap provision automatically extends F-1 status and OPT/STEM OPT employment authorization for students with a timely filed or approved H-1B petition until October 1.",
            "H-1B workers are tied to their sponsoring employer; changing employers requires a new H-1B petition to be filed by the new employer.",
            "The H-1B visa is initially granted for up to 3 years and can be extended for a total maximum of 6 years.",
            "Cap-exempt H-1B employers include universities, nonprofit research organizations, and government research organizations, and their petitions are not subject to the annual cap.",
            "An approved I-140 (Immigrant Petition) allows H-1B holders to extend their H-1B status beyond the 6-year maximum in one-year or three-year increments under AC21.",
            "The H-1B prevailing wage requirement means the employer must pay at least the prevailing wage for the occupation and geographic area.",
            "F-1 students selected in the H-1B lottery who have valid OPT or STEM OPT can continue working until the H-1B start date of October 1.",
            "H-1B registration fees are paid by the employer and include the base filing fee, ACWIA training fee, fraud prevention fee, and potentially the asylum program fee.",
        ],
    },
    {
        id: "tax-finance",
        label: "Tax & Finance",
        description: "Tax obligations, FICA exemption, and financial rules for F-1 students",
        icon: DollarSign,
        color: "orange",
        facts: [
            "F-1 students are classified as nonresident aliens for tax purposes during their first 5 calendar years in the United States under the Substantial Presence Test exemption.",
            "F-1 students who are nonresident aliens are exempt from FICA taxes (Social Security and Medicare) during their first 5 calendar years in the US.",
            "Nonresident alien F-1 students file their federal tax return using Form 1040-NR and must also file Form 8843, Statement for Exempt Individuals.",
            "All F-1 students — even those with no US income — must file Form 8843 each year to document their exempt status under the Substantial Presence Test.",
            "After 5 calendar years in the US, F-1 students generally become resident aliens for tax purposes and must pay FICA taxes and file Form 1040.",
            "F-1 students from countries with US tax treaties (such as India, China, South Korea, and Germany) may be eligible for reduced tax rates or exemptions on certain types of income.",
            "The US-India tax treaty (Article 21) provides an exemption of up to $2,000 per year for F-1 students from India during their nonresident alien period.",
            "The US-China tax treaty (Article 20) provides an exemption of up to $5,000 per year for F-1 students from China during their nonresident alien period.",
            "F-1 students cannot claim the standard deduction on Form 1040-NR; nonresident aliens may only claim itemized deductions for state/local taxes, charitable contributions to US organizations, and casualty/theft losses.",
            "F-1 students who are nonresident aliens cannot file jointly with a spouse, claim the Earned Income Tax Credit, or claim dependents in most cases.",
            "State tax filing requirements for F-1 students vary by state; some states (like Texas, Florida, and Washington) have no state income tax.",
            "If an employer incorrectly withholds FICA taxes from an F-1 student's paycheck during the exempt period, the student should first request a refund from the employer; if unsuccessful, they can file Form 843 and Form 8316 with the IRS.",
        ],
    },
    {
        id: "health-insurance",
        label: "Health Insurance",
        description: "Healthcare coverage requirements and options for F-1 students",
        icon: Heart,
        color: "pink",
        facts: [
            "Most US universities require F-1 students to maintain health insurance as a condition of enrollment, though this is a school requirement, not a federal immigration requirement.",
            "F-1 students on OPT who are no longer enrolled in school typically lose access to university-sponsored health insurance plans and must obtain their own coverage.",
            "F-1 students are generally not eligible for the Affordable Care Act (ACA) marketplace subsidies because they are nonresident aliens, but they may purchase full-price marketplace plans.",
            "Nonresident alien F-1 students were exempt from the ACA individual mandate penalty (which was reduced to $0 federally starting in 2019, though some states still enforce their own mandates).",
            "Short-term health insurance plans are available to OPT students and can provide temporary coverage, but they typically do not cover pre-existing conditions and have limited benefits.",
            "Some employers offer health insurance benefits to OPT employees, including those on EAD-based work authorization.",
            "F-1 students who become resident aliens for tax purposes (after 5 years) may be eligible for ACA marketplace subsidies if they meet income requirements.",
            "Travel health insurance is recommended for F-1 students traveling outside the US, as domestic health plans may not cover medical expenses abroad.",
            "STEM OPT students employed full-time are often eligible for employer-sponsored health insurance plans on the same terms as other employees.",
            "University health insurance plans typically include coverage for mental health services, which is important given that international students face unique adjustment challenges.",
            "COBRA continuation coverage may be available to OPT students who lose employer-sponsored health insurance, allowing them to maintain the same plan for up to 18 months at full cost plus a 2% administrative fee.",
            "F-1 students transitioning from university coverage to OPT should apply for new health insurance within 60 days of losing student coverage to qualify for a Special Enrollment Period under the ACA.",
            "Dental and vision insurance are typically not included in basic health plans and must be purchased separately by F-1 and OPT students who want comprehensive coverage.",
        ],
    },
];

const colorStyles: Record<
    string,
    { bg: string; border: string; icon: string; accent: string; badge: string; factBg: string }
> = {
    blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        accent: "bg-blue-600 dark:bg-blue-500",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        factBg: "bg-blue-50/50 dark:bg-blue-900/10",
    },
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: "text-emerald-600 dark:text-emerald-400",
        accent: "bg-emerald-600 dark:bg-emerald-500",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        factBg: "bg-emerald-50/50 dark:bg-emerald-900/10",
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400",
        accent: "bg-purple-600 dark:bg-purple-500",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
        factBg: "bg-purple-50/50 dark:bg-purple-900/10",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        accent: "bg-amber-600 dark:bg-amber-500",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        factBg: "bg-amber-50/50 dark:bg-amber-900/10",
    },
    cyan: {
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        border: "border-cyan-200 dark:border-cyan-800",
        icon: "text-cyan-600 dark:text-cyan-400",
        accent: "bg-cyan-600 dark:bg-cyan-500",
        badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
        factBg: "bg-cyan-50/50 dark:bg-cyan-900/10",
    },
    rose: {
        bg: "bg-rose-50 dark:bg-rose-900/20",
        border: "border-rose-200 dark:border-rose-800",
        icon: "text-rose-600 dark:text-rose-400",
        accent: "bg-rose-600 dark:bg-rose-500",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
        factBg: "bg-rose-50/50 dark:bg-rose-900/10",
    },
    orange: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200 dark:border-orange-800",
        icon: "text-orange-600 dark:text-orange-400",
        accent: "bg-orange-600 dark:bg-orange-500",
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
        factBg: "bg-orange-50/50 dark:bg-orange-900/10",
    },
    pink: {
        bg: "bg-pink-50 dark:bg-pink-900/20",
        border: "border-pink-200 dark:border-pink-800",
        icon: "text-pink-600 dark:text-pink-400",
        accent: "bg-pink-600 dark:bg-pink-500",
        badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
        factBg: "bg-pink-50/50 dark:bg-pink-900/10",
    },
};

const totalFacts = categories.reduce((sum, cat) => sum + cat.facts.length, 0);

const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "OPT & F-1 Visa Facts Database",
    description:
        "100+ verified facts about OPT, STEM OPT, F-1 visa, H-1B transition, taxes, and US immigration for international students.",
    url: "https://www.trackmyopt.com/ai-facts",
    license: "https://creativecommons.org/licenses/by/4.0/",
    publisher: {
        "@type": "Organization",
        name: "TrackMyOPT",
        url: "https://www.trackmyopt.com",
    },
    dateModified: "2026-02-01",
    keywords: [
        "OPT",
        "STEM OPT",
        "F-1 visa",
        "H-1B",
        "immigration",
        "international students",
        "EAD",
        "USCIS",
    ],
    variableMeasured: categories.map((cat) => ({
        "@type": "PropertyValue",
        name: cat.label,
        value: `${cat.facts.length} facts`,
    })),
};

const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "100+ OPT & F-1 Visa Facts",
    url: "https://www.trackmyopt.com/ai-facts",
    speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".fact-item"],
    },
};

export default function AIFactsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(datasetSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(speakableSchema),
                }}
            />

            {/* Hero */}
            <section className="py-16 sm:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                        <Database className="w-4 h-4" />
                        {totalFacts} Verified Facts
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        OPT & F-1 Visa{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Facts Database
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                        A structured, machine-readable collection of {totalFacts}+ verified
                        facts about Optional Practical Training, STEM OPT, F-1
                        student visas, H-1B transitions, taxes, and US
                        immigration — designed for accuracy and citation.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Last Updated: February 2026
                    </p>
                </div>
            </section>

            {/* Category Navigation */}
            <section className="pb-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => {
                            const styles = colorStyles[cat.color];
                            const Icon = cat.icon;
                            return (
                                <a
                                    key={cat.id}
                                    href={`#${cat.id}`}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${styles.border} ${styles.badge} hover:opacity-80`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.label}
                                    <span className="opacity-60">
                                        ({cat.facts.length})
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Facts by Category */}
            <section className="pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                    {categories.map((cat) => {
                        const styles = colorStyles[cat.color];
                        const Icon = cat.icon;

                        return (
                            <div key={cat.id} id={cat.id} className="scroll-mt-28">
                                <div className="flex items-start gap-4 mb-8">
                                    <div
                                        className={`p-3 rounded-2xl ${styles.bg} border ${styles.border} flex-shrink-0`}
                                    >
                                        <Icon
                                            className={`w-7 h-7 ${styles.icon}`}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            {cat.label}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            {cat.description} —{" "}
                                            <span className={styles.icon}>
                                                {cat.facts.length} facts
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {cat.facts.map((fact, idx) => (
                                        <div
                                            key={idx}
                                            className={`fact-item flex items-start gap-4 p-5 rounded-xl border ${styles.border} bg-white dark:bg-gray-800/50 transition-all hover:shadow-md`}
                                        >
                                            <span
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white ${styles.accent} flex-shrink-0 mt-0.5`}
                                            >
                                                {idx + 1}
                                            </span>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {fact}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Summary Stats */}
            <section className="py-16 bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
                        Facts at a Glance
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {categories.map((cat) => {
                            const styles = colorStyles[cat.color];
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={cat.id}
                                    className={`text-center p-5 rounded-xl border ${styles.border} bg-white dark:bg-gray-800/50`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${styles.icon} mx-auto mb-2`}
                                    />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {cat.facts.length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {cat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-8">
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold">
                            <CheckCircle2 className="w-5 h-5" />
                            {totalFacts} Total Verified Facts
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Resources */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                        Explore More Resources
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-10">
                        Dive deeper into OPT, F-1 visa, and immigration topics
                        with our detailed answers, glossary, and guides.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link
                            href="/answers"
                            className="group flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                        >
                            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                OPT & F-1 Answers
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm flex-1">
                                Expert answers to the most common questions
                                about OPT, STEM OPT, H-1B, and immigration.
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-4 font-medium">
                                Browse Answers
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        <Link
                            href="/glossary"
                            className="group flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-lg"
                        >
                            <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Immigration Glossary
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm flex-1">
                                Definitions for every key immigration term —
                                OPT, SEVIS, EAD, DSO, CPT, and more.
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mt-4 font-medium">
                                Browse Glossary
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        <Link
                            href="/blog"
                            className="group flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg"
                        >
                            <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                In-Depth Guides
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm flex-1">
                                Comprehensive guides on OPT applications, tax
                                filing, health insurance, and career planning.
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 mt-4 font-medium">
                                Read Guides
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
