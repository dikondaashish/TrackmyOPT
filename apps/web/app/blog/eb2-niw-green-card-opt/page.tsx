import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, Award, Compass, Search } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "EB-2 NIW Green Card Guide for OPT & STEM OPT Students (2026)",
    description: "Ultimate guide to the EB-2 National Interest Waiver (NIW) green card for F-1 OPT and STEM OPT students. Learn about the Matter of Dhanasar criteria, self-petition steps, and processing times.",
    keywords: ["EB-2 NIW", "national interest waiver", "self petition green card", "F-1 to green card", "Matter of Dhanasar", "advanced degree green card", "I-140 processing time"],
    openGraph: {
        title: "EB-2 NIW Green Card Guide for OPT & STEM OPT Students | TrackMyOPT",
        description: "Learn how to self-petition for a US Green Card via the EB-2 National Interest Waiver (NIW) while on OPT or STEM OPT. Step-by-step criteria breakdown.",
        url: "https://www.trackmyopt.com/blog/eb2-niw-green-card-opt",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/eb2-niw-green-card-opt.png",
                width: 1200,
                height: 630,
                alt: "Academic research papers, laptop showing academic paper, and Form I-140 folder on library desk",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/eb2-niw-green-card-opt",
    },
};

export default function EB2NIWGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "EB-2 NIW Guide", url: "https://www.trackmyopt.com/blog/eb2-niw-green-card-opt" },
            ]} />
            <BlogPostSchema
                title="EB-2 NIW Green Card Guide for OPT & STEM OPT Students"
                description="Comprehensive guide on the EB-2 National Interest Waiver (NIW) pathway for F-1 international students."
                publishedDate="2026-02-07"
                modifiedDate="2026-02-07"
                author="Vinay Kumar"
                faqItems={[
                    { question: "Do I need a job offer for an EB-2 NIW petition?", answer: "No. The National Interest Waiver bypasses the job offer and PERM Labor Certification requirements. You can self-petition without employer support, even if you are currently unemployed or working on OPT." },
                    { question: "What are the three prongs of the Matter of Dhanasar?", answer: "To qualify for an NIW, you must satisfy three prongs: 1) Your proposed endeavor has substantial merit and national importance; 2) You are well-positioned to advance the endeavor; and 3) On balance, it would be beneficial to the United States to waive the job offer and PERM requirements." },
                    { question: "Can a Master's degree student qualify for EB-2 NIW?", answer: "Yes. To qualify for the broader EB-2 category, you must possess an Advanced Degree (Master's or higher, or a Bachelor's plus 5 years of progressive post-baccalaureate experience) or demonstrate Exceptional Ability. Many Master's degree holders successfully secure NIWs." },
                    { question: "How long does EB-2 NIW processing take?", answer: "The Form I-140 processing takes around 4 to 8 months, but Premium Processing is available to get a response within 45 days. However, you must wait for your priority date to become current before you can file Form I-485 for the actual Green Card." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">EB-2 NIW Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        Immigration
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        12 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    EB-2 NIW Green Card Guide for OPT & STEM OPT Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The EB-2 National Interest Waiver (NIW) is one of the most powerful immigration pathways for highly skilled F-1 students. It allows you to self-petition for a Green Card, skipping the employer-sponsorship and PERM Labor Certification requirements entirely.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: February 7, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <img
                    src="/blog/eb2-niw-green-card-opt.png"
                    alt="Academic research papers, laptop showing academic paper, and Form I-140 folder on library desk"
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Your academic papers, publications, and professional endeavor form the core of your EB-2 NIW petition.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The <strong>EB-2 NIW</strong> is a self-petition Green Card option for students with a Master&apos;s or Ph.D. (or Bachelor&apos;s + 5 years experience). You don&apos;t need an employer or job offer. You must prove your work is of <strong>national importance</strong>, you are qualified to execute it, and the US benefits from skipping the PERM labor market test.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    USCIS evaluates EB-2 NIW cases using a legal framework called <strong>Matter of Dhanasar</strong>. Preparing a strong proposed endeavor is the absolute key to success.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.justice.gov/eoir/page/file/920996/download" target="_blank" rel="noopener noreferrer" className="underline">Administrative Appeals Office (AAO) Dhanasar Precedent Decision</a>
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#dhanasar-framework", "The Legal Framework: Matter of Dhanasar"],
                        ["#advanced-degree", "Minimum Requirements: Advanced Degree or Exceptional Ability"],
                        ["#self-petition-steps", "Step-by-Step Filing Process"],
                        ["#opt-risks", "Important Caveats & F-1 Status Risks"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="dhanasar-framework" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The Legal Framework: Matter of Dhanasar
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        To qualify for a National Interest Waiver, your petition must satisfy all three prongs established in the landmark case <em>Matter of Dhanasar (2016)</em>:
                    </p>
                    <div className="space-y-3">
                        {[
                            { title: "Prong 1: Substantial Merit & National Importance", desc: "Your proposed work (endeavor) must have substantial merit in terms of science, business, or education, and offer broad benefits to the US." },
                            { title: "Prong 2: Well-Positioned to Advance the Endeavor", desc: "USCIS looks at your credentials, publication history, education, patents, research, and expert letters to see if you have the capability to succeed." },
                            { title: "Prong 3: Beneficial to Waive the Job Offer / PERM", desc: "You must argue that requiring a specific employer-sponsored job offer and labor certification would be impractical or would delay work of urgent national benefit." },
                        ].map((prong, i) => (
                            <div key={i} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <Award className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-950 dark:text-white">{prong.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{prong.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="advanced-degree" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Advanced Degree or Exceptional Ability
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Before USCIS evaluates your waiver argument, you must meet the base EB-2 requirements:
                    </p>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                        <li><strong>Advanced Degree:</strong> A US Master&apos;s or Ph.D. (or foreign equivalent), or a US Bachelor&apos;s plus 5 years of progressive post-graduation experience.</li>
                        <li><strong>Exceptional Ability:</strong> Meeting at least 3 out of 6 USCIS criteria (academic record, license to practice, 10 years experience, professional membership, recognition).</li>
                    </ul>
                </section>

                <section id="self-petition-steps" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step Filing Process
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Most students hire an immigration attorney, but self-filing is possible. Here is the workflow:
                    </p>
                    <div className="space-y-4">
                        {[
                            { step: "1", title: "Define the Proposed Endeavor", desc: "Write a detailed personal statement explaining what research, business, or project you will pursue in the US and how it impacts the nation." },
                            { step: "2", title: "Gather Recommendation Letters", desc: "Secure 4 to 6 testimonial letters from independent experts, professors, or industry leaders verifying the importance of your work." },
                            { step: "3", title: "Assemble Exhibits", desc: "Compile your CV, degree transcripts, publication history, citations, media mentions, and copy of patents or project portfolios." },
                            { step: "4", title: "File Form I-140", desc: "Submit the Form I-140 package to USCIS. If you want a quick decision, you can pay for Premium Processing to get an adjudication in 45 days." },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-lg font-bold flex-shrink-0">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="opt-risks" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Important Caveats & F-1 Status Risks
                    </h2>
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl my-4 text-red-900 dark:text-red-100 text-sm">
                        <div className="flex gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
                            <div>
                                <strong>Immigrant Intent Risk:</strong> Once you file Form I-140, you have officially declared immigrant intent. If you leave the US after filing, you will not be allowed to re-enter on a regular F-1 visa or OPT. Plan to stay inside the US until you receive Advance Parole or adjust status.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Compass className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Consolidate Your Case Records</h3>
                        </div>
                        <p className="text-purple-100 mb-6 text-lg max-w-2xl">
                            TrackMyOPT helps you manage status details during major transitions. Log employer histories, timeline requirements, and maintain active status seamlessly.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-purple-700 font-bold hover:bg-purple-50 transition-colors shadow-lg"
                        >
                            Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/green-card-after-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Green Card After OPT Options</Link>
                    <Link href="/blog/h1b-alternatives-work-visas" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Visa Alternatives</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
