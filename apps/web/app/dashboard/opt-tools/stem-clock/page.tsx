import { Metadata } from "next";
import { StemClockTool } from "@/components/dashboard/opt-tools/tools/StemClockTool";

// Comprehensive SEO for STEM OPT Unemployment Calculator
export const metadata: Metadata = {
  title: "STEM OPT Unemployment Calculator | 90 + 60 Day Limit Tracker | Free Tool",
  description:
    "Free STEM OPT unemployment days calculator. Track your unemployment days. Know how many days remain on your STEM OPT extension. Avoid status violation.",
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
    title: "STEM OPT Unemployment Calculator | 90 + 60 Day Unlimited Tracker",
    description:
      "Free tool to calculate your STEM OPT unemployment days. Track 90-day initial + 60-day stem extension limits.",
    url: "https://www.trackmyopt.com/dashboard/opt-tools/stem-clock",
    siteName: "TrackMyOPT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEM OPT Unemployment Calculator",
    description:
      "Track your STEM OPT unemployment days. Monitor your 90-day initial and 60-day stem allowances.",
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/dashboard/opt-tools/stem-clock",
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
      "Free calculator to track STEM OPT unemployment days. F-1 students on STEM OPT have a 90-day initial limit plus an additional 60-day extension allowance.",
    featureList: [
      "Track unemployment days",
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
          text: "STEM OPT provides a separate 60-day unemployment allowance. This is independent of your initial 90-day limit.",
        },
      },
      {
        "@type": "Question",
        name: "Is the STEM OPT unemployment limit 60 days or 150 days?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The STEM OPT extension grants a separate 60-day unemployment allowance. Unused days from your initial 90-day OPT period do not carry forward to the STEM period.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I exceed my unemployment limit on STEM OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Exceeding the unemployment limit terminates your STEM OPT and F-1 status. You would need to leave the United States. This violation can affect future visa applications, so tracking your days accurately is critical.",
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
