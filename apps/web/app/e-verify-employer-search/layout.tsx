import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

const canonicalUrl = "https://www.trackmyopt.com/e-verify-employer-search";

export const metadata: Metadata = {
  title: {
    absolute: "E-Verify Employer Search: Company ID vs EIN | TrackMyOPT",
  },
  description:
    "Free E-Verify employer search using official USCIS data, updated daily. See where to get the E-Verify Company Identification Number and why it is not an EIN.",
  keywords: [
    "E-Verify employer search",
    "E-Verify company search",
    "E-Verify Company Identification Number",
    "E-Verify Company ID",
    "is E-Verify number same as EIN",
    "E-Verify Company ID vs EIN",
    "STEM OPT employer verification",
    "is my employer E-Verified",
  ],
  alternates: { canonical: canonicalUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Free E-Verify Employer Search: Company ID vs EIN",
    description:
      "Search the official USCIS E-Verify database, learn where the Company ID comes from, and why it is not an EIN.",
    url: canonicalUrl,
    type: "website",
    siteName: "TrackMyOPT",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TrackMyOPT E-Verify Employer Search for STEM OPT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free E-Verify Employer Search: Company ID vs EIN",
    description:
      "Search the official USCIS E-Verify database, learn where the Company ID comes from, and why it is not an EIN.",
    images: ["/og-image.jpg"],
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
