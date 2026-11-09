import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { AuthorBio } from "@/components/blog/AuthorBio";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "STEM OPT Extension 2026: Requirements, Fee, Timeline",
    description: "STEM OPT extension 2026: requirements, the $470 I-765 fee, $1,780 premium processing, the 90-day filing window, 180-day auto extension and processing time.",
    keywords: ["stem opt extension", "stem opt extension requirements", "stem opt extension fee", "stem opt extension processing time", "stem opt extension premium processing fee", "stem opt extension grace period", "STEM OPT 24 month extension", "what is stem opt"],
    openGraph: {
        title: "STEM OPT Extension 2026: Requirements, Fee, Timeline | TrackMyOPT",
        description: "Who qualifies for the 24-month STEM OPT extension, what it costs, when to file, the 180-day auto extension and why you cannot file in the grace period.",
        url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "STEM OPT Extension 2026: requirements, fee, filing window and processing time" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/stem-opt-extension-guide" },
    twitter: {
        card: "summary_large_image",
        title: "STEM OPT Extension 2026: Requirements, Fee, Timeline | TrackMyOPT",
        description: "Who qualifies for the 24-month STEM OPT extension, what it costs, when to file, the 180-day auto extension and why you cannot file in the grace period.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

const STEM_OPT_FAQS = [
    {
        question: "What are the STEM OPT extension requirements?",
        answer: "You must be in a valid period of post-completion OPT, hold a degree on the DHS STEM Designated Degree Program List from an accredited, SEVP-certified school, and work for an employer enrolled in E-Verify. You and your employer must complete Form I-983, and the job must be directly related to your STEM degree.",
    },
    {
        question: "How much is the STEM OPT extension fee in 2026?",
        answer: "The Form I-765 filing fee is $470 if you file online and $520 if you file on paper, according to the USCIS fee schedule (Form G-1055, edition 10/26/26). Premium processing for an OPT or STEM OPT I-765 costs an extra $1,780, paid separately.",
    },
    {
        question: "When can I file for the STEM OPT extension?",
        answer: "USCIS must receive your Form I-765 up to 90 days before your current OPT EAD expires, and within 60 days of the date your DSO enters the STEM OPT recommendation in SEVIS. It must arrive before the EAD expires.",
    },
    {
        question: "How long does the STEM OPT extension take to process?",
        answer: "Processing time changes month to month. Check the USCIS processing-times tool and our STEM OPT processing time guide for the current range. If you filed on time, the 180-day automatic extension lets you keep working while the case is pending.",
    },
    {
        question: "Can I keep working while my STEM OPT extension is pending?",
        answer: "Yes, if you filed on time. USCIS says that if your OPT expires while a timely STEM OPT application is pending, your employment authorization is automatically extended for 180 days. The extension ends once USCIS decides the case.",
    },
    {
        question: "Can I apply for the STEM OPT extension during the 60-day grace period?",
        answer: "No. Study in the States says students may not apply for STEM OPT during the 60-day grace period after post-completion OPT ends. The application must reach USCIS before your OPT EAD expires.",
    },
    {
        question: "What is STEM OPT and how long is it?",
        answer: "STEM OPT is a 24-month extension of post-completion OPT for F-1 students with a qualifying STEM degree. With 12 months of initial OPT, that is up to 36 months of practical training.",
    },
    {
        question: "Does my employer need E-Verify for STEM OPT?",
        answer: "Yes. Your employer must be enrolled in E-Verify and in good standing, and it must sign Form I-983 with you before your DSO can recommend the STEM extension in SEVIS.",
    },
    {
        question: "Can I get a second STEM OPT extension?",
        answer: "Yes, once. If you later earn another qualifying STEM degree at a higher educational level, USCIS says you may be eligible for one additional 24-month STEM OPT extension.",
    },
] as const;

export default function STEMOPTGuideArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Stem Opt Extension Guide", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-05-31" modifiedDate="2026-11-09" author="Vinay Kumar" faqItems={[...STEM_OPT_FAQS]} howToItems={[{step: 1, name: "Verify Your Degree Is STEM-Designated", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide#eligibility", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 2, name: "Verify Your Employer's E-Verify Enrollment", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide#employer", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 3, name: "Complete Form I-983 Training Plan", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide#i983", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 4, name: "Get Your DSO to Recommend STEM Extension in SEVIS", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide#timeline", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 5, name: "File Form I-765 for STEM OPT Extension", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide#fees", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 6, name: "Receive Your Extended EAD and Begin STEM OPT", url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide#processing-time", image: "https://www.trackmyopt.com/og-image.jpg"}]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">STEM OPT Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Stem opt · 15 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    STEM OPT Extension 2026: Requirements, Fee, Filing Window and Processing Time
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    A guide to the 24-month STEM OPT extension. It covers who qualifies, what it costs, when to file, how the 180-day automatic extension works and where to check processing time.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: November 9, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The STEM OPT extension adds 24 months of practical training to post-completion OPT for F-1 graduates with a qualifying STEM degree. Your employer must use E-Verify, and you and your employer complete Form I-983. File Form I-765 up to 90 days before your OPT EAD expires and within 60 days of your DSO&apos;s recommendation. The fee is $470 online or $520 on paper, and premium processing costs $1,780 more.
                </p>
            </div>

            <BlogProductCTA
                variant="opt-timeline"
                sourcePage="/blog/stem-opt-extension-guide"
            />

            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-10">
                <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3">Key Takeaway</h2>
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                    STEM OPT gives eligible F-1 students a <strong>24-month work authorization extension</strong> beyond the initial 12-month OPT. Your employer must be <strong>E-Verify enrolled</strong>, you need a STEM-designated degree, and you must file <strong>Form I-983</strong> with your DSO before applying.
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">Source: <a href="https://www.ice.gov/sevis/stemopt" target="_blank" rel="noopener noreferrer" className="underline">ICE.gov STEM OPT Hub</a></p>
            </div>

            <div className="border rounded-xl border-border p-6 mb-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="grid md:grid-cols-2 gap-2">
                    {[["#eligibility", "STEM OPT Extension Requirements"], ["#cip-codes", "STEM OPT CIP Code List"], ["#timeline", "Filing Window and Timeline"], ["#fees", "STEM OPT Extension Fee and Premium Processing"], ["#auto-extension", "180-Day Automatic Extension"], ["#processing-time", "Processing Time"], ["#grace-period", "Grace Period Rule"], ["#i983", "I-983 Training Plan"], ["#employer", "Employer Requirements"], ["#unemployment", "Unemployment & Reporting Rules"], ["#after-stem", "What Comes After STEM OPT?"]].map(([href, text]) => (
                        <a key={href} href={href} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ {text}</a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="eligibility" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Extension Requirements</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">USCIS lists these requirements. You must meet all of them.</p>
                    <div className="space-y-3">
                        {[
                            { req: "Currently on post-completion OPT", detail: "You must have been granted OPT and be in a valid period of post-completion OPT when you apply." },
                            { req: "STEM-designated degree from an accredited school", detail: "Your bachelor's, master's or doctoral degree must be on the DHS STEM Designated Degree Program List. The school must be accredited and SEVP-certified when you apply. A previous U.S. STEM degree conferred in the last 10 years can qualify if you have not already used it for a STEM extension and the job is directly related to it." },
                            { req: "Employer enrolled in E-Verify", detail: "Your employer needs a valid E-Verify company ID, or client company ID if it uses an agent, and must stay in good standing. It also needs an IRS Employer Identification Number." },
                            { req: "Job directly related to your STEM degree", detail: "The training opportunity must relate directly to the STEM degree you are using, and pay and hours must be commensurate with similar U.S. workers." },
                            { req: "Form I-983 Training Plan completed", detail: "You and your employer complete and sign Form I-983 and submit it to your DSO before you apply." },
                            { req: "On-time Form I-765", detail: "USCIS must receive your I-765 up to 90 days before your OPT EAD expires and within 60 days of your DSO's SEVIS recommendation." },
                        ].map((item, i) => (
                            <div key={i} className="border p-4 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.req}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="cip-codes" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT CIP Codes: Which Degrees Qualify?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">DHS maintains a list of STEM-designated CIP codes. Popular qualifying fields include:</p>
                    <div className="overflow-x-auto my-6 surface-card [&>table]:border-hidden [&>table]:my-0">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-surface-strong">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Category</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Example Degrees</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">CIP Code Range</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Computer Science", "CS, Software Engineering, AI/ML, Data Science, Cybersecurity", "11.xxxx"],
                                    ["Engineering", "Mechanical, Electrical, Civil, Chemical, Biomedical", "14.xxxx"],
                                    ["Mathematics & Statistics", "Applied Math, Statistics, Actuarial Science", "27.xxxx"],
                                    ["Biological Sciences", "Biology, Biochemistry, Neuroscience, Genetics", "26.xxxx"],
                                    ["Physical Sciences", "Physics, Chemistry, Environmental Science", "40.xxxx"],
                                    ["Business Analytics", "Business Analytics, Quantitative Finance (STEM MBA programs)", "52.1301+"],
                                ].map(([cat, degrees, cip], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border border-border font-medium text-gray-900 dark:text-white">{cat}</td><td className="p-3 border border-border text-gray-600 dark:text-gray-400">{degrees}</td><td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-mono text-xs">{cip}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Full list: <a href="https://www.ice.gov/sites/default/files/documents/stem-list.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">DHS STEM Designated Degree Program List (PDF)</a>. To check your own program, read <Link href="/blog/is-my-degree-stem-eligible-cip-code" className="text-blue-600 dark:text-blue-400 underline">Is my degree STEM eligible? How to check your CIP code</Link>.</p>
                </section>

                <section id="timeline" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Filing Window and Timeline</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Two clocks control the filing date. USCIS must receive Form I-765 no more than 90 days before your current OPT EAD expires. It must also arrive within 60 days of the date your DSO enters the STEM OPT recommendation in SEVIS. The I-20 you send must be endorsed by the DSO within the last 60 days.</p>
                    <div className="space-y-3">
                        {[
                            { step: "Before the 90-day window opens", action: "Confirm your degree is STEM-designated and your employer is in E-Verify. Start Form I-983 with your employer.", color: "blue" },
                            { step: "DSO recommendation", action: "Send the signed I-983 to your DSO. The DSO recommends the STEM extension in SEVIS and issues a new I-20. Your 60-day filing clock starts on the SEVIS recommendation date.", color: "indigo" },
                            { step: "File I-765 (up to 90 days before the EAD end date)", action: "File Form I-765 with the fee ($470 online, $520 paper), your employer's E-Verify name and company ID, the DSO-endorsed I-20 and a copy of your STEM degree.", color: "purple" },
                            { step: "Before your OPT EAD expires", action: "USCIS must receive the application before the current OPT EAD expires. You cannot file during the 60-day grace period after OPT ends.", color: "amber" },
                            { step: "180-day automatic extension", action: "If you filed on time and your OPT EAD expires while the case is pending, your work authorization continues for up to 180 days.", color: "green" },
                            { step: "Approval", action: "USCIS issues a new EAD for the 24-month extension. Keep reporting to your DSO as described below.", color: "emerald" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300 text-xs font-bold">{i + 1}</div>
                                <div className="flex-1 pb-4 border-l-2 border-purple-100 dark:border-zinc-800 pl-4 -ml-[1px]">
                                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{item.step}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200"><strong>Critical:</strong> If USCIS does not receive your I-765 before your OPT EAD expires, you cannot get the 180-day extension. File early in the 90-day window.</p>
                    </div>
                </section>

                <section id="fees" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Extension Fee and Premium Processing Fee</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">The USCIS fee schedule (Form G-1055, edition 10/26/26) lists these fees for a STEM OPT Form I-765. Premium processing is optional and is paid separately on Form I-907, in addition to the I-765 fee.</p>
                    <div className="overflow-x-auto my-6 surface-card [&>table]:border-hidden [&>table]:my-0">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-surface-strong">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Fee</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Online filing</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Paper filing</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Form I-765 filing fee", "$470", "$520"],
                                    ["Form I-907 premium processing for an OPT or STEM OPT I-765 (optional)", "$1,780", "$1,780"],
                                    ["Total with premium processing", "$2,250", "$2,300"],
                                ].map(([fee, online, paper], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border border-border font-medium text-gray-900 dark:text-white">{fee}</td><td className="p-3 border border-border text-gray-700 dark:text-gray-300">{online}</td><td className="p-3 border border-border text-gray-700 dark:text-gray-300">{paper}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fees change. Check the <a href="https://www.uscis.gov/g-1055" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">USCIS fee schedule</a> and the <a href="https://www.uscis.gov/i-907" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Form I-907 page</a> on the day you file. For when premium processing is worth it, read our <Link href="/blog/premium-processing-opt-stem-opt-2026-complete-guide" className="text-blue-600 dark:text-blue-400 underline">premium processing guide for OPT and STEM OPT</Link>.</p>
                </section>

                <section id="auto-extension" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">The 180-Day Automatic Extension While Your Case Is Pending</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">USCIS says that if you file your STEM OPT application on time and your OPT period expires while it is pending, your employment authorization is automatically extended for 180 days. The extension ends as soon as USCIS decides the application.</p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">On time means USCIS received the I-765 before your OPT EAD expired, within the 90-day and 60-day windows above. Keep the I-797C receipt notice in a safe place. Read more in <Link href="/blog/stem-opt-180-day-auto-extension-explained-2026" className="text-blue-600 dark:text-blue-400 underline">the 180-day STEM OPT auto extension explained</Link>.</p>
                </section>

                <section id="processing-time" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Extension Processing Time</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Processing time for a STEM OPT I-765 changes from month to month, so we do not repeat a single number here. Check the <a href="https://egov.uscis.gov/processing-times/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">USCIS processing-times tool</a> and our <Link href="/blog/stem-opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 underline">STEM OPT processing time 2026</Link> guide, which we update with recent data.</p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">If you filed on time, a long wait does not stop you from working, because the 180-day extension covers the gap. Premium processing shortens the wait for a decision but costs $1,780 more.</p>
                </section>

                <section id="grace-period" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Extension and the Grace Period</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">F-1 students have a 60-day grace period after post-completion OPT ends. Study in the States says you may not apply for the STEM OPT extension during that grace period. If your OPT EAD has already expired, it is too late to file.</p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">The same applies after cap-gap. USCIS says you cannot apply for STEM OPT once a cap-gap extension ends and you have entered the 60-day grace period.</p>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200"><strong>Current rule:</strong> A July 2026 DHS rule would have shortened the F-1 grace period to 30 days. On September 14, 2026, a federal court postponed that rule. USCIS says it is following the previous rules, so the 60-day grace period still applies. See our <Link href="/blog/60-day-grace-period-f1-students" className="underline">60-day grace period guide</Link>.</p>
                    </div>
                </section>

                <section id="i983" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">I-983 Training Plan</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The I-983 is a formal agreement between you and your employer. For a detailed section-by-section walkthrough, see our <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 underline font-medium">complete I-983 guide</Link>.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                        {[
                            { title: "Student fills", items: ["Personal info", "SEVIS ID", "Degree program", "Signature"] },
                            { title: "Employer fills", items: ["Company info", "E-Verify ID", "Training objectives", "Supervision plan"] },
                            { title: "Both sign", items: ["Final signatures", "Date of agreement", "Submit to DSO"] },
                        ].map((col, i) => (
                            <div key={i} className="border p-4 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{col.title}</h3>
                                <ul className="space-y-1">{col.items.map((item, j) => (<li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{item}</li>))}</ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="employer" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Employer Requirements for STEM OPT</h2>
                    <div className="space-y-3">
                        {[
                            { req: "E-Verify Enrollment", desc: "The employer's E-Verify Company ID must appear on the I-983. Verify at e-verify.gov." },
                            { req: "Commensurate Compensation", desc: "Must pay you at a rate comparable to U.S. workers in similar positions. Below-market pay raises flags." },
                            { req: "Training & Mentoring", desc: "Must provide structured training, not just a regular job. Specify learning goals on I-983." },
                            { req: "Evaluation Reports", desc: "You complete a self-evaluation on Form I-983 within 12 months of the STEM OPT start date and a final one at the end. Your employer reviews and signs each one, and you send it to your DSO." },
                        ].map((item, i) => (
                            <div key={i} className="border p-4 rounded-xl border-border flex items-start gap-3 bg-card shadow-card">
                                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.req}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="unemployment" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Unemployment & Reporting Rules</h2>
                    <div className="overflow-x-auto my-6 surface-card [&>table]:border-hidden [&>table]:my-0">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-surface-strong">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Rule</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Initial OPT</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">STEM OPT</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Max unemployment days", "90 days", "150 days total (90 + 60)"],
                                    ["Volunteer work counts?", "Yes (20+ hrs/week)", "No, must be paid"],
                                    ["Min hours per week", "20 hours", "20 hours"],
                                    ["Report changes", "Within 10 days", "Within 10 days"],
                                    ["Self-evaluation required", "No", "Yes (at 12 months + end)"],
                                ].map(([rule, initial, stem], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border border-border font-medium text-gray-900 dark:text-white">{rule}</td><td className="p-3 border border-border text-gray-700 dark:text-gray-300">{initial}</td><td className="p-3 border border-border text-gray-700 dark:text-gray-300">{stem}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">For a deep dive, read our <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 underline">STEM OPT unemployment limit guide</Link>.</p>
                </section>

                <section id="after-stem" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Comes After STEM OPT?</h2>
                    <div className="space-y-3">
                        {[
                            { path: "H-1B Sponsorship", desc: "The most common next step. Your employer registers you for the H-1B lottery. Depending on your dates, initial OPT plus 24 months of STEM OPT commonly spans up to three H-1B registration seasons.", link: "/blog/opt-to-h1b-transition" },
                            { path: "Cap-Exempt H-1B", desc: "Universities, nonprofits affiliated with a university (including some hospitals), and nonprofit or government research organizations can sponsor H-1B visas outside the lottery, with no cap restrictions.", link: "/blog/h1b-approval-rates-by-company" },
                            { path: "Green Card Sponsorship", desc: "Some employers sponsor EB-2/EB-3 green cards. This can start while you're on STEM OPT.", link: null },
                            { path: "O-1 Extraordinary Ability", desc: "For those with exceptional achievements in their field. No lottery. Approval is based on evidence.", link: null },
                        ].map((item, i) => (
                            <div key={i} className="border p-4 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.path}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                {item.link && <Link href={item.link} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline mt-1 inline-block">Read guide →</Link>}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {STEM_OPT_FAQS.map((faq, i) => (
                            <div key={i} className="border p-5 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="border rounded-xl border-border p-6 mt-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ I-983 Training Plan Guide</Link>
                    <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Unemployment Limit</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/stem-opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Processing Time 2026</Link>
                    <Link href="/blog/stem-opt-180-day-auto-extension-explained-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT 180-Day Auto Extension Explained</Link>
                    <Link href="/blog/is-my-degree-stem-eligible-cip-code" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Is My Degree STEM Eligible? CIP Code Check</Link>
                    <Link href="/blog/hub/stem-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ All STEM OPT Guides</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/compare" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT vs STEM Comparison Tables →</Link>
                    <Link href="/ai-facts" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">101 Immigration Facts →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="not-prose rounded-xl p-8 text-center text-ink-foreground mt-12 bg-ink border border-ink-border shadow-elevated">
                <h2 className="text-2xl font-bold mb-3">Track Your STEM OPT Timeline & Unemployment Days</h2>
                <p className="text-ink-muted mb-6 max-w-lg mx-auto">Join 3,500+ people who have signed up for TrackMyOPT. Use it to plan STEM OPT deadlines, employer reporting, and unemployment days.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-500 shadow-button">Start Tracking Free <ArrowRight className="w-4 h-4" /></Link>
            </div>

        </article>
    );
}
