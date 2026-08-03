import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, Briefcase, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "H-4 EAD: Can Your Spouse Work While You Are on OPT or H-1B? | TrackMyOPT",
    description: "Learn whether H-4 visa holders can get work authorization. Understand the H-4 EAD rules, eligibility based on I-140 approval, and how it connects to OPT-to-H-1B transitions.",
    keywords: ["H4 EAD work authorization", "H4 visa spouse work", "H4 EAD I-140 approved", "OPT spouse work", "F2 vs H4 work"],
    openGraph: {
        title: "H-4 EAD: Work Authorization for H-1B Spouses",
        description: "Your spouse is on an H-4 visa and wants to work. Learn the exact eligibility rules, how to apply for the H-4 EAD, and when it might be revoked.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/h4-ead-opt-spouse-work-authorization",
        images: [
            {
                url: "/blog/h4-ead-opt-spouse-work-authorization.jpg",
                width: 1200,
                height: 630,
                alt: "Two EAD cards and two passports with H-1B and H-4 visa stamps next to wedding rings",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/h4-ead-opt-spouse-work-authorization",
    }
};

export default function H4EADPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-03-10"
                modifiedDate="2026-03-10"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Dependent Visas</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Work Authorization</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    H-4 EAD: Can Your Spouse Work While You Are on OPT or H-1B?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Learn whether H-4 visa holders can get work authorization, the eligibility rules tied to I-140 approval, and how the OPT-to-H-1B transition impacts your spouse.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/h4-ead-opt-spouse-work-authorization.jpg"
                    alt="Two EAD cards and two passports with H-1B and H-4 visa stamps next to wedding rings"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    One of the most common questions from married international students and professionals: "My spouse came with me to the US on a dependent visa. Can they work?" The answer depends entirely on which dependent visa your spouse holds and how far along you are in the Green Card process.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">F-2 Spouses: No Work Authorization</h2>
                <p>
                    If you are currently on an F-1 visa (including OPT and STEM OPT), your spouse is on an <strong>F-2 dependent visa.</strong> Under current immigration law, F-2 visa holders are <strong>strictly prohibited from working</strong> in the United States. They cannot be employed, freelance, or even do volunteer work that would normally be paid. They can study part-time but cannot pursue a full degree program.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        F-2 Work Is Illegal
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        If your F-2 spouse works—even remotely for a foreign company that pays them in their home country—it is considered unauthorized employment. This can result in deportation, a 3-year or 10-year bar from re-entering the US, and permanent denial of any future US visa applications.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">H-4 Spouses: Conditional Work Authorization</h2>
                <p>
                    Once you transition from OPT to an <strong>H-1B work visa</strong>, your spouse's status automatically changes from F-2 to <strong>H-4.</strong> H-4 visa holders have a pathway to work authorization, but only if specific conditions are met.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Who Is Eligible for the H-4 EAD?</h3>
                <p>
                    Your H-4 spouse can apply for an Employment Authorization Document (EAD) if <strong>either</strong> of the following conditions apply to you (the H-1B holder):
                </p>
                <ol>
                    <li><strong>Approved I-140:</strong> Your employer has filed an I-140 Immigrant Petition on your behalf, and it has been approved by USCIS.</li>
                    <li><strong>H-1B Extension Beyond 6 Years:</strong> You have been granted an H-1B extension beyond the standard 6-year maximum under Section 104(c) or 106(a) of the American Competitiveness in the Twenty-First Century Act (AC21).</li>
                </ol>

                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm my-8">
                    <h4 className="flex items-center gap-2 font-bold text-lg mt-0 mb-3"><Briefcase className="w-5 h-5 text-blue-500" /> Key Benefit</h4>
                    <p className="mb-0 text-sm text-gray-600 dark:text-gray-400">
                        Unlike the OPT EAD, which restricts you to jobs related to your major, the <strong>H-4 EAD has no employment restrictions.</strong> Your spouse can work in any field, for any employer, full-time or part-time. They can even start their own business.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The OPT-to-H-1B Timeline for Spouses</h2>
                <p>
                    Here is the typical timeline for a married international student's spouse to eventually gain work authorization:
                </p>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6 my-6">
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="mb-0"><strong>Year 1-3 (OPT/STEM OPT):</strong> Spouse on F-2. Cannot work.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="mb-0"><strong>Year 3+ (H-1B Approved):</strong> Spouse changes to H-4. Still cannot work unless I-140 is approved.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="mb-0"><strong>Year 4-5+ (I-140 Approved):</strong> Spouse applies for H-4 EAD and can finally work!</p>
                        </div>
                    </div>
                </div>

                <p>
                    For most international students, this means your spouse will be unable to work for <strong>4 to 6+ years</strong> after arriving in the US. This is one of the most emotionally and financially difficult aspects of the US immigration system.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Apply for the H-4 EAD</h2>
                <p>
                    Once eligible, your spouse must file <strong>Form I-765</strong> (Application for Employment Authorization) with USCIS. Required documents include:
                </p>
                <ul>
                    <li>Copy of your H-1B approval notice (I-797).</li>
                    <li>Copy of the approved I-140 receipt or approval notice.</li>
                    <li>Copy of your marriage certificate.</li>
                    <li>Copy of spouse's H-4 approval notice or I-94.</li>
                    <li>Passport-style photos.</li>
                    <li>Filing fee (currently $410).</li>
                </ul>
                <p>
                    <strong>Processing time:</strong> 3-6 months on average. Your spouse cannot begin working until they physically receive the EAD card.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Track the Entire Journey with TrackMyOPT
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        From OPT to H-1B to I-140 approval—your spouse's work authorization depends on every step of <em>your</em> immigration journey going smoothly. <strong>TrackMyOPT</strong> helps you track unemployment days during OPT, monitor SEVIS reporting deadlines, and securely store every immigration document for both you and your spouse. Start building a clean immigration record from Day 1.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Is the H-4 EAD at Risk?</h2>
                <p>
                    The H-4 EAD has been politically controversial since its creation in 2015 under the Obama administration. Multiple attempts have been made to rescind the rule:
                </p>
                <ul>
                    <li>In 2017-2020, the Trump administration proposed a regulation to eliminate the H-4 EAD, but it was never finalized.</li>
                    <li>In 2021-2024, the Biden administration preserved and strengthened the H-4 EAD.</li>
                    <li>As of 2026, the H-4 EAD remains in effect, but future administrations could attempt to revoke it again.</li>
                </ul>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Plan Your Immigration Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your spouse's ability to work depends on your OPT compliance, H-1B approval, and I-140 processing. TrackMyOPT helps you navigate each step with automated reminders, document storage, and compliance tracking.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Start Planning Your Future
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/f2-dependent-visa-rules-opt-students" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                F-2 Dependent Visa Rules
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Currently on OPT with an F-2 spouse? Learn the strict rules for F-2 dependents and what they can and cannot do.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/green-card-after-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Green Card After OPT
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Once your spouse gets the H-4 EAD, the next step is a Green Card. Learn the full pathway from OPT to permanent residency.
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
