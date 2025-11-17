"use client";
import { MetricCards } from "./MetricCards";
import { OnboardingCard } from "./OnboardingCard";
import { ToolsGrid } from "./ToolsGrid";
import { ChartsSection } from "./ChartsSection";
import { User } from "@supabase/supabase-js";

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <MetricCards />
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

