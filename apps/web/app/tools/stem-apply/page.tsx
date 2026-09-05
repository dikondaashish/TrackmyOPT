import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { StemApplyTool } from "@/components/dashboard/opt-tools/tools/StemApplyTool";
import { PublicOptToolPageIntro } from "@/components/seo/PublicOptToolPageIntro";

// Comprehensive SEO for STEM OPT Extension Application Guide
export const metadata: Metadata = {
  title: "STEM OPT Extension Application Guide",
  description:
    "Prepare a STEM OPT extension application with a filing-window calculator, I-983 reminders, and E-Verify planning steps.",
  keywords: [
    // Primary Keywords
    "STEM OPT extension",
    "how to apply for STEM OPT",
    "STEM OPT application",
    "24 month OPT extension",
    "STEM OPT I-765",

    // Long-tail Keywords
    "STEM OPT extension requirements",
    "I-983 training plan",
    "STEM OPT E-Verify requirement",
    "when to apply for STEM OPT extension",
    "STEM OPT filing deadline",
    "STEM designated degree program",
    "STEM CIP code list",
    "STEM OPT application checklist",
    "STEM OPT employer requirements",
    "how long does STEM OPT take to process",
    "STEM OPT cap gap",
    "STEM OPT unemployment allowance",
    "STEM OPT I-20 requirements",
    "STEM OPT self-evaluation",
    "STEM OPT work hours requirement",
  ],
  openGraph: {
    title: "How to Apply for STEM OPT Extension | 24-Month Guide",
    description:
      "Complete STEM OPT extension guide with I-983, E-Verify requirements, and application timeline.",
    url: "https://www.trackmyopt.com/tools/stem-apply",
    siteName: "TrackMyOPT",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEM OPT Extension Application Guide",
    description:
      "Apply for 24-month STEM OPT extension. Complete checklist with I-983 and E-Verify requirements.",
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/tools/stem-apply",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Apply for STEM OPT 24-Month Extension",
  description:
    "Complete step-by-step guide to apply for STEM OPT extension as an F-1 student with a STEM degree",
  totalTime: "PT4H",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "470",
  },
  step: [
    {
      "@type": "HowToStep",
      name: "Verify STEM Degree Eligibility",
      text: "Confirm your degree is on the DHS STEM Designated Degree Program List. Check your CIP code on your I-20.",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "Confirm Employer is E-Verify Enrolled",
      text: "Your employer MUST be enrolled in E-Verify. Ask your employer for their E-Verify company ID number.",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "Complete Form I-983 Training Plan",
      text: "Work with your employer to complete the I-983 Training Plan. Both you and your employer must sign it.",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "Request New I-20 from DSO",
      text: "Submit your I-983 to your DSO and request a new I-20 with STEM OPT extension recommendation.",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "File Form I-765 with USCIS",
      text: "Submit Form I-765 with category (c)(3)(C), your new I-20, I-983, and supporting documents. Apply up to 90 days before your current OPT expires.",
      position: 5,
    },
  ],
  tool: [
    {
      "@type": "HowToTool",
      name: "Form I-765",
    },
    {
      "@type": "HowToTool",
      name: "Form I-983 Training Plan",
    },
    {
      "@type": "HowToTool",
      name: "E-Verify Company ID",
    },
  ],
};

export default function StemApplyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(jsonLd) }}
      />
      <PublicOptToolPageIntro
        title="STEM OPT Extension Application Guide"
        description="Use this planning tool to organize your STEM OPT extension deadline and prepare for the documents and employer details involved."
      >
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
          <h2 className="font-semibold text-slate-950 dark:text-white">Confirm STEM OPT eligibility</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            STEM OPT extension eligibility includes a qualifying STEM degree,
            an E-Verify employer, and a completed Form I-983 training plan.
            Your DSO reviews the information and issues the required I-20
            recommendation.
          </p>
        </div>
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
          <h2 className="font-semibold text-slate-950 dark:text-white">Build a complete filing plan</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            USCIS permits a STEM OPT extension filing up to 90 days before your
            current OPT expires. Use the date below to plan early, and verify
            current filing instructions, fees, and document requirements before
            submitting Form I-765.
          </p>
        </div>
      </PublicOptToolPageIntro>
      <StemApplyTool />
    </>
  );
}
