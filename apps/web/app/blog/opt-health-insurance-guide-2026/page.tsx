import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Health Insurance While on OPT (2026): Plans, Costs & Options",
    description: "Lost school coverage after graduation? Compare health insurance while on OPT: employer plans, COBRA, ACA marketplace, and international student insurance — with typical costs for F-1 workers.",
    keywords: ["health insurance while on opt", "opt health insurance", "opt student insurance", "opt insurance", "health insurance after graduation opt", "F-1 health insurance opt", "international student health insurance opt", "COBRA opt"],
    openGraph: {
        title: "Health Insurance While on OPT (2026): Plans & Costs | TrackMyOPT",
        description: "Your university plan ends at graduation. Here is how to get health insurance on OPT — employer coverage, COBRA, marketplace, and budget international plans compared.",
        url: "https://www.trackmyopt.com/blog/opt-health-insurance-guide-2026",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "OPT Health Insurance Guide 2026: Best Plans & How to Choose",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/opt-health-insurance-guide-2026",
    },
    twitter: {
        card: "summary_large_image",
        title: "Health Insurance While on OPT (2026): Plans & Costs | TrackMyOPT",
        description: "Your university plan ends at graduation. Here is how to get health insurance on OPT — employer coverage, COBRA, marketplace, and budget international plans compared.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function OPTHealthInsuranceArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "OPT Health Insurance Guide 2026", url: "https://www.trackmyopt.com/blog/opt-health-insurance-guide-2026" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-05-27" modifiedDate="2026-09-01" author="Vinay Kumar" faqItems={[
                { question: "Do F-1 students on OPT need health insurance?", answer: "While federal law doesn't mandate health insurance for F-1 OPT students, most employers offer coverage, and many states require minimum coverage. More importantly, going without insurance could result in medical debt that devastates your finances." },
                { question: "Can F-1 students buy health insurance on the marketplace?", answer: "Yes, F-1 students can purchase plans on the ACA marketplace (Healthcare.gov). As a nonresident alien, you don't qualify for subsidies, but you can buy full-price plans. Enrollment typically occurs during open enrollment (November-December)." },
                { question: "What is COBRA health insurance?", answer: "COBRA allows you to continue your employer's health insurance for up to 18 months after leaving a job or graduating. You pay the full premium (typically $400-800+/month) plus a 2% administrative fee, but coverage is often better than marketplace plans." },
                { question: "Is international student health insurance cheaper than marketplace plans?", answer: "International student plans are cheaper than marketplace plans (often $50-150/month vs $300+/month) but offer limited coverage. They're good for basic coverage but don't meet marketplace standards and may exclude pre-existing conditions." },
                { question: "How do I enroll in marketplace health insurance?", answer: "Visit Healthcare.gov, create an account, select your state, and apply. You'll need your visa status information and SSN/ITIN. Submit applications during open enrollment or if you have a qualifying event (job start/end)." },
                { question: "What if I don't have health insurance on OPT?", answer: "You risk substantial medical debt if injured or ill. Most states don't require individual health insurance, but employers often do. Violations of state insurance mandates can result in penalties and loss of licensing in some professions." },
                { question: "Can I get Medicaid on OPT?", answer: "Generally, international students and temporary visa holders don't qualify for Medicaid. However, some states offer Medicaid to pregnant women and emergency medical situations regardless of immigration status. Check your state's rules." },
                { question: "What happens to health insurance when I transition from OPT to H-1B?", answer: "Your OPT employer health insurance ends when OPT ends. Your H-1B employer will typically offer health insurance as part of employment. Use COBRA as a bridge for coverage gaps between jobs if needed." },
            ]} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Health Insurance</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                        BENEFITS & INSURANCE
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        11 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Health Insurance While on OPT: Plans, Costs & What You Need (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    When your university plan ends at graduation, you need new coverage before your first OPT paycheck — or a single ER visit can wipe out months of savings. Here is every realistic option for F-1 workers.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 26, 2026</span>
                    <span>•</span>
                    <span>Updated: September 1, 2026</span>
                </div>
            </header>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Your university health plan usually ends at graduation. On OPT, get coverage through <strong>employer insurance</strong> (best value), <strong>COBRA</strong> (bridge after leaving a job), the <strong>ACA marketplace</strong> (special enrollment after losing student coverage), or a <strong>budget international student plan</strong> ($50–$150/mo). Going uninsured risks five-figure medical debt.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    Verified student plans: see{" "}
                    <Link href="/blog/trackmyopt-student-deals-guide" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
                        TrackMyOPT partner health insurance deals
                    </Link>{" "}
                    (ISO, Kimber Health) inside your dashboard.
                </p>
            </div>

            {/* Key Takeaway Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    F-1 students on OPT have four main insurance options: <strong>employer plans (cheapest), COBRA (best coverage), ACA marketplace plans, and international student plans (budget option)</strong>. Your best choice depends on cost, coverage needs, and employment status. Most employers offer health insurance as part of the OPT package.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.healthcare.gov" target="_blank" rel="noopener noreferrer" className="underline">Healthcare.gov</a>, <a href="https://www.dol.gov/agencies/ebsa" target="_blank" rel="noopener noreferrer" className="underline">DOL EBSA</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#is-required", "Is Health Insurance Required for OPT Students?"],
                        ["#insurance-types", "Types of Health Insurance for OPT Students"],
                        ["#employer-coverage", "Employer Health Insurance Plans"],
                        ["#marketplace", "ACA Marketplace Plans"],
                        ["#cobra-explained", "COBRA Health Insurance Explained"],
                        ["#international-plans", "International Student Health Insurance"],
                        ["#comparison", "Complete Comparison Table"],
                        ["#how-to-enroll", "How to Enroll: Step-by-Step"],
                        ["#special-situations", "Special Situations & Considerations"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="is-required" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Is Health Insurance Required for OPT Students?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The federal government does not mandate health insurance for F-1 OPT students. However, <strong>your employer may require it, and some states do</strong>. Additionally, not having health insurance exposes you to potentially catastrophic medical debt.
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl my-6">
                        <p className="text-red-900 dark:text-red-100 font-semibold text-lg">
                            "A single hospitalization without insurance can cost $50,000–$200,000+. One medical emergency could derail your entire OPT period and career plans."
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Employer Requirements</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Most employers sponsoring OPT positions require or strongly encourage health insurance enrollment within 30-60 days of your start date. Some employers:
                    </p>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> <span>Pay 50-100% of premiums for employee coverage</span></li>
                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> <span>Offer dental and vision coverage in addition to medical</span></li>
                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> <span>Provide dependent/family coverage options</span></li>
                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> <span>Include life insurance and disability coverage</span></li>
                    </ul>
                </section>

                <section id="insurance-types" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Types of Health Insurance for OPT Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        F-1 students on OPT have four main insurance options. Here's a quick overview:
                    </p>

                    <div className="space-y-4">
                        {[
                            { type: "Employer Health Insurance", icon: "💼", desc: "Coverage provided by your OPT employer. Typically has low premium costs (employer pays 50-100%), good coverage, and includes dental/vision." },
                            { type: "COBRA Health Insurance", icon: "🔗", desc: "Temporary continuation of your ex-employer's health plan after leaving a job. More expensive but excellent coverage for 18 months." },
                            { type: "ACA Marketplace Plans", icon: "🏛️", desc: "Plans purchased directly from Healthcare.gov. Most affordable for those without employer coverage. No subsidies for international students." },
                            { type: "International Student Plans", icon: "🌍", desc: "Special plans designed for international students. Budget-friendly ($50-150/month) but limited coverage and exclusions." },
                        ].map((item) => (
                            <div key={item.type} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                    <span className="text-2xl">{item.icon}</span>
                                    {item.type}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="employer-coverage" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Employer Health Insurance Plans
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If your OPT employer offers health insurance, this is almost always your best option. It's usually the cheapest for employees and often comes with the best coverage.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">What to Expect</h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Employee Premium</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">$200-500/month (employer often covers 50%+)</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Deductible Range</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">$500-$2,000 per year</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Coverage Type</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Medical, Dental, Vision, Prescription, Mental Health</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Enrollment Window</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Usually within 30-60 days of employment start</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-green-900 dark:text-green-100 font-medium text-sm">
                            <CheckCircle2 className="inline w-4 h-4 mr-2" />
                            <strong>Pros:</strong> Low cost, broad coverage, employer contribution, no eligibility waiting period
                        </p>
                        <p className="text-green-900 dark:text-green-100 font-medium text-sm mt-2">
                            <AlertTriangle className="inline w-4 h-4 mr-2" />
                            <strong>Cons:</strong> Coverage only while employed, limited plan choices, may not cover family members
                        </p>
                    </div>
                </section>

                <section id="marketplace" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        ACA Marketplace Plans
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The ACA marketplace (Healthcare.gov) allows you to purchase individual health insurance directly. <strong>As a nonresident alien, you don't qualify for subsidies, but full-price plans are your back-up option.</strong>
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Plan Categories (Metal Tiers)</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            { tier: "Bronze", cost: "$300-400/month", coverage: "60% of costs covered", deductible: "$6,000-8,000" },
                            { tier: "Silver", cost: "$400-500/month", coverage: "70% of costs covered", deductible: "$3,500-5,000" },
                            { tier: "Gold", cost: "$500-700/month", coverage: "80% of costs covered", deductible: "$1,500-3,000" },
                            { tier: "Platinum", cost: "$700-1,000/month", coverage: "90% of costs covered", deductible: "$500-1,000" },
                        ].map((plan) => (
                            <div key={plan.tier} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{plan.tier} Plans</h3>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li><strong>Cost:</strong> {plan.cost}</li>
                                    <li><strong>Coverage:</strong> {plan.coverage}</li>
                                    <li><strong>Deductible:</strong> {plan.deductible}</li>
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Important:</strong> You must apply and be denied marketplace subsidies to be allowed to purchase plans. International students cannot claim subsidies, but they can purchase full-price plans.
                        </p>
                    </div>
                </section>

                <section id="cobra-explained" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        COBRA Health Insurance Explained
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>COBRA (Consolidated Omnibus Budget Reconciliation Act)</strong> allows you to continue your employer's health insurance for up to <strong>18 months</strong> after leaving a job.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">COBRA at a Glance</h3>
                    <div className="space-y-3 mb-6">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Eligibility: When You Leave a Job</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">You can elect COBRA within 60 days of losing employment or benefits if your employer has 20+ employees.</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Cost: 100% Premium + 2% Fee</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Typically $600-1,200/month since you pay the full employer+employee portion plus administrative fee.</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Duration: Up to 18 Months</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Coverage extends 18 months from the date you leave employment, giving you time to find new coverage or employment.</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Coverage Quality: Identical to Employee Plan</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">You keep the exact same medical, dental, and vision coverage your employer offered.</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Should You Enroll in COBRA?</h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-2">✓ Yes, if your next job starts in 1-6 months (bridge coverage)</p>
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-2">✓ Yes, if you have upcoming medical procedures or prescriptions</p>
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-2">✗ No, if you can get employer coverage immediately</p>
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm">✗ No, if marketplace plans are significantly cheaper</p>
                    </div>
                </section>

                <section id="international-plans" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        International Student Health Insurance
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Specialized plans designed specifically for international students and temporary visa holders. These are budget options but with significant coverage limitations.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Popular Providers</h3>
                    <div className="space-y-3 mb-6">
                        {[
                            { name: "IMG Global", cost: "$50-150/month", coverage: "Emergency medical, hospitalization", max: "$1M lifetime" },
                            { name: "ISO United Healthcare", cost: "$75-200/month", coverage: "Medical, emergency dental", max: "$750K-$2M" },
                            { name: "GeoBlue", cost: "$100-250/month", coverage: "Comprehensive medical", max: "$1M+" },
                        ].map((plan) => (
                            <div key={plan.name} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{plan.name}</h3>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    <div><strong>Cost:</strong> {plan.cost}</div>
                                    <div><strong>Coverage:</strong> {plan.coverage}</div>
                                    <div><strong>Max:</strong> {plan.max}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-red-900 dark:text-red-100 font-medium text-sm mb-2">
                            <AlertTriangle className="inline w-4 h-4 mr-2" />
                            <strong>Limitations of International Plans:</strong>
                        </p>
                        <ul className="space-y-1 text-red-800 dark:text-red-200 text-sm mt-2">
                            <li>• May exclude pre-existing conditions</li>
                            <li>• Limited coverage for outpatient care and preventive services</li>
                            <li>• May not cover routine doctor visits</li>
                            <li>• High deductibles ($1,000-5,000)</li>
                            <li>• Don't meet ACA marketplace standards</li>
                        </ul>
                    </div>
                </section>

                <section id="comparison" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Complete Comparison Table
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Employer Plan</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">COBRA</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Marketplace</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">International</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Monthly Cost</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">$100-300</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">$600-1,200</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">$300-700</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">$50-150</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Coverage Quality</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Excellent</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Excellent</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Good-Excellent</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Basic</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Duration</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">While employed</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">18 months max</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">12 months</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">12 months</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Dental/Vision</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">✓ Yes</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">✓ Yes</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Optional</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">✗ Limited</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="how-to-enroll" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Enroll: Step-by-Step
                    </h2>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Enrolling in Employer Health Insurance</h3>
                    <div className="space-y-4 mb-8">
                        {[
                            { step: "1. Ask HR About Benefits", detail: "During onboarding, ask your HR department about health insurance options and the enrollment deadline." },
                            { step: "2. Review Available Plans", detail: "Compare medical plans offered (usually 2-4 options with different deductibles/costs)." },
                            { step: "3. Select Your Plan", detail: "Choose a plan based on your health needs and budget. Ask HR if they recommend certain plans." },
                            { step: "4. Complete Enrollment Form", detail: "Sign health insurance enrollment documents. You may need an ITIN if you don't have an SSN." },
                            { step: "5. Verify Effective Date", detail: "Confirm when coverage starts (usually within 30 days of hire)." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.step}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Enrolling in Marketplace Coverage</h3>
                    <div className="space-y-4">
                        {[
                            { step: "1. Go to Healthcare.gov", detail: "Visit Healthcare.gov during open enrollment (Nov 1 - Dec 15) or if you have a qualifying event." },
                            { step: "2. Create an Account", detail: "Sign up with email, SSN/ITIN, visa status, and personal information." },
                            { step: "3. Apply for Coverage", detail: "Answer questions about income, household size, and current coverage." },
                            { step: "4. Review Plan Options", detail: "Compare plans in your state by premium, deductible, and coverage." },
                            { step: "5. Select & Enroll", detail: "Choose your plan and confirm enrollment. You'll get an official notice." },
                            { step: "6. Pay Your First Premium", detail: "Payment is due by the first of the month for coverage to start." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.step}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="special-situations" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Special Situations & Considerations
                    </h2>

                    <div className="space-y-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">What if I get married or have dependents?</h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                Most employer plans allow you to add spouses and children to coverage. Notify HR within 30 days of marriage or birth for a qualifying event. Marketplace plans also offer family coverage options.
                            </p>
                        </div>

                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">What if I leave my OPT job?</h3>
                            <p className="text-green-800 dark:text-green-200 text-sm">
                                You have 60 days from losing coverage to elect COBRA if eligible. If you get a new job with health insurance, enroll immediately to avoid gaps. If transitioning to H-1B, your new employer typically covers health insurance.
                            </p>
                        </div>

                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">What if I have pre-existing conditions?</h3>
                            <p className="text-purple-800 dark:text-purple-200 text-sm">
                                Employer and marketplace plans must cover pre-existing conditions with no exclusions. International student plans may exclude pre-existing conditions. Compare plan details carefully if this applies to you.
                            </p>
                        </div>

                        <div className="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">Can I skip health insurance if I'm young and healthy?</h3>
                            <p className="text-orange-800 dark:text-orange-200 text-sm">
                                Legally yes, but medically no. One accident or illness could result in $50,000-200,000 in medical debt. Even the cheapest plans ($50-150/month) protect you from catastrophic costs. Don't skip insurance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Schema Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "Do F-1 students on OPT need health insurance?", answer: "While federal law doesn't mandate it, most employers require it, and medical bills without insurance can be catastrophic. At minimum, get a cheap international student plan ($50-150/month) for emergency coverage." },
                            { question: "Can F-1 students use their parent's insurance?", answer: "Typically no. Most US insurance plans require dependents to be US residents or citizens. International students usually cannot be added to parent plans from abroad." },
                            { question: "What is the cheapest health insurance option for OPT students?", answer: "International student plans are cheapest ($50-150/month) but offer basic coverage only. If your employer offers coverage, that's usually the cheapest option after employer subsidies." },
                            { question: "Does health insurance cover mental health and therapy?", answer: "Most employer and marketplace plans cover mental health and therapy with a copay. International plans vary—check the specifics before enrolling." },
                            { question: "Can I use health insurance immediately after enrolling?", answer: "Employer coverage generally starts within 30 days of enrollment. Marketplace coverage starts the 1st of the following month. COBRA begins immediately upon election." },
                            { question: "What happens if I don't enroll in employer health insurance during the enrollment window?", answer: "You typically lose the chance to enroll until the next open enrollment period unless you have a qualifying event (marriage, birth, job loss). Ask HR about exceptions." },
                        ].map((faq, i) => (
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

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Extension Guide 2026</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition</Link>
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Tax Filing Guide 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/guides/opt-health-insurance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Health Insurance Resources →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Insurance Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Compare OPT Health Plans Today</h2>
                <p className="text-red-100 mb-6 max-w-lg mx-auto">
                    Use TrackMyOPT's health insurance comparison tool to find the best plan matching your needs and budget.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors">
                    Compare Health Plans <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
