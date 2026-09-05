import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "F-2 Dependent Visa Rules: What Your Spouse and Kids Can (and Cannot) Do | TrackMyOPT",
    description: "Bringing your family to the US on an F-2 visa? Learn the strict rules: no work, limited study, and how your OPT status directly impacts your dependents.",
    keywords: ["F2 dependent visa rules", "F2 spouse work", "F2 visa study restrictions", "F1 student dependents", "F2 visa children school"],
    openGraph: {
        title: "The Complete F-2 Dependent Visa Guide for OPT Students",
        description: "Your spouse and children came to the US on an F-2 visa. Learn the exact rules about employment, education, and how your OPT status affects their stay.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/f2-dependent-visa-rules-opt-students",
        images: [
            {
                url: "/blog/f2-dependent-visa-rules-opt-students.jpg",
                width: 1200,
                height: 630,
                alt: "Passport with an F-2 visa stamp next to an I-20 with the dependent section highlighted and a wedding photo",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/f2-dependent-visa-rules-opt-students",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Complete F-2 Dependent Visa Guide for OPT Students",
        description: "Your spouse and children came to the US on an F-2 visa. Learn the exact rules about employment, education, and how your OPT status affects their stay.",
        images: ["/blog/f2-dependent-visa-rules-opt-students.jpg"],
    },
};

export default function F2DependentPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-02-16"
                modifiedDate="2026-02-16"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Dependent Visas</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Family</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    F-2 Dependent Visa Rules: What Your Spouse and Kids Can (and Cannot) Do
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Bringing your family to the US on an F-2 visa? Understand the strict rules about employment, education, and how your OPT status directly impacts your dependents.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <BlogPostImage src="/blog/f2-dependent-visa-rules-opt-students.jpg" alt="Passport with an F-2 visa stamp next to an I-20 with the dependent section highlighted and a wedding photo" className="object-cover w-full h-full" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    If you are an F-1 international student or OPT holder, you can bring your spouse and unmarried children under 21 to the United States on an <strong>F-2 dependent visa.</strong> While this lets your family live with you, the F-2 visa comes with significant restrictions that many families are unprepared for.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Quick Reference: What F-2 Dependents Can and Cannot Do</h2>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-6">
                        <h4 className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-400 mt-0 mb-3">
                            <CheckCircle2 className="w-5 h-5" /> Allowed
                        </h4>
                        <ul className="text-sm text-emerald-800 dark:text-emerald-200 mb-0 space-y-2">
                            <li>Live in the United States with the F-1 holder.</li>
                            <li>Enroll in part-time recreational or avocational study (e.g., a cooking class, yoga, or a single college course for personal enrichment).</li>
                            <li>Children can attend K-12 public school for free.</li>
                            <li>Open a US bank account.</li>
                            <li>Obtain a US driver's license in most states.</li>
                            <li>Travel freely within the US.</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
                        <h4 className="flex items-center gap-2 font-bold text-red-900 dark:text-red-400 mt-0 mb-3">
                            <XCircle className="w-5 h-5" /> Not Allowed
                        </h4>
                        <ul className="text-sm text-red-800 dark:text-red-200 mb-0 space-y-2">
                            <li><strong>Work.</strong> F-2 holders cannot accept any employment, paid or unpaid, under any circumstances.</li>
                            <li>Enroll in a full-time degree program (must change to F-1 for full-time study).</li>
                            <li>Receive a Social Security Number (SSN) — unless required for a state benefit.</li>
                            <li>Freelance or consult, even for a company in their home country.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Get an F-2 Visa for Your Family</h2>
                <p>
                    Your family does not need a separate I-20 for the F-2 visa. Instead, your DSO will update your I-20 to include your dependents in the "Dependent Information" section. The process is:
                </p>
                <ol>
                    <li>Provide your DSO with your marriage certificate and children's birth certificates.</li>
                    <li>Show proof that you have sufficient financial resources to support your family in the US (bank statements, scholarship letters, or an affidavit of support).</li>
                    <li>Your DSO updates your I-20 with your dependents' information and issues a dependent I-20 for each family member.</li>
                    <li>Each dependent applies for an F-2 visa at the US embassy in their home country using their dependent I-20.</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-6">What Happens to F-2 Dependents During OPT?</h2>
                <p>
                    When you graduate and transition from active F-1 student status to OPT, your F-2 dependents remain in valid status as long as your OPT is active. However, there are critical rules to understand:
                </p>
                <ul>
                    <li>If your OPT expires and you do not transition to another visa, your F-2 dependents also lose their status and must depart the US within the 60-day grace period.</li>
                    <li>If you violate your OPT (e.g., exceed the 90-day unemployment limit), your SEVIS is terminated, and your F-2 dependents instantly lose their status as well.</li>
                    <li>Your spouse's F-2 status is entirely dependent on your compliance. They have no independent immigration standing.</li>
                </ul>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Protect Your Entire Family with TrackMyOPT
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        Your spouse and children's immigration status depends entirely on <em>your</em> OPT compliance. A single mistake—exceeding unemployment days, missing a SEVIS reporting deadline, or failing to update your employer—can destroy your entire family's legal presence in the US. <strong>TrackMyOPT</strong> automatically tracks your unemployment counter, sends deadline alerts, and keeps your SEVIS reporting on schedule.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can an F-2 Spouse Change to F-1?</h2>
                <p>
                    <strong>Yes.</strong> If your spouse wants to pursue a full-time degree, they can apply to change their status from F-2 to F-1 by:
                </p>
                <ol>
                    <li>Getting accepted into a SEVP-certified school.</li>
                    <li>Receiving an I-20 from that school.</li>
                    <li>Filing Form I-539 (Application to Change Nonimmigrant Status) with USCIS.</li>
                </ol>
                <p>
                    Once approved, your spouse becomes an independent F-1 student and can eventually apply for their own CPT and OPT work authorization. This is a popular strategy for families who need a second income.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">F-2 Children and School</h2>
                <p>
                    F-2 children can attend K-12 public school for free, just like any US citizen child. They receive a free education and can participate in all school activities. However, once they turn 21, they must either:
                </p>
                <ul>
                    <li>Change to their own F-1 student visa (if they are enrolled in college).</li>
                    <li>Change to another visa category.</li>
                    <li>Depart the US.</li>
                </ul>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Keep Your Family's Status Secure
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your F-2 dependents' legal status depends entirely on your OPT compliance. TrackMyOPT monitors your unemployment days, alerts you to SEVIS deadlines, and organizes your family's immigration documents in one secure place.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Protect Your Family's Status
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/h4-ead-opt-spouse-work-authorization" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                H-4 EAD Work Authorization
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Once you transition to H-1B, learn how your spouse can finally gain work authorization through the H-4 EAD.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                The 90-Day Unemployment Rule
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Exceeding 90 unemployment days terminates your OPT and your family's F-2 status instantly. Understand the rules.
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
