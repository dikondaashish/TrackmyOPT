"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";

// US States
const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Washington D.C."
];

const STATE_CODES: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA",
  "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
  "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
  "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  "Washington D.C.": "DC"
};

const FREE_STATES = ["NY", "CA", "OR", "WA", "IL", "CO", "MA", "CT", "VT", "MN", "NJ", "MD", "DC"];
const PARTIAL_STATES = ["PA", "NM", "NV", "RI", "DE", "HI", "ME", "MI", "NH", "OH", "VA", "WI"];

const VISA_OPTIONS = ["F-1", "OPT", "STEM OPT", "J-1", "Other"];

interface Plan {
  name: string;
  price: string;
  type: "free" | "low" | "standard";
  features: string[];
  highlight?: string;
  url: string;
}

const STATE_PLANS: Record<string, Plan[]> = {
  NY: [{
    name: "Essential Plan",
    price: "$0",
    type: "free",
    features: ["Doctor visits", "Prescriptions", "Emergency care", "Mental health"],
    highlight: "No cost coverage",
    url: "https://nystateofhealth.ny.gov/"
  }],
  CA: [{
    name: "Medi-Cal",
    price: "$0",
    type: "free",
    features: ["Full medical", "Dental & vision", "Mental health", "Prescriptions"],
    highlight: "Comprehensive coverage",
    url: "https://www.coveredca.com/"
  }],
  WA: [{
    name: "Apple Health",
    price: "$0",
    type: "free",
    features: ["Doctor visits", "Hospital care", "Prescriptions", "Preventive care"],
    url: "https://www.wahealthplanfinder.org/"
  }],
  OR: [{
    name: "Oregon Health Plan",
    price: "$0",
    type: "free",
    features: ["Medical care", "Dental", "Vision", "Mental health"],
    url: "https://healthcare.oregon.gov/"
  }],
};

const PRIVATE_PLANS: Plan[] = [
  {
    name: "ISO OPTima",
    price: "$38",
    type: "low",
    features: ["OPT eligible", "Aetna network", "Easy enrollment"],
    highlight: "Most popular",
    url: "https://www.isoa.org/"
  },
  {
    name: "Student Medicover",
    price: "$35",
    type: "low",
    features: ["Budget friendly", "Quick approval", "No waiting"],
    url: "https://www.studentmedicover.com/"
  },
  {
    name: "ISI Health",
    price: "$45",
    type: "standard",
    features: ["Comprehensive", "United network", "Telemedicine"],
    url: "https://www.isistudentinsurance.com/"
  },
];

const FAQ = [
  { q: "Why do I need health insurance?", a: "US healthcare is expensive. A single ER visit can cost $5,000+. Insurance protects you financially." },
  { q: "What's a deductible?", a: "The amount you pay before insurance kicks in. Lower deductible = higher monthly cost." },
  { q: "Is insurance required for OPT?", a: "Not legally required, but strongly recommended. Some employers may require it." },
  { q: "When does school insurance end?", a: "Usually 30-60 days after graduation. Plan ahead to avoid gaps." },
];

export default function HealthInsurancePage() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState("");
  const [income, setIncome] = useState("");
  const [visa, setVisa] = useState("");
  const [dob, setDob] = useState("");
  const [hasEmployer, setHasEmployer] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [exitModal, setExitModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const stateCode = STATE_CODES[state] || "";
  const eligibility = hasEmployer ? "employer" : FREE_STATES.includes(stateCode) ? "free" : PARTIAL_STATES.includes(stateCode) ? "partial" : "none";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("insurance_eligibility_checks").insert({
        user_id: user?.id || null,
        state: stateCode,
        monthly_income: income ? parseFloat(income) : 0,
        visa_type: visa,
        date_of_birth: dob || null,
        has_employer_insurance: hasEmployer,
      });
    } catch (e) { console.error(e); }
    
    setLoading(false);
    setShowResults(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleApply = (url: string) => setExitModal(url);

  const formatIncome = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? Number(num).toLocaleString() : "";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Hero - Clean & Minimal */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3">
            Health Insurance for OPT Students
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Find free or low-cost insurance options based on your state and income
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Progress */}
          <div className="px-8 pt-8">
            <div className="flex items-center gap-2 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {/* Step 0: State */}
              {step === 0 && (
                <motion.div
                  key="state"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-1">Where do you live?</h2>
                    <p className="text-sm text-gray-500">Some states offer free health coverage</p>
                  </div>
                  <div className="relative">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    >
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    disabled={!state}
                    className="w-full h-14 bg-blue-500 text-white rounded-xl font-medium text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* Step 1: Income */}
              {step === 1 && (
                <motion.div
                  key="income"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-1">Monthly income</h2>
                    <p className="text-sm text-gray-500">Unpaid internship? Enter 0</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={income}
                      onChange={(e) => setIncome(formatIncome(e.target.value))}
                      placeholder="0"
                      className="w-full h-14 pl-8 pr-4 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="h-14 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 h-14 bg-blue-500 text-white rounded-xl font-medium text-lg hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Visa */}
              {step === 2 && (
                <motion.div
                  key="visa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-1">Visa type</h2>
                    <p className="text-sm text-gray-500">Select your current immigration status</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {VISA_OPTIONS.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVisa(v)}
                        className={`h-14 rounded-xl font-medium transition-all ${
                          visa === v
                            ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="h-14 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!visa}
                      className="flex-1 h-14 bg-blue-500 text-white rounded-xl font-medium text-lg disabled:opacity-40 hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: DOB */}
              {step === 3 && (
                <motion.div
                  key="dob"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-1">Date of birth</h2>
                    <p className="text-sm text-gray-500">Some plans have age requirements</p>
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="h-14 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 h-14 bg-blue-500 text-white rounded-xl font-medium text-lg hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Employer Insurance */}
              {step === 4 && (
                <motion.div
                  key="employer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-1">Employer insurance?</h2>
                    <p className="text-sm text-gray-500">Does your employer offer health coverage?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setHasEmployer(true)}
                      className={`h-14 rounded-xl font-medium transition-all ${
                        hasEmployer === true
                          ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setHasEmployer(false)}
                      className={`h-14 rounded-xl font-medium transition-all ${
                        hasEmployer === false
                          ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      No
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="h-14 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={hasEmployer === null || loading}
                      className="flex-1 h-14 bg-blue-500 text-white rounded-xl font-medium text-lg disabled:opacity-40 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "See Results"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-6 pb-12"
          >
            {/* Status Card */}
            <div className={`rounded-2xl p-6 mb-6 ${
              eligibility === "employer" ? "bg-blue-50 border border-blue-200" :
              eligibility === "free" ? "bg-green-50 border border-green-200" :
              eligibility === "partial" ? "bg-amber-50 border border-amber-200" :
              "bg-gray-100 border border-gray-200"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  eligibility === "employer" ? "bg-blue-100" :
                  eligibility === "free" ? "bg-green-100" :
                  eligibility === "partial" ? "bg-amber-100" :
                  "bg-gray-200"
                }`}>
                  {eligibility === "free" ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : eligibility === "employer" ? (
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${
                    eligibility === "employer" ? "text-blue-900" :
                    eligibility === "free" ? "text-green-900" :
                    eligibility === "partial" ? "text-amber-900" :
                    "text-gray-900"
                  }`}>
                    {eligibility === "employer" && "You have employer coverage"}
                    {eligibility === "free" && "You may qualify for free coverage!"}
                    {eligibility === "partial" && "Limited options available"}
                    {eligibility === "none" && "Private plans recommended"}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    eligibility === "employer" ? "text-blue-700" :
                    eligibility === "free" ? "text-green-700" :
                    eligibility === "partial" ? "text-amber-700" :
                    "text-gray-600"
                  }`}>
                    {eligibility === "employer" && "Employer insurance is usually the best option. Review your plan details."}
                    {eligibility === "free" && `${state} offers state-funded health coverage for eligible residents.`}
                    {eligibility === "partial" && `${state} has limited programs. Consider private options below.`}
                    {eligibility === "none" && "Check out affordable plans designed for OPT students."}
                  </p>
                </div>
              </div>
            </div>

            {/* Plans */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 px-1">
                {eligibility === "free" ? "Recommended Plans" : "Available Plans"}
              </h3>
              
              {/* State plans first if eligible */}
              {eligibility === "free" && STATE_PLANS[stateCode]?.map((plan, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {plan.highlight && (
                        <span className="inline-block text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-2">
                          {plan.highlight}
                        </span>
                      )}
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      <p className="text-2xl font-bold text-green-600">{plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.features.map((f, j) => (
                      <span key={j} className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleApply(plan.url)}
                    className="w-full h-11 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              ))}

              {/* Private plans */}
              {(eligibility !== "employer") && PRIVATE_PLANS.map((plan, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {plan.highlight && (
                        <span className="inline-block text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
                          {plan.highlight}
                        </span>
                      )}
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      <p className="text-2xl font-bold text-blue-600">{plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.features.map((f, j) => (
                      <span key={j} className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleApply(plan.url)}
                    className="w-full h-11 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Plans
                  </button>
                </div>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={() => { setShowResults(false); setStep(0); }}
              className="w-full mt-6 h-12 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Common Questions</h3>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {FAQ.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-gray-600 text-sm">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Exit Modal */}
      <AnimatePresence>
        {exitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setExitModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leaving TrackMyOPT</h3>
                <p className="text-sm text-gray-500">You'll be redirected to complete your enrollment.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setExitModal(null)}
                  className="flex-1 h-11 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { window.open(exitModal, "_blank"); setExitModal(null); }}
                  className="flex-1 h-11 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
