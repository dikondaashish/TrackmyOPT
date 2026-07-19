import { Metadata } from "next";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";
import Link from "next/link";
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, Building2, FileCheck, MapPin } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "OPT & STEM OPT Job Offer Verification Checklist (Before You Accept)",
  description:
    "Before accepting any OPT or STEM OPT job offer, verify W-2 status, E-Verify, degree alignment, I-983 readiness, and SEVIS/I-20 accuracy. Use this compliance checklist to protect your F-1 status.",
  keywords: [
    "OPT job offer checklist",
    "STEM OPT employer verification",
    "E-Verify Company ID STEM OPT",
    "I-983 employer requirements",
    "SEVIS update OPT",
    "W-2 vs 1099 STEM OPT",
  ],
  openGraph: {
    title: "OPT & STEM OPT Job Offer Verification Checklist | TrackMyOPT",
    description:
      "A complete pre-acceptance checklist for F-1 students on OPT or STEM OPT: employer verification, DSO confirmation, and SEVIS/I-20 accuracy.",
    url: "https://www.trackmyopt.com/blog/opt-stem-opt-job-offer-verification-checklist",
    type: "article",
    images: [
      {
        url: "https://www.trackmyopt.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "OPT & STEM OPT Job Offer Verification Checklist",
      },
    ],
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/blog/opt-stem-opt-job-offer-verification-checklist",
  },
};

const employerChecklist = [
  "W-2 role confirmed (not 1099/contractor).",
  "For STEM OPT: E-Verify enrollment is active. Ask for the company E-Verify ID and verify details at e-verify.uscis.gov.",
  "Job title and responsibilities are directly related to your degree field.",
  "Start date is on or after EAD start date and before EAD end date.",
  "For STEM OPT: salary is comparable to similarly situated U.S. workers in the same role and location.",
  "Employer agrees to sign Form I-983 and complete required evaluations every 6 months.",
];

const dsoChecklist = [
  "OPT/STEM OPT filing status is valid and within the eligible timeline.",
  "DSO confirms the role is degree-related and compliant for your record.",
  "Remaining unemployment days are reviewed before accepting the offer.",
  "For STEM OPT: employer E-Verify Company ID has been shared with DSO for SEVIS and updated I-20.",
];

const sevisChecklist = [
  "Program end date and authorization period cover the expected employment period.",
  "DSO-authorized employment dates align with your EAD dates.",
  "Worksite address reflects your physical work location, not employer HQ.",
  "For remote/hybrid roles: report the primary location where you work most days.",
  "Current residential address is updated in SEVIS.",
  "If you move to another state during employment, submit a new SEVIS update promptly.",
];

export default function OPTSTEMOfferChecklistPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          {
            name: "OPT & STEM OPT Job Offer Verification Checklist",
            url: "https://www.trackmyopt.com/blog/opt-stem-opt-job-offer-verification-checklist",
          },
        ]}
      />

      <BlogPostSchema
        title={metadata.title}
        description={metadata.description}
        publishedDate="2026-04-23"
        modifiedDate="2026-04-23"
        author="Vinay Kumar"
      />

      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-blue-600">
          Blog
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">OPT Job Offer Verification Checklist</span>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            STEM OPT
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            8 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          OPT & STEM OPT: Before Accepting a Job Offer, Verify These 3 Areas
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          A job offer can protect your status or put it at risk. Use this pre-acceptance checklist to verify employer eligibility, DSO alignment, and SEVIS accuracy before you say yes.
        </p>
        <div className="mt-6 text-sm text-gray-500">Last updated: April 23, 2026 • Written by Vinay Kumar</div>
      </header>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
          Before accepting an OPT/STEM OPT job offer, confirm it is a W-2 degree-related role, verify E-Verify and I-983 readiness (for STEM OPT), and make sure DSO + SEVIS records match your EAD dates and real work location.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Why this matters
        </h2>
        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
          Many F-1 status issues happen after accepting a role without checking compliance basics. A role that looks good on paper can still fail STEM OPT rules (E-Verify, I-983, wage comparability, or location reporting). Verify before onboarding, not after.
        </p>
      </div>

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
        <section className="mb-10" id="employer-verification">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            1) Employer Verification
          </h2>
          <div className="space-y-3">
            {employerChecklist.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10" id="dso-confirmation">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            2) DSO Confirmation
          </h2>
          <div className="space-y-3">
            {dsoChecklist.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10" id="sevis-i20-accuracy">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            3) SEVIS & I-20 Accuracy
          </h2>
          <div className="space-y-3">
            {sevisChecklist.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                question: "Can I accept a 1099 contractor role on STEM OPT?",
                answer:
                  "No. STEM OPT requires a bona fide employer-employee relationship and a completed Form I-983. 1099 contractor setups usually do not satisfy this requirement.",
              },
              {
                question: "Why is work location accuracy important for remote roles?",
                answer:
                  "SEVIS records must reflect your actual primary work location. Reporting an HQ address when you work elsewhere can cause compliance mismatches.",
              },
              {
                question: "Should I share E-Verify Company ID with my DSO?",
                answer:
                  "Yes. For STEM OPT, your DSO needs the employer's E-Verify information to correctly update SEVIS and issue an accurate I-20.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white mt-12">
        <h2 className="text-2xl font-bold mb-3">Track Compliance Before It Becomes a Problem</h2>
        <p className="text-blue-100 mb-6 max-w-lg mx-auto">
          Use TrackMyOPT to monitor unemployment days, deadline windows, and STEM OPT requirements in one dashboard.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
        >
          Protect Your OPT Status <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/blog/stem-opt-employer-requirements" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            → STEM OPT Employer Requirements
          </Link>
          <Link href="/blog/i-983-training-plan-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            → Form I-983 Training Plan Guide
          </Link>
          <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            → STEM OPT Unemployment Limit
          </Link>
        </div>
      </div>

      <AuthorBio />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeSerializeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I accept a 1099 contractor role on STEM OPT?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. STEM OPT typically requires a bona fide employer-employee relationship and Form I-983 compliance, which 1099 contractor roles generally do not satisfy.",
                },
              },
              {
                "@type": "Question",
                name: "What should I verify before accepting an OPT/STEM OPT job offer?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Confirm W-2 setup, degree relevance, E-Verify and I-983 readiness for STEM OPT, and ensure DSO, EAD dates, SEVIS, and work location details are fully aligned.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to update SEVIS if I move states while employed?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. A material address/location change should be reported through your school/DSO so SEVIS and your records remain accurate.",
                },
              },
            ],
          }),
        }}
      />
    </article>
  );
}
