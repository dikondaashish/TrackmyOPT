import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, GraduationCap, XCircle, ShieldAlert, BrainCircuit, Activity } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Academic Probation on an F-1 Visa: Will It Ruin Your OPT? | TrackMyOPT",
    description: "Got an Academic Warning or placed on Academic Probation? Learn how a low GPA affects your F-1 student status, SEVIS record, and future OPT eligibility.",
    keywords: ["Academic probation F1 visa", "Low GPA international student", "Academic suspension F1", "Can I get OPT on probation", "SEVIS termination academic reasons"],
    openGraph: {
        title: "The Truth About Academic Probation and OPT",
        description: "Falling below a 2.0 or 3.0 GPA can put you on academic probation. Learn the exact immigration consequences and how to protect your future US work authorization.",
        type: "article",
        url: "https://trackmyopt.com/blog/academic-probation-f1-student-opt",
        images: [
            {
                url: "/blog/academic-probation-f1-student-opt.png",
                width: 1200,
                height: 630,
                alt: "Academic desk with an Academic Warning letter, student ID, and laptop showing a low GPA",
            },
        ],
    },
    alternates: {
        canonical: "https://trackmyopt.com/blog/academic-probation-f1-student-opt",
    }
};

export default function AcademicProbationPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-01-15"
                modifiedDate="2026-01-15"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Academics</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Academic Probation on an F-1 Visa: Will It Ruin Your OPT?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Falling below the minimum GPA requirement is incredibly stressful. Learn how Academic Probation impacts your SEVIS record and your ability to apply for OPT.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/academic-probation-f1-student-opt.png"
                    alt="Academic desk with an Academic Warning letter, student ID, and laptop showing a low GPA"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    US universities have strict academic standards. If your cumulative GPA falls below a certain threshold (usually 2.0 for undergraduates and 3.0 for graduate students), you will receive a formal letter from your dean placing you on <strong>Academic Probation</strong>. For international students, this triggers a wave of panic: <em>Will I lose my visa? Will this show up on my OPT application?</em>
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Does Academic Probation Cancel Your Visa?</h2>
                <p>
                    <strong>No.</strong> Academic probation is an internal university policy, not an immigration status. Your F-1 visa and SEVIS record remain perfectly valid and active while you are on probation, provided you meet one critical condition:
                </p>
                <p>
                    <strong>You must continue to be enrolled full-time.</strong>
                </p>
                <p>
                    As long as you are taking 12 credits (undergraduate) or 9 credits (graduate), the Department of Homeland Security (DHS) considers you to be "maintaining lawful status," regardless of whether you have an A+ average or a D average.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        Do Not Drop Classes to Save Your GPA
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        The biggest mistake students make on probation is dropping a difficult class late in the semester to prevent an "F" from further hurting their GPA. If dropping the class puts you below full-time enrollment without prior DSO authorization, your SEVIS record will be instantly terminated for unauthorized drop. <strong>A bad grade is always better than a SEVIS termination.</strong>
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Does Probation Affect Your OPT Application?</h2>
                <p>
                    USCIS (the agency that approves OPT) <strong>does not ask for your GPA</strong> or transcripts when you apply for standard post-completion OPT. They only care about two things:
                </p>
                <ol>
                    <li>Has your SEVIS record been continuously active for at least one full academic year?</li>
                    <li>Has your DSO recommended you for OPT and issued a new I-20?</li>
                </ol>
                <p>
                    If you manage to raise your GPA, successfully graduate, and receive your degree, your past academic probation will not prevent you from getting OPT.
                </p>

                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm my-8">
                    <h4 className="flex items-center gap-2 font-bold text-lg mt-0 mb-3"><XCircle className="w-5 h-5 text-red-500" /> The Real Danger: Academic Suspension</h4>
                    <p className="mb-0 text-sm text-gray-600 dark:text-gray-400">
                        If you fail to raise your GPA by the end of your probation semester, the university will escalate to <strong>Academic Suspension or Dismissal</strong>. This is where your immigration status is destroyed. If you are suspended, you are no longer a student. Your DSO is legally required to terminate your SEVIS record, forcing you to leave the US immediately and stripping you of any future OPT eligibility based on that degree.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What to Do if You Are Suspended</h2>
                <p>
                    If you receive a suspension notice, you have a very short window (usually a few days to a week) to act before your SEVIS record is terminated. You have two main options:
                </p>
                <ol>
                    <li>
                        <strong>Appeal the Decision:</strong> Most universities have an academic appeals process. If you can prove extenuating circumstances (e.g., severe illness, family death), you might be granted one more semester. <em>Your SEVIS record stays active while the appeal is pending.</em>
                    </li>
                    <li>
                        <strong>Transfer Immediately:</strong> You can attempt to find a community college or another university that will accept you on short notice and request a SEVIS transfer. If the transfer is completed <em>before</em> your DSO terminates your record, you can keep your SEVIS ID alive. (Note: You will reset the "one academic year" clock required for OPT).
                    </li>
                </ol>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" />
                        Protect Your Future with TrackMyOPT
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        When you are stressed about failing classes, the last thing you want to worry about is making a technical immigration mistake. <strong>TrackMyOPT's Compliance Dashboard</strong> helps you understand exactly when you must report to SEVIS, tracks your authorized breaks, and securely stores all your I-20s. Don't let a bad semester turn into a permanent deportation.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Mental Health Matters</h2>
                <p>
                    Academic probation is often a symptom of underlying struggles with culture shock, anxiety, depression, or isolation. As an international student, you are dealing with immense pressure to succeed while being thousands of miles away from your support system.
                </p>
                <p>
                    <strong>Do not suffer in silence.</strong> Almost every US university offers free, confidential counseling services. If your academic struggles are rooted in a legitimate medical or psychological issue, a counselor can help you apply for an <strong>Authorized Reduced Course Load (RCL) for Medical Reasons</strong>. This allows you to legally drop below full-time enrollment without losing your F-1 status, giving you the time you need to recover and save your GPA.
                </p>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Maintain Your Status, No Matter What
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    TrackMyOPT is designed to keep you compliant with US immigration law from your first day of class to your final day of OPT. Use our automated tracking tools to ensure you never miss a SEVIS deadline or accidentally violate your F-1 status.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Create Your TrackMyOPT Account
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/withdrawing-from-classes-f1-visa" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Withdrawing from Classes
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Want to drop a class to save your GPA? Learn why this might instantly terminate your SEVIS record.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/fall-out-of-f1-status-options" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Out of Status Reinstatement
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Were you suspended and your SEVIS record terminated? Learn about your options for reinstatement.
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
