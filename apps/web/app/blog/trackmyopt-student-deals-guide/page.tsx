import { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Clock,
    Lock,
    Tag,
    Sparkles,
    Wallet,
    Briefcase,
    Music,
    Shield,
    LogIn,
} from "lucide-react";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getRelatedPostsForSlug } from "@/lib/blog/related-posts";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { formatUsd, OFFERS_CATALOG_TOTAL_SAVINGS_USD } from "@/lib/offers/catalog-savings";

const savingsLabel = formatUsd(OFFERS_CATALOG_TOTAL_SAVINGS_USD);
const canonical = "https://www.trackmyopt.com/blog/trackmyopt-student-deals-guide";

export const metadata: Metadata = {
    title: "TrackMyOPT Student Deals: Save on AI, Health, Banking & More | TrackMyOPT",
    description: `International students and OPT workers can unlock ${savingsLabel}+ in verified partner perks with a college email — but you must log in to TrackMyOPT to claim them.`,
    keywords: [
        "student deals international students",
        "OPT student discounts",
        "college email discounts",
        "TrackMyOPT offers",
        "F-1 student perks",
        "GitHub student pack",
        "Google AI student",
    ],
    openGraph: {
        title: `Save ${savingsLabel}+ With TrackMyOPT Student Deals (Login Required)`,
        description:
            "Verified student discounts on health insurance, AI tools, banking, and career perks — available inside your TrackMyOPT dashboard after sign-in.",
        type: "article",
        url: canonical,
    },
    alternates: { canonical },
    twitter: {
        card: "summary_large_image",
        title: `Save ${savingsLabel}+ With TrackMyOPT Student Deals (Login Required)`,
        description:
            "Verified student discounts on health insurance, AI tools, banking, and career perks — available inside your TrackMyOPT dashboard after sign-in.",
        images: ["/og-image.jpg"],
    },
};

const faqItems = [
    {
        question: "Are TrackMyOPT student deals free to browse?",
        answer: "You can read about the offers on our blog, but to view the full catalog and claim partner links you must create a free TrackMyOPT account and open Special Offers from your dashboard after logging in.",
    },
    {
        question: "Do I need a .edu email for every deal?",
        answer: "Many partners verify with a school email via SheerID, Student Beans, or UNiDAYS. Some offers accept international university domains; others are open to anyone. Each card in the dashboard lists eligibility requirements.",
    },
    {
        question: "Is TrackMyOPT selling these products?",
        answer: "No. Partner offers are provided by third parties. TrackMyOPT may receive compensation for referrals. Always verify terms on the partner site before signing up.",
    },
];

export default function TrackMyOPTStudentDealsGuidePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-09-01"
                modifiedDate="2026-09-01"
                author="Vinay Kumar"
                canonicalUrl={canonical}
                faqItems={faqItems}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Student Life</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Deals</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    TrackMyOPT Student Deals: {savingsLabel}+ in Perks for F-1 & OPT Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    GitHub, Google AI, health insurance, Wise, LinkedIn Premium, and dozens more — curated for
                    international students. <strong>Login required</strong> to view and claim offers inside TrackMyOPT.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 6 min read
                    </span>
                    <span>•</span>
                    <span>Updated September 1, 2026</span>
                </div>
            </header>

            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-6 mb-10">
                <div className="flex items-start gap-3">
                    <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0 mb-2">
                            Deals are dashboard-only
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            These partner perks are <strong>not public coupon codes</strong>. To browse the live catalog,
                            open partner links, and track what you have claimed, sign in to TrackMyOPT and go to{" "}
                            <strong>Special Offers</strong> (<code className="text-sm">/dashboard/offers</code>) or tap
                            the <strong>Deals</strong> chip in the header.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F3162] text-white rounded-full font-semibold hover:bg-[#0F3162]/90 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Log in to view deals
                            </Link>
                            <Link
                                href="/dashboard/offers"
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-amber-300 dark:border-amber-700 rounded-full font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                            >
                                Open Special Offers
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    If you are on F-1, CPT, or OPT, your college email unlocks more value than most students realize.
                    TrackMyOPT collects verified student discounts in one place so you do not have to hunt across Reddit
                    threads and random coupon sites. Our catalog currently totals an estimated{" "}
                    <strong>{savingsLabel}</strong> in documented first-year savings across health, AI, banking, career,
                    and lifestyle partners.
                </p>

                <h2>How to access TrackMyOPT deals (3 steps)</h2>
                <ol>
                    <li>
                        <strong>Create a free TrackMyOPT account</strong> or{" "}
                        <Link href="/login">log in</Link> if you already track your OPT timeline with us.
                    </li>
                    <li>
                        <strong>Open Special Offers</strong> from the dashboard sidebar or the header{" "}
                        <Tag className="inline w-4 h-4" /> Deals button.
                    </li>
                    <li>
                        <strong>Claim an offer</strong> — you will be redirected to the partner to verify with your school
                        email where required.
                    </li>
                </ol>

                <h2>Featured picks for international students</h2>
                <p>After login, start with these high-impact offers in the Featured section:</p>

                <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
                    {[
                        { icon: Shield, title: "ISO Insurance", detail: "Health coverage built for F-1 and OPT workers." },
                        { icon: Shield, title: "Kimber Health", detail: "$0/month Essential Plan help for eligible NY residents." },
                        { icon: Sparkles, title: "Google AI Pro", detail: "12 months free ($240 value) with SheerID verification." },
                        { icon: Briefcase, title: "LinkedIn Premium", detail: "Student Beans rate for InMail and salary insights." },
                        { icon: Wallet, title: "Wise", detail: "Receive money from abroad without bank markup fees." },
                        { icon: Sparkles, title: "ChatGPT Work", detail: "4 months free for eligible U.S. college students." },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="flex gap-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                        >
                            <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">{item.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2>What else is in the catalog?</h2>
                <p>Inside <Link href="/dashboard/offers">Special Offers</Link> you will find deals grouped by category:</p>
                <ul>
                    <li>
                        <strong>Tech & AI</strong> — GitHub Student Pack, Notion, Adobe, Figma, Autodesk, Perplexity, and
                        free tools like Zotero and Photopea
                    </li>
                    <li>
                        <strong>Lifestyle</strong> — Spotify Student, Amazon Prime Student, NordVPN, UNiDAYS, and free
                        streaming options
                    </li>
                    <li>
                        <strong>Career</strong> — ACM/IEEE memberships, test prep discounts, Google Career Certificates,
                        scholarships
                    </li>
                    <li>
                        <strong>Finance & relocation</strong> — Zolve, Remitly, U-Haul student moving, and Sprintax tax
                        filing (partner coupon in-app)
                    </li>
                </ul>

                <h2>Why login is required</h2>
                <p>
                    We keep offers inside the dashboard so links stay current, eligibility notes stay accurate, and we can
                    surface partner perks next to your OPT tools — case tracking, unemployment days, and career resources.
                    Public blog posts explain <em>what</em> is available; your account is where you <em>use</em> them.
                </p>

                <h2>Tips to maximize savings</h2>
                <ul>
                    <li>
                        Verify with your <strong>official university email</strong> when a partner asks — many accept
                        international domains, not just <code>.edu</code>.
                    </li>
                    <li>
                        Stack free tiers first (Google Docs, Zotero, DaVinci Resolve) before paying for premium software.
                    </li>
                    <li>
                        Check <strong>Essential Services</strong> for health insurance and tax partners tied to your OPT
                        compliance needs.
                    </li>
                    <li>Revisit the catalog each semester — student promos change and we add new partners regularly.</li>
                </ul>

                <div className="not-prose my-10 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-8 text-center text-white">
                    <Music className="w-10 h-10 mx-auto mb-4 opacity-90" />
                    <h3 className="text-2xl font-bold mb-2">Ready to claim your perks?</h3>
                    <p className="text-white/90 mb-6 max-w-lg mx-auto">
                        Log in to TrackMyOPT and open Special Offers to unlock {savingsLabel}+ in student deals with your
                        college email.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                    >
                        Log in & view deals
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <h2>Frequently asked questions</h2>
                {faqItems.map((item) => (
                    <div key={item.question}>
                        <h3>{item.question}</h3>
                        <p>{item.answer}</p>
                    </div>
                ))}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    <em>
                        Partner offers are provided by third parties. TrackMyOPT may receive compensation for referrals.
                        Savings estimates are based on documented partner offer values and vary by eligibility. This
                        article is for informational purposes only.
                    </em>
                </p>
            </div>
        
            <RelatedPosts posts={getRelatedPostsForSlug("trackmyopt-student-deals-guide")} />
</article>
    );
}
