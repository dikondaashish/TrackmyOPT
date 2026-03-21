import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, Shield, Heart, Building2, ArrowRightLeft } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "OPT Health Insurance Guide 2026: Best Plans & How to Choose",
    description: "Complete guide to health insurance on OPT in 2026. Compare ACA marketplace, employer, short-term, and COBRA plans. Learn about enrollment periods, subsidies, and coverage transitions for F-1 students.",
    keywords: ["OPT health insurance", "F-1 student health insurance", "health insurance after graduation", "international student health plans", "ACA marketplace OPT", "COBRA OPT students"],
    openGraph: {
        title: "OPT Health Insurance Guide 2026 | TrackMyOPT",
        description: "How to find and choose the best health insurance plan on OPT. ACA marketplace, employer plans, COBRA, and more.",
        url: "https://www.trackmyopt.com/blog/opt-health-insurance-guide",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "OPT Health Insurance Guide 2026: Best Plans & How to Choose" }],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/opt-health-insurance-guide-2026",
    },
};

export default function OPTHealthInsuranceGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Opt Health Insurance Guide", url: "https://www.trackmyopt.com/blog/opt-health-insurance-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "Do F-1 students on OPT need health insurance?", answer: "While there is no federal mandate penalty since 2019, some states impose penalties. Going without insurance is financially risky — an ER visit averages $2,200. Most advisors strongly recommend maintaining coverage during OPT."}, {question: "Can OPT students get ACA marketplace plans?", answer: "Yes. F-1 students on valid OPT are considered lawfully present and can purchase plans. Resident aliens for tax purposes may qualify for premium subsidies; non-resident aliens pay full price."}, {question: "What happens if I don't have health insurance on OPT?", answer: "Without insurance, you pay 100% of medical costs. An ER visit averages $2,200 and hospitalization $13,000/day. In states with individual mandates, you may also face tax penalties."}, {question: "When can I enroll in a marketplace plan?", answer: "During annual Open Enrollment (November 1 – January 15) or during a Special Enrollment Period triggered by losing coverage (60-day window)."}, {question: "Is employer health insurance available on OPT?", answer: "Yes. If your employer offers health benefits, you are eligible just like any other employee. Employers typically cover 50-80% of costs, making this the most affordable option."}]} />
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">OPT Health Insurance</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                        Health
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT Health Insurance Guide 2026: Best Plans & How to Choose
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    After graduation, your university health plan ends — but your need for coverage doesn't. This guide walks you through every health insurance option available to F-1 students on OPT, from ACA marketplace plans to employer coverage.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: March 12, 2026</span>
                    <span>•</span>
                    <span>Written by TrackMyOPT Team</span>
                </div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    F-1 students on OPT should secure health insurance immediately, as university student health plans typically end upon graduation. Options include employer-sponsored plans, ACA marketplace plans (available during Special Enrollment after losing student coverage), and short-term health insurance.
                </p>
            </div>

            {/* Key Takeaway Box */}
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-rose-900 dark:text-rose-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-rose-800 dark:text-rose-200 font-medium">
                    F-1 students on OPT are <strong>legally allowed to enroll in ACA marketplace plans</strong> (HealthCare.gov). Losing your university health plan qualifies you for a <strong>Special Enrollment Period (SEP)</strong> — giving you 60 days to enroll outside open enrollment. If you start a job, employer-sponsored insurance is typically the most cost-effective option.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#why-it-matters", "Why Health Insurance Matters on OPT"],
                        ["#types-of-insurance", "Types of Health Insurance for OPT Students"],
                        ["#aca-marketplace", "ACA Marketplace Plans: A Step-by-Step Guide"],
                        ["#employer-insurance", "Employer Health Insurance on OPT"],
                        ["#coverage-transition", "Coverage Transition: University to OPT"],
                        ["#choose-the-right-plan", "How to Choose the Right Plan"],
                        ["#state-specific", "State-Specific Considerations"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">

                <section id="why-it-matters" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Health Insurance Matters on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        While you were enrolled in school, your university likely required health insurance — either through a school-sponsored plan or proof of equivalent coverage. Once you graduate and begin OPT, <strong>that university plan typically ends</strong> within 30-60 days of your last semester.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Unlike many countries with universal healthcare, the US healthcare system is largely private. Without insurance, even routine medical care can be prohibitively expensive. An emergency room visit averages <strong>$2,200</strong>, a broken bone can cost <strong>$7,500+</strong>, and a hospital stay averages <strong>$13,000 per day</strong>.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Risks of Being Uninsured</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• A single ER visit could cost $2,000-$10,000+ out of pocket</li>
                                    <li>• Unpaid medical debt can be sent to collections, affecting your credit score</li>
                                    <li>• Some employers on OPT require proof of insurance for onboarding</li>
                                    <li>• If you need to leave the US for medical care, re-entry could be complicated</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                            <Heart className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-rose-900 dark:text-rose-100">Good News</h3>
                                <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">
                                    F-1 students on OPT have <strong>multiple affordable options</strong> — including ACA marketplace plans with potential subsidies, employer coverage, and short-term plans. TrackMyOPT's <Link href="/features/health-insurance" className="underline font-medium">Health Insurance Finder</Link> helps you compare all available options.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="types-of-insurance" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Types of Health Insurance for OPT Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Here are the five main health insurance options available to F-1 students on OPT, with pros and cons for each.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                type: "ACA Marketplace (HealthCare.gov)",
                                icon: Shield,
                                cost: "$150-$500/month (before subsidies)",
                                pros: ["Comprehensive coverage (hospitalization, prescriptions, preventive care)", "Potential subsidies based on income", "Guaranteed acceptance regardless of pre-existing conditions", "Special Enrollment Period after losing university insurance"],
                                cons: ["Monthly premiums can be high without subsidies", "Network restrictions (HMO/PPO)", "Enrollment outside SEP limited to annual open enrollment (Nov-Jan)"],
                                best: "OPT students without employer coverage who want comprehensive protection",
                            },
                            {
                                type: "Employer-Sponsored Insurance",
                                icon: Building2,
                                cost: "$50-$250/month (employee share)",
                                pros: ["Employer pays 50-80% of premiums", "Usually the most affordable comprehensive option", "Often includes dental and vision", "Coverage starts within 30-90 days of employment"],
                                cons: ["Only available if your employer offers it", "May have a waiting period (30-90 days)", "Coverage ends when employment ends"],
                                best: "OPT students with full-time employment at companies offering benefits",
                            },
                            {
                                type: "Short-Term Health Insurance",
                                icon: Clock,
                                cost: "$50-$200/month",
                                pros: ["Lower monthly premiums", "Quick enrollment (coverage can start next day)", "Good for bridging gaps between other coverage"],
                                cons: ["Limited coverage (may exclude pre-existing conditions, mental health, prescriptions)", "Not ACA-compliant (no essential health benefits required)", "Maximum coverage period varies by state (up to 36 months in some states)"],
                                best: "Temporary coverage while waiting for employer insurance to start",
                            },
                            {
                                type: "COBRA Continuation",
                                icon: ArrowRightLeft,
                                cost: "$400-$800/month (full premium + 2% admin fee)",
                                pros: ["Keeps your existing coverage and providers", "No gap in coverage", "Up to 18 months of continuation"],
                                cons: ["Very expensive — you pay 100% of the premium plus 2%", "Only available if your previous plan was employer-sponsored", "University student plans typically do not offer COBRA"],
                                best: "Students who were on employer insurance (e.g., from CPT) and want to keep the same plan",
                            },
                            {
                                type: "Catastrophic Plans",
                                icon: AlertTriangle,
                                cost: "$100-$250/month",
                                pros: ["Low monthly premiums", "Covers 3 primary care visits before deductible", "Free preventive care", "Protects against worst-case medical emergencies"],
                                cons: ["Very high deductibles ($9,200+ in 2025)", "Only available if you're under 30", "Does not count toward ACA subsidy eligibility"],
                                best: "Healthy OPT students under 30 who want low-cost emergency protection",
                            },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Icon className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{item.type}</h3>
                                            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">Typical cost: {item.cost}</span>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3 ml-8">
                                        <div>
                                            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Pros</p>
                                            <ul className="space-y-1">
                                                {item.pros.map((pro, j) => (
                                                    <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Cons</p>
                                            <ul className="space-y-1">
                                                {item.cons.map((con, j) => (
                                                    <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                                        <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                                        {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 ml-8">🎯 Best for: {item.best}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section id="aca-marketplace" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        ACA Marketplace Plans: A Step-by-Step Guide
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The ACA (Affordable Care Act) marketplace at <a href="https://www.healthcare.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">HealthCare.gov</a> is one of the best options for OPT students without employer coverage. F-1 students who are <strong>non-resident aliens</strong> are not eligible for marketplace subsidies, but can still purchase plans at full price. Those who have become <strong>resident aliens</strong> for tax purposes may qualify for premium subsidies.
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: "Confirm Your Eligibility", detail: "You must be lawfully present in the US. F-1 students on valid OPT with an EAD card meet this requirement. You do not need to be a US citizen or green card holder to purchase a marketplace plan." },
                            { step: "Determine Your Special Enrollment Period", detail: "Losing your university health plan is a qualifying life event that triggers a 60-day Special Enrollment Period (SEP). You can enroll in a marketplace plan within 60 days of your university coverage end date — even outside the annual open enrollment period (November 1 – January 15)." },
                            { step: "Gather Required Information", detail: "You'll need your EAD card, passport, Social Security Number (or apply for one), I-94 record, proof of university coverage end date, and estimated annual income for the coverage year." },
                            { step: "Compare Plans on HealthCare.gov", detail: "Plans are categorized by metal tier — Bronze (lowest premium, highest deductible), Silver, Gold, and Platinum (highest premium, lowest deductible). Consider your expected healthcare usage when choosing a tier." },
                            { step: "Check for Subsidies", detail: "If you are a resident alien for tax purposes and your income is 100-400% of the Federal Poverty Level ($15,060-$60,240 for a single person in 2025), you may qualify for premium tax credits that significantly reduce your monthly cost." },
                            { step: "Enroll and Pay Your First Premium", detail: "Complete enrollment on HealthCare.gov or your state marketplace. Coverage typically starts the first of the month following enrollment. Pay your first premium to activate coverage." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-700 dark:text-rose-300 text-sm font-bold">{i + 1}</div>
                                    {item.step}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 rounded-r-xl">
                        <p className="text-rose-900 dark:text-rose-100 font-semibold text-lg">
                            "F-1 students on valid OPT are considered lawfully present and can purchase ACA marketplace plans. The 60-day SEP after losing university coverage is your best window to enroll."
                        </p>
                        <p className="text-rose-700 dark:text-rose-300 text-sm mt-1">
                            — Source: HealthCare.gov, CMS Immigration Status & the Marketplace
                        </p>
                    </div>
                </section>

                <section id="employer-insurance" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Employer Health Insurance on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you land a full-time job on OPT, employer-sponsored health insurance is typically the <strong>best and most affordable option</strong>. Most large and mid-size employers offer health benefits, covering 50-80% of the premium cost.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            { title: "When Coverage Starts", desc: "Most employers have a waiting period of 30-90 days before health benefits begin. Some start coverage on your first day. Ask during onboarding — this affects how long you need alternative coverage." },
                            { title: "What to Ask HR", desc: "Request the Summary of Benefits and Coverage (SBC) document. Ask about the monthly employee premium, deductible, out-of-pocket maximum, and whether the plan includes dental and vision." },
                            { title: "Enrollment Periods", desc: "New hires typically have a 30-day enrollment window after their start date. If you miss it, you'll need to wait for annual open enrollment (usually in November) to make changes." },
                            { title: "OPT-Specific Considerations", desc: "Employer insurance on OPT works the same as for any employee. Your F-1/OPT status does not affect eligibility for employer benefits. Coverage ends when your employment ends." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-rose-500" />
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Gap Coverage:</strong> If your employer has a 60-90 day waiting period, you'll need temporary coverage in the meantime. Consider a short-term health plan or extending your university plan via COBRA (if available) to bridge this gap.
                        </p>
                    </div>
                </section>

                <section id="coverage-transition" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Coverage Transition: University to OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The transition from university health insurance to OPT coverage is one of the most critical periods. Here's a timeline to ensure you don't have any gaps. Visit <Link href="/features/compliance" className="text-blue-600 dark:text-blue-400 underline">OPT Compliance Tracker</Link> to stay on top of all your OPT deadlines.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                period: "2-3 Months Before Graduation",
                                tasks: [
                                    "Check your university health plan's exact end date (it may end at graduation, end of semester, or 30 days after)",
                                    "Research ACA marketplace plans in your state",
                                    "Ask potential employers about health benefit timelines",
                                    "Start comparing plans using TrackMyOPT's Health Insurance Finder",
                                ],
                            },
                            {
                                period: "1 Month Before Coverage Ends",
                                tasks: [
                                    "Get written confirmation of your university plan end date (you'll need this for SEP)",
                                    "If employed, confirm your employer benefits start date and any waiting period",
                                    "If no employer coverage, begin ACA marketplace enrollment using your SEP",
                                    "Consider short-term insurance if you need to bridge a gap",
                                ],
                            },
                            {
                                period: "Coverage End Date",
                                tasks: [
                                    "Ensure new coverage is active before old coverage ends (or same day)",
                                    "Keep your university coverage termination letter for records",
                                    "Fill any prescriptions you need before the old plan ends",
                                    "Save copies of your old insurance card and explanation of benefits",
                                ],
                            },
                            {
                                period: "First 60 Days After Coverage Loss",
                                tasks: [
                                    "This is your Special Enrollment Period — last chance to enroll in ACA marketplace",
                                    "If you started a new job, complete employer benefits enrollment within 30 days",
                                    "Confirm your new insurance is active by calling the insurance company",
                                    "Set up your online account for claims and find in-network providers",
                                ],
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-700 dark:text-rose-300 text-sm font-bold">{i + 1}</div>
                                    {item.period}
                                </h3>
                                <ul className="space-y-1 ml-9">
                                    {item.tasks.map((task, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="choose-the-right-plan" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Choose the Right Plan
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Choosing a health insurance plan involves balancing monthly costs with coverage quality. Here are the key factors to compare. Use TrackMyOPT's <Link href="/dashboard/opt-health-insurance-finder" className="text-blue-600 dark:text-blue-400 underline">Health Insurance Finder</Link> to get personalized plan recommendations.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">What It Means</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">What to Look For</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Monthly Premium", "The amount you pay each month for coverage", "Balance with deductible — lower premium = higher deductible"],
                                    ["Deductible", "Amount you pay before insurance kicks in", "Bronze: ~$7,000 | Silver: ~$4,500 | Gold: ~$1,500"],
                                    ["Out-of-Pocket Max", "Maximum you'll pay in a year", "Look for $8,000-$9,200 or less (2025 ACA max: $9,200)"],
                                    ["Copay / Coinsurance", "Your share of costs after deductible", "Copay ($20-$50/visit) vs coinsurance (20-40% of bill)"],
                                    ["Provider Network", "Which doctors and hospitals are covered", "Check if your preferred providers are in-network (HMO vs PPO)"],
                                    ["Prescription Coverage", "How drug costs are shared", "Check the formulary for any medications you take regularly"],
                                    ["Preventive Care", "Routine checkups, vaccinations", "All ACA plans cover preventive care free (before deductible)"],
                                ].map(([factor, means, look], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{factor}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{means}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{look}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 bg-gray-100 dark:bg-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Quick Decision Framework</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>🏥 <strong>Healthy, rarely see a doctor</strong> → Bronze or Catastrophic plan (low premium, high deductible)</p>
                            <p>💊 <strong>Take regular medications</strong> → Silver or Gold plan (check drug formulary first)</p>
                            <p>👶 <strong>Planning major medical care</strong> → Gold or Platinum plan (low deductible, predictable costs)</p>
                            <p>💼 <strong>Have employer coverage available</strong> → Almost always the best option (employer subsidizes premium)</p>
                        </div>
                    </div>
                </section>

                <section id="state-specific" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        State-Specific Considerations
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Health insurance rules and options vary significantly by state. Some states run their own marketplace instead of using HealthCare.gov, and a few states have expanded Medicaid eligibility.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            {
                                title: "States With Own Marketplaces",
                                desc: "California (Covered California), New York (NY State of Health), Massachusetts (Health Connector), Colorado, Connecticut, DC, Idaho, Kentucky, Maryland, Minnesota, Nevada, New Jersey, New Mexico, Pennsylvania, Rhode Island, Vermont, Virginia, and Washington run their own exchanges.",
                                note: "Enroll through the state marketplace website, not HealthCare.gov.",
                            },
                            {
                                title: "Medicaid Eligibility",
                                desc: "In most states, non-resident aliens on F-1 visas are NOT eligible for Medicaid. However, some states (California, New York, Illinois, Oregon, Washington) have expanded coverage to certain immigrants regardless of status.",
                                note: "Eligibility varies — check your specific state's Medicaid rules.",
                            },
                            {
                                title: "State Individual Mandates",
                                desc: "While the federal individual mandate penalty is $0 since 2019, some states (California, Massachusetts, New Jersey, Rhode Island, DC, Vermont) still impose their own penalties for being uninsured.",
                                note: "If you live in one of these states, having insurance is especially important.",
                            },
                            {
                                title: "Short-Term Plan Restrictions",
                                desc: "Some states limit or ban short-term health insurance plans. California, Massachusetts, New York, New Jersey, and several others either prohibit or heavily restrict these plans.",
                                note: "Check your state's rules before purchasing a short-term plan.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.desc}</p>
                                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">📌 {item.note}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "Do F-1 students on OPT need health insurance?", answer: "While there is no federal law requiring everyone to have health insurance (the individual mandate penalty is $0 since 2019), some states still impose penalties for being uninsured. More importantly, going without health insurance in the US is extremely risky financially — a single medical emergency can result in thousands of dollars in bills. Most immigration advisors strongly recommend maintaining coverage throughout your OPT period.",
                            },
                            { question: "Can OPT students get ACA marketplace plans?", answer: "Yes. F-1 students on valid OPT are considered 'lawfully present' in the US and can purchase health insurance through the ACA marketplace (HealthCare.gov or your state marketplace). However, only those classified as resident aliens for tax purposes are eligible for premium tax credit subsidies. Non-resident aliens can purchase plans at full price.",
                            },
                            { question: "What happens if I don't have health insurance on OPT?", answer: "Without insurance, you are responsible for 100% of any medical costs. An ER visit averages $2,200, and hospitalization averages $13,000/day. Unpaid medical bills can be sent to collections and damage your credit score. In states with individual mandates (CA, MA, NJ, RI, DC), you may also face a tax penalty for being uninsured.",
                            },
                            { question: "When can I enroll in a marketplace plan?", answer: "You can enroll during the annual Open Enrollment Period (November 1 – January 15). Outside that window, you need a qualifying life event to trigger a Special Enrollment Period (SEP). Losing your university health coverage qualifies as a life event, giving you 60 days from the coverage end date to enroll.",
                            },
                            { question: "Is employer health insurance available on OPT?", answer: "Yes. If your OPT employer offers health benefits to employees, you are eligible to enroll just like any other employee — your F-1/OPT status does not affect eligibility for employer-sponsored insurance. This is typically the most affordable option since employers cover 50-80% of the premium cost.",
                            },
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
                    <Link href="/blog/f1-student-tax-filing-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Student Tax Filing Guide 2026</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/f1-visa-jobs-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Visa Jobs Guide 2026</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day Unemployment Rule</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/health-insurance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Health Insurance Finder →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                    <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">View Pricing →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Find the Right Health Insurance Plan</h2>
                <p className="text-rose-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT's Health Insurance Finder compares plans based on your location, income, and health needs — so you get the best coverage at the right price.
                </p>
                <Link href="/features/health-insurance" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-xl font-semibold hover:bg-rose-50 transition-colors">
                    Compare Plans Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

        </article>
    );
}
