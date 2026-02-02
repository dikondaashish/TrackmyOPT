import { Metadata } from "next";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { PageHeroBanner } from "../../components/marketing/PageHeroBanner";
import { StatsCounter } from "../../components/marketing/StatsCounter";
import { CTABanner } from "../../components/marketing/CTABanner";
import { PartnershipBenefits } from "./PartnershipBenefits";
import { ProgramTypes } from "./ProgramTypes";
import { PartnerTestimonials } from "./PartnerTestimonials";
import { PartnershipFAQ } from "./PartnershipFAQ";
import { ContactPartnership } from "./ContactPartnership";

export const metadata: Metadata = {
    title: "University Partnerships - TrackMyOPT | DSO & Campus Ambassador Program",
    description: "Partner with TrackMyOPT to help your international students succeed. DSO partnerships, campus ambassador program, and institutional licensing available.",
};

export default function PartnershipsPage() {
    const partnerStats = [
        { value: 50, suffix: "+", label: "Partner Universities" },
        { value: 100, suffix: "+", label: "Campus Ambassadors" },
        { value: 10000, suffix: "+", label: "Students Helped" },
        { value: 98, suffix: "%", label: "DSO Satisfaction" },
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 text-foreground overflow-x-hidden">
            <LandingNavbar />

            {/* Hero */}
            <PageHeroBanner
                badge="University Partnerships"
                headline="Empower Your International Students to Succeed"
                subheadline="Partner with TrackMyOPT to provide your F-1 students with the tools they need to stay compliant, find jobs, and build successful careers in the US."
            />

            {/* Partner Stats */}
            <StatsCounter
                title="Trusted by Universities Nationwide"
                subtitle="Join the growing network of institutions supporting their international students"
                stats={partnerStats}
            />

            {/* Partnership Benefits */}
            <PartnershipBenefits />

            {/* Program Types */}
            <ProgramTypes />

            {/* Partner Testimonials */}
            <PartnerTestimonials />

            {/* FAQ */}
            <PartnershipFAQ />

            {/* Contact Form */}
            <ContactPartnership />

            {/* CTA */}
            <CTABanner
                badge="Start Today"
                headline="Ready to Support Your Students?"
                subheadline="Let's discuss how TrackMyOPT can help your international student office."
                primaryCTA={{ text: "Schedule a Demo", href: "#contact" }}
                secondaryCTA={{ text: "Download Info Pack", href: "#" }}
                variant="gradient"
            />

            <LandingFooter />
        </main>
    );
}
