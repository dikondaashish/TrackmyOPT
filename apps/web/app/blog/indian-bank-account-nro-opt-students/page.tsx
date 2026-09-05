import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Indian Students on OPT/STEM OPT: Is Your Indian Bank Account Illegal? (FEMA & NRO Guide 2026)",
    description: "If you're an Indian student on F-1 OPT or STEM OPT in the US for over 182 days, holding a regular Indian savings account violates FEMA. Learn how to convert to NRO/NRE immediately — without flying back to India.",
    keywords: [
        "NRO account for F1 students",
        "FEMA violation OPT students",
        "Indian bank account NRI OPT",
        "convert savings to NRO account",
        "NRI status F1 visa",
        "FEMA Section 13 penalty",
        "NRO NRE account STEM OPT",
        "Indian students US bank account India",
        "resident account NRI illegal FEMA",
        "how to convert to NRO account",
    ],
    openGraph: {
        title: "Indian Students on OPT/STEM OPT: Is Your Indian Bank Account Illegal? | TrackMyOPT",
        description: "Holding a regular Indian savings account while on OPT or STEM OPT violates FEMA. Here's how to fix it without flying to India.",
        url: "https://www.trackmyopt.com/blog/indian-bank-account-nro-opt-students",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Indian Students on OPT/STEM OPT: Is Your Indian Bank Account Illegal?",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/indian-bank-account-nro-opt-students",
    },
    twitter: {
        card: "summary_large_image",
        title: "Indian Students on OPT/STEM OPT: Is Your Indian Bank Account Illegal? | TrackMyOPT",
        description: "Holding a regular Indian savings account while on OPT or STEM OPT violates FEMA. Here's how to fix it without flying to India.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

const faqItems = [
    {
        question: "Does an F-1 student on OPT become an NRI under FEMA?",
        answer: "Yes. Under FEMA, you become a Non-Resident Indian (NRI) once you have resided outside India for more than 182 days in the preceding financial year (April–March). Most students on post-completion OPT or STEM OPT easily cross this threshold by mid-October of their first OPT year.",
    },
    {
        question: "What happens if I keep my Indian savings account after becoming an NRI?",
        answer: "Under Section 13 of FEMA, the Reserve Bank of India can impose a penalty of up to three times the amount involved, or ₹2 lakh (whichever is higher), plus ₹5,000 per day for each day the violation continues. Your bank may also freeze or close the account without notice once they identify the discrepancy.",
    },
    {
        question: "Can I convert my Indian savings account to NRO online from the US?",
        answer: "Yes. Most major Indian banks — including SBI, HDFC, ICICI, Axis, and Kotak — allow you to submit an NRO conversion request online or by courier. You will need a self-attested copy of your passport, US visa, and proof of overseas address. Some banks require an in-person branch visit by a Power of Attorney holder in India.",
    },
    {
        question: "What is the difference between an NRO and NRE account?",
        answer: "An NRO (Non-Resident Ordinary) account holds income earned in India — like rent, dividends, or family transfers from India. An NRE (Non-Resident External) account holds money you earn abroad and is fully repatriable and tax-free in India. Most OPT students first convert their existing savings account to NRO. You can also open a new NRE account separately.",
    },
    {
        question: "Does FEMA NRI status affect my F-1 immigration status?",
        answer: "No. FEMA is Indian law governing foreign exchange and overseas accounts — it is completely separate from US immigration law. Your F-1 OPT or STEM OPT status with USCIS is unaffected. However, ignoring FEMA can create legal and financial complications in India that may affect future remittances, property transactions, or tax filings.",
    },
    {
        question: "When exactly do I become an NRI under FEMA on OPT?",
        answer: "FEMA uses a financial year (April 1 – March 31) lookback. You become an NRI for FEMA purposes once you have spent more than 182 days outside India in the preceding financial year. For most F-1 students who start OPT in summer/fall, this threshold is crossed by their first full OPT year — often by September or October.",
    },
];

export default function IndianBankAccountNROPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Indian Bank Account NRO for OPT Students", url: "https://www.trackmyopt.com/blog/indian-bank-account-nro-opt-students" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-03-18"
                modifiedDate="2026-03-18"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">NRO Account for OPT Students</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                        FINANCE & COMPLIANCE
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        9 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Indian Students on OPT/STEM OPT: Is Your Indian Bank Account Illegal Under FEMA? (2026 Guide)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Most Indian F-1 students on OPT do not realize they have quietly become NRIs under Indian law — and that their regular savings account back home is now a FEMA violation. Here is what that means and exactly how to fix it.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: March 18, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Quick Answer */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    If you are an Indian student on F-1 OPT or STEM OPT and have spent more than 182 days in the US in a financial year, you are an NRI under FEMA. Holding a regular resident savings account is illegal under the Foreign Exchange Management Act. You must convert it to an NRO account — and you can do this from the US without flying back to India.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Under <strong>Section 13 of FEMA</strong>, penalties for holding a resident account as an NRI can reach <strong>₹2 lakh flat + ₹5,000 per day</strong>, or up to three times the account balance. Banks can freeze your account without warning. Converting to NRO is free, fast, and can be done entirely online.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.rbi.org.in/commonman/English/Scripts/FAQs.aspx?Id=715" target="_blank" rel="noopener noreferrer" className="underline">Reserve Bank of India — NRI Account FAQ</a>, FEMA 1999 Section 13
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#when-nri", "When Does an OPT Student Become an NRI Under FEMA?"],
                        ["#what-is-violation", "Why a Regular Savings Account Becomes Illegal"],
                        ["#penalties", "FEMA Penalties: What Section 13 Actually Says"],
                        ["#nro-vs-nre", "NRO vs NRE Account: What's the Difference?"],
                        ["#how-to-convert", "How to Convert Your Account to NRO From the US"],
                        ["#documents", "Documents You Need"],
                        ["#checklist", "Bank-by-Bank Conversion Checklist"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href as string} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="when-nri" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        When Does an OPT Student Become an NRI Under FEMA?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Most Indian students are surprised to learn that <strong>FEMA residency has nothing to do with your visa type or immigration status</strong>. You do not need a green card or permanent residency to become an NRI under Indian law.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Under the <strong>Foreign Exchange Management Act (FEMA), 1999</strong>, a person is considered a Non-Resident Indian (NRI) if they have been outside India for more than <strong>182 days in the preceding financial year</strong> (April 1 – March 31). That is the only threshold that matters.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "For most Indian F-1 students who start post-completion OPT in May or June, the 182-day threshold is crossed by October or November of that same year — well within the first OPT year."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — Based on FEMA 1999 definition of 'person resident outside India'
                        </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Here is a simple timeline for a typical Indian F-1 student:
                    </p>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mt-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Example: Priya's FEMA Timeline</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>🎓 Graduated: May 2025 (moved from campus to apartment in the US)</p>
                            <p>📋 OPT Start Date: June 15, 2025</p>
                            <p>🗓️ Days in the US by Oct 14, 2025: <strong>182 days outside India</strong></p>
                            <p>⚠️ FEMA NRI status triggered: <strong>October 2025</strong></p>
                            <p>🏦 Her Indian SBI savings account becomes legally non-compliant from that date</p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                        If Priya is on STEM OPT, she remains in the US for another 2+ years — making the violation window significantly larger.
                    </p>
                </section>

                <section id="what-is-violation" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why a Regular Savings Account Becomes Illegal for NRIs
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Under FEMA, <strong>once you become a non-resident, you are no longer permitted to hold a resident savings account</strong> (the regular accounts most people open in India). This is not a technicality — it is a direct legal requirement enforced by the Reserve Bank of India.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The requirement exists because different tax rules, repatriation rights, and regulatory frameworks apply to resident vs. non-resident accounts. Mixing them creates compliance gaps the RBI actively monitors.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">What Becomes Non-Compliant</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• Continuing to operate a regular Indian savings account (SBI, HDFC, ICICI, etc.)</li>
                                    <li>• Receiving salary credits, rent, or dividends in a resident account as an NRI</li>
                                    <li>• Sending money from the US to a resident account in your own name</li>
                                    <li>• Operating a joint resident account where you are the primary holder</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">What You CAN Do as an NRI</h3>
                                <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                                    <li>• Hold an NRO account (for India-sourced income like rent, dividends)</li>
                                    <li>• Hold an NRE account (for income earned abroad — fully repatriable)</li>
                                    <li>• Hold an FCNR(B) account in foreign currency (USD, GBP, EUR, etc.)</li>
                                    <li>• Remain a joint holder (non-primary) on a resident family member's account</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="penalties" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        FEMA Penalties: What Section 13 Actually Says
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is where it gets serious. <strong>Section 13 of FEMA</strong> lays out the penalty structure for violations, and it applies directly to NRIs who continue operating resident accounts.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-red-100 dark:bg-red-900/40">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Violation Type</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Penalty</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Holding a resident account as an NRI</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-red-700 dark:text-red-300">Up to 3× the account balance, or ₹2 lakh flat</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Continuing the violation after notice</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-red-700 dark:text-red-300">₹5,000 per day for every day of non-compliance</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Bank identifies the issue proactively</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Account may be frozen or closed without prior notice</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Real risk:</strong> Indian banks increasingly run residency verification checks through passport and visa data. If your bank discovers you are an NRI before you report it, they can freeze the account and report the matter to the RBI, triggering a formal inquiry.
                        </p>
                    </div>
                </section>

                <section id="nro-vs-nre" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        NRO vs NRE Account: What's the Difference for OPT Students?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        As an OPT or STEM OPT student, you will likely need both at some point. Here is a clear breakdown:
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">NRO Account</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">NRE Account</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Currency", "Indian Rupees (INR)", "Indian Rupees (INR)"],
                                    ["Best for", "India-sourced income (rent, dividends, family transfers from India)", "Foreign income you earn in the US (OPT salary, freelance)"],
                                    ["Repatriation", "Limited (up to $1M/year with documentation)", "Fully repatriable to US"],
                                    ["Taxability in India", "Interest taxable in India", "Interest tax-free in India"],
                                    ["Joint account", "Can be jointly held with resident Indians", "Can only be jointly held with other NRIs"],
                                    ["First step for OPT students", "✅ Convert existing savings account to NRO", "Open separately if needed"],
                                ].map(([feature, nro, nre], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-700 dark:text-gray-300">{feature}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{nro}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{nre}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <strong>For most OPT/STEM OPT students, the first priority is converting the existing savings account to NRO.</strong> You can then open an NRE account if you plan to remit US earnings back to India regularly.
                    </p>
                </section>

                <section id="how-to-convert" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Convert Your Indian Savings Account to NRO From the US
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The good news: <strong>you do not need to fly back to India</strong>. The RBI permits banks to accept NRO conversion requests by mail, courier, or online — and most major Indian banks now have a dedicated NRI services portal.
                    </p>

                    <div className="space-y-4 mb-6">
                        {[
                            {
                                step: "Step 1: Gather your documents",
                                detail: "You need: self-attested copy of your passport (bio page), US visa (F-1 + OPT EAD card), and proof of US address (utility bill, lease, or bank statement). See the full list below.",
                                color: "blue",
                            },
                            {
                                step: "Step 2: Download the NRO conversion form",
                                detail: "Most banks (SBI, HDFC, ICICI, Axis, Kotak) have a dedicated NRO account opening / conversion form on their NRI banking page. Download and fill it completely.",
                                color: "blue",
                            },
                            {
                                step: "Step 3: Self-attest and notarize if required",
                                detail: "Sign all document copies with 'True copy' and your signature. Some banks require notarization by an Indian Embassy/Consulate or a US notary. Check your bank's specific requirement.",
                                color: "blue",
                            },
                            {
                                step: "Step 4: Submit online, by email, or by courier",
                                detail: "Most banks accept scanned submissions by email to their NRI desk. For physical submissions, courier the documents to the bank's NRI services branch (usually the branch where your account is held, or the bank's NRI hub city branch).",
                                color: "blue",
                            },
                            {
                                step: "Step 5: Follow up and confirm account re-designation",
                                detail: "Banks typically take 7–21 days to process the request. Request a written confirmation (email or letter) that your account has been re-designated from resident to NRO. Keep this for your records.",
                                color: "blue",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{item.step}</h3>
                                <p className="text-blue-800 dark:text-blue-200 text-sm">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-green-800 dark:text-green-200 text-sm">
                            <strong>✅ Power of Attorney option:</strong> If your parents or a trusted family member is in India, you can grant them a Power of Attorney (PoA) to visit the bank branch and handle the conversion in person on your behalf. PoA forms can be signed abroad and notarized at the Indian Consulate.
                        </p>
                    </div>
                </section>

                <section id="documents" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Documents You Need for NRO Conversion
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Passport Copy", desc: "Self-attested copy of the bio data page. Must be valid and not expired." },
                            { title: "US Visa Copy", desc: "Copy of your current F-1 visa stamp. Include the OPT EAD card if your bank requests proof of authorized stay." },
                            { title: "Proof of Overseas Address", desc: "Any one: US bank statement, lease agreement, utility bill, or official mail — not older than 3 months." },
                            { title: "NRO Conversion / Account Opening Form", desc: "Filled and signed NRO conversion form from your specific bank (download from the bank's website)." },
                            { title: "Recent Passport-Size Photograph", desc: "Some banks still require a physical photo for their records, especially for in-branch processing." },
                            { title: "PAN Card Copy", desc: "Required for tax deduction at source (TDS) purposes on NRO account interest. Self-attested copy." },
                        ].map((item) => (
                            <div key={item.title} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="checklist" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Bank-by-Bank NRO Conversion Guide
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Each major Indian bank has its own NRI portal and process. Here is a quick reference for the most common banks used by Indian students:
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                bank: "SBI (State Bank of India)",
                                process: "Submit a request letter + documents to the branch via courier or through a PoA holder. SBI also has an NRI portal at onlinesbi.sbi. Alternatively, visit the nearest SBI branch in the US (limited locations).",
                                link: "https://www.sbinri.com",
                                linkLabel: "SBI NRI Portal",
                            },
                            {
                                bank: "HDFC Bank",
                                process: "Online NRI conversion available through HDFC NRI website. Alternatively, email nri@hdfcbank.com or call their international number. Processing is typically 10–14 days.",
                                link: "https://www.hdfcbank.com/nri-banking",
                                linkLabel: "HDFC NRI Banking",
                            },
                            {
                                bank: "ICICI Bank",
                                process: "ICICI has a dedicated NRI conversion form under their NRI services section. Scanned documents accepted by email or through iMobile Plus app's NRI upgrade flow.",
                                link: "https://www.icicibank.com/nri-banking",
                                linkLabel: "ICICI NRI Banking",
                            },
                            {
                                bank: "Axis Bank",
                                process: "Submit conversion request through Axis Bank's NRI services portal or call their NRI helpline. Documents accepted by email to nri@axisbank.com.",
                                link: "https://www.axisbank.com/nri-banking",
                                linkLabel: "Axis NRI Banking",
                            },
                            {
                                bank: "Kotak Mahindra Bank",
                                process: "Kotak allows NRI account conversion through their net banking portal under account services. Can also be initiated via the Kotak 811 app or by emailing nri.services@kotak.com.",
                                link: "https://www.kotak.com/nri-banking",
                                linkLabel: "Kotak NRI Banking",
                            },
                        ].map((item) => (
                            <div key={item.bank} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.bank}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.process}</p>
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {item.linkLabel}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* OPT-specific note */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How This Connects to Your OPT / STEM OPT Status
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        FEMA compliance is entirely separate from USCIS and your F-1 immigration status — but both require active management during your time in the US. Many Indian students on OPT are simultaneously juggling:
                    </p>
                    <ul className="space-y-3 mb-6">
                        {[
                            "Tracking unemployment days to stay under the 90-day OPT limit",
                            "Updating employer information in the SEVP Portal within 10 days of any job change",
                            "Monitoring their USCIS EAD card expiry and STEM OPT I-983 training plan",
                            "Filing US taxes as a nonresident alien (Form 1040-NR) and India taxes as an NRI",
                            "Managing Indian bank accounts to stay FEMA compliant",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        TrackMyOPT helps you stay on top of the US side — deadlines, employer reporting, unemployment day tracking, and USCIS case status. The India-side compliance (FEMA, NRO conversion, Indian tax filing) requires a separate action from you, but being aware of both keeps your financial and immigration life clean on both sides of the Pacific.
                    </p>
                </section>

                {/* FAQ */}
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

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Student Tax Filing Guide 2026</Link>
                    <Link href="/blog/f1-opt-stem-opt-tax-filing-mistakes" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Tax Filing Mistakes on OPT/STEM OPT</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day Unemployment Rule</Link>
                    <Link href="/blog/opt-health-insurance-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Health Insurance Guide 2026</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Stay Compliant on Both Sides of the Pacific</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT keeps your OPT unemployment days, employer updates, and USCIS deadlines organized — so you can focus on your career while staying fully compliant.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Track Your OPT Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
