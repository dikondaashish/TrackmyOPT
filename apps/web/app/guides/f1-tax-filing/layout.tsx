import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "The Ultimate F-1 Student Tax Guide 2026 | TrackMyOPT",
    description: "The most comprehensive F-1 student tax guide: Form 8843, 1040-NR, FICA exemption, tax treaties, state taxes, Sprintax vs TurboTax, and step-by-step filing instructions for international students.",
    keywords: ["F-1 student taxes", "international student tax filing", "Form 8843 guide", "1040-NR instructions", "FICA exemption F-1", "F-1 tax treaty", "nonresident alien taxes", "Sprintax review", "F-1 state taxes"],
    alternates: {
        canonical: "https://www.trackmyopt.com/guides/f1-tax-filing",
    },
    openGraph: {
        title: "The Ultimate F-1 Student Tax Guide 2026 — TrackMyOPT",
        description: "Everything F-1 students need to know about US taxes. Forms, deadlines, FICA refunds, tax treaties, and free filing resources.",
        url: "https://www.trackmyopt.com/guides/f1-tax-filing",
        type: "article",
    },
};

export default function TaxGuidePillarLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
