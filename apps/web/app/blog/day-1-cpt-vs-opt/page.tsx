import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, Scale } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Day 1 CPT vs OPT: Key Differences Every F-1 Student Should Know (2026)",
    description: "Day 1 CPT vs OPT comparison for F-1 students. Understand the differences in eligibility, work authorization, risks, and long-term immigration impact. Make an informed decision.",
    keywords: ["Day 1 CPT", "Day 1 CPT vs OPT", "CPT vs OPT", "Day 1 CPT risks", "what is Day 1 CPT", "is Day 1 CPT legal", "CPT OPT difference"],
    openGraph: { title: "Day 1 CPT vs OPT: Complete Comparison | TrackMyOPT", url: "https://www.trackmyopt.com/blog/day-1-cpt-vs-opt", type: "article" },
    alternates: { canonical: "https://www.trackmyopt.com/blog/day-1-cpt-vs-opt" },
};

export default function Day1CPTArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">Day 1 CPT vs OPT</span>
            </nav>
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">Important</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />11 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Day 1 CPT vs OPT: Key Differences Every F-1 Student Should Know</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">Day 1 CPT and OPT are both work authorizations for F-1 students, but they have very different rules, risks, and immigration implications.</p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Important Disclaimer</h2>
                <p className="text-amber-800 dark:text-amber-200 font-medium">This article provides factual information about Day 1 CPT and OPT for educational purposes. <strong>Day 1 CPT is a legal gray area</strong> with significant immigration risks. Always consult a qualified immigration attorney before making decisions about work authorization.</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quick Comparison: Day 1 CPT vs OPT</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Day 1 CPT</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">OPT</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Authorization Type", "CPT (Curricular Practical Training)", "OPT (Optional Practical Training)"],
                                    ["When Available", "Day 1 of enrollment", "After 1 academic year (or pre-approved)"],
                                    ["Duration", "As long as you're enrolled", "12 months (+24 for STEM)"],
                                    ["EAD Card Needed?", "No — DSO authorization on I-20", "Yes — USCIS issues EAD card"],
                                    ["Employer Restriction", "Must be part of curriculum", "Related to field of study"],
                                    ["USCIS Approval?", "No — school-level only", "Yes — USCIS must approve"],
                                    ["Processing Time", "Instant (DSO approval)", "2-5 months for EAD"],
                                    ["Cost", "No USCIS fee", "$410 I-765 filing fee"],
                                    ["Risk Level", "⚠️ Higher (scrutinized)", "✅ Lower (standard)"],
                                    ["Effect on Future OPT", "12+ months FT CPT = NO OPT", "Does not affect CPT"],
                                    ["H-1B Impact", "May face extra scrutiny", "Standard pathway"],
                                ].map(([factor, cpt, opt], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{factor}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{cpt}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{opt}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Is Day 1 CPT?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Day 1 CPT refers to programs at certain universities that authorize Curricular Practical Training from the first day of enrollment. Unlike traditional CPT (which requires one academic year of enrollment first), Day 1 CPT programs integrate employment into the curriculum as a mandatory or elective component.</p>
                    <div className="space-y-3">
                        {[
                            { label: "How it works", detail: "You enroll in a masters or doctoral program that includes a practicum/co-op component from Day 1. The school authorizes CPT on your I-20, and you can start working immediately." },
                            { label: "Common degrees", detail: "MBA, MS in Computer Science, MS in Information Technology, MS in Data Science at specific universities offering Day 1 CPT." },
                            { label: "School examples", detail: "Several smaller private universities offer Day 1 CPT programs. Popular ones include programs in the MBA and tech space." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Risks of Day 1 CPT</h2>
                    <div className="space-y-3">
                        {[
                            { risk: "12 months of full-time CPT eliminates OPT eligibility", desc: "If you use 12+ months of full-time CPT, you are NOT eligible for post-completion OPT. This eliminates your 12-month (or 36-month STEM) OPT pathway.", severity: "critical" },
                            { risk: "USCIS scrutiny on H-1B and green card applications", desc: "USCIS may request extensive evidence about the legitimacy of your Day 1 CPT program when reviewing future immigration benefits.", severity: "high" },
                            { risk: "School accreditation concerns", desc: "Some Day 1 CPT schools have faced scrutiny from SEVP. If a school loses its SEVP certification, students' SEVIS records can be terminated.", severity: "high" },
                            { risk: "Tax and legal complications", desc: "Some Day 1 CPT arrangements may create tax complications or questions about the legitimacy of the educational program.", severity: "medium" },
                        ].map((item, i) => (
                            <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${item.severity === "critical" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : item.severity === "high" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"}`}>
                                <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.severity === "critical" ? "text-red-600" : "text-amber-600"}`} />
                                <div><h3 className={`font-semibold ${item.severity === "critical" ? "text-red-900 dark:text-red-100" : "text-amber-900 dark:text-amber-100"}`}>{item.risk}</h3><p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">When OPT Is the Better Choice</h2>
                    <div className="space-y-2">
                        {["You want the standard, safest immigration pathway (OPT → STEM OPT → H-1B)", "You have a STEM degree and want 36 months of work authorization", "You plan to pursue long-term immigration (green card, O-1)", "You don't want additional tuition costs for a second masters program", "You want no extra scrutiny on future USCIS applications"].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-800 dark:text-green-200">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Is Day 1 CPT legal?", a: "Day 1 CPT is technically legal under USCIS regulations IF the school is SEVP-certified and the CPT is a genuine, integral part of the curriculum. However, programs where the academic component is minimal and the primary purpose is work authorization may face scrutiny." },
                            { q: "Does Day 1 CPT affect OPT eligibility?", a: "Yes. If you use 12 or more months of full-time CPT from ANY program, you become INELIGIBLE for post-completion OPT. Part-time CPT does not count toward this limit." },
                            { q: "Can I do Day 1 CPT after OPT?", a: "Yes, you can enroll in a new program with Day 1 CPT after your OPT ends. However, be aware of the cumulative CPT limit and its effect on any future OPT eligibility." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <AuthorBio />
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Choosing OPT? Track Every Day That Matters</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">TrackMyOPT helps you manage OPT deadlines, unemployment days, and H-1B transition — all in one place.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">Start Tracking Free <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", "headline": "Day 1 CPT vs OPT: Key Differences for F-1 Students", "author": { "@type": "Organization", "name": "TrackMyOPT" }, "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } }, "datePublished": "2026-03-10", "dateModified": "2026-03-10", "mainEntityOfPage": "https://www.trackmyopt.com/blog/day-1-cpt-vs-opt" }) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Is Day 1 CPT legal?", "acceptedAnswer": { "@type": "Answer", "text": "Technically legal IF the school is SEVP-certified and CPT is a genuine part of the curriculum, but programs with minimal academics may face scrutiny." } }, { "@type": "Question", "name": "Does Day 1 CPT affect OPT?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. 12+ months of full-time CPT makes you ineligible for post-completion OPT." } }, { "@type": "Question", "name": "Can I do Day 1 CPT after OPT?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, but be aware of cumulative CPT limits and their impact on future OPT eligibility." } }] }) }} />
        </article>
    );
}
