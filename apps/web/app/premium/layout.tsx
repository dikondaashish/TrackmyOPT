import { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
    alternates: { canonical: "https://www.trackmyopt.com/premium" },
};

export default function PremiumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
