"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronDown, ChevronRight, Sparkles, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";

// US States
const US_STATES = [
  { value: "", label: "Select your state" },
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }, { value: "DC", label: "Washington D.C." },
];

const VISA_TYPES = [
  { value: "", label: "Select visa type" },
  { value: "F-1", label: "F-1" },
  { value: "OPT", label: "OPT" },
  { value: "STEM-OPT", label: "STEM OPT" },
  { value: "J-1", label: "J-1" },
  { value: "Other", label: "Other" },
];

const FAQ_ITEMS = [
  {
    q: "Why should I buy health insurance?",
    a: "Healthcare in the US is extremely expensive. A single ER visit can cost $3,000-$10,000+. Insurance protects you from unexpected medical bills and ensures you can access quality healthcare when needed."
  },
  {
    q: "Can I get a plan without SSN?",
    a: "Yes! No SSN is required. International students and OPT workers can enroll using their passport and visa documents. The process is simple and straightforward."
  },
  {
    q: "How quickly can I get coverage?",
    a: "Get your digital health card instantly after payment confirmation. Coverage can start as early as the next day depending on the plan you choose."
  },
  {
    q: "What is a university waiver?",
    a: "Many universities require health insurance. If you purchase a qualifying plan, you can waive the school's expensive insurance. Our partner plans are designed to meet most university requirements."
  },
  {
    q: "What if my university doesn't accept my plan?",
    a: "Contact your school's health center with your plan details. Most plans from our partners meet university requirements. If not accepted, many partners offer full refunds."
  },
  {
    q: "Does OPT require health insurance?",
    a: "While not legally required, it's strongly recommended. Without insurance, a medical emergency could result in thousands of dollars in debt. Many employers also expect you to have coverage."
  },
  {
    q: "When does my school insurance end?",
    a: "Typically 30-60 days after graduation. Plan ahead to avoid coverage gaps—apply for new insurance before your school plan expires."
  },
  {
    q: "Can I get free insurance in my state?",
    a: "Some states like NY, CA, WA, OR offer free or low-cost plans for low-income residents regardless of immigration status. Use our checker above to see if you qualify!"
  }
];

export default function HealthInsuranceFinderPage() {
  const router = useRouter();
  const [state, setState] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [visaType, setVisaType] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const canSubmit = state && visaType && dateOfBirth;

  const handleShowResults = async () => {
    if (!canSubmit) return;
    
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("insurance_eligibility_checks").insert({
        user_id: user?.id || null,
        state,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : 0,
        visa_type: visaType,
        date_of_birth: dateOfBirth || null,
        has_employer_insurance: false,
        checked_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving:", error);
    }

    // Navigate to results page with query params
    const params = new URLSearchParams({
      state,
      income: monthlyIncome || "0",
      visa: visaType,
      dob: dateOfBirth,
    });
    
    router.push(`/dashboard/opt-health-insurance-finder/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-500/5" />
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-8 sm:pt-16 sm:pb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Free plans available in select states
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Get Health Insurance
              <span className="block text-blue-600">Starting from $0/month</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find affordable coverage based on your state and eligibility. No SSN required.
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">No SSN Required</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Instant Digital Card</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Coverage in 24hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-xl mx-auto px-4 -mt-2">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Check Your Eligibility</h2>
          
          <div className="space-y-5">
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Where do you live?
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
                >
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly income (USD)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1.5">Enter 0 if unpaid internship or unemployed</p>
            </div>

            {/* Visa */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visa type
              </label>
              <div className="relative">
                <select
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  className="w-full h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
                >
                  {VISA_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleShowResults}
              disabled={!canSubmit || isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Show Results
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-900 pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                    expandedFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-center text-sm text-slate-500 mb-6">Our Trusted Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ISO</span>
              </div>
              <span className="font-semibold">ISO Insurance</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">Kimber Health</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ISI</span>
              </div>
              <span className="font-semibold">ISI Student</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-8 px-4">
        <p className="text-xs text-slate-400">
          Insurance plans are provided by our partners. TrackMyOPT helps you find the best options.
        </p>
      </div>
    </div>
  );
}
