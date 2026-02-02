import { Metadata } from "next";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { PageHeroBanner } from "../../components/marketing/PageHeroBanner";
import { StatsCounter } from "../../components/marketing/StatsCounter";
import { CTABanner } from "../../components/marketing/CTABanner";
import { CaseStudyCards } from "./CaseStudyCards";
import { QuoteWall } from "./QuoteWall";
import { SuccessFAQ } from "./SuccessFAQ";
import { SubmitStorySection } from "./SubmitStorySection";

export const metadata: Metadata = {
    title: "Success Stories - TrackMyOPT | Real Students, Real Results",
    description: "Read real success stories from international students who used TrackMyOPT to land jobs at top companies and maintain their OPT status.",
};

export default function SuccessStoriesPage() {
    const successStats = [
        { value: 500, suffix: "+", label: "Jobs Landed" },
        { value: 92, suffix: "%", label: "Interview Success" },
        { value: 100, suffix: "+", label: "Universities" },
        { value: 50, suffix: "+", label: "Industries" },
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 text-foreground overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950" />
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-emerald-100/40 dark:bg-emerald-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="relative z-10">
                <LandingNavbar />

                {/* Hero */}
                <PageHeroBanner
                    badge="Real Students, Real Results"
                    headline="Success Stories from Students Like You"
                    subheadline="Discover how international students used TrackMyOPT to stay compliant, find H-1B sponsors, and land their dream jobs at top companies."
                    gradient="emerald"
                />

                {/* Success Stats */}
                <StatsCounter
                    title="Our Community's Achievements"
                    subtitle="These aren't just numbers — they're careers launched and dreams realized"
                    stats={successStats}
                />

                {/* Case Study Cards */}
                <CaseStudyCards />

                {/* Quote Wall */}
                <QuoteWall />

                {/* FAQ */}
                <SuccessFAQ />

                {/* Submit Story CTA */}
                <SubmitStorySection />

                {/* Final CTA */}
                <CTABanner
                    badge="Your Turn"
                    headline="Start Your Success Story"
                    subheadline="Join thousands of students who've taken control of their OPT journey and landed amazing opportunities."
                    primaryCTA={{ text: "Start Free Today", href: "/login" }}
                    secondaryCTA={{ text: "Explore Features", href: "/features" }}
                    variant="gradient"
                />

                <LandingFooter />
            </div>
        </main>
    );
}
