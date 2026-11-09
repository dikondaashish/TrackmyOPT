import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const PAGE_TITLE = "CPT Rules 2026: F-1 Eligibility, Limits and Risks";
const PAGE_DESCRIPTION = "CPT rules for F-1 students in 2026: eligibility, the full-time CPT limit for OPT, SEVP's August guidance, the October lawsuit, and Day 1 CPT risks.";

const CPT_FAQS = [
    { question: "What is CPT and who is eligible?", answer: "Curricular Practical Training (CPT) is F-1 work authorization for training that is an integral part of an established curriculum, such as a required internship, co-op, or practicum. You generally must be enrolled full-time for one full academic year first. The regulation makes an exception for graduate programs that require immediate participation." },
    { question: "Does using CPT affect my OPT eligibility?", answer: "Part-time CPT (20 hours a week or less) does not trigger the OPT bar. Under 8 CFR 214.2(f)(10)(i), students who have received one year or more of full-time CPT are ineligible for post-completion OPT. Ask your DSO to review your exact CPT history." },
    { question: "What changed for CPT in 2026?", answer: "SEVP issued broadcast messages on August 12 and August 24, 2026. They told schools that CPT must be integral to the curriculum and required for all students in that curriculum, and said SEVP is increasing its scrutiny of CPT approvals. Some schools paused certain CPT requests in response." },
    { question: "Did the October 2026 CPT lawsuit block SEVP's guidance?", answer: "Four higher-education organizations sued on October 5, 2026, and asked the court for a preliminary injunction and stay. A request is not a ruling. The government filed its opposition on October 28, and a hearing on the motion was scheduled for November 6, 2026. As of November 8, 2026, we found no ruling on the motion. Check for a decision before relying on headlines, and follow your school's current instructions." },
    { question: "What is Day 1 CPT and is it risky?", answer: "Day 1 CPT usually describes graduate programs that authorize CPT from the first term, relying on the regulation's exception for programs that require immediate participation. It can be lawful, but SEVP's 2026 guidance increased scrutiny of CPT approvals, and later applications such as a change of status generally depend on having maintained status." },
    { question: "Can I do CPT and OPT at the same time?", answer: "CPT is for training before your program end date on the Form I-20. Post-completion OPT is used after you complete your program. Pre-completion OPT has its own rules, so ask your DSO before combining authorizations." },
    { question: "How long does CPT authorization take?", answer: "CPT is authorized by your DSO, not USCIS, so timing depends on your school. Some schools paused certain requests after SEVP's August 2026 guidance. Ask early, and do not start work until your updated Form I-20 shows the CPT authorization." },
] as const;

export const metadata: Metadata = {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    keywords: ["CPT rules 2026", "curricular practical training", "F-1 CPT", "CPT lawsuit 2026", "SEVP CPT guidance", "Day 1 CPT", "CPT vs OPT", "CPT eligibility", "full time CPT OPT impact"],
    openGraph: {
        title: "CPT Rules 2026: F-1 Eligibility, Limits and Risks | TrackMyOPT",
        description: "CPT rules for F-1 students in 2026: eligibility, the full-time CPT limit for OPT, SEVP's August guidance, the October lawsuit, and Day 1 CPT risks.",
        url: "https://www.trackmyopt.com/blog/cpt-complete-guide",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        modifiedTime: "2026-11-08T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/cpt-complete-guide.png",
                width: 1200,
                height: 630,
                alt: "University bulletin board with CPT application forms and internship flyers",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/cpt-complete-guide",
    },
    twitter: {
        card: "summary_large_image",
        title: "CPT Rules 2026: F-1 Eligibility, Limits and Risks | TrackMyOPT",
        description: "CPT rules for F-1 students in 2026: eligibility, the full-time CPT limit for OPT, SEVP's August guidance, the October lawsuit, and Day 1 CPT risks.",
        images: ["/blog/cpt-complete-guide.png"],
    },
};

export default function CPTCompleteGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "CPT Rules 2026", url: "https://www.trackmyopt.com/blog/cpt-complete-guide" },
            ]} />
            <BlogPostSchema
                title={PAGE_TITLE}
                description={PAGE_DESCRIPTION}
                publishedDate="2026-02-02"
                modifiedDate="2026-11-08"
                author="Vinay Kumar"
                canonicalUrl="https://www.trackmyopt.com/blog/cpt-complete-guide"
                faqItems={[...CPT_FAQS]}
            />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">CPT Rules 2026</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">CPT Guide</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500" aria-hidden="true">·</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        14 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    CPT Rules 2026: Eligibility, Application and Risks for F-1 Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Curricular Practical Training (CPT) lets F-1 students do required internships, co-ops, and practicums while still enrolled. The rules got stricter in practice in 2026. This guide covers eligibility, the full-time CPT limit for OPT, SEVP&apos;s August guidance, the October lawsuit, and Day 1 CPT risks.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: February 2, 2026</span>
                    <span>•</span>
                    <span>Updated: November 8, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Hero Image */}
            <figure className="mb-12">
                <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-card">
                    <BlogPostImage src="/blog/cpt-complete-guide.png" alt="University bulletin board with CPT application forms and internship flyers" className="w-full h-[400px] object-cover rounded-xl border border-border shadow-card" sizes="(max-width: 768px) 100vw, 768px" priority />
                </div>
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    CPT allows F-1 students to gain practical work experience while still enrolled in their degree program.
                </figcaption>
            </figure>

            {/* TL;DR */}
            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    <strong>CPT is work authorization for F-1 students to do internships, co-ops, or practicums that are an integral part of an established curriculum.</strong> You generally need one full academic year of full-time enrollment first, unless your graduate program requires immediate participation. Part-time CPT does not trigger the OPT bar, but one year or more of full-time CPT makes you ineligible for post-completion OPT. In August 2026, SEVP told schools that CPT must be required for all students in the curriculum. Universities sued over that guidance on October 5, 2026. The lawsuit itself does not authorize work.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    CPT is authorized by your school (DSO), not USCIS. It must be directly related to your major and integral to an established curriculum. <strong>Part-time CPT does not trigger the OPT bar. One year or more of full-time CPT means no post-completion OPT.</strong>
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov</a>, 8 CFR § 214.2(f)(10)(i)
                </p>
            </div>

            {/* Table of Contents */}
            <div className="border rounded-xl border-border p-6 mb-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#what-is-cpt", "What Is Curricular Practical Training (CPT)?"],
                        ["#cpt-2026-update", "2026 Update: SEVP Guidance, Lawsuit and Scrutiny"],
                        ["#eligibility", "CPT Eligibility Requirements"],
                        ["#part-time-vs-full-time", "Part-Time vs Full-Time CPT"],
                        ["#application", "How to Apply for CPT (Step-by-Step)"],
                        ["#cpt-opt-impact", "How CPT Affects Your OPT Eligibility"],
                        ["#day1-cpt", "Day 1 CPT: Risks in 2026"],
                        ["#cpt-vs-opt", "CPT vs OPT: Key Differences"],
                        ["#compliance", "Staying Compliant on CPT"],
                        ["#faq", "Frequently Asked Questions"],
                        ["#sources", "Sources"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="what-is-cpt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Is Curricular Practical Training (CPT)?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Curricular Practical Training (CPT) is a type of off-campus work authorization available to F-1 students that allows them to participate in <strong>internships, cooperative education (co-ops), practicums, or other work experiences</strong> that are an integral part of their established curriculum.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Unlike <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 underline">OPT</Link>, which is authorized by USCIS and used after (or just before) completing your degree, CPT is authorized <strong>by your school's Designated School Official (DSO)</strong> and is used while you are still actively enrolled in your program.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-l-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            &quot;An F-1 student may be authorized by the DSO to participate in a curricular practical training program that is an integral part of an established curriculum.&quot;
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            Source: <a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2" target="_blank" rel="noopener noreferrer" className="underline">8 CFR 214.2(f)(10)(i)</a>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="border p-4 rounded-xl border-border bg-card shadow-card">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                CPT Can Be Used For
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Required internships</li>
                                <li>• Cooperative education (co-op)</li>
                                <li>• Practicums and clinical rotations</li>
                                <li>• Student teaching placements</li>
                                <li>• Work-study programs for credit</li>
                            </ul>
                        </div>
                        <div className="border p-4 rounded-xl border-border bg-card shadow-card">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                CPT Cannot Be Used For
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Jobs unrelated to your major</li>
                                <li>• Work after graduation (use OPT)</li>
                                <li>• Positions with no academic connection</li>
                                <li>• Work before completing 1 year of study*</li>
                                <li>• Self-employment or freelancing</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="cpt-2026-update" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        2026 Update: SEVP Guidance, Lawsuit and Scrutiny
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The CPT regulation itself did not change in 2026. What changed is how SEVP says schools must apply it. Here is what happened, in order.
                    </p>
                    <div className="overflow-x-auto my-6 surface-card [&>table]:border-hidden [&>table]:my-0">
                        <table className="w-full border-collapse text-sm">
                            <caption className="sr-only">Timeline of 2026 CPT guidance and litigation</caption>
                            <thead>
                                <tr className="bg-surface-strong">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Date</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">What happened</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["August 12, 2026", "SEVP Broadcast Message 2608-01 told DSOs it had seen a rise in CPT authorizations that are not integral to an established curriculum. It said SEVP is increasing its scrutiny of CPT approvals. It told DSOs to authorize CPT only when the degree could not be completed without it and the work is required for all students in that degree."],
                                    ["August 24, 2026", "SEVP Broadcast Message 2608-02 said that when an elective course makes CPT optional, the integral and required elements are not met. It said all students in that curriculum, foreign and American, must take part in the practical training."],
                                    ["October 5, 2026", "The Association of American Universities, NAFSA, the Presidents' Alliance on Higher Education and Immigration, and the Association of Independent Colleges and Universities in Massachusetts sued in the U.S. District Court for the District of Massachusetts. They also filed a motion for a preliminary injunction and stay, with a supporting memorandum. The case is No. 1:26-cv-14520."],
                                    ["October 13, 2026", "Judge Kobick scheduled an in-person hearing on the motion for November 6, 2026."],
                                    ["October 28, 2026", "The government filed its opposition to the motion, after the court extended its deadline to that date."],
                                    ["November 4, 2026", "The plaintiffs filed a reply brief supporting the motion."],
                                    ["November 6, 2026", "The hearing on the preliminary injunction and stay was scheduled for this date."],
                                    ["November 8, 2026", "We found no ruling on the motion. A decision may come soon, so check for one before relying on news headlines."],
                                ].map(([date, event], i) => (
                                    <tr key={date} className={i % 2 === 1 ? "bg-surface" : ""}>
                                        <td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{date}</td>
                                        <td className="p-3 border border-border text-gray-700 dark:text-gray-300">{event}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-3">What the lawsuit does and does not do</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The complaint argues that the August messages unlawfully changed how CPT eligibility is interpreted. The central dispute is elective internships taken for academic credit. Those are the plaintiffs&apos; arguments, not findings by the court. A motion asks the court to act. Filing it does not pause the guidance, approve new CPT, or restart a paused school process.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Schools responded in different ways. For example, MIT&apos;s International Students Office announced a pause on certain requests for training not required of all students in a degree program. One school&apos;s pause is not a nationwide rule. Ask your own DSO how the guidance applies to your program and request.
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-3">Enforcement scrutiny</h3>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                        <li><strong>Schools and DSOs.</strong> SEVP reminded DSOs that signing a Form I-20 to authorize CPT is a certification under penalty of perjury. It warned that improper CPT authorization can lead to withdrawal of the school&apos;s SEVP certification and further action by SEVP and Homeland Security Investigations.</li>
                        <li><strong>Reporting channels.</strong> SEVP listed an email address for reporting suspected practical training fraud and a tipline for DSOs who feel pressured to make improper attestations.</li>
                        <li><strong>STEM OPT employers.</strong> Separately, the regulations let DHS conduct site visits of STEM OPT employers. DHS generally gives 48 hours&apos; notice, except when a visit is triggered by a complaint or other evidence of noncompliance.</li>
                    </ul>
                    <div className="p-5 rounded-xl border mt-6 border-primary-muted bg-primary-soft">
                        <p className="text-blue-900 dark:text-blue-100 text-sm">
                            <strong>Fictional example:</strong> Arjun is a master&apos;s student with an optional summer internship that would earn course credit. His school paused requests like his after the August guidance. He reads about the lawsuit and wants to start anyway. He should not. The lawsuit is not work authorization. Arjun asks his DSO for a written answer, tells the employer his start date depends on authorization, and asks whether pre-completion OPT could fit instead.
                        </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                        Read the full breakdown in <Link href="/blog/cpt-lawsuit-october-2026-internship-rules" className="text-blue-600 dark:text-blue-400 underline">CPT Lawsuit October 2026: What F-1 Students Should Do About Internships</Link>. For the wider compliance picture, see <Link href="/blog/opt-cpt-enforcement-scrutiny-2026" className="text-blue-600 dark:text-blue-400 underline">Increased Scrutiny on OPT and CPT in 2026</Link>.
                    </p>
                </section>

                <section id="eligibility" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        CPT Eligibility Requirements
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        To qualify for CPT, you must meet <strong>all</strong> of the following requirements:
                    </p>

                    <div className="space-y-3">
                        {[
                            { title: "Valid F-1 Status", desc: "You must be in valid F-1 student status with an active SEVIS record. Any status violations disqualify you." },
                            { title: "One Academic Year of Full-Time Study", desc: "You generally must have been lawfully enrolled full-time for one full academic year at an SEVP-certified school. The regulation makes an exception for graduate studies that require immediate participation in CPT." },
                            { title: "Job Offer in Hand", desc: "You must secure the training opportunity before CPT can be authorized. Your DSO records the employer, location, dates, and whether the training is full-time or part-time. SEVP also expects a cooperative agreement or letter from the employer." },
                            { title: "Integral to Curriculum", desc: "The training must be an integral part of an established curriculum. Since SEVP's August 2026 guidance, that generally means practical training required of all students in your program. Elective internships for credit are the main point disputed in the October lawsuit." },
                            { title: "Registered for Relevant Course", desc: "Most schools require you to be simultaneously enrolled in the internship/co-op course that corresponds to your CPT. Check with your international office." },
                        ].map((req, i) => (
                            <div key={i} className="border flex items-start gap-3 p-4 rounded-xl border-border bg-card shadow-card">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{req.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{req.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="part-time-vs-full-time" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Part-Time vs Full-Time CPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The distinction between part-time and full-time CPT is <strong>critical</strong> because it directly affects your future OPT eligibility.
                    </p>

                    <div className="overflow-x-auto my-6 surface-card [&>table]:border-hidden [&>table]:my-0">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-surface-strong">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Part-Time CPT</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Full-Time CPT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-medium">Hours per Week</td>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300">20 hours or less</td>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300">More than 20 hours</td>
                                </tr>
                                <tr className="bg-surface">
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-medium">During Classes?</td>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300">Yes, while enrolled full-time</td>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300">Typically during summer or final semester</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-medium">Impact on OPT</td>
                                    <td className="p-3 border border-border font-semibold text-emerald-700 dark:text-emerald-400">No impact ✓</td>
                                    <td className="p-3 border border-border font-semibold text-red-700 dark:text-red-400">One year or more = No post-completion OPT ✗</td>
                                </tr>
                                <tr className="bg-surface">
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-medium">Duration Limit</td>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300">No practical limit</td>
                                    <td className="p-3 border border-border text-gray-700 dark:text-gray-300">Keep under 12 months to preserve OPT</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950 rounded-r-xl p-6 mt-6">
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Critical Warning: The 12-Month Rule
                        </h3>
                        <p className="text-red-800 dark:text-red-200">
                            Under <a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2" target="_blank" rel="noopener noreferrer" className="underline">8 CFR 214.2(f)(10)(i)</a>, students who have received <strong>one year or more of full-time CPT</strong> are ineligible for post-completion OPT. The regulation does not provide a waiver. A student becomes eligible for another 12 months of practical training at a higher educational level, so ask your DSO how your history applies to your current degree.
                        </p>
                    </div>
                </section>

                <section id="application" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Apply for CPT (Step-by-Step)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Unlike OPT, CPT does not require a USCIS application. Your DSO authorizes CPT directly by updating your I-20. Here is the process:
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: "1", title: "Secure a Job or Internship Offer", desc: "Get a written offer letter with your employer's name, address, job title, start/end dates, and weekly hours. The position must be directly related to your major." },
                            { step: "2", title: "Register for the CPT Course", desc: "Enroll in the internship, co-op, or practicum course at your school. This course must correspond to the CPT work experience. Your academic advisor can help identify the right course." },
                            { step: "3", title: "Get Academic Advisor Approval", desc: "Your faculty advisor or department head must sign off confirming the position is integral to your curriculum. Most schools have a standard CPT recommendation form." },
                            { step: "4", title: "Submit CPT Request to Your DSO", desc: "Bring your offer letter, course registration confirmation, and advisor approval to your International Student Office. Your DSO will review and authorize CPT on your I-20." },
                            { step: "5", title: "Receive Updated I-20", desc: "Your DSO authorizes CPT in SEVIS and gives you a signed Form I-20 showing the employer, location, dates, and whether it is part-time or full-time. This is your work authorization." },
                            { step: "6", title: "Start Work on the Authorized Date", desc: "You cannot begin work before the CPT start date on your Form I-20. Starting early is unauthorized employment and can put your F-1 status at risk." },
                        ].map((item) => (
                            <div key={item.step} className="border flex items-start gap-4 p-5 rounded-xl border-border bg-card shadow-card">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold flex-shrink-0">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                            Planning Your Timeline
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                Get the written offer and employer letter as early as you can.
                            </p>
                            <p className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                Confirm the course or program requirement and any faculty approval.
                            </p>
                            <p className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                Ask your international office for its current processing time. It varies by school, and some schools paused certain requests in 2026.
                            </p>
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                Keep the employer&apos;s start date contingent on your updated Form I-20.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="cpt-opt-impact" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How CPT Affects Your OPT Eligibility
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is the most important thing to understand about CPT. The impact depends entirely on whether your CPT was <strong>part-time or full-time</strong>:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Part-Time CPT (≤20 hours/week)</h3>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                                    <strong>Does not trigger the OPT bar.</strong> The one-year bar in the regulation applies to full-time CPT. Your OPT eligibility still depends on meeting the other OPT and STEM OPT requirements.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Full-Time CPT (&gt;20 hours/week): Under One Year</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    <strong>Does not trigger the OPT bar.</strong> Track your total full-time CPT carefully. Once it reaches one year, post-completion OPT is no longer available.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Full-Time CPT (&gt;20 hours/week): One Year or More</h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                    <strong>You lose post-completion OPT eligibility.</strong> The regulation bars post-completion OPT for students who have received one year or more of full-time CPT. If you have several full-time CPT periods, ask your DSO to review the exact dates rather than relying on a rough month count. See our <Link href="/blog/cpt-12-month-rule-opt-eligibility" className="underline">full-time CPT and OPT guide</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="day1-cpt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Day 1 CPT: Risks in 2026
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        &quot;Day 1 CPT&quot; is an informal name for programs that authorize CPT from the first term. The regulation generally requires one full academic year of full-time enrollment before practical training. It makes an exception for graduate studies that require immediate participation in CPT. Day 1 CPT programs rely on that exception.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Day 1 CPT can be lawful when the program truly requires immediate training. The risk grew in 2026 because SEVP&apos;s August guidance applies to every CPT authorization, including first-term ones.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Why the risk is higher now</h3>
                    <div className="space-y-3">
                        {[
                            "SEVP said CPT cannot be authorized solely for the purpose of employment. It also said it may request documents showing CPT is a core part of the student's studies.",
                            "SEVP said CPT should be authorized only when the training is required for all students in that degree, and that optional training does not qualify.",
                            "SEVP warned that schools misusing CPT may face further scrutiny from SEVP and Homeland Security Investigations, including possible withdrawal of SEVP certification.",
                            "Later applications can look back at your history. For example, USCIS generally cannot approve a change of status, such as F-1 to H-1B, for someone who failed to maintain their previous status.",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-100 dark:border-red-800">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700 dark:text-red-200 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Questions to ask before you enroll or renew</h3>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                        <li>Is practical training required of every student in this program, not just international students?</li>
                        <li>How has the school applied SEVP&apos;s August 2026 guidance to this program?</li>
                        <li>Which documents will the school keep to show the training is integral to the curriculum?</li>
                        <li>Will my CPT history affect post-completion OPT or a later change of status?</li>
                    </ul>

                    <div className="p-5 rounded-xl border mt-6 border-primary-muted bg-primary-soft">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Our Recommendation</h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                            If you are considering a Day 1 CPT program, get written answers from the school and talk to a qualified immigration attorney first. Keep copies of every Form I-20 and CPT authorization. Read our <Link href="/blog/day-1-cpt-vs-opt" className="underline font-medium">Day 1 CPT vs OPT comparison</Link> to weigh the tradeoffs.
                        </p>
                    </div>
                </section>

                <section id="cpt-vs-opt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        CPT vs OPT: Key Differences
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        CPT and OPT are both F-1 work authorizations, but they serve different purposes and have different rules:
                    </p>

                    <div className="overflow-x-auto my-6 surface-card [&>table]:border-hidden [&>table]:my-0">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-surface-strong">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">CPT</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">OPT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Authorized By", "Your DSO (school)", "USCIS (federal)"],
                                    ["When Used", "Before your program end date", "Before or after program completion"],
                                    ["Application", "No USCIS filing. DSO authorizes in SEVIS and updates I-20", "DSO recommendation, then Form I-765 + filing fee to USCIS"],
                                    ["Processing Time", "Set by your school", "Varies; check USCIS processing times"],
                                    ["Duration", "Specific dates set by the DSO", "12 months (+ 24-month STEM extension if eligible)"],
                                    ["Employer Specific?", "Yes, one employer and period per authorization", "No, you can change employers"],
                                    ["Must Be Related to Major?", "Yes", "Yes"],
                                    ["EAD Card Required?", "No, the I-20 is the authorization", "Yes, EAD card required"],
                                ].map(([feature, cpt, opt], i) => (
                                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border border-border text-gray-700 dark:text-gray-300 font-medium">{feature}</td>
                                        <td className="p-3 border border-border text-gray-700 dark:text-gray-300">{cpt}</td>
                                        <td className="p-3 border border-border text-gray-700 dark:text-gray-300">{opt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="compliance" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Staying Compliant on CPT
                    </h2>
                    <div className="space-y-3">
                        {[
                            { tip: "Never start work before your CPT start date", detail: "Even one day early is unauthorized employment, which can result in SEVIS termination and bars on future immigration benefits." },
                            { tip: "Never work past your CPT end date", detail: "Your CPT authorization has a specific end date on your I-20. Working beyond it without renewal is unauthorized employment." },
                            { tip: "Track full-time CPT months carefully", detail: "Keep a personal log of all full-time CPT authorizations. One year or more of full-time CPT makes you ineligible for post-completion OPT." },
                            { tip: "Only work for the employer listed on your I-20", detail: "CPT is employer-specific. If you change employers, you need a new CPT authorization from your DSO before starting work." },
                            { tip: "Maintain full-time enrollment", detail: "You must remain a full-time student while on CPT (unless it's your final semester and you need fewer credits to graduate)." },
                            { tip: "Request new authorization before new dates", detail: "Each CPT authorization covers specific dates. Many schools authorize one term at a time. Submit any extension request before your current end date, and do not assume a past approval covers a new term." },
                        ].map((item, i) => (
                            <div key={i} className="border p-4 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{i + 1}. {item.tip}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Product CTA */}
                <div className="not-prose rounded-xl p-8 my-12 text-ink-foreground bg-ink border border-ink-border shadow-elevated">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Planning OPT After CPT? Track It All</h3>
                        </div>
                        <p className="text-ink-muted mb-6 text-lg max-w-2xl">
                            TrackMyOPT helps you monitor your OPT timeline, unemployment days, and USCIS case status, so you can transition smoothly from CPT to OPT.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-ink-foreground">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Real-time OPT unemployment day tracking</span>
                            </li>
                            <li className="flex items-center gap-3 text-ink-foreground">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Automated USCIS case status monitoring</span>
                            </li>
                            <li className="flex items-center gap-3 text-ink-foreground">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Free account for F-1 students</span>
                            </li>
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-colors bg-blue-600 text-white hover:bg-blue-500 shadow-button"
                            >
                                Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {CPT_FAQS.map((faq, i) => (
                            <div key={i} className="border p-5 rounded-xl border-border bg-card shadow-card" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="sources" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Sources
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                        Checked November 8, 2026. Your school&apos;s DSO authorizes CPT, and USCIS is the official record for OPT. TrackMyOPT is a tracker, not legal advice.
                    </p>
                    <ul className="text-sm space-y-1">
                        <li><a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">8 CFR 214.2(f)(10): practical training regulations</a></li>
                        <li><a href="https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-curricular-practical-training-cpt" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Study in the States: F-1 Curricular Practical Training (CPT)</a></li>
                        <li><a href="https://www.ice.gov/doclib/sevis/pdf/bcm260801.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">SEVP Broadcast Message 2608-01 (August 12, 2026)</a></li>
                        <li><a href="https://www.ice.gov/doclib/sevis/pdf/bcm_260802.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">SEVP Broadcast Message 2608-02 (August 24, 2026)</a></li>
                        <li><a href="https://www.aau.edu/resource-library/aau-files-lawsuit-challenging-changes-to-the-curricular-practical-training-cpt-program-for-international-students" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">AAU case page with the complaint, motion, and memorandum (plaintiff)</a></li>
                        <li><a href="https://www.nafsa.org/legal-defense-CPT" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">NAFSA CPT case page with the opposition, reply, and hearing date (plaintiff)</a></li>
                        <li><a href="https://www.presidentsalliance.org/cpt-litigation/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Presidents&apos; Alliance CPT litigation page with docket filings (plaintiff)</a></li>
                        <li><a href="https://iso.mit.edu/employment/f-1-curricular-practical-training/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">MIT International Students Office: CPT notice</a></li>
                        <li><a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-248/section-248.1" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">8 CFR 248.1: change of nonimmigrant status</a></li>
                    </ul>
                </section>
            </div>

            {/* Related Guides */}
            <div className="border rounded-xl border-border p-6 mt-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/cpt-lawsuit-october-2026-internship-rules" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ CPT Lawsuit October 2026: Internship Rules</Link>
                    <Link href="/blog/opt-cpt-enforcement-scrutiny-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Increased Scrutiny on OPT and CPT (2026)</Link>
                    <Link href="/blog/day-1-cpt-vs-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Day 1 CPT vs OPT: Key Differences</Link>
                    <Link href="/blog/cpt-12-month-rule-opt-eligibility" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Full-Time CPT and OPT Eligibility</Link>
                    <Link href="/blog/pre-completion-opt-vs-cpt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Pre-Completion OPT vs CPT</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day OPT Unemployment Rule</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* Bottom CTA */}
            <div className="not-prose rounded-xl p-8 text-center text-ink-foreground mt-12 bg-ink border border-ink-border shadow-elevated">
                <h2 className="text-2xl font-bold mb-3">Planning Your OPT After CPT?</h2>
                <p className="text-ink-muted mb-6 max-w-lg mx-auto">
                    Join 3,500+ people who have signed up for TrackMyOPT. Use it to track deadlines, monitor unemployment days, and research H-1B sponsors.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-500 shadow-button">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
