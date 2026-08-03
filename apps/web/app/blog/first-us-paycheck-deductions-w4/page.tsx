import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Understanding Your First US Paycheck: Deductions, W-4 & Net Pay Explained | TrackMyOPT",
    description: "Your first US paycheck on OPT looks smaller than expected. Learn what federal tax, state tax, Social Security, Medicare, and FICA deductions mean for F-1 students.",
    keywords: ["First US paycheck OPT", "W4 international student", "FICA exemption F1", "Pay stub deductions OPT", "Net pay vs gross pay F1"],
    openGraph: {
        title: "Your First US Paycheck on OPT: Where Did Your Money Go?",
        description: "Expected $3,000 but got $2,100? Learn every deduction on your pay stub and which ones F-1 students on OPT are actually exempt from.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/first-us-paycheck-deductions-w4",
        images: [{ url: "/blog/first-us-paycheck-deductions-w4.jpg", width: 1200, height: 630, alt: "Pay stub showing gross pay and deductions next to a W-4 form and a phone with a direct deposit notification" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/first-us-paycheck-deductions-w4" }
};

export default function FirstPaycheckPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-02-20" modifiedDate="2026-02-20" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Finance</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">First Job</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Understanding Your First US Paycheck on OPT</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Expected $3,000 but only received $2,100? Welcome to the US tax system. Here is every deduction explained—and which ones you might be exempt from as an F-1 student.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/first-us-paycheck-deductions-w4.jpg" alt="Pay stub showing gross pay and deductions next to a W-4 form and a phone with a direct deposit notification" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">You started your OPT job, worked hard for two weeks, and excitedly opened your first pay stub. The gross pay says $3,000, but the net pay (what you actually received) is only $2,100. Where did the other $900 go? Let's break down every single deduction line by line.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Your Pay Stub Decoded</h2>
                <div className="overflow-x-auto my-8">
                    <table className="min-w-full text-sm">
                        <thead><tr className="border-b border-gray-200 dark:border-zinc-700">
                            <th className="text-left py-3 px-4 font-bold">Line Item</th>
                            <th className="text-left py-3 px-4 font-bold">Amount</th>
                            <th className="text-left py-3 px-4 font-bold">What It Is</th>
                        </tr></thead>
                        <tbody>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Gross Pay</td><td className="py-3 px-4">$3,000.00</td><td className="py-3 px-4">Your full salary before any deductions</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Federal Income Tax</td><td className="py-3 px-4">-$450.00</td><td className="py-3 px-4">Withheld based on your W-4 form</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">State Income Tax</td><td className="py-3 px-4">-$180.00</td><td className="py-3 px-4">Varies by state (some have 0%)</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Social Security (OASDI)</td><td className="py-3 px-4">-$186.00</td><td className="py-3 px-4">6.2% — F-1 students may be EXEMPT</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Medicare</td><td className="py-3 px-4">-$43.50</td><td className="py-3 px-4">1.45% — F-1 students may be EXEMPT</td></tr>
                            <tr><td className="py-3 px-4 font-bold text-primary">Net Pay</td><td className="py-3 px-4 font-bold text-primary">$2,140.50</td><td className="py-3 px-4 font-bold">What hits your bank account</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The FICA Exemption for F-1 Students</h2>
                <p>This is the most important thing to know: <strong>F-1 students who are classified as Nonresident Aliens (NRA) are exempt from FICA taxes</strong> (Social Security + Medicare). This saves you 7.65% of every paycheck.</p>
                <p>To be classified as NRA, you must have been in the US for fewer than 5 calendar years in F-1/J-1/M-1/Q-1 status. If you started your degree in 2022, you remain NRA through at least 2026.</p>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Is Your Employer Deducting FICA Incorrectly?</h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">Many employers' payroll systems are not configured to recognize the F-1 FICA exemption. If you see Social Security and Medicare deductions on your pay stub, <strong>immediately contact your HR/payroll department</strong> and show them IRS Publication 519 and Internal Revenue Code Section 3121(b)(19). They must correct it and refund the over-withheld amount. If they refuse, you can claim a refund by filing Form 843 and Form 8316 with the IRS.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Filling Out the W-4 Form</h2>
                <p>On your first day at work, HR will hand you a W-4 form. This form tells your employer how much federal income tax to withhold from each paycheck. As a Nonresident Alien, you have special rules:</p>
                <ul>
                    <li>You must write "Nonresident Alien" or "NRA" above the dotted line on Step 1(c).</li>
                    <li>You cannot claim "Married Filing Jointly" status (even if you are married).</li>
                    <li>You are generally only allowed to claim 1 allowance (unless a tax treaty allows more).</li>
                </ul>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Don't Let Payroll Mistakes Cost You</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Between FICA exemptions, W-4 complexities, and SEVIS reporting, starting your first OPT job is overwhelming. <strong>TrackMyOPT</strong> helps you stay compliant by tracking your employment start dates, unemployment counters, and SEVIS reporting deadlines—so you can focus on understanding your pay stub instead of worrying about deportation.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">States with No Income Tax</h2>
                <p>If you can choose where to work, consider these 9 states with no state income tax: <strong>Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming.</strong> Working in one of these states means one less deduction from your paycheck.</p>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Start Your OPT Journey Right</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Your first paycheck is just the beginning. TrackMyOPT ensures you stay compliant from Day 1 with automated employment tracking, SEVIS alerts, and secure document storage.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Create Your TrackMyOPT Account</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/opt-taxes-international-students" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">OPT Tax Guide</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">The complete guide to filing your taxes as an international student on OPT.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/investing-stocks-crypto-401k-opt-tax" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Investing Your Paycheck</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Now that you understand your paycheck, learn how to invest your after-tax income wisely.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
