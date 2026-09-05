import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

const CANONICAL = "https://www.trackmyopt.com/blog/opt-unemployment-days-calculator-guide";

export const metadata: Metadata = {
    title: "OPT Unemployment Days Calculator: How to Check & Track (2026)",
    description:
        "Free guide to counting OPT unemployment days: 90 on initial OPT, 150 total with STEM OPT. Check the SEVP portal, use TrackMyOPT's calculator, and avoid SEVIS termination.",
    keywords: [
        "OPT unemployment days calculator",
        "how to check unemployment days opt",
        "sevis unemployment counter",
        "how to check unemployment days in sevp portal",
        "OPT unemployment days",
        "how many unemployment days in opt",
        "OPT unemployment clock",
        "does opt unemployment days include weekends",
    ],
    openGraph: {
        title: "OPT Unemployment Days Calculator & SEVP Check (2026) | TrackMyOPT",
        description:
            "Count remaining OPT unemployment days correctly. SEVP portal steps, weekend rules, STEM 150-day limit, and free tracker.",
        url: CANONICAL,
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "OPT Unemployment Days Calculator Guide" }],
    },
    alternates: { canonical: CANONICAL },
    twitter: {
        card: "summary_large_image",
        title: "OPT Unemployment Days Calculator & SEVP Check (2026) | TrackMyOPT",
        description: "Count remaining OPT unemployment days correctly. SEVP portal steps, weekend rules, STEM 150-day limit, and free tracker.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

const FAQS = [
    {
        question: "How do I check my OPT unemployment days?",
        answer: "Log in to the SEVP portal at sevp.ice.gov/opt with your credentials. The dashboard shows allowed, used, and remaining unemployment days. You can also use TrackMyOPT's OPT Clock to model job gaps and get reminders before you approach the limit.",
    },
    {
        question: "How many unemployment days are allowed on OPT?",
        answer: "Post-completion OPT allows 90 cumulative calendar days. STEM OPT adds 60 more days for a combined 150-day limit across initial OPT and STEM OPT. Days used during initial OPT still count toward the 150-day STEM total.",
    },
    {
        question: "Do weekends count toward OPT unemployment days?",
        answer: "Yes. Unemployment is measured in calendar days, not business days. A gap between jobs includes Saturdays, Sundays, and holidays unless qualifying employment covers those dates.",
    },
    {
        question: "Does the SEVP unemployment counter update automatically?",
        answer: "It updates when your DSO reports employment changes in SEVIS. You must report a new job, employer change, or end of employment within 10 days. Until the DSO updates SEVIS, the portal may not reflect your current count.",
    },
    {
        question: "What happens if I exceed 90 unemployment days on OPT?",
        answer: "Exceeding the limit can lead to SEVIS termination, loss of F-1 status, and future visa complications. Contact your DSO immediately if you are approaching the limit or have a reporting gap.",
    },
] as const;

export default function OptUnemploymentDaysCalculatorGuidePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema
                items={[
                    { name: "Home", url: "https://www.trackmyopt.com" },
                    { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                    { name: "OPT Unemployment Days Calculator", url: CANONICAL },
                ]}
            />
            <BlogPostSchema
                title={metadata.title}
                description={metadata.description}
                publishedDate="2026-09-01"
                modifiedDate="2026-09-01"
                author="Vinay Kumar"
                faqItems={[...FAQS]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Unemployment Days Calculator</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        OPT Compliance
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />7 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT Unemployment Days Calculator: How to Check & Track Your Remaining Days
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Running out of unemployment days is one of the fastest ways to lose F-1 status. Here is how to check your count in the SEVP portal, what counts as a day, and how to use TrackMyOPT&apos;s free calculator before you hit the limit.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: September 1, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    You get <strong>90 calendar days</strong> of unemployment on initial OPT (150 total with STEM OPT). Check your official count in the{" "}
                    <a href="https://sevp.ice.gov/opt" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline" rel="noopener noreferrer" target="_blank">
                        SEVP portal
                    </a>{" "}
                    and model job gaps with{" "}
                    <Link href="/dashboard/opt-tools/opt-clock" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        TrackMyOPT&apos;s OPT Clock
                    </Link>
                    .
                </p>
            </div>

            <BlogProductCTA variant="unemployment" sourcePage="/blog/opt-unemployment-days-calculator-guide" />

            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calculator className="w-7 h-7 text-blue-600" />
                    The Limits at a Glance
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Initial OPT", value: "90 days", sub: "Calendar days, not business days" },
                        { label: "STEM OPT add-on", value: "+60 days", sub: "Does not reset prior usage" },
                        { label: "Combined max", value: "150 days", sub: "Across full OPT + STEM period" },
                    ].map((item) => (
                        <div key={item.label} className="text-center p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{item.label}</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{item.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
                        </div>
                    ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                    Full rule breakdown:{" "}
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 hover:underline font-medium">
                        90-day unemployment rule explained
                    </Link>
                    . STEM-specific limits:{" "}
                    <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 hover:underline font-medium">
                        150-day STEM OPT guide
                    </Link>
                    .
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to Check Unemployment Days in the SEVP Portal</h2>
                <ol className="space-y-4 list-none">
                    {[
                        "Go to sevp.ice.gov/opt and sign in with your SEVP portal credentials (created when your DSO granted portal access).",
                        "Open your OPT dashboard — look for unemployment days allowed, accrued, and remaining.",
                        "Compare the portal count with your own employment history. If a recent job change is missing, email your DSO — the portal only updates after SEVIS reporting.",
                        "Save a screenshot monthly for your records, especially during job transitions.",
                    ].map((step, i) => (
                        <li key={step} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">{i + 1}</span>
                            <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                        </li>
                    ))}
                </ol>
                <p className="mt-4 text-sm text-gray-500">
                    Portal walkthrough:{" "}
                    <Link href="/blog/sevp-portal-guide-opt" className="text-blue-600 hover:underline">
                        SEVP portal guide for OPT students
                    </Link>
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">When the Unemployment Clock Starts</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    For post-completion OPT, unemployment generally begins on your <strong>OPT authorization start date</strong> printed on the EAD — even if the physical card arrives late. Gaps without qualifying employment count from that date forward.
                </p>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                        <strong>Common trap:</strong> Waiting for your EAD while your OPT start date has already passed. Those days still count. See{" "}
                        <Link href="/blog/when-does-opt-unemployment-clock-start" className="underline font-medium">
                            when the unemployment clock starts
                        </Link>
                        .
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Counts (and Doesn&apos;t Count) as Employment</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" /> Stops the clock
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
                            <li>Paid job related to your degree (20+ hrs/week)</li>
                            <li>Multiple part-time jobs totaling 20+ hrs/week</li>
                            <li>Self-employment on OPT (with proper setup)</li>
                            <li>Volunteer work (initial OPT only; not STEM)</li>
                        </ul>
                    </div>
                    <div className="p-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" /> Still counts as unemployed
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
                            <li>Job searching with no qualifying role</li>
                            <li>Unpaid internships without proper authorization</li>
                            <li>Work before EAD start date (even if hired)</li>
                            <li>Gaps between jobs (including weekends)</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Use TrackMyOPT as Your Backup Calculator</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    The SEVP portal is the official record, but it can lag behind reality. TrackMyOPT&apos;s OPT Clock lets you:
                </p>
                <ul className="space-y-2 mb-6">
                    {[
                        "Enter your OPT start date and employment history",
                        "Model what-if scenarios (e.g., 30-day gap between jobs)",
                        "Get alerts when you approach 60, 75, or 85 days used",
                        "Track STEM OPT reporting deadlines alongside unemployment",
                    ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
                <Link
                    href="/dashboard/opt-tools/opt-clock"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                    Open OPT Clock <ArrowRight className="w-4 h-4" />
                </Link>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {FAQS.map((faq) => (
                        <div key={faq.question} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/laid-off-on-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Laid Off on OPT: What to Do Next</Link>
                    <Link href="/blog/laid-off-on-stem-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Laid Off on STEM OPT</Link>
                    <Link href="/blog/volunteer-work-opt-employment-rules" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Volunteer Work on OPT Rules</Link>
                    <Link href="/blog/opt-reporting-requirements-dso" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Reporting Requirements</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
