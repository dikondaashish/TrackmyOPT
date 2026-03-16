import { Metadata } from "next";

export const metadata: Metadata = {
    title: "F-1 Student Tax Filing Guide & Tools | TrackMyOPT",
    description: "Navigate U.S. tax filing as an international student on F-1 visa. Learn about Form 8843, 1040-NR, FICA exemption, and get a personalized tax checklist for OPT students.",
    keywords: ["F-1 student taxes", "international student tax filing", "Form 8843", "1040-NR", "FICA exemption F-1", "OPT tax guide", "nonresident alien taxes"],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/tax-filing",
    },
    openGraph: {
        title: "F-1 OPT Student Tax Filing Guide — Avoid Penalties | TrackMyOPT",
        description:
            "Step-by-step tax filing for F-1 students on OPT. Form 8843, 1040-NR, FICA exemption, and STEM OPT tax obligations explained.",
        url: "https://www.trackmyopt.com/features/tax-filing",
        siteName: "TrackMyOPT",
    },
};

export default function TaxFilingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
