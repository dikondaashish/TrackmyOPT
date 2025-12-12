"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { MetricCards } from "./MetricCards";
import { OnboardingCard } from "./OnboardingCard";
import { ToolsGrid } from "./ToolsGrid";
import { ChartsSection } from "./ChartsSection";
import { UpcomingDeadlinesPanel } from "./UpcomingDeadlinesPanel";
import { ActionableReminders } from "./ActionableReminders";
import { NotificationBanner } from "./NotificationBanner";
import { EmploymentHistoryLog } from "./EmploymentHistoryLog";
import { ResourceCenter } from "./ResourceCenter";
import { QuickExport } from "./QuickExport";
import { 
  useDashboardWidgets, 
  DashboardWidgetsSettings, 
  DashboardCustomizeButton 
} from "./DashboardWidgets";

interface OptStatus {
  program_end_date: string;
  opt_start_date: string;
  opt_ead_end_date: string;
  stem_start_date?: string | null;
}

interface EmploymentSpan {
  id: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  job_title?: string;
  location?: string;
}

interface Profile {
  is_stem_eligible: boolean;
}

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [optStatus, setOptStatus] = useState<OptStatus | null>(null);
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unemploymentDays, setUnemploymentDays] = useState(0);
  const [maxUnemploymentDays, setMaxUnemploymentDays] = useState(90);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    widgets,
    toggleWidget,
    moveWidget,
    resetToDefaults,
    isWidgetVisible,
    isLoaded: widgetsLoaded,
  } = useDashboardWidgets();

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          
          if (data.optStatus) {
            setOptStatus(data.optStatus);
          }
          
          if (data.employmentSpans) {
            setEmploymentSpans(data.employmentSpans);
          }
          
          if (data.profile) {
            setProfile(data.profile);
            // Set max unemployment days based on STEM status
            if (data.optStatus?.stem_start_date) {
              setMaxUnemploymentDays(150);
            }
          }

          // Calculate unemployment days if we have the data
          if (data.unemploymentDays !== undefined) {
            setUnemploymentDays(data.unemploymentDays);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render widget based on ID
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "notifications":
        return (
          <NotificationBanner
            key="notifications"
            optStatus={optStatus}
            unemploymentDays={unemploymentDays}
            maxUnemploymentDays={maxUnemploymentDays}
          />
        );
      case "metrics":
        return <MetricCards key="metrics" />;
      case "deadlines":
        return (
          <UpcomingDeadlinesPanel
            key="deadlines"
            optStatus={optStatus}
            isStemEligible={profile?.is_stem_eligible}
          />
        );
      case "reminders":
        return <ActionableReminders key="reminders" />;
      case "employment":
        return (
          <EmploymentHistoryLog
            key="employment"
            employmentSpans={employmentSpans}
            optStartDate={optStatus?.opt_start_date}
            optEndDate={optStatus?.opt_ead_end_date}
            maxUnemploymentDays={maxUnemploymentDays}
          />
        );
      case "tools":
        return <ToolsGrid key="tools" />;
      case "charts":
        return <ChartsSection key="charts" />;
      case "resources":
        return <ResourceCenter key="resources" />;
      case "export":
        return <QuickExport key="export" />;
      default:
        return null;
    }
  };

  // Get visible widgets in order
  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header with customize button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </p>
        </div>
        <DashboardCustomizeButton onClick={() => setShowSettings(true)} />
      </div>

      {/* Show onboarding if no OPT dates */}
      {!isLoading && !optStatus && <OnboardingCard />}

      {/* Render visible widgets */}
      {widgetsLoaded &&
        visibleWidgets.map((widget) => renderWidget(widget.id))}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</a>
          <span>·</span>
          <a href="/dashboard/help" className="hover:text-foreground transition-colors">Help</a>
        </div>
        <p>© 2025 TrackMyOPT by Zyene, Inc. All rights reserved.</p>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <DashboardWidgetsSettings
          widgets={widgets}
          onToggle={toggleWidget}
          onMove={moveWidget}
          onReset={resetToDefaults}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

