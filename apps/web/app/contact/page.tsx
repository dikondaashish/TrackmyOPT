import { Metadata } from "next";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { PageHeroBanner } from "../../components/marketing/PageHeroBanner";
import { CTABanner } from "../../components/marketing/CTABanner";
import { SupportChannels } from "./SupportChannels";
import { ContactForm } from "./ContactForm";
import { HelpCategories } from "./HelpCategories";
import { ContactFAQ } from "./ContactFAQ";

export const metadata: Metadata = {
    title: "Contact & Support - TrackMyOPT | We're Here to Help",
    description: "Get help with TrackMyOPT. Contact our support team, browse FAQs, or submit a request. We typically respond within 24 hours.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 text-foreground overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950" />
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-cyan-100/40 dark:bg-cyan-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="relative z-10">
                <LandingNavbar />

                {/* Hero */}
                <PageHeroBanner
                    badge="Here to Help"
                    headline="Get in Touch with Our Team"
                    subheadline="Have questions about your OPT, need help with the platform, or want to share feedback? We're here for you and typically respond within 24 hours."
                    gradient="cyan"
                />

                {/* Support Channels */}
                <SupportChannels />

                {/* Contact Form */}
                <ContactForm />

                {/* Help Categories */}
                <HelpCategories />

                {/* FAQ */}
                <ContactFAQ />

                {/* CTA */}
                <CTABanner
                    badge="Ready to Start?"
                    headline="Try TrackMyOPT Free Today"
                    subheadline="Join thousands of students taking control of their OPT journey."
                    primaryCTA={{ text: "Get Started Free", href: "/login" }}
                    secondaryCTA={{ text: "View All Features", href: "/features" }}
                    variant="gradient"
                />

                <LandingFooter />
            </div>
        </main>
    );
}
