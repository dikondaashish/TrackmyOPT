import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "TrackMyOPT Pricing — OPT Compliance Tracking Plans for F-1 Students",
    description:
        "TrackMyOPT Premium automates OPT unemployment tracking, USCIS deadline alerts, and STEM OPT compliance for F-1 students. Free plan available. Pro from $4.99/mo.",
    keywords: [
        "TrackMyOPT pricing",
        "TrackMyOPT premium worth it",
        "OPT tracker free",
        "OPT compliance tool",
        "STEM OPT tracking",
        "F-1 student tools pricing",
        "is TrackMyOPT premium worth it",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/pricing",
    },
    openGraph: {
        title: "TrackMyOPT Premium — OPT Compliance Protection for F-1 Students",
        description:
            "One missed deadline can end your OPT. Premium automates unemployment tracking, USCIS alerts, and STEM OPT compliance. Trusted by 2,500+ students.",
        url: "https://www.trackmyopt.com/pricing",
        siteName: "TrackMyOPT",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "TrackMyOPT Premium — Built for F-1 Students Who Can't Afford a Mistake",
        description:
            "Automated OPT unemployment tracking, USCIS deadline alerts, and STEM OPT compliance tools. Free plan available. Pro from $4.99/mo.",
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
