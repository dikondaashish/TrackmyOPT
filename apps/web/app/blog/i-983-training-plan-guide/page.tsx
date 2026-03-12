import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, FileText, BookOpen } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "I-983 Training Plan for STEM OPT: Complete Guide (2026)",
    description: "How to complete Form I-983 for STEM OPT. Step-by-step guide to each section, employer requirements, E-Verify enrollment, and common mistakes that cause rejections.",
    keywords: ["I-983 training plan", "STEM OPT I-983", "I-983 form guide", "STEM OPT training plan", "E-Verify STEM OPT", "I-983 employer requirements"],
    openGraph: {
        title: "I-983 Training Plan Guide for STEM OPT | TrackMyOPT",
        description: "Complete I-983 guide. Every section explained with employer requirements and common mistakes.",
        url: "https://www.trackmyopt.com/blog/i-983-training-plan-guide",
        type: "article",
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/i-983-training-plan-guide" },
};

export default function I983Article() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "I 983 Training Plan Guide", url: "https://www.trackmyopt.com/blog/i-983-training-plan-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "What is the I-983 form?", answer: "Form I-983 is the Employer's Certification of Training & Experience form required for STEM OPT extensions. It documents the employer's commitment to providing structured training and supervision."}, {question: "Is E-Verify required to file I-983?", answer: "Yes. Your employer must be successfully enrolled in E-Verify and have an active Company ID to sign the I-983. E-Verify enrollment is a non-negotiable requirement."}, {question: "When should I update my I-983?", answer: "You must submit a new or updated I-983 at the 12-month and 24-month marks of your STEM OPT to confirm your training progress and continued compliance with the program."} ]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">I-983 Training Plan</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">STEM OPT</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    I-983 Training Plan for STEM OPT: Complete Guide (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The I-983 Training Plan is required for every STEM OPT extension. Here's a section-by-section guide to completing it correctly with your employer.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    What Is the I-983?
                </h2>
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                    Form I-983, "Training Plan for STEM OPT Students," is a formal agreement between you and your employer describing how your STEM OPT employment will provide practical training related to your degree. It must be completed <strong>before</strong> your DSO can recommend the STEM extension in SEVIS.
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">
                    Source: <a href="https://www.ice.gov/sevis/stemopt" target="_blank" rel="noopener noreferrer" className="underline">ICE.gov STEM OPT Hub</a>
                </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        I-983 Section-by-Section Guide
                    </h2>
                    <div className="space-y-4">
                        {[
                            { section: "Section 1: Student Information", who: "You (Student)", items: ["Full legal name (as on passport)", "SEVIS ID (N + 10 digits)", "Email address and phone number", "Degree program and STEM CIP code", "Previous I-983 (if this is a modified plan)"] },
                            { section: "Section 2: Student Certification", who: "You (Student)", items: ["Signature confirming you understand reporting requirements", "Date of signature", "Acknowledgment of 10-day change reporting obligation"] },
                            { section: "Section 3: Employer Information", who: "Employer", items: ["Company legal name", "EIN (Employer Identification Number)", "E-Verify Company Identification Number (required!)", "Company website", "Number of full-time employees", "NAICS code"] },
                            { section: "Section 4: Compensation & Training", who: "Employer", items: ["Your job title", "Start and end dates of STEM OPT", "Hours per week (must be 20+)", "Annual compensation (must be commensurate)", "How the position relates to your STEM degree", "Training objectives and goals", "How the employer will provide oversight and mentoring"] },
                            { section: "Section 5: Employer Attestation", who: "Employer", items: ["Signature of supervisor or training officer", "Attestation that training plan is genuine", "Confirmation the company has sufficient resources", "Agreement to comply with STEM OPT regulations"] },
                            { section: "Section 6: Both Signatures", who: "Both", items: ["Your signature + date", "Employer supervisor signature + date", "Both parties confirm accuracy of information"] },
                        ].map((section, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        {section.section}
                                    </h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                                        Completed by: {section.who}
                                    </span>
                                </div>
                                <ul className="space-y-1">
                                    {section.items.map((item, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        E-Verify Requirement for STEM OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Your employer <strong>must be enrolled in E-Verify</strong> to qualify as a STEM OPT employer. This is non-negotiable — if your company isn't E-Verify enrolled, you cannot do STEM OPT there.
                    </p>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>How to verify:</strong> Ask your employer for their E-Verify Company ID Number. You can also search the <a href="https://www.e-verify.gov/" target="_blank" rel="noopener noreferrer" className="underline">E-Verify website</a> to confirm enrollment. TrackMyOPT's <Link href="/features/sponsors" className="underline font-medium">H-1B Sponsor Database</Link> shows E-Verify status for 25,000+ companies.
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Common I-983 Mistakes to Avoid
                    </h2>
                    <div className="space-y-3">
                        {[
                            { mistake: "Generic training description", fix: "Be specific about STEM skills. Instead of 'software development', write 'developing machine learning models using Python and TensorFlow for NLP tasks.'" },
                            { mistake: "Missing E-Verify ID", fix: "The E-Verify Company ID is required. Without it, your DSO cannot process the I-983. Get this from your employer's HR department." },
                            { mistake: "Compensation not commensurate", fix: "Your salary must be comparable to similarly situated U.S. workers. If it's significantly below market, it raises red flags." },
                            { mistake: "Unsigned sections", fix: "All 6 sections must be completed and signed. Missing signatures = automatic rejection by your DSO." },
                            { mistake: "Not updating after job changes", fix: "If you change employers, get promoted, or your role changes significantly, you must submit a modified I-983 within 10 days." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                <h3 className="font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {item.mistake}
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1"><strong>Fix:</strong> {item.fix}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What is the I-983 form?", answer: "Form I-983 is the Training Plan for STEM OPT Students. It's a formal agreement between you and your employer that describes how your employment provides practical training in your STEM field. It's required before your DSO can recommend the STEM OPT extension." },
                            { question: "Does my employer need to be E-Verify enrolled?", answer: "Yes. E-Verify enrollment is mandatory for STEM OPT employers. Your employer must provide their E-Verify Company ID Number on the I-983 form." },
                            { question: "When do I need to update my I-983?", answer: "You must submit a modified I-983 within 10 days if there are material changes to your training plan, including: new employer, role change, address change, or significant changes to your duties." },
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
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Complete STEM OPT Extension Guide</Link>
                    <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Unemployment Limit Explained</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Find E-Verify Employers for STEM OPT</h2>
                <p className="text-purple-100 mb-6 max-w-lg mx-auto">Search our database of 25,000+ employers with E-Verify status, approval rates, and salary data.</p>
                <Link href="/features/sponsors" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                    Search Employers <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "I-983 Training Plan for STEM OPT: Complete Guide (2026)",
                    "author": { "@type": "Organization", "name": "TrackMyOPT" },
                    "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } },
                    "datePublished": "2026-03-10", "dateModified": "2026-03-10",
                    "mainEntityOfPage": "https://www.trackmyopt.com/blog/i-983-training-plan-guide"
                })
            }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "FAQPage",
                    "mainEntity": [
                        { "@type": "Question", "name": "What is the I-983 form?", "acceptedAnswer": { "@type": "Answer", "text": "Form I-983 is the Training Plan for STEM OPT Students, a formal agreement between you and your employer describing how your employment provides practical training in your STEM field." } },
                        { "@type": "Question", "name": "Does my employer need to be E-Verify enrolled?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. E-Verify enrollment is mandatory for STEM OPT employers." } },
                        { "@type": "Question", "name": "When do I need to update my I-983?", "acceptedAnswer": { "@type": "Answer", "text": "Within 10 days of material changes to your training plan, including new employer, role change, or significant changes to duties." } },
                    ]
                })
            }} />
        </article>
    );
}
