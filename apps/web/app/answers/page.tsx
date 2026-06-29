import Link from "next/link";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { getAllAnswers, getAnswersByCategory } from "@/lib/answers";
import {
    ArrowRight,
    BookOpen,
    Briefcase,
    FileText,
    DollarSign,
    GraduationCap,
    Search,
    MessageCircle,
} from "lucide-react";

const categories = [
    {
        id: "opt-basics",
        label: "OPT Basics",
        description: "Everything about Optional Practical Training",
        icon: GraduationCap,
        color: "blue",
    },
    {
        id: "work-employment",
        label: "Work & Employment",
        description: "Working rules, employer changes, and compliance",
        icon: Briefcase,
        color: "emerald",
    },
    {
        id: "uscis-immigration",
        label: "USCIS & Immigration",
        description: "Forms, tracking, and immigration processes",
        icon: FileText,
        color: "purple",
    },
    {
        id: "tax-finance",
        label: "Tax & Finance",
        description: "Tax filing, FICA, and financial obligations",
        icon: DollarSign,
        color: "amber",
    },
    {
        id: "h1b-career",
        label: "H-1B & Career",
        description: "H-1B transition, career planning, and sponsorship",
        icon: BookOpen,
        color: "cyan",
    },
];

const colorStyles: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
    blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        hover: "hover:border-blue-300 dark:hover:border-blue-700",
    },
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: "text-emerald-600 dark:text-emerald-400",
        hover: "hover:border-emerald-300 dark:hover:border-emerald-700",
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400",
        hover: "hover:border-purple-300 dark:hover:border-purple-700",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        hover: "hover:border-amber-300 dark:hover:border-amber-700",
    },
    cyan: {
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        border: "border-cyan-200 dark:border-cyan-800",
        icon: "text-cyan-600 dark:text-cyan-400",
        hover: "hover:border-cyan-300 dark:hover:border-cyan-700",
    },
};

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

export default function AnswersIndexPage() {
    const allAnswers = getAllAnswers();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd(answersSchema),
                }}
            />

            <section className="py-16 sm:py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                            <MessageCircle className="w-4 h-4" />
                            {allAnswers.length}+ Expert Answers
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            OPT & F-1 Visa Answers
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Clear, concise answers to every question
                            international students ask about OPT, STEM OPT,
                            H-1B, taxes, and US immigration.
                        </p>
                    </div>

                    <div className="space-y-16">
                        {categories.map((cat) => {
                            const answers = getAnswersByCategory(cat.id);
                            if (answers.length === 0) return null;
                            const styles = colorStyles[cat.color];
                            const Icon = cat.icon;

                            return (
                                <div key={cat.id}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className={`p-2.5 rounded-xl ${styles.bg}`}
                                        >
                                            <Icon
                                                className={`w-6 h-6 ${styles.icon}`}
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {cat.label}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {cat.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {answers.map((answer) => (
                                            <Link
                                                key={answer.slug}
                                                href={`/answers/${answer.slug}`}
                                                className={`flex items-center gap-3 p-4 rounded-xl border ${styles.border} ${styles.hover} bg-white dark:bg-gray-800/50 transition-all group`}
                                            >
                                                <Search
                                                    className={`w-5 h-5 flex-shrink-0 ${styles.icon} opacity-60 group-hover:opacity-100 transition-opacity`}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium">
                                                    {answer.question}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-10">
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
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-300 transition-all"
                            >
                                <BookOpen className="w-4 h-4" />
                                Browse Glossary
                            </Link>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
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
