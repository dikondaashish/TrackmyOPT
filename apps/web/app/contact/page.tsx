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
    title: "Contact Us - TrackMyOPT | Get Support",
    description: "Get in touch with the TrackMyOPT team. We're here to help with any questions about OPT tracking, billing, or technical support.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 text-foreground overflow-x-hidden">
            <LandingNavbar />

            {/* Hero */}
            <PageHeroBanner
                badge="Contact Us"
                headline="We're Here to Help"
                subheadline="Have a question or need assistance? Our team is ready to help you get the most out of TrackMyOPT."
            />

            {/* Support Channels */}
            <SupportChannels />

            {/* Help Categories */}
            <HelpCategories />

            {/* Contact Form */}
            <ContactForm />

            {/* FAQ */}
            <ContactFAQ />

            {/* CTA */}
            <CTABanner
                headline="Ready to Get Started?"
                subheadline="Join thousands of students managing their OPT journey with TrackMyOPT."
                primaryCTA={{ text: "Start Free Today", href: "/login" }}
                secondaryCTA={{ text: "See All Features", href: "/features" }}
            />

            <LandingFooter />
        </main>
    );
}
