import { Metadata } from "next";
import { OptClockTool } from "@/components/dashboard/opt-tools/tools/OptClockTool";

// Comprehensive SEO for OPT Unemployment Calculator
export const metadata: Metadata = {
  title: "OPT Unemployment Days Calculator | 90-Day Rule Tracker | Free Tool",
  description:
    "Free OPT unemployment days calculator. Track your 90-day unemployment limit on F-1 OPT. Know exactly how many days you've used and how many remain. Avoid falling out of status.",
  keywords: [
    // Primary Keywords
    "OPT unemployment days calculator",
    "90 day rule OPT",
    "OPT unemployment tracker",
    "OPT 90 day limit",
    "F-1 OPT unemployment",

    // Long-tail Keywords
    "how many unemployment days allowed on OPT",
    "OPT unemployment days counter",
    "OPT 90 day unemployment limit calculator",
    "what happens if I exceed 90 days OPT",
    "OPT unemployment clock",
    "OPT employment gap tracker",
    "F-1 visa 90 day rule",
    "OPT unemployment violation",
    "OPT status violation unemployment",
    "OPT work authorization gap",
    "days without work OPT",
    "OPT job gap counter",
    "how to calculate OPT unemployment days",
    "OPT grace period calculator",
  ],
  openGraph: {
    title: "OPT Unemployment Days Calculator | 90-Day Rule Tracker",
    description:
      "Free tool to calculate your OPT unemployment days. Track the 90-day limit and avoid status violation.",
    url: "https://www.trackmyopt.com/dashboard/opt-tools/opt-clock",
    siteName: "TrackMyOPT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OPT 90-Day Unemployment Calculator",
    description:
      "Track your OPT unemployment days. Know how many of your 90 days you've used.",
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/dashboard/opt-tools/opt-clock",
  },
};

// JSON-LD Structured Data
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OPT Unemployment Days Calculator",
    applicationCategory: "CalculatorApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free calculator to track OPT unemployment days. F-1 students on OPT are limited to 90 days of unemployment. This tool helps you track and avoid exceeding the limit.",
    featureList: [
      "Track 90-day unemployment limit",
      "Visual progress indicator",
      "Email alerts before limit",
      "Employment period logging",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many unemployment days are allowed on OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "F-1 students on post-completion OPT are allowed a maximum of 90 days of unemployment during their entire OPT period. Days start counting from your EAD start date or program end date, whichever is later. Exceeding 90 days can result in falling out of F-1 status.",
        },
      },
      {
        "@type": "Question",
        name: "What counts as employment for OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Employment must be at least 20 hours per week and directly related to your major field of study. This includes: paid employment, self-employment, contract work, employment through an agency, and unpaid internships or volunteer work (if it meets the 20-hour requirement and is in your field).",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I exceed 90 days unemployment on OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Exceeding the 90-day unemployment limit is a violation of your F-1 status. This means your OPT is automatically terminated, and you may need to leave the United States immediately. It can also affect future visa applications and re-entry to the US.",
        },
      },
    ],
  },
];

export default function OptClockPage() {
  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <OptClockTool />
    </>
  );
}
