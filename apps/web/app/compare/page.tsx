import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    Briefcase,
    CheckCircle2,
    XCircle,
    Scale,
    GraduationCap,
    DollarSign,
    ArrowRightLeft,
    ExternalLink,
} from "lucide-react";

const optVsCptRows = [
    {
        feature: "Authorization Type",
        col1: "Post-completion work authorization tied to F-1 status",
        col2: "Curricular training authorized during enrollment as part of curriculum",
    },
    {
        feature: "Timing",
        col1: "After degree completion (post-completion OPT); limited pre-completion available",
        col2: "During active enrollment only — before graduation",
    },
    {
        feature: "Duration",
        col1: "12 months total (plus 24-month STEM extension if eligible)",
        col2: "Authorized per semester/term; no fixed total limit",
    },
    {
        feature: "Application Process",
        col1: "File Form I-765 with USCIS; takes 2–5 months to process",
        col2: "DSO authorizes directly on I-20; no USCIS filing required",
    },
    {
        feature: "Application Fee",
        col1: "$410 filing fee to USCIS (as of 2024)",
        col2: "No USCIS fee — authorized at the school level",
    },
    {
        feature: "Employer Restrictions",
        col1: "Any employer in the US; employment must be directly related to major field of study",
        col2: "Must be integral to curriculum; employer and role pre-approved by DSO",
    },
    {
        feature: "Part-Time vs Full-Time",
        col1: "Minimum 20 hours/week required; full-time permitted",
        col2: "Part-time while school is in session; full-time during breaks or after all coursework is complete",
    },
    {
        feature: "Employment Relationship",
        col1: "Standard employment, self-employment (with conditions), or contractor roles permitted",
        col2: "Must be an established part of the curriculum — internship, co-op, or practicum",
    },
    {
        feature: "Effect on Other Status",
        col1: "Does not affect CPT eligibility",
        col2: "12+ months of full-time CPT eliminates OPT eligibility entirely",
    },
    {
        feature: "Work Authorization Document",
        col1: "Employment Authorization Document (EAD card) issued by USCIS",
        col2: "Updated I-20 with CPT endorsement from DSO — no separate card",
    },
    {
        feature: "DSO Role",
        col1: "DSO recommends OPT in SEVIS; USCIS makes final decision",
        col2: "DSO has full authority to authorize CPT on the I-20",
    },
    {
        feature: "Unemployment Tracking",
        col1: "90-day unemployment limit (150 days with STEM extension); tracked by USCIS",
        col2: "No unemployment tracking — authorization is tied to the specific role",
    },
    {
        feature: "Multiple Employers",
        col1: "Yes — can work for multiple employers simultaneously",
        col2: "Each employer requires separate CPT authorization from DSO",
    },
];

const regularVsStemRows = [
    {
        feature: "Duration",
        col1: "12 months",
        col2: "Additional 24 months (36 months total with regular OPT)",
    },
    {
        feature: "Eligibility",
        col1: "Any completed degree level from a SEVP-certified school",
        col2: "Must hold a degree in a STEM-designated CIP code field",
    },
    {
        feature: "Unemployment Limit",
        col1: "90 days maximum during the 12-month OPT period",
        col2: "150 days total across the combined 36-month OPT + STEM period",
    },
    {
        feature: "Employer Requirements",
        col1: "Any US employer; role must relate to major field of study",
        col2: "Employer must be enrolled in E-Verify at the time of application",
    },
    {
        feature: "E-Verify Requirement",
        col1: "Not required",
        col2: "Mandatory — employer must have active E-Verify enrollment",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Training Plan (I-983)",
        col1: "Not required",
        col2: "Required — employer and student must complete Form I-983 with learning objectives",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Reporting Requirements",
        col1: "Report employer changes to DSO within 10 days",
        col2: "Validation reports every 6 months; annual self-evaluation; material change reports within 10 days",
    },
    {
        feature: "Self-Employment",
        col1: "Permitted if you can prove a bona fide business related to your field",
        col2: "Not permitted — must work for an E-Verify employer",
        col1Icon: "check",
        col2Icon: "x",
    },
    {
        feature: "Application",
        col1: "Form I-765 with initial OPT application to USCIS",
        col2: "Separate Form I-765 filed before regular OPT expires; $410 fee",
    },
    {
        feature: "Degree Requirement",
        col1: "Bachelor's, Master's, or Doctorate from SEVP-certified school",
        col2: "Must be a STEM degree on the DHS STEM Designated Degree Program List",
    },
    {
        feature: "Cap-Gap Extension",
        col1: "Eligible for automatic cap-gap if H-1B petition is filed",
        col2: "Eligible for automatic cap-gap if H-1B petition is filed",
        col1Icon: "check",
        col2Icon: "check",
    },
    {
        feature: "Travel Considerations",
        col1: "Need valid EAD, valid visa stamp, I-20 with travel signature, and job offer to re-enter",
        col2: "Same requirements; STEM extension applicants with pending I-765 should avoid travel",
    },
    {
        feature: "Multiple Uses",
        col1: "Available once per degree level (bachelor's, master's, etc.)",
        col2: "Can be used twice if you earn two qualifying STEM degrees at different levels",
    },
];

const optVsH1bRows = [
    {
        feature: "Immigration Status",
        col1: "F-1 student status with work authorization",
        col2: "H-1B specialty occupation worker status",
    },
    {
        feature: "Duration",
        col1: "12 months (or 36 months with STEM OPT extension)",
        col2: "3 years, renewable once for a total of 6 years",
    },
    {
        feature: "Employer Tied",
        col1: "Not tied to a single employer — can change employers freely with DSO notification",
        col2: "Employer-specific; changing jobs requires new H-1B petition (portability allows work while pending)",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Dual Intent",
        col1: "No dual intent — F-1 is a non-immigrant intent status; applying for green card can be risky",
        col2: "Dual intent allowed — can apply for permanent residency while on H-1B",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Application Process",
        col1: "Student files Form I-765 with USCIS for EAD",
        col2: "Employer files Form I-129 petition with USCIS on behalf of the worker",
    },
    {
        feature: "Annual Cap",
        col1: "No annual cap — available to all eligible F-1 graduates",
        col2: "65,000 regular cap + 20,000 US master's cap; selected by lottery",
        col1Icon: "check",
        col2Icon: "x",
    },
    {
        feature: "Minimum Salary",
        col1: "No minimum salary requirement (must be commensurate with field)",
        col2: "Must meet prevailing wage for the occupation, location, and experience level",
    },
    {
        feature: "Specialty Occupation",
        col1: "Employment must be related to field of study; no degree-level requirement for the role",
        col2: "Role must require at minimum a bachelor's degree in a specific specialty",
    },
    {
        feature: "Change Employer",
        col1: "Notify DSO; update SEVIS within 10 days; no new application needed",
        col2: "New employer files H-1B transfer petition; can start working upon receipt",
    },
    {
        feature: "Family Benefits",
        col1: "F-2 dependents cannot work and have limited activity options",
        col2: "H-4 dependents can study; H-4 EAD available if H-1B holder has approved I-140",
    },
    {
        feature: "Path to Green Card",
        col1: "No direct path — must change to another status (e.g., H-1B) first",
        col2: "Direct path through employer-sponsored PERM labor certification → I-140 → I-485",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Cost to Employer",
        col1: "Minimal — no employer-side filing required",
        col2: "$3,000–$10,000+ including filing fees, legal fees, and required employer-paid fees",
    },
    {
        feature: "FICA Tax Exemption",
        col1: "Exempt from Social Security and Medicare taxes for first 5 calendar years in F-1 status",
        col2: "Subject to all FICA taxes (Social Security + Medicare) from day one",
        col1Icon: "check",
        col2Icon: "x",
    },
];

const taxComparisonRows = [
    {
        feature: "Tax Form",
        col1: "Form 1040-NR (Non-Resident Alien income tax return)",
        col2: "Form 1040 (standard US income tax return)",
    },
    {
        feature: "Taxable Income",
        col1: "Only US-source income (wages, stipends, scholarships earned in the US)",
        col2: "Worldwide income — all income from any country must be reported",
    },
    {
        feature: "FICA Taxes (Social Security & Medicare)",
        col1: "Exempt during first 5 calendar years in F-1 status",
        col2: "Subject to FICA — Social Security (6.2%) and Medicare (1.45%) apply",
        col1Icon: "check",
        col2Icon: "x",
    },
    {
        feature: "Standard Deduction",
        col1: "Not available (limited to itemized deductions from US sources)",
        col2: "Full standard deduction available ($14,600 for single filers in 2024)",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Tax Treaty Benefits",
        col1: "Available — many countries have treaties reducing or eliminating tax on specific income types",
        col2: "Some treaty benefits may still apply, but availability varies by treaty and filing status",
        col1Icon: "check",
        col2Icon: "check",
    },
    {
        feature: "State Taxes",
        col1: "Required if working in a state with income tax; rules vary by state",
        col2: "Required if working in a state with income tax; same as any US resident",
    },
    {
        feature: "Filing Status Options",
        col1: 'Generally limited to "Single" or "Married Filing Separately"',
        col2: 'All options available: Single, Married Filing Jointly, Head of Household, etc.',
    },
    {
        feature: "Social Security Benefits",
        col1: "Cannot claim Social Security benefits as NRA",
        col2: "Can accumulate credits toward future Social Security benefits",
        col1Icon: "x",
        col2Icon: "check",
    },
    {
        feature: "Tax Software Compatibility",
        col1: "Must use NRA-compatible software (Sprintax, Glacier Tax Prep); TurboTax is NOT for NRAs",
        col2: "Can use any standard software (TurboTax, H&R Block, FreeTaxUSA, etc.)",
    },
    {
        feature: "Filing Deadline",
        col1: "April 15 (same as residents); Form 8843 must be filed even if no income",
        col2: "April 15 standard deadline with option to e-file",
    },
    {
        feature: "Substantial Presence Test",
        col1: "F-1 students are exempt for first 5 calendar years — counted as NRA regardless of days in US",
        col2: "Once the 5-year exemption ends, SPT determines residency based on days physically present",
    },
    {
        feature: "Stimulus / Tax Credits",
        col1: "Not eligible for most refundable credits (no stimulus payments, no EITC)",
        col2: "Eligible for standard tax credits including education credits and potential stimulus payments",
        col1Icon: "x",
        col2Icon: "check",
    },
];

type IconType = "check" | "x";

function CellIcon({ type }: { type: IconType }) {
    if (type === "check") {
        return (
            <CheckCircle2 className="inline-block w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-1.5 flex-shrink-0" />
        );
    }
    return (
        <XCircle className="inline-block w-4 h-4 text-red-500 dark:text-red-400 mr-1.5 flex-shrink-0" />
    );
}

interface ComparisonRow {
    feature: string;
    col1: string;
    col2: string;
    col1Icon?: string;
    col2Icon?: string;
}

function ComparisonTable({
    id,
    icon: Icon,
    iconColor,
    title,
    description,
    col1Header,
    col2Header,
    rows,
    col1Color,
    col2Color,
}: {
    id: string;
    icon: React.ElementType;
    iconColor: string;
    title: string;
    description: string;
    col1Header: string;
    col2Header: string;
    rows: ComparisonRow[];
    col1Color: string;
    col2Color: string;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <div className="flex items-start gap-4 mb-6">
                <div
                    className={`p-3 rounded-xl ${iconColor} flex-shrink-0`}
                >
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/80">
                            <th className="text-left px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 w-[200px]">
                                Feature
                            </th>
                            <th
                                className={`text-left px-5 py-4 font-semibold ${col1Color}`}
                            >
                                {col1Header}
                            </th>
                            <th
                                className={`text-left px-5 py-4 font-semibold ${col2Color}`}
                            >
                                {col2Header}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={row.feature}
                                className={
                                    i % 2 === 0
                                        ? "bg-white dark:bg-zinc-950"
                                        : "bg-gray-50/50 dark:bg-gray-800/30"
                                }
                            >
                                <td className="px-5 py-4 font-medium text-gray-900 dark:text-white align-top">
                                    {row.feature}
                                </td>
                                <td className="px-5 py-4 text-gray-700 dark:text-gray-300 align-top">
                                    <span className="flex items-start">
                                        {row.col1Icon && (
                                            <span className="mt-0.5">
                                                <CellIcon
                                                    type={
                                                        row.col1Icon as IconType
                                                    }
                                                />
                                            </span>
                                        )}
                                        <span>{row.col1}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-gray-700 dark:text-gray-300 align-top">
                                    <span className="flex items-start">
                                        {row.col2Icon && (
                                            <span className="mt-0.5">
                                                <CellIcon
                                                    type={
                                                        row.col2Icon as IconType
                                                    }
                                                />
                                            </span>
                                        )}
                                        <span>{row.col2}</span>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "What is the difference between OPT and CPT?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "OPT (Optional Practical Training) is post-completion work authorization filed with USCIS via Form I-765, lasting 12 months with the option of a 24-month STEM extension. CPT (Curricular Practical Training) is authorized during enrollment by the DSO directly on the I-20, must be integral to the curriculum, and does not require a USCIS filing. Importantly, 12 or more months of full-time CPT eliminates OPT eligibility.",
            },
        },
        {
            "@type": "Question",
            name: "What is the difference between Regular OPT and STEM OPT?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Regular OPT provides 12 months of work authorization for any degree field with a 90-day unemployment limit. STEM OPT extends authorization by an additional 24 months (36 total) but requires a STEM-designated degree, an E-Verify enrolled employer, a completed Form I-983 training plan, and has a 150-day total unemployment limit across the full 36-month period.",
            },
        },
        {
            "@type": "Question",
            name: "What is the difference between OPT and H-1B?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "OPT is F-1 student work authorization lasting 12–36 months where the student is not tied to one employer and there is no annual cap. H-1B is an employer-sponsored specialty occupation visa lasting up to 6 years, subject to an annual lottery (65,000 + 20,000 US master's cap), requires the employer to pay prevailing wage, and allows dual intent for pursuing permanent residency.",
            },
        },
        {
            "@type": "Question",
            name: "Are F-1 students considered resident or non-resident aliens for tax purposes?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "F-1 students are classified as Non-Resident Aliens (NRA) for their first 5 calendar years in the US under the Substantial Presence Test exemption. As NRAs, they file Form 1040-NR, are taxed only on US-source income, are exempt from FICA taxes (Social Security and Medicare), cannot claim the standard deduction, and may benefit from tax treaty provisions. After the 5-year exemption ends, the Substantial Presence Test determines whether they become Resident Aliens filing the standard Form 1040.",
            },
        },
    ],
};

const jumpLinks = [
    { id: "opt-vs-cpt", label: "OPT vs CPT" },
    { id: "regular-vs-stem-opt", label: "Regular vs STEM OPT" },
    { id: "opt-vs-h1b", label: "OPT vs H-1B" },
    { id: "tax-comparison", label: "Tax Status" },
];

const relatedLinks = [
    {
        href: "/answers/opt-vs-cpt-difference",
        label: "OPT vs CPT — Full Answer",
        category: "Answers",
    },
    {
        href: "/answers/h1b-vs-opt-difference",
        label: "H-1B vs OPT — Full Answer",
        category: "Answers",
    },
    {
        href: "/answers/what-is-stem-opt",
        label: "What Is STEM OPT?",
        category: "Answers",
    },
    {
        href: "/answers/do-f1-students-pay-taxes",
        label: "Do F-1 Students Pay Taxes?",
        category: "Answers",
    },
    {
        href: "/blog/stem-opt-extension-guide",
        label: "STEM OPT Extension Guide",
        category: "Blog",
    },
    {
        href: "/blog/opt-to-h1b-transition",
        label: "OPT to H-1B Transition",
        category: "Blog",
    },
    {
        href: "/blog/f1-student-tax-filing-guide",
        label: "F-1 Student Tax Filing Guide",
        category: "Blog",
    },
    {
        href: "/guides/f1-tax-filing",
        label: "F-1 Tax Filing Guide",
        category: "Guides",
    },
    {
        href: "/guides/opt-career",
        label: "OPT Career Guide",
        category: "Guides",
    },
    {
        href: "/glossary",
        label: "Immigration Glossary",
        category: "Tools",
    },
    {
        href: "/tools",
        label: "Free OPT Tools",
        category: "Tools",
    },
];

export default function ComparePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
            />

            <section className="py-16 sm:py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
                            <ArrowRightLeft className="w-4 h-4" />
                            Side-by-Side Comparisons
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            OPT vs CPT vs H-1B — Comparison Tables
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Detailed, side-by-side comparison tables for the
                            immigration statuses and tax rules that matter most
                            to F-1 international students in the United States.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                            Last updated: February 2026
                        </p>
                    </div>

                    {/* Jump links */}
                    <nav
                        aria-label="Jump to comparison table"
                        className="flex flex-wrap items-center justify-center gap-2 mb-16"
                    >
                        {jumpLinks.map((link) => (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Tables */}
                    <div className="space-y-20">
                        <ComparisonTable
                            id="opt-vs-cpt"
                            icon={GraduationCap}
                            iconColor="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            title="OPT vs CPT Comparison"
                            description="Optional Practical Training vs Curricular Practical Training — the two main work authorizations for F-1 students."
                            col1Header="OPT (Optional Practical Training)"
                            col2Header="CPT (Curricular Practical Training)"
                            rows={optVsCptRows}
                            col1Color="text-blue-700 dark:text-blue-400"
                            col2Color="text-emerald-700 dark:text-emerald-400"
                        />

                        <ComparisonTable
                            id="regular-vs-stem-opt"
                            icon={BookOpen}
                            iconColor="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            title="Regular OPT vs STEM OPT Extension"
                            description="How the 24-month STEM OPT extension differs from the standard 12-month OPT period."
                            col1Header="Regular OPT (12 Months)"
                            col2Header="STEM OPT Extension (+24 Months)"
                            rows={regularVsStemRows}
                            col1Color="text-purple-700 dark:text-purple-400"
                            col2Color="text-cyan-700 dark:text-cyan-400"
                        />

                        <ComparisonTable
                            id="opt-vs-h1b"
                            icon={Briefcase}
                            iconColor="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            title="OPT vs H-1B Comparison"
                            description="F-1 OPT work authorization compared to H-1B specialty occupation employer-sponsored status."
                            col1Header="OPT (F-1 Status)"
                            col2Header="H-1B (Specialty Occupation)"
                            rows={optVsH1bRows}
                            col1Color="text-amber-700 dark:text-amber-400"
                            col2Color="text-rose-700 dark:text-rose-400"
                        />

                        <ComparisonTable
                            id="tax-comparison"
                            icon={DollarSign}
                            iconColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            title="Resident vs Non-Resident Tax Status for F-1 Students"
                            description="Tax obligations differ significantly based on whether an F-1 student qualifies as a Non-Resident Alien or Resident Alien."
                            col1Header="Non-Resident Alien (NRA)"
                            col2Header="Resident Alien (RA)"
                            rows={taxComparisonRows}
                            col1Color="text-emerald-700 dark:text-emerald-400"
                            col2Color="text-indigo-700 dark:text-indigo-400"
                        />
                    </div>

                    {/* Key Takeaways */}
                    <div className="mt-20 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800/40 dark:to-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Key Takeaways
                        </h2>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <Scale className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>CPT is authorized by your school;</strong>{" "}
                                    OPT requires a USCIS application. Using 12+
                                    months of full-time CPT eliminates your OPT
                                    eligibility.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Scale className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>STEM OPT</strong> extends your work
                                    authorization to 36 months total, but
                                    requires a STEM degree, an E-Verify
                                    employer, and a completed I-983 training
                                    plan.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Scale className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>H-1B</strong> is the primary
                                    long-term work visa after OPT, offering dual
                                    intent and a direct path to permanent
                                    residency — but it is subject to an annual
                                    lottery and requires employer sponsorship.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Scale className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>F-1 students are Non-Resident Aliens</strong>{" "}
                                    for their first 5 calendar years — exempt
                                    from FICA taxes and filing Form 1040-NR
                                    instead of 1040.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Related Resources */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Related Resources
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {relatedLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                                >
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                                    <div className="min-w-0">
                                        <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block truncate">
                                            {link.label}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-500">
                                            {link.category}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Track Your OPT Timeline for Free
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                            Never miss an unemployment day, reporting deadline,
                            or STEM OPT milestone. TrackMyOPT keeps you
                            compliant automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/glossary"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-300 transition-all"
                            >
                                <BookOpen className="w-4 h-4" />
                                Browse Glossary
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
