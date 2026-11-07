import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { LandingFaqCategories } from "@/components/landing/LandingFaqCategories";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { faqSchema } from "@/lib/seo-schemas";

// Comprehensive SEO for dedicated FAQ page
export const metadata: Metadata = {
    title: "OPT FAQ - Frequently Asked Questions for F-1 Students",
    description:
        "Get answers to common questions about OPT, STEM OPT, unemployment days (90 days + 60 additional for STEM), USCIS case tracking, H-1B sponsorship, and more.",
    keywords: [
        "OPT FAQ",
        "F-1 visa FAQ",
        "OPT questions",
        "STEM OPT FAQ",
        "unemployment days OPT",
        "90 day rule OPT",
        "USCIS case tracking",
        "H-1B sponsorship FAQ",
        "international student FAQ",
        "OPT help",
    ],
    openGraph: {
        title: "OPT FAQ - Frequently Asked Questions | TrackMyOPT",
        description:
            "Complete FAQ for F-1 students on OPT. Get answers about unemployment days, STEM extensions, USCIS tracking, and more.",
        url: "https://www.trackmyopt.com/faq",
        siteName: "TrackMyOPT",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "OPT FAQ | TrackMyOPT",
        description:
            "Answers to all your OPT, STEM OPT, and F-1 visa questions.",
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/faq",
    },
};

export default function FAQPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(faqSchema) }}
            />
            <main className="min-h-screen bg-background">
                <LandingNavbar />

                {/* Hero Section */}
                <section className="border-b border-border bg-surface px-4 pb-16 pt-12 sm:pt-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to know about OPT, STEM OPT extension,
                            unemployment tracking, USCIS case status, and H-1B sponsorship.
                        </p>
                    </div>
                </section>

                {/* FAQ Content */}
                <LandingFaqCategories />

                <LandingFooter />
            </main>
        </>
    );
}
