"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { 
  Receipt, 
  ChevronDown, 
  ExternalLink, 
  ArrowLeft,
  CheckCircle2,
  Gift,
  Copy,
  Check,
  Crown,
  Lock,
  FileText,
  Sparkles
} from "lucide-react";

// Tax filing partners
const TAX_PARTNERS = [
  {
    name: "Sprintax",
    logo: null,
    color: "from-emerald-500 to-teal-600",
    bgColor: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
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
    bgColor: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
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
    bgColor: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
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
  const [isPremium, setIsPremium] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);

  const COUPON_CODE = "TRACKMYOPTFREE";

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

  // Check user's premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/premium/status', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium || false);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };
    
    checkPremiumStatus();
  }, []);

  const handleApply = (url: string) => {
    setExitUrl(url);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tax Filing
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Tax Filing Plan</h1>
            <p className="text-sm text-slate-600">Based on your responses</p>
          </div>
        </div>
      </div>

      {/* Filing Requirement Result */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className={`rounded-2xl p-5 ${
          filingRequirement.color === "amber" ? "bg-amber-50 border border-amber-200" :
          filingRequirement.color === "blue" ? "bg-blue-50 border border-blue-200" :
          "bg-emerald-50 border border-emerald-200"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              filingRequirement.color === "amber" ? "bg-amber-100" :
              filingRequirement.color === "blue" ? "bg-blue-100" :
              "bg-emerald-100"
            }`}>
              <FileText className={`w-6 h-6 ${
                filingRequirement.color === "amber" ? "text-amber-600" :
                filingRequirement.color === "blue" ? "text-blue-600" :
                "text-emerald-600"
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${
                filingRequirement.color === "amber" ? "text-amber-900" :
                filingRequirement.color === "blue" ? "text-blue-900" :
                "text-emerald-900"
              }`}>{filingRequirement.status}</h2>
              <p className={`text-sm mt-1 ${
                filingRequirement.color === "amber" ? "text-amber-800" :
                filingRequirement.color === "blue" ? "text-blue-800" :
                "text-emerald-800"
              }`}>{filingRequirement.message}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {filingRequirement.forms.map((form, i) => (
                  <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    filingRequirement.color === "amber" ? "bg-amber-100 text-amber-700" :
                    filingRequirement.color === "blue" ? "bg-blue-100 text-blue-700" :
                    "bg-emerald-100 text-emerald-700"
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
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            Recommended Partners
          </div>
          <h2 className="text-xl font-bold text-slate-900">File Your Taxes Online</h2>
          <p className="text-slate-600 text-sm mt-1">Trusted partners specializing in non-resident tax returns</p>
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
              
              <h3 className="font-bold text-slate-900 text-lg">{partner.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{partner.tagline}</p>
              <p className="text-sm text-slate-600 mt-2">{partner.description}</p>
              
              <div className="mt-4 space-y-1.5">
                {partner.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleApply(partner.link)}
                  className={`w-full h-10 bg-gradient-to-r ${partner.color} text-white font-medium text-sm rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-1.5`}
                >
                  File Now
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleGetCoupon(partner)}
                  className="w-full h-9 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all hover:border-emerald-300 hover:text-emerald-700 flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Get Free Coupon
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-4">
          * We may receive compensation if you purchase through our links. This helps support TrackMyOPT at no extra cost to you.
        </p>
      </div>

      {/* Step-by-Step Guides */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Step-by-Step Filing Guides</h2>
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
              className="bg-white rounded-xl border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-900 pr-4">{guide.title}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    expandedGuide === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${expandedGuide === i ? "max-h-[500px]" : "max-h-0"}`}>
                <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {guide.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500">
            <strong>Disclaimer:</strong> TrackMyOPT provides general information and is not a substitute for professional tax or legal advice. 
            Tax rules can be complex—please consult a certified tax professional for your specific situation.
          </p>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Leaving TrackMyOPT</h3>
            <p className="text-slate-600 text-sm text-center mt-2">
              You'll be redirected to complete your tax filing on the partner's website.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 h-11 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {isPremium ? (
              /* Pro Member - Show Coupon */
              <>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600">PRO MEMBER EXCLUSIVE</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 text-center">Your Free Coupon</h3>
                <p className="text-slate-600 text-sm text-center mt-2">
                  Use this code at {selectedPartner?.name} for exclusive savings!
                </p>
                
                {/* Coupon Code Box */}
                <div className="mt-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-xl font-bold text-emerald-700 tracking-wider">{COUPON_CODE}</code>
                    <button
                      onClick={copyCoupon}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        couponCopied 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
                    className="flex-1 h-11 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={openPartnerWithCoupon}
                    className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    Open Website
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Non-Pro Member - Show Upgrade */
              <>
                <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 text-center">Pro Members Only</h3>
                <p className="text-slate-600 text-sm text-center mt-2">
                  Upgrade to Pro to unlock free filing coupons and exclusive discounts on tax services!
                </p>
                
                {/* Benefits */}
                <div className="mt-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Pro Benefits Include:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Free tax filing coupons
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Priority support
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Advanced OPT tools
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCouponModal(false)}
                    className="flex-1 h-11 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCouponModal(false);
                      router.push('/premium/checkout');
                    }}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </button>
                </div>
              </>
            )}
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
