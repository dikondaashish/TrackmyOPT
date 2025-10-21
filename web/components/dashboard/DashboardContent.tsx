"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MetricCards } from "./MetricCards";
import { OnboardingCard } from "./OnboardingCard";
import { ToolsGrid } from "./ToolsGrid";
import { ChartsSection } from "./ChartsSection";
import { PremiumModal } from "./PremiumModal";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  // Check if URL has upgrade parameter
  useEffect(() => {
    if (searchParams.get('upgrade') === 'true' || searchParams.get('premium') === 'true') {
      setPremiumModalOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

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

      {/* Premium Upgrade Modal */}
      <PremiumModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} />
    </div>
  );
}

