import Link from "next/link";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import {
    getAllAnswers,
    getAnswersByCategory,
    type AnswerEntry,
} from "@/lib/answers";
import {
    ArrowRight,
    BookOpen,
    Search,
    X,
} from "lucide-react";

const categories = [
    {
        id: "opt-basics",
        label: "OPT Basics",
        description: "Everything about Optional Practical Training",
    },
    {
        id: "work-employment",
        label: "Work & Employment",
        description: "Working rules, employer changes, and compliance",
    },
    {
        id: "uscis-immigration",
        label: "USCIS & Immigration",
        description: "Forms, tracking, and immigration processes",
    },
    {
        id: "tax-finance",
        label: "Tax & Finance",
        description: "Tax filing, FICA, and financial obligations",
    },
    {
        id: "h1b-career",
        label: "H-1B & Career",
        description: "H-1B transition, career planning, and sponsorship",
    },
];

const answersSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "OPT & F-1 Visa Answers",
    description:
        "Clear, expert answers to 50+ common questions about OPT, STEM OPT, F-1 visa, H-1B, and US immigration for international students.",
    url: "https://www.trackmyopt.com/answers",
    publisher: {
        "@type": "Organization",
        name: "TrackMyOPT",
        url: "https://www.trackmyopt.com",
    },
};

function matchesQuery(answer: AnswerEntry, query: string): boolean {
    const needle = query.toLowerCase().trim();
    if (!needle) return true;

    const haystack = [
        answer.question,
        answer.metadata.title,
        answer.metadata.description,
        ...answer.metadata.keywords,
    ]
        .join(" ")
        .toLowerCase();

    return haystack.includes(needle);
}

type Props = {
    searchParams: Promise<{ q?: string }>;
};

export default async function AnswersIndexPage({ searchParams }: Props) {
    const { q } = await searchParams;
    const query = q?.trim() ?? "";
    const allAnswers = getAllAnswers();
    const filteredAnswers = query
        ? allAnswers.filter((answer) => matchesQuery(answer, query))
        : allAnswers;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(answersSchema),
                }}
            />

            <section className="-mt-4 border-b border-border bg-surface">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-16 sm:pb-14">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                            OPT & F-1 Visa Answers
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Clear, concise answers to every question
                            international students ask about OPT, STEM OPT,
                            H-1B, taxes, and US immigration.
                        </p>
                        <p className="mt-4 text-sm font-medium text-primary">
                            {allAnswers.length}+ Expert Answers
                        </p>
                    </div>

                    <form
                        action="/answers"
                        method="get"
                        className="max-w-2xl mx-auto"
                    >
                        <label htmlFor="answers-search" className="sr-only">
                            Search answers
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="answers-search"
                                name="q"
                                type="search"
                                defaultValue={query}
                                placeholder="Search OPT, STEM OPT, H-1B, taxes..."
                                className="w-full pl-12 pr-12 py-4 rounded-xl border border-border bg-card text-foreground shadow-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            />
                            {query && (
                                <Link
                                    href="/answers"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    aria-label="Clear search"
                                >
                                    <X className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </form>
                </div>
            </section>

            <section className="py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {query ? (
                        <div className="mb-16">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                {filteredAnswers.length === 0
                                    ? `No answers found for "${query}"`
                                    : `${filteredAnswers.length} result${filteredAnswers.length === 1 ? "" : "s"} for "${query}"`}
                            </p>
                            {filteredAnswers.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredAnswers.map((answer) => {
                                        return (
                                            <Link
                                                key={answer.slug}
                                                href={`/answers/${answer.slug}`}
                                                className="surface-card-interactive flex items-center gap-3 p-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <span className="text-foreground group-hover:text-primary transition-colors font-medium">
                                                    {answer.question}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 group-hover:text-primary transition-colors" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {categories.map((cat) => {
                                const answers = getAnswersByCategory(cat.id);
                                if (answers.length === 0) return null;

                                return (
                                    <div key={cat.id}>
                                        <div className="mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground">
                                                    {cat.label}
                                                </h2>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {cat.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {answers.map((answer) => (
                                                <Link
                                                    key={answer.slug}
                                                    href={`/answers/${answer.slug}`}
                                                    className="surface-card-interactive flex items-center gap-3 p-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                >
                                                    <span className="text-foreground group-hover:text-primary transition-colors font-medium">
                                                        {answer.question}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 group-hover:text-primary transition-colors" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-16 text-center rounded-xl border border-primary-muted bg-primary-soft p-8 sm:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Can&apos;t find your answer?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                            Check our comprehensive glossary or explore our
                            detailed guides for in-depth coverage.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/glossary"
                                className="inline-flex h-11 items-center gap-2 px-6 rounded-lg border border-border bg-background font-semibold text-foreground shadow-card hover:bg-muted transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                                Browse Glossary
                            </Link>
                            <Link
                                href="/blog"
                                className="inline-flex h-11 items-center gap-2 px-6 rounded-lg bg-primary text-primary-foreground font-semibold shadow-button hover:bg-primary-hover transition-colors"
                            >
                                Read Our Guides
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
