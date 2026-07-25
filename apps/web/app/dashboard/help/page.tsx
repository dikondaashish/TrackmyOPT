import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import dynamic from "next/dynamic";

const HelpSection = dynamic(
  () => import("@/components/dashboard/widgets/HelpSection").then((m) => ({ default: m.HelpSection })),
  {
    loading: () => (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
      </div>
    ),
  }
);

// Comprehensive SEO for Help Center / FAQ Page
export const metadata: Metadata = {
  title: "OPT Help Center | F-1 Visa FAQ | TrackMyOPT Support",
  description:
    "Complete help center for F-1 international students. OPT FAQ, STEM OPT questions, USCIS case tracking help, H-1B sponsor guide, unemployment rules explained, and platform support.",
  keywords: [
    // Primary Keywords
    "OPT FAQ",
    "F-1 visa FAQ",
    "OPT help",
    "international student FAQ",
    "OPT questions answers",

    // Long-tail Keywords  
    "what is OPT",
    "how does OPT work",
    "OPT frequently asked questions",
    "F-1 student help",
    "USCIS case status help",
    "OPT application help",
    "STEM OPT questions",
    "H-1B sponsor FAQ",
    "OPT unemployment FAQ",
    "EAD card questions",
    "I-765 help",
    "I-20 OPT questions",
    "OPT employer requirements",
    "OPT reporting requirements",
  ],
  // Public help page — override the dashboard layout's noindex
  robots: { index: true, follow: true },
  openGraph: {
    title: "OPT Help Center | F-1 Visa FAQ",
    description:
      "Get answers to all your OPT questions. F-1 visa FAQ, STEM OPT help, and USCIS guidance.",
    url: "https://www.trackmyopt.com/dashboard/help",
    siteName: "TrackMyOPT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OPT Help Center | F-1 Visa FAQ",
    description:
      "Complete FAQ for F-1 students on OPT. Get answers to common questions.",
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/dashboard/help",
  },
};

// JSON-LD Structured Data - FAQ for AI models
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OPT (Optional Practical Training)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OPT is temporary employment authorization for F-1 students to work in the US for up to 12 months after completing their academic program. Work must be directly related to your major field of study. STEM degree holders can apply for an additional 24-month extension.",
      },
    },
    {
      "@type": "Question",
      name: "How do I track my USCIS case status?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use your 13-character receipt number (e.g., IOE1234567890) to track your case on TrackMyOPT. Free includes manual refresh anytime. Pro adds daily USCIS auto-checks and email notifications when your status changes. You can track EAD applications, H-1B petitions, and more.",
      },
    },
    {
      "@type": "Question",
      name: "What is the 90-day unemployment rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "F-1 students may not accrue more than 90 aggregate unemployment days during initial post-completion OPT. For students approved for STEM OPT, the aggregate maximum across initial OPT and STEM OPT is 150 days. Exceeding the applicable limit can violate F-1 status.",
      },
    },
    {
      "@type": "Question",
      name: "How do I find companies that sponsor H-1B?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TrackMyOPT provides a database of 25,000+ H-1B sponsors. Search by company name, industry, or location. See approval rates, petition counts, and hiring trends to find employers who actively sponsor H-1B visas.",
      },
    },
    {
      "@type": "Question",
      name: "How do I apply for STEM OPT extension?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To apply for STEM OPT: confirm your degree is STEM-designated, ensure your employer is E-Verify enrolled, complete Form I-983 training plan, get a new I-20 from your DSO, and file Form I-765 before your current OPT expires.",
      },
    },
  ],
};

export default function HelpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(jsonLd) }}
      />
      <HelpSection />
    </>
  );
}
