import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, ShieldCheck, Landmark } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Can You Invest in Stocks, Crypto & 401(k) on OPT? Tax Implications Explained | TrackMyOPT",
    description: "Yes, F-1 students on OPT can invest in stocks and crypto. Learn about capital gains taxes, 401(k) contributions, FBAR reporting, and nonresident alien tax rules.",
    keywords: ["Invest on OPT", "F1 student stocks", "401k OPT", "Crypto taxes international student", "FBAR OPT"],
    openGraph: {
        title: "Investing on OPT: Stocks, Crypto, 401(k) & Tax Rules for F-1 Students",
        description: "You are earning a US salary on OPT. Can you invest it? Learn the tax rules for stocks, cryptocurrency, employer 401(k), and required FBAR filings.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/investing-stocks-crypto-401k-opt-tax",
        images: [{ url: "/blog/investing-stocks-crypto-401k-opt-tax.jpg", width: 1200, height: 630, alt: "Laptop showing a 401k contribution page next to a smartphone with a stock portfolio tracker" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/investing-stocks-crypto-401k-opt-tax" }
};

export default function InvestingOnOPTPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-03-20" modifiedDate="2026-03-20" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Finance</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Taxes</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Can You Invest in Stocks, Crypto & 401(k) on OPT?</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">You are earning a US salary on OPT. Can you invest it in the stock market, cryptocurrency, or your employer's 401(k)? Yes—but the tax rules are different for nonresident aliens.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/investing-stocks-crypto-401k-opt-tax.jpg" alt="Laptop showing a 401k contribution page next to a smartphone with a stock portfolio tracker" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">You just received your first US paycheck on OPT. After paying rent and groceries, you want to start investing. The good news: <strong>F-1 students on OPT are 100% legally allowed to invest</strong> in US stocks, bonds, ETFs, mutual funds, cryptocurrency, and even real estate. But the tax treatment is dramatically different from what US citizens and residents face.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Nonresident Alien (NRA) vs. Resident Alien: Why It Matters</h2>
                <p>Most F-1 students on OPT are classified as <strong>Nonresident Aliens (NRA)</strong> for tax purposes during their first 5 calendar years in the US. This classification changes <em>everything</em> about how your investment income is taxed:</p>
                <ul>
                    <li><strong>NRA:</strong> You file Form 1040-NR. Capital gains from stocks are generally <strong>not taxed</strong> (unless you are in the US for 183+ days in the calendar year). Dividends are taxed at a flat 30% (unless a tax treaty reduces it).</li>
                    <li><strong>Resident Alien:</strong> After passing the Substantial Presence Test (usually year 6+), you file Form 1040 just like a US citizen. Capital gains are taxed at normal rates.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">Stocks & ETFs</h2>
                <p>You can open a brokerage account at any major US firm (Fidelity, Charles Schwab, Vanguard, Robinhood) using your SSN. Buy and sell stocks freely. As an NRA:</p>
                <ul>
                    <li><strong>Capital Gains:</strong> Generally exempt from US tax. You only pay tax on US-source capital gains if you are physically present in the US for 183+ days in the tax year <em>and</em> you have a "tax home" in the US.</li>
                    <li><strong>Dividends:</strong> Taxed at 30% (or a reduced treaty rate). Your broker will automatically withhold this.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">Cryptocurrency</h2>
                <p>Crypto is treated as <strong>property</strong> by the IRS. When you sell Bitcoin, Ethereum, or any crypto for a profit, it is a capital gains event. As an NRA on OPT, the same capital gains exemption generally applies. However, crypto-to-crypto trades (e.g., swapping ETH for SOL) are also taxable events.</p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2"><AlertTriangle className="w-5 h-5" /> FBAR Warning for Crypto</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">If you hold cryptocurrency on a foreign exchange (e.g., Binance, not Binance.US), and the total value of all your foreign financial accounts exceeds $10,000 at any point during the year, you must file an <strong>FBAR (FinCEN Form 114)</strong> by April 15. Failure to file can result in penalties of $10,000 or more per violation.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">401(k) Retirement Plans</h2>
                <p>If your OPT employer offers a 401(k) plan, <strong>you are eligible to participate.</strong> Here is why you should seriously consider it:</p>
                <ul>
                    <li><strong>Employer Match:</strong> If your employer matches 4% of your salary, that is literally free money. Contribute at least enough to get the full match.</li>
                    <li><strong>Tax Deferral:</strong> Traditional 401(k) contributions are pre-tax, reducing your current taxable income.</li>
                    <li><strong>Portability:</strong> If you leave the US, you can keep the 401(k) account open and let it grow. You can also roll it into an IRA.</li>
                </ul>

                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm my-8">
                    <h4 className="flex items-center gap-2 font-bold text-lg mt-0 mb-3"><Landmark className="w-5 h-5 text-blue-500" /> What If You Leave the US?</h4>
                    <p className="mb-0 text-sm text-gray-600 dark:text-gray-400">If you eventually leave the US permanently, you can withdraw your 401(k) funds. The withdrawal will be subject to a mandatory 30% NRA withholding (unless reduced by a tax treaty). You will also owe a 10% early withdrawal penalty if you are under 59½. It's usually better to leave the money invested until retirement.</p>
                </div>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Stay Compliant While You Invest</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Investing is smart, but do not let financial planning distract you from your OPT compliance obligations. <strong>TrackMyOPT</strong> keeps your unemployment counter, SEVIS reporting, and employer updates on autopilot so you can focus on building wealth instead of worrying about deportation.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Key Tax Forms to Know</h2>
                <ul>
                    <li><strong>Form 1040-NR:</strong> Your annual income tax return as a Nonresident Alien.</li>
                    <li><strong>Form 8843:</strong> Must be filed even if you earned $0. It declares your exempt individual status.</li>
                    <li><strong>FBAR (FinCEN 114):</strong> Required if your foreign accounts exceed $10,000 at any point.</li>
                    <li><strong>Form 1099-B:</strong> Sent by your broker showing stock/crypto sales.</li>
                    <li><strong>Form 1099-DIV:</strong> Sent by your broker showing dividend income.</li>
                </ul>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Invest in Your Future—and Your Status</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Building wealth on OPT starts with staying compliant. Use TrackMyOPT to monitor your employment deadlines, SEVIS reporting, and unemployment days while you grow your portfolio.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">OPT Tax Guide</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Complete guide to filing taxes as an F-1 student on OPT.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/first-us-paycheck-deductions-w4" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Understanding Your First Paycheck</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Confused by all the deductions? Learn what FICA, W-4, and net pay mean.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
