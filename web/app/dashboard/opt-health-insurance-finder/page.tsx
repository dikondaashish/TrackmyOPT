"use client";

import { useState, useRef } from "react";
import { Shield, ChevronDown, Check, X, AlertTriangle, ExternalLink, Info, ChevronRight, User, DollarSign, Calendar, Building, Heart } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// US States data
const US_STATES = [
  { value: "", label: "Select your state" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Washington D.C." },
];

// States with free insurance programs for low-income adults
const FREE_INSURANCE_STATES = ["NY", "CA", "OR", "WA", "IL", "CO", "MA", "CT", "VT", "MN", "NJ", "MD", "DC"];

// States with partial/limited coverage
const PARTIAL_COVERAGE_STATES = ["PA", "NM", "NV", "RI", "DE", "HI", "ME", "MI", "NH", "OH", "VA", "WI"];

// Visa types
const VISA_TYPES = [
  { value: "", label: "Select visa type" },
  { value: "F-1", label: "F-1 Student Visa" },
  { value: "OPT", label: "OPT (Optional Practical Training)" },
  { value: "STEM-OPT", label: "STEM OPT Extension" },
  { value: "J-1", label: "J-1 Exchange Visitor" },
  { value: "Other", label: "Other" },
];

// State-specific free plans
const STATE_FREE_PLANS: Record<string, Array<{
  name: string;
  cost: string;
  features: string[];
  link: string;
}>> = {
  NY: [
    {
      name: "Essential Plan",
      cost: "$0/month",
      features: ["Preventive care", "Vision & dental", "Specialist visits", "Prescriptions", "Emergency care"],
      link: "https://nystateofhealth.ny.gov/",
    },
  ],
  CA: [
    {
      name: "Medi-Cal",
      cost: "$0/month",
      features: ["Full medical coverage", "Dental care", "Vision care", "Mental health", "Prescriptions"],
      link: "https://www.coveredca.com/",
    },
  ],
  WA: [
    {
      name: "Apple Health",
      cost: "$0/month",
      features: ["Doctor visits", "Hospital care", "Prescriptions", "Mental health", "Preventive care"],
      link: "https://www.wahealthplanfinder.org/",
    },
  ],
  OR: [
    {
      name: "Oregon Health Plan",
      cost: "$0/month",
      features: ["Medical care", "Dental", "Mental health", "Vision", "Prescriptions"],
      link: "https://healthcare.oregon.gov/",
    },
  ],
  IL: [
    {
      name: "Illinois Medicaid",
      cost: "$0/month",
      features: ["Doctor visits", "Hospital care", "Lab tests", "Prescriptions", "Preventive care"],
      link: "https://abe.illinois.gov/",
    },
  ],
  CO: [
    {
      name: "Health First Colorado",
      cost: "$0/month",
      features: ["Primary care", "Specialist care", "Hospital", "Prescriptions", "Mental health"],
      link: "https://www.healthfirstcolorado.com/",
    },
  ],
  MA: [
    {
      name: "MassHealth",
      cost: "$0/month",
      features: ["Comprehensive medical", "Dental", "Vision", "Behavioral health", "Prescriptions"],
      link: "https://www.mass.gov/masshealth",
    },
  ],
};

// Private insurance partners
const PRIVATE_INSURANCE_OPTIONS = [
  {
    name: "ISO OPTima",
    cost: "From $38/month",
    deductible: "$100-$500",
    network: "Aetna Nationwide",
    optEligible: true,
    features: ["OPT eligible", "Nationwide network", "Easy enrollment", "24/7 support"],
    link: "https://www.isoa.org/",
  },
  {
    name: "ISI Student Health",
    cost: "From $40/month",
    deductible: "Varies",
    network: "United Healthcare",
    optEligible: true,
    features: ["Designed for students", "Comprehensive coverage", "Mental health", "Telemedicine"],
    link: "https://www.isistudentinsurance.com/",
  },
  {
    name: "Patriot Exchange",
    cost: "From $45/month",
    deductible: "$250-$2500",
    network: "Aetna",
    optEligible: true,
    features: ["ACA compliant", "Pre-existing conditions", "Preventive care", "Emergency coverage"],
    link: "https://www.imglobal.com/",
  },
  {
    name: "Student Medicover",
    cost: "From $35/month",
    deductible: "$100-$1000",
    network: "First Health",
    optEligible: true,
    features: ["Affordable rates", "OPT/CPT eligible", "Quick enrollment", "No waiting period"],
    link: "https://www.studentmedicover.com/",
  },
];

// Educational content
const EDUCATION_ITEMS = [
  {
    title: "Why do international students need health insurance?",
    content: "Healthcare in the US is expensive. A single emergency room visit can cost $3,000-$10,000+. Without insurance, you're responsible for the full amount. Most universities require health insurance, and having coverage protects you from financial hardship if you get sick or injured.",
  },
  {
    title: "What is a deductible?",
    content: "A deductible is the amount you pay out-of-pocket before your insurance starts covering costs. For example, if you have a $500 deductible, you pay the first $500 of medical bills. After that, your insurance kicks in. Lower deductibles usually mean higher monthly premiums.",
  },
  {
    title: "What is coinsurance?",
    content: "Coinsurance is the percentage you pay after meeting your deductible. If your plan has 20% coinsurance, you pay 20% of covered costs and insurance pays 80%. This continues until you reach your out-of-pocket maximum.",
  },
  {
    title: "Does OPT require health insurance?",
    content: "While OPT doesn't legally require health insurance, it's strongly recommended. If you have a medical emergency without insurance, you could face thousands in bills. Some employers may also require proof of insurance. Having coverage gives you peace of mind to focus on your career.",
  },
  {
    title: "When does school insurance end?",
    content: "Most university health insurance plans end when you graduate or when the semester ends. If you're on OPT, your school insurance typically ends 30-60 days after graduation. Plan ahead to avoid gaps in coverage - apply for new insurance before your school plan expires.",
  },
  {
    title: "Can international students get Medicaid?",
    content: "Generally, international students on F-1 or J-1 visas are not eligible for federal Medicaid. However, some states (like New York, California) offer state-funded programs that cover legal residents regardless of immigration status, especially for low-income individuals.",
  },
];

export default function HealthInsuranceFinderPage() {
  const [state, setState] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [visaType, setVisaType] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [hasEmployerInsurance, setHasEmployerInsurance] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [expandedEducation, setExpandedEducation] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitUrl, setExitUrl] = useState("");
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const eligibilityRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const scrollToEligibility = () => {
    eligibilityRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckEligibility = async () => {
    if (!state || !visaType || hasEmployerInsurance === null) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("insurance_eligibility_checks").insert({
        user_id: user?.id || null,
        state,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : 0,
        visa_type: visaType,
        date_of_birth: dateOfBirth || null,
        has_employer_insurance: hasEmployerInsurance,
        checked_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving eligibility check:", error);
    }

    setIsSubmitting(false);
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleApplyClick = (url: string) => {
    setExitUrl(url);
    setShowExitModal(true);
  };

  const confirmExit = () => {
    window.open(exitUrl, "_blank");
    setShowExitModal(false);
  };

  // Determine eligibility type
  const getEligibilityType = () => {
    if (hasEmployerInsurance) return "employer";
    if (FREE_INSURANCE_STATES.includes(state)) return "free";
    if (PARTIAL_COVERAGE_STATES.includes(state)) return "partial";
    return "none";
  };

  const eligibilityType = getEligibilityType();
  const stateFreePlans = STATE_FREE_PLANS[state] || [];
  const income = parseFloat(monthlyIncome) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Health Insurance Options for OPT & STEM OPT Students
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8">
                Find free, low-cost, or state-funded insurance options based on your location and income.
              </p>
              <button
                onClick={scrollToEligibility}
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105"
              >
                <Shield className="w-6 h-6" />
                Check Eligibility Now
              </button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="relative">
                  <User className="w-20 h-20 sm:w-28 sm:h-28 text-white/80" />
                  <div className="absolute -right-4 -bottom-2 w-16 h-16 sm:w-20 sm:h-20 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: State Eligibility Checker */}
      <div ref={eligibilityRef} className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">State Eligibility Checker</h2>
          </div>

          <div className="space-y-6">
            {/* State Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which state do you live in?
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                >
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Additional Fields - Show after state selected */}
            {state && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                {/* Monthly Income */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is your monthly income?
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    If you are doing an unpaid internship or volunteering and not earning money, keep it $0
                  </p>
                </div>

                {/* Visa Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is your visa type?
                  </label>
                  <div className="relative">
                    <select
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                    >
                      {VISA_TYPES.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Employer Insurance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have employer insurance?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setHasEmployerInsurance(true)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        hasEmployerInsurance === true
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setHasEmployerInsurance(false)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        hasEmployerInsurance === false
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCheckEligibility}
                  disabled={!state || !visaType || hasEmployerInsurance === null || isSubmitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Check My Eligibility
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Results Panel */}
      {showResults && (
        <div ref={resultsRef} className="max-w-4xl mx-auto px-4 pb-12">
          {/* Employer Insurance */}
          {eligibilityType === "employer" && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">You Have Employer Insurance</h3>
                  <p className="text-blue-700">
                    Great! Employer-sponsored insurance is typically the most comprehensive option. 
                    Make sure to review your plan details and understand your coverage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Free Insurance States */}
          {eligibilityType === "free" && (
            <div className="space-y-6 mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      🎉 Good news! You may qualify for free or $0-cost state-funded insurance.
                    </h3>
                    <p className="text-green-700">
                      Based on your state ({US_STATES.find(s => s.value === state)?.label}), you may be eligible for state-funded health coverage.
                      {income <= 2000 && " Your income level also suggests you may qualify for these programs."}
                    </p>
                  </div>
                </div>
              </div>

              {/* State-specific Free Plans */}
              {stateFreePlans.length > 0 && (
                <div className="grid gap-4">
                  {stateFreePlans.map((plan, index) => (
                    <div key={index} className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                          <p className="text-2xl font-bold text-green-600">{plan.cost}</p>
                        </div>
                        <button
                          onClick={() => handleApplyClick(plan.link)}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map((feature, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            <Check className="w-4 h-4 text-green-600" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Partial Coverage States */}
          {eligibilityType === "partial" && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">
                    ⚠️ Your state offers limited state-funded health programs.
                  </h3>
                  <p className="text-yellow-800">
                    You may qualify for some low-cost options. Check with your state's health marketplace or consider the private insurance options below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Free Insurance */}
          {eligibilityType === "none" && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    ❌ Your state does not offer free insurance for low-income adults.
                  </h3>
                  <p className="text-red-700">
                    Don't worry! There are affordable private insurance options designed specifically for OPT students. Check out the plans below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Private Insurance Options - Show for partial/none or as additional options for free states */}
          {(eligibilityType === "partial" || eligibilityType === "none" || (eligibilityType === "free" && !hasEmployerInsurance)) && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {eligibilityType === "free" ? "Additional Private Insurance Options" : "Recommended Insurance Plans for OPT Students"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {PRIVATE_INSURANCE_OPTIONS.map((plan, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{plan.name}</h4>
                        <p className="text-lg font-bold text-blue-600">{plan.cost}</p>
                      </div>
                      {plan.optEligible && (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                          OPT Eligible
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleApplyClick(plan.link)}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      View Plans
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Plan Comparison Table */}
      {showResults && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Plan Comparison</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${showOnlyEligible ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={showOnlyEligible}
                    onChange={(e) => setShowOnlyEligible(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showOnlyEligible ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm text-gray-600">Show only plans I'm eligible for</span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Monthly Cost</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Deductible</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Network</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">OPT</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Show state plans if eligible */}
                  {eligibilityType === "free" && stateFreePlans.map((plan, index) => (
                    <tr key={`state-${index}`} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{plan.name}</td>
                      <td className="py-4 px-4 text-green-600 font-bold">{plan.cost}</td>
                      <td className="py-4 px-4 text-gray-600">$0</td>
                      <td className="py-4 px-4 text-gray-600">{state} State</td>
                      <td className="py-4 px-4 text-center">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleApplyClick(plan.link)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Apply →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Private options */}
                  {(!showOnlyEligible || eligibilityType !== "free") && PRIVATE_INSURANCE_OPTIONS.map((plan, index) => (
                    <tr key={`private-${index}`} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{plan.name}</td>
                      <td className="py-4 px-4 text-blue-600 font-semibold">{plan.cost}</td>
                      <td className="py-4 px-4 text-gray-600">{plan.deductible}</td>
                      <td className="py-4 px-4 text-gray-600">{plan.network}</td>
                      <td className="py-4 px-4 text-center">
                        {plan.optEligible && <Check className="w-5 h-5 text-green-500 mx-auto" />}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleApplyClick(plan.link)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Apply →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Educational Info */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Info className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Health Insurance 101</h2>
          </div>

          <div className="space-y-3">
            {EDUCATION_ITEMS.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedEducation(expandedEducation === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.title}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedEducation === index ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandedEducation === index && (
                  <div className="px-4 pb-4 text-gray-600 animate-in slide-in-from-top-2 duration-200">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Leaving TrackMyOPT</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You are now leaving TrackMyOPT to complete your enrollment on an external website. We are not responsible for the content or services on external sites.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
