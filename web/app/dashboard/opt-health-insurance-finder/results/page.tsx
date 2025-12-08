"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Shield, Check, ExternalLink, Star, Clock, CreditCard, Building2 } from "lucide-react";
import Link from "next/link";

// States with free insurance programs
const FREE_STATES: Record<string, { name: string; plan: string; link: string }> = {
  NY: { name: "New York", plan: "Essential Plan", link: "https://nystateofhealth.ny.gov/" },
  CA: { name: "California", plan: "Medi-Cal", link: "https://www.coveredca.com/" },
  WA: { name: "Washington", plan: "Apple Health", link: "https://www.wahealthplanfinder.org/" },
  OR: { name: "Oregon", plan: "Oregon Health Plan", link: "https://healthcare.oregon.gov/" },
  IL: { name: "Illinois", plan: "Medicaid", link: "https://abe.illinois.gov/" },
  CO: { name: "Colorado", plan: "Health First Colorado", link: "https://www.healthfirstcolorado.com/" },
  MA: { name: "Massachusetts", plan: "MassHealth", link: "https://www.mass.gov/masshealth" },
  CT: { name: "Connecticut", plan: "HUSKY Health", link: "https://www.accesshealthct.com/" },
  VT: { name: "Vermont", plan: "Green Mountain Care", link: "https://portal.healthconnect.vermont.gov/" },
  MN: { name: "Minnesota", plan: "MinnesotaCare", link: "https://www.mnsure.org/" },
  NJ: { name: "New Jersey", plan: "NJ FamilyCare", link: "https://www.njfamilycare.org/" },
  MD: { name: "Maryland", plan: "Maryland Health Connection", link: "https://www.marylandhealthconnection.gov/" },
  DC: { name: "Washington D.C.", plan: "DC Health Link", link: "https://dchealthlink.com/" },
};

// Age-based pricing for insurance partners
function getAgeBracket(dob: string): { bracket: string; isoPrice: number; isiPrice: number; kimberPrice: number } {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 25) {
    return { bracket: "Under 25", isoPrice: 38, isiPrice: 35, kimberPrice: 42 };
  } else if (age < 30) {
    return { bracket: "25-29", isoPrice: 52, isiPrice: 48, kimberPrice: 56 };
  } else if (age < 35) {
    return { bracket: "30-34", isoPrice: 68, isiPrice: 62, kimberPrice: 72 };
  } else if (age < 40) {
    return { bracket: "35-39", isoPrice: 85, isiPrice: 78, kimberPrice: 89 };
  } else {
    return { bracket: "40+", isoPrice: 105, isiPrice: 98, kimberPrice: 115 };
  }
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitUrl, setExitUrl] = useState("");

  const state = searchParams.get("state") || "";
  const income = parseFloat(searchParams.get("income") || "0");
  const visa = searchParams.get("visa") || "";
  const dob = searchParams.get("dob") || "";

  const stateName = FREE_STATES[state]?.name || state;
  const freeState = FREE_STATES[state];
  const pricing = getAgeBracket(dob);
  const isLowIncome = income < 2500;

  const handleApply = (url: string) => {
    setExitUrl(url);
    setShowExitModal(true);
  };

  const confirmExit = () => {
    window.open(exitUrl, "_blank");
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to eligibility</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Your Recommended Plans
        </h1>
        <p className="text-slate-600 mt-2">
          Based on your location ({stateName}), age ({pricing.bracket}), and visa ({visa})
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* State Plan Card - Only show if eligible */}
          {freeState && isLowIncome && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  FREE
                </span>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{freeState.plan}</h3>
              <p className="text-sm text-slate-600 mt-1">State of {freeState.name}</p>
              
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">$0</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Full medical coverage
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Dental & vision
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Prescriptions included
                </div>
              </div>

              <button
                onClick={() => handleApply(freeState.link)}
                className="w-full mt-5 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Apply Now
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ISO Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold">ISO</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">ISO OPTima</h3>
            <p className="text-sm text-slate-600 mt-1">International Student Insurance</p>
            
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">${pricing.isoPrice}</span>
              <span className="text-slate-500 text-sm">/month</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-blue-500" />
                OPT & F-1 eligible
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-blue-500" />
                Aetna network
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-blue-500" />
                University waiver
              </div>
            </div>

            <button
              onClick={() => handleApply("https://www.isoa.org/")}
              className="w-full mt-5 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              View Plans
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* ISI Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-purple-200 transition-all">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-sm">ISI</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">ISI Student Health</h3>
            <p className="text-sm text-slate-600 mt-1">Student Health Insurance</p>
            
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">${pricing.isiPrice}</span>
              <span className="text-slate-500 text-sm">/month</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-purple-500" />
                United Healthcare
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-purple-500" />
                Mental health covered
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-purple-500" />
                Telemedicine included
              </div>
            </div>

            <button
              onClick={() => handleApply("https://www.isistudentinsurance.com/")}
              className="w-full mt-5 h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              View Plans
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Kimber Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-200 transition-all">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Kimber Health</h3>
            <p className="text-sm text-slate-600 mt-1">Comprehensive Coverage</p>
            
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">${pricing.kimberPrice}</span>
              <span className="text-slate-500 text-sm">/month</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-emerald-500" />
                No waiting period
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-emerald-500" />
                Preventive care
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-emerald-500" />
                24/7 support
              </div>
            </div>

            <button
              onClick={() => handleApply("https://www.kimberhealth.com/")}
              className="w-full mt-5 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              View Plans
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* No free state notice */}
        {(!freeState || !isLowIncome) && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              {!freeState 
                ? `Your state (${stateName}) doesn't offer free state-funded insurance for international students. Consider the partner plans above.`
                : `Based on your income ($${income.toLocaleString()}/month), you may not qualify for free state coverage. Check the partner plans above.`
              }
            </p>
          </div>
        )}

        {/* Pricing Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            * Prices shown are estimates based on your age ({pricing.bracket}). Actual prices may vary depending on 
            specific plan details and our partners' latest rates. Click on a plan for exact pricing.
          </p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-5">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900">Quick Enrollment</h4>
            <p className="text-sm text-slate-600 mt-1">Get covered in as little as 24 hours</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-900">Instant ID Card</h4>
            <p className="text-sm text-slate-600 mt-1">Digital card after payment</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900">No SSN Required</h4>
            <p className="text-sm text-slate-600 mt-1">Passport & visa docs accepted</p>
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Leaving TrackMyOPT</h3>
            <p className="text-slate-600 text-sm text-center mt-2">
              You'll be redirected to complete enrollment on the partner's website.
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
                className="flex-1 h-11 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
