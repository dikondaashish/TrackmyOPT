import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, FileText, BookOpen, GraduationCap, Binary, Cpu } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Is My Degree STEM Eligible? CIP Code Lookup Guide for STEM OPT (2026)",
    description: "Learn how to find and check your degree CIP code against the DHS STEM Designated Degree Program List to confirm your eligibility for the 24-month STEM OPT extension.",
    keywords: ["STEM OPT eligibility", "CIP code lookup", "is my degree STEM", "DHS STEM designated list", "STEM extension CIP code", "F-1 STEM eligibility"],
    openGraph: {
        title: "Is My Degree STEM Eligible? CIP Code Lookup Guide | TrackMyOPT",
        description: "Complete guide to checking your major's CIP code on your Form I-20 against the DHS STEM Designated Degree List to verify STEM OPT eligibility.",
        url: "https://www.trackmyopt.com/blog/is-my-degree-stem-eligible-cip-code",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/is-my-degree-stem-eligible-cip-code.png",
                width: 1200,
                height: 630,
                alt: "Laptop screen showing DHS STEM Designated Degree list with university catalogs on a desk",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/is-my-degree-stem-eligible-cip-code",
    },
};

export default function CIPCodeGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "STEM CIP Code Guide", url: "https://www.trackmyopt.com/blog/is-my-degree-stem-eligible-cip-code" },
            ]} />
            <BlogPostSchema
                title="Is My Degree STEM Eligible? CIP Code Lookup Guide for STEM OPT"
                description="Comprehensive guide on how to check your Form I-20 CIP code against the official DHS STEM Designated Degree list."
                publishedDate="2026-03-22"
                modifiedDate="2026-03-22"
                author="Vinay Kumar"
                faqItems={[
                    { question: "Where can I find my degree's CIP code?", answer: "Your degree's Classification of Instructional Programs (CIP) code is printed on the first page of your Form I-20, under the 'Primary Major' section. It is a 6-digit code in the format XX.XXXX (e.g., 11.0101)." },
                    { question: "What is the DHS STEM Designated Degree Program List?", answer: "It is the official list of fields of study designated by the Department of Homeland Security (DHS) as STEM-eligible for the 24-month STEM OPT extension. DHS periodically updates this list to add new qualifying CIP codes." },
                    { question: "My major is called 'Data Analytics' but the I-20 says 'Business Statistics'. Which one determines STEM OPT?", answer: "The CIP code printed on your Form I-20 determines your eligibility, not the school's internal marketing name for your major. If the CIP code on your I-20 matches a code on the DHS STEM list, you are eligible." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">STEM CIP Code Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        STEM OPT
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        8 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Is My Degree STEM Eligible? CIP Code Lookup Guide for STEM OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    To qualify for the 24-month STEM OPT extension, your major must be recognized as STEM by the Department of Homeland Security. Eligibility is determined solely by the 6-digit CIP code on your Form I-20. Here is how to find and verify yours.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: March 22, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <img
                    src="/blog/is-my-degree-stem-eligible-cip-code.png"
                    alt="Laptop screen showing DHS STEM Designated Degree list with university catalogs on a desk"
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Your university registrar and DSO map school degree courses to official federal CIP codes.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Look at the <strong>&quot;Primary Major&quot;</strong> section on page 1 of your Form I-20. You will see a 6-digit code (e.g., <strong>11.0101</strong> for Computer Science). Compare this code to the official <strong>DHS STEM Designated Degree Program List</strong>. If it matches, your program is eligible for the 24-month STEM OPT extension.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    The name of your major printed on your diploma or university website does not determine eligibility. Only the official <strong>6-digit CIP code on your I-20</strong> is reviewed by USCIS.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.ice.gov/sevis/schools" target="_blank" rel="noopener noreferrer" className="underline">DHS SEVP Website & CIP Directory</a>
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#what-is-cip", "What is a CIP Code?"],
                        ["#find-on-i20", "How to Find Your CIP Code on Form I-20"],
                        ["#dhs-stem-list", "Checking the DHS STEM Designated Degree List"],
                        ["#mismatches", "Handling Name Mismatches & Changes"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="what-is-cip" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Binary className="w-7 h-7 text-indigo-500" />
                        What is a CIP Code?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The Classification of Instructional Programs (CIP) is a taxonomic coding scheme developed by the US Department of Education&apos;s National Center for Education Statistics (NCES). It tracks and resolves differences in naming conventions across universities.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        For example, one school might call a degree &quot;Computer Science and Systems Analysis,&quot; while another calls it &quot;Software Engineering.&quot; Both are mapped to the standard CIP code <strong>11.0701 (Computer Science)</strong>.
                    </p>
                </section>

                <section id="find-on-i20" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <GraduationCap className="w-7 h-7 text-blue-500" />
                        How to Find Your CIP Code on Form I-20
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Locating your CIP code takes less than a minute:
                    </p>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            1. Open page 1 of your most recent Form I-20.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            2. Locate the box labeled <strong>&quot;Program of Study&quot;</strong> on the left side of the page.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            3. Look for the field labeled <strong>&quot;Major 1&quot;</strong> or <strong>&quot;Primary Major&quot;</strong>.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            4. You will see your major name followed by a code in parentheses: e.g., <strong>Computer Science 11.0701</strong>. The number is your CIP code.
                        </p>
                    </div>
                </section>

                <section id="dhs-stem-list" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Cpu className="w-7 h-7 text-purple-500" />
                        Checking the DHS STEM Designated Degree List
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        DHS maintains the official list of STEM-designated CIP codes. If your CIP code matches a code on this list, you are eligible to apply for the 24-month STEM OPT extension.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-4 text-amber-900 dark:text-amber-100">
                        Always check the official, current list on ICE studyinthestates.dhs.gov before assuming eligibility. DHS updates the list periodically to include new interdisciplinary or tech-related codes.
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Simplify Your STEM OPT Transition</h3>
                        </div>
                        <p className="text-purple-100 mb-6 text-lg max-w-2xl">
                            TrackMyOPT helps you log and verify your employment records so you never fall out of status. Get reminders when it&apos;s time to report changes.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-purple-700 font-bold hover:bg-blue-50 transition-colors shadow-lg"
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
                            { question: "What if my CIP code is not on the DHS STEM list?", answer: "If your code is not on the list, you are not eligible for the STEM OPT extension, even if your school describes the major as technical. You can contact your DSO to ask if they can update or change the CIP code map for your program, though this is rare." },
                            { question: "Does USCIS verify the CIP code during application?", answer: "Yes. When you file Form I-765 for the STEM extension, USCIS cross-checks the CIP code on your STEM I-20 with the official DHS list. Any mismatch will result in a Request for Evidence (RFE) or denial." },
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
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/opt-reporting-requirements-dso" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Reporting Guide</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
