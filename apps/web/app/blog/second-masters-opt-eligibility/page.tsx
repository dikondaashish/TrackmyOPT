import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle, GraduationCap } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Can I Apply for OPT Again After a Second Master's Degree? (2026 Guide)",
    description: "Discover the USCIS rules on OPT eligibility when pursuing a second Master's degree. Learn about the 'once per higher degree level' rule and what it means for F-1 students.",
    alternates: { canonical: "https://www.trackmyopt.com/blog/second-masters-opt-eligibility" },
    openGraph: {
        title: "Can I Apply for OPT Again After a Second Master's Degree? (2026 Guide)",
        description: "Discover the USCIS rules on OPT eligibility when pursuing a second Master's degree. Learn about the 'once per higher degree level' rule and what it means for F-1 students.",
        type: "article",
        publishedTime: "2026-06-12T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/second-masters-opt.png",
                width: 1200,
                height: 630,
                alt: "International college student with two graduation caps studying at a library desk",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Can I Apply for OPT Again After a Second Master's Degree? (2026 Guide)",
        description: "Discover the USCIS rules on OPT eligibility when pursuing a second Master's degree. Learn about the 'once per higher degree level' rule and what it means for F-1 students.",
        images: ["/blog/second-masters-opt.png"],
    },
};

export default function BlogPost() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Can I get OPT twice for two different Master's degrees?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. Under USCIS and ICE regulations, F-1 students are only eligible for 12 months of OPT at each higher educational degree level. If you used your OPT after your first Master's, you cannot get another 12 months for a second Master's degree."
                }
            },
            {
                "@type": "Question",
                name: "How do I get OPT again after a Master's degree?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "To become eligible for OPT again after utilizing it for a Master's degree, you must progress to a higher degree level, such as completing a Ph.D. or Doctorate program."
                }
            }
        ]
    };

    return (
        <article className="min-h-screen bg-white dark:bg-black pt-24 pb-20">
            <BlogPostSchema 
                title="Can I Apply for OPT Again After a Second Master's Degree?"
                description="Discover the USCIS rules on OPT eligibility when pursuing a second Master's degree. Learn about the 'once per higher degree level' rule and what it means for F-1 students."
                publishedDate="2026-05-13"
                modifiedDate="2026-05-13"
                faqItems={jsonLd.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({ question: q.name, answer: q.acceptedAnswer.text }))}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://www.trackmyopt.com/' },
                    { name: 'Blog', url: 'https://www.trackmyopt.com/blog' },
                    { name: 'Second Masters OPT Eligibility', url: 'https://www.trackmyopt.com/blog/second-masters-opt-eligibility' }
                ]}
            />


            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8 mt-4">
                    <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white truncate">Second Master's OPT</span>
                </nav>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">Eligibility Guide</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />5 min read</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        Can I Apply for OPT Again After a Second Master's Degree?
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        A very common question among international students is whether enrolling in a second Master's degree resets their Optional Practical Training (OPT) clock. Here is the definitive answer under USCIS regulations.
                    </p>
                    <div className="mt-6 text-sm text-gray-500">Published: May 13, 2026 • Written by Vinay Kumar</div>
                </header>

                <figure className="mb-12">
                    <img 
                        src="/blog/second-masters-opt.png" 
                        alt="International college student with two graduation caps studying at a library desk" 
                        className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" 
                    />
                    <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        OPT is awarded based on progressing to higher educational levels, not just for completing any new degree program.
                    </figcaption>
                </figure>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                        <strong>No, you cannot apply for OPT again if you already used it for a previous degree at the same level.</strong> Under USCIS rules, F-1 students are granted a maximum of 12 months of OPT at each higher educational degree level. If you used OPT after your first Master's, you will not get OPT after a second Master's. You must complete a Ph.D. to become eligible for OPT again.
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Table of Contents
                    </h2>
                    <ul className="space-y-3">
                        <li><a href="#once-per-level-rule" className="text-blue-600 dark:text-blue-400 hover:underline">1. The "Once Per Higher Degree Level" Rule</a></li>
                        <li><a href="#stem-extension-exception" className="text-blue-600 dark:text-blue-400 hover:underline">2. Does the STEM Extension Change Things?</a></li>
                        <li><a href="#cpt-during-second-masters" className="text-blue-600 dark:text-blue-400 hover:underline">3. Can I use CPT During My Second Master's?</a></li>
                        <li><a href="#how-to-get-opt-again" className="text-blue-600 dark:text-blue-400 hover:underline">4. How to Become Eligible for OPT Again</a></li>
                        <li><a href="#conclusion" className="text-blue-600 dark:text-blue-400 hover:underline">5. Conclusion & Next Steps</a></li>
                    </ul>
                </div>

                <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                    <p>
                        "I came to the U.S. in 2021 on an F-1 visa to pursue a Master's degree in Computer Science. I completed my degree and my OPT ended in May 2025. In June 2025, I started a new academic program and continued in F-1 status. Am I eligible to apply for OPT again after completing this new program?"
                    </p>
                    <p>
                        Our legal team sees this specific question from international students almost every day. The short answer is <strong>no, you are not eligible for another round of Optional Practical Training (OPT)</strong> if the new program is also a Master's degree. 
                    </p>

                    <section id="once-per-level-rule" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold">1</span>
                            The "Once Per Higher Degree Level" Rule
                        </h2>
                        <p>
                            According to the Code of Federal Regulations <a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">8 CFR § 214.2(f)(10)(ii)</a>, a student may be authorized for a maximum of <strong>12 months of practical training</strong>, and it is available only once at each educational level.
                        </p>
                        <p>
                            This means the U.S. government provides OPT in a linear progression:
                        </p>
                        <ul>
                            <li><strong>Bachelor's Level:</strong> 12 months of OPT allowed.</li>
                            <li><strong>Master's Level:</strong> 12 months of OPT allowed.</li>
                            <li><strong>Doctorate (Ph.D.) Level:</strong> 12 months of OPT allowed.</li>
                        </ul>
                        <p>
                            If you already consumed your 12 months of OPT after graduating with your first Master's degree, enrolling in a second, third, or even fourth Master's degree <strong>will not</strong> grant you any additional OPT time. You have already exhausted your Master's-level OPT allowance.
                        </p>
                    </section>

                    <section id="stem-extension-exception" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold">2</span>
                            Does the STEM Extension Change Things?
                        </h2>
                        <p>
                            The 24-month STEM OPT extension follows slightly different rules, but the core principle remains the same. You can only apply for the STEM OPT extension <strong>twice</strong> in a lifetime, and the second STEM extension must be based on a degree at a <em>higher</em> educational level than the first.
                        </p>
                        <p>
                            If you used standard OPT and a STEM extension on your first Master's degree, you cannot get another STEM extension on a second Master's degree. You must proceed to a Ph.D. to be eligible again, as clarified by <a href="https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/stem-opt-frequently-asked-questions" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ICE SEVP STEM OPT FAQs</a>.
                        </p>
                    </section>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 my-10">
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Warning: Fractional OPT Usage
                        </h3>
                        <p className="text-amber-800 dark:text-amber-200">
                            Even if you only used a <strong>fraction</strong> of your Master's level OPT (for example, you were authorized for 12 months but only worked for 4 months before starting a new degree), you <strong>forfeit the remaining balance</strong> when you transfer your SEVIS record to the new degree program. You cannot "pause" and use the remaining 8 months after the second Master's degree.
                        </p>
                    </div>

                    <section id="cpt-during-second-masters" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold">3</span>
                            Can I use CPT During My Second Master's?
                        </h2>
                        <p>
                            While OPT is exhausted, you <em>may</em> still be eligible for <strong>Curricular Practical Training (CPT)</strong> during your second Master's degree, provided that the new program requires internships or practical training as part of its curriculum.
                        </p>
                        <p>
                            Many students pursuing a second Master's degree look for "Day 1 CPT" universities that allow them to work while studying. However, be extremely cautious. USCIS scrutinizes Day 1 CPT heavily during H-1B petitions to ensure you are maintaining your F-1 academic intent rather than just using the university as a "visa mill" to continue working.
                        </p>
                    </section>

                    <section id="how-to-get-opt-again" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold">4</span>
                            How to Become Eligible for OPT Again
                        </h2>
                        <p>
                            To unlock a new 12-month period of Optional Practical Training, you must <strong>progress to a higher degree level</strong>. If you have already exhausted your Master's-level OPT, the only way to get OPT again is to graduate with a <strong>Doctorate (Ph.D.)</strong>. 
                        </p>
                        <p>
                            Upon completing a Ph.D., you will be granted a fresh 12 months of standard OPT, and if your Ph.D. is in a STEM field, you will be eligible for another 24-month STEM extension.
                        </p>
                    </section>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold">Track Your OPT Compliance Intelligently</h3>
                            </div>
                            <p className="text-blue-100 mb-6 text-lg max-w-2xl">
                                If you are on OPT, you only have <strong>90 days of unemployment</strong> before your F-1 visa is violated. Don't leave it to chance.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-blue-50">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Real-time tracking of your 90-day unemployment limit</span>
                                </li>
                                <li className="flex items-center gap-3 text-blue-50">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Automated email alerts before you hit critical deadlines</span>
                                </li>
                                <li className="flex items-center gap-3 text-blue-50">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>100% Free for F-1 International Students</span>
                                </li>
                            </ul>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    href="/login" 
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-lg"
                                >
                                    Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <section id="conclusion" className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Conclusion & Action Steps</h2>
                        <p>
                            If you are planning to enroll in a second Master's degree, understand that you are doing so strictly for academic purposes—you will not receive a new OPT work authorization at the end of it. You should plan your career and immigration trajectory accordingly, looking at H-1B sponsorship, Day 1 CPT options, or advancing to a Ph.D. level program if U.S. work authorization is your primary goal.
                        </p>
                    </section>

                    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Can I get OPT twice for two different Master's degrees?</h4>
                                <p className="text-gray-600 dark:text-gray-400">No. Under USCIS and ICE regulations, F-1 students are only eligible for 12 months of OPT at each higher educational degree level. If you used your OPT after your first Master's, you cannot get another 12 months for a second Master's degree.</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">How do I get OPT again after a Master's degree?</h4>
                                <p className="text-gray-600 dark:text-gray-400">To become eligible for OPT again after utilizing it for a Master's degree, you must progress to a higher degree level, such as completing a Ph.D. or Doctorate program.</p>
                            </div>
                        </div>
                    </div>

                    <AuthorBio />
                </div>
            </div>
        </article>
    );
}
