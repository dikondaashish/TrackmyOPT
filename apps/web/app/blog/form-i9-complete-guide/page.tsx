import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle, Download, ShieldCheck, XCircle } from "lucide-react";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getRelatedPostsForSlug } from "@/lib/blog/related-posts";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Form I-9 Complete Guide: What It Is, Who Needs It & How to Fill It Out (2026)",
    description: "Everything you need to know about Form I-9 Employment Eligibility Verification — who fills it out, what documents are accepted, deadlines, employer obligations, and how OPT/STEM OPT students complete it.",
    keywords: ["form I-9", "I-9 form guide", "employment eligibility verification", "I-9 for OPT students", "I-9 documents list", "I-9 employer requirements", "what is I-9 form", "I-9 F-1 visa"],
    openGraph: {
        title: "Form I-9 Complete Guide 2026 | TrackMyOPT",
        description: "The definitive guide to Form I-9 for international students on OPT, STEM OPT, and F-1 visas.",
        url: "https://www.trackmyopt.com/blog/form-i9-complete-guide",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/blog/form-i9.png", width: 1200, height: 630, alt: "Form I-9 Employment Eligibility Verification on a corporate desk" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/form-i9-complete-guide" },
    twitter: {
        card: "summary_large_image",
        title: "Form I-9 Complete Guide 2026 | TrackMyOPT",
        description: "The definitive guide to Form I-9 for international students on OPT, STEM OPT, and F-1 visas.",
        images: ["https://www.trackmyopt.com/blog/form-i9.png"],
    },
};

export default function FormI9GuidePage() {
    const faqItems = [
        { question: "What is Form I-9?", answer: "Form I-9 is the Employment Eligibility Verification form issued by USCIS. Every employer in the United States must complete it for every employee they hire to verify the employee's identity and legal authorization to work in the US." },
        { question: "Do F-1 OPT students need to fill out Form I-9?", answer: "Yes. Every F-1 student starting a new job in the US — whether on Pre-OPT, Post-OPT, or STEM OPT — must complete Form I-9 with their employer within 3 business days of their start date." },
        { question: "What documents can an OPT student use for Form I-9?", answer: "OPT students typically use their foreign passport (List A, if it has a valid visa stamp) combined with their EAD card (I-766). Alternatively, they can use their passport with an I-94 arrival record and F-1 visa stamp as a combination of List A documents." },
        { question: "How long does an employer keep Form I-9?", answer: "Employers must retain the completed I-9 for either 3 years after the date of hire or 1 year after the date employment ends, whichever is later." },
        { question: "What happens if I-9 is not completed on time?", answer: "If Section 1 is not completed by the first day of work, or if Section 2 is not completed within 3 business days of the start date, the employer is in violation of federal law and could face fines ranging from $272 to $2,701 per violation." },
        { question: "Can a remote employee complete Form I-9 remotely?", answer: "Yes. As of August 2023, USCIS allows employers enrolled in E-Verify to conduct remote I-9 document verification through the E-Verify identity document examination alternative (IDEx), which replaces in-person physical examination for remote hires." },
        { question: "What is the difference between List A, List B, and List C documents for I-9?", answer: "List A documents establish both identity AND employment authorization (e.g., US Passport, EAD card). List B documents establish identity only (e.g., driver's license). List C documents establish employment authorization only (e.g., Social Security card). An employee can present one List A document OR one List B + one List C document." },
    ];

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Form I-9 Complete Guide", url: "https://www.trackmyopt.com/blog/form-i9-complete-guide" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-02-23"
                modifiedDate="2026-02-23"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Form I-9 Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">Immigration Forms</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />10 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Form I-9: The Complete 2026 Guide for Employees & Employers
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Whether you are a first-time employee, an HR manager, or an international student on OPT, this guide explains everything about Form I-9 — what it is, who fills it out, which documents to use, and how to stay compliant.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: February 23, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-12 shadow-lg border border-gray-200 dark:border-zinc-800">
                <BlogPostImage src="/blog/form-i9.png" alt="Form I-9 Employment Eligibility Verification on a corporate desk with a US passport" className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
            <figcaption className="mt-3 mb-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Form I-9 must be completed by every new employee at every US employer, including OPT and STEM OPT students.
            </figcaption>

            {/* TL;DR */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Form I-9 is a federally-mandated form that every US employer must complete for every new hire. It verifies the employee&apos;s identity and work authorization. For OPT students, your EAD card (Form I-766) + passport is the standard combination. It must be completed within 3 business days of starting work.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Table of Contents
                </h2>
                <ol className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                    <li><a href="#what-is-i9" className="hover:underline">1. What Is Form I-9?</a></li>
                    <li><a href="#who-needs-it" className="hover:underline">2. Who Needs to Complete Form I-9?</a></li>
                    <li><a href="#sections" className="hover:underline">3. The Three Sections Explained</a></li>
                    <li><a href="#documents" className="hover:underline">4. Acceptable Documents (Lists A, B, and C)</a></li>
                    <li><a href="#opt-students" className="hover:underline">5. Form I-9 for OPT & STEM OPT Students</a></li>
                    <li><a href="#deadlines" className="hover:underline">6. Deadlines & Retention Requirements</a></li>
                    <li><a href="#remote" className="hover:underline">7. Remote I-9 Verification (2023 Rule)</a></li>
                    <li><a href="#mistakes" className="hover:underline">8. Common Mistakes & How to Fix Them</a></li>
                    <li><a href="#faq" className="hover:underline">9. Frequently Asked Questions</a></li>
                </ol>
            </div>

            {/* Section 1 */}
            <section id="what-is-i9" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">1. What Is Form I-9?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Form I-9, officially called the <strong>Employment Eligibility Verification</strong> form, is a document created by the <a href="https://www.uscis.gov/i-9" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">U.S. Citizenship and Immigration Services (USCIS)</a>. It is mandated under the <strong>Immigration Reform and Control Act of 1986 (IRCA)</strong> and enforced by the Department of Homeland Security (DHS) and the Department of Justice (DOJ).
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Every employer in the United States — private companies, nonprofits, government agencies, and universities — must use Form I-9 to verify that <strong>every person they hire for pay after November 6, 1986</strong> is legally authorized to work in the United States.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5 mb-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Important</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">The I-9 is NOT submitted to USCIS or the government. It is kept on file by the employer and must be available for inspection by Immigration and Customs Enforcement (ICE), the Department of Labor (DOL), or the Office of Special Counsel (OSC) upon request.</p>
                        </div>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    The form was most recently revised in <strong>August 2023</strong>, and the current edition has edition date <strong>08/01/23</strong> (found in the bottom-left corner of the form). As of May 1, 2020, employers must use only the current edition — older versions are not accepted.
                </p>
            </section>

            {/* Section 2 */}
            <section id="who-needs-it" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">2. Who Needs to Complete Form I-9?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    All US-based employees (full-time, part-time, and temporary) hired after November 6, 1986 must complete Form I-9. This includes:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                        { title: "US Citizens", desc: "All US citizens, regardless of immigration history" },
                        { title: "Permanent Residents (Green Card)", desc: "All lawful permanent residents (LPRs)" },
                        { title: "F-1 OPT Students", desc: "Students on Post-Completion OPT using an EAD card" },
                        { title: "F-1 STEM OPT Students", desc: "Students on STEM OPT extension — both initial and re-verification" },
                        { title: "H-1B, L-1, O-1 Workers", desc: "All nonimmigrant visa holders authorized to work" },
                        { title: "J-1 Exchange Visitors", desc: "J-1 scholars and researchers with work authorization" },
                    ].map((item) => (
                        <div key={item.title} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>Exemptions:</strong> Independent contractors and volunteers who receive no pay are generally not subject to I-9 requirements. However, if an employer treats a contractor as an employee, I-9 is required.
                </p>
            </section>

            {/* Section 3 */}
            <section id="sections" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">3. The Three Sections of Form I-9 Explained</h2>
                <div className="space-y-6">
                    <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3">Section 1: Employee Information and Attestation</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3"><strong>Completed by:</strong> The employee. <strong>Deadline:</strong> Must be completed on or before the first day of work (Day 1).</p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">Section 1 asks for your legal name, address, date of birth, Social Security Number (SSN), email address, phone number, and your employment eligibility status. You must check one of four boxes:</p>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-4">
                            <li>• <strong>U.S. Citizen</strong></li>
                            <li>• <strong>Noncitizen National of the United States</strong></li>
                            <li>• <strong>Lawful Permanent Resident</strong> (enter your A-Number or USCIS number)</li>
                            <li>• <strong>Noncitizen authorized to work until [date]</strong> — this is the option for F-1 OPT students. Enter your EAD expiration date and your USCIS number (from your EAD card).</li>
                        </ul>
                    </div>

                    <div className="border border-green-200 dark:border-green-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">Section 2: Employer Review and Verification</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3"><strong>Completed by:</strong> The employer or their authorized representative. <strong>Deadline:</strong> Within 3 business days of the employee&apos;s first day of work.</p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">The employer physically examines the original documents the employee presents. The employer records the document title, issuing authority, document number, and expiration date in Section 2. The employer then signs and dates the form, attesting that the documents appeared genuine and related to the employee.</p>
                    </div>

                    <div className="border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-3">Section 3: Reverification and Rehires</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3"><strong>Completed by:</strong> The employer. <strong>Used when:</strong> An employee&apos;s work authorization expires (e.g., EAD renewal) or when rehiring a former employee within 3 years.</p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">For OPT students, this is critical: when you get a STEM OPT extension and receive a new EAD card, your employer must complete Section 3 to reverify your continued employment authorization using the new EAD&apos;s details and expiration date.</p>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section id="documents" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">4. Acceptable Documents: Lists A, B, and C</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Employees must present <strong>original, unexpired</strong> documents. They may choose to present either <strong>one List A document</strong> OR <strong>one List B + one List C document</strong>.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                        <h3 className="text-base font-bold text-blue-800 dark:text-blue-300 mb-3">List A — Identity + Work Auth</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>• U.S. Passport or Passport Card</li>
                            <li>• Permanent Resident Card (Form I-551 / Green Card)</li>
                            <li>• <strong>EAD Card (Form I-766)</strong> ← OPT students use this</li>
                            <li>• Foreign Passport with I-94 + endorsement</li>
                            <li>• Passport from a Federated State of Micronesia or the Marshall Islands with I-94</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                        <h3 className="text-base font-bold text-green-800 dark:text-green-300 mb-3">List B — Identity Only</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>• State driver&apos;s license</li>
                            <li>• ID card issued by state/local government</li>
                            <li>• School ID with photo</li>
                            <li>• Voter registration card</li>
                            <li>• US Military Card or draft record</li>
                            <li>• Native American tribal document</li>
                        </ul>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
                        <h3 className="text-base font-bold text-purple-800 dark:text-purple-300 mb-3">List C — Work Auth Only</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>• Social Security Account Number card</li>
                            <li>• Certification of Birth Abroad (FS-545)</li>
                            <li>• Certification of Report of Birth (DS-1350)</li>
                            <li>• Original or certified copy of US birth certificate</li>
                            <li>• Native American tribal document</li>
                            <li>• US Citizen ID Card (I-197)</li>
                        </ul>
                    </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">Employers <strong>cannot</strong> specify which documents an employee must present, as long as the documents are on the accepted list. Requiring specific documents (e.g., demanding a green card from a non-citizen) is discriminatory and violates federal law (8 U.S.C. § 1324b).</p>
                    </div>
                </div>
            </section>

            {/* Section 5 */}
            <section id="opt-students" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">5. Form I-9 for OPT & STEM OPT Students: Step-by-Step</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    For international students on F-1 OPT or STEM OPT, Form I-9 can be confusing because your authorization documents are different from domestic employees. Here is exactly what to do:
                </p>
                <div className="space-y-4 mb-8">
                    {[
                        { step: "01", title: "Section 1 — Choose the correct box", desc: "Select 'A noncitizen authorized to work until...' Enter the expiration date printed on your EAD card and your USCIS number (10-digit number on the front of your EAD card)." },
                        { step: "02", title: "Documents to bring on Day 1 or Day 3", desc: "Bring your EAD card (Form I-766). This alone satisfies both the identity AND work authorization requirement as a single List A document. You do NOT need your passport additionally, though you may also bring your passport + I-94 as an alternative." },
                        { step: "03", title: "Your employer examines the originals in person", desc: "The employer must physically look at the original document(s). Photocopies or scans are not acceptable for verification (remote verification rules apply separately — see Section 7)." },
                        { step: "04", title: "STEM OPT Re-verification (Section 3)", desc: "When you transition from standard 12-month OPT to the 24-month STEM OPT extension, you will receive a new EAD card. Your employer MUST complete Section 3 of the I-9 using your new EAD card details before your old EAD expires." },
                        { step: "05", title: "Keep a copy for your records", desc: "Although employers are required to retain the I-9, you should also keep a personal copy for your own compliance records. TrackMyOPT can help you track when your re-verification is due." },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">OPT-Specific Note</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">If your EAD has not yet arrived but your OPT start date has passed, show your DSO-issued I-20 with OPT authorization, your I-94, and your passport. USCIS receipt notices for EAD renewals can also be used for up to 540 days from the EAD expiration date under the extended automatic extension rule (as of May 2022).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6 */}
            <section id="deadlines" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">6. Deadlines & Retention Requirements</h2>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Requirement</th>
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Section 1 completion</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">No later than the first day of employment</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Section 2 completion</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Within 3 business days of the first day of work</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Re-verification (Section 3)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Before the employee&apos;s current authorization expires</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Employer document retention (active employee)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Duration of employment</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Employer document retention (after termination)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Longer of: 3 years from hire date OR 1 year from termination</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 7 */}
            <section id="remote" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">7. Remote I-9 Verification (2023 Rule Update)</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Since the COVID-19 pandemic introduced temporary flexibilities, USCIS established a permanent remote verification alternative effective <strong>August 1, 2023</strong>. Under this rule:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Employers who are enrolled in <strong>E-Verify</strong> may use the <strong>E-Verify Identity Document Examination (IDEx)</strong> procedure to examine documents remotely via video call</span>
                    </li>
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>The employee must upload images of their documents and participate in a live video session with an authorized HR representative</span>
                    </li>
                    <li className="flex gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Employers not enrolled in E-Verify must continue to physically examine original documents in person (or use an authorized representative to do so on-site)</span>
                    </li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    This is especially relevant for OPT students who accept remote jobs — your employer can verify your EAD card and other documents through a live video session if they are E-Verify enrolled.
                </p>
            </section>

            {/* Section 8 */}
            <section id="mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">8. Common I-9 Mistakes & How to Avoid Them</h2>
                <div className="space-y-4">
                    {[
                        { mistake: "Missing the 3-business-day deadline", fix: "Set a calendar reminder immediately on the employee's start date. Employers face fines of $272–$2,701 per violation." },
                        { mistake: "OPT student enters wrong USCIS number", fix: "The USCIS number is the 10-digit number (starting with '2') on the front of your EAD card. Do not confuse it with your SEVIS ID." },
                        { mistake: "Employer forgets Section 3 re-verification", fix: "When your EAD is renewed for STEM OPT, the employer must update Section 3 BEFORE your existing EAD expires. Mark the EAD expiration date on a calendar and send a reminder 90 days in advance." },
                        { mistake: "Accepting expired documents", fix: "All documents must be current and unexpired. An expired passport, even if the visa stamp inside is still valid, cannot be used alone." },
                        { mistake: "Using an outdated I-9 form version", fix: "Always download the form from USCIS.gov. The current version has edition date 08/01/23 in the bottom-left corner." },
                        { mistake: "Whiting out or scratching out corrections", fix: "To correct an error, draw a single line through the mistake, enter the correct information, and initial and date the correction. Never use correction fluid." },
                    ].map((item, i) => (
                        <div key={i} className="border border-red-200 dark:border-red-900 rounded-xl p-5">
                            <p className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Mistake: {item.mistake}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> <span><strong>Fix:</strong> {item.fix}</span></p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions About Form I-9</h2>
                <div className="space-y-6">
                    {faqItems.map((item, i) => (
                        <div key={i} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.question}</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            
            <RelatedPosts posts={getRelatedPostsForSlug("form-i9-complete-guide")} />
            <AuthorBio />

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-3">Track Your OPT Compliance Deadlines Automatically</h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Never miss an I-9 re-verification deadline again. TrackMyOPT automatically alerts you when your EAD is expiring, when you need a STEM OPT extension, and when your employer needs to complete Section 3.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                    Get Free OPT Alerts <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Official Sources */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    Official Resources & Sources
                </h3>
                <ul className="space-y-2 text-sm">
                    <li><a href="https://www.uscis.gov/i-9" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">USCIS — Form I-9 (Download the official form)</a></li>
                    <li><a href="https://www.e-verify.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">E-Verify — Remote Verification (IDEx) Program</a></li>
                    <li><a href="https://www.ice.gov/sevis" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ICE SEVIS — Student Work Authorization Information</a></li>
                    <li><a href="https://www.dol.gov/agencies/whd/i9" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Department of Labor — I-9 Employer Compliance Handbook</a></li>
                </ul>
            </div>
        </article>
    );
}
