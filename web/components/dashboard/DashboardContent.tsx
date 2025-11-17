"use client";
import { MetricCards } from "./MetricCards";
import { OnboardingCard } from "./OnboardingCard";
import { ToolsGrid } from "./ToolsGrid";
import { ChartsSection } from "./ChartsSection";
import { DateSelector } from "./DateSelector";
import { User } from "@supabase/supabase-js";

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <MetricCards />
      
      {/* Date Selector Dropdown */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅</span> Your Dates
          </h2>
          <a
            href="/dashboard/opt-dates"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit Dates →
          </a>
        </div>
        <DateSelector />
      </div>

      <OnboardingCard />
      <ToolsGrid />
      <ChartsSection />

      <footer className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a href="/privacy" className="hover:text-foreground">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-foreground">Terms &amp; Conditions</a>
          <span>·</span>
          <a href="/support" className="hover:text-foreground">Support</a>
        </div>
        <p>© 2025 TrackMyOPT. All rights reserved.</p>
      </footer>
    </div>
  );
}

