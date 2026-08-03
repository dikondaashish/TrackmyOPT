import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, UserCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Green Card After OPT: Top 5 Pathways for F-1 Students (2026)",
    description: "Guide to securing permanent residency (Green Card) after F-1 OPT or STEM OPT. Explore EB-2 NIW, EB-3 employer-sponsored, family green cards, and investment pathways.",
    keywords: ["green card after OPT", "F-1 to green card", "EB-2 NIW OPT", "employer sponsored green card", "EB-3 visa F-1", "marriage green card OPT", "OPT green card timeline"],
    openGraph: {
        title: "Green Card After OPT: Top 5 Pathways for F-1 Students | TrackMyOPT",
        description: "Complete guide on transitioning from F-1 student status (OPT/STEM OPT) to a US Green Card. Learn about EB-2, EB-3, and family options.",
        url: "https://www.trackmyopt.com/blog/green-card-after-opt",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/green-card-after-opt.png",
                width: 1200,
                height: 630,
                alt: "Application for Permanent Residence documents and US passport on a wooden desk",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/green-card-after-opt",
    },
};

export default function GreenCardAfterOPT() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Green Card After OPT", url: "https://www.trackmyopt.com/blog/green-card-after-opt" },
            ]} />
            <BlogPostSchema
                title="Green Card After OPT: Top 5 Pathways for F-1 Students"
                description="Explore the primary pathways for F-1 students on OPT or STEM OPT to transition to a US Green Card."
                publishedDate="2026-03-01"
                modifiedDate="2026-03-01"
                author="Vinay Kumar"
                faqItems={[
                    { question: "Can I apply for a green card directly from F-1 student status?", answer: "Yes, you can apply for a green card while on an F-1 visa. However, F-1 is a non-immigrant status. Filing for a green card demonstrates immigrant intent, which makes it very difficult to travel internationally or renew your F-1 visa. Many students transition to an H-1B or L-1 visa first." },
                    { question: "What is the EB-2 National Interest Waiver (NIW)?", answer: "The EB-2 NIW is an employment-based green card category that allows individuals with advanced degrees or exceptional ability to self-petition. You do not need an employer sponsor if you can prove your proposed work has national importance and substantial merit." },
                    { question: "How long does the EB-3 employer-sponsored green card take?", answer: "The EB-3 process involves three stages: PERM Labor Certification, Form I-140, and Form I-485. Depending on your country of birth, the entire timeline can range from 2 to 3 years (for worldwide) to 10+ years (for India and China)." },
                    { question: "Can I get a marriage-based green card on OPT?", answer: "Yes. If you marry a US citizen or permanent resident, you can file for Adjustment of Status (Form I-485) while on OPT. This is typically the fastest pathway to permanent residency." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Green Card After OPT</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        Immigration
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        13 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Green Card After OPT: Top 5 Pathways for F-1 Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Transitioning from an F-1 student visa (including OPT/STEM OPT) to permanent residency is the ultimate goal for many international students. Here is a breakdown of the top 5 legal pathways to secure a US Green Card.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: February 28, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <img
                    src="/blog/green-card-after-opt.png"
                    alt="Application for Permanent Residence documents and US passport on a wooden desk"
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Understanding the immigration timeline and preparation steps is key to a successful transition.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    You can transition to a Green Card from OPT via <strong>Employment-based sponsorship</strong> (EB-2/EB-3), <strong>Self-petition</strong> (EB-2 National Interest Waiver for advanced degrees), <strong>Family/Marriage sponsorship</strong> (marrying a US citizen or LPR), or <strong>Investment</strong> (EB-5). Be careful: filing a green card petition shows immigrant intent, which restricts F-1 travel.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#immigrant-intent", "Understanding Immigrant Intent (F-1 Restrictions)"],
                        ["#eb2-niw", "1. EB-2 National Interest Waiver (Self-Petition)"],
                        ["#eb3-sponsorship", "2. EB-2 / EB-3 Employer Sponsorship (PERM)"],
                        ["#marriage-family", "3. Family & Marriage-Based Green Cards"],
                        ["#eb5-investment", "4. EB-5 Investor Visa Pathway"],
                        ["#diversity-lottery", "5. Diversity Visa Lottery"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="immigrant-intent" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Understanding Immigrant Intent (F-1 Restrictions)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The F-1 student visa is a <strong>non-immigrant visa</strong>. When you apply for a visa or enter the US, you assert that you have no intention of permanently residing in the US.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6 text-amber-950 dark:text-amber-100">
                        <div className="flex gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                            <div>
                                Filing an immigrant petition (such as Form I-140 or I-130) officially declares your immigrant intent. Once filed, you cannot renew your F-1 visa stamp abroad, and re-entering the US on F-1/OPT status is highly risky.
                            </div>
                        </div>
                    </div>
                </section>

                <section id="eb2-niw" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        1. EB-2 National Interest Waiver (Self-Petition)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The EB-2 National Interest Waiver (NIW) is one of the best pathways for Master&apos;s and Ph.D. students. It allows you to skip the labor certification (PERM) process and self-petition for residency without an employer.
                    </p>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <h4 className="font-bold text-gray-950 dark:text-white">Requirements to Qualify:</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                            <li>• Must hold an advanced degree (Master&apos;s or Ph.D.) or have Exceptional Ability.</li>
                            <li>• The proposed endeavor must have substantial merit and national importance.</li>
                            <li>• You must be well-positioned to advance the proposed endeavor.</li>
                            <li>• On balance, it would be beneficial to the US to waive the job offer/PERM requirements.</li>
                        </ul>
                    </div>
                </section>

                <section id="eb3-sponsorship" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        2. EB-2 / EB-3 Employer Sponsorship (PERM)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The traditional employer-sponsored pathway. Your employer sponsors you for a specific position by testing the local labor market.
                    </p>
                    <div className="space-y-3">
                        {[
                            { step: "Stage 1", name: "PERM Labor Certification", desc: "The employer proves to the Department of Labor that there are no qualified, willing US workers for your position." },
                            { step: "Stage 2", name: "Form I-140 Petition", desc: "The employer files the immigrant petition with USCIS showing they can pay the prevailing wage and that you meet all criteria." },
                            { step: "Stage 3", name: "Adjustment of Status (Form I-485)", desc: "When your priority date is current, you file to adjust your status to Permanent Resident." },
                        ].map((stage, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded self-start">{stage.step}</span>
                                <div>
                                    <h4 className="font-semibold text-gray-950 dark:text-white">{stage.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stage.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="marriage-family" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        3. Family & Marriage-Based Green Cards
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you marry a US citizen, you are considered an Immediate Relative. This is the fastest green card route because visa numbers are always immediately available.
                    </p>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Adjustment of Status:</strong> If you are physically inside the US on active OPT, you can file Forms I-130 and I-485 concurrently. You will receive an intermediate work permit (EAD) and travel document (Advance Parole) while waiting for the green card interview.
                        </p>
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Plan Your Immigration Journey</h3>
                        </div>
                        <p className="text-emerald-100 mb-6 text-lg max-w-2xl">
                            Ensure you track your OPT timeline, employment history, and updates safely. TrackMyOPT keeps your records consolidated and secure.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition-colors shadow-lg"
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
                            { question: "Can I travel outside the US while my Green Card application is pending?", answer: "Only if you have an approved Advance Parole (AP) document. Traveling without AP before your Adjustment of Status is approved will result in the abandonment of your application." },
                            { question: "Does my OPT employer have to sponsor my Green Card?", answer: "No, anyone can sponsor your employment-based petition as long as they can prove the job offer is genuine and they have the ability to pay the wage." },
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
                    <Link href="/blog/eb2-niw-green-card-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ EB-2 NIW Self-Petition Guide</Link>
                    <Link href="/blog/h1b-alternatives-work-visas" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Top H-1B Visa Alternatives</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
