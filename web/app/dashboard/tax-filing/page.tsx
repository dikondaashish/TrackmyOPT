"use client";

import { useState } from "react";
import { 
  Receipt, 
  ChevronDown, 
  ExternalLink, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  DollarSign,
  Clock,
  Shield,
  Users,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase
} from "lucide-react";
import Image from "next/image";

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
    description: "Experts in tax refunds for international students. They handle everything for you.",
    features: ["Full-service filing", "Refund maximization", "FICA recovery", "Multi-year filing"],
    badge: "Full Service",
    link: "https://www.taxback.com/"
  }
];

// Important tax deadlines
const TAX_DEADLINES = [
  { date: "April 15", description: "Federal & state tax return deadline (with income)", icon: Calendar },
  { date: "June 15", description: "Form 8843 deadline (no U.S. income)", icon: FileText },
  { date: "January 31", description: "W-2 forms sent by employers", icon: Briefcase },
  { date: "March 15", description: "1042-S forms sent by universities", icon: GraduationCap }
];

// FAQ items
const FAQ_ITEMS = [
  {
    q: "Do I need to file taxes if I had no U.S. income?",
    a: "Yes! Even with no income, F-1 and J-1 visa holders must file Form 8843 (Statement for Exempt Individuals) to document their presence in the U.S. This form is required by the IRS and helps maintain your legal status."
  },
  {
    q: "What is the Substantial Presence Test?",
    a: "The Substantial Presence Test determines if you're a 'resident alien' for tax purposes. F-1 students are generally exempt from this test for the first 5 calendar years in the U.S., meaning they file as non-residents during this period."
  },
  {
    q: "What's the difference between Form 8843 and 1040-NR?",
    a: "Form 8843 is for non-residents with NO U.S. income—it simply documents your exempt status. Form 1040-NR (Nonresident Alien Income Tax Return) is for non-residents WITH U.S. income from wages, scholarships, or other sources."
  },
  {
    q: "Can I get a refund for FICA taxes (Social Security & Medicare)?",
    a: "Yes! F-1 and J-1 students are generally exempt from FICA taxes during their first 5 years. If your employer incorrectly withheld these taxes, you can request a refund directly from them or file Form 843 with the IRS."
  },
  {
    q: "Do I need to file state taxes too?",
    a: "It depends on the state where you worked or studied. Some states have no income tax (like Texas, Florida, Washington), while others require separate state returns. Check your state's tax department website for requirements."
  },
  {
    q: "What if I got married to a U.S. citizen?",
    a: "Marriage to a U.S. citizen gives you the option to file jointly as a resident or separately as a non-resident. This is a complex situation—we strongly recommend consulting a tax professional to determine the most beneficial filing status."
  },
  {
    q: "What documents do I need to file my taxes?",
    a: "You'll need: W-2 (from employers), 1042-S (from university for scholarships/stipends), passport, I-20 or DS-2019, Social Security Number or ITIN, and any state tax forms you've received."
  },
  {
    q: "Can I use TurboTax or other mainstream software?",
    a: "Most mainstream tax software (TurboTax, H&R Block, etc.) does NOT support non-resident returns (Form 1040-NR). You should use specialized software like Sprintax or Glacier Tax Prep that's designed for international students."
  }
];

// Tax status questions
const TAX_STATUS_QUESTIONS = [
  {
    id: "years",
    question: "How many calendar years have you been in the U.S. on F-1/J-1 visa?",
    options: [
      { label: "Less than 5 years", result: "non-resident" },
      { label: "5 or more years", result: "may-be-resident" }
    ]
  },
  {
    id: "income",
    question: "Did you have any U.S. income this year?",
    options: [
      { label: "Yes (wages, scholarship, stipend)", result: "has-income" },
      { label: "No U.S. income", result: "no-income" }
    ]
  }
];

export default function TaxFilingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitUrl, setExitUrl] = useState("");
  const [taxStatus, setTaxStatus] = useState<{years?: string; income?: string}>({});

  const handleApply = (url: string) => {
    setExitUrl(url);
    setShowExitModal(true);
  };

  const confirmExit = () => {
    window.open(exitUrl, "_blank");
    setShowExitModal(false);
  };

  // Determine filing requirement based on answers
  const getFilingRequirement = () => {
    if (!taxStatus.years || !taxStatus.income) return null;
    
    if (taxStatus.years === "may-be-resident") {
      return {
        status: "Complex Situation",
        color: "amber",
        message: "You may have become a tax resident. We recommend consulting a tax professional to determine your exact filing requirements.",
        forms: ["Consult a CPA or tax advisor"]
      };
    }
    
    if (taxStatus.income === "no-income") {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-teal-500/5" />
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Tax Season 2024-2025
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Tax Filing for
              <span className="block text-emerald-600">OPT & STEM-OPT</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Navigate U.S. tax requirements with confidence. Learn what forms you need, 
              important deadlines, and file with our trusted partners.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-slate-700">Non-Resident Specialists</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-slate-700">IRS Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-slate-700">File in Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Alert */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">Important for F-1 & J-1 Students</h3>
            <p className="text-sm text-amber-800 mt-1">
              Even if you had <strong>no U.S. income</strong>, you must file <strong>Form 8843</strong> to document your presence. 
              This is required by the IRS and helps maintain your legal status.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Status Checker */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Determine Your Filing Requirements</h2>
          <p className="text-slate-600 text-sm mb-6">Answer these quick questions to find out what forms you need to file.</p>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Years in US */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Years in the U.S. on F-1/J-1?
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setTaxStatus(prev => ({...prev, years: "non-resident"}))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                    taxStatus.years === "non-resident"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Less than 5 years
                </button>
                <button
                  onClick={() => setTaxStatus(prev => ({...prev, years: "may-be-resident"}))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                    taxStatus.years === "may-be-resident"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  5 or more years
                </button>
              </div>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Did you have U.S. income this year?
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setTaxStatus(prev => ({...prev, income: "has-income"}))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                    taxStatus.income === "has-income"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Yes (wages, scholarship, stipend)
                </button>
                <button
                  onClick={() => setTaxStatus(prev => ({...prev, income: "no-income"}))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                    taxStatus.income === "no-income"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  No U.S. income
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          {filingRequirement && (
            <div className={`rounded-xl p-4 ${
              filingRequirement.color === "amber" ? "bg-amber-50 border border-amber-200" :
              filingRequirement.color === "blue" ? "bg-blue-50 border border-blue-200" :
              "bg-emerald-50 border border-emerald-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  filingRequirement.color === "amber" ? "bg-amber-100" :
                  filingRequirement.color === "blue" ? "bg-blue-100" :
                  "bg-emerald-100"
                }`}>
                  <FileText className={`w-4 h-4 ${
                    filingRequirement.color === "amber" ? "text-amber-600" :
                    filingRequirement.color === "blue" ? "text-blue-600" :
                    "text-emerald-600"
                  }`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    filingRequirement.color === "amber" ? "text-amber-900" :
                    filingRequirement.color === "blue" ? "text-blue-900" :
                    "text-emerald-900"
                  }`}>{filingRequirement.status}</h4>
                  <p className={`text-sm mt-1 ${
                    filingRequirement.color === "amber" ? "text-amber-800" :
                    filingRequirement.color === "blue" ? "text-blue-800" :
                    "text-emerald-800"
                  }`}>{filingRequirement.message}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {filingRequirement.forms.map((form, i) => (
                      <span key={i} className={`text-xs font-medium px-2 py-1 rounded-full ${
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
          )}
        </div>
      </div>

      {/* Important Deadlines */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Important Tax Deadlines</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TAX_DEADLINES.map((deadline, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <deadline.icon className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-lg font-bold text-slate-900">{deadline.date}</p>
              <p className="text-xs text-slate-600 mt-1">{deadline.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="text-center mb-6">
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
              
              <button
                onClick={() => handleApply(partner.link)}
                className={`w-full mt-4 h-10 bg-gradient-to-r ${partner.color} text-white font-medium text-sm rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-1.5`}
              >
                File Now
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
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
              content: `If you had no U.S. income, you still need to file Form 8843:\n
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
              content: `If you earned wages, scholarships, or stipends:\n
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
              content: `If FICA (Social Security & Medicare) was incorrectly withheld:\n
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

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
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
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    expandedFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? "max-h-96" : "max-h-0"}`}>
                <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Links */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Official Resources</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: "IRS Form 8843", url: "https://www.irs.gov/forms-pubs/about-form-8843", desc: "Statement for Exempt Individuals" },
            { name: "IRS Form 1040-NR", url: "https://www.irs.gov/forms-pubs/about-form-1040-nr", desc: "Non-Resident Alien Tax Return" },
            { name: "IRS Publication 519", url: "https://www.irs.gov/publications/p519", desc: "U.S. Tax Guide for Aliens" },
            { name: "State Tax Agencies", url: "https://www.taxadmin.org/state-tax-agencies", desc: "Find your state's tax website" }
          ].map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{resource.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{resource.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
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
    </div>
  );
}
