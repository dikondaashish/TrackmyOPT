import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle, Download, ShieldCheck, BookOpen } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Form I-983 Complete Guide: STEM OPT Training Plan Explained (2026)",
    description: "Everything you need to know about Form I-983 Training Plan for STEM OPT Students — what it is, how to complete each section, employer obligations, reporting requirements, and what happens if your training plan changes.",
    keywords: ["form I-983", "I-983 form guide", "STEM OPT training plan", "I-983 how to fill", "STEM OPT employer obligations", "I-983 E-Verify requirement", "STEM OPT compliance 2026", "form I-983 self-employment"],
    openGraph: {
        title: "Form I-983 Complete Guide: STEM OPT Training Plan 2026 | TrackMyOPT",
        description: "The definitive guide to Form I-983 for STEM OPT students and employers — including all sections, reporting requirements, and compliance tips.",
        url: "https://www.trackmyopt.com/blog/form-i983-stem-opt-training-plan-guide",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/blog/form-i983.png", width: 1200, height: 630, alt: "Form I-983 STEM OPT Training Plan on a desk with laptop and EAD card" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/form-i983-stem-opt-training-plan-guide" },
};

export default function FormI983GuidePage() {
    const faqItems = [
        { question: "What is Form I-983?", answer: "Form I-983 is the Training Plan for STEM OPT Students, required by the DHS regulations (8 CFR § 214.2(f)(10)(ii)(C)) for all F-1 students seeking a 24-month STEM OPT extension. It is a detailed plan documenting the student's training goals, learning objectives, and how the employer will provide practical training related to the student's STEM degree." },
        { question: "Who must sign Form I-983?", answer: "Both the student AND the employer must sign Form I-983. Specifically, a company official with knowledge of the student's training — typically the hiring manager, supervisor, or a senior HR official — must sign on behalf of the employer. Neither the DSO nor an immigration attorney can sign in place of the student or employer." },
        { question: "Does the employer need to be E-Verify enrolled to sign an I-983?", answer: "Yes. Under STEM OPT regulations, the sponsoring employer MUST be enrolled in E-Verify for the location where the student will work. This is a non-negotiable requirement. An employer who is not E-Verify enrolled cannot legally support a STEM OPT student, regardless of whether they sign the I-983." },
        { question: "Can a student be self-employed on STEM OPT with Form I-983?", answer: "No. Unlike standard OPT which allows self-employment, STEM OPT explicitly prohibits self-employment. A student cannot be their own employer for STEM OPT purposes. The regulations require a bona fide employer-employee relationship, which means the employer must have the ability to hire, fire, pay, and supervise the student." },
        { question: "How often must the I-983 training plan be updated?", answer: "The I-983 must be updated whenever there are 'material changes' to the training plan — such as a change in employer, change in job duties, change in location, or changes to goals. Additionally, students are required to submit a self-evaluation (Part 6) every 12 months and at the end of the STEM OPT period." },
        { question: "What is the difference between Section 5 and Section 6 of Form I-983?", answer: "Section 5 is the employer evaluation — completed by the supervisor or employer to assess the student's progress and performance against the training plan goals. Section 6 is the student self-evaluation — completed by the student themselves. Both must be submitted to the DSO (Designated School Official) every 12 months." },
        { question: "Does the I-983 need to be submitted to USCIS?", answer: "No. Form I-983 is not directly submitted to USCIS. Instead, it is submitted to your DSO (Designated School Official) at your university, who reviews it and uses it to recommend your STEM OPT extension in SEVIS. However, USCIS and ICE can request to audit the I-983 at any time, so all copies must be retained." },
    ];

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Form I-983 STEM OPT Training Plan Guide", url: "https://www.trackmyopt.com/blog/form-i983-stem-opt-training-plan-guide" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-02-25"
                modifiedDate="2026-02-25"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Form I-983 Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">STEM OPT</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />14 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Form I-983: The Complete STEM OPT Training Plan Guide (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Form I-983 is the most misunderstood document in the entire STEM OPT process — yet it is the foundation of your 24-month extension. This guide walks you and your employer through every section, every reporting requirement, and every compliance rule you need to know.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: February 25, 2026 • Written by Vinay Kumar</div>
            </header>

            <img
                src="/blog/form-i983.png"
                alt="Form I-983 STEM OPT Training Plan for STEM OPT Students on a desk with a laptop and EAD card"
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
            />
            <figcaption className="mt-3 mb-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Form I-983 must be completed by both the STEM OPT student and their employer before the STEM OPT extension is approved.
            </figcaption>

            {/* TL;DR */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Form I-983 is a detailed training plan that both you (the student) and your employer must complete and sign before you can get a STEM OPT extension. The employer MUST be E-Verify enrolled. Self-employment is prohibited. You must update the plan when your role changes and submit evaluations to your DSO every 12 months. Keep all copies — ICE can audit them at any time.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Table of Contents
                </h2>
                <ol className="space-y-2 text-sm text-green-600 dark:text-green-400">
                    <li><a href="#what-is-i983" className="hover:underline">1. What Is Form I-983?</a></li>
                    <li><a href="#who-needs-it" className="hover:underline">2. Who Needs Form I-983?</a></li>
                    <li><a href="#e-verify" className="hover:underline">3. The E-Verify Requirement for STEM OPT Employers</a></li>
                    <li><a href="#sections-explained" className="hover:underline">4. All 6 Parts of Form I-983 Explained</a></li>
                    <li><a href="#how-to-fill" className="hover:underline">5. How to Fill Out Form I-983 Step by Step</a></li>
                    <li><a href="#reporting" className="hover:underline">6. Ongoing Reporting Requirements (12-Month Evaluations)</a></li>
                    <li><a href="#material-changes" className="hover:underline">7. What Counts as a Material Change (and What to Do)</a></li>
                    <li><a href="#no-self-employment" className="hover:underline">8. Why Self-Employment Is Prohibited on STEM OPT</a></li>
                    <li><a href="#site-visits" className="hover:underline">9. ICE Compliance Inspections & Site Visits</a></li>
                    <li><a href="#faq" className="hover:underline">10. Frequently Asked Questions</a></li>
                </ol>
            </div>

            {/* Section 1 */}
            <section id="what-is-i983" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">1. What Is Form I-983?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Form I-983, <strong>Training Plan for STEM OPT Students</strong>, is a DHS-required document that establishes a formal training agreement between an F-1 student seeking a STEM OPT extension and their US employer. It was created under the final STEM OPT regulations published in <a href="https://www.govinfo.gov/content/pkg/FR-2016-03-11/pdf/2016-04828.pdf" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">80 FR 63376 (March 11, 2016)</a> and is governed by <strong>8 CFR § 214.2(f)(10)(ii)(C)</strong>.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Unlike the I-9 (which verifies work eligibility) or the I-765 (which is the actual work permit application), the I-983 is a <em>training document</em>. It defines:
                </p>
                <ul className="space-y-2 mb-6 text-gray-700 dark:text-gray-300">
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span><strong>What practical training you will receive</strong> — specific learning goals and skills to be developed</span></li>
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span><strong>How the training relates to your STEM degree</strong> — demonstrating a direct connection between your major and your job duties</span></li>
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span><strong>How progress will be measured</strong> — through formal 12-month evaluations from both the student and employer</span></li>
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span><strong>Employer confirmation of E-Verify enrollment</strong> — the foundational compliance requirement</span></li>
                </ul>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <BookOpen className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800 dark:text-green-300">The I-983 is NOT a contract between you and your employer. It is a federal regulatory document. Misrepresentations on the I-983 — by either the student or the employer — can constitute immigration fraud under 18 U.S.C. § 1546.</p>
                    </div>
                </div>
            </section>

            {/* Section 2 */}
            <section id="who-needs-it" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">2. Who Needs Form I-983?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Form I-983 is required for every F-1 student applying for the 24-month STEM OPT extension, without exception. Both the student AND the employer are required to participate.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-xl p-5">
                        <h3 className="font-bold text-green-800 dark:text-green-300 mb-3">Student Must:</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /><span>Have a STEM degree that qualifies under the DHS STEM designated degree list</span></li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /><span>Be on their initial 12-month OPT (not yet expired)</span></li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /><span>Complete Parts 1 and 6 of the I-983</span></li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /><span>Certify the accuracy of the training plan by signing the form</span></li>
                        </ul>
                    </div>
                    <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5">
                        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Employer Must:</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /><span>Be actively enrolled in the E-Verify program</span></li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /><span>Complete Parts 2, 3, 4, and 5 of the I-983</span></li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /><span>Have the authority to hire, fire, pay, and supervise the student</span></li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /><span>Sign by an authorized company official (not HR third-party)</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 3 */}
            <section id="e-verify" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">3. The E-Verify Requirement for STEM OPT Employers</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    This is the single most common reason STEM OPT extensions are denied: <strong>the employer is not enrolled in E-Verify</strong>. Under 8 CFR § 214.2(f)(10)(ii)(C)(3), the employer must be enrolled in E-Verify at the specific worksite location where the student will work.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 mb-6">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-800 dark:text-red-300 mb-1">Critical Warning</p>
                            <p className="text-sm text-red-700 dark:text-red-400">A company that uses a third-party staffing or PEO (Professional Employer Organization) is usually NOT E-Verify enrolled for your worksite. The company where you physically work every day must be E-Verify enrolled — not the staffing agency. This is a very common trap for international students working through consulting firms.</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">To verify if your employer is enrolled in E-Verify:</p>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4">
                        <li>• Ask your employer&apos;s HR department for their E-Verify Company ID number and the specific site (worksite location) that is enrolled</li>
                        <li>• Employers can check their enrollment status at <a href="https://www.e-verify.gov/employers" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">e-verify.gov/employers</a></li>
                        <li>• The employer must enter their E-Verify Company ID number on Part 3, Item 5 of Form I-983</li>
                    </ul>
                </div>
            </section>

            {/* Section 4 */}
            <section id="sections-explained" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">4. All 6 Parts of Form I-983 Explained</h2>
                <div className="space-y-4">
                    {[
                        { part: "Part 1", title: "Student Information", who: "Student", desc: "Your full name, SEVIS number, degree (major and level), the school you attended, your training position title, and the full address of your employer. This section is completely filled out by the student." },
                        { part: "Part 2", title: "Employer Information", who: "Employer", desc: "Employer legal name, FEIN (Federal Employer Identification Number), business address, E-Verify Company ID, point of contact name and title, and phone number. The employer fills this out." },
                        { part: "Part 3", title: "Training Objectives & Goals", who: "Employer + Student", desc: "The most detailed section. Lists specific, measurable learning goals and training activities the student will engage in during the STEM OPT period. Goals must be directly tied to the student's STEM major. Vague goals like 'gain work experience' are not acceptable. Write specific objectives like 'Develop proficiency in machine learning model deployment using Python and TensorFlow.'" },
                        { part: "Part 4", title: "Compensation & Hours", who: "Employer", desc: "The salary or hourly rate, number of hours per week, and a certification that the student will be compensated at the same rate as similarly situated US workers. Unpaid internships are NOT permitted for STEM OPT." },
                        { part: "Part 5", title: "Employer Performance Evaluation", who: "Employer (submitted every 12 months)", desc: "A structured evaluation where the supervising employer assesses the student's progress against the learning objectives set in Part 3. Must be completed and submitted to the DSO at the 12-month mark and at the end of the STEM OPT period." },
                        { part: "Part 6", title: "Student Self-Evaluation", who: "Student (submitted every 12 months)", desc: "A self-assessment where the student reflects on their own progress against the training objectives. Also submitted to the DSO at the 12-month mark and at the end of STEM OPT. Deliberately falsifying these evaluations is a violation of federal immigration law." },
                    ].map((item) => (
                        <div key={item.part} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-6">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">{item.part}</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed by: {item.who}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 5 */}
            <section id="how-to-fill" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">5. How to Fill Out Form I-983: Step-by-Step for Students</h2>
                <div className="space-y-4">
                    {[
                        { step: "01", title: "Download the current I-983 form", desc: "Download from ICE.gov or your university's international student office. The current version has OMB No. 1653-0054 at the top." },
                        { step: "02", title: "You complete Part 1 first", desc: "Fill in your SEVIS number (starts with N), your full legal name, your STEM degree (be specific — 'Computer Science, Master of Science' not just 'CS'), and the employer's details." },
                        { step: "03", title: "Send to your employer to complete Parts 2, 3, and 4", desc: "Email the partially-completed form to your HR contact or direct supervisor. Give them at least 2 weeks — many employers need time to look up their E-Verify Company ID and draft appropriate training objectives." },
                        { step: "04", title: "Review Parts 3 carefully", desc: "Before signing, ensure Part 3 goals are specific, measurable, and directly tied to your STEM major. If they are too vague, your DSO may reject the form and ask for revisions." },
                        { step: "05", title: "Both student and employer sign", desc: "The student signs Section 6 initially (self-certification that the plan is accurate). The employer's authorized representative signs at the end of Part 4. Make sure the company title of the signer is included." },
                        { step: "06", title: "Submit completed I-983 to your DSO", desc: "Your DSO reviews the form and, if approved, recommends your STEM OPT extension in SEVIS and issues you a new I-20. Do not submit the I-983 directly to USCIS." },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 6 */}
            <section id="reporting" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">6. Ongoing Reporting Requirements (12-Month Evaluations)</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    The I-983 is not a one-time form. Under 8 CFR § 214.2(f)(10)(ii)(C)(10), students and employers must submit evaluations throughout the STEM OPT period:
                </p>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Timeframe</th>
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Action Required</th>
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Who Submits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Before STEM OPT begins</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Complete and sign I-983 (Parts 1–4)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Student + Employer → DSO</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">At 12-month mark</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-zinc700 text-gray-700 dark:text-gray-300">Employer evaluation (Part 5) + Student self-evaluation (Part 6)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Both → DSO within 10 days</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">At end of STEM OPT (24 months)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Final employer evaluation (Part 5) + Final student self-evaluation (Part 6)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Both → DSO within 10 days</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">When employment ends early</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Report to DSO within 5 business days of separation</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Student → DSO</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 7 */}
            <section id="material-changes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">7. What Counts as a &quot;Material Change&quot; to Your Training Plan</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    If there is a &quot;material change&quot; to your training plan, you must submit a new or updated I-983 to your DSO as soon as possible. Material changes include:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {[
                        "Changing employers entirely (even within the same company group)",
                        "Significant change in job duties or position title",
                        "Change in primary worksite location to a new address",
                        "Change in training goals or learning objectives",
                        "Reduction in salary or hours below the amount stated in Part 4",
                        "Change in the employer's E-Verify enrollment status",
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800 dark:text-green-300">When you change employers on STEM OPT, the timeline is critical: you have a <strong>10-day unemployment grace period</strong>. You must have a new I-983 signed with the new employer AND get a new I-20 from your DSO before beginning work with the new employer.</p>
                    </div>
                </div>
            </section>

            {/* Section 8 */}
            <section id="no-self-employment" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">8. Why Self-Employment Is Prohibited on STEM OPT</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    This surprises many students: unlike standard OPT, where you can be self-employed working for your own startup, <strong>STEM OPT explicitly requires a bona fide employer-employee relationship</strong>.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    The regulation at 8 CFR § 214.2(f)(10)(ii)(C)(3) states that the employer must:
                </p>
                <ul className="space-y-2 mb-6 text-gray-700 dark:text-gray-300">
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /><span>Have the legal authority to hire and fire you</span></li>
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /><span>Pay you wages directly</span></li>
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /><span>Supervise your work on a day-to-day basis</span></li>
                    <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /><span>Be actively enrolled in E-Verify at the worksite</span></li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    A student who is the sole owner of a company cannot supervise themselves or fire themselves — so they fail the employer-employee test. However, <strong>the workaround used by many startup founders</strong> is to establish a formal Board of Directors that holds authority over the student-employee. Read our full guide on <Link href="/blog/start-company-f1-stem-opt" className="text-green-600 dark:text-green-400 hover:underline">starting a company on STEM OPT</Link> for details.
                </p>
            </section>

            {/* Section 9 */}
            <section id="site-visits" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">9. ICE Compliance Inspections & Site Visits</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    ICE&apos;s Student and Exchange Visitor Program (SEVP) and Homeland Security Investigations (HSI) have the authority to conduct unannounced site inspections at your employer&apos;s worksite to verify that your training plan is real and being executed. During a site visit, they may:
                </p>
                <div className="space-y-3 mb-6">
                    {[
                        "Request to see your signed Form I-983 and your most recent evaluation forms",
                        "Interview your supervisor to verify the training plan activities",
                        "Verify that the employer is currently enrolled in E-Verify at the correct worksite",
                        "Confirm you are being paid at the stated salary rate and working the stated hours",
                        "Request copies of your timesheets, pay stubs, and performance reviews",
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Both students and employers should maintain organized records for the entire duration of STEM OPT. SEVP regulations require these documents to be retained for 3 years after the training has ended.
                </p>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions About Form I-983</h2>
                <div className="space-y-6">
                    {faqItems.map((item, i) => (
                        <div key={i} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.question}</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <AuthorBio />

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-3">Stay on Top of Your STEM OPT Compliance</h2>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                    TrackMyOPT automatically tracks your STEM OPT evaluation deadlines, employer change notifications, and 12-month reporting windows so you never miss a compliance requirement.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors">
                    Track My STEM OPT Compliance <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Sources */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-green-600" />
                    Official Resources & Sources
                </h3>
                <ul className="space-y-2 text-sm">
                    <li><a href="https://www.ice.gov/sites/default/files/documents/Document/2016/I-983.pdf" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">ICE — Download Form I-983 (Training Plan for STEM OPT Students)</a></li>
                    <li><a href="https://www.ice.gov/sevis/stem-opt" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">ICE SEVIS — STEM OPT Hub (Regulations & Guidance)</a></li>
                    <li><a href="https://www.e-verify.gov/employers/enrolling-in-e-verify" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">E-Verify — Employer Enrollment (Check or Register)</a></li>
                    <li><a href="https://www.govinfo.gov/content/pkg/CFR-2022-title8-vol1/pdf/CFR-2022-title8-vol1-sec214-2.pdf" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">8 CFR § 214.2(f) — STEM OPT Regulations (Full Text)</a></li>
                </ul>
            </div>
        </article>
    );
}
