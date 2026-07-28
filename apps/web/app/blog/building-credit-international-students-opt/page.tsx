import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, CreditCard, Building2, TrendingUp, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Building Credit as an International Student on OPT | TrackMyOPT",
    description: "Learn how to build a US credit score from scratch as an F-1 international student or OPT worker. Discover the best credit cards that don't require an SSN.",
    keywords: ["Building credit F1 student", "Credit card without SSN", "Credit score OPT", "Deserve EDU", "Discover it student", "International student credit"],
    openGraph: {
        title: "How to Build US Credit as an International Student (2026 Guide)",
        description: "No SSN? No credit history? No problem. Learn the exact steps to build a 700+ US credit score while on your F-1 visa or OPT.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/building-credit-international-students-opt",
        images: [
            {
                url: "/blog/building-credit-international-students-opt.png",
                width: 1200,
                height: 630,
                alt: "Leather wallet with a credit card, next to a smartphone showing a financial dashboard",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/building-credit-international-students-opt",
    }
};

export default function BuildingCreditPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-01-18"
                modifiedDate="2026-01-18"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Finance</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Life in US</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    How to Build US Credit as an International Student (2026 Guide)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    No SSN? No problem. Learn how to build a 700+ credit score from scratch so you can rent apartments, lease cars, and get approved for premium rewards cards.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/building-credit-international-students-opt.png"
                    alt="Leather wallet with a credit card, next to a smartphone showing a financial dashboard"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    In the United States, your credit score is your financial reputation. Without a good credit score, you will struggle to rent an apartment, you will pay massive deposits for utilities, you won't be able to lease a car, and you will be denied the best credit cards. For F-1 international students, building credit is a catch-22: you need credit to get a credit card, but you need a credit card to build credit.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can You Build Credit Without an SSN?</h2>
                <p>
                    <strong>Yes.</strong> This is the biggest myth among international students. You do <em>not</em> need a Social Security Number (SSN) to start building a US credit history.
                </p>
                <p>
                    Credit bureaus (Equifax, Experian, and TransUnion) use several data points to identify you, including your name, date of birth, and US address. Once you get your first credit card (even without an SSN), a credit file is created in your name. When you eventually get an SSN (e.g., when you start CPT or OPT), that SSN will automatically merge with your existing credit file.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Step 1: Get Your First Credit Card</h2>
                <p>
                    Since you have zero credit history, you cannot apply for premium cards like the Chase Sapphire Preferred or Amex Gold. You will be instantly rejected. Instead, you need a "starter card." Here are the best options for F-1 students in 2026:
                </p>

                <div className="space-y-6 my-8">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <CreditCard className="w-6 h-6" /> Deserve EDU Mastercard
                        </h3>
                        <p className="mb-2"><strong>Best for:</strong> Students with absolutely no SSN and no US bank history.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            Deserve specifically targets international students. They use an alternative underwriting process that looks at your passport, student visa, and university enrollment instead of a credit score. It has no annual fee, no foreign transaction fees, and you don't need an SSN to apply.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <CreditCard className="w-6 h-6" /> Discover it® Student Cash Back
                        </h3>
                        <p className="mb-2"><strong>Best for:</strong> Students who have an SSN (or can get one soon) and want great rewards.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            If you already have an on-campus job or CPT and got your SSN, this is the best starter card. It offers excellent cash back (including rotating 5% categories) and is famously forgiving to applicants with a "thin" credit file.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Building2 className="w-6 h-6" /> Secured Credit Cards (from your bank)
                        </h3>
                        <p className="mb-2"><strong>Best for:</strong> The backup plan if you get rejected everywhere else.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            If you open a checking account with Bank of America, Chase, or Wells Fargo, ask a banker in person about a "Secured Credit Card." You give them a $300 cash deposit, and they give you a card with a $300 limit. After 6-12 months of good behavior, they refund your deposit and upgrade it to a normal card.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Step 2: Follow the "Golden Rules" of Credit</h2>
                <p>
                    Once you have your first card, building a 700+ score is actually very easy, but it requires strict discipline. Follow these three rules perfectly for 6 months, and you will have an excellent score.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-8">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2">Pay in Full</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            <strong>Never carry a balance.</strong> Set up AutoPay to pay your full statement balance every single month. Never pay interest.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 text-center">
                        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2">Keep Utilization Low</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            Keep your spending below <strong>10%</strong> of your limit. If your limit is $1,000, never let your statement balance exceed $100.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 text-center">
                        <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2">Be Patient</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            Credit age matters. Keep your oldest starter card open forever (this is why cards with no annual fee are best for your first card).
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        A Warning About Hard Inquiries
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        Do not apply for 5 different credit cards at once. Every time you apply for credit, a "hard inquiry" is added to your report, which temporarily lowers your score. Apply for one starter card, use it responsibly for 6 to 12 months, and then apply for a premium card.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Transitioning to Premium Cards on OPT</h2>
                <p>
                    By the time you graduate and start your OPT job, you should have an SSN and at least 1-2 years of credit history. This unlocks the world of "premium" travel and cash-back cards (like the Chase Sapphire, Amex Gold, or Capital One Venture). 
                </p>
                <p>
                    When applying for these cards on OPT, you can legally state your new, full-time OPT salary as your income. This higher income, combined with your established 700+ credit score, will usually result in immediate approvals and high credit limits (often $5,000 to $10,000+).
                </p>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Ready to Apply for your SSN?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    If you recently secured an on-campus job, CPT, or OPT, you are eligible for a Social Security Number. Check out our step-by-step guide on how to navigate the Social Security Administration (SSA) process as an international student.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/blog/how-to-get-ssn-on-opt"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Read the SSN Guide
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/renting-apartment-without-us-credit-history" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Renting Without US Credit
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Moving off-campus but don't have a credit score yet? Learn the 5 strategies to get approved for an apartment.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                F-1 Student Tax Filing Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Demystifying US taxes for international students. Learn about Form 8843, 1040-NR, and FICA exemptions.
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
