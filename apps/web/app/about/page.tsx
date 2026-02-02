import { Metadata } from "next";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { PageHeroBanner } from "../../components/marketing/PageHeroBanner";
import { StatsCounter } from "../../components/marketing/StatsCounter";
import { CTABanner } from "../../components/marketing/CTABanner";
import { MissionSection } from "./MissionSection";
import { FounderStory } from "./FounderStory";
import { ValuesSection } from "./ValuesSection";
import { AboutFAQ } from "./AboutFAQ";

export const metadata: Metadata = {
    title: "About Us - TrackMyOPT | Our Mission to Help International Students",
    description: "Learn about the team behind TrackMyOPT and our mission to help F-1 students navigate OPT, find H-1B sponsors, and build successful careers in the US.",
};

export default function AboutPage() {
    const impactStats = [
        { value: 10000, suffix: "+", label: "Students Helped" },
        { value: 500, suffix: "+", label: "Jobs Landed" },
        { value: 25000, suffix: "+", label: "H-1B Sponsors" },
        { value: 98, suffix: "%", label: "User Satisfaction" },
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 text-foreground overflow-x-hidden">
            <LandingNavbar />

            {/* Hero */}
            <PageHeroBanner
                badge="Our Story"
                headline="Built by International Students, for International Students"
                subheadline="We've walked the same path you're on — navigating OPT deadlines, hunting for H-1B sponsors, and building careers in the US. TrackMyOPT is the tool we wish existed when we were in your shoes."
            />

            {/* Mission Statement */}
            <MissionSection />

            {/* Impact Stats */}
            <StatsCounter
                title="Our Impact in Numbers"
                subtitle="Real results for real students, across top universities nationwide"
                stats={impactStats}
            />

            {/* Founder Story Timeline */}
            <FounderStory />

            {/* Values */}
            <ValuesSection />

            {/* FAQ */}
            <AboutFAQ />

            {/* CTA */}
            <CTABanner
                badge="Join 10,000+ Students"
                headline="Start Your Journey Today"
                subheadline="Join thousands of international students who are taking control of their OPT timeline and career path."
                primaryCTA={{ text: "Start Free Today", href: "/login" }}
                secondaryCTA={{ text: "See All Features", href: "/features" }}
                variant="gradient"
            />

            <LandingFooter />
        </main>
    );
}
