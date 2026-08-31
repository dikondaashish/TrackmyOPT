import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Briefcase } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "USCIS Closes FY 2027 H-1B Cap: No Second Lottery & Next Steps | TrackMyOPT",
    description: "USCIS has officially reached the 85,000 cap for FY 2027 H-1B petitions and announced there will be no second lottery. Discover your backup options if you weren't selected.",
    keywords: ["H-1B cap reached", "H-1B second lottery 2027", "FY 2027 H-1B", "OPT to H1B", "H1B alternatives", "STEM OPT extension"],
    openGraph: {
        title: "USCIS Closes FY 2027 H-1B Cap: No Second Lottery",
        description: "USCIS announced they have received enough petitions to meet the FY 2027 cap. No second lottery will be held. What should OPT students do next?",
        type: "article",
        url: "https://www.trackmyopt.com/blog/h1b-fy2027-cap-closed-no-second-lottery",
        images: [
            {
                url: "/blog/h1b-fy2027-cap-closed-no-second-lottery.png",
                width: 1200,
                height: 630,
                alt: "Passport with H-1B stamp and CLOSED stamp",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/h1b-fy2027-cap-closed-no-second-lottery",
    }
};

const faqItems = [
    {
        question: "What happens if I didn't get selected in the H-1B lottery?",
        answer: "If you were not selected, your status will change to 'Not Selected.' You should immediately explore backup options such as the STEM OPT extension, cap-exempt H-1B, O-1, or L-1 visas."
    },
    {
        question: "Will there be a second H-1B lottery for FY 2027?",
        answer: "No. USCIS has officially announced that they have received enough petitions to meet the cap for FY 2027, so there will not be a second lottery this year."
    },
    {
        question: "Can I use Day 1 CPT as an alternative to H-1B?",
        answer: "While Day 1 CPT is an option, it is heavily scrutinized by USCIS. Ensure the university is accredited and your employment is directly tied to the new curriculum."
    }
];

export default function H1BCapClosedPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "USCIS Closes FY 2027 H-1B Cap", url: "https://www.trackmyopt.com/blog/h1b-fy2027-cap-closed-no-second-lottery" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-07-18"
                modifiedDate="2026-07-18"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
                faqItems={faqItems}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Breaking News</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">H-1B Visa</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    USCIS Closes FY 2027 H-1B Cap: No Second Lottery & What OPT Students Must Do Next
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    USCIS has officially announced that the 85,000 petition limit for FY 2027 has been reached. There will be no second lottery this year. Here are your backup options.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span>
                    <span>July 18, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/h1b-fy2027-cap-closed-no-second-lottery.png"
                    alt="Passport with H-1B stamp and CLOSED stamp"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <p className="text-white/80 text-sm p-4">The FY 2027 H-1B Cap is officially closed.</p>
                </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary hover:prose-a:text-blue-700">
                <p>
                    On July 17, 2026, U.S. Citizenship and Immigration Services (USCIS) made the announcement that many F-1 students on OPT were dreading: <strong>the FY 2027 H-1B cap has been reached, and there will be no second lottery.</strong>
                </p>
                <p>
                    USCIS confirmed that they have received a sufficient number of petitions needed to reach the congressionally mandated 65,000 H-1B regular cap and the 20,000 U.S. advanced degree exemption (master’s cap) for fiscal year 2027.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 my-8 rounded-r-xl">
                    <h3 className="text-amber-800 dark:text-amber-300 m-0 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        What Does This Mean?
                    </h3>
                    <p className="text-amber-900 dark:text-amber-200/80 m-0">
                        If your employer submitted a registration for you in March but you were not selected, your registration status will soon be updated to "Not Selected." You cannot rely on a second lottery to save your status this year. You must immediately pivot to a backup plan.
                    </p>
                </div>

                <h2>Backup Plans for Unselected OPT Students</h2>
                <p>
                    If your OPT or STEM OPT is expiring soon and you didn't get selected, you are not out of options. Depending on your situation, here are the most viable alternatives to remain and work legally in the U.S.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                        <Briefcase className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">1. STEM OPT Extension</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            If you are currently on your first year of 12-month post-completion OPT and you have a STEM degree, apply for the 24-month STEM OPT extension immediately. This gives you two more chances at the H-1B lottery in FY 2028 and FY 2029.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                        <FileText className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">2. Cap-Exempt H-1B</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Universities, non-profit research organizations, and government research entities are exempt from the 85,000 cap. If you secure a job with one of these employers, they can file an H-1B for you at any time of the year.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">3. O-1 Visa (Extraordinary Ability)</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            If you have authored papers, received awards, or commanded a high salary in your field, you may qualify for the O-1 visa. It has no cap and can be applied for at any time.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                        <ShieldCheck className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">4. L-1 Visa (Intracompany Transfer)</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            If your company has international offices, you can relocate to work in a foreign branch for one year, and then return to the U.S. on an L-1 visa.
                        </p>
                    </div>
                </div>

                <h2>What About Day 1 CPT?</h2>
                <p>
                    Many students consider enrolling in a second master's program that offers Day 1 CPT to continue working. While legal if properly executed, <Link href="/blog/day-1-cpt-vs-opt">Day 1 CPT is heavily scrutinized by USCIS</Link>. If you choose this route, ensure the university is properly accredited, you physically attend classes, and the job is directly tied to your new curriculum.
                </p>

                <h2>Track Your Deadlines Carefully</h2>
                <p>
                    With the H-1B door closed for this year, managing your remaining OPT days is more critical than ever. Under the new <Link href="/blog/september-2026-f1-fixed-admission-rule-opt">2026 fixed-admission rules</Link>, the grace period and filing steps can depend on whether you remain in the D/S transition or receive a date-specific I-94.
                </p>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white my-12 shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-4 mt-0">Don't Lose Track of Your OPT Dates</h3>
                    <p className="text-blue-100 mb-6 text-lg">
                        Use TrackMyOPT to monitor your exact OPT expiration, unemployment days, and visa grace periods so you never fall out of status unexpectedly.
                    </p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                        Start Tracking for Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <section className="mb-12 mt-12 not-prose">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <AuthorBio />
            </div>
        </article>
    );
}
