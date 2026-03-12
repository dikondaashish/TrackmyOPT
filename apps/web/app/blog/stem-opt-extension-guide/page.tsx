import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, Shield, FileText, Briefcase } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Complete STEM OPT Guide 2026: Extension, Eligibility & Application",
    description: "Everything about STEM OPT in 2026: eligible CIP codes, 24-month extension timeline, I-983 form, E-Verify requirement, employer obligations, and unemployment rules. Updated with latest USCIS data.",
    keywords: ["STEM OPT", "STEM OPT extension", "STEM OPT guide 2026", "STEM OPT eligible degrees", "STEM OPT CIP codes", "STEM OPT 24 month extension", "STEM OPT requirements"],
    openGraph: {
        title: "Complete STEM OPT Extension Guide 2026 | TrackMyOPT",
        description: "24-month STEM OPT extension guide: eligibility, timeline, I-983, E-Verify, and unemployment rules.",
        url: "https://www.trackmyopt.com/blog/stem-opt-extension-guide",
        type: "article",
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/stem-opt-extension-guide" },
};

export default function STEMOPTGuideArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "What is STEM OPT?", answer: "STEM OPT is a 24-month extension of Optional Practical Training available to F-1 students who earned a degree in a Science, Technology, Engineering, or Mathematics field. Combined with the initial 12-month OPT, you can work for up to 36 months total."}, {question: "How long is the STEM OPT extension?", answer: "The STEM OPT extension provides an additional 24 months of work authorization beyond your initial 12-month post-completion OPT, for a total of 36 months of practical training."}, {question: "Is E-Verify required for STEM OPT?", answer: "Yes. Your employer must be enrolled in E-Verify and have an active Company ID number. E-Verify enrollment is a mandatory requirement with no exceptions."}, {question: "Can I apply for STEM OPT extension twice?", answer: "No. STEM OPT extension is a one-time benefit. Once you've used your STEM extension (24 months), you cannot apply for another extension, even if you change employers or jobs."} ]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">STEM OPT Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">STEM OPT</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">Pillar Guide</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />15 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Complete STEM OPT Guide 2026: Extension, Eligibility & Application
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The definitive guide to the 24-month STEM OPT extension. From eligibility and CIP codes to the I-983 training plan and employer requirements — everything you need in one place.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                    STEM OPT gives eligible F-1 students a <strong>24-month work authorization extension</strong> beyond the initial 12-month OPT. Your employer must be <strong>E-Verify enrolled</strong>, you need a STEM-designated degree, and you must file <strong>Form I-983</strong> with your DSO before applying.
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">Source: <a href="https://www.ice.gov/sevis/stemopt" target="_blank" rel="noopener noreferrer" className="underline">ICE.gov STEM OPT Hub</a></p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="grid md:grid-cols-2 gap-2">
                    {[["#eligibility", "Who Is Eligible for STEM OPT?"], ["#cip-codes", "STEM OPT CIP Code List"], ["#timeline", "Application Timeline"], ["#i983", "I-983 Training Plan"], ["#employer", "Employer Requirements"], ["#unemployment", "Unemployment & Reporting Rules"], ["#after-stem", "What Comes After STEM OPT?"]].map(([href, text]) => (
                        <a key={href} href={href} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ {text}</a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <section id="eligibility" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Who Is Eligible for STEM OPT?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">You must meet ALL of these requirements:</p>
                    <div className="space-y-3">
                        {[
                            { req: "STEM-designated degree", detail: "Your degree must have a CIP code on the DHS STEM Designated Degree Program List. This includes degrees in science, technology, engineering, mathematics, and related fields." },
                            { req: "Currently on post-completion OPT", detail: "You must have a valid EAD card and be in a period of post-completion OPT when you apply." },
                            { req: "Employed by an E-Verify employer", detail: "Your employer must be enrolled in E-Verify. This is non-negotiable — no E-Verify = no STEM OPT." },
                            { req: "Job related to your STEM degree", detail: "Your employment must be directly related to your STEM field of study as listed on your I-20." },
                            { req: "I-983 Training Plan completed", detail: "You and your employer must complete Form I-983 describing how the position provides practical training." },
                            { req: "F-1 status maintained", detail: "You must be in valid F-1 status with no violations (unemployment days within limits, proper reporting, etc.)." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />{item.req}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="cip-codes" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT CIP Codes: Which Degrees Qualify?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">DHS maintains a list of STEM-designated CIP codes. Popular qualifying fields include:</p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Category</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Example Degrees</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">CIP Code Range</th>
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
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{cat}</td><td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{degrees}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-mono text-xs">{cip}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Full list: <a href="https://www.ice.gov/sites/default/files/documents/stem-list.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">DHS STEM Designated Degree Program List (PDF)</a></p>
                </section>

                <section id="timeline" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Application Timeline</h2>
                    <div className="space-y-3">
                        {[
                            { step: "90 days before OPT expires", action: "Begin preparing I-983 with your employer. Request updated I-20 from DSO.", color: "blue" },
                            { step: "60 days before", action: "Submit completed I-983 to your DSO. They review and recommend STEM extension in SEVIS.", color: "indigo" },
                            { step: "File I-765", action: "Submit Form I-765 with required documents. Include your I-20, I-983, employer letter, and filing fee ($410).", color: "purple" },
                            { step: "Before OPT expires", action: "Your application MUST be received by USCIS before your current OPT EAD expires.", color: "amber" },
                            { step: "180-day auto extension", action: "If filed on time, you get automatic 180-day work authorization extension while USCIS processes.", color: "green" },
                            { step: "Approval", action: "New EAD card issued for 24 months. Update your SEVP Portal employer information.", color: "emerald" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 text-xs font-bold">{i + 1}</div>
                                <div className="flex-1 pb-4 border-l-2 border-purple-100 dark:border-zinc-800 pl-4 -ml-[1px]">
                                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">{item.step}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200"><strong>Critical:</strong> If your I-765 is not received before your OPT expires, you will NOT get the 180-day extension. File early.</p>
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
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{col.title}</h3>
                                <ul className="space-y-1">{col.items.map((item, j) => (<li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{item}</li>))}</ul>
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
                            { req: "Evaluation Reports", desc: "Employer must complete a self-evaluation at 12 months (midpoint) and at end of STEM OPT." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.req}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="unemployment" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Unemployment & Reporting Rules</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Rule</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Initial OPT</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">STEM OPT</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Max unemployment days", "90 days", "150 days total (90 + 60)"],
                                    ["Volunteer work counts?", "Yes (20+ hrs/week)", "No — must be paid"],
                                    ["Min hours per week", "20 hours", "20 hours"],
                                    ["Report changes", "Within 10 days", "Within 10 days"],
                                    ["Self-evaluation required", "No", "Yes (at 12 months + end)"],
                                ].map(([rule, initial, stem], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{rule}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{initial}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{stem}</td></tr>
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
                            { path: "H-1B Sponsorship", desc: "The most common next step. Your employer registers you for the H-1B lottery. With STEM OPT, you get up to 3 lottery attempts.", link: "/blog/opt-to-h1b-transition" },
                            { path: "Cap-Exempt H-1B", desc: "Universities, hospitals, and nonprofits can sponsor H-1B visas outside the lottery — no cap restrictions.", link: "/blog/h1b-approval-rates-by-company" },
                            { path: "Green Card Sponsorship", desc: "Some employers sponsor EB-2/EB-3 green cards. This can start while you're on STEM OPT.", link: null },
                            { path: "O-1 Extraordinary Ability", desc: "For those with exceptional achievements in their field. No lottery — approval based on evidence.", link: null },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
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
                        {[
                            { question: "What is STEM OPT?", answer: "STEM OPT is a 24-month extension of Optional Practical Training available to F-1 students who hold a bachelor's, master's, or doctoral degree in a STEM-designated field (as identified by CIP code). It allows you to work in the US for up to 36 months total." },
                            { question: "How long is the STEM OPT extension?", answer: "The STEM OPT extension is 24 months, added to your initial 12-month OPT, for a total of up to 36 months of work authorization." },
                            { question: "Does my employer need to be E-Verify enrolled?", answer: "Yes. E-Verify enrollment is mandatory for STEM OPT employers. Your employer must provide their E-Verify Company Identification Number on Form I-983." },
                            { question: "Can I apply for STEM OPT twice?", answer: "Yes, if you earn a second qualifying STEM degree at a higher level. For example, if you used STEM OPT with a bachelor's degree, you can apply again after earning a master's in a STEM field." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ I-983 Training Plan Guide</Link>
                    <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Unemployment Limit</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your STEM OPT Timeline & Unemployment Days</h2>
                <p className="text-purple-100 mb-6 max-w-lg mx-auto">Join 2,500+ students using TrackMyOPT to manage their STEM OPT deadlines, employer reporting, and unemployment clock.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">Start Tracking Free <ArrowRight className="w-4 h-4" /></Link>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", "headline": "Complete STEM OPT Guide 2026: Extension, Eligibility & Application", "author": { "@type": "Organization", "name": "TrackMyOPT" }, "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } }, "datePublished": "2026-03-10", "dateModified": "2026-03-10", "mainEntityOfPage": "https://www.trackmyopt.com/blog/stem-opt-extension-guide" }) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "What is STEM OPT?", "acceptedAnswer": { "@type": "Answer", "text": "STEM OPT is a 24-month extension of OPT for F-1 students with STEM degrees, allowing up to 36 months total work authorization." } }, { "@type": "Question", "name": "How long is the STEM OPT extension?", "acceptedAnswer": { "@type": "Answer", "text": "24 months, for a total of 36 months with initial OPT." } }, { "@type": "Question", "name": "Does my employer need E-Verify?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. E-Verify enrollment is mandatory for STEM OPT employers." } }, { "@type": "Question", "name": "Can I apply for STEM OPT twice?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, if you earn a second qualifying STEM degree at a higher education level." } }] }) }} />
        </article>
    );
}
