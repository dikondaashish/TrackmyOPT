import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, FileCheck, DollarSign, Search } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "PERM Labor Certification Process: What OPT Workers Need to Know | TrackMyOPT",
    description: "Learn the 3 main steps of the PERM Labor Certification process for employment-based green cards (EB-2/EB-3). Understand PWD, recruitment, and ETA Form 9089.",
    keywords: ["PERM labor certification", "ETA Form 9089", "Prevailing Wage Determination", "EB2 Green Card", "EB3 Green Card", "OPT to Green Card"],
    openGraph: {
        title: "PERM Labor Certification Process: A Complete Guide for OPT Workers",
        description: "Navigating the PERM process for your Green Card? Understand the strict advertising requirements, prevailing wage delays, and how long the ETA Form 9089 takes to process.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/perm-labor-certification-opt",
        images: [
            {
                url: "/blog/perm-labor-certification-opt.png",
                width: 1200,
                height: 630,
                alt: "Department of Labor form and classified newspaper ads representing the PERM labor certification process",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/perm-labor-certification-opt",
    },
    twitter: {
        card: "summary_large_image",
        title: "PERM Labor Certification Process: A Complete Guide for OPT Workers",
        description: "Navigating the PERM process for your Green Card? Understand the strict advertising requirements, prevailing wage delays, and how long the ETA Form 9089 takes to process.",
        images: ["/blog/perm-labor-certification-opt.png"],
    },
};

export default function PermLaborCertificationPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-04-29"
                modifiedDate="2026-04-29"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Green Card</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Employer Sponsorship</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    PERM Labor Certification Process: What OPT Workers Need to Know
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    The first and most critical step in getting an employer-sponsored Green Card. Learn how the PERM process works, why it takes so long, and what your employer must do.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 9 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <BlogPostImage src="/blog/perm-labor-certification-opt.png" alt="Department of Labor form and classified newspaper ads representing the PERM labor certification process" className="object-cover w-full h-full" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    If your employer has agreed to sponsor you for an EB-2 or EB-3 Green Card while you are on OPT, STEM OPT, or H-1B, the very first hurdle you will face is not with USCIS, but with the <strong>Department of Labor (DOL)</strong>. This hurdle is known as the <strong>PERM Labor Certification</strong>.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        What is PERM?
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        PERM stands for Program Electronic Review Management. Before an employer can sponsor a foreign worker for a permanent green card, they must prove to the US government that there are <strong>no willing, able, and qualified US workers</strong> available for the position.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The 3 Stages of the PERM Process</h2>
                <p>
                    The PERM process is entirely driven by your employer (and their immigration lawyers). As the employee, your main job is to provide your educational documents and experience verification. Here is what happens behind the scenes:
                </p>

                <div className="space-y-8 my-8">
                    <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-2xl">
                                1
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                                Prevailing Wage Determination (PWD)
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Before advertising the job, your employer must submit a request to the DOL to determine the "Prevailing Wage" for your role in your specific geographic location. This ensures the employer isn't undercutting American wages by hiring you.
                            </p>
                            <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg text-sm mt-3">
                                <strong>Current Timeline:</strong> 6 to 8 months.
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-2xl">
                                2
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                                Recruitment and Advertising
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Once the PWD is received, the employer must conduct a strict recruitment campaign to test the US labor market. They must place physical ads in the Sunday newspaper, post on state workforce agency job banks, and use other mandatory recruitment channels.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                If a qualified US worker applies, the employer <strong>cannot</strong> file the PERM. They must wait and try again later.
                            </p>
                            <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg text-sm mt-3">
                                <strong>Required Timeline:</strong> Minimum 60 days (30 days of active ads + 30 days mandatory waiting/cooling off period).
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-2xl">
                                3
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                                Filing ETA Form 9089
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                If no qualified US workers apply, the employer officially files the PERM Labor Certification (ETA Form 9089) with the DOL. The date this form is filed becomes your incredibly important <strong>Priority Date</strong>.
                            </p>
                            <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg text-sm mt-3">
                                <strong>Current Timeline:</strong> 12 to 14 months (if not audited). If audited by the DOL, add another 4 to 6 months.
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Why OPT Students Must Start Early</h2>
                <p>
                    As you can see from the timelines above, the complete PERM process currently takes <strong>over 20 months (nearly 2 years)</strong> from the day your employer agrees to sponsor you until the day the DOL approves the certification.
                </p>
                <p>
                    If you only have 3 years of total work authorization (1 year OPT + 2 years STEM OPT), you literally do not have enough time to complete the PERM process and file your Green Card application (I-140/I-485) before your student visa expires, unless your employer starts the process <strong>immediately</strong> upon hiring you.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        The H-1B Bridge
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        Because PERM takes so long, 95% of employers will put you into the H-1B lottery while simultaneously starting the PERM process. The H-1B acts as a "bridge" visa, allowing you to stay in the US for up to 6 years while the lengthy Green Card process plays out. If you do not win the H-1B lottery, your OPT may expire before your PERM is approved.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                    <div className="border dark:border-zinc-700 rounded-xl p-6">
                        <h4 className="text-lg font-bold mt-0 mb-2">Can I pay for the PERM process myself?</h4>
                        <p className="mb-0 text-gray-600 dark:text-gray-300">
                            <strong>Absolutely not.</strong> By law, the employer must pay 100% of all costs associated with the PERM Labor Certification, including lawyer fees and advertising costs. If you offer to pay, it is a violation of federal law and will result in a denial.
                        </p>
                    </div>
                    
                    <div className="border dark:border-zinc-700 rounded-xl p-6">
                        <h4 className="text-lg font-bold mt-0 mb-2">What happens if my employer does layoffs?</h4>
                        <p className="mb-0 text-gray-600 dark:text-gray-300">
                            If your employer lays off US workers in your same occupation and geographic location within 6 months of filing your PERM, they must notify those laid-off workers and consider them for your position. Major tech layoffs severely delay or cancel pending PERM applications.
                        </p>
                    </div>
                </div>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Manage Your OPT Timeline Carefully
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    The PERM process is a race against the clock of your expiring OPT. Use TrackMyOPT to map out your remaining STEM OPT days, calculate when your employer must file for H-1B, and track all your employment authorizations in one secure dashboard.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/green-card-after-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Green Card Pathways After OPT
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                See how the PERM process fits into the overall timeline for EB-2 and EB-3 Green Cards.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/eb2-niw-green-card-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Skip PERM with an EB-2 NIW
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Don't want to wait 2 years for PERM? Learn how the National Interest Waiver lets you skip this step entirely.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
