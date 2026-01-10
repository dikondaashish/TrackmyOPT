"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Shield, Check, ExternalLink, Star, Clock, CreditCard, Building2, X, AlertTriangle, Stethoscope, Pill, Eye, Brain, Phone, FileCheck, Heart, Activity, ChevronDown, AlertCircle, Users, Globe, Award } from "lucide-react";

// States with free insurance programs
const FREE_STATES: Record<string, { name: string; plan: string; link: string; benefits: string[] }> = {
  NY: { name: "New York", plan: "Essential Plan", link: "https://nystateofhealth.ny.gov/", benefits: ["$0 monthly premium", "No deductible", "Doctor visits covered", "Prescriptions included", "Mental health services", "Dental & vision care"] },
  CA: { name: "California", plan: "Medi-Cal", link: "https://www.coveredca.com/", benefits: ["$0 monthly premium", "Full medical coverage", "Dental care included", "Vision coverage", "Mental health", "Prescription drugs"] },
  WA: { name: "Washington", plan: "Apple Health", link: "https://www.wahealthplanfinder.org/", benefits: ["$0 monthly cost", "Doctor & hospital care", "Prescriptions covered", "Mental health services", "Preventive care", "Maternity care"] },
  OR: { name: "Oregon", plan: "Oregon Health Plan", link: "https://healthcare.oregon.gov/", benefits: ["$0 premium", "Medical care", "Dental services", "Mental health", "Vision care", "Prescription drugs"] },
  IL: { name: "Illinois", plan: "Medicaid", link: "https://abe.illinois.gov/", benefits: ["$0 monthly cost", "Doctor visits", "Hospital care", "Lab tests", "Prescriptions", "Preventive care"] },
  CO: { name: "Colorado", plan: "Health First Colorado", link: "https://www.healthfirstcolorado.com/", benefits: ["$0 premium", "Primary care", "Specialist care", "Hospital services", "Prescriptions", "Mental health"] },
  MA: { name: "Massachusetts", plan: "MassHealth", link: "https://www.mass.gov/masshealth", benefits: ["$0 monthly premium", "Comprehensive medical", "Dental coverage", "Vision care", "Behavioral health", "Prescription drugs"] },
  CT: { name: "Connecticut", plan: "HUSKY Health", link: "https://www.accesshealthct.com/", benefits: ["$0 premium", "Primary care", "Specialist visits", "Hospital care", "Mental health", "Prescriptions"] },
  VT: { name: "Vermont", plan: "Green Mountain Care", link: "https://portal.healthconnect.vermont.gov/", benefits: ["$0 monthly cost", "Doctor visits", "Hospital care", "Prescriptions", "Mental health", "Preventive care"] },
  MN: { name: "Minnesota", plan: "MinnesotaCare", link: "https://www.mnsure.org/", benefits: ["Low-cost coverage", "Doctor visits", "Hospital care", "Prescriptions", "Mental health", "Dental & vision"] },
  NJ: { name: "New Jersey", plan: "NJ FamilyCare", link: "https://www.njfamilycare.org/", benefits: ["$0 premium option", "Medical care", "Dental services", "Prescriptions", "Mental health", "Hospital care"] },
  MD: { name: "Maryland", plan: "Maryland Health Connection", link: "https://www.marylandhealthconnection.gov/", benefits: ["Low-cost plans", "Doctor visits", "Prescriptions", "Preventive care", "Mental health", "Hospital services"] },
  DC: { name: "Washington D.C.", plan: "DC Health Link", link: "https://dchealthlink.com/", benefits: ["Affordable plans", "Primary care", "Specialist visits", "Prescriptions", "Preventive care", "Mental health"] },
};

// States with partial coverage
const PARTIAL_STATES: Record<string, { name: string; note: string }> = {
  PA: { name: "Pennsylvania", note: "Limited Medicaid expansion available" },
  NV: { name: "Nevada", note: "Some low-cost options through Silver State Health" },
  NM: { name: "New Mexico", note: "Centennial Care available for some" },
  RI: { name: "Rhode Island", note: "RIte Care offers limited coverage" },
  DE: { name: "Delaware", note: "Diamond State Health Plan available" },
  HI: { name: "Hawaii", note: "Med-QUEST offers some coverage" },
  ME: { name: "Maine", note: "MaineCare available for qualifying individuals" },
  MI: { name: "Michigan", note: "Healthy Michigan Plan available" },
};

// Get state display name
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C."
};

// Age-based pricing for insurance partners
function getAgeBracket(dob: string): { bracket: string; age: number; isoPrice: number; isiPrice: number; kimberPrice: number } {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 25) {
    return { bracket: "Under 25", age, isoPrice: 38, isiPrice: 35, kimberPrice: 42 };
  } else if (age < 30) {
    return { bracket: "25-29", age, isoPrice: 52, isiPrice: 48, kimberPrice: 56 };
  } else if (age < 35) {
    return { bracket: "30-34", age, isoPrice: 68, isiPrice: 62, kimberPrice: 72 };
  } else if (age < 40) {
    return { bracket: "35-39", age, isoPrice: 85, isiPrice: 78, kimberPrice: 89 };
  } else {
    return { bracket: "40+", age, isoPrice: 105, isiPrice: 98, kimberPrice: 115 };
  }
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitUrl, setExitUrl] = useState("");
  const [expandedInfo, setExpandedInfo] = useState<number | null>(null);

  const state = searchParams.get("state") || "";
  const income = parseFloat(searchParams.get("income") || "0");
  const visa = searchParams.get("visa") || "";
  const dob = searchParams.get("dob") || "";

  const stateName = STATE_NAMES[state] || state;
  const freeState = FREE_STATES[state];
  const partialState = PARTIAL_STATES[state];
  const pricing = getAgeBracket(dob);
  const isLowIncome = income < 2500;
  const isEligibleForFree = freeState && isLowIncome;
  const isPartialEligible = partialState && isLowIncome;

  // Special case: New York Essential Plan redirects to Kimber Health
  const isNYEssentialPlan = state === "NY" && isEligibleForFree;
  const kimberPriceForNY = isNYEssentialPlan ? 0 : pricing.kimberPrice;

  const handleApply = (url: string) => {
    setExitUrl(url);
    setShowExitModal(true);
  };

  const confirmExit = () => {
    window.open(exitUrl, "_blank");
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-background dark:to-background">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-border bg-white/80 dark:bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground">
          Your Recommended Plans
        </h1>
        <p className="text-slate-600 dark:text-muted-foreground mt-1 text-sm">
          {stateName} • Age {pricing.age} ({pricing.bracket}) • {visa}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* STATE ELIGIBILITY CARD - Always show first */}
          {isEligibleForFree ? (
            /* FREE State Plan Card */
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-800/50 dark:via-emerald-900/70 dark:to-green-900/50 rounded-2xl border-2 border-emerald-200 dark:border-emerald-400/50 p-5 hover:shadow-xl dark:hover:shadow-emerald-400/30 hover:scale-[1.02] transition-all duration-300">
              {/* Animated background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full blur-3xl group-hover:bg-emerald-400/40 transition-all duration-500" />

              <div className="relative z-10">
                <div className="absolute top-0 right-0">
                  <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                    ✨ FREE
                  </span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{freeState.plan}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{freeState.name}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">$0</span>
                  <span className="text-slate-500 dark:text-slate-400">/mo</span>
                </div>

                <div className="mt-4 space-y-2">
                  {freeState.benefits.slice(0, 4).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-700/60 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleApply(isNYEssentialPlan ? "https://www.kimberhealth.com/" : freeState.link)}
                  className="w-full mt-5 h-11 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isPartialEligible ? (
            /* Partial Coverage Card */
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl border-2 border-amber-200 dark:border-amber-700 p-5 relative">
              <div className="absolute top-3 right-3">
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  PARTIAL
                </span>
              </div>
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-foreground">Limited State Coverage</h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{partialState.name}</p>

              <div className="mt-3">
                <span className="text-lg font-semibold text-amber-700">May Qualify</span>
              </div>

              <p className="mt-3 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
                {partialState.note}. Check your state's marketplace for eligibility requirements.
              </p>

              <div className="mt-3 p-2.5 bg-amber-100/50 rounded-lg">
                <p className="text-xs text-amber-800">
                  💡 We recommend checking partner plans below for guaranteed coverage.
                </p>
              </div>
            </div>
          ) : (
            /* Not Eligible Card */
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 relative">
              <div className="absolute top-3 right-3">
                <span className="bg-slate-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  N/A
                </span>
              </div>
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                <X className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-foreground">No Free State Plan</h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{stateName}</p>

              <div className="mt-3">
                <span className="text-lg font-semibold text-slate-500 dark:text-muted-foreground">Not Available</span>
              </div>

              <p className="mt-3 text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
                Your state doesn't offer free health insurance for international students or OPT workers.
              </p>

              <div className="mt-3 p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ✨ Don't worry! Check our partner plans for affordable coverage starting at ${Math.min(pricing.isoPrice, pricing.isiPrice, pricing.kimberPrice)}/mo.
                </p>
              </div>
            </div>
          )}

          {/* ISO Card */}
          <div className="group relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-rose-800/40 dark:via-rose-900/60 dark:to-pink-900/40 rounded-2xl border border-slate-200 dark:border-rose-400/40 p-5 hover:shadow-xl dark:hover:shadow-rose-400/30 hover:scale-[1.02] hover:border-[#8B1538]/50 dark:hover:border-rose-300/60 transition-all duration-300">
            {/* Animated background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-400/10 dark:bg-rose-400/25 rounded-full blur-3xl group-hover:bg-rose-400/40 transition-all duration-500" />

            <div className="relative z-10">
              {/* ISO Logo */}
              <div className="mb-4 flex items-center">
                <Image
                  src="/partners/logo.svg"
                  alt="ISO Insurance logo"
                  width={110}
                  height={32}
                  className="h-8 w-auto object-contain dark:brightness-110"
                />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">ISO OPTima Plan</h3>
              <p className="text-sm text-[#8B1538] dark:text-rose-400 font-medium mt-0.5">International Student Insurance</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${pricing.isoPrice}</span>
                <span className="text-slate-500 dark:text-slate-400">/mo</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#8B1538] dark:text-rose-300" />
                  </div>
                  OPT, CPT & F-1 eligible
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#8B1538] dark:text-rose-300" />
                  </div>
                  Aetna PPO network
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#8B1538] dark:text-rose-300" />
                  </div>
                  University waiver approved
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#8B1538] dark:text-rose-300" />
                  </div>
                  Prescription coverage
                </div>
              </div>

              <button
                onClick={() => handleApply("https://www.isoa.org/?ref=trackmyopt")}
                className="w-full mt-5 h-11 bg-gradient-to-r from-[#8B1538] to-[#a91d45] hover:from-[#6d1029] hover:to-[#8B1538] text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:-translate-y-0.5"
              >
                View Plans
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ISI Card */}
          <div className="group relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-indigo-800/40 dark:via-indigo-900/60 dark:to-blue-900/40 rounded-2xl border border-slate-200 dark:border-indigo-400/40 p-5 hover:shadow-xl dark:hover:shadow-indigo-400/30 hover:scale-[1.02] hover:border-[#3D4F8F]/50 dark:hover:border-indigo-300/60 transition-all duration-300">
            {/* Animated background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-400/10 dark:bg-indigo-400/25 rounded-full blur-3xl group-hover:bg-indigo-400/40 transition-all duration-500" />

            <div className="relative z-10">
              {/* ISI Logo */}
              <div className="mb-4 flex items-center">
                <Image
                  src="/partners/Logo-ISI.png"
                  alt="ISI Student Insurance logo"
                  width={80}
                  height={32}
                  className="h-8 w-auto object-contain dark:brightness-110"
                />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">ISI Student Health</h3>
              <p className="text-sm text-[#3D4F8F] dark:text-indigo-400 font-medium mt-0.5">Student Health Insurance</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${pricing.isiPrice}</span>
                <span className="text-slate-500 dark:text-slate-400">/mo</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#3D4F8F] dark:text-indigo-300" />
                  </div>
                  United Healthcare network
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#3D4F8F] dark:text-indigo-300" />
                  </div>
                  Mental health included
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#3D4F8F] dark:text-indigo-300" />
                  </div>
                  Telemedicine 24/7
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#3D4F8F] dark:text-indigo-300" />
                  </div>
                  Emergency coverage
                </div>
              </div>

              <button
                onClick={() => handleApply("https://www.isistudentinsurance.com/")}
                className="w-full mt-5 h-11 bg-gradient-to-r from-[#3D4F8F] to-[#5563a8] hover:from-[#2d3a6b] hover:to-[#3D4F8F] text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                View Plans
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Kimber Health Card */}
          <div className="group relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-cyan-800/40 dark:via-cyan-900/60 dark:to-teal-900/40 rounded-2xl border border-slate-200 dark:border-cyan-400/40 p-5 hover:shadow-xl dark:hover:shadow-cyan-400/30 hover:scale-[1.02] hover:border-cyan-400/50 dark:hover:border-cyan-300/60 transition-all duration-300">
            {/* Animated background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 dark:bg-cyan-400/25 rounded-full blur-3xl group-hover:bg-cyan-400/40 transition-all duration-500" />

            <div className="relative z-10">
              {/* Kimber Health Logo */}
              <div className="mb-4 flex items-center">
                <Image
                  src="/partners/KimberHealthLogoDarkBlueSmall_R.png"
                  alt="Kimber Health logo"
                  width={150}
                  height={36}
                  className="h-9 w-auto object-contain dark:brightness-110"
                />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{isNYEssentialPlan ? "Essential Plan (NY)" : "Kimber Essential"}</h3>
              <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">{isNYEssentialPlan ? "Free via Kimber Health" : "by NYWPG"}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${kimberPriceForNY}</span>
                <span className="text-slate-500 dark:text-slate-400">/mo</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  No waiting period
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  Preventive care covered
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  24/7 customer support
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-700/60 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  Vision & dental options
                </div>
              </div>

              <button
                onClick={() => handleApply("https://www.kimberhealth.com/")}
                className="w-full mt-5 h-11 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
              >
                View Plans
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-muted-foreground">
            * Prices are estimates for age {pricing.age} ({pricing.bracket}). Actual prices may vary based on your specific details and our partners' latest rates.
          </p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-indigo-950/30 dark:border dark:border-blue-500/20 rounded-xl p-5">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-foreground">Quick Enrollment</h4>
            <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">Get covered in as little as 24 hours</p>
          </div>
          <div className="bg-slate-50 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:to-green-950/30 dark:border dark:border-emerald-500/20 rounded-xl p-5">
            <div className="w-10 h-10 bg-green-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-foreground">Instant ID Card</h4>
            <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">Digital card after payment</p>
          </div>
          <div className="bg-slate-50 dark:bg-gradient-to-br dark:from-purple-950/40 dark:to-violet-950/30 dark:border dark:border-purple-500/20 rounded-xl p-5">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-foreground">No SSN Required</h4>
            <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">Passport & visa docs accepted</p>
          </div>
        </div>
      </div>

      {/* Protect Yourself Section */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-emerald-950/30 rounded-2xl p-6 sm:p-8 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">Protect Yourself & Your Loved Ones</h3>
              <p className="text-slate-600 dark:text-muted-foreground mt-2 leading-relaxed">
                Don't risk your OPT status or financial future. A single ER visit in the US can cost <span className="font-semibold text-red-600">$3,000 - $10,000+</span>.
                Health insurance is not just a safety net—it's essential for your peace of mind while you focus on your career.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Health Insurance Matters - Accordion */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4">Why Health Insurance Matters in the US</h3>
        <div className="space-y-3">
          {[
            {
              title: "Healthcare costs are extremely high",
              content: "Healthcare costs in the United States are not to be underestimated – services for even the simplest of reasons can result in medical bills from hundreds to thousands of dollars. A routine doctor visit can cost $150-300, while an emergency room visit averages $1,500-3,000. Without insurance, a hospital stay can easily exceed $10,000 per night."
            },
            {
              title: "No national health plan like other countries",
              content: "Unlike many countries, the US does not have a national healthcare plan. Americans rely on private health insurance to reduce their medical payments. Many international visitors assume healthcare works similarly to their home country, but misaligned expectations can put you at risk of incurring massive bills."
            },
            {
              title: "Protect your immigration status",
              content: "Unexpected medical debt can impact your financial stability and potentially your immigration status. If you're on OPT or STEM OPT, maintaining good standing is crucial. Having proper health coverage ensures you can focus on your career without worrying about medical emergencies derailing your plans."
            },
            {
              title: "University requirements & job compliance",
              content: "Many universities require health insurance for enrollment. Additionally, some employers expect OPT workers to have coverage. Our partner plans are designed to meet university waiver requirements and provide the documentation you need for employment."
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl border border-slate-100 dark:border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedInfo(expandedInfo === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-muted transition-colors"
              >
                <span className="font-medium text-slate-900 dark:text-foreground pr-4">{item.title}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expandedInfo === i ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${expandedInfo === i ? "max-h-96" : "max-h-0"}`}>
                <div className="px-4 pb-4 text-slate-600 dark:text-muted-foreground text-sm leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Partners Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4 text-center">Our Trusted Partners</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Kimber Health */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/40 rounded-xl p-5 border border-cyan-100 dark:border-cyan-500/30 text-center hover:shadow-lg dark:hover:shadow-cyan-500/10 transition-all">
            <div className="flex justify-center mb-3">
              <Image
                src="/partners/KimberHealthLogoDarkBlueSmall_R.png"
                alt="Kimber Health"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              <span>Starts from $0</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-muted-foreground">Excellent service & specialty insurance that meets your needs. Free NY Essential Plan available.</p>
          </div>

          {/* ISO */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/40 rounded-xl p-5 border border-rose-100 dark:border-rose-500/30 text-center hover:shadow-lg dark:hover:shadow-rose-500/10 transition-all">
            <div className="flex justify-center mb-3">
              <Image
                src="/partners/logo.svg"
                alt="ISO Insurance"
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              <Users className="w-3 h-3" />
              <span>3M+ Students Since 1958</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-muted-foreground">Trusted by students from 158+ countries. Comprehensive coverage with Aetna PPO network.</p>
          </div>

          {/* ISI */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/40 rounded-xl p-5 border border-indigo-100 dark:border-indigo-500/30 text-center hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-all">
            <div className="flex justify-center mb-3">
              <Image
                src="/partners/Logo-ISI.png"
                alt="ISI Student Insurance"
                width={80}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              <Globe className="w-3 h-3" />
              <span>1M+ Students Insured</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-muted-foreground">United Healthcare network with 24/7 telemedicine and mental health coverage included.</p>
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-foreground text-center">Leaving TrackMyOPT</h3>
            <p className="text-slate-600 dark:text-muted-foreground text-sm text-center mt-2">
              You'll be redirected to complete enrollment on the partner's website.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 h-11 border border-slate-200 dark:border-border rounded-xl font-medium text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted transition-colors"
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
