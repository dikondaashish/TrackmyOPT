import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, GraduationCap } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { StemCipSearch } from "@/components/blog/StemCipSearch";
import {
    STEM_CIP_CODES,
    STEM_CIP_LIST_EDITION,
    STEM_CIP_LIST_URL,
} from "@/data/stem-cip-list";

const CANONICAL_URL = "https://www.trackmyopt.com/blog/is-my-degree-stem-eligible-cip-code";
const DESCRIPTION =
    "Search all 540 CIP codes on the DHS STEM Designated Degree Program List (current in 2026), find the CIP code on your I-20 and check STEM OPT eligibility.";
const SOCIAL_DESCRIPTION =
    "Look up your I-20 CIP code in the official DHS STEM Designated Degree Program List and see how DHS decides which degrees qualify for STEM OPT.";

export const metadata: Metadata = {
    title: "STEM CIP Code Lookup (2026): Search the DHS List",
    description: DESCRIPTION,
    keywords: [
        "CIP code lookup",
        "STEM CIP codes",
        "STEM CIP code list 2026",
        "DHS STEM designated degree program list",
        "CIP code for STEM OPT",
        "CIP code on I-20",
        "is my degree STEM",
    ],
    openGraph: {
        title: "STEM CIP Code Lookup: Search the DHS STEM List | TrackMyOPT",
        description: SOCIAL_DESCRIPTION,
        url: CANONICAL_URL,
        type: "article",
        publishedTime: "2026-03-22T00:00:00.000Z",
        modifiedTime: "2026-11-08T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/is-my-degree-stem-eligible-cip-code.png",
                width: 1200,
                height: 630,
                alt: "Laptop screen showing DHS STEM Designated Degree list with university catalogs on a desk",
            },
        ],
    },
    alternates: {
        canonical: CANONICAL_URL,
    },
    twitter: {
        card: "summary_large_image",
        title: "STEM CIP Code Lookup: Search the DHS STEM List | TrackMyOPT",
        description: SOCIAL_DESCRIPTION,
        images: ["/blog/is-my-degree-stem-eligible-cip-code.png"],
    },
};

const STEM_LIST_PAGE_URL = "https://www.ice.gov/sevis/schools#dhs-stem-designated-degree-program-list-and-cip-code-nomination-process";
const FEDERAL_REGISTER_2024_URL =
    "https://www.federalregister.gov/documents/2024/07/23/2024-16127/update-to-the-department-of-homeland-security-stem-designated-degree-program-list";
const ECFR_STEM_URL = "https://www.ecfr.gov/current/title-8/section-214.2#p-214.2(f)(10)(ii)(C)";
const SITS_CIP_URL = "https://studyinthestates.dhs.gov/sevis-help-hub/student-records/classification-of-instructional-programs-cip";
const SITS_STEM_CIP_URL = "https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/eligible-cip-codes-for-the-stem-opt-extension";

/** Two-digit series named on page 1 of the July 22, 2024 edition. */
const STEM_SERIES: Array<{ series: string; name: string; core: boolean }> = [
    { series: "01", name: "Agricultural/Animal/Plant/Veterinary Science and Related Fields", core: false },
    { series: "03", name: "Natural Resources and Conservation", core: false },
    { series: "04", name: "Architecture and Related Services", core: false },
    { series: "09", name: "Communication, Journalism and Related Programs", core: false },
    { series: "10", name: "Communications Technologies/Technicians and Support Services", core: false },
    { series: "11", name: "Computer and Information Sciences and Support Services", core: false },
    { series: "13", name: "Education", core: false },
    { series: "14", name: "Engineering", core: true },
    { series: "15", name: "Engineering/Engineering-Related Technologies/Technicians", core: false },
    { series: "26", name: "Biological and Biomedical Sciences", core: true },
    { series: "27", name: "Mathematics and Statistics", core: true },
    { series: "28", name: "Military Science, Leadership and Operational Art", core: false },
    { series: "29", name: "Military Technologies and Applied Sciences", core: false },
    { series: "30", name: "Multi/Interdisciplinary Studies", core: false },
    { series: "40", name: "Physical Sciences", core: true },
    { series: "41", name: "Science Technologies/Technicians", core: false },
    { series: "42", name: "Psychology", core: false },
    { series: "43", name: "Homeland Security, Law Enforcement, Firefighting and Related Protective Services", core: false },
    { series: "45", name: "Social Sciences", core: false },
    { series: "49", name: "Transportation and Materials Moving", core: false },
    { series: "51", name: "Health Professions and Related Programs", core: false },
    { series: "52", name: "Business, Management, Marketing and Related Support Services", core: false },
];

const countInSeries = (series: string) =>
    STEM_CIP_CODES.filter((entry) => entry.code.startsWith(`${series}.`)).length;

const FAQ_ITEMS = [
    {
        question: "Where can I find my degree's CIP code?",
        answer: "Look at the Program of Study section on page 1 of your Form I-20. The Major 1 field shows the CIP code and title your school chose for your program in SEVIS. A CIP code has six digits in the format XX.XXXX, for example 11.0701 for Computer Science.",
    },
    {
        question: "What is the DHS STEM Designated Degree Program List?",
        answer: `It is the official DHS list of fields that count as STEM for the 24-month STEM OPT extension. As of November 8, 2026, ICE.gov lists the edition last updated ${STEM_CIP_LIST_EDITION} as the current list. It prints 540 six-digit CIP codes, and DHS also designates every code in series 14, 26, 27 and 40 at the two-digit level.`,
    },
    {
        question: "Is there a new 2026 STEM CIP code list?",
        answer: `Not as of November 8, 2026. ICE.gov still links the edition last updated ${STEM_CIP_LIST_EDITION} as the current list. DHS announces changes in a Federal Register notice, and nominations for each review cycle are due by August 1.`,
    },
    {
        question: "My major is called 'Data Analytics' but the I-20 shows a different program title. Which one counts?",
        answer: "The CIP code your school assigned in SEVIS, shown on your I-20, is what DSOs and USCIS compare with the DHS list. The marketing name of your program does not decide it. If the code looks wrong, ask your DSO early.",
    },
    {
        question: "What if my CIP code is not on the DHS STEM list?",
        answer: "Your degree generally does not qualify for the STEM OPT extension unless it falls in series 14, 26, 27 or 40. You can talk to your DSO about how your program is coded. Anyone can also nominate a CIP code to DHS by email, but a code only qualifies after DHS adds it to the published list.",
    },
    {
        question: "Does USCIS check the CIP code when I apply?",
        answer: "Your DSO must confirm the degree is in a category on the list before recommending the extension in SEVIS. USCIS then reviews your Form I-765 and the STEM I-20 you submit. A code that is not on the list can lead to a Request for Evidence or a denial.",
    },
];

export default function CIPCodeGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "STEM CIP Code Lookup", url: CANONICAL_URL },
            ]} />
            <BlogPostSchema
                title="STEM CIP Code Lookup: Is My Degree STEM Eligible?"
                description={DESCRIPTION}
                publishedDate="2026-03-22"
                modifiedDate="2026-11-08"
                author="Vinay Kumar"
                canonicalUrl={CANONICAL_URL}
                imageUrl="https://www.trackmyopt.com/blog/is-my-degree-stem-eligible-cip-code.png"
                faqItems={FAQ_ITEMS}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">STEM CIP Code Lookup</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">STEM OPT</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500" aria-hidden="true">·</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        9 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    STEM CIP Code Lookup: Is My Degree STEM Eligible?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The 24-month STEM OPT extension depends on the CIP code of your degree. Find the code on your Form I-20, then search it below in the official DHS STEM Designated Degree Program List.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: March 22, 2026</span>
                    <span>•</span>
                    <span>Updated: November 8, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-card">
                    <BlogPostImage src="/blog/is-my-degree-stem-eligible-cip-code.png" alt="Laptop screen showing DHS STEM Designated Degree list with university catalogs on a desk" className="w-full h-[400px] object-cover rounded-xl border border-border shadow-card" sizes="(max-width: 768px) 100vw, 768px" priority />
                </div>
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Your school maps each degree program to a federal CIP code, and that code prints on your I-20.
                </figcaption>
            </figure>

            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Open page 1 of your Form I-20 and read the <strong>Major 1</strong> field in the Program of Study section. It shows a six-digit CIP code, such as <strong>11.0701</strong> for Computer Science. Search that code in the <a href="#search-stem-list" className="underline">STEM CIP code list below</a>. A match generally means your field qualifies for the 24-month STEM OPT extension, as long as you meet the other rules.
                </p>
            </div>

            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    The name of your major on a diploma or school website does not decide STEM eligibility. The <strong>CIP code your school assigned in SEVIS</strong>, shown on your I-20, is what gets compared with the DHS list.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Sources: <a href={SITS_CIP_URL} target="_blank" rel="noopener noreferrer" className="underline">Study in the States, Classification of Instructional Programs</a> and <a href={ECFR_STEM_URL} target="_blank" rel="noopener noreferrer" className="underline">8 CFR 214.2(f)(10)(ii)(C)</a>
                </p>
            </div>

            <div className="border rounded-xl border-border p-6 mb-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#search-stem-list", "Search the 2026 STEM CIP code list"],
                        ["#find-on-i20", "How to find the CIP code on your I-20"],
                        ["#dhs-stem-list", "Which edition of the DHS STEM list applies in 2026"],
                        ["#stem-series", "The 22 CIP series on the STEM list"],
                        ["#other-rules", "Other STEM OPT degree rules"],
                        ["#what-is-cip", "What is a CIP code?"],
                        ["#mismatches", "Name mismatches and codes not on the list"],
                        ["#faq", "Frequently asked questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="search-stem-list" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Search the 2026 STEM CIP code list
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This search holds every code printed on the DHS STEM Designated Degree Program List last updated {STEM_CIP_LIST_EDITION}. That edition is still the current list on ICE.gov as of November 8, 2026. Type a code with or without the dot, or a word from your field of study.
                    </p>
                    <StemCipSearch />
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                        This tool is a reading aid, not a decision. Your DSO and USCIS use the <a href={STEM_CIP_LIST_URL} target="_blank" rel="noopener noreferrer">official PDF</a>, and TrackMyOPT is not legal advice.
                    </p>
                </section>

                <section id="find-on-i20" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to find the CIP code on your I-20
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Your DSO picks CIP codes for your major when creating your SEVIS record. Those codes print on your Form I-20.
                    </p>
                    <ol className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                        <li>Open page 1 of your most recent Form I-20.</li>
                        <li>Find the <strong>Program of Study</strong> section.</li>
                        <li>Read the <strong>Major 1</strong> field. It shows the CIP code and title for your primary field of study.</li>
                        <li>Check <strong>Major 2</strong> too if you have a second major. Ask your DSO how a second major affects STEM OPT.</li>
                    </ol>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you are applying with an earlier degree, use the I-20 from that program instead.
                    </p>
                    <div className="not-prose border rounded-xl border-border p-5 bg-card shadow-card">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fictional example:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            Priya studies for a master&apos;s her school markets as &quot;Marketing Analytics.&quot; Her I-20 Major 1 field shows 30.7102, Business Analytics.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            She types 307102 into the search above and gets one match. The program name on the school website does not matter here.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Her field qualifies, but she still needs the other STEM OPT requirements, such as an E-Verify employer and a Form I-983 training plan.
                        </p>
                    </div>
                </section>

                <section id="dhs-stem-list" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Which edition of the DHS STEM list applies in 2026
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        DHS keeps the official STEM Designated Degree Program List on ICE.gov. As of November 8, 2026, ICE.gov labels the edition last updated <strong>{STEM_CIP_LIST_EDITION}</strong> as the current list.
                    </p>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                        <li>It prints <strong>540 six-digit CIP codes</strong> across 22 two-digit series.</li>
                        <li>It uses 2020 CIP codes, the latest version of the federal CIP taxonomy.</li>
                        <li>The 2024 update added one field: Environmental/Natural Resource Economics (03.0204).</li>
                        <li>DHS adopted that update in a Federal Register notice published July 23, 2024.</li>
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        DHS announces future changes in the Federal Register. Nominations to add or remove a code are due by August 1 each year.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-l-amber-500 p-4 rounded-r-xl my-4 text-amber-900 dark:text-amber-100">
                        Check the <a href={STEM_LIST_PAGE_URL} target="_blank" rel="noopener noreferrer" className="underline">STEM list section on ICE.gov</a> before you rely on any copy, including ours. A newer edition replaces the one shown here.
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sources: <a href={STEM_CIP_LIST_URL} target="_blank" rel="noopener noreferrer">DHS STEM Designated Degree Program List (PDF)</a>, <a href={FEDERAL_REGISTER_2024_URL} target="_blank" rel="noopener noreferrer">89 FR 59748 (July 23, 2024)</a> and <a href={SITS_STEM_CIP_URL} target="_blank" rel="noopener noreferrer">Study in the States, Eligible CIP Codes for the STEM OPT Extension</a>.
                    </p>
                </section>

                <section id="stem-series" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The 22 CIP series on the STEM list
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        DHS designates four core series at the two-digit level. Every code in those series counts, including codes added to them later.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        In the other 18 series, only the specific six-digit codes printed on the list count. A code from series 11 or 52 that is not printed does not qualify.
                    </p>
                    <div className="not-prose overflow-x-auto">
                        <table className="w-full text-sm border border-border">
                            <caption className="text-left text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Series named in the DHS STEM list last updated {STEM_CIP_LIST_EDITION}, with the number of six-digit codes printed for each
                            </caption>
                            <thead className="bg-surface">
                                <tr>
                                    <th scope="col" className="text-left p-2 border-b border-border">Series</th>
                                    <th scope="col" className="text-left p-2 border-b border-border">Field</th>
                                    <th scope="col" className="text-left p-2 border-b border-border">How DHS designates it</th>
                                    <th scope="col" className="text-right p-2 border-b border-border">Codes printed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {STEM_SERIES.map((row) => (
                                    <tr key={row.series} className="border-b border-border">
                                        <td className="p-2 font-mono text-gray-900 dark:text-white">{row.series}</td>
                                        <td className="p-2 text-gray-700 dark:text-gray-300">{row.name}</td>
                                        <td className="p-2 text-gray-700 dark:text-gray-300">
                                            {row.core ? "Whole series (two-digit level)" : "Listed codes only (six-digit level)"}
                                        </td>
                                        <td className="p-2 text-right text-gray-700 dark:text-gray-300">{countInSeries(row.series)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="other-rules" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Other STEM OPT degree rules
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        A matching CIP code is only one requirement. Under 8 CFR 214.2(f)(10)(ii)(C), the degree must also meet these rules:
                    </p>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                        <li>It is a bachelor&apos;s, master&apos;s or doctoral degree.</li>
                        <li>It comes from a U.S. school accredited by an agency the Department of Education recognizes.</li>
                        <li>Its field is on the STEM list when your DSO recommends the extension in SEVIS.</li>
                        <li>It can be an earlier degree instead of your current one, with conditions.</li>
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        An earlier degree must have been conferred within the 10 years before the DSO recommendation. The school must be accredited and SEVP-certified at the time of that recommendation.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Read the <Link href="/blog/stem-opt-extension-guide">STEM OPT extension guide</Link> for the employer, training plan and filing steps.
                    </p>
                </section>

                <section id="what-is-cip" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What is a CIP code?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The Classification of Instructional Programs (CIP) is a coding system run by the Department of Education&apos;s National Center for Education Statistics (NCES). It gives similar programs at different schools one shared code.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        For example, two schools might name similar programs &quot;Computer Science and Systems Analysis&quot; and &quot;Applied Computing.&quot; Both could still map to <strong>11.0701 (Computer Science)</strong>.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        NCES updates the CIP about every ten years. The latest version is CIP 2020, and the DHS STEM list uses it.
                    </p>
                </section>

                <section id="mismatches" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Name mismatches and codes not on the list
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Each school maps its programs to CIP codes, usually through its registrar or institutional research office. Your DSO relies on that mapping when coding your major in SEVIS.
                    </p>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                        <li><strong>The title on your I-20 differs from your program name.</strong> That is common. The code is what counts.</li>
                        <li><strong>The code looks wrong.</strong> Ask your DSO well before you apply. Do not assume it can be changed late.</li>
                        <li><strong>The code is not on the list.</strong> Your degree generally does not qualify, unless it is in series 14, 26, 27 or 40.</li>
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Anyone can nominate a CIP code by email to the SEVP Response Center, with the subject line &quot;Attention: STEM CIP Code Nomination.&quot; DHS reviews nominations received by August 1. A code only counts after DHS publishes it on the list.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If your field does not qualify, see the <Link href="/blog/opt-non-stem-majors-guide">guide to OPT for non-STEM majors</Link>.
                    </p>
                </section>

                {/* Product CTA */}
                <div className="not-prose rounded-xl p-8 my-12 text-ink-foreground bg-ink border border-ink-border shadow-elevated">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Simplify Your STEM OPT Transition</h3>
                        </div>
                        <p className="text-ink-muted mb-6 text-lg max-w-2xl">
                            TrackMyOPT helps you log and verify your employment records so you never fall out of status. Get reminders when it&apos;s time to report changes.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-colors shadow-lg bg-blue-600 text-white hover:bg-blue-500 shadow-button"
                        >
                            Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {FAQ_ITEMS.map((faq) => (
                            <div key={faq.question} className="border p-5 rounded-xl border-border bg-card shadow-card" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="border rounded-xl border-border p-6 mt-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/tools/stem-apply" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Application Guide</Link>
                    <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Form I-983 Training Plan Guide</Link>
                    <Link href="/blog/stem-opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Processing Time 2026</Link>
                    <Link href="/blog/opt-non-stem-majors-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT for Non-STEM Majors</Link>
                    <Link href="/blog/opt-reporting-requirements-dso" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Reporting Guide</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
