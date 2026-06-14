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
  Clock,
  Shield,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [taxStatus, setTaxStatus] = useState<{ years?: string; income?: string }>({});

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
    <div className="max-md:-mx-3 max-md:-my-3 md:min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-background dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-teal-500/5" />
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Receipt className="w-4 h-4" />
              Tax Season 2024-2025
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-foreground tracking-tight mb-4">
              Tax Filing for
              <span className="block text-emerald-600 dark:text-emerald-400">OPT & STEM-OPT</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto">
              Navigate U.S. tax requirements with confidence. Learn what forms you need,
              important deadlines, and file with our trusted partners.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-slate-700 dark:text-foreground">Non-Resident Specialists</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-slate-700 dark:text-foreground">IRS Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-slate-700 dark:text-foreground">File in Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Alert */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-300">Important for F-1 & J-1 Students</h3>
            <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
              Even if you had <strong>no U.S. income</strong>, you must file <strong>Form 8843</strong> to document your presence.
              This is required by the IRS and helps maintain your legal status.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Status Checker */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-2">Determine Your Filing Requirements</h2>
          <p className="text-slate-600 dark:text-muted-foreground text-sm mb-6">Answer these quick questions to find out what forms you need to file.</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Years in US */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-foreground mb-2">
                Years in the U.S. on F-1/J-1?
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setTaxStatus(prev => ({ ...prev, years: "non-resident" }))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${taxStatus.years === "non-resident"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-muted-foreground dark:text-foreground"
                    }`}
                >
                  Less than 5 years
                </button>
                <button
                  onClick={() => setTaxStatus(prev => ({ ...prev, years: "may-be-resident" }))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${taxStatus.years === "may-be-resident"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                    : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-muted-foreground dark:text-foreground"
                    }`}
                >
                  5 or more years
                </button>
              </div>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-foreground mb-2">
                Did you have U.S. income this year?
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setTaxStatus(prev => ({ ...prev, income: "has-income" }))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${taxStatus.income === "has-income"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-muted-foreground dark:text-foreground"
                    }`}
                >
                  Yes (wages, scholarship, stipend)
                </button>
                <button
                  onClick={() => setTaxStatus(prev => ({ ...prev, income: "no-income" }))}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${taxStatus.income === "no-income"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                    : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-muted-foreground dark:text-foreground"
                    }`}
                >
                  No U.S. income
                </button>
              </div>
            </div>
          </div>

          {/* Result Preview */}
          {filingRequirement && (
            <div className={`rounded-xl p-4 ${filingRequirement.color === "amber" ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" :
              filingRequirement.color === "blue" ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" :
                "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${filingRequirement.color === "amber" ? "bg-amber-100 dark:bg-amber-900/50" :
                  filingRequirement.color === "blue" ? "bg-blue-100 dark:bg-blue-900/50" :
                    "bg-emerald-100 dark:bg-emerald-900/50"
                  }`}>
                  <FileText className={`w-4 h-4 ${filingRequirement.color === "amber" ? "text-amber-600" :
                    filingRequirement.color === "blue" ? "text-blue-600" :
                      "text-emerald-600"
                    }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${filingRequirement.color === "amber" ? "text-amber-900 dark:text-amber-300" :
                    filingRequirement.color === "blue" ? "text-blue-900 dark:text-blue-300" :
                      "text-emerald-900 dark:text-emerald-300"
                    }`}>{filingRequirement.status}</h4>
                  <p className={`text-sm mt-1 ${filingRequirement.color === "amber" ? "text-amber-800 dark:text-amber-400" :
                    filingRequirement.color === "blue" ? "text-blue-800 dark:text-blue-400" :
                      "text-emerald-800 dark:text-emerald-400"
                    }`}>{filingRequirement.message}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {filingRequirement.forms.map((form, i) => (
                      <span key={i} className={`text-xs font-medium px-2 py-1 rounded-full ${filingRequirement.color === "amber" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" :
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
          )}

          {/* Show Results Button */}
          <button
            onClick={() => {
              if (taxStatus.years && taxStatus.income) {
                router.push(`/dashboard/tax-filing/results?years=${taxStatus.years}&income=${taxStatus.income}`);
              }
            }}
            disabled={!taxStatus.years || !taxStatus.income}
            className={`w-full h-12 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${taxStatus.years && taxStatus.income
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg"
              : "bg-slate-100 dark:bg-muted text-slate-400 dark:text-muted-foreground cursor-not-allowed"
              }`}
          >
            Show Results
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Important Deadlines */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Important Tax Deadlines</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TAX_DEADLINES.map((deadline, i) => (
            <div key={i} className={`relative rounded-xl p-[1.5px] overflow-hidden group bg-slate-200 dark:bg-gradient-to-br ${i === 0 ? "dark:from-emerald-400 dark:via-cyan-500 dark:to-blue-500" :
                i === 1 ? "dark:from-blue-400 dark:via-indigo-500 dark:to-purple-500" :
                  i === 2 ? "dark:from-purple-400 dark:via-fuchsia-500 dark:to-pink-500" :
                    "dark:from-pink-400 dark:via-rose-500 dark:to-amber-500"
              }`}>
              <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl" />
              <div className="relative h-full bg-white dark:bg-slate-900 rounded-xl p-4 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${i === 0 ? "bg-emerald-50 dark:bg-emerald-900/20" :
                    i === 1 ? "bg-blue-50 dark:bg-blue-900/20" :
                      i === 2 ? "bg-purple-50 dark:bg-purple-900/20" :
                        "bg-pink-50 dark:bg-pink-900/20"
                  }`}>
                  <deadline.icon className={`w-5 h-5 ${i === 0 ? "text-emerald-600 dark:text-emerald-400" :
                      i === 1 ? "text-blue-600 dark:text-blue-400" :
                        i === 2 ? "text-purple-600 dark:text-purple-400" :
                          "text-pink-600 dark:text-pink-400"
                    }`} />
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{deadline.date}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{deadline.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-xl border border-slate-100 dark:border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-muted transition-colors"
              >
                <span className="font-medium text-slate-900 dark:text-foreground pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? "rotate-180" : ""
                    }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${expandedFaq === i ? "max-h-96" : "max-h-0"}`}>
                <div className="px-4 pb-4 text-slate-600 dark:text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Links */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Official Resources</h2>
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
              className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-foreground">{resource.name}</p>
                <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{resource.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-muted-foreground" />
            </a>
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

    </div>
  );
}
