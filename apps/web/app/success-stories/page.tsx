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
    title: "Success Stories - TrackMyOPT | Real Student Outcomes",
    description: "See how TrackMyOPT helped thousands of international students land jobs at top companies, manage their OPT timeline, and secure H-1B sponsorship.",
};

export default function SuccessStoriesPage() {
    const successStats = [
        { value: 10000, suffix: "+", label: "Students Helped" },
        { value: 500, suffix: "+", label: "Jobs Landed" },
        { value: 85, suffix: "%", label: "Found H-1B Sponsors" },
        { value: 4.9, suffix: "/5", label: "User Rating" },
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 text-foreground overflow-x-hidden">
            <LandingNavbar />

            {/* Hero */}
            <PageHeroBanner
                badge="Success Stories"
                headline="Real Results from Real Students"
                subheadline="See how TrackMyOPT has helped thousands of international students navigate OPT, find H-1B sponsors, and land their dream jobs."
            />

            {/* Success Stats */}
            <StatsCounter
                title="Proven Track Record"
                subtitle="Numbers that speak for themselves"
                stats={successStats}
            />

            {/* Case Studies */}
            <CaseStudyCards />

            {/* Testimonial Wall */}
            <QuoteWall />

            {/* Submit Story Section */}
            <SubmitStorySection />

            {/* FAQ */}
            <SuccessFAQ />

            {/* CTA */}
            <CTABanner
                badge="Your Turn"
                headline="Ready to Write Your Success Story?"
                subheadline="Join thousands of students who are taking control of their OPT journey."
                primaryCTA={{ text: "Start Free Today", href: "/login" }}
                secondaryCTA={{ text: "See All Features", href: "/features" }}
                variant="gradient"
            />

            <LandingFooter />
        </main>
    );
}
