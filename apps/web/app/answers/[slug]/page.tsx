import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllAnswers, getAnswerBySlug } from "@/lib/answers";
import { ANSWER_CANONICAL_OVERRIDES } from "@/lib/answers/canonical-overrides";
import {
    ArrowRight,
    Clock,
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

    // Answer titles already end in "| TrackMyOPT"; skip the segment template so
    // the brand is not doubled ("... | TrackMyOPT | TrackMyOPT Answers").
    const title = answer.metadata.title.includes("TrackMyOPT")
        ? { absolute: answer.metadata.title }
        : answer.metadata.title;

    return {
        title,
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

                <p className="flex flex-wrap items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>{answer.categoryLabel}</span>
                    <span aria-hidden>·</span>
                    <span>Last Updated: {answer.lastUpdated}</span>
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                    {answer.question}
                </h1>

                <div className="quick-answer bg-blue-50 dark:bg-blue-950 rounded-xl p-6 mb-8">
                    <div>
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

                <div className="key-takeaway bg-amber-50 dark:bg-amber-950 rounded-xl p-6 mb-10">
                    <div>
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
                                <div className="bg-red-50 dark:bg-red-950 rounded-xl p-4 mt-4">
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
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mt-12 mb-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Related Resources
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {answer.relatedLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.href}
                                    className="flex items-center gap-2 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors group"
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
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                                >
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

            <section className="bg-blue-600 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Track Your OPT Status Automatically
                    </h2>
                    <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
                        Join 3,000+ people who have signed up for TrackMyOPT. Use
                        the tools to track deadlines and plan your OPT journey
                        with confidence.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                        Start Free Tracking
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <div className="mt-6 flex items-center justify-center gap-6 text-white text-sm">
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
