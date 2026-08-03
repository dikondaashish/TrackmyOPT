import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen, Search } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "How to Track Your USCIS Case Status Online: Complete Guide",
    description: "Step-by-step guide to tracking your USCIS I-765 OPT EAD case status. Learn what status messages mean, processing times, RFE explanations, and what to do if delayed.",
    keywords: ["USCIS case status", "track OPT application", "I-765 case status", "EAD case tracker", "USCIS processing times", "RFE explained"],
    openGraph: {
        title: "How to Track Your USCIS Case Status Online: Complete Guide | TrackMyOPT",
        description: "Track your I-765 EAD case status with this complete guide to USCIS portal, status messages, and what they mean.",
        url: "https://www.trackmyopt.com/blog/how-to-track-uscis-case-status-guide",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "How to Track Your USCIS Case Status Online: Complete Guide",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/how-to-track-uscis-case-status-guide",
    },
};

export default function USCISCaseStatusArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "How to Track USCIS Case Status", url: "https://www.trackmyopt.com/blog/how-to-track-uscis-case-status-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-15" modifiedDate="2026-03-15" author="Vinay Kumar" faqItems={[
                { question: "Where do I check my USCIS case status?", answer: "Log into your USCIS account at uscis.gov, click 'Check Application Status,' enter your case number (starts with three letters like EAC, LIN, or WAC), and review your status messages." },
                { question: "What does 'case received' mean for OPT?", answer: "'Case received' means USCIS has accepted your I-765 petition and assigned it a case number. Processing has begun, and you should see updates within 30-60 days." },
                { question: "What does 'request for additional evidence (RFE)' mean?", answer: "USCIS is requesting additional documents or information to process your case. You have 7 calendar days to respond (extendable to 87 days). Missing the deadline results in case denial." },
                { question: "How long does it take to get OPT approval?", answer: "Current USCIS processing times for I-765 EAD cases are 90-120 calendar days from case receipt, but can vary by location and complexity. Check USCIS.gov for your specific service center." },
                { question: "Why is my case taking longer than expected?", answer: "Delays can be caused by missing documents, administrative backlogs, security checks, name verification issues, or volume surges. Contact USCIS if your case exceeds published processing times." },
                { question: "Can I contact USCIS about a delayed case?", answer: "Yes, if your case exceeds published processing times by 30+ days. Call 1-800-375-5283 or file a case inquiry through your USCIS account if USCIS cannot be reached by phone." },
                { question: "What should I do if I receive an RFE?", answer: "Read the RFE carefully, gather all requested documents, prepare a cover letter explaining what you're submitting, and submit it before the deadline. Include your case number and receipt number on all documents." },
                { question: "What does 'approved decision already sent' mean?", answer: "Your I-765 has been approved and USCIS has mailed notice of approval. Your EAD card will arrive within 7-10 business days of this status update." },
            ]} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Case Status Tracking</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        APPLICATION PROCESS
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    How to Track Your USCIS Case Status Online: Complete Guide
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Master USCIS case tracking with step-by-step instructions, status message explanations, processing time details, and what to do if your case is delayed.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: March 15, 2026</span>
                    <span>•</span>
                    <span>Updated by TrackMyOPT USCIS Team</span>
                </div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    You can track your USCIS case status online at egov.uscis.gov using your 13-character receipt number (e.g., IOE0123456789). TrackMyOPT Free provides manual tracking with plain-English status explanations; Pro adds daily auto-checks and email alerts when status changes.
                </p>
            </div>

            {/* Key Takeaway Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Track your OPT case at <strong>uscis.gov/cases</strong> using your receipt number or case number. Current I-765 processing times are <strong>90-120 days</strong>. If you receive an RFE (Request for Evidence), respond within 7 days or your case will be denied. Don't panic about delays—they're common.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#why-tracking", "Why Tracking Your Case Matters"],
                        ["#what-you-need", "What You Need to Get Started"],
                        ["#step-by-step", "Step-by-Step Case Tracking Guide"],
                        ["#status-messages", "Understanding USCIS Status Messages"],
                        ["#processing-times", "Current Processing Times"],
                        ["#rfe-guide", "How to Handle an RFE"],
                        ["#delays-issues", "What to Do if Your Case is Delayed"],
                        ["#case-denied", "What If Your Case is Denied?"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="why-tracking" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Tracking Your Case Matters
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Tracking your USCIS case status is critical because <strong>USCIS rarely calls or emails you with updates</strong>. You must actively monitor your case to:
                    </p>

                    <div className="space-y-3 mb-6">
                        {[
                            "Respond to Requests for Evidence (RFE) before the deadline expires (7 calendar days)",
                            "Know when your EAD card is being mailed so you can prepare to collect it",
                            "Identify delays early so you can contact USCIS or consult an immigration attorney",
                            "Defend against accusations that you failed to respond (you'll have proof of timely submission)",
                            "Plan your job start date knowing approximately when approval will arrive",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl my-6">
                        <p className="text-red-900 dark:text-red-100 font-semibold">
                            "Missing an RFE deadline is the #1 reason OPT applications get denied. By the time USCIS notifies you of denial, it's too late to appeal."
                        </p>
                    </div>
                </section>

                <section id="what-you-need" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What You Need to Get Started
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        To track your case, you'll need one of these identifying numbers:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Receipt Number (Preferred)
                            </h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                                Looks like: <strong>EAC2300123456</strong> (3 letters + 10 digits)
                            </p>
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                                Found on your I-797 receipt notice (arrived by mail when you submitted I-765). Check all emails for the receipt notice before filing.
                            </p>
                        </div>

                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
                                Case Number (Alternative)
                            </h3>
                            <p className="text-green-800 dark:text-green-200 text-sm mb-2">
                                Looks like: <strong>A023000123</strong> (letter + 8-9 digits)
                            </p>
                            <p className="text-green-700 dark:text-green-300 text-sm">
                                Your alien/registration number. Found on your I-94, previous visas, or SEVIS documents.
                            </p>
                        </div>

                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                                USCIS Account
                            </h3>
                            <p className="text-purple-800 dark:text-purple-200 text-sm mb-2">
                                Create an account at uscis.gov to track all your applications and keep them organized.
                            </p>
                            <p className="text-purple-700 dark:text-purple-300 text-sm">
                                Create account with email, SSN/ITIN, name, and date of birth. Link your receipt numbers to this account.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Don't have your receipt number?</strong> Check your email, junk folder, and USPS Informed Delivery. If still not found, contact your DSO or USCIS directly.
                        </p>
                    </div>
                </section>

                <section id="step-by-step" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step Case Tracking Guide
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Follow these steps to check your case status:
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: "Visit uscis.gov/cases", detail: "Open your web browser and navigate to USCIS case status tracker. This is the official way to check status." },
                            { step: "Enter your receipt or case number", detail: "Type your 13-character receipt number (EAC2300123456) or your 9-digit case number in the search box." },
                            { step: "Click 'Check Status'", detail: "The page will display your current case status and any messages from USCIS." },
                            { step: "Review your status message", detail: "Read carefully. Look for keywords like 'received,' 'in process,' 'decision pending,' or 'request for evidence.'" },
                            { step: "Check for RFE or denial", detail: "If requesting evidence or denying, this section will clearly indicate what documents you need and the deadline." },
                            { step: "Screenshot or save your status", detail: "Save proof of your status and any important messages. You'll need these for reference." },
                            { step: "Set a reminder to check again", detail: "Check your status monthly or after USCIS sends notifications. TrackMyOPT can automate this for you." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.step}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="status-messages" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Understanding USCIS Status Messages
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        USCIS uses specific status messages. Here's what each one means for your OPT application:
                    </p>

                    <div className="space-y-3">
                        {[
                            { status: "Application/Document Received", meaning: "USCIS has received your I-765 petition. Case number assigned. Processing begins. Next update expected in 30-60 days." },
                            { status: "Application Under Review", meaning: "USCIS is evaluating your application. Still within normal processing time. No action needed from you." },
                            { status: "Request for Additional Evidence", meaning: "USCIS needs more documents/information. URGENT: Respond within 7 calendar days or case will be DENIED. Usually addressed within 10-14 days of submission." },
                            { status: "Decision Pending", meaning: "USCIS has completed review and is preparing final decision. Approval or denial imminent. Check daily for updates." },
                            { status: "Approved-Decision Sent", meaning: "Your I-765 has been APPROVED. USCIS mailed approval notice. EAD card will arrive within 7-10 business days." },
                            { status: "Denied", meaning: "Application has been denied. You have options: appeal, motion to reopen, or reapply. Consult immigration attorney immediately." },
                            { status: "Case Transferred", meaning: "Your case was transferred to another USCIS office or service center. Updates may be delayed 7-10 days." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.status}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.meaning}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-red-900 dark:text-red-100 font-medium text-sm">
                            <strong>🚨 Critical:</strong> If you see "Request for Additional Evidence," act immediately. The 7-day count includes weekends and holidays. Don't wait until day 6.
                        </p>
                    </div>
                </section>

                <section id="processing-times" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Current Processing Times
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        USCIS publishes official processing times. As of March 2026, I-765 EAD processing varies by service center:
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Service Center</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Processing Time</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Ready Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Vermont Service Center</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">90-120 days</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">6+ months</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Nebraska Service Center</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">90-120 days</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">5+ months</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Texas Service Center</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">120-150 days</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">6+ months</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">California Service Center</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">120-150 days</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">6+ months</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>Important notes:</strong> These are official USCIS estimates. Actual times vary. The "Ready" time is when 80% of cases are complete. Your case might be faster or slower depending on complexity, RFEs, background checks, and administrative backlogs.
                    </p>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-900 dark:text-blue-100 text-sm">
                            📊 <strong>Check official USCIS processing times:</strong> Visit <a href="https://www.uscis.gov/forms/how-long-will-processing-take" target="_blank" rel="noopener noreferrer" className="underline">uscis.gov/forms</a> for the most current estimates updated monthly.
                        </p>
                    </div>
                </section>

                <section id="rfe-guide" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Handle an RFE (Request for Evidence)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        An RFE means USCIS needs more documents or information. This is common and doesn't mean your case is in trouble. <strong>You have exactly 7 calendar days to respond.</strong>
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Step-by-Step RFE Response</h3>
                    <div className="space-y-4">
                        {[
                            { step: "Read the RFE notice carefully", detail: "Look for: specific documents requested, deadline date (usually in bold), where to send documents, and instructions." },
                            { step: "Gather all requested documents", detail: "Don't just send some documents. Get EVERY document USCIS requested. Also include existing documents if they strengthen your case." },
                            { step: "Organize documents logically", detail: "Arrange in same order as RFE requests. Number pages. Include a cover letter with your name, case number, and receipt number." },
                            { step: "Make copies of everything", detail: "Submit originals if requested, otherwise certified copies. Keep originals for your records." },
                            { step: "Submit before the deadline", detail: "If mailing, postmark by day 7. If e-filing, upload before deadline. Don't wait—submit by day 3-4 to be safe." },
                            { step: "Confirm receipt", detail: "If mailing, request tracking (USPS Express Mail or UPS). If e-filing, save confirmation number." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold">{i + 1}.</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.step}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-red-900 dark:text-red-100 font-medium text-sm">
                            <AlertTriangle className="inline w-4 h-4 mr-2" />
                            <strong>Critical:</strong> Missing the RFE deadline results in automatic DENIAL. There is usually no second chance. Don't ignore RFE notices—they're not optional.
                        </p>
                    </div>
                </section>

                <section id="delays-issues" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What to Do if Your Case is Delayed
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If your case exceeds published processing times by 30+ days, you can take action:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">1. Call USCIS Customer Service</h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                <strong>Phone:</strong> 1-800-375-5283 (Available Mon-Fri, 8 AM-6 PM EST)<br/>
                                Ask to verify receipt of your application and ask if there are any outstanding issues.
                            </p>
                        </div>

                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">2. File a Case Inquiry</h3>
                            <p className="text-green-800 dark:text-green-200 text-sm">
                                Log into your USCIS account and file a formal case inquiry. USCIS will respond within 15 days.
                            </p>
                        </div>

                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">3. Contact Your Congressman/Representative</h3>
                            <p className="text-purple-800 dark:text-purple-200 text-sm">
                                Your U.S. Representative or Senator has a constituent services officer who can inquire about delayed immigration cases.
                            </p>
                        </div>

                        <div className="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">4. Consult an Immigration Attorney</h3>
                            <p className="text-orange-800 dark:text-orange-200 text-sm">
                                If delays exceed 90+ days or you suspect problems, consult an attorney. They have access to USCIS resources and can file legal action if necessary.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="case-denied" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What If Your Case is Denied?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        A denial is not the end of the road. You have options:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Appeal (120 days)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                File Form N-694 with USCIS within 120 days of denial. Most appeals are denied, but worth trying if you have strong evidence.
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm"><strong>Cost:</strong> ~$675 | <strong>Time:</strong> 6-12 months</p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Motion to Reopen (30 days)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                File Form N-694 if you have new evidence not available at time of decision. Must be submitted within 30 days of denial.
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm"><strong>Cost:</strong> $675 | <strong>Time:</strong> 6-12 months</p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reapply (No deadline)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                Submit a new I-765 application with corrected information or additional documentation. Most successful if you can address the original denial reason.
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm"><strong>Cost:</strong> $410-765 | <strong>Time:</strong> 90-120 days processing</p>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Consult Immediately</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Contact an immigration attorney ASAP. They can evaluate your specific denial reason and suggest the best path forward.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-red-900 dark:text-red-100 font-medium text-sm">
                            <strong>Don't give up.</strong> Many denials can be appealed or reapplied. The process is not over until you've exhausted all options.
                        </p>
                    </div>
                </section>

                {/* FAQ Schema Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "Where do I check my USCIS case status?", answer: "Log into your USCIS account at uscis.gov/cases, click 'Check Application Status,' and enter your case number or receipt number to view your status." },
                            { question: "What does 'case received' mean for OPT?", answer: "'Case received' means USCIS has accepted your I-765 petition and assigned a case number. Processing has officially begun." },
                            { question: "How long does OPT approval take?", answer: "Current USCIS processing times for I-765 applications are 90-120 days from receipt. However, timelines vary by service center and can be longer due to RFEs or background checks." },
                            { question: "What should I do if I receive an RFE?", answer: "Read the RFE carefully to identify what documents are requested, gather all requested items, and submit before the 7-day deadline. Missing the deadline results in automatic denial." },
                            { question: "Can I contact USCIS about a delayed case?", answer: "Yes, if your case exceeds processing times by 30+ days. Call 1-800-375-5283 or file a case inquiry through your USCIS account. You can also contact your U.S. Representative." },
                            { question: "What does 'approved-decision already sent' mean?", answer: "Your I-765 has been approved and USCIS has mailed the approval notice. Your EAD card will arrive within 7-10 business days. Start date can now be finalized with your employer." },
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
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens if OPT Expires?</Link>
                    <Link href="/blog/opt-application-denied" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Denied Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Tracker →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">RFE Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your Case Status in Real-Time</h2>
                <p className="text-purple-100 mb-6 max-w-lg mx-auto">
                    Get automatic notifications when your case status updates. Never miss an RFE deadline again.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                    Track Your Case Now <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
