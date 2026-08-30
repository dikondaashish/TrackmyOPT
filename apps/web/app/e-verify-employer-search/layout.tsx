import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

const canonicalUrl = "https://www.trackmyopt.com/e-verify-employer-search";

export const metadata: Metadata = {
  title: { absolute: "E-Verify Employer Search for STEM OPT | TrackMyOPT" },
  description:
    "Search the official USCIS E-Verify employer database free. Learn how to verify a STEM OPT employer, find the Company ID, and interpret results.",
  keywords: [
    "E-Verify employer search",
    "E-Verify company search",
    "STEM OPT employer verification",
    "E-Verify Company ID",
    "USCIS E-Verify search",
    "is my employer E-Verified",
  ],
  alternates: { canonical: canonicalUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Free E-Verify Employer Search for STEM OPT",
    description:
      "Search the official USCIS database and understand what the result means for STEM OPT.",
    url: canonicalUrl,
    type: "website",
    siteName: "TrackMyOPT",
    images: [
      {
        url: "/og-image.png",
        width: 1376,
        height: 768,
        alt: "TrackMyOPT E-Verify Employer Search for STEM OPT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free E-Verify Employer Search for STEM OPT",
    description:
      "Search the official USCIS database and understand what the result means for STEM OPT.",
    images: ["/og-image.png"],
  },
};

export default function EVerifyEmployerSearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <LandingNavbar />
      {children}
      <LandingFooter />
    </>
  );
}
