import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import Link from "next/link";
import {
    Heart,
    Shield,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Building,
    Calendar,
    MapPin,
    FileText,
    ExternalLink,
    BookOpen,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "OPT Health Insurance Guide: Plans, Requirements & Costs | TrackMyOPT",
    description: "Complete guide to health insurance for F-1 students on OPT. Compare plans, understand requirements, budget, and avoid penalties.",
    alternates: {
        canonical: "https://www.trackmyopt.com/guides/opt-health-insurance",
    },
};

const tocItems = [
    ["#why-critical", "Why Health Insurance Is Critical on OPT"],
    ["#coverage-options", "Understanding Your Coverage Options"],
    ["#aca-marketplace", "ACA Marketplace Plans: Complete Enrollment Guide"],
    ["#employer-insurance", "Employer Health Insurance"],
    ["#cobra", "COBRA: Extending University Coverage"],
    ["#short-term", "Short-Term Health Insurance"],
    ["#catastrophic", "Catastrophic Health Plans"],
    ["#transition-timeline", "Coverage Transition Timeline"],
    ["#state-guide", "State-by-State Health Insurance Guide"],
    ["#compare-plans", "How to Compare Health Insurance Plans"],
    ["#common-mistakes", "Common Health Insurance Mistakes on OPT"],
    ["#free-resources", "Free & Low-Cost Health Resources"],
    ["#faq", "Frequently Asked Questions"],
];

const coverageOptionsTable = [
    { type: "ACA Marketplace", cost: "$0–$500/mo", duration: "Annual (renewable)", network: "HMO / PPO / EPO", pros: "Subsidies, comprehensive, pre-existing covered", cons: "Enrollment windows, network restrictions" },
    { type: "Employer Plan", cost: "$50–$250/mo", duration: "While employed", network: "PPO / HMO", pros: "Employer pays 50–80%, dental/vision often included", cons: "30–90 day waiting period, tied to job" },
    { type: "COBRA", cost: "$400–$800/mo", duration: "Up to 18 months", network: "Same as prior plan", pros: "No coverage gap, keep same doctors", cons: "Very expensive (100% + 2% admin fee)" },
    { type: "Short-Term", cost: "$50–$150/mo", duration: "3–12 months", network: "PPO (usually)", pros: "Fast enrollment, low premiums, gap coverage", cons: "Pre-existing excluded, not ACA-compliant" },
    { type: "Catastrophic", cost: "$100–$250/mo", duration: "Annual", network: "HMO / PPO", pros: "Low premiums, 3 primary care visits free", cons: "Under 30 only, very high deductible ($9,200+)" },
    { type: "University Alumni Plan", cost: "$200–$600/mo", duration: "6–12 months post-grad", network: "Varies", pros: "Familiar coverage, campus health access", cons: "Expensive, limited availability" },
];

const metalTiers = [
    { tier: "Bronze", premium: "Lowest ($200–$350/mo)", deductible: "Highest (~$7,500)", oopMax: "~$9,200", coverage: "60% plan / 40% you", bestFor: "Healthy, rarely see a doctor" },
    { tier: "Silver", premium: "Moderate ($350–$500/mo)", deductible: "Mid (~$4,500)", oopMax: "~$9,200", coverage: "70% plan / 30% you", bestFor: "Average healthcare needs" },
    { tier: "Gold", premium: "Higher ($450–$650/mo)", deductible: "Low (~$1,500)", oopMax: "~$8,700", coverage: "80% plan / 20% you", bestFor: "Regular prescriptions or planned care" },
    { tier: "Platinum", premium: "Highest ($600–$800/mo)", deductible: "Very Low (~$500)", oopMax: "~$4,500", coverage: "90% plan / 10% you", bestFor: "Frequent medical needs" },
];

const stateGuideData = [
    { state: "California", marketplace: "Covered California", expansion: true, notes: "State mandate penalty; expanded Medi-Cal for low-income immigrants" },
    { state: "New York", marketplace: "NY State of Health", expansion: true, notes: "Essential Plan for low-income ($0–$20/mo); Basic Health Program" },
    { state: "Texas", marketplace: "HealthCare.gov", expansion: false, notes: "No state mandate; limited Medicaid; large uninsured population" },
    { state: "Massachusetts", marketplace: "Health Connector", expansion: true, notes: "State mandate with penalties; ConnectorCare subsidized plans" },
    { state: "Illinois", marketplace: "HealthCare.gov", expansion: true, notes: "Expanded Medicaid; community health centers widely available" },
    { state: "Florida", marketplace: "HealthCare.gov", expansion: false, notes: "No expansion; no state mandate; short-term plans widely available" },
    { state: "Pennsylvania", marketplace: "Pennie", expansion: true, notes: "State-based marketplace; expanded Medicaid access" },
    { state: "New Jersey", marketplace: "GetCoveredNJ", expansion: true, notes: "State mandate with penalties; generous subsidies" },
    { state: "Virginia", marketplace: "HealthCare.gov", expansion: true, notes: "Medicaid expanded 2019; large immigrant population in NoVA" },
    { state: "Washington", marketplace: "WA Healthplanfinder", expansion: true, notes: "Cascade Care public option; expanded Apple Health" },
    { state: "Georgia", marketplace: "HealthCare.gov", expansion: false, notes: "No expansion; limited options; FQHC availability varies" },
    { state: "Michigan", marketplace: "HealthCare.gov", expansion: true, notes: "Healthy Michigan Plan; expanded Medicaid eligibility" },
    { state: "Ohio", marketplace: "HealthCare.gov", expansion: true, notes: "Expanded Medicaid; competitive marketplace pricing" },
    { state: "North Carolina", marketplace: "HealthCare.gov", expansion: true, notes: "Medicaid expanded Dec 2023; marketplace options improving" },
    { state: "Maryland", marketplace: "Maryland Health Connection", expansion: true, notes: "State mandate (repealed 2024); Young Adult subsidy program" },
];

const faqItems = [
    { q: "Are F-1 students on OPT required to have health insurance?", a: "There is no federal law requiring health insurance (the individual mandate penalty has been $0 since 2019). However, some states — California, Massachusetts, New Jersey, Rhode Island, and DC — impose their own penalties for being uninsured. Beyond legality, going without insurance is an extreme financial risk: a single ER visit averages $2,200+ and hospital stays average $13,000 per day." },
    { q: "Can I enroll in ACA marketplace plans on OPT?", a: "Yes. F-1 students on valid OPT are considered 'lawfully present' and can purchase plans through HealthCare.gov or their state marketplace. Those classified as resident aliens for tax purposes may qualify for premium subsidies that can reduce costs to $0/month." },
    { q: "What is the Special Enrollment Period and how do I qualify?", a: "A Special Enrollment Period (SEP) is a 60-day window that lets you enroll in marketplace plans outside of annual open enrollment. Losing your university health plan is a qualifying life event. Your 60-day window starts from the date your university coverage ends." },
    { q: "How much does health insurance cost on OPT?", a: "Costs vary widely: ACA marketplace plans range from $0–$500/month (depending on subsidies), employer plans cost $50–$250/month (employee share), short-term plans run $50–$150/month, and catastrophic plans cost $100–$250/month. Employer-sponsored insurance is typically the most affordable comprehensive option." },
    { q: "What should I do during my employer's insurance waiting period?", a: "Most employers have a 30–90 day waiting period before benefits start. During this gap, enroll in a short-term health plan ($50–$150/month), use your Special Enrollment Period for a marketplace plan, or extend university coverage via COBRA if available." },
    { q: "Can I use COBRA to extend my university health plan?", a: "It depends. COBRA only applies to employer-sponsored group health plans. Most university Student Health Insurance Plans (SHIP) are not employer plans and don't offer COBRA. However, if your university coverage was through an employer-type group plan, you may have COBRA rights. Check with your university's benefits office." },
    { q: "Are pre-existing conditions covered under marketplace plans?", a: "Yes. All ACA marketplace plans must cover pre-existing conditions — they cannot deny coverage or charge more based on your health history. This is NOT true for short-term plans, which can exclude pre-existing conditions." },
    { q: "What is the difference between HMO, PPO, and EPO networks?", a: "HMO (Health Maintenance Organization) requires a primary care physician referral to see specialists and only covers in-network care. PPO (Preferred Provider Organization) lets you see any doctor but costs less in-network. EPO (Exclusive Provider Organization) covers only in-network care but doesn't require referrals." },
    { q: "Do I need dental and vision insurance separately?", a: "Usually yes. Most health insurance plans do not include dental or vision coverage for adults. You'll need to purchase separate dental and vision plans, or look for employer plans that bundle them. Some marketplace plans include pediatric dental but not adult dental." },
    { q: "What happens to my health insurance if my OPT expires or I change status?", a: "If your OPT ends and you leave the US, your coverage ends (you can cancel it). If you transition to H-1B or another status, employer insurance continues uninterrupted. If there's a gap between statuses, losing coverage triggers a new Special Enrollment Period for marketplace plans." },
];

export default function OPTHealthInsurancePillarGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Schema Markup */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: safeSerializeJsonLd({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "OPT Health Insurance Guide 2026: Everything You Need to Know",
                "description": "The definitive health insurance resource for F-1 students on OPT. From ACA marketplace enrollment to employer plans, COBRA, state-by-state options, and free resources — this guide covers every decision you need to make to stay covered and protected.",
                "image": "https://www.trackmyopt.com/og-opt-health-insurance.jpg",
                "datePublished": "2026-03-12",
                "dateModified": "2026-03-12",
                "author": {
                    "@type": "Organization",
                    "name": "Vinay Kumar",
                    "url": "https://www.trackmyopt.com"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "TrackMyOPT",
                    "url": "https://www.trackmyopt.com",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.trackmyopt.com/logo.png"
                    }
                },
                "articleBody": "Comprehensive guide to health insurance options for F-1 students on OPT, including ACA marketplace, employer plans, COBRA, and state-specific resources."
            })}} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: safeSerializeJsonLd({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "How to Get Health Insurance on OPT",
                "description": "Step-by-step guide to choosing, enrolling, and maintaining health insurance as an F-1 student on Optional Practical Training.",
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Understand Why Health Insurance Is Critical",
                        "text": "The US has no universal healthcare. A single ER visit costs $2,200+, a broken bone costs $7,500+, and a hospital stay averages $13,000 per day. Choose coverage now to avoid catastrophic unpaid medical debt."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Review All Available Coverage Options",
                        "text": "Know your six main options: ACA marketplace ($0–$500/mo), employer plans ($50–$250/mo), COBRA ($400–$800/mo), short-term insurance ($50–$150/mo), catastrophic plans ($100–$250/mo), and university alumni plans ($200–$600/mo)."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Get Your University Coverage End Date",
                        "text": "Contact your university's health center for written confirmation of when your Student Health Insurance Plan (SHIP) ends. This triggers a 60-day Special Enrollment Period for marketplace plans—outside annual open enrollment."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Enroll in ACA Marketplace Plans",
                        "text": "Visit HealthCare.gov or your state marketplace. F-1 students on valid OPT are 'lawfully present' and eligible. Select your qualifying life event (losing university coverage), upload termination letter, and enroll within 60 days."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Compare ACA Metal Tiers",
                        "text": "Choose based on expected healthcare needs: Bronze (lowest premium, highest deductible), Silver (moderate both), Gold (higher premium, lower deductible), or Platinum (highest premium, lowest deductible and out-of-pocket max)."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Apply for Subsidies if Eligible",
                        "text": "Resident aliens for tax purposes with income 100–400% of Federal Poverty Level may qualify for premium tax credits (subsidies). Non-resident aliens pay full price but still have marketplace access."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Plan for Employer Insurance Gaps",
                        "text": "Most employers have 30–90 day waiting periods before benefits start. Bridge the gap with short-term insurance, marketplace plans via Special Enrollment Period, or COBRA if available from your previous university plan."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Navigate State-Specific Requirements",
                        "text": "Check your state's marketplace and Medicaid expansion status. Some states (CA, MA, NJ, NY) impose penalties for being uninsured. Research community health centers and state subsidized programs available in your location."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Select the Right Network Type",
                        "text": "Understand HMO (low cost, prior care required), PPO (flexibility, higher cost), and EPO (balance of both). Choose based on your doctor preferences and expected healthcare usage."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Budget for Additional Coverage",
                        "text": "Most health plans don't include dental or vision for adults. Purchase separate dental and vision plans or find employer plans that bundle them. Budget $20–$50/month for each."
                    }
                ]
            })}} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Guides</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">OPT Health Insurance</span>
            </nav>

            {/* Hero */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                        <Heart className="w-3 h-3" />
                        Pillar Guide
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        25 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT Health Insurance Guide 2026: Everything You Need to Know
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The definitive health insurance resource for F-1 students on OPT. From ACA marketplace enrollment to employer plans, COBRA, state-by-state options, and free resources — this guide covers every decision you need to make to stay covered and protected.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: March 12, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Key Takeaway */}
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-rose-900 dark:text-rose-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-rose-800 dark:text-rose-200 font-medium leading-relaxed">
                    F-1 students on OPT are <strong>legally eligible to buy ACA marketplace health insurance</strong> (HealthCare.gov). Losing your university plan triggers a <strong>60-day Special Enrollment Period</strong>. With income-based subsidies, many OPT students qualify for plans starting at <strong>$0/month</strong>. If your employer offers coverage, that&apos;s almost always the best deal — but plan ahead for the 30–90 day waiting period.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    In This Guide
                </h2>
                <nav className="grid sm:grid-cols-2 gap-2">
                    {tocItems.map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                {/* Section 1: Why Health Insurance Is Critical */}
                <section id="why-critical" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Heart className="w-7 h-7 text-rose-500 flex-shrink-0" />
                        Why Health Insurance Is Critical on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        While you were a student, your university almost certainly required health insurance — either a school-sponsored Student Health Insurance Plan (SHIP) or equivalent coverage. Once you graduate and begin OPT, <strong>that coverage typically ends within 30–60 days</strong>. Unlike most countries, the US has no universal healthcare system, and medical costs without insurance are staggering.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: "ER Visit", cost: "$2,200+", icon: AlertTriangle },
                            { label: "Broken Bone", cost: "$7,500+", icon: Heart },
                            { label: "Hospital Stay (per day)", cost: "$13,000+", icon: Building },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 p-4 text-center">
                                    <Icon className="w-5 h-5 text-red-500 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-red-700 dark:text-red-300">{item.cost}</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{item.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        There is <strong>no federal legal requirement</strong> to carry health insurance (the individual mandate penalty has been $0 since 2019). However, some states — including California, Massachusetts, New Jersey, Rhode Island, and DC — still impose their own penalties for being uninsured. Beyond legal requirements, the financial risk of going without coverage in the US is extreme. A single unexpected medical event can result in debt that takes years to pay off and can damage your credit score.
                    </p>

                    <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">The Good News</h3>
                            <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                                F-1 students on OPT have multiple affordable options — ACA marketplace plans (many qualify for $0/month with subsidies), employer coverage, short-term plans, and more. TrackMyOPT&apos;s <Link href="/features/health-insurance" className="underline font-medium">Health Insurance Finder</Link> helps you compare every option side by side.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Understanding Your Coverage Options */}
                <section id="coverage-options" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-blue-500 flex-shrink-0" />
                        Understanding Your Coverage Options
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        There are six primary health insurance options available to F-1 students on OPT. Each has different costs, coverage levels, and eligibility requirements. Here&apos;s a side-by-side comparison.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Plan Type</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Cost Range</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Duration</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Network</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Pros</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Cons</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coverageOptionsTable.map((row, i) => (
                                    <tr key={row.type} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : "bg-white dark:bg-zinc-950"}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{row.type}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{row.cost}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{row.duration}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{row.network}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-green-700 dark:text-green-400 text-xs">{row.pros}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-red-600 dark:text-red-400 text-xs">{row.cons}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl">
                        <p className="text-blue-900 dark:text-blue-100 text-sm">
                            <strong>Not sure where to start?</strong> If you have employer coverage available, start there — it&apos;s typically the best value. Otherwise, the ACA marketplace is your most comprehensive option. Use <Link href="/dashboard/opt-health-insurance-finder" className="underline font-medium">TrackMyOPT&apos;s Health Insurance Finder</Link> to get personalized recommendations.
                        </p>
                    </div>
                </section>

                {/* Section 3: ACA Marketplace Plans */}
                <section id="aca-marketplace" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                        ACA Marketplace Plans: Complete Enrollment Guide
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The Affordable Care Act (ACA) marketplace at <a href="https://www.healthcare.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1">HealthCare.gov <ExternalLink className="w-3 h-3" /></a> is one of the best options for OPT students without employer coverage. F-1 students on valid OPT are considered <strong>&quot;lawfully present&quot;</strong> and are eligible to purchase marketplace plans.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-8">Who&apos;s Eligible</h3>
                    <ul className="space-y-2 mb-6">
                        {[
                            "F-1 students on OPT with a valid EAD card = eligible to purchase marketplace plans",
                            "Non-resident aliens can buy plans at full price (no subsidies)",
                            "Resident aliens for tax purposes may qualify for premium tax credits",
                            "You do NOT need to be a US citizen or green card holder",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Special Enrollment Period (SEP)</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Losing your university health plan is a <strong>qualifying life event</strong> that triggers a 60-day Special Enrollment Period. This means you can enroll in a marketplace plan within 60 days of your university coverage end date — even outside the annual open enrollment window (November 1 – January 15).
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Step-by-Step Enrollment</h3>
                    <div className="space-y-3 mb-8">
                        {[
                            { step: "Get your coverage end date in writing", detail: "Contact your university health center for an official letter confirming when your SHIP ends. You'll need this to prove your qualifying life event." },
                            { step: "Gather required documents", detail: "EAD card, passport, I-94 record, Social Security Number (or apply for one), and your estimated annual income for the coverage year." },
                            { step: "Visit HealthCare.gov or your state marketplace", detail: "Some states run their own marketplace (see State-by-State Guide below). Create an account and start an application." },
                            { step: "Select your qualifying life event", detail: "Choose 'Lost health coverage' and enter your university plan end date. Upload your coverage termination letter when prompted." },
                            { step: "Compare plans by metal tier", detail: "Plans are categorized as Bronze, Silver, Gold, or Platinum. Lower tiers have lower premiums but higher out-of-pocket costs." },
                            { step: "Check for subsidies", detail: "If you're a resident alien for tax purposes with income between 100–400% of the Federal Poverty Level ($15,060–$60,240 for a single person), you may qualify for premium tax credits." },
                            { step: "Enroll and pay your first premium", detail: "Coverage typically starts the first of the month following enrollment. Pay your first premium to activate — unpaid first premiums cancel your enrollment." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold flex-shrink-0">{i + 1}</div>
                                    {item.step}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Metal Tiers Comparison</h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Tier</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Monthly Premium</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Deductible</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Out-of-Pocket Max</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Cost Split</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Best For</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metalTiers.map((row, i) => (
                                    <tr key={row.tier} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : "bg-white dark:bg-zinc-950"}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{row.tier}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{row.premium}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{row.deductible}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{row.oopMax}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{row.coverage}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400 text-xs">{row.bestFor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                        <p className="text-emerald-900 dark:text-emerald-100 font-semibold">
                            &quot;F-1 students on valid OPT are considered lawfully present and can purchase ACA marketplace plans. The 60-day SEP after losing university coverage is your best window to enroll.&quot;
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1">
                            — Source: HealthCare.gov, CMS Immigration Status &amp; the Marketplace
                        </p>
                    </div>
                </section>

                {/* Section 4: Employer Health Insurance */}
                <section id="employer-insurance" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Building className="w-7 h-7 text-indigo-500 flex-shrink-0" />
                        Employer Health Insurance
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you land a full-time job on OPT, employer-sponsored health insurance is typically the <strong>best and most affordable option</strong>. Employers with 50+ full-time employees are required to offer coverage, and they usually pay 50–80% of the premium.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Typical Waiting Period: 30–90 Days</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Most employers have a waiting period before health benefits begin. Some start coverage on day one, but 60–90 days is common. During this gap, you&apos;ll need bridge coverage — a short-term plan, COBRA, or marketplace plan.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What to Ask During Onboarding</h3>
                    <div className="grid md:grid-cols-2 gap-3 mb-6">
                        {[
                            { q: "When does coverage start?", detail: "Day 1, 30 days, 60 days, or 90 days?" },
                            { q: "What's the monthly employee premium?", detail: "Your share after employer contribution" },
                            { q: "What's the plan type?", detail: "HMO, PPO, or EPO? Single vs family?" },
                            { q: "Is dental and vision included?", detail: "Often separate plans with separate enrollment" },
                            { q: "What's the deductible and OOP max?", detail: "Ask for the Summary of Benefits (SBC)" },
                            { q: "What happens if I leave?", detail: "COBRA eligibility and continuation options" },
                        ].map((item) => (
                            <div key={item.q} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.q}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>COBRA When Leaving:</strong> If you leave your job, you have 60 days to elect COBRA continuation coverage. This lets you keep the same plan for up to 18 months, but you pay the full premium (employer + employee share) plus a 2% admin fee.</span>
                        </p>
                    </div>
                </section>

                {/* Section 5: COBRA */}
                <section id="cobra" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Clock className="w-7 h-7 text-orange-500 flex-shrink-0" />
                        COBRA: Extending University Coverage
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        COBRA (Consolidated Omnibus Budget Reconciliation Act) allows you to continue group health coverage after a qualifying event like job loss or graduation. However, there are important caveats for OPT students.
                    </p>

                    <div className="space-y-4 mb-6">
                        {[
                            { title: "What COBRA covers", desc: "You keep the exact same plan, doctors, and coverage you had before. Nothing changes except who pays — you now pay 100% of the premium plus a 2% administrative fee." },
                            { title: "60-day election window", desc: "After you receive your COBRA notice, you have 60 days to decide whether to elect coverage. COBRA is retroactive — if you elect within 60 days, coverage is continuous from the date your prior plan ended." },
                            { title: "Cost reality", desc: "COBRA is expensive. If your employer was paying $500/month and you were paying $100/month, your COBRA cost would be approximately $612/month (($500 + $100) × 1.02). For many OPT students, a marketplace plan is more affordable." },
                            { title: "Duration limits", desc: "COBRA typically lasts up to 18 months for job loss. Some qualifying events allow 36 months. University SHIP plans generally do NOT offer COBRA — it only applies to employer-sponsored group plans." },
                        ].map((item) => (
                            <div key={item.title} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-xl">
                        <p className="text-orange-900 dark:text-orange-100 text-sm">
                            <strong>COBRA vs. Marketplace:</strong> In most cases, an ACA marketplace plan is cheaper and offers comparable coverage. COBRA only makes sense if you&apos;re mid-treatment with a specific provider, have already met your deductible, or need coverage for a very short gap (1–2 months).
                        </p>
                    </div>
                </section>

                {/* Section 6: Short-Term Health Insurance */}
                <section id="short-term" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Calendar className="w-7 h-7 text-purple-500 flex-shrink-0" />
                        Short-Term Health Insurance
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Short-term health insurance is designed for temporary coverage gaps — like the period between graduation and the start of employer benefits. These plans are <strong>not ACA-compliant</strong>, meaning they don&apos;t have to cover all essential health benefits.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                When Short-Term Works
                            </h3>
                            <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                <li>• Bridging a 1–3 month gap before employer coverage</li>
                                <li>• You missed the marketplace enrollment window</li>
                                <li>• You&apos;re healthy with no pre-existing conditions</li>
                                <li>• You need coverage starting immediately (next-day enrollment)</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Key Limitations
                            </h3>
                            <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                                <li>• Pre-existing conditions typically excluded</li>
                                <li>• Mental health, maternity, and prescriptions may not be covered</li>
                                <li>• Maximum duration varies by state (3–12 months)</li>
                                <li>• Banned in CA, MA, NY, NJ, and several other states</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-5">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Cost range:</strong> $50–$150/month for a healthy individual in their 20s. Premiums vary by age, location, and coverage level. Popular providers include United Healthcare Short Term, National General, and Oscar Health (in select states).
                        </p>
                    </div>
                </section>

                {/* Section 7: Catastrophic Health Plans */}
                <section id="catastrophic" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <DollarSign className="w-7 h-7 text-teal-500 flex-shrink-0" />
                        Catastrophic Health Plans
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Catastrophic plans are a special category of ACA marketplace plans designed for young, healthy adults. They offer the <strong>lowest monthly premiums</strong> of any comprehensive plan but come with very high deductibles.
                    </p>

                    <div className="space-y-3 mb-6">
                        {[
                            { label: "Eligibility", value: "Must be under 30 years old (or have a hardship/affordability exemption)" },
                            { label: "Monthly premium", value: "$100–$250/month (varies by location)" },
                            { label: "Deductible", value: "$9,200+ (2025/2026 — must pay this before insurance covers anything)" },
                            { label: "Primary care", value: "3 visits covered before deductible at no cost" },
                            { label: "Preventive care", value: "Free preventive services (vaccinations, screenings) before deductible" },
                            { label: "Best for", value: "Healthy OPT students who want low-cost protection against worst-case emergencies" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-3 text-sm">
                                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px] flex-shrink-0">{item.label}</span>
                                <span className="text-gray-600 dark:text-gray-400">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 p-4 rounded-r-xl">
                        <p className="text-teal-900 dark:text-teal-100 text-sm">
                            <strong>Think of it as emergency insurance.</strong> You pay very little monthly, but if something major happens (accident, surgery, hospitalization), the plan protects you from financial ruin after you meet the high deductible. For day-to-day care, you pay out of pocket except for 3 primary care visits.
                        </p>
                    </div>
                </section>

                {/* Section 8: Coverage Transition Timeline */}
                <section id="transition-timeline" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Calendar className="w-7 h-7 text-pink-500 flex-shrink-0" />
                        Coverage Transition Timeline
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Timing is everything when transitioning health coverage. Here&apos;s a month-by-month guide to ensure you&apos;re never left without protection.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                period: "3 Months Before Graduation",
                                status: "prepare",
                                tasks: [
                                    "Confirm your university SHIP end date (it may end at graduation, end of semester, or 30–60 days after)",
                                    "Research ACA marketplace plans in your state",
                                    "Ask potential employers about health benefit timelines and waiting periods",
                                    "Start comparing plans with TrackMyOPT's Health Insurance Finder",
                                ],
                            },
                            {
                                period: "Graduation Month — University Coverage Ends",
                                status: "critical",
                                tasks: [
                                    "Get written confirmation of your coverage end date (you'll need this for SEP proof)",
                                    "Your 60-day Special Enrollment Period begins on the date coverage ends",
                                    "If employed, confirm your employer benefits start date",
                                    "Fill any prescriptions and schedule pending appointments before coverage lapses",
                                ],
                            },
                            {
                                period: "60-Day SEP Window",
                                status: "action",
                                tasks: [
                                    "If no employer coverage: enroll in ACA marketplace plan during your SEP",
                                    "If employer has a waiting period: enroll in short-term or marketplace plan for bridge coverage",
                                    "DO NOT let this window pass — after 60 days, you must wait until annual open enrollment (Nov 1 – Jan 15)",
                                    "Pay your first premium immediately to activate coverage",
                                ],
                            },
                            {
                                period: "First OPT Job — Employer Plan Starts",
                                status: "covered",
                                tasks: [
                                    "Complete employer benefits enrollment within your 30-day new-hire window",
                                    "Cancel your marketplace or short-term plan (report life event: gained new coverage)",
                                    "Set up your online account and find in-network primary care physician",
                                    "Review if dental/vision need separate enrollment",
                                ],
                            },
                            {
                                period: "Between Jobs or Changing Employers",
                                status: "action",
                                tasks: [
                                    "Losing employer coverage triggers a new 60-day SEP for marketplace plans",
                                    "You have 60 days to elect COBRA from your former employer's plan",
                                    "A short-term plan can provide immediate bridge coverage",
                                    "Keep your EAD and I-94 current — required for marketplace enrollment",
                                ],
                            },
                        ].map((item, i) => (
                            <div key={i} className={`p-5 rounded-xl border ${
                                item.status === "critical"
                                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                    : item.status === "action"
                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                    : item.status === "covered"
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                            }`}>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                        item.status === "critical"
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                            : item.status === "action"
                                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                            : item.status === "covered"
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                            : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                                    }`}>{i + 1}</div>
                                    {item.period}
                                </h3>
                                <ul className="space-y-1.5 ml-9">
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

                {/* Section 9: State-by-State Guide */}
                <section id="state-guide" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <MapPin className="w-7 h-7 text-violet-500 flex-shrink-0" />
                        State-by-State Health Insurance Guide
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Health insurance rules, marketplaces, and available programs vary significantly by state. Here are the 15 states where F-1 students are most concentrated, with their marketplace names, Medicaid expansion status, and special considerations.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">State</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Marketplace</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Medicaid Expanded?</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Notes for F-1 Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stateGuideData.map((row, i) => (
                                    <tr key={row.state} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : "bg-white dark:bg-zinc-950"}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{row.state}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{row.marketplace}</td>
                                        <td className="p-3 border dark:border-zinc-700">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${row.expansion ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                {row.expansion ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                {row.expansion ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400 text-xs">{row.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-500 p-4 rounded-r-xl">
                        <p className="text-violet-900 dark:text-violet-100 text-sm">
                            <strong>Important:</strong> F-1 students are generally NOT eligible for Medicaid in most states, regardless of income. Medicaid expansion primarily helps US citizens and lawful permanent residents. Always verify your specific eligibility through your state&apos;s marketplace.
                        </p>
                    </div>
                </section>

                {/* Section 10: How to Compare Plans */}
                <section id="compare-plans" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <DollarSign className="w-7 h-7 text-cyan-500 flex-shrink-0" />
                        How to Compare Health Insurance Plans
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Choosing the right plan means looking beyond the monthly premium. Here&apos;s a 5-step comparison framework to evaluate any health insurance plan.
                    </p>

                    <div className="space-y-4 mb-8">
                        {[
                            { step: "Monthly Premium", desc: "What you pay each month regardless of whether you use healthcare. Lower premiums = higher out-of-pocket costs when you do use care. Budget $150–$400/month for comprehensive coverage." },
                            { step: "Annual Deductible", desc: "The amount you pay before insurance starts covering costs. Bronze plans: ~$7,500. Silver: ~$4,500. Gold: ~$1,500. Preventive care is always free regardless of deductible." },
                            { step: "Out-of-Pocket Maximum", desc: "The absolute most you'll pay in a year. After reaching this, insurance pays 100%. The 2026 ACA maximum is $9,450 for individual plans. Lower OOP max = more financial protection." },
                            { step: "Network Type (HMO vs PPO vs EPO)", desc: "HMO: cheapest, need referrals, in-network only. PPO: most flexible, higher cost, any doctor. EPO: in-network only but no referrals needed. Check if your preferred doctors are in-network BEFORE enrolling." },
                            { step: "Prescription Formulary", desc: "Every plan has a list of covered medications organized into tiers. Check that any medications you take regularly are on the formulary and at what tier (Tier 1 = cheapest, Tier 4 = most expensive)." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300 text-sm font-bold flex-shrink-0">{i + 1}</div>
                                    {item.step}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Decision Matrix by Situation</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong>Healthy, rarely use healthcare:</strong> → Bronze or Catastrophic plan (lowest monthly cost)</p>
                            <p><strong>Take regular medications:</strong> → Silver or Gold plan (check formulary first)</p>
                            <p><strong>Planning surgery or major care:</strong> → Gold or Platinum plan (lowest deductible)</p>
                            <p><strong>Employer offers coverage:</strong> → Almost always the best deal (employer subsidizes 50–80%)</p>
                            <p><strong>Between jobs, need 1–3 months of coverage:</strong> → Short-term plan (fast, cheap bridge coverage)</p>
                        </div>
                    </div>
                </section>

                {/* Section 11: Common Mistakes */}
                <section id="common-mistakes" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <AlertTriangle className="w-7 h-7 text-amber-500 flex-shrink-0" />
                        Common Health Insurance Mistakes on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        These are the most costly mistakes F-1 students make with health insurance on OPT. Avoid all of them.
                    </p>

                    <div className="space-y-4">
                        {[
                            { mistake: "Missing the 60-day Special Enrollment Period", fix: "Mark your university coverage end date and set a reminder 30 days before. If you miss the 60-day window, you'll wait until annual open enrollment (Nov 1 – Jan 15) to get marketplace coverage." },
                            { mistake: "Choosing only by cheapest monthly premium", fix: "A $100/month Bronze plan with a $7,500 deductible could cost you $7,600 before insurance pays anything. Compare total potential costs (premium × 12 + deductible) for a realistic picture." },
                            { mistake: "Not checking if your doctor is in-network", fix: "Before enrolling, search the plan's provider directory for your preferred doctors, hospitals, and specialists. Out-of-network care can cost 2–5x more or not be covered at all." },
                            { mistake: "Forgetting dental and vision insurance", fix: "Most health plans don't include adult dental or vision. Budget an additional $20–$50/month for dental and $10–$20/month for vision, or check if your employer bundles them." },
                            { mistake: "Not understanding deductible vs. copay vs. coinsurance", fix: "Deductible: what you pay before insurance kicks in. Copay: flat fee per visit ($20–$50). Coinsurance: your percentage share after deductible (usually 20–40%). Know all three before enrolling." },
                            { mistake: "Going uninsured to save money", fix: "One ER visit ($2,200+) or a hospital stay ($13,000/day) will cost far more than a year of insurance premiums. Even a catastrophic plan ($100–$250/month) provides critical protection." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {item.mistake}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                                    <strong className="text-emerald-700 dark:text-emerald-400">Fix:</strong> {item.fix}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 12: Free & Low-Cost Resources */}
                <section id="free-resources" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Heart className="w-7 h-7 text-rose-500 flex-shrink-0" />
                        Free &amp; Low-Cost Health Resources
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Even without insurance, you have options for affordable healthcare. These resources are available regardless of immigration status.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            {
                                title: "Community Health Centers (FQHCs)",
                                desc: "Federally Qualified Health Centers provide primary care on a sliding fee scale based on income. Over 1,400 centers with 15,000+ locations nationwide. Find one at findahealthcenter.hrsa.gov.",
                                icon: Building,
                            },
                            {
                                title: "University Student Health Services",
                                desc: "Some universities allow alumni to use campus health services for a limited period after graduation. Check with your school — services may include primary care visits, mental health counseling, and vaccinations.",
                                icon: BookOpen,
                            },
                            {
                                title: "Telehealth Services",
                                desc: "Platforms like Teladoc ($0–$75/visit) and MDLive offer virtual doctor visits without insurance. Great for non-emergency care, prescriptions, and mental health consultations.",
                                icon: Heart,
                            },
                            {
                                title: "Prescription Savings",
                                desc: "GoodRx provides free coupons that can reduce prescription costs by up to 80%. Mark Cuban's Cost Plus Drugs offers medications at cost + 15% markup. No insurance needed for either.",
                                icon: DollarSign,
                            },
                            {
                                title: "Urgent Care Centers",
                                desc: "For non-emergency care, urgent care ($100–$300 per visit) is significantly cheaper than the ER ($2,200+ average). Many accept uninsured patients at cash-pay rates.",
                                icon: Shield,
                            },
                            {
                                title: "TrackMyOPT Health Insurance Finder",
                                desc: "Our free tool compares marketplace, short-term, and catastrophic plans based on your state, income, and health needs. Get personalized recommendations in minutes.",
                                icon: CheckCircle2,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-5 flex items-start gap-3">
                        <Heart className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                        <p className="text-rose-800 dark:text-rose-200 text-sm">
                            <strong>Remember:</strong> These resources help with immediate healthcare needs, but they are not a substitute for comprehensive health insurance. An uninsured hospital stay can still result in $10,000+ in bills. Use these resources while you find and enroll in a proper insurance plan.
                        </p>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-blue-500 flex-shrink-0" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.q}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed" itemProp="text">{faq.a}</p>
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
                    <Link href="/blog/opt-health-insurance-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> OPT Health Insurance Overview (Blog)
                    </Link>
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> F-1 Student Tax Filing Guide 2026
                    </Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> What Happens If Your OPT Expires?
                    </Link>
                    <Link href="/blog/f1-visa-jobs-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> F-1 Visa Jobs Guide 2026
                    </Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/health-insurance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                        Health Insurance Finder <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link href="/dashboard/opt-health-insurance-finder" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                        Insurance Finder Tool <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                        Immigration Glossary <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                        View Pricing <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Find the Right Health Insurance Plan</h2>
                <p className="text-rose-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT&apos;s Health Insurance Finder compares marketplace, employer, short-term, and catastrophic plans based on your state, income, and health needs — so you get the best coverage at the right price.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/features/health-insurance" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-xl font-semibold hover:bg-rose-50 transition-colors">
                        Compare Plans Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/dashboard/opt-health-insurance-finder" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-700 text-white rounded-xl font-semibold hover:bg-rose-800 transition-colors border border-rose-500">
                        Open Insurance Finder <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* JSON-LD Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": "OPT Health Insurance Guide 2026: Everything You Need to Know",
                        "description": "The complete health insurance guide for F-1 students on OPT. ACA marketplace enrollment, employer plans, COBRA, state-by-state options, coverage gaps, costs, and how to find plans starting at $0/month.",
                        "author": { "@type": "Organization", "name": "TrackMyOPT", "url": "https://www.trackmyopt.com" },
                        "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } },
                        "datePublished": "2026-03-12",
                        "dateModified": "2026-03-12",
                        "mainEntityOfPage": "https://www.trackmyopt.com/guides/opt-health-insurance",
                        "image": "https://www.trackmyopt.com/og-health-insurance-guide.png",
                        "articleSection": "Health Insurance",
                        "wordCount": 5200,
                        "about": [
                            { "@type": "Thing", "name": "Health Insurance", "description": "Health insurance options for F-1 students on OPT" },
                            { "@type": "Thing", "name": "ACA Marketplace", "description": "Affordable Care Act health insurance marketplace" },
                            { "@type": "Thing", "name": "Optional Practical Training", "description": "OPT work authorization for F-1 students" },
                        ],
                    }),
                }}
            />

            {/* JSON-LD FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqItems.map((faq) => ({
                            "@type": "Question",
                            "name": faq.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.a,
                            },
                        })),
                    }),
                }}
            />
        </article>
    );
}
