import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { OptApplyTool } from "@/components/dashboard/opt-tools/tools/OptApplyTool";
import { PublicOptToolPageIntro } from "@/components/seo/PublicOptToolPageIntro";

// Comprehensive SEO for OPT Application Guide
export const metadata: Metadata = {
  title: "OPT Application Guide & I-765 Checklist",
  description:
    "Plan your OPT application with an I-765 checklist, filing-window calculator, and key steps for F-1 students.",
  keywords: [
    // Primary Keywords
    "how to apply for OPT",
    "OPT application",
    "I-765 application",
    "OPT application checklist",
    "F-1 OPT application",

    // Long-tail Keywords
    "OPT application documents required",
    "I-765 form instructions",
    "OPT application fee 2026",
    "how long does OPT application take",
    "OPT application timeline",
    "when to apply for OPT",
    "OPT filing window",
    "90 days before graduation OPT",
    "DSO OPT recommendation",
    "SEVIS OPT application",
    "post completion OPT application",
    "OPT EAD application",
    "F-1 work authorization application",
    "OPT I-20 requirements",
  ],
  // Public tool page — override the dashboard layout's noindex
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Apply for OPT | Complete I-765 Application Guide",
    description:
      "Step-by-step OPT application guide with I-765 checklist, required documents, and filing timeline for F-1 students.",
    url: "https://www.trackmyopt.com/dashboard/opt-tools/opt-apply",
    siteName: "TrackMyOPT",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Apply for OPT | I-765 Checklist",
    description:
      "Complete OPT application guide for F-1 students with required documents and timeline.",
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/dashboard/opt-tools/opt-apply",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Apply for OPT (Optional Practical Training)",
  description:
    "Complete step-by-step guide to apply for post-completion OPT as an F-1 student using Form I-765",
  totalTime: "PT3H",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "470",
  },
  step: [
    {
      "@type": "HowToStep",
      name: "Request OPT Recommendation from DSO",
      text: "Contact your Designated School Official (DSO) to request an OPT recommendation in SEVIS. They will issue a new I-20 with OPT recommendation.",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "Complete Form I-765",
      text: "Fill out USCIS Form I-765 (Application for Employment Authorization). Select category (c)(3)(B) for Post-Completion OPT.",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "Gather Required Documents",
      text: "Collect: passport-style photos, Form I-94, all I-20s, passport copy, visa stamp copy, and any previous EADs.",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "Pay Filing Fee",
      text: "Pay the $470 (online) or $520 (paper) USCIS filing fee.",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "Submit Application",
      text: "File online at USCIS.gov or mail to the designated lockbox. Keep copies of all documents.",
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
      name: "Form I-20 with OPT recommendation",
    },
  ],
};

export default function OptApplyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(jsonLd) }}
      />
      <PublicOptToolPageIntro
        title="OPT Application Guide & I-765 Deadline Calculator"
        description="Use the calculator to organize your post-completion OPT filing dates, then work through the steps below before you submit Form I-765."
      >
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
          <h2 className="font-semibold text-slate-950 dark:text-white">Plan your filing window</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            USCIS instructions generally allow post-completion OPT filings up to
            90 days before the program end date and no later than 60 days after
            it. Your DSO recommendation date is also essential to the timeline.
          </p>
        </div>
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
          <h2 className="font-semibold text-slate-950 dark:text-white">Prepare before you file</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            Review your I-20, coordinate the OPT recommendation with your DSO,
            and gather the identity, status, and prior authorization documents
            required for your application. Check the current USCIS instructions
            before submission.
          </p>
        </div>
      </PublicOptToolPageIntro>
      <OptApplyTool />
    </>
  );
}
