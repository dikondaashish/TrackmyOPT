import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | TrackMyOPT - Get Help with OPT Tracking",
    description: "Contact TrackMyOPT support for help with OPT timeline tracking, USCIS case status, H-1B sponsors, or account issues. Response within 4 hours.",
    keywords: ["contact TrackMyOPT", "OPT support", "international student help", "USCIS tracking help"],
    alternates: {
        canonical: "https://www.trackmyopt.com/contact",
    },
    openGraph: {
        title: "Contact TrackMyOPT Support",
        description: "Need help with OPT tracking? Our team responds within 4 hours.",
        url: "https://www.trackmyopt.com/contact",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
