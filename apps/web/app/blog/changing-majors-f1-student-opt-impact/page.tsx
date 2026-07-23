import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, GraduationCap, RefreshCw, FileQuestion, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Changing Majors on an F-1 Visa: How it Impacts Your OPT | TrackMyOPT",
    description: "Thinking about switching your major from Business to Computer Science? Learn how changing your degree program impacts your F-1 status and STEM OPT eligibility.",
    keywords: ["Change major F1 visa", "Switch major international student", "STEM OPT change major", "Update I20 new major", "F1 student major change"],
    openGraph: {
        title: "The OPT Impact of Changing Your Major as an F-1 Student",
        description: "Switching to a STEM major can unlock 24 extra months of OPT, but doing it wrong can violate your SEVIS status. Learn the exact process for changing your major.",
        type: "article",
        url: "https://trackmyopt.com/blog/changing-majors-f1-student-opt-impact",
        images: [
            {
                url: "/blog/changing-majors-f1-student-opt-impact.png",
                width: 1200,
                height: 630,
                alt: "Academic desk with a Change of Major Request form, I-20 document, and a course catalog",
            },
        ],
    },
    alternates: {
        canonical: "https://trackmyopt.com/blog/changing-majors-f1-student-opt-impact",
    }
};

export default function ChangingMajorsPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-01-29"
                modifiedDate="2026-01-29"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Academics</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">STEM OPT</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Changing Majors on an F-1 Visa: How it Impacts Your OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Switching from Business to Computer Science? Learn how changing your degree program impacts your F-1 status, your I-20, and your future STEM OPT eligibility.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/changing-majors-f1-student-opt-impact.png"
                    alt="Academic desk with a Change of Major Request form, I-20 document, and a course catalog"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    College is a time for exploration. It is incredibly common for undergraduate and graduate students to change their major halfway through their studies. For a domestic student, this just involves filling out a form with their academic advisor. For an F-1 international student, a change of major requires a direct update to the Department of Homeland Security's SEVIS database. 
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Legal Requirement to Update SEVIS</h2>
                <p>
                    Your I-20 document dictates the legal terms of your stay in the United States. On page 1 of your I-20, under the "Program of Study" section, you will see a specific <strong>Major 1</strong> and its corresponding <strong>CIP Code</strong> (Classification of Instructional Programs code).
                </p>
                <p>
                    If you change your major at your university, <strong>you must notify your Designated School Official (DSO) immediately.</strong> Your DSO is legally required to update your SEVIS record and issue you a brand new I-20 reflecting your new major. If you fail to do this, you are technically studying in a program not authorized by DHS, which is a status violation.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">How Changing Majors Affects OPT</h2>
                <p>
                    Your major is the most important factor in your future Optional Practical Training (OPT). Why? Because DHS strictly mandates that <strong>any job you take on OPT must be directly related to your major field of study.</strong>
                </p>

                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl my-6">
                    <h4 className="flex items-center gap-2 font-bold text-lg mt-0 mb-3"><RefreshCw className="w-5 h-5 text-blue-500" /> Scenario: The Pivot</h4>
                    <p className="mb-0 text-sm">
                        Let's say you started as a <em>Marketing</em> major, but halfway through, you switched to <em>Data Science</em>. When you graduate and apply for your 12-month standard OPT, you can <strong>only</strong> accept jobs related to Data Science. You cannot take a Marketing job, even though you spent two years studying it, because Marketing is no longer the active major on your final I-20.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The STEM OPT Extension Strategy</h2>
                <p>
                    Many international students intentionally change their major to unlock the 24-month STEM OPT extension. If you are currently in a non-STEM major (like Business Administration or Psychology) and you switch to a STEM-designated major (like Business Analytics or Neuroscience), you extend your total US work authorization from 1 year to 3 years.
                </p>
                
                <h3 className="text-xl font-bold mt-6 mb-3">Double Majors and STEM</h3>
                <p>
                    What if you double major? If you have one STEM major (e.g., Mathematics) and one non-STEM major (e.g., Art History), you are fully eligible for the STEM OPT extension—<strong>as long as the job you take is directly related to the STEM major.</strong> You cannot use a STEM extension to work as an art curator.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        CIP Code Verification
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        Just because a major has the word "Science" or "Technology" in it does not guarantee it is STEM-eligible. You must ask your DSO for the exact <strong>CIP Code</strong> of your proposed new major, and check that code against the official ICE STEM Designated Degree Program List.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Changing Your Major While on OPT?</h2>
                <p>
                    Can you change your major <em>after</em> you have already graduated and are currently working on OPT? 
                </p>
                <p>
                    <strong>No.</strong> Your degree has already been conferred. You cannot retroactively change your major to a STEM field just to get an extension. If you want to study a new major, you must enroll in a new degree program, which will require a SEVIS update and will <strong>instantly cancel</strong> your current OPT authorization.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Keep Track of Your Old I-20s
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        When you change your major, your school will issue you a new I-20. <strong>Do not throw the old one away.</strong> When you apply for OPT, the H-1B lottery, or a Green Card, USCIS will ask you to upload copies of <em>every</em> I-20 you have ever been issued. 
                        <strong>Use TrackMyOPT's Document Safe</strong> to securely scan and store all your historical I-20s in the cloud, ensuring you never lose the paper trail of your immigration history.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Step-by-Step: How to Change Your Major</h2>
                <ol>
                    <li>Speak with your academic advisor to formally change your major within the university's academic system.</li>
                    <li>Once approved academically, immediately email your DSO/International Student Office.</li>
                    <li>Provide your DSO with proof of the academic change and ask them to update your SEVIS record.</li>
                    <li>Pick up your new, reprinted I-20. Ensure the "Program of Study" section reflects the new major and new CIP code.</li>
                    <li>Sign the new I-20 in blue ink. Scan it and upload it to your TrackMyOPT Document Safe.</li>
                </ol>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Never Lose an I-20 Again
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Every time you change a major, add a minor, or get CPT authorization, you get a new I-20. USCIS requires you to keep all of them. Use TrackMyOPT's Document Safe to securely store your entire immigration history in one place, ready for your OPT application.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Access the Document Safe
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/opt-job-relevance-letter-guide" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                OPT Job Relevance
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Your OPT job must be related to your new major. Learn how to write a Job Relevance Letter to prove it to USCIS.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/stem-opt-extension-guide-2026" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                STEM OPT Extension Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Did you switch to a STEM major? Learn how to apply for your 24-month OPT extension.
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
