import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllAnswers, getAnswerBySlug } from "@/lib/answers";
import { ANSWER_CANONICAL_OVERRIDES } from "@/lib/answers/canonical-overrides";
import {
    ArrowRight,
    BookOpen,
    Clock,
    MessageCircle,
    Lightbulb,
    Shield,
} from "lucide-react";
import { ImmigrationContentDisclaimer } from "@/components/legal/ImmigrationContentDisclaimer";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return getAllAnswers().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const answer = getAnswerBySlug(slug);
    if (!answer) return {};

    const canonical =
        ANSWER_CANONICAL_OVERRIDES[slug] ??
        `https://www.trackmyopt.com/answers/${answer.slug}`;

    return {
        title: answer.metadata.title,
        description: answer.metadata.description,
        keywords: answer.metadata.keywords,
        alternates: {
            canonical,
        },
        openGraph: {
            title: answer.metadata.title,
            description: answer.metadata.description,
            url: canonical,
            siteName: "TrackMyOPT",
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: answer.metadata.title,
            description: answer.metadata.description,
        },
    };
}

export default async function AnswerPage({ params }: Props) {
    const { slug } = await params;
    const answer = getAnswerBySlug(slug);
    if (!answer) notFound();

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: answer.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: answer.shortAnswer,
                },
            },
        ],
    };

    const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: answer.question,
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: [".quick-answer", ".key-takeaway"],
        },
        url: `https://www.trackmyopt.com/answers/${answer.slug}`,
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.trackmyopt.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Answers",
                item: "https://www.trackmyopt.com/answers",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: answer.question,
            },
        ],
    };

    const categoryColors: Record<string, string> = {
        "opt-basics":
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        "work-employment":
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        "uscis-immigration":
            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        "tax-finance":
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        "h1b-career":
            "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(faqSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(speakableSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(breadcrumbSchema),
                }}
            />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <nav className="mb-8">
                    <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <li>
                            <Link
                                href="/"
                                className="hover:text-blue-600 transition-colors"
                            >
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link
                                href="/answers"
                                className="hover:text-blue-600 transition-colors"
                            >
                                Answers
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                            {answer.question}
                        </li>
                    </ol>
                </nav>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[answer.category] || categoryColors["opt-basics"]}`}
                    >
                        {answer.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        Last Updated: {answer.lastUpdated}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                    {answer.question}
                </h1>

                <div className="quick-answer bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                Quick Answer
                            </p>
                            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                {answer.shortAnswer}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="key-takeaway bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                Key Takeaway
                            </p>
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                {answer.keyTakeaway}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {answer.sections.map((section, i) => (
                        <section key={i}>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {section.heading}
                            </h2>
                            {section.paragraphs.map((p, j) => (
                                <p
                                    key={j}
                                    className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                                >
                                    {p}
                                </p>
                            ))}
                            {section.bulletPoints && (
                                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                                    {section.bulletPoints.map((bp, k) => (
                                        <li key={k}>{bp}</li>
                                    ))}
                                </ul>
                            )}
                            {section.importantNote && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-4">
                                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                                        {section.importantNote}
                                    </p>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                <ImmigrationContentDisclaimer className="border-t border-gray-200 dark:border-zinc-800 pt-6 mt-10" />

                {answer.relatedLinks.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mt-12 mb-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Related Resources
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {answer.relatedLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.href}
                                    className="flex items-center gap-2 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700/50 transition-colors group"
                                >
                                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                                        {link.text}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {answer.relatedQuestions.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            People Also Ask
                        </h2>
                        <div className="space-y-2">
                            {answer.relatedQuestions.map((rq, i) => (
                                <Link
                                    key={i}
                                    href={`/answers/${rq.slug}`}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                                >
                                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                                        {rq.question}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Track Your OPT Status Automatically
                    </h2>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        Join 2,500+ international students who use TrackMyOPT to
                        stay compliant, track deadlines, and navigate their F-1
                        journey with confidence.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-gray-900 rounded-full shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        Start Free Tracking
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <div className="mt-6 flex items-center justify-center gap-6 text-white/70 text-sm">
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4" />
                            No credit card required
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Setup in 2 minutes
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}
