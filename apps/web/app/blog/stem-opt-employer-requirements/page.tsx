import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, Shield, Building2, FileText, XCircle } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "STEM OPT Employer Requirements 2026: E-Verify, I-983 & Compliance Checklist",
    description: "Complete guide to STEM OPT employer requirements in 2026. E-Verify enrollment, Form I-983 obligations, wage rules, reporting deadlines, and a full compliance checklist for employers hiring STEM OPT workers.",
    keywords: ["STEM OPT employer requirements", "E-Verify OPT", "I-983 employer", "STEM OPT compliance", "employer requirements STEM extension"],
    openGraph: {
        title: "STEM OPT Employer Requirements 2026: E-Verify, I-983 & Compliance | TrackMyOPT",
        description: "E-Verify enrollment, I-983 training plan, wage rules, and reporting obligations for STEM OPT employers.",
        url: "https://www.trackmyopt.com/blog/stem-opt-employer-requirements",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "STEM OPT Employer Requirements 2026: E-Verify, I-983 & Compliance Checklist" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/stem-opt-employer-requirements" },
};

export default function STEMOPTEmployerRequirementsArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Stem Opt Employer Requirements", url: "https://www.trackmyopt.com/blog/stem-opt-employer-requirements" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "Does my employer need to be enrolled in E-Verify for STEM OPT?", answer: "Yes. E-Verify enrollment is a non-negotiable requirement for STEM OPT employers. The employer must provide their E-Verify Company Identification Number on Form I-983, and enrollment must remain active throughout the entire STEM OPT period."}, {question: "Who fills out the I-983 form?", answer: "Both the student and the employer. The student fills in personal information (name, SEVIS ID, degree program), while the employer completes sections on company info, E-Verify ID, training objectives, supervision plan, and compensation."}, {question: "What happens if my employer loses E-Verify enrollment?", answer: "If your employer's E-Verify enrollment is terminated after your STEM OPT begins, you have 60 days to find a new E-Verify employer and transfer your STEM OPT. Report the change to your DSO right away."}, {question: "Can I change employers on STEM OPT?", answer: "Yes. You can change employers on STEM OPT, but the new employer must be E-Verify enrolled. Submit a new I-983 within 10 days of starting the new position and report to your DSO within 10 days."}, {question: "How often must employers evaluate STEM OPT employees?", answer: "Employers must complete two formal evaluations: one at the 12-month midpoint and one at the conclusion of the 24-month STEM OPT period."}]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">STEM OPT Employer Requirements</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">STEM OPT</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />9 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    STEM OPT Employer Requirements 2026: E-Verify, I-983 & Compliance Checklist
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your employer plays a critical role in your STEM OPT extension. From E-Verify enrollment to the I-983 training plan and ongoing reporting — here's every requirement your employer must meet.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 12, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    STEM OPT employers must be enrolled in E-Verify, provide a structured training experience documented in a Form I-983, and comply with all labor law protections including paying the actual or prevailing wage. The employer cannot replace or act as a staffing agency for placing students at third-party client sites.
                </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                    STEM OPT employers must be <strong>enrolled in E-Verify</strong>, complete <strong>Form I-983</strong> with the student, pay <strong>commensurate wages</strong>, report material changes within <strong>5 business days</strong>, and submit evaluations at 12 and 24 months. Non-compliance can terminate the student's work authorization.
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">Source: <a href="https://www.ice.gov/sevis/stemopt" target="_blank" rel="noopener noreferrer" className="underline">ICE.gov STEM OPT Hub</a> | <a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.16" target="_blank" rel="noopener noreferrer" className="underline">8 CFR 214.16</a></p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="grid md:grid-cols-2 gap-2">
                    {[["#overview", "What Employers Must Know About STEM OPT"], ["#e-verify", "E-Verify Enrollment: The Non-Negotiable"], ["#i983", "Form I-983: The Training Plan"], ["#reporting", "Employer Reporting Requirements"], ["#wages", "Wage Requirements"], ["#non-compliant", "What If Your Employer Doesn't Meet Requirements?"], ["#consequences", "Consequences of Non-Compliance"], ["#checklist", "Employer Compliance Checklist"], ["#timeline", "Key Employer Deadlines"]].map(([href, text]) => (
                        <a key={href} href={href} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ {text}</a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="overview" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Employers Must Know About STEM OPT</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The 24-month STEM OPT extension (under 8 CFR 214.16) places significant obligations on employers — not just the student. Unlike initial OPT, where the employer has minimal regulatory responsibility, STEM OPT creates a structured training relationship with federal oversight.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        As a STEM OPT student, you need to understand these requirements because <strong>your work authorization depends on your employer's compliance</strong>. If your employer fails to meet any of the following obligations, your STEM OPT could be terminated.
                    </p>
                    <div className="space-y-3">
                        {[
                            { area: "E-Verify Enrollment", desc: "Employer must be an active participant in E-Verify at the time of filing and throughout the STEM OPT period." },
                            { area: "Training Plan (I-983)", desc: "Employer must co-develop and sign a formal training plan describing how the role provides STEM-related practical training." },
                            { area: "Reporting Obligations", desc: "Employer must report material changes within 5 business days and submit evaluations at 12 and 24 months." },
                            { area: "Wage Compliance", desc: "Employer must pay a salary commensurate with what similarly situated U.S. workers earn in the same role and location." },
                            { area: "Supervision & Mentoring", desc: "Employer must provide structured oversight, not merely assign regular work duties." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <Shield className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.area}</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="e-verify" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">E-Verify Enrollment: The Non-Negotiable Requirement</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        E-Verify is a web-based system run by USCIS and the Social Security Administration that allows employers to electronically confirm the employment eligibility of new hires. For STEM OPT, E-Verify enrollment is <strong>mandatory</strong> — there are no exceptions, waivers, or workarounds.
                    </p>
                    <div className="space-y-3 mb-4">
                        {[
                            { question: "How do I check if my employer is E-Verify enrolled?", answer: "Ask your employer's HR department for their E-Verify Company Identification Number (a 4-7 digit number). You can also search at e-verify.gov or use TrackMyOPT's H-1B Sponsor Database which shows E-Verify status for 25,000+ employers." },
                            { question: "What is an E-Verify Company ID Number?", answer: "This is a unique identifier assigned when a company enrolls in E-Verify. It must be listed on your I-983 form. Without it, your DSO cannot process your STEM OPT recommendation." },
                            { question: "What if my employer is not enrolled?", answer: "Your employer can enroll in E-Verify at e-verify.gov — the process typically takes 1-2 weeks. However, if they refuse, you cannot do STEM OPT at that company. You would need to find an E-Verify employer before your initial OPT expires." },
                            { question: "Does every company location need E-Verify?", answer: "The E-Verify enrollment must cover the specific worksite where the STEM OPT student will work. Some companies enroll all locations under one ID; others have separate IDs per site." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.question}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200"><strong>Important:</strong> If your employer loses E-Verify enrollment after your STEM OPT begins, they must notify you immediately. You then have <strong>60 days</strong> to either find a new E-Verify employer or take other action to maintain status.</p>
                    </div>
                </section>

                <section id="i983" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Form I-983: The Training Plan</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The I-983 is the centerpiece of STEM OPT. It transforms the employer-employee relationship from a standard job into a <strong>structured training opportunity</strong>. Both you and your employer must complete and sign it before your DSO can recommend STEM OPT. For a detailed walkthrough of every section, see our <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 underline font-medium">complete I-983 guide</Link>.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" />Employer Sections</h3>
                            <ul className="space-y-1">
                                {["Company legal name, EIN, and address", "E-Verify Company Identification Number", "Detailed training objectives and goals", "Supervision and mentoring plan", "How training relates to the student's STEM degree", "Performance evaluation schedule", "Employer supervisor signature"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Student Sections</h3>
                            <ul className="space-y-1">
                                {["Full legal name and contact info", "SEVIS ID number", "Degree program and CIP code", "Student certification and signature", "Acknowledgment of reporting requirements", "Acknowledgment of employment conditions"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        The training objectives are the most scrutinized section. Avoid generic descriptions like "software development." Instead, be specific: "Developing predictive analytics models using Python, scikit-learn, and AWS SageMaker to forecast customer churn patterns." The more concrete, the better.
                    </p>
                </section>

                <section id="reporting" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Employer Reporting Requirements</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        STEM OPT employers have ongoing reporting obligations that extend throughout the entire 24-month extension period. Missing these deadlines can jeopardize the student's immigration status.
                    </p>
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Obligation</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Deadline</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Details</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Material change report", "Within 5 business days", "Any change to employer name, address, EIN, supervisor, or student's job duties must be reported to DSO"],
                                    ["Student departure/termination", "Within 5 business days", "If the student leaves, is terminated, or the role ends — employer or student must notify DSO immediately"],
                                    ["12-month evaluation", "At the 12-month mark", "Employer completes a self-evaluation documenting the student's training progress and achievements"],
                                    ["Final evaluation", "At end of STEM OPT", "Employer provides a final assessment of training goals. DSO submits to SEVP upon completion"],
                                    ["Annual wage review", "At each evaluation", "Confirm compensation is still commensurate with U.S. workers in the same position and location"],
                                ].map(([obligation, deadline, details], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{obligation}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{deadline}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200"><strong>Validation reports:</strong> SEVP may send validation requests to employers asking them to confirm a STEM OPT student's employment. Failure to respond can result in termination of the student's STEM OPT authorization.</p>
                    </div>
                </section>

                <section id="wages" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Wage Requirements</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        STEM OPT regulations require that the employer pay the student a wage <strong>commensurate with similarly situated U.S. workers</strong>. This prevents employers from using STEM OPT students as cheap labor and protects both the student and American workforce.
                    </p>
                    <div className="space-y-3 mb-4">
                        {[
                            { rule: "Commensurate compensation", detail: "Your salary must be comparable to what U.S. workers in the same metropolitan area earn for similar roles with similar experience. USCIS does not set a specific dollar amount — it is based on market rate." },
                            { rule: "How to verify fair wages", detail: "Check the Department of Labor's Online Wage Library (OWL) at flcdatacenter.com or use H-1B wage data from the LCA database. TrackMyOPT's H-1B Sponsor Database also shows median salaries by company and role." },
                            { rule: "Unpaid STEM OPT is generally prohibited", detail: "Unlike initial OPT where unpaid internships or volunteer work may count as employment, STEM OPT must be paid employment. The only narrow exception is bona fide volunteer work at nonprofits, but this does not count as STEM OPT employment." },
                            { rule: "Part-time minimum", detail: "You must work at least 20 hours per week. Compensation must still be commensurate on a pro-rata basis for part-time positions." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.rule}</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="non-compliant" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What If Your Employer Doesn't Meet Requirements?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you discover your employer cannot meet STEM OPT requirements — whether they lack E-Verify, refuse to complete the I-983, or pay below-market wages — you have options. But time is critical.
                    </p>
                    <div className="space-y-3">
                        {[
                            { option: "Find a new E-Verify employer", desc: "You can change employers on STEM OPT. The new employer must be E-Verify enrolled, and you must submit a new I-983 within 10 days of starting the new position. There is no gap in work authorization during the transfer if done correctly.", timeline: "Report to DSO within 10 days" },
                            { option: "Ask your employer to enroll in E-Verify", desc: "E-Verify enrollment is free and takes about 1-2 weeks. Some employers are willing to enroll if they understand the process. Provide them the enrollment link: e-verify.gov/employers/enrolling-in-e-verify.", timeline: "1-2 weeks for enrollment" },
                            { option: "Use the unemployment clock strategically", desc: "On STEM OPT, you have up to 150 total unemployment days (90 initial + 60 STEM extension). Use this window to search for a compliant employer, but don't wait until the limit is near.", timeline: "Track days carefully" },
                            { option: "Consider H-1B cap-gap or other status options", desc: "If you're approaching your STEM OPT expiration and employer issues persist, explore H-1B sponsorship, change of status, or other visa pathways before your authorization ends.", timeline: "Consult an attorney early" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ArrowRight className="w-4 h-4 text-purple-500" />{item.option}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">Timeline: {item.timeline}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="consequences" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Consequences of Employer Non-Compliance</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        When an employer fails to meet STEM OPT requirements, the consequences affect both the student and the company. Understanding these risks can motivate reluctant employers to take compliance seriously.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <h3 className="font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2"><XCircle className="w-4 h-4" />Impact on Students</h3>
                            <ul className="space-y-1">
                                {["STEM OPT work authorization can be terminated", "Unemployment clock begins ticking immediately", "Must find new compliant employer within 60 days", "Risk of accruing unlawful presence if no resolution", "May lose eligibility for future immigration benefits"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200"><span className="mt-0.5">•</span>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Impact on Employers</h3>
                            <ul className="space-y-1">
                                {["SEVP may flag the company for future audits", "Loss of ability to hire STEM OPT students", "E-Verify enrollment may be reviewed or terminated", "Potential DOL investigation for wage violations", "Reputational risk with international student community"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200"><span className="mt-0.5">•</span>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="checklist" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">STEM OPT Employer Compliance Checklist</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Use this checklist to verify your employer meets every STEM OPT requirement. Share it with your HR department or hiring manager.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700 w-8">#</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Requirement</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Category</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Priority</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["1", "Employer is actively enrolled in E-Verify", "E-Verify", "Required"],
                                    ["2", "E-Verify Company ID Number is available for I-983", "E-Verify", "Required"],
                                    ["3", "Form I-983 completed with specific training objectives", "Training Plan", "Required"],
                                    ["4", "Employer supervisor has signed I-983", "Training Plan", "Required"],
                                    ["5", "Compensation is commensurate with U.S. workers (DOL data)", "Wages", "Required"],
                                    ["6", "Position is at least 20 hours per week", "Employment", "Required"],
                                    ["7", "Employer will report material changes within 5 business days", "Reporting", "Required"],
                                    ["8", "12-month evaluation scheduled and assigned to supervisor", "Reporting", "Required"],
                                    ["9", "Final evaluation planned for end of STEM OPT period", "Reporting", "Required"],
                                    ["10", "Employer will respond to SEVP validation requests", "Compliance", "Required"],
                                ].map(([num, req, category, priority], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-500 dark:text-gray-400 font-mono">{num}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-900 dark:text-white font-medium">{req}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{category}</td>
                                        <td className="p-3 border dark:border-zinc-700"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">{priority}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="timeline" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Key Employer Deadlines at a Glance</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Stay on top of these critical deadlines. Missing even one can jeopardize the student's STEM OPT status.
                    </p>
                    <div className="space-y-3">
                        {[
                            { step: "Before filing STEM OPT", action: "Employer confirms E-Verify enrollment, provides Company ID, and completes I-983 training plan sections with the student.", color: "purple" },
                            { step: "Within 10 days of changes", action: "Report any material changes (job title, location, supervisor, duties, compensation) to the student's DSO. Submit a modified I-983 if needed.", color: "blue" },
                            { step: "Within 5 business days of departure", action: "If the student is terminated, laid off, or leaves the company, notify the student and DSO immediately.", color: "amber" },
                            { step: "At the 12-month mark", action: "Complete the midpoint evaluation assessing the student's progress against I-983 training goals. Student submits evaluation to DSO.", color: "indigo" },
                            { step: "At the 24-month mark", action: "Complete the final evaluation. DSO submits to SEVP. Discuss next steps (H-1B, new position, etc.) with the student.", color: "green" },
                            { step: "When SEVP requests validation", action: "Respond promptly to any validation inquiries from SEVP confirming the student's employment. Non-response can terminate authorization.", color: "red" },
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
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Does my employer need to be enrolled in E-Verify for STEM OPT?", answer: "Yes. E-Verify enrollment is a non-negotiable requirement for STEM OPT employers. The employer must provide their E-Verify Company Identification Number on Form I-983, and enrollment must remain active throughout the entire STEM OPT period. If your employer is not enrolled, they can sign up at e-verify.gov — the process takes about 1-2 weeks." },
                            { question: "Who fills out the I-983 form?", answer: "Both the student and the employer. The student fills in personal information (name, SEVIS ID, degree program), while the employer completes sections on company info, E-Verify ID, training objectives, supervision plan, and compensation. Both parties must sign the form before submitting it to the DSO." },
                            { question: "What happens if my employer loses E-Verify enrollment?", answer: "If your employer's E-Verify enrollment is terminated after your STEM OPT begins, you have 60 days to find a new E-Verify employer and transfer your STEM OPT. Your employer is required to notify you immediately. Report the change to your DSO right away." },
                            { question: "Can I change employers on STEM OPT?", answer: "Yes. You can change employers on STEM OPT, but the new employer must also be enrolled in E-Verify. You need to submit a new I-983 with the new employer within 10 days of starting the new position. Report the change to your DSO within 10 days as well. There is no separate USCIS filing required — the transfer happens through your DSO and SEVIS." },
                            { question: "How often must employers evaluate STEM OPT employees?", answer: "Employers must complete two formal evaluations: one at the 12-month midpoint and one at the conclusion of the 24-month STEM OPT period. These evaluations assess training progress against the goals outlined in the I-983. The DSO submits these evaluations to SEVP. Missing evaluations can trigger compliance issues." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Complete STEM OPT Extension Guide</Link>
                    <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ I-983 Training Plan Guide</Link>
                    <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Unemployment Limit Explained</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Find E-Verify Employers for STEM OPT</h2>
                <p className="text-purple-100 mb-6 max-w-lg mx-auto">Search our database of 25,000+ employers with E-Verify status, H-1B approval rates, and salary data — all free.</p>
                <Link href="/features/sponsors" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                    Search Employers <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
