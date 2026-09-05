import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, Laptop, MapPin } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Can You Work Remotely on OPT? Remote Work Rules for F-1 Students (2026)",
    description: "Can F-1 students on OPT work remotely? Yes, but with rules. Learn about remote work compliance, working from different states, international remote work restrictions, and STEM OPT E-Verify requirements.",
    keywords: ["remote work OPT", "work from home F-1", "OPT remote job", "STEM OPT remote work", "can I work remotely on OPT", "OPT work from different state"],
    openGraph: {
        title: "Can You Work Remotely on OPT? Remote Work Rules for F-1 Students | TrackMyOPT",
        description: "Complete guide to remote work rules on OPT and STEM OPT. What's allowed, state compliance, and international remote work restrictions.",
        url: "https://www.trackmyopt.com/blog/can-you-work-remotely-on-opt",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/remote-work-opt.png",
                width: 1200,
                height: 630,
                alt: "Laptop on kitchen table showing video conference call with notebook and coffee mug",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/can-you-work-remotely-on-opt",
    },
    twitter: {
        card: "summary_large_image",
        title: "Can You Work Remotely on OPT? Remote Work Rules for F-1 Students | TrackMyOPT",
        description: "Complete guide to remote work rules on OPT and STEM OPT. What's allowed, state compliance, and international remote work restrictions.",
        images: ["/blog/remote-work-opt.png"],
    },
};

export default function RemoteWorkOPTGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Remote Work on OPT", url: "https://www.trackmyopt.com/blog/can-you-work-remotely-on-opt" },
            ]} />
            <BlogPostSchema
                title="Can You Work Remotely on OPT? Remote Work Rules for F-1 Students"
                description="Complete guide to remote work rules on OPT and STEM OPT for F-1 students."
                publishedDate="2026-01-26"
                modifiedDate="2026-01-26"
                author="Vinay Kumar"
                faqItems={[
                    { question: "Can I work remotely on OPT?", answer: "Yes, F-1 students on OPT can work remotely. The employment must still be directly related to your field of study, at least 20 hours per week, and properly reported to your DSO. Remote work follows the same rules as in-office OPT employment." },
                    { question: "Can I work remotely from a different state than my employer?", answer: "Yes, but you must update your address with USCIS (Form AR-11) and in the SEVP Portal within 10 days of moving. Your employer may also need to comply with the new state's tax and labor laws." },
                    { question: "Can I work remotely from outside the US on OPT?", answer: "No. OPT work authorization is only valid while you are physically present in the United States. Working remotely from abroad is not authorized employment and your unemployment days will continue to accumulate." },
                    { question: "Are there extra rules for remote work on STEM OPT?", answer: "Yes. Your STEM OPT employer must be E-Verify enrolled, and the I-983 training plan must reflect your remote work arrangement. Your employer must still provide direct supervision, which can be challenging remotely. Document your supervision structure." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Remote Work on OPT</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        OPT Employment
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Can You Work Remotely on OPT? Remote Work Rules for F-1 Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Remote work is now standard in most industries — but what are the rules for F-1 students on OPT? Here is what&apos;s allowed, what&apos;s not, and how to stay compliant.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: January 25, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800">
                    <BlogPostImage src="/blog/remote-work-opt.png" alt="Laptop on kitchen table showing video conference call with notebook and coffee mug" className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" sizes="(max-width: 768px) 100vw, 768px" priority />
                </div>
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Remote work is allowed on OPT — but you must remain physically in the US and keep your reporting up to date.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    <strong>Yes, you can work remotely on OPT.</strong> The same rules apply as in-office work: it must be related to your major, at least 20 hours/week, and reported to your DSO. The key restriction is you must remain <strong>physically in the United States</strong> — remote work from outside the US is not authorized.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#rules", "Remote Work Rules on OPT"],
                        ["#different-state", "Working from a Different State"],
                        ["#outside-us", "Can You Work from Outside the US?"],
                        ["#stem-opt", "STEM OPT Remote Work Requirements"],
                        ["#compliance", "Compliance Checklist for Remote OPT Workers"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="rules" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Remote Work Rules on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        USCIS does not distinguish between remote and in-office employment for OPT purposes. The same eligibility criteria apply regardless of work location:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Allowed on OPT</h3>
                                <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                                    <li>• Full-time remote positions (20+ hours/week) related to your major</li>
                                    <li>• Hybrid roles (mix of in-office and remote)</li>
                                    <li>• Remote work from any US state (with address reporting)</li>
                                    <li>• Multiple remote part-time positions (combined 20+ hours)</li>
                                    <li>• Remote contractor/1099 positions related to your field</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">NOT Allowed on OPT</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• Working remotely from outside the United States</li>
                                    <li>• Remote work unrelated to your field of study</li>
                                    <li>• Less than 20 hours/week (doesn&apos;t stop unemployment clock)</li>
                                    <li>• Unreported remote employment</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="different-state" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        Working from a Different State
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Yes, you can work remotely from a different state than where your employer is located. However, there are <strong>reporting and compliance obligations</strong>:
                    </p>

                    <div className="space-y-3">
                        {[
                            { title: "Update Your Address (Within 10 Days)", desc: "File Form AR-11 with USCIS online at uscis.gov/ar-11 AND update your address in the SEVP Portal. You must do this within 10 days of any address change." },
                            { title: "Notify Your DSO", desc: "Inform your Designated School Official of your new address. They update your SEVIS record accordingly." },
                            { title: "State Tax Implications", desc: "Working from a different state may create tax obligations in both states. Some states (like CA, NY) tax remote workers who work for employers in that state. Consult a tax professional." },
                            { title: "Employer Compliance", desc: "Your employer may need to register in the state where you work remotely. Discuss with HR before relocating — some companies restrict remote work to certain states." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{i + 1}. {item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="outside-us" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Can You Work from Outside the US?
                    </h2>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl my-6">
                        <p className="text-red-900 dark:text-red-100 font-semibold text-lg">
                            &quot;No. OPT work authorization is only valid while you are physically present in the United States. Working remotely from abroad does not count as authorized employment.&quot;
                        </p>
                        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                            — Source: USCIS OPT Regulations, 8 CFR § 214.2(f)
                        </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is the most important rule: <strong>if you leave the US, your OPT unemployment days continue to accumulate</strong>, even if you&apos;re doing work for a US employer. The work performed abroad does not count as &quot;employment&quot; for OPT purposes.
                    </p>

                    <div className="space-y-3">
                        {[
                            "Working from Canada, Mexico, or any other country = unemployment days accumulating",
                            "Digital nomad setups are NOT compatible with OPT",
                            "Even a 2-week trip home while 'working remotely' counts as unemployment",
                            "Your employer may not realize this distinction — you must self-enforce",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700 dark:text-red-200 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="stem-opt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        STEM OPT Remote Work Requirements
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        STEM OPT has <strong>additional requirements</strong> beyond standard OPT that make remote work more complex:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Requirement</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">How It Applies to Remote Work</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["E-Verify Employer", "Your employer must be E-Verify enrolled regardless of work location. Verify at e-verify.gov."],
                                    ["I-983 Training Plan", "Must specifically address remote work arrangement, supervision plan, and how training goals will be met remotely."],
                                    ["Direct Supervision", "Employer must provide meaningful oversight. Document regular check-ins, project reviews, and mentoring sessions."],
                                    ["Wage Parity", "You must be paid comparable wages to US workers in similar roles. Remote work doesn't change this requirement."],
                                    ["Reporting Changes", "Any change to work location must be reported to your DSO and reflected in an updated I-983 within 10 days."],
                                ].map(([req, detail], i) => (
                                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">{req}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="compliance" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Compliance Checklist for Remote OPT Workers
                    </h2>
                    <div className="space-y-3">
                        {[
                            { tip: "Keep your US address updated at all times", detail: "File AR-11 with USCIS and update SEVP Portal within 10 days of any move. This is legally required." },
                            { tip: "Maintain 20+ hours/week minimum", detail: "Remote work must still meet the minimum hour requirement. Track your hours — some remote positions can drift below 20 hours." },
                            { tip: "Stay physically in the United States", detail: "Do not work from abroad even if your employer allows it. Your OPT authorization is only valid on US soil." },
                            { tip: "Report employer changes promptly", detail: "If you switch remote employers, update your SEVP Portal within 10 days. For STEM OPT, file a new I-983." },
                            { tip: "Document your employment", detail: "Keep pay stubs, offer letters, and employment verification in case USCIS or your DSO requests proof." },
                            { tip: "Track your unemployment days", detail: "Use TrackMyOPT to monitor your unemployment days automatically. Gaps between remote jobs count as unemployment." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {item.tip}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Laptop className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Stay Compliant While Working Remotely</h3>
                        </div>
                        <p className="text-emerald-100 mb-6 text-lg max-w-2xl">
                            TrackMyOPT monitors your unemployment days, tracks your EAD expiration, and sends alerts before critical deadlines — whether you work in-office or remotely.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-emerald-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Automatic unemployment day tracking</span>
                            </li>
                            <li className="flex items-center gap-3 text-emerald-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>OPT/STEM OPT deadline alerts</span>
                            </li>
                            <li className="flex items-center gap-3 text-emerald-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>100% Free for F-1 Students</span>
                            </li>
                        </ul>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition-colors shadow-lg"
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
                            { question: "Can I work remotely on OPT?", answer: "Yes. Remote work follows the same OPT rules as in-office work. It must be related to your field of study, at least 20 hours/week, and properly reported to your DSO." },
                            { question: "Can I work remotely from a different state than my employer?", answer: "Yes, but you must update your address with USCIS (Form AR-11) and in the SEVP Portal within 10 days. Be aware of state tax implications." },
                            { question: "Can I work remotely from outside the US on OPT?", answer: "No. OPT work authorization is only valid while you are physically in the US. Working from abroad is not authorized employment and your unemployment days will accumulate." },
                            { question: "Are there extra rules for remote work on STEM OPT?", answer: "Yes. Your employer must be E-Verify enrolled, the I-983 must reflect remote work arrangements, and your employer must provide documented direct supervision." },
                            { question: "Does remote work stop my unemployment clock?", answer: "Yes, as long as you meet the standard requirements: 20+ hours/week, related to your major, performed while physically in the US, and properly reported." },
                            { question: "Can I be a freelancer working remotely on OPT?", answer: "Self-employment is allowed on standard OPT (not STEM OPT) if the work is related to your major. You must have proper business registration and report it to your DSO." },
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
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day OPT Unemployment Rule</Link>
                    <Link href="/blog/stem-opt-employer-requirements" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Employer Requirements</Link>
                    <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ I-983 Training Plan Guide</Link>
                    <Link href="/blog/f1-visa-jobs-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Visa Jobs Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/sponsors" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">H-1B Sponsor Finder →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your Remote OPT Employment</h2>
                <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
                    Stay compliant with automated unemployment tracking, deadline alerts, and USCIS case monitoring — wherever you work.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
