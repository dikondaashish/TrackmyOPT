import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, Briefcase, MapPin } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "TN Visa Guide for Canadian & Mexican Students on OPT | TrackMyOPT",
    description: "Learn how Canadian and Mexican citizens can easily transition from an F-1 OPT to a TN Visa under the USMCA agreement. Skip the H-1B lottery entirely.",
    keywords: ["TN Visa OPT", "Canadian student OPT", "Mexican student OPT", "USMCA visa", "NAFTA visa", "F1 to TN visa"],
    openGraph: {
        title: "The TN Visa Advantage: Escaping the H-1B Lottery",
        description: "Are you a Canadian or Mexican citizen on OPT? You have a secret weapon. Learn how to transition from F-1 to TN status and skip the H-1B lottery.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/tn-visa-canadian-mexican-students-opt",
        images: [
            {
                url: "/blog/tn-visa-canadian-mexican-students-opt.png",
                width: 1200,
                height: 630,
                alt: "Canadian and Mexican passports next to a USMCA Professional classification document",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/tn-visa-canadian-mexican-students-opt",
    },
    twitter: {
        card: "summary_large_image",
        title: "The TN Visa Advantage: Escaping the H-1B Lottery",
        description: "Are you a Canadian or Mexican citizen on OPT? You have a secret weapon. Learn how to transition from F-1 to TN status and skip the H-1B lottery.",
        images: ["/blog/tn-visa-canadian-mexican-students-opt.png"],
    },
};

export default function TnVisaPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-06-03"
                modifiedDate="2026-06-03"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Work Visas</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">USMCA</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    The TN Visa Guide for Canadian & Mexican Students on OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    If you hold a passport from Canada or Mexico, you do not need to stress over the H-1B lottery. Here is exactly how to transition from your F-1 OPT to a TN Visa.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/tn-visa-canadian-mexican-students-opt.png"
                    alt="Canadian and Mexican passports next to a USMCA Professional classification document"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Every March, hundreds of thousands of international students anxiously await the results of the H-1B lottery. But if you are a citizen of Canada or Mexico, you have a massive advantage: the <strong>TN Visa</strong>. Created under the NAFTA agreement (now the USMCA), the TN classification allows North American professionals to work in the US indefinitely without ever entering a lottery.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        The TN Visa Advantage
                    </h3>
                    <ul className="mb-0 text-gray-700 dark:text-gray-200">
                        <li><strong>No Cap or Lottery:</strong> Unlike the 85,000 cap for H-1B, there is no limit to how many TN visas are issued each year.</li>
                        <li><strong>Fast Processing:</strong> Canadians can apply and get approved right at the US border in a single day.</li>
                        <li><strong>Infinite Renewals:</strong> The TN is issued for up to 3 years and can be renewed indefinitely (unlike the strict 6-year limit on H-1B).</li>
                        <li><strong>Cheaper for Employers:</strong> Filing a TN visa costs a fraction of what an H-1B costs, making you highly employable.</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Do You Qualify for a TN Visa?</h2>
                <p>
                    Unlike the H-1B, which is open to any "specialty occupation," the TN visa is strictly limited to a predefined list of 63 specific professions outlined in the USMCA treaty.
                </p>
                <p>
                    To qualify, you must meet <strong>three strict requirements</strong>:
                </p>
                <ol>
                    <li>You must be a citizen of Canada or Mexico (permanent residents do not qualify).</li>
                    <li>Your job offer must be for a role that is on the official USMCA list.</li>
                    <li>You must have the specific degree or credentials required by the list for that role.</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Common TN Professions for New Grads</h3>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                    <div className="border border-gray-200 dark:border-zinc-700 p-4 rounded-lg">
                        <h4 className="font-bold text-primary m-0 flex items-center gap-2"><FileText className="w-4 h-4" /> Engineer</h4>
                        <p className="text-sm mt-1 mb-0">Requires a Baccalaureate or Licenciatura Degree in Engineering.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-zinc-700 p-4 rounded-lg">
                        <h4 className="font-bold text-primary m-0 flex items-center gap-2"><FileText className="w-4 h-4" /> Computer Systems Analyst</h4>
                        <p className="text-sm mt-1 mb-0">Requires a Baccalaureate degree OR post-secondary diploma + 3 years of experience.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-zinc-700 p-4 rounded-lg">
                        <h4 className="font-bold text-primary m-0 flex items-center gap-2"><FileText className="w-4 h-4" /> Accountant</h4>
                        <p className="text-sm mt-1 mb-0">Requires a Baccalaureate Degree, C.P.A., C.A., C.G.A. or C.M.A.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-zinc-700 p-4 rounded-lg">
                        <h4 className="font-bold text-primary m-0 flex items-center gap-2"><FileText className="w-4 h-4" /> Graphic Designer</h4>
                        <p className="text-sm mt-1 mb-0">Requires a Baccalaureate Degree OR post-secondary diploma + 3 years of experience.</p>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        The "Software Engineer" Trap
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        There is no "Software Developer" on the TN list. Tech workers usually apply as an "Engineer" (if they have an engineering degree) or as a "Computer Systems Analyst." However, US border agents heavily scrutinize Computer Systems Analyst applications to ensure you are doing high-level systems design, not just writing code.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Transition from F-1 OPT to TN</h2>
                <p>
                    The process differs slightly depending on whether you are Canadian or Mexican.
                </p>

                <div className="space-y-6 my-8">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <MapPin className="w-6 h-6" /> For Canadian Citizens
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Canadians are visa-exempt. You do not need to visit a US embassy. When your OPT is nearing its end, simply gather your employer support letter, original degree, and transcripts, and drive or fly to a US Port of Entry (or a pre-clearance airport like YYZ or YVR).
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            Present your documents to the CBP officer. If approved, you pay a $50 fee, they stamp your passport, and you walk into the US in active TN status. You can do this on a Friday on OPT, and return on Monday on TN.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Briefcase className="w-6 h-6" /> For Mexican Citizens
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Mexican citizens cannot apply at the border. You must first secure an appointment at a US Embassy or Consulate in Mexico. 
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            You bring the same employer support letter and original degree documents to your consular interview. Once the officer approves you, they will place a physical TN visa foil in your passport, which you then use to enter the US.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Catch: TN Visa and Green Cards</h2>
                <p>
                    While the TN visa is incredible for staying in the US, it has one major flaw compared to the H-1B: <strong>It does not allow for dual intent.</strong>
                </p>
                <p>
                    The H-1B visa is a "dual intent" visa, meaning you can hold an H-1B while actively applying for a Green Card (permanent residency). The TN visa is strictly a "single intent" non-immigrant visa. When you apply for a TN, you must prove to the officer that you plan to return to Canada or Mexico eventually.
                </p>
                <p>
                    If your employer starts the Green Card process for you (filing an I-140) while you are on a TN visa, renewing your TN or traveling internationally becomes extremely risky, as CBP may deny your entry because you have demonstrated "immigrant intent." For this reason, many Canadian and Mexican workers still enter the H-1B lottery while working on a TN visa to safely transition to a Green Card later.
                </p>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Track Your Visa Transitions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Transitioning from OPT to TN requires precise timing so you don't accidentally work a day out of status. Use TrackMyOPT to map out your employment timeline and get alerts before your OPT EAD card expires.
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
                    <Link href="/answers/what-is-h1b-lottery" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                H-1B vs TN Visa
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Why many TN visa holders still choose to enter the H-1B lottery to secure a safer path to a Green Card.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/l1-visa-transfer-after-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                L-1 Visa Transfer Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Don't qualify for a TN? See if your company can transfer you to their Canadian office on an L-1.
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
