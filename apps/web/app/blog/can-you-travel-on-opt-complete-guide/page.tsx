import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Can I Travel on OPT? Re-Entry Rules & Documents (2026)",
    description: "Can you travel on OPT with or without a job? Learn the re-entry rules for pending and approved OPT, required documents, visa rules, and grace-period limits.",
    keywords: ["can I travel on OPT", "can I travel on OPT without a job", "can I travel on OPT with a job", "F-1 travel while OPT pending", "OPT re-entry documents", "OPT travel signature"],
    openGraph: {
        title: "Can I Travel on OPT? Re-Entry Rules & Documents | TrackMyOPT",
        description: "Pending versus approved OPT, the documents needed for re-entry, employment evidence, visa rules, and when travel can end F-1 re-entry eligibility.",
        url: "https://www.trackmyopt.com/blog/can-you-travel-on-opt-complete-guide",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Can You Travel on OPT? Complete Travel Guide for F-1 Students",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/can-you-travel-on-opt-complete-guide",
    },
};

const TRAVEL_FAQS = [
    {
        question: "Can I travel while my OPT application is pending?",
        answer: "ICE says you may seek re-entry while OPT is pending, but travel should be undertaken with caution. You must be able to respond to any USCIS request, and if USCIS approves OPT while you are abroad, you are expected to have the EAD in hand to re-enter. Review your plans with your DSO before leaving.",
    },
    {
        question: "Can I travel on OPT with a job?",
        answer: "Generally, yes. For re-entry, carry your EAD, a travel-endorsed Form I-20, valid passport, valid F-1 visa unless an exception applies, and an employment letter or other evidence that you are returning to resume OPT employment.",
    },
    {
        question: "Can I travel on OPT without a job?",
        answer: "ICE warns that if you leave after OPT is approved but before obtaining a job, your OPT may end and you may not be able to re-enter in F-1 status. Travel also continues to count toward the unemployment limit. Speak with your DSO before making plans.",
    },
    {
        question: "What documents do I need to travel on OPT?",
        answer: "Carry a passport valid for re-entry, a valid F-1 visa unless an exception applies, a Form I-20 endorsed for travel by your DSO, your EAD, and proof of current or prospective OPT employment. Admission is always decided by CBP at the port of entry.",
    },
    {
        question: "Do I need a valid F-1 visa to re-enter on OPT?",
        answer: "Usually yes. Citizens of Canada and Bermuda generally do not need an F-1 visa, and limited automatic-revalidation rules may apply to some short trips to Canada, Mexico, or adjacent islands. Mexican and European Union citizenship does not by itself create an F-1 visa exemption.",
    },
    {
        question: "Can I re-enter during the 60-day OPT grace period?",
        answer: "No. ICE states that the 60-day period after completing OPT is to prepare to leave the United States; it does not provide a right to leave and re-enter in F-1 status.",
    },
] as const;

export default function CanYouTravelOnOPTArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Can You Travel on OPT Guide", url: "https://www.trackmyopt.com/blog/can-you-travel-on-opt-complete-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-01-24" modifiedDate="2026-07-27" author="Vinay Kumar" faqItems={[...TRAVEL_FAQS]} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Travel on OPT</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        OPT & TRAVEL
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Can I Travel on OPT? Re-Entry Rules and Required Documents (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Everything F-1 students need to know about traveling on OPT: travel while pending, required documents, visa requirements, and re-entry authorization.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: July 27, 2026</span>
                    <span>•</span>
                    <span>Updated by TrackMyOPT Travel Team</span>
                </div>
            </header>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    You can travel while OPT is pending or approved, but re-entry is not guaranteed. ICE advises caution while an application is pending. After approval, bring your EAD, travel-endorsed I-20, valid passport and F-1 visa (unless exempt), plus proof that you are returning to OPT employment.
                </p>
            </div>

            {/* Key Takeaway Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    <strong>Pending OPT:</strong> travel is possible but risky if USCIS requests evidence or approves the case while you are abroad. <strong>Approved OPT:</strong> ICE expects you to have the EAD in hand and employment to return to. Ask your DSO to check your SEVIS record and travel signature before departure.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Sources: <a href="https://www.ice.gov/sevis/travel" target="_blank" rel="noopener noreferrer" className="underline">ICE: Travel and re-entry for F-1 students</a> and <a href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-expiration-date/auto-revalidate.html" target="_blank" rel="noopener noreferrer" className="underline">Department of State: Automatic revalidation</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#travel-pending", "Can You Travel While OPT Pending?"],
                        ["#travel-approved", "Traveling Once OPT is Approved"],
                        ["#required-documents", "Required Documents for Travel"],
                        ["#visa-requirements", "Visa Requirements by Country"],
                        ["#re-entry-rules", "Re-Entry Rules and Procedures"],
                        ["#traveling-during", "Traveling During Employment on OPT"],
                        ["#grace-period", "Traveling During OPT Grace Period"],
                        ["#best-practices", "Travel Best Practices for OPT Students"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="travel-pending" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Can You Travel While OPT Pending?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        ICE says you <strong>may seek re-entry while OPT is pending</strong>, but travel should be undertaken with caution. USCIS may send a request for evidence while you are away, and an EAD can only be delivered to your U.S. address.
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl my-6">
                        <p className="text-red-900 dark:text-red-100 font-semibold">
                            If USCIS approves OPT while you are abroad, ICE expects you to have the physical EAD in hand when you return. Plan how a trusted person would securely send the card to you, and discuss the trip with your DSO first.
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Why Traveling While Pending is Dangerous</h3>
                    <div className="space-y-3 mb-6">
                        {[
                            "USCIS may issue a request for evidence while you are outside the country",
                            "Your EAD is mailed only to the U.S. address on your application",
                            "Airlines and CBP may expect the physical EAD if OPT is approved before your return",
                            "A missing or late response to a USCIS notice can lead to denial",
                            "CBP makes the final admission decision at the port of entry",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700 dark:text-red-200 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">What if you MUST travel while OPT is pending?</h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                            Ask your DSO to confirm that your SEVIS record and travel signature are current. Keep access to your USCIS account, arrange secure handling of mail and any EAD delivery, and carry evidence that the OPT application is pending.
                        </p>
                    </div>
                </section>

                <section id="travel-approved" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Traveling Once OPT is Approved
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Once your I-765 is approved and you have valid OPT authorization, you can travel internationally. However, you must have proper documentation to re-enter the United States.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">When is it Safe to Travel?</h3>
                    <div className="space-y-3 mb-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">After Approval Notice Received</h4>
                            <p className="text-green-800 dark:text-green-200 text-sm">Approval alone is not the complete travel document set. ICE expects the physical EAD for re-entry after OPT approval.</p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">After EAD Card Arrives</h4>
                            <p className="text-green-800 dark:text-green-200 text-sm">Carry the EAD together with a travel-endorsed I-20, passport, required visa, and evidence that you are returning to OPT employment.</p>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                During OPT Extension Processing
                            </h4>
                            <p className="text-amber-800 dark:text-amber-200 text-sm">Avoid travel if you're applying for STEM OPT extension or H-1B. Ask your immigration attorney or DSO first.</p>
                        </div>
                    </div>
                </section>

                <section id="required-documents" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Required Documents for Travel
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Before traveling internationally on OPT, ensure you have these documents:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Valid Passport
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                ICE generally requires the passport to remain valid for at least six months after your re-entry date, unless your country is covered by a passport-validity agreement.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Form I-20 With Current Travel Endorsement
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Ask your DSO to endorse the I-20 for travel and confirm that your SEVIS employment information is current. Travel endorsements during OPT are generally valid for six months.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Valid EAD Card (I-765)
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Your work authorization card. CBP and airlines will check this. Do NOT travel without it. If lost or damaged, request expedited replacement.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Evidence of OPT Employment
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Carry a recent employer letter, offer letter, or other evidence that you have a qualifying job and are returning to resume employment. ICE specifically recommends an employment letter if you have one.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Valid US Visa (If Required)
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Most students need a valid F-1 visa for re-entry. Citizens of Canada and Bermuda are generally visa-exempt, and limited automatic-revalidation rules may apply to some short trips.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Recommended: Copies & Digital Backups</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Store digital copies of your EAD, passport, visa, and approval notice in secure cloud storage. Keep physical copies in separate bags.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="visa-requirements" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Visa Requirements by Country
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Your ability to re-enter the US depends on your nationality and visa status. Here's how it works:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Your Situation</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Can Travel?</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">F-1 visa is valid (not expired)</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">✓ Yes</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Also carry an endorsed I-20 and employment evidence</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">F-1 visa has expired (after graduation)</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Need visa</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Usually must obtain a new F-1 visa unless a narrow exception such as automatic revalidation applies</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Citizen of Canada or Bermuda</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">✓ Yes</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Generally visa-exempt, but still needs the other F-1/OPT re-entry documents</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Expired visa; short eligible trip to Canada, Mexico, or an adjacent island</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Maybe</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Automatic revalidation is limited and has exclusions; verify eligibility before travel</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4  bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-blue-900 dark:text-blue-100 text-sm">
                            <strong>Check your visa status before traveling:</strong> If your F-1 visa expired while you were in school or working, you may need to apply for a new visa before leaving the US. Consult your DSO.
                        </p>
                    </div>
                </section>

                <section id="re-entry-rules" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Re-Entry Rules and Procedures
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        When you return to the US after traveling on OPT, follow these procedures:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">At US Port of Entry (Airport/Border)</h3>
                            <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                                <li>• Present your EAD card to CBP officer (this proves work authorization)</li>
                                <li>• Present your valid passport and any required visa</li>
                                <li>• Be prepared to explain your employment and OPT status</li>
                                <li>• Keep your approval notice and EAD separate for easy access</li>
                            </ul>
                        </div>

                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">What CBP Officer May Ask</h3>
                            <ul className="space-y-2 text-green-800 dark:text-green-200 text-sm">
                                <li>• "What brings you back to the US?"</li>
                                <li>• "How long were you outside the country?"</li>
                                <li>• "Are you still employed on OPT?"</li>
                                <li>• "Where did you travel?" (some countries may trigger additional questions)</li>
                            </ul>
                        </div>

                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Safe Answers to Provide</h3>
                            <ul className="space-y-2 text-purple-800 dark:text-purple-200 text-sm">
                                <li>• I'm returning to resume work on my OPT</li>
                                <li>• I visited [country] for [number of] days</li>
                                <li>• I'm currently working for [employer] on my EAD</li>
                                <li>• I have approved work authorization through [end date]</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-900 dark:text-amber-100 text-sm">
                            <strong>⚠️ Important:</strong> CBP officers have broad authority. Be polite, straightforward, and prepared. Have all documents easily accessible. Do not volunteer unnecessary information.
                        </p>
                    </div>
                </section>

                <section id="traveling-during" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Traveling During Employment on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        While you can legally travel on OPT, employment considerations complicate things:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Short Trips (Weekend, 1 week)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                Notify your manager that you'll be out of office. Coordinate with your team for coverage. No special documentation needed.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Extended Trips (2+ weeks)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                Plan in advance. Request time off if available (PTO/vacation). Clarify with HR/manager if this is unpaid leave. Extended absence might affect your status—consult your DSO.
                            </p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Returning to Work After Travel</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                Resume work upon return. Update SEVIS/SEVP portal with your employer if required. Some employers track this automatically.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-blue-900 dark:text-blue-100 text-sm">
                            <strong>Best practice:</strong> Inform your employer and DSO of travel plans. Keep copies of all travel documents and employment records. If you're gone more than 30 days, notify your DSO just in case.
                        </p>
                    </div>
                </section>

                <section id="grace-period" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Traveling During OPT Grace Period
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The 60-day period after completing OPT is for preparing to leave the United States or taking another permitted status-related step. <strong>ICE says it does not allow re-entry in F-1 status.</strong>
                    </p>

                    <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                        <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">Why You Shouldn't Travel During Grace Period</h3>
                        <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                            <li>• Your EAD is no longer valid outside the US</li>
                            <li>• Your OPT employment authorization has ended</li>
                            <li>• The grace period does not provide a right to re-enter</li>
                            <li>• Departing generally ends your ability to use the remaining grace period inside the U.S.</li>
                        </ul>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                        If you leave during the grace period, plan on completing your next immigration step from outside the United States unless a qualified adviser confirms another lawful basis for return.
                    </p>
                </section>

                <section id="best-practices" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Travel Best Practices for OPT Students
                    </h2>

                    <div className="space-y-4">
                        {[
                            { practice: "Before You Leave", items: ["Check all document expiration dates (passport, visa, EAD)", "Notify your employer and DSO of travel plans", "Update your contact info with USCIS", "Arrange mail forwarding to a trusted contact", "Set up email alerts for USCIS status updates"] },
                            { practice: "While Traveling", items: ["Keep original documents in your carry-on", "Have digital backups in secure storage", "Monitor your USCIS account if your case is pending", "Arrange secure access to U.S. mail and EAD delivery", "Be prepared to show proof of employment if asked"] },
                            { practice: "Upon Re-Entry", items: ["Bring all documents to the airport", "Be ready to explain your OPT employment", "Comply with CBP officer requests", "Request secondary inspection if you have concerns", "Keep all re-entry documentation"] },
                        ].map((section, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{section.practice}</h3>
                                <ul className="space-y-2">
                                    {section.items.map((item, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Schema Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {TRAVEL_FAQS.map((faq, i) => (
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
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                    <Link href="/blog/opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Extension Guide</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition</Link>
                    <Link href="/blog/h1b-cap-gap-extension" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Cap Gap Extension</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Compliance Tracker →</Link>
                    <Link href="/blog/can-you-travel-on-opt-complete-guide" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Travel Resources →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Verify Your Approval Before Traveling</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    Use TrackMyOPT's case status tracker to verify your approval before booking any international travel.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Verify Your Approval <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
