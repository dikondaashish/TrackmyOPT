import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { StemClockTool } from "@/components/dashboard/opt-tools/tools/StemClockTool";
import { PublicOptToolPageIntro } from "@/components/seo/PublicOptToolPageIntro";

// Comprehensive SEO for STEM OPT Unemployment Calculator
export const metadata: Metadata = {
  title: "STEM OPT Unemployment Calculator",
  description:
    "Track STEM OPT unemployment days and plan around the additional 60-day allowance and 150-day combined OPT limit.",
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
  // Public tool page — override the dashboard layout's noindex
  robots: { index: true, follow: true },
  openGraph: {
    title: "STEM OPT Unemployment Calculator",
    description:
      "Track STEM OPT unemployment days and plan around the 150-day combined OPT limit.",
    url: "https://www.trackmyopt.com/dashboard/opt-tools/stem-clock",
    siteName: "TrackMyOPT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEM OPT Unemployment Calculator",
    description:
      "Track STEM OPT unemployment days and plan around the 150-day combined OPT limit.",
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
      "Free calculator to track STEM OPT extension unemployment days. F-1 students may not exceed 150 days of unemployment across post-completion OPT and a STEM OPT extension.",
    featureList: [
      "Track unemployment days",
      "Visual progress indicator",
      "Plan around the 150-day combined OPT limit",
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
          text: "F-1 students may not exceed 150 days of unemployment across post-completion OPT and a STEM OPT extension. The STEM extension can add up to 60 days beyond the regular OPT period.",
        },
      },
      {
        "@type": "Question",
        name: "Is the STEM OPT unemployment limit 60 days or 150 days?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The STEM extension period has up to 60 days of unemployment time, while the maximum across regular OPT and STEM OPT together is 150 days. Review your full OPT employment history when planning.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I exceed my unemployment limit on STEM OPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Exceeding an unemployment limit can affect F-1 status and future immigration benefits. Contact your DSO or a qualified immigration professional promptly if you are close to a limit or are unsure how employment is counted.",
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
          dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(schema) }}
        />
      ))}
      <PublicOptToolPageIntro
        title="STEM OPT Unemployment Calculator"
        description="Record STEM extension employment dates and use this planning tool to monitor the unemployment time that may apply to your F-1 status."
      >
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
          <h2 className="font-semibold text-slate-950 dark:text-white">Understand the combined limit</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            STEM OPT adds up to 60 days of unemployment time. Across regular
            OPT and the STEM extension, the combined unemployment limit is 150
            days. Keep your initial OPT history in mind when planning.
          </p>
        </div>
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
          <h2 className="font-semibold text-slate-950 dark:text-white">Keep your records current</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            Track employment changes promptly and retain supporting information.
            Your DSO is the right source for how a particular role, start date,
            or reporting update affects your SEVIS record and STEM OPT status.
          </p>
        </div>
      </PublicOptToolPageIntro>
      <StemClockTool />
    </>
  );
}
