import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import { OptApplyTool } from "@/components/dashboard/opt-tools/tools/OptApplyTool";

// Comprehensive SEO for OPT Application Guide
export const metadata: Metadata = {
  title: "How to Apply for OPT | Complete I-765 Application Checklist 2026",
  description:
    "Step-by-step guide to apply for OPT (Optional Practical Training) as an F-1 student. Complete I-765 application checklist, required documents, filing fees, and timeline. Updated for 2026.",
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
      <OptApplyTool />
    </>
  );
}
