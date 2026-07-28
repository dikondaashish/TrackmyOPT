import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Briefcase, Car, FileText, Laptop } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Can You Freelance or Do Gig Work (Uber, DoorDash) on OPT? | TrackMyOPT",
    description: "Learn the rules for freelancing, independent contracting (1099), and gig work (Uber, Lyft, DoorDash) while on standard OPT and STEM OPT.",
    keywords: ["Freelance on OPT", "Uber on OPT", "DoorDash international student", "1099 contractor F1", "Gig work OPT rules", "Self-employment OPT"],
    openGraph: {
        title: "Freelancing and Gig Work on OPT: What's Legal?",
        description: "Can you drive for Uber, deliver for DoorDash, or freelance on Upwork while on OPT? The answer depends entirely on your major and which OPT you are on.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/freelance-gig-work-uber-doordash-opt",
        images: [{ url: "/blog/freelance-gig-work-uber-doordash-opt.jpg", width: 1200, height: 630, alt: "Laptop showing Upwork, a phone showing Uber Driver app, and an IRS 1099 form" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/freelance-gig-work-uber-doordash-opt" }
};

export default function FreelanceGigWorkPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-02-27" modifiedDate="2026-02-27" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Work Rules</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Freelancing</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Can You Freelance or Do Gig Work on OPT?</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Can you drive for Uber, deliver for DoorDash, or freelance on Upwork? The answer depends entirely on your major and whether you are on Standard OPT or STEM OPT.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/freelance-gig-work-uber-doordash-opt.jpg" alt="Laptop showing Upwork, a phone showing Uber Driver app, and an IRS 1099 form" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">Earning extra cash through side hustles is a huge part of American culture. But as an F-1 international student, strict rules govern how and where you can work. Let's break down exactly what is allowed regarding freelancing, 1099 independent contracting, and gig economy work.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Golden Rule of OPT: The "Directly Related" Test</h2>
                <p>No matter what type of work you do on OPT—W-2 employee, 1099 contractor, or self-employed—it <strong>must be directly related to your major area of study</strong>. This single rule dictates whether gig work is legal for you.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can I Drive for Uber, Lyft, or DoorDash?</h2>
                <p>For 99.9% of international students, the answer is a firm <strong>NO</strong>.</p>
                <p>To legally drive for Uber or deliver for DoorDash on OPT, you would have to prove to USCIS that driving a taxi or delivering food is <em>directly related</em> to your bachelor's or master's degree. Unless you hold a highly specific degree in logistics (and even then, it is incredibly risky and generally rejected by DSOs), this violates your F-1 status.</p>
                
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> The 1099 Trap</h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">Companies like Uber and DoorDash report your earnings to the IRS using Form 1099-NEC. USCIS can see this tax record. If they see gig economy earnings that clearly don't match your computer science or business degree, they can deny future visas (like H-1B) for unauthorized employment.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can I Freelance on Upwork or Fiverr?</h2>
                <p>Yes, <strong>but only on 12-Month Standard OPT</strong>, and only if the freelance work matches your degree.</p>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Standard OPT (First 12 Months)</h3>
                <p>During standard OPT, you are allowed to be an independent contractor (1099) or self-employed. If you are a Graphic Design major, you can legally take freelance logo design jobs on Upwork. If you are a Computer Science major, you can take freelance coding contracts.</p>
                <ul>
                    <li>You must work at least 20 hours per week (combined across all clients) to stop the unemployment clock.</li>
                    <li>You must report your "employer" as "Self-Employed" or "Independent Contractor" in the SEVP Portal.</li>
                    <li>You must keep meticulous records (invoices, contracts, portfolios) to prove the work was related to your major.</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">STEM OPT Extension (Months 13-36)</h3>
                <p>The rules change drastically on the 24-month STEM OPT extension. <strong>You CANNOT be self-employed, freelance, or work as a 1099 independent contractor on STEM OPT.</strong></p>
                <p>To work on STEM OPT, your employer must:</p>
                <ol>
                    <li>Be enrolled in E-Verify.</li>
                    <li>Have an employer-employee relationship with you (W-2, not 1099).</li>
                    <li>Sign the Form I-983 Training Plan.</li>
                </ol>
                <p>Freelance platforms like Upwork will not sign an I-983 for you, and as an independent contractor, you do not have a qualifying employer-employee relationship.</p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Track Multiple Freelance Clients</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">If you are freelancing on Standard OPT, managing your SEVIS records is tricky. <strong>TrackMyOPT</strong> helps you track your total weekly hours across multiple clients to ensure you meet the 20-hour minimum, preventing accidental unemployment accumulation.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Starting Your Own Business on OPT</h2>
                <p>Similar to freelancing, you <em>can</em> start a business on standard OPT, provided you have the necessary licenses and it relates to your degree. However, once you transition to STEM OPT, you cannot be self-employed. You would have to show a bona fide employer-employee relationship (e.g., your company has a Board of Directors that can fire you), which is highly scrutinized by USCIS.</p>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Freelance Safely</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">If you are doing 1099 contractor work on your 12-month OPT, you need bulletproof documentation. TrackMyOPT provides secure cloud storage for your invoices, contracts, and proof of degree relevance, so you are always ready for an RFE.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT Work</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/multiple-jobs-opt-two-employers" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Working Multiple Jobs</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Can you hold a full-time job and a freelance gig simultaneously? Yes, here's how.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/volunteer-work-opt-employment-rules" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Volunteer Work on OPT</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">If you can't find paid freelance work, does unpaid volunteering stop the unemployment clock?</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
