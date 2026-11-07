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
            <section className="-mt-4 pt-14 pb-12 sm:pt-16 sm:pb-14 px-4 bg-surface">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                        OPT &amp; Immigration Glossary
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Navigate the complex alphabet soup of U.S. immigration.
                        From EAD to SEVP, find clear definitions for the terms
                        that impact your F-1 student journey.
                    </p>
                    <p className="mt-4 text-sm font-medium text-primary">
                        50+ Terms Defined
                    </p>
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="border-y border-border bg-background shadow-card sticky top-[72px] z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {Object.keys(glossaryData).map((letter) => (
                            <a
                                key={letter}
                                href={`#letter-${letter}`}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-semibold text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                        <h2 className="mb-6 border-b border-border pb-3 text-3xl sm:text-4xl font-bold text-primary">
                            {letter}
                        </h2>

                        <div className="grid gap-6">
                            {terms.map((term, idx) => {
                                return (
                                    <div
                                        key={idx}
                                        className="surface-card p-6 sm:p-8"
                                    >
                                        <h3 className="text-2xl font-bold text-foreground mb-4">
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
                                                className="inline-flex h-10 items-center gap-1.5 px-4 rounded-lg border border-primary-muted bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground font-medium transition-colors"
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
            <section className="py-16 sm:py-20 px-4 bg-ink">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-ink-foreground mb-4">
                        Don&apos;t just learn the terms — track your OPT
                    </h2>
                    <p className="text-ink-muted text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                        TrackMyOPT helps you monitor unemployment days, filing
                        deadlines, case status, and more — so you stay in
                        compliance while you focus on your career.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex min-h-12 items-center justify-center px-8 rounded-lg bg-blue-600 text-white font-semibold shadow-button hover:bg-blue-500 transition-colors"
                        >
                            Get Started — Free
                        </Link>
                        <Link
                            href="/features/compliance"
                            className="inline-flex min-h-12 items-center justify-center px-8 rounded-lg border border-ink-border text-ink-foreground font-semibold hover:bg-white hover:text-ink transition-colors"
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
