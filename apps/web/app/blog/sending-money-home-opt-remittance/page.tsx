import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, Globe2, DollarSign, ShieldCheck, Send, Landmark } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "How to Send Money Home from the US on OPT: Cheapest Options (2026) | TrackMyOPT",
    description: "Compare the cheapest ways to send money from the US to your home country while on OPT. Wise, Remitly, Western Union, and bank wire fees compared.",
    keywords: ["Send money home OPT", "International money transfer F1", "Cheapest remittance US", "Wise vs Remitly", "FBAR international student"],
    openGraph: {
        title: "Cheapest Ways to Send Money Home While on OPT",
        description: "You are earning your first US salary. Here is exactly how to send money to your family back home without losing hundreds to bank wire fees.",
        type: "article",
        url: "https://trackmyopt.com/blog/sending-money-home-opt-remittance",
        images: [{ url: "/blog/sending-money-home-opt-remittance.jpg", width: 1200, height: 630, alt: "Smartphone showing a Wise money transfer app next to US dollar bills and a small globe" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/sending-money-home-opt-remittance" }
};

export default function SendingMoneyHomePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-12" modifiedDate="2026-07-12" author="TrackMyOPT Team" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Finance</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Life in US</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">How to Send Money Home from the US on OPT: Cheapest Options</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">You are earning your first US salary on OPT. Here is how to send money to your family back home without losing hundreds to hidden bank wire fees and unfavorable exchange rates.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/sending-money-home-opt-remittance.jpg" alt="Smartphone showing a Wise money transfer app next to US dollar bills and a small globe" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">When you start earning in US dollars on OPT, one of the first things you will want to do is send money back to support your family, repay education loans, or simply save in your home currency. Traditional bank wire transfers can cost $25-50 per transaction <em>plus</em> a 3-5% exchange rate markup. Here are much better options.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Top Remittance Services Compared</h2>
                <div className="overflow-x-auto my-8">
                    <table className="min-w-full text-sm">
                        <thead><tr className="border-b border-gray-200 dark:border-zinc-700">
                            <th className="text-left py-3 px-4 font-bold">Service</th>
                            <th className="text-left py-3 px-4 font-bold">Transfer Fee</th>
                            <th className="text-left py-3 px-4 font-bold">Exchange Rate</th>
                            <th className="text-left py-3 px-4 font-bold">Speed</th>
                        </tr></thead>
                        <tbody>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Wise (TransferWise)</td><td className="py-3 px-4">$1-5</td><td className="py-3 px-4">Mid-market (best)</td><td className="py-3 px-4">1-2 business days</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Remitly</td><td className="py-3 px-4">$0-5</td><td className="py-3 px-4">Slight markup</td><td className="py-3 px-4">Minutes to 3 days</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Xoom (PayPal)</td><td className="py-3 px-4">$0-5</td><td className="py-3 px-4">Moderate markup</td><td className="py-3 px-4">Minutes to 3 days</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Western Union</td><td className="py-3 px-4">$5-25</td><td className="py-3 px-4">High markup</td><td className="py-3 px-4">Minutes (cash pickup)</td></tr>
                            <tr><td className="py-3 px-4 font-medium">Bank Wire Transfer</td><td className="py-3 px-4">$25-50</td><td className="py-3 px-4">Worst markup</td><td className="py-3 px-4">3-5 business days</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Why Wise Is the Gold Standard</h2>
                <p>Wise uses the <strong>mid-market exchange rate</strong>—the same rate you see on Google when you search "USD to INR." Banks and traditional services add a 2-5% markup on top of this rate, which on a $2,000 transfer means you could lose $40-100 without even realizing it. Wise charges a small, transparent fee (usually $1-5) and gives you the real exchange rate.</p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2"><AlertTriangle className="w-5 h-5" /> FBAR Filing Requirement</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">If you maintain bank accounts in your home country (which most international students do), and the combined balance of all your foreign accounts exceeds <strong>$10,000 at any point during the year</strong>, you must file an FBAR (FinCEN Form 114) by April 15. This includes savings accounts, fixed deposits, and even accounts where your parents have signatory authority. Failure to file can result in severe penalties.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Tax Implications of Sending Money Home</h2>
                <p>Sending your own after-tax earnings to your family is <strong>not a taxable event.</strong> You have already paid US income tax on this money through paycheck withholding. However, if you are sending more than $100,000 in a calendar year, you may need to report it on Form 3520 as a gift to a foreign person.</p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Keep Your OPT Compliant While Saving</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Sending money home is smart financial planning, but make sure you are not accidentally falling out of OPT compliance while focused on your finances. <strong>TrackMyOPT</strong> keeps your unemployment counter, SEVIS reporting deadlines, and employer updates on autopilot.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Pro Tips for International Students</h2>
                <ul>
                    <li><strong>Set up recurring transfers.</strong> Most services let you schedule automatic monthly transfers. This saves time and locks in good rates.</li>
                    <li><strong>Use a debit card, not a credit card.</strong> Funding a transfer with a credit card adds a cash advance fee (usually 3-5%).</li>
                    <li><strong>Check for first-time bonuses.</strong> Many services offer zero fees or boosted exchange rates on your first transfer.</li>
                    <li><strong>Keep records.</strong> Save all transfer confirmations for your tax records, especially for FBAR compliance.</li>
                </ul>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Focus on Your Finances, Not Your Status</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Let TrackMyOPT handle the immigration compliance while you handle the money. Automated unemployment tracking, SEVIS deadline alerts, and document storage—all in one place.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/investing-stocks-crypto-401k-opt-tax" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Investing on OPT</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Instead of sending all your money home, consider investing some in stocks, ETFs, and your 401(k).</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/building-credit-international-students-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Building Credit on OPT</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Before you send all your money home, build a US credit history first. It unlocks better rates on everything.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
