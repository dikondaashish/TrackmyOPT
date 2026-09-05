import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, Star, Award } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "O-1 Visa for International Students: The H-1B Alternative | TrackMyOPT",
    description: "Are you an F-1 student looking for an H-1B alternative? Learn how to qualify for the O-1 Visa (Extraordinary Ability) straight out of OPT or STEM OPT.",
    keywords: ["O-1 Visa", "O-1A Visa", "O-1B Visa", "H-1B alternative", "Extraordinary ability visa", "F1 to O1", "OPT to O1"],
    openGraph: {
        title: "O-1 Visa for International Students: Can You Qualify After OPT?",
        description: "The O-1 visa has no lottery, no prevailing wage requirements, and no cap. Discover the 8 criteria for the O-1 visa and how F-1 students can build a profile to qualify.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/o1-visa-international-students-opt",
        images: [
            {
                url: "/blog/o1-visa-international-students.png",
                width: 1200,
                height: 630,
                alt: "Workspace with an award certificate, published research paper, and design portfolio representing O-1 visa extraordinary ability",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/o1-visa-international-students-opt",
    },
    twitter: {
        card: "summary_large_image",
        title: "O-1 Visa for International Students: Can You Qualify After OPT?",
        description: "The O-1 visa has no lottery, no prevailing wage requirements, and no cap. Discover the 8 criteria for the O-1 visa and how F-1 students can build a profile to qualify.",
        images: ["/blog/o1-visa-international-students.png"],
    },
};

export default function O1VisaGuidePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-04-07"
                modifiedDate="2026-04-07"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Work Visas</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">H-1B Alternatives</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    O-1 Visa for International Students: Can You Qualify After OPT?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    No lottery. No cap. No prevailing wage requirement. Discover how F-1 students can build an "Extraordinary Ability" profile to bypass the H-1B lottery entirely.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 11 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/o1-visa-international-students.png"
                    alt="Workspace with an award certificate, published research paper, and design portfolio representing O-1 visa extraordinary ability"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    With the H-1B lottery becoming increasingly difficult to win, international students are desperately seeking alternatives. Enter the <strong>O-1 Visa for Individuals with Extraordinary Ability or Achievement</strong>. While it sounds intimidating, many Master's and PhD students—and even highly accomplished Bachelor's students—successfully transition from OPT directly to an O-1 visa every year.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        Why the O-1 is the "Holy Grail" of Work Visas
                    </h3>
                    <ul className="mb-0 mt-2">
                        <li><strong>No Lottery:</strong> If you meet the criteria, you get the visa. No gambling with your future.</li>
                        <li><strong>No Annual Cap:</strong> You can apply at any time of the year.</li>
                        <li><strong>Infinite Renewals:</strong> The O-1 is granted for up to 3 years initially, and can be renewed indefinitely in 1-year increments.</li>
                        <li><strong>No Prevailing Wage:</strong> Startups can sponsor you without being forced to pay massive Department of Labor-mandated salaries.</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What is the O-1 Visa?</h2>
                <p>
                    The O-1 nonimmigrant visa is for individuals who possess extraordinary ability in the sciences, arts, education, business, or athletics, or who have a demonstrated record of extraordinary achievement in the motion picture or television industry.
                </p>
                <p>There are two main subcategories relevant to students:</p>
                <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Star className="w-5 h-5 text-blue-500" />
                            O-1A Visa
                        </h4>
                        <p className="text-sm mb-0">
                            For individuals in the <strong>sciences, education, business, or athletics</strong>. The standard here is very high: you must demonstrate you are one of the small percentage who have arisen to the very top of your field of endeavor.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Star className="w-5 h-5 text-purple-500" />
                            O-1B Visa
                        </h4>
                        <p className="text-sm mb-0">
                            For individuals in the <strong>arts, motion picture, or television industry</strong>. The standard is "distinction," meaning a high level of achievement evidenced by a degree of skill and recognition substantially above that ordinarily encountered.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Qualify: The O-1A Criteria</h2>
                <p>
                    Unless you have won a major, internationally recognized award (like a Nobel Prize), you must meet at least <strong>three (3) of the following eight (8) criteria</strong> to qualify for an O-1A visa:
                </p>

                <div className="space-y-4 my-8">
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">1</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Awards</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Receipt of nationally or internationally recognized prizes or awards for excellence in the field of endeavor.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">2</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Memberships</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Membership in associations in the field which require outstanding achievements of their members, as judged by recognized national or international experts.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">3</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Press/Media</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Published material in professional or major trade publications or major media about the alien and their work.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">4</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Judging Others</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Original scientific, scholarly, or business-related contributions of major significance in the field.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">5</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Original Contributions</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Original scientific, scholarly, or business-related contributions of major significance in the field.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">6</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Authorship</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Authorship of scholarly articles in the field, in professional journals, or other major media.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">7</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">Critical Role</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Employment in a critical or essential capacity for organizations and establishments that have a distinguished reputation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full font-bold">8</div>
                        <div>
                            <h4 className="font-bold mt-0 mb-1">High Remuneration</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Commanding a high salary or other significantly high remuneration for services, as evidenced by contracts or other reliable evidence.</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How Students Can Build an O-1 Profile During OPT</h2>
                <p>
                    Most recent graduates do not organically meet three criteria upon graduation. However, with 1 to 3 years of OPT/STEM OPT, you can intentionally manufacture a qualifying profile. Here is the playbook commonly used by ambitious students:
                </p>

                <h3 className="font-bold text-xl mt-8 mb-3 flex items-center gap-2"><FileText className="w-5 h-5" /> Target 1: Authorship</h3>
                <p>
                    You don't need a PhD to publish. Collaborate with your former professors to co-author papers, write detailed technical articles on platforms like Medium (if curated in top publications) or submit articles to industry trade magazines.
                </p>

                <h3 className="font-bold text-xl mt-8 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Target 2: Judging Others</h3>
                <p>
                    This is often the easiest criterion to satisfy. Reach out to academic journals, industry conferences, or hackathons and offer your services as a peer reviewer or judge. Even reviewing papers for student conferences or judging high-level university hackathons can count if documented correctly.
                </p>

                <h3 className="font-bold text-xl mt-8 mb-3 flex items-center gap-2"><Award className="w-5 h-5" /> Target 3: Original Contributions / Critical Role</h3>
                <p>
                    If you work for a startup on OPT, you naturally play a "critical role." Have the founders write detailed recommendation letters explaining how your specific algorithms, designs, or business strategies directly led to the company securing venture capital funding or massive user growth.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        The Secret Weapon: Expert Letters
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        The backbone of any O-1 petition is the recommendation letters (usually 5 to 8 of them). These cannot just be from your friends or bosses. You need letters from independent industry experts (people who have never worked with you but know of your work) attesting to your extraordinary ability. Start networking now.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">O-1 for Startup Founders</h2>
                <p>
                    Unlike the H-1B, which requires strict employer-employee relationships and prevailing wage compliance, the O-1 is highly favored by venture-backed immigrant founders. If you start a company on OPT and raise venture capital, you can often satisfy the O-1 criteria (e.g., press articles about your funding round, critical role in your own distinguished startup, original business contributions). Your own startup's Board of Directors can sponsor your O-1 visa.
                </p>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Maximize Your OPT Time to Build Your O-1 Profile
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Building an O-1 profile takes time. You need to squeeze every possible day out of your OPT and STEM OPT extensions to publish papers, judge events, and gather press. Use TrackMyOPT to perfectly time your STEM extension and track your remaining days while you build your portfolio.
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
                    <Link href="/blog/h1b-alternatives-work-visas" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                H-1B Alternatives Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Not quite ready for the O-1? Explore 7 other work visas including L-1, TN, E-2, and Cap-Exempt H-1B.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/start-company-f1-opt-visa" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Start a Company on OPT
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Learn the rules for self-employment and starting a business while on post-completion OPT.
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
