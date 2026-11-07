import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { glossaryData, getAllTermsForSchema } from "../../../data/glossary-data";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Generate all possible static paths for the glossary terms
export function generateStaticParams() {
    const allTerms = getAllTermsForSchema();
    return allTerms.map((term) => ({
        slug: term.slug,
    }));
}

// Helper to find a specific term by slug
function getTermBySlug(slug: string) {
    for (const group of Object.values(glossaryData)) {
        const found = group.find((t) => t.slug === slug);
        if (found) return found;
    }
    return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const term = getTermBySlug(slug);
    
    if (!term) {
        return {
            title: "Term Not Found | TrackMyOPT",
        };
    }

    return {
        title: `What is ${term.term}? | TrackMyOPT Glossary`,
        description: term.definition.length > 155 ? term.definition.substring(0, 155) + "..." : term.definition,
        alternates: {
            canonical: `https://www.trackmyopt.com/glossary/${term.slug}`,
        },
    };
}

export default async function GlossaryTermPage({ params }: PageProps) {
    const { slug } = await params;
    const term = getTermBySlug(slug);

    if (!term) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: term.term,
        description: term.definition,
        url: `https://www.trackmyopt.com/glossary/${term.slug}`,
        inDefinedTermSet: "https://www.trackmyopt.com/glossary",
    };

    return (
        <article className="-mt-4 min-h-screen bg-surface py-12 sm:py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Link 
                    href="/glossary" 
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Glossary
                </Link>

                <div className="surface-card p-6 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        {term.term}
                    </h1>
                    
                    <div className="prose prose-blue dark:prose-invert max-w-none prose-lg">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {term.definition}
                        </p>
                    </div>

                    {term.links && term.links.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-4">
                                Related Resources
                            </h3>
                            <div className="flex flex-col gap-3">
                                {term.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        <span className="text-blue-300 dark:text-blue-800">&rarr;</span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* CTA */}
                <div className="mt-12 rounded-xl border border-ink-border bg-ink p-8 text-ink-foreground text-center shadow-elevated">
                    <h2 className="text-2xl font-bold mb-3">Track Your OPT Compliance</h2>
                    <p className="text-ink-muted mb-6 leading-relaxed">
                        Don't let complex immigration rules risk your status. Track timelines, unemployment days, and deadlines.
                    </p>
                    <Link href="/login" className="inline-flex min-h-11 items-center bg-blue-600 text-white font-semibold px-6 rounded-lg shadow-button hover:bg-blue-500 transition-colors">
                        Start Tracking for Free
                    </Link>
                </div>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(jsonLd) }}
            />
        </article>
    );
}
