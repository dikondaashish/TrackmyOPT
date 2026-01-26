import { Metadata } from "next";
import { StemClockTool } from "@/components/dashboard/opt-tools/tools/StemClockTool";

// Comprehensive SEO for STEM OPT Unemployment Calculator
export const metadata: Metadata = {
  title: "STEM OPT Unemployment Calculator | 150-Day Limit Tracker | Free Tool",
  description:
    "Free STEM OPT unemployment days calculator. Track your 150-day aggregate unemployment limit. Know how many days remain on your STEM OPT extension. Avoid status violation.",
  keywords: [
    // Primary Keywords
    "STEM OPT unemployment calculator",
    "STEM OPT 150 day rule",
    "STEM OPT unemployment tracker",
    "STEM OPT unemployment limit",
    "STEM OPT unemployment days",

    // Long-tail Keywords
    "how many unemployment days allowed on STEM OPT",
    "STEM OPT 150 day aggregate limit",
    "STEM OPT unemployment counter",
    "what happens if I exceed 150 days STEM OPT",
    "STEM OPT employment gap tracker",
    "STEM OPT unemployment clock",
    "STEM extension unemployment limit",
    "24 month OPT unemployment days",
    "STEM OPT job gap calculator",
    "STEM OPT status violation unemployment",
    "aggregate unemployment days OPT",
    "STEM OPT 90 plus 60 days",
    "STEM OPT work authorization gap",
  ],
  openGraph: {
    title: "STEM OPT Unemployment Calculator | 150-Day Limit Tracker",
    description:
      "Free tool to calculate your STEM OPT unemployment days. Track 150-day aggregate limit.",
    url: "https://trackmyopt.com/dashboard/opt-tools/stem-clock",
    siteName: "TrackMyOPT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEM OPT 150-Day Unemployment Calculator",
    description:
      "Track your STEM OPT unemployment days. Know how many of your 150 aggregate days remain.",
  },
  alternates: {
    canonical: "https://trackmyopt.com/dashboard/opt-tools/stem-clock",
  },
};

// JSON-LD Structured Data
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "STEM OPT Unemployment Days Calculator",
    applicationCategory: "CalculatorApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free calculator to track STEM OPT unemployment days. F-1 students on STEM OPT have a 150-day aggregate unemployment limit (total from initial OPT + STEM extension).",
    featureList: [
      "Track 150-day aggregate limit",
      "Visual progress indicator",
      "Include initial OPT days used",
      "Email alerts before limit",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many unemployment days are allowed on STEM OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "STEM OPT has a 150-day AGGREGATE unemployment limit. This means the total unemployment days from both your initial 12-month OPT AND your 24-month STEM extension combined cannot exceed 150 days. If you used 45 days during initial OPT, you have 105 days remaining for your STEM period.",
        },
      },
      {
        "@type": "Question",
        name: "Is the STEM OPT unemployment limit 60 days or 150 days?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The STEM OPT unemployment limit is 150 days AGGREGATE, not an additional 60 days. The 150 days includes all unemployment from both initial OPT (90 days max) and STEM OPT extension. So STEM students get an additional 60 days beyond the initial 90, for a total of 150 days over the entire 3-year period.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I exceed 150 days unemployment on STEM OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Exceeding the 150-day aggregate unemployment limit terminates your STEM OPT and F-1 status. You would need to leave the United States. This violation can affect future visa applications, so tracking your days accurately is critical.",
        },
      },
    ],
  },
];

export default function StemClockPage() {
  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <StemClockTool />
    </>
  );
}
