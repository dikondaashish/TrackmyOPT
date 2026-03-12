import { Metadata } from "next";
import { LandingFAQEnhanced } from "@/components/landing/LandingFAQEnhanced";
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <LandingNavbar />

                {/* Hero Section */}
                <section className="pt-32 pb-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Everything you need to know about OPT, STEM OPT extension,
                            unemployment tracking, USCIS case status, and H-1B sponsorship.
                        </p>
                    </div>
                </section>

                {/* FAQ Content */}
                <LandingFAQEnhanced />

                <LandingFooter />
            </main>
        </>
    );
}
