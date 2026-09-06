"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  HelpCircle,
  BookOpen,
  ExternalLink,
  Search,
} from "lucide-react";
import { HelpGuideTab } from "./help/HelpGuideTab";
import { HelpFeaturesTab } from "./help/HelpFeaturesTab";
import { HelpFaqTab } from "./help/HelpFaqTab";

export function HelpSection() {
  const [activeTab, setActiveTab] = useState<"guide" | "features" | "faq">("guide");

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Help Center</h1>
            <p className="text-muted-foreground">
              Everything you need to know about OPT and TrackMyOPT
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: "guide", label: "OPT Guide", icon: BookOpen },
          { id: "features", label: "App Features", icon: Search },
          { id: "faq", label: "FAQ", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* OPT Guide Tab */}
      {activeTab === "guide" && <HelpGuideTab />}

      {/* App Features Tab */}
      {activeTab === "features" && <HelpFeaturesTab />}

      {/* FAQ Tab */}
      {activeTab === "faq" && <HelpFaqTab />}

      {/* Quick Links Footer */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Useful External Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "USCIS Case Status", url: "https://egov.uscis.gov/casestatus/landing.do" },
            { label: "SEVP Portal", url: "https://studyinthestates.dhs.gov/students" },
            { label: "I-765 Instructions", url: "https://www.uscis.gov/i-765" },
            { label: "STEM Degree List", url: "https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/eligible-cip-codes-for-the-stem-opt-extension" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 text-sm border border-border rounded-lg hover:bg-accent hover:border-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="text-center text-xs text-muted-foreground p-4 bg-card border border-border rounded-lg">
        <p>
          <strong>Disclaimer:</strong> TrackMyOPT provides general information and tools to help manage your OPT.
          This is not legal advice. Immigration rules can change. Always consult with your DSO or an immigration
          attorney for specific guidance on your situation.
        </p>
      </div>
    </div>
  );
}
