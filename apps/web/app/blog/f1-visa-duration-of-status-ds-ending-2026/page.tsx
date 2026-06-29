import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, Download, CheckCircle, Scale } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Is 'Duration of Status' Ending for F-1 Students? What the New 2026 Rule Means",
    description: "The proposed rule to end 'Duration of Status' (D/S) for F-1 and J-1 students is under final OMB review. Learn how fixed expiration dates will change OPT and studying in the US.",
    keywords: ["duration of status F1", "F1 visa expiration 2026", "D/S rule update", "F1 student visa limit", "OPT duration of status", "OMB review student visa"],
    openGraph: {
        title: "Is 'Duration of Status' Ending for F-1 Students? | TrackMyOPT",
        description: "How fixed expiration dates will completely change F-1 visa validity in 2026.",
        url: "https://www.trackmyopt.com/blog/f1-visa-duration-of-status-ds-ending-2026",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "Is 'Duration of Status' Ending for F-1 Students?" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/f1-visa-duration-of-status-ds-ending-2026" },
};

export default function DurationOfStatusArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Duration of Status Ending", url: "https://www.trackmyopt.com/blog/f1-visa-duration-of-status-ds-ending-2026" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-06-12" 
                modifiedDate="2026-06-12" 
                author="TrackMyOPT Team" 
                faqItems={[
                    {question: "What does Duration of Status (D/S) mean for F-1 students?", answer: "Currently, F-1 students are admitted for 'D/S', meaning they can stay in the U.S. indefinitely as long as they maintain student status, progress academically, or transition to OPT."}, 
                    {question: "What happens if Duration of Status ends?", answer: "F-1 students would be given fixed admission periods (typically 2 or 4 years). To stay longer, transfer schools, or start OPT, they would have to file an extension of stay application with USCIS, paying fees and facing potential denials."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Duration of Status Ending</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">Critical Policy Alert</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Is "Duration of Status" Ending for F-1 Students? What the 2026 Rule Means
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    A controversial rule to replace indefinite "D/S" with fixed visa expiration dates is near final approval. This article is for all current and future F-1 international students whose legal presence in the U.S. will be directly impacted.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: June 12, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <img 
                src="/blog/duration-of-status.png" 
                alt="Calendar and F-1 student visa stamp inside a passport" 
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" 
            />
            <figcaption className="mt-3 mb-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Duration of Status (D/S) allows students to remain in the US indefinitely as long as they maintain their F-1 status.
            </figcaption>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The rule to eliminate "Duration of Status" (D/S) is currently under review by the Office of Management and Budget (OMB). If finalized, F-1 students will face fixed, hard expiration dates (2 or 4 years) on their stays, requiring costly and uncertain USCIS extensions to change majors, pursue higher degrees, or apply for OPT.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#what-is-ds" className="hover:underline">1. What is Duration of Status (D/S)?</a></li>
                    <li><a href="#the-new-rule" className="hover:underline">2. The Proposed Fixed-Term Rule</a></li>
                    <li><a href="#impact-on-opt" className="hover:underline">3. How This Impacts OPT and Extensions</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Next Steps</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="what-is-ds" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        What is Duration of Status (D/S)?
                    </h2>
                    <p>
                        For decades, F-1 international students arriving in the U.S. have been admitted for <strong>"Duration of Status,"</strong> noted as "D/S" on their I-94 arrival record. 
                    </p>
                    <p>
                        This means a student is legally allowed to remain in the U.S. indefinitely, provided they maintain a valid I-20, make normal academic progress, and comply with SEVP rules. This flexibility allows students to easily transfer schools, pursue a Master's after a Bachelor's, or transition to OPT without needing to repeatedly ask USCIS for permission to stay.
                    </p>
                </section>

                <section id="the-new-rule" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The Proposed Fixed-Term Rule
                    </h2>
                    <p>
                        The Department of Homeland Security (<a href="https://www.dhs.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DHS</a>) is attempting to eliminate D/S. Currently under final review by the Office of Management and Budget (OMB), the new rule would impose strict, fixed admission periods.
                    </p>
                    <ul>
                        <li><strong>Standard Admission:</strong> Students would be admitted for the length of their program or a maximum of <strong>4 years</strong> (whichever is shorter).</li>
                        <li><strong>Restricted Admission:</strong> Students from countries with high visa overstay rates, or countries designated as state sponsors of terrorism, would be limited to a maximum admission of <strong>2 years</strong>.</li>
                    </ul>
                    <p>
                        Under this system, if an undergraduate degree takes 5 years to complete, the student must apply for an Extension of Stay (EOS) before their 4th year ends, paying a filing fee and undergoing biometrics, all with no guarantee of approval.
                    </p>
                </section>

                <section id="impact-on-opt" className="mb-12">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            How This Impacts OPT and Extensions
                        </h2>
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-3">
                            The ripple effect on OPT would be massive. Currently, transitioning from study to OPT simply requires an I-765 EAD application. 
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                            If D/S ends, applying for OPT would also require filing an Extension of Stay to legally remain in the U.S. while the EAD is processed. Given that USCIS processing times often exceed <strong>4 to 6 months</strong>, students could accrue unlawful presence if their fixed status expires while waiting.
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 text-sm font-bold">
                            Action Item: Ensure your passport is valid for at least 6 months into the future at all times, as admission periods can never exceed passport validity.
                        </p>
                    </div>

                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                                <Download className="w-5 h-5" /> Free Visa Validity Checker Tool
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
                                Download our simple excel tool to track your I-20 end date, Passport expiration, and Visa stamp validity in one place.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                            Download Excel
                        </button>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What does Duration of Status (D/S) mean?", answer: "Currently, F-1 students are admitted for 'D/S', meaning they can stay in the U.S. indefinitely as long as they maintain student status, progress academically, or transition to OPT. There is no hard expiration date on their I-94." },
                            { question: "Is the end of Duration of Status officially law?", answer: "Not yet. As of June 2026, the final rule is undergoing review by the Office of Management and Budget (OMB). If cleared, it will be published in the Federal Register and go into effect shortly after." },
                            { question: "Will this affect students currently in the US?", answer: "Yes. The proposed rule suggests that students currently in the U.S. on D/S would have their status automatically converted to a fixed expiration date (typically the program end date on their current I-20)." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="conclusion" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Conclusion & Next Steps</h2>
                    <p>
                        The elimination of Duration of Status represents the most drastic change to the F-1 visa program in over 20 years. It will replace academic flexibility with bureaucratic friction and high fees. 
                    </p>
                    <p>
                        <strong>Next Step:</strong> Keep a close eye on updates from your university's International Student Services (ISSS) office. If you are planning to transition to OPT or a higher degree program in late 2026 or 2027, prepare to submit your applications far earlier than historically required to account for Extension of Stay processing.
                    </p>
                </section>

                <AuthorBio />
            </div>
        </article>
    );
}
