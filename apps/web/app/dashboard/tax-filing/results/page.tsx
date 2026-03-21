"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Receipt,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Gift,
  Copy,
  Check,
  FileText,
  Sparkles
} from "lucide-react";

// Tax filing partners
const TAX_PARTNERS = [
  {
    name: "Sprintax",
    logo: null,
    color: "from-emerald-500 to-teal-600",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40",
    borderColor: "border-emerald-200 dark:border-emerald-700/50",
    tagline: "Most Popular for F-1 Students",
    description: "Specialized in non-resident tax returns. Guides you through Form 8843 and 1040-NR step by step.",
    features: ["Form 8843 & 1040-NR", "State tax returns", "24/7 live chat support", "FICA refund assistance"],
    badge: "Recommended",
    link: "https://www.sprintax.com/"
  },
  {
    name: "Glacier Tax Prep",
    logo: null,
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40",
    borderColor: "border-blue-200 dark:border-blue-700/50",
    tagline: "University Partner",
    description: "Used by 600+ universities. Determines tax residency status and prepares all required forms.",
    features: ["Tax residency wizard", "Form preparation", "University discounts", "Expert support"],
    badge: "Trusted",
    link: "https://www.glaciertax.com/"
  },
  {
    name: "Taxback",
    logo: null,
    color: "from-purple-500 to-pink-600",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40",
    borderColor: "border-purple-200 dark:border-purple-700/50",
    tagline: "Maximum Refund Guarantee",
    description: "Experts in tax refunds for international students. They handle everything for you hussle free.",
    features: ["Full-service filing", "Refund maximization", "FICA recovery", "Multi-year filing"],
    badge: "Full Service",
    link: "https://www.taxback.com/"
  }
];

function TaxResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showExitModal, setShowExitModal] = useState(false);
  const [exitUrl, setExitUrl] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<typeof TAX_PARTNERS[0] | null>(null);
  const [couponCopied, setCouponCopied] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);

  const COUPON_CODE = "F25CU800";

  // Get params from URL
  const years = searchParams.get("years") || "";
  const income = searchParams.get("income") || "";

  // Determine filing requirement
  const getFilingRequirement = () => {
    if (years === "may-be-resident") {
      return {
        status: "Complex Situation",
        color: "amber",
        message: "You may have become a tax resident. We recommend consulting a tax professional to determine your exact filing requirements.",
        forms: ["Consult a CPA or tax advisor"]
      };
    }

    if (income === "no-income") {
      return {
        status: "Form 8843 Required",
        color: "blue",
        message: "As a non-resident with no U.S. income, you must file Form 8843 by June 15th to document your exempt status.",
        forms: ["Form 8843"]
      };
    }

    return {
      status: "Full Tax Return Required",
      color: "emerald",
      message: "As a non-resident with U.S. income, you must file Form 1040-NR (and possibly state returns) by April 15th.",
      forms: ["Form 1040-NR", "Form 8843", "State returns (if applicable)"]
    };
  };

  const filingRequirement = getFilingRequirement();

  const handleApply = (partner: typeof TAX_PARTNERS[0]) => {
    setSelectedPartner(partner);
    setExitUrl(partner.link);
    setShowExitModal(true);
  };

  const confirmExit = () => {
    window.open(exitUrl, "_blank");
    setShowExitModal(false);
  };

  const handleGetCoupon = (partner: typeof TAX_PARTNERS[0]) => {
    setSelectedPartner(partner);
    setShowCouponModal(true);
    setCouponCopied(false);
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  const openPartnerWithCoupon = () => {
    if (selectedPartner) {
      window.open(selectedPartner.link, "_blank");
      setShowCouponModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-background dark:to-background">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tax Filing
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Your Tax Filing Plan</h1>
            <p className="text-sm text-slate-600 dark:text-muted-foreground">Based on your responses</p>
          </div>
        </div>
      </div>

      {/* Filing Requirement Result */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className={`rounded-2xl p-5 ${filingRequirement.color === "amber" ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" :
          filingRequirement.color === "blue" ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" :
            "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
          }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${filingRequirement.color === "amber" ? "bg-amber-100 dark:bg-amber-900/50" :
              filingRequirement.color === "blue" ? "bg-blue-100 dark:bg-blue-900/50" :
                "bg-emerald-100 dark:bg-emerald-900/50"
              }`}>
              <FileText className={`w-6 h-6 ${filingRequirement.color === "amber" ? "text-amber-600" :
                filingRequirement.color === "blue" ? "text-blue-600" :
                  "text-emerald-600"
                }`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${filingRequirement.color === "amber" ? "text-amber-900 dark:text-amber-300" :
                filingRequirement.color === "blue" ? "text-blue-900 dark:text-blue-300" :
                  "text-emerald-900 dark:text-emerald-300"
                }`}>{filingRequirement.status}</h2>
              <p className={`text-sm mt-1 ${filingRequirement.color === "amber" ? "text-amber-800 dark:text-amber-400" :
                filingRequirement.color === "blue" ? "text-blue-800 dark:text-blue-400" :
                  "text-emerald-800 dark:text-emerald-400"
                }`}>{filingRequirement.message}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {filingRequirement.forms.map((form, i) => (
                  <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${filingRequirement.color === "amber" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" :
                    filingRequirement.color === "blue" ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" :
                      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                    }`}>
                    {form}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            Recommended Partners
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">File Your Taxes Online</h2>
          <p className="text-slate-600 dark:text-muted-foreground text-sm mt-1">Trusted partners specializing in non-resident tax returns</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {TAX_PARTNERS.map((partner, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${partner.bgColor} rounded-2xl border ${partner.borderColor} p-5 relative hover:shadow-lg transition-all`}
            >
              {partner.badge && (
                <div className="absolute top-3 right-3">
                  <span className={`bg-gradient-to-r ${partner.color} text-white text-[10px] font-bold px-2 py-1 rounded-full`}>
                    {partner.badge}
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 bg-gradient-to-br ${partner.color} rounded-xl flex items-center justify-center mb-3`}>
                <Receipt className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{partner.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{partner.tagline}</p>
              {partner.name === "Sprintax" && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Code: {COUPON_CODE}</span>
                </div>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{partner.description}</p>

              <div className="mt-4 space-y-1.5">
                {partner.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleApply(partner)}
                  className={`w-full h-10 bg-gradient-to-r ${partner.color} text-white font-medium text-sm rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-1.5`}
                >
                  File Now
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleGetCoupon(partner)}
                  className="w-full h-9 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-all hover:border-emerald-300 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Get Free Coupon
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          * We may receive compensation if you purchase through our links.
        </p>
      </div>

      {/* Step-by-Step Guides */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Step-by-Step Filing Guides</h2>
        <div className="space-y-3">
          {[
            {
              title: "Filing with NO U.S. Income (Form 8843 only)",
              content: `If you had no U.S. income, you still need to file Form 8843:

1. Download Form 8843 from the IRS website
2. Fill in your personal information (name, address, visa type)
3. Complete Part I for all individuals claiming treaty exemption
4. Complete Part III if you're a student (F-1/J-1)
5. Sign and date the form
6. Mail to: Department of the Treasury, Internal Revenue Service Center, Austin, TX 73301-0215
7. Deadline: June 15th (no extension needed)`
            },
            {
              title: "Filing WITH U.S. Income (Form 1040-NR)",
              content: `If you earned wages, scholarships, or stipends:

1. Gather your documents: W-2, 1042-S, passport, I-20/DS-2019
2. Use a non-resident tax software (Sprintax, Glacier Tax Prep)
3. Answer questions about your income and exemptions
4. The software will generate Form 1040-NR and Form 8843
5. Review all forms for accuracy
6. E-file or print and mail your returns
7. Deadline: April 15th (extensions available)`
            },
            {
              title: "Claiming FICA Tax Refund",
              content: `If FICA (Social Security & Medicare) was incorrectly withheld:

1. First, request a refund from your employer in writing
2. If employer refuses or is unavailable, file with the IRS:
   - File Form 843 (Claim for Refund)
   - File Form 8316 (Information Regarding Request for Refund)
   - Include copy of W-2 and letter from employer
3. Mail to your IRS service center
4. Processing may take 6-12 months
5. You can claim refunds for the past 3 years`
            }
          ].map((guide, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl border border-slate-100 dark:border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-muted transition-colors"
              >
                <span className="font-medium text-slate-900 dark:text-foreground pr-4">{guide.title}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expandedGuide === i ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${expandedGuide === i ? "max-h-[500px]" : "max-h-0"}`}>
                <div className="px-4 pb-4 text-slate-600 dark:text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {guide.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-slate-50 dark:bg-muted rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 dark:text-muted-foreground">
            <strong>Disclaimer:</strong> TrackMyOPT provides general information and is not a substitute for professional tax or legal advice.
            Tax rules can be complex—please consult a certified tax professional for your specific situation.
          </p>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border ${selectedPartner?.borderColor || 'border-slate-200'} dark:border-opacity-50`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${selectedPartner?.color || 'from-emerald-500 to-teal-600'} bg-opacity-10`}>
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">Leaving TrackMyOPT</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm text-center mt-2">
              You'll be redirected to complete your tax filing on <span className="font-semibold">{selectedPartner?.name}</span>'s website.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 h-11 border border-slate-200 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className={`flex-1 h-11 bg-gradient-to-r ${selectedPartner?.color || 'from-emerald-500 to-teal-600'} text-white rounded-xl font-medium hover:opacity-90 transition-colors shadow-lg shadow-emerald-500/20`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal — Sprintax partner code available to all signed-in users */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 bg-gradient-to-br ${selectedPartner?.color || 'from-emerald-400 to-teal-500'} rounded-full flex items-center justify-center mx-auto mb-4 bg-opacity-10`}>
              <Gift className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">Partner coupon</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm text-center mt-2">
              Use this code at <span className="font-semibold text-slate-900 dark:text-white">{selectedPartner?.name}</span> at checkout. Available to every TrackMyOPT user.
            </p>

            <div className={`mt-5 bg-gradient-to-r ${selectedPartner?.bgColor || 'from-emerald-50 to-teal-50'} border-2 border-dashed ${selectedPartner?.borderColor || 'border-emerald-300'} rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <code className="text-xl font-bold text-slate-900 dark:text-white tracking-wider">{COUPON_CODE}</code>
                <button
                  onClick={copyCoupon}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${couponCopied
                    ? "bg-green-500 text-white"
                    : `bg-white dark:bg-slate-800 border ${selectedPartner?.borderColor || 'border-emerald-200'} text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700`
                    }`}
                >
                  {couponCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCouponModal(false)}
                className="flex-1 h-11 border border-slate-200 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={openPartnerWithCoupon}
                className={`flex-1 h-11 bg-gradient-to-r ${selectedPartner?.color || 'from-emerald-500 to-teal-600'} text-white rounded-xl font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-1.5 shadow-lg`}
              >
                Open Website
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaxFilingResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TaxResultsContent />
    </Suspense>
  );
}
