import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, CreditCard, Building2, Mail, Hourglass, Briefcase, MailOpen } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "How to Get a Social Security Number (SSN) on OPT: Step-by-Step Guide (2026)",
    description: "Complete guide to getting your SSN as an F-1 student on OPT. Required documents, SSA office visit, processing times, what to do if denied, and why you need an SSN for employment.",
    keywords: ["SSN on OPT", "social security number F-1", "how to get SSN international student", "SSN OPT application", "SSA office F-1", "SSN EAD card"],
    openGraph: {
        title: "How to Get a Social Security Number (SSN) on OPT | TrackMyOPT",
        description: "Step-by-step guide for F-1 students on OPT to get their Social Security Number. Documents, SSA office tips, and processing timeline.",
        url: "https://www.trackmyopt.com/blog/how-to-get-ssn-on-opt",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/ssn-opt-guide.png",
                width: 1200,
                height: 630,
                alt: "Passport, EAD card, and Form SS-5 application laid out on a desk for SSN application",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/how-to-get-ssn-on-opt",
    },
};

export default function HowToGetSSNOnOPT() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "How to Get SSN on OPT", url: "https://www.trackmyopt.com/blog/how-to-get-ssn-on-opt" },
            ]} />
            <BlogPostSchema
                title="How to Get a Social Security Number (SSN) on OPT: Step-by-Step Guide"
                description="Complete guide to getting your SSN as an F-1 student on OPT."
                publishedDate="2026-03-13"
                modifiedDate="2026-03-13"
                author="Vinay Kumar"
                faqItems={[
                    { question: "Can I apply for an SSN before my OPT starts?", answer: "No. You need proof of employment authorization (your EAD card) and typically a job offer or employment letter. You cannot apply for an SSN purely based on being an F-1 student — you need work authorization." },
                    { question: "How long does it take to receive my SSN card?", answer: "The Social Security Administration typically mails your SSN card within 2-4 weeks after your in-person visit. In some cases, it can take up to 6 weeks, especially during peak graduation seasons." },
                    { question: "Can I start working before I receive my SSN card?", answer: "Yes, if you have your EAD card. Your employer can use your EAD receipt number for Form I-9 verification. You should apply for your SSN as soon as possible and provide the number to your employer when you receive it." },
                    { question: "What if the SSA denies my SSN application?", answer: "Common reasons include SEVIS verification failures (SSA verifies your record with DHS). Wait 48-72 hours for the SEVIS database to update, then try again. If denied again, ask your DSO to verify your SEVIS record is active." },
                    { question: "Do I need an SSN to file taxes?", answer: "If you cannot get an SSN, you can apply for an Individual Taxpayer Identification Number (ITIN) using Form W-7. However, with OPT work authorization, you should be eligible for an SSN, which is preferred over an ITIN." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">SSN on OPT</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                        Finance & Compliance
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        9 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    How to Get a Social Security Number (SSN) on OPT: Step-by-Step Guide
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your SSN is the key to employment, banking, credit, and taxes in the US. Here is exactly how to get one as an F-1 student on OPT — documents, SSA office tips, and what to do if denied.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: March 13, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <img
                    src="/blog/ssn-opt-guide.png"
                    alt="Passport, EAD card, and Form SS-5 application laid out on a desk for SSN application"
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    You&apos;ll need to visit your local SSA office in person to apply — there is no online option for first-time applicants.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    <strong>Visit your nearest SSA office with your passport, I-20, EAD card, and I-94.</strong> Fill out Form SS-5 on-site. SSA verifies your SEVIS record with DHS (takes 48-72 hours after your I-20 is updated). Your SSN card arrives by mail in 2-4 weeks. You can start working with your EAD card before receiving your SSN.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    You can ONLY apply for an SSN if you have <strong>employment authorization</strong> (EAD card or CPT authorization on your I-20). Being an F-1 student alone is not enough. Wait until your EAD arrives, then visit SSA with all documents.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.ssa.gov/ssnumber/" target="_blank" rel="noopener noreferrer" className="underline">SSA.gov</a>
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#why-ssn", "Why Do You Need an SSN?"],
                        ["#when-to-apply", "When to Apply for Your SSN"],
                        ["#documents", "Required Documents Checklist"],
                        ["#step-by-step", "Step-by-Step Application Process"],
                        ["#after-visit", "After Your SSA Visit: Timeline"],
                        ["#denied", "What to Do If Your Application Is Denied"],
                        ["#no-ssn-yet", "Working Without an SSN (Temporary Solutions)"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="why-ssn" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Do You Need an SSN?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        A Social Security Number is a <strong>9-digit identifier</strong> issued by the Social Security Administration (SSA) that serves as your primary ID for employment and financial activity in the United States. As an F-1 student on OPT, you need it for:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Employment & Payroll", desc: "Your employer needs your SSN for W-2 tax reporting, payroll processing, and I-9 employment verification." },
                            { title: "Tax Filing", desc: "Required to file federal and state tax returns using Form 1040-NR or 1040. Without an SSN, you'd need an ITIN." },
                            { title: "Banking & Credit", desc: "Required to open most bank accounts, apply for credit cards, and build US credit history." },
                            { title: "Housing & Utilities", desc: "Landlords and utility companies typically require an SSN for background checks and account setup." },
                        ].map((item) => (
                            <div key={item.title} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="when-to-apply" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        When to Apply for Your SSN
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Timing is critical. You should apply <strong>as soon as you have your EAD card in hand</strong>, ideally before your first day of work. Here is the recommended timeline:
                    </p>
                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6">
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                EAD card arrives in mail → <strong>Apply within 1-2 days</strong>
                            </p>
                            <p className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                Visit SSA office → <strong>Same week as EAD arrival</strong>
                            </p>
                            <p className="flex items-center gap-2">
                                <Hourglass className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                SSA verifies SEVIS record → <strong>48-72 hours (done automatically)</strong>
                            </p>
                            <p className="flex items-center gap-2">
                                <MailOpen className="w-4 h-4 text-green-500 flex-shrink-0" />
                                SSN card arrives by mail → <strong>2-4 weeks after visit</strong>
                            </p>
                            <p className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                Start your job → <strong>You can start with EAD only</strong>
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mt-6">
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Common Mistake: Applying Too Early
                        </h3>
                        <p className="text-amber-800 dark:text-amber-200">
                            Do NOT visit SSA before your EAD card arrives or before your OPT start date. SSA will deny your application because they cannot verify your employment authorization. Wait until you physically have your EAD card and your OPT start date has passed (or is within 30 days).
                        </p>
                    </div>
                </section>

                <section id="documents" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Required Documents Checklist
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Bring <strong>all original documents</strong> (no photocopies accepted). SSA will examine them and return them to you immediately.
                    </p>

                    <div className="space-y-3">
                        {[
                            { title: "Valid Passport", desc: "Unexpired passport from your home country. This serves as proof of identity and immigration status.", required: true },
                            { title: "EAD Card (I-766)", desc: "Your Employment Authorization Document — this is proof that you are authorized to work in the US. This is the most critical document.", required: true },
                            { title: "Form I-20", desc: "Your Certificate of Eligibility with OPT authorization noted. Bring the most recent version with your DSO's signature.", required: true },
                            { title: "I-94 Arrival/Departure Record", desc: "Print from i94.cbp.dhs.gov. Shows your most recent entry into the US and admission class (F-1).", required: true },
                            { title: "Form SS-5 (Application)", desc: "You can fill this out at the SSA office or download and pre-fill from ssa.gov. It's a one-page form.", required: true },
                            { title: "Job Offer Letter (Recommended)", desc: "Not always required, but some SSA offices ask for proof of a job offer. Bring it just in case.", required: false },
                        ].map((doc, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${doc.required ? 'text-green-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {doc.title}
                                        {!doc.required && <span className="text-xs text-gray-500 ml-2">(Optional but recommended)</span>}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{doc.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="step-by-step" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step Application Process
                    </h2>

                    <div className="space-y-4">
                        {[
                            { step: "1", title: "Find Your Local SSA Office", desc: "Use the SSA office locator at ssa.gov/locator. Choose the closest office to your address. Note: some offices require appointments; call ahead or check online." },
                            { step: "2", title: "Gather All Documents", desc: "Bring your passport, EAD card, I-20, printed I-94, and a pre-filled Form SS-5 (optional — you can fill it there). Keep all originals together in a folder." },
                            { step: "3", title: "Visit SSA Office (In-Person Only)", desc: "Walk in or arrive for your appointment. Take a ticket number and wait to be called. First-time SSN applications for non-citizens CANNOT be done online or by mail." },
                            { step: "4", title: "Submit Your Application", desc: "When called, present all documents. The SSA representative will examine originals, verify your identity, and enter your information. They will return your documents immediately." },
                            { step: "5", title: "SEVIS Verification", desc: "SSA verifies your F-1 status and work authorization with DHS electronically. This usually takes 48-72 hours. If your SEVIS record hasn't been updated, SSA may ask you to come back." },
                            { step: "6", title: "Receive Your SSN Card by Mail", desc: "If approved, SSA mails your SSN card to the address on your application within 2-4 weeks. The card is a simple paper document — keep it safe and never carry it in your wallet." },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-lg font-bold flex-shrink-0">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="after-visit" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        After Your SSA Visit: Timeline
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Timeframe</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">What Happens</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Your Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Day 1", "Visit SSA, submit documents", "Keep receipt/confirmation"],
                                    ["Days 2-3", "SSA verifies SEVIS with DHS", "Wait patiently"],
                                    ["Week 1-2", "SSA processes application", "Check mail daily"],
                                    ["Week 2-4", "SSN card arrives by mail", "Memorize your SSN, store card safely"],
                                    ["Week 4+", "If not received", "Call SSA at 1-800-772-1213"],
                                ].map(([time, what, action], i) => (
                                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">{time}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{what}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="denied" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What to Do If Your Application Is Denied
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        SSN denials for F-1/OPT students are common and usually fixable. Here are the most common reasons and solutions:
                    </p>
                    <div className="space-y-4">
                        {[
                            { reason: "SEVIS Verification Failure", fix: "SSA couldn't verify your SEVIS record with DHS. Wait 48-72 hours after your I-20 was updated, then revisit SSA. Ask your DSO to confirm your SEVIS record is active and updated." },
                            { reason: "EAD Card Not Yet in System", fix: "Sometimes there's a delay between USCIS approval and SSA's database. Wait 1-2 weeks after receiving your EAD, then try again." },
                            { reason: "OPT Start Date Hasn't Arrived", fix: "Some SSA offices won't process applications until your OPT start date has passed. Return after your start date with the same documents." },
                            { reason: "Incorrect Form I-94", fix: "Print a fresh I-94 from i94.cbp.dhs.gov. Make sure it shows your most recent entry and F-1 admission class." },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    {item.reason}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.fix}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="no-ssn-yet" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Working Without an SSN (Temporary Solutions)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If your start date arrives before your SSN card, you can still begin working legally:
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Form I-9: Use EAD Card</h3>
                                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                    Your EAD card (I-766) is a List A document for Form I-9. It proves both identity AND work authorization. Your employer can use the EAD receipt number until your SSN arrives.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Payroll: Provide SSN When Received</h3>
                                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                    Tell HR you've applied and will provide your SSN as soon as you receive it. Employers are used to this with international employees. They can process your first paychecks and update the SSN later.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Track Your OPT Timeline & EAD Status</h3>
                        </div>
                        <p className="text-teal-100 mb-6 text-lg max-w-2xl">
                            Know exactly when your EAD arrives, track your OPT dates, and monitor USCIS case status — all in one dashboard.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-teal-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Real-time USCIS case status tracking</span>
                            </li>
                            <li className="flex items-center gap-3 text-teal-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>OPT timeline and deadline alerts</span>
                            </li>
                            <li className="flex items-center gap-3 text-teal-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>100% Free for F-1 International Students</span>
                            </li>
                        </ul>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-teal-700 font-bold hover:bg-teal-50 transition-colors shadow-lg"
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
                        {[
                            { question: "Can I apply for an SSN before my OPT starts?", answer: "No. You need proof of employment authorization (your EAD card) and typically a job offer. You cannot apply purely based on being an F-1 student — you need work authorization." },
                            { question: "How long does it take to receive my SSN card?", answer: "SSA typically mails your SSN card within 2-4 weeks after your in-person visit. It can take up to 6 weeks during peak graduation seasons (May-July)." },
                            { question: "Can I start working before I receive my SSN card?", answer: "Yes. Your EAD card is sufficient for Form I-9 employment verification. Apply for your SSN as soon as possible and provide the number to your employer when you receive it." },
                            { question: "What if the SSA denies my SSN application?", answer: "Common reasons include SEVIS verification failures. Wait 48-72 hours for the SEVIS database to update, then try again. If denied again, ask your DSO to verify your SEVIS record is active." },
                            { question: "Do I need an SSN to file taxes?", answer: "If you cannot get an SSN, you can apply for an ITIN using Form W-7. However, with OPT work authorization, you should be eligible for an SSN, which is preferred for tax filing." },
                            { question: "Can I apply for an SSN online?", answer: "No. First-time SSN applications for non-citizens must be done in person at a local SSA office. There is no online or mail option." },
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

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/form-i9-complete-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Form I-9 Complete Guide</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide</Link>
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Tax Filing Guide 2026</Link>
                    <Link href="/blog/indian-bank-account-nro-opt-students" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Indian Bank Account FEMA Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your EAD Card Status</h2>
                <p className="text-teal-100 mb-6 max-w-lg mx-auto">
                    Know the moment your EAD is approved so you can apply for your SSN immediately. TrackMyOPT Pro runs daily USCIS auto-checks and can email you when status changes.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
