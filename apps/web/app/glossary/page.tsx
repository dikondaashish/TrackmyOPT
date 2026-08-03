import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import Link from "next/link";
import { glossaryData, getAllTermsForSchema } from "../../data/glossary-data";

export const metadata: Metadata = {
    title: "Immigration Glossary: F-1 Visa Terms Explained | TrackMyOPT",
    description: "Complete glossary of F-1 visa, OPT, STEM OPT, H-1B, and immigration terminology. Definitions for every term you need to understand.",
    alternates: {
        canonical: "https://www.trackmyopt.com/glossary",
    },
};

function buildJsonLd() {
    const allTerms = getAllTermsForSchema();
    return {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        name: "OPT & Immigration Glossary",
        description:
            "Comprehensive glossary of OPT, STEM OPT, F-1 visa, H-1B, and USCIS immigration terms for international students.",
        url: "https://www.trackmyopt.com/glossary",
        hasDefinedTerm: allTerms.map((t) => ({
            "@type": "DefinedTerm",
            name: t.name,
            description: t.description,
            url: `https://www.trackmyopt.com/glossary/${t.slug}`,
        })),
    };
}

export default function GlossaryPage() {
    const jsonLd = buildJsonLd();

    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden pt-16 pb-12 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-6">
                        50+ Terms Defined
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        OPT &amp; Immigration Glossary
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Navigate the complex alphabet soup of U.S. immigration.
                        From EAD to SEVP, find clear definitions for the terms
                        that impact your F-1 student journey.
                    </p>
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="border-y border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-[72px] z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {Object.keys(glossaryData).map((letter) => (
                            <a
                                key={letter}
                                href={`#letter-${letter}`}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                            >
                                {letter}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Glossary Content */}
            <section className="max-w-4xl mx-auto px-4 py-16">
                {Object.entries(glossaryData).map(([letter, terms]) => (
                    <div key={letter} id={`letter-${letter}`} className="mb-16 scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-500 w-12">
                                {letter}
                            </h2>
                            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-grow" />
                        </div>

                        <div className="grid gap-6">
                            {terms.map((term, idx) => {
                                return (
                                    <div
                                        key={idx}
                                        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm"
                                    >
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                            {term.term}
                                        </h3>
                                        <div className="prose prose-blue dark:prose-invert max-w-none">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                                {term.definition}
                                            </p>
                                        </div>
                                        <div className="mt-6 flex flex-wrap items-center gap-4">
                                            <Link
                                                href={`/glossary/${term.slug}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                            >
                                                Read full definition &rarr;
                                            </Link>
                                            
                                            {term.links && term.links.length > 0 && term.links.map((link, lidx) => (
                                                <Link
                                                    key={lidx}
                                                    href={link.href}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                                                >
                                                    <span className="text-blue-300 dark:text-blue-800">&rarr;</span>
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 sm:p-14 shadow-2xl shadow-blue-600/20">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Don&apos;t just learn the terms — track your OPT
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                        TrackMyOPT helps you monitor unemployment days, filing
                        deadlines, case status, and more — so you stay in
                        compliance while you focus on your career.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            Get Started — Free
                        </Link>
                        <Link
                            href="/features/compliance"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Explore Features
                        </Link>
                    </div>
                </div>
            </section>

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(jsonLd) }}
            />
        </>
    );
}
