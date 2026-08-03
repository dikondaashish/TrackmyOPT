import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Is OPT Really Ending in 2026? What the DHS Rule and Policy Threats Actually Mean for F-1 Students",
    description: "DHS has confirmed it is re-evaluating OPT and STEM OPT. Trump's USCIS nominee wants to eliminate post-completion work authorization. Here is what is real, what is a rumor, and what F-1 students should actually do right now.",
    keywords: [
        "is OPT ending 2026",
        "DHS OPT rule 2026",
        "STEM OPT ending",
        "Trump OPT elimination",
        "DHS re-evaluating OPT",
        "OPT regulation vs law",
        "Joseph Edlow USCIS OPT",
        "OPT STEM OPT future 2026",
        "F-1 student work authorization threat",
        "RIN 1653-AA97 OPT rule",
        "will OPT be eliminated",
    ],
    openGraph: {
        title: "Is OPT Really Ending? What DHS's 2026 Review Means for F-1 Students | TrackMyOPT",
        description: "DHS confirmed it is re-evaluating OPT and STEM OPT. Here is what is real, what is speculation, and what every F-1 student should do right now.",
        url: "https://www.trackmyopt.com/blog/is-opt-ending-dhs-rule-2026",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Is OPT Really Ending in 2026?",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/is-opt-ending-dhs-rule-2026",
    },
};

const faqItems = [
    {
        question: "Is OPT being eliminated in 2026?",
        answer: "Not yet. As of May 2026, OPT and STEM OPT are still active programs. DHS has confirmed it is formally re-evaluating the programs and a proposed rule (RIN 1653-AA97) is listed in the regulatory agenda. However, no rule has been finalized. Any change would require a Notice of Proposed Rulemaking, a public comment period, and a final rule — a process that typically takes 12–24+ months.",
    },
    {
        question: "Why can DHS eliminate OPT without Congress?",
        answer: "Because OPT is created by regulation (8 C.F.R. § 214.2(f)(10)), not by a law passed by Congress. DHS created OPT through its regulatory authority and can therefore modify or eliminate it through the same rulemaking process — without a Congressional vote. This is why the program is more vulnerable than if it were codified in statute.",
    },
    {
        question: "What did Joseph Edlow (Trump's USCIS nominee) say about OPT?",
        answer: "According to reporting by Forbes, Joseph Edlow — Trump's nominee for USCIS director — stated that he intends to eliminate post-completion employment authorization for F-1 students, which would effectively end OPT as it currently exists. However, a nomination is not a policy change. Any actual elimination would still require the full rulemaking process.",
    },
    {
        question: "Did courts ever rule on whether OPT is legal?",
        answer: "Yes. The D.C. Circuit Court of Appeals upheld the legality of OPT and STEM OPT in the WashTech litigation, confirming that DHS has the authority to run these programs under the Immigration and Nationality Act. However, the same legal framework that lets DHS create OPT also lets DHS change it — so a court victory in defense of the program's existence does not prevent future regulatory changes.",
    },
    {
        question: "What should F-1 students do right now given the uncertainty?",
        answer: "File OPT applications as early as possible (up to 90 days before program end date). For STEM OPT, file your I-765 extension at least 90 days before your OPT expiry to secure the 180-day automatic extension. Maintain perfect compliance — any OPT fraud investigation finding or unemployment violation makes your situation significantly worse if policy changes hit. Stay current with official DHS and USCIS announcements, not social media rumors.",
    },
    {
        question: "Does the October 2025 EAD rule affect the 180-day STEM OPT auto-extension?",
        answer: "No. According to a December 2025 analysis by Murthy Law Firm, the October 2025 DHS rule ending automatic EAD extensions for certain visa categories does NOT affect the 180-day automatic employment authorization for timely filed STEM OPT extensions. F-1 students who file their STEM OPT extension on time before their OPT EAD expires still receive up to 180 days of automatic work authorization.",
    },
];

export default function IsOptEndingBlogPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Is OPT Ending? DHS Rule 2026", url: "https://www.trackmyopt.com/blog/is-opt-ending-dhs-rule-2026" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-05-28"
                modifiedDate="2026-05-28"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Is OPT Ending?</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                        IMPORTANT
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Is OPT Really Ending in 2026? What the DHS Review and Policy Threats Actually Mean for F-1 Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    DHS has confirmed it is formally re-evaluating OPT and STEM OPT. Trump's USCIS nominee has stated he wants to eliminate post-completion work authorization. Here is what is real, what is a rumor, and exactly what you should do right now.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 27, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Quick Answer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    OPT and STEM OPT have not been eliminated. DHS has opened a formal review and a proposed rule (RIN 1653-AA97) is on the regulatory agenda — but no rule has been finalized. Any change requires a full rulemaking process that typically takes 12–24+ months. The biggest real risk right now is processing delays and tightened enforcement — not sudden elimination.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Why This Matters Right Now
                </h2>
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                    OPT exists only as a <strong>DHS regulation</strong> — 8 C.F.R. § 214.2(f)(10) — not as a law passed by Congress. That means DHS can modify or eliminate it without a Congressional vote. This is the core vulnerability that makes the current political environment genuinely different from past threats to the program.
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
                    Sources: <a href="https://eiglaw.com/dhs-confirms-review-of-opt-and-stem-opt/" target="_blank" rel="noopener noreferrer" className="underline">EIG Law — DHS Confirms Review of OPT</a> · <a href="https://www.forbes.com/sites/stuartanderson/2025/11/11/new-immigration-rule-will-end-or-restrict-student-practical-training/" target="_blank" rel="noopener noreferrer" className="underline">Forbes — New Immigration Rule</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#what-dhs-confirmed", "What DHS Has Actually Confirmed"],
                        ["#why-vulnerable", "Why OPT Is Vulnerable: Regulation vs. Law"],
                        ["#uscis-nominee", "What Trump's USCIS Nominee Said — and What It Means"],
                        ["#courts", "What the Courts Have Said: The WashTech Case"],
                        ["#timeline", "How Long Would It Actually Take to End OPT?"],
                        ["#180-day", "What Is NOT Changing: The 180-Day STEM OPT Auto-Extension"],
                        ["#action", "What F-1 Students Should Do Right Now"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href as string} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="what-dhs-confirmed" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What DHS Has Actually Confirmed
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        In January 2026, DHS sent a letter — later made public — confirming that it is formally re-evaluating the scope and duration of OPT and STEM OPT and may amend practical training regulations through rulemaking. This is not a rumor. It is an official government confirmation.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The letter points specifically to a Spring Unified Agenda entry under <strong>RIN 1653-AA97</strong> — a regulatory identifier that signals a future proposed rule aimed at four stated goals: worker protection, fraud prevention, national security concerns, and stronger SEVP oversight.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "DHS emphasizes that OPT exists only by regulation (8 C.F.R. 214.2(f)(10)), not statute, which means they can change duration, eligibility, reporting, or employer requirements without Congress."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — EIG Law analysis of DHS January 2026 letter, eiglaw.com
                        </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        What this means in plain English: DHS is not just posturing. They have officially notified the regulatory system that a rule change is coming. The four stated goals reveal the likely shape of any change:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {[
                            { goal: "Fraud prevention", detail: "Directly tied to the HSI OPT employer fraud investigations currently underway in 8 states. Expect tighter employer verification requirements." },
                            { goal: "Worker protection", detail: "Signals potential changes to wages, working conditions, or the types of employment that qualify — likely targeting the staffing/consulting firm loophole." },
                            { goal: "National security concerns", detail: "Countries flagged as security risks may see stricter eligibility screening or processing for OPT applications." },
                            { goal: "Stronger SEVP oversight", detail: "More rigorous university and employer compliance reporting requirements, potentially including site visits or mandatory E-Verify for all OPT employers." },
                        ].map((item) => (
                            <div key={item.goal} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    {item.goal}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="why-vulnerable" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why OPT Is Vulnerable: Regulation vs. Law
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is the most important structural fact every F-1 student needs to understand: <strong>OPT was not created by Congress</strong>. It was created by the Department of Homeland Security (and before it, the former INS) using its administrative regulatory authority under the Immigration and Nationality Act.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Program Type</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">How It Was Created</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">How It Can Be Changed</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Vulnerability Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 font-medium text-gray-700 dark:text-gray-300">OPT / STEM OPT</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">DHS regulation (8 C.F.R. § 214.2(f))</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">DHS rulemaking — no Congressional vote needed</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-red-600 dark:text-red-400">High</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 font-medium text-gray-700 dark:text-gray-300">H-1B visa</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Act of Congress (Immigration Act of 1990)</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Requires new legislation — Congressional vote</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-green-600 dark:text-green-400">Lower</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 font-medium text-gray-700 dark:text-gray-300">F-1 student visa status</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Combination of INA statute + DHS regulation</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Partial regulatory, partial statutory</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-amber-600 dark:text-amber-400">Medium</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        The practical implication: if OPT were codified in federal law by Congress, changing it would require months or years of Congressional debate, hearings, and votes. Because it is a regulation, DHS can begin the change process today with just a regulatory notice — though they still must follow the Administrative Procedure Act, which requires a notice-and-comment period before any final rule.
                    </p>
                </section>

                <section id="uscis-nominee" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Trump's USCIS Nominee Said — and What It Actually Means
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        According to reporting by Forbes, Joseph Edlow — Trump's nominee to lead USCIS — stated during his confirmation process that he intends to <strong>eliminate post-completion employment authorization for F-1 students</strong>. This would end OPT as it currently exists.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "Trump says he wants international students to stay and work after graduation. His USCIS nominee says he wants to end the program that lets them do exactly that."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — Forbes analysis, May 2025
                        </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        There is a real tension here. President Trump has publicly stated that he wants international graduates — especially STEM graduates — to be able to stay and work in the US. At the same time, his immigration policy framework is pushing hard to reduce post-study work authorization. Both things are true simultaneously, and the outcome depends on which faction wins the internal policy debate.
                    </p>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                            <strong>What a nomination means vs. what a rule means:</strong> A nominee expressing a position is not the same as a policy change. Before anything actually changes, there must be a formal Notice of Proposed Rulemaking (NPRM) published in the Federal Register, a public comment period (typically 30–60 days), review of comments, and a final rule — with an effective date usually 60+ days after publication. This entire process takes 12–24+ months under normal circumstances.
                        </p>
                    </div>
                </section>

                <section id="courts" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What the Courts Have Said: The WashTech Case
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        OPT has already survived legal challenges. The <strong>WashTech litigation</strong> — brought by a tech worker union arguing that OPT illegally undercut US worker wages — went all the way to the D.C. Circuit Court of Appeals, which upheld the legality of both OPT and STEM OPT, confirming that DHS has the authority to run these programs under the Immigration and Nationality Act.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        But here is the nuance that matters: <strong>the same legal authority that courts confirmed DHS has to create OPT is the same authority DHS can use to change it</strong>. A court victory confirming that DHS can run OPT does not prevent DHS from later choosing to modify or end it through a new rulemaking.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        New bills are also moving through Congress — some aimed at restricting OPT further, others aimed at protecting international students and potentially codifying OPT into law. Congressional action to formalize OPT as a statute would significantly increase its long-term stability. That fight is ongoing as of May 2026.
                    </p>
                </section>

                <section id="timeline" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How Long Would It Actually Take to End OPT?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Even in the most aggressive scenario where DHS moves immediately, the regulatory process creates a real timeline buffer:
                    </p>

                    <div className="space-y-3 mb-6">
                        {[
                            { phase: "Notice of Proposed Rulemaking (NPRM) published", time: "Earliest: late 2026, based on current regulatory agenda" },
                            { phase: "Public comment period", time: "Minimum 30 days, typically 60 days — students and employers can submit comments" },
                            { phase: "DHS reviews comments and drafts final rule", time: "3–12+ months depending on complexity and volume of comments" },
                            { phase: "Final rule published in Federal Register", time: "Effective date typically 60+ days after publication" },
                            { phase: "Potential legal challenges in federal court", time: "Injunctions can pause implementation — as happened with DACA and other rules" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.phase}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <p className="text-green-800 dark:text-green-200 text-sm">
                            <strong>Bottom line on timing:</strong> If you are currently on OPT or STEM OPT, or are about to start, the program almost certainly continues through your current authorization period. The realistic risk horizon for major structural change is 2027 at the earliest — and that assumes no successful legal challenges, which historically have slowed or stopped similar rules.
                        </p>
                    </div>
                </section>

                <section id="180-day" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Is NOT Changing: The 180-Day STEM OPT Auto-Extension Still Works
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        In October 2025, DHS issued a rule ending automatic EAD extensions for several visa categories. Many F-1 students panicked, thinking this killed the 180-day automatic employment authorization for STEM OPT applicants.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>It did not.</strong> According to a December 2025 analysis by immigration law firm Murthy Law, the October 2025 rule explicitly does not affect the 180-day STEM OPT automatic extension for timely filed applications.
                    </p>

                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Still in effect: 180-day automatic STEM OPT extension</h3>
                            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                If you file your STEM OPT I-765 <strong>before your current OPT EAD expires</strong>, you automatically receive up to 180 days of continued employment authorization while USCIS processes your case — regardless of the October 2025 rule.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-900 dark:text-red-100">Critical: you must file on time to get this protection</h3>
                            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                The 180-day auto-extension only applies if you file before your OPT EAD expiration date. File even one day late, and the auto-extension does not apply. File at least 90 days before your OPT end date to give yourself maximum buffer.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="action" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What F-1 Students Should Actually Do Right Now
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Panic is not a strategy. Here is a concrete, rational action plan based on the actual risk picture in May 2026:
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                action: "File your OPT or STEM OPT application as early as legally possible",
                                detail: "OPT applications can be filed up to 90 days before your program end date. STEM OPT applications can be filed up to 90 days before your OPT EAD expires. Filing early is the single most effective thing you can do.",
                                type: "green",
                            },
                            {
                                action: "Do not rely on a rule that doesn't exist yet to change your plans",
                                detail: "Do not defer job offers, skip OPT applications, or change your degree program based on speculation about a rule that has not been proposed. Make decisions based on what the law actually says today.",
                                type: "blue",
                            },
                            {
                                action: "Stay strictly compliant with all current OPT requirements",
                                detail: "Report employer changes within 10 days. Track your unemployment days. Keep your SEVP Portal updated. In a tightened enforcement environment, students with clean records are in a meaningfully stronger position.",
                                type: "green",
                            },
                            {
                                action: "Follow the Federal Register for the NPRM, not social media",
                                detail: "When DHS publishes a Notice of Proposed Rulemaking (NPRM), it will appear in the Federal Register at federalregister.gov. That is the authoritative source. Reddit threads and Instagram posts are not.",
                                type: "blue",
                            },
                            {
                                action: "Submit a public comment when the NPRM is published",
                                detail: "Once DHS publishes a proposed rule, there is a formal public comment period. International students, universities, and employers can and should submit comments. Historically, high comment volume has influenced the final shape of rules — and even delayed implementation.",
                                type: "green",
                            },
                            {
                                action: "Build a backup plan without abandoning your current plan",
                                detail: "Know what your options are if OPT is shortened or restricted: H-1B sponsorship timeline, countries with post-study work options, or advanced degree programs. Having a Plan B does not mean executing it prematurely.",
                                type: "blue",
                            },
                        ].map((item, i) => (
                            <div key={i} className={`p-5 rounded-xl border ${item.type === "green" ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800" : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"}`}>
                                <h3 className={`font-bold mb-2 ${item.type === "green" ? "text-green-900 dark:text-green-100" : "text-blue-900 dark:text-blue-100"}`}>{i + 1}. {item.action}</h3>
                                <p className={`text-sm ${item.type === "green" ? "text-green-800 dark:text-green-200" : "text-blue-800 dark:text-blue-200"}`}>{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/hsi-opt-fraud-crackdown-legitimate-students-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ HSI OPT Fraud Crackdown: Protect Yourself</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day Unemployment Rule</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/compare" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT vs STEM OPT →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Stay Ahead of OPT Deadlines While Policy Shifts</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    In an uncertain environment, perfect compliance is your strongest protection. TrackMyOPT keeps your unemployment days, employer updates, and filing deadlines organized so you are never caught off guard.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Track Your OPT Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
