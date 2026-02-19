"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { User } from "@supabase/supabase-js";
import { MetricCards } from "./MetricCards";
import { OnboardingCard } from "./OnboardingCard";
import { QuickActions } from "./QuickActions";
import { NotificationBanner } from "../case-status/NotificationBanner";
import {
  useDashboardWidgets,
  DashboardCustomizeButton
} from "./DashboardWidgets";
import { Skeleton } from "@/components/ui/skeleton";

const WidgetSkeleton = () => (
  <div className="rounded-lg border bg-card p-6 space-y-3">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const ChartsSection = dynamic(
  () => import("../case-status/ChartsSection").then((m) => ({ default: m.ChartsSection })),
  { loading: () => <WidgetSkeleton />, ssr: false }
);
const CaseStatusSummary = dynamic(
  () => import("../case-status/CaseStatusSummary").then((m) => ({ default: m.CaseStatusSummary })),
  { loading: () => <WidgetSkeleton /> }
);
const UpcomingDeadlinesPanel = dynamic(
  () => import("../opt/UpcomingDeadlinesPanel").then((m) => ({ default: m.UpcomingDeadlinesPanel })),
  { loading: () => <WidgetSkeleton /> }
);
const ActionableReminders = dynamic(
  () => import("./ActionableReminders").then((m) => ({ default: m.ActionableReminders })),
  { loading: () => <WidgetSkeleton /> }
);
const EmploymentHistoryLog = dynamic(
  () => import("../opt/EmploymentHistoryLog").then((m) => ({ default: m.EmploymentHistoryLog })),
  { loading: () => <WidgetSkeleton /> }
);
const ResourceCenter = dynamic(
  () => import("../ResourceCenter").then((m) => ({ default: m.ResourceCenter })),
  { loading: () => <WidgetSkeleton /> }
);
const PersonalizedTips = dynamic(
  () => import("./PersonalizedTips").then((m) => ({ default: m.PersonalizedTips })),
  { loading: () => <WidgetSkeleton /> }
);
const ToolsGrid = dynamic(
  () => import("../ToolsGrid").then((m) => ({ default: m.ToolsGrid })),
  { loading: () => <WidgetSkeleton /> }
);
const DashboardWidgetsSettings = dynamic(
  () => import("./DashboardWidgets").then((m) => ({ default: m.DashboardWidgetsSettings })),
  { ssr: false }
);

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
      case "quickactions":
        return <QuickActions key="quickactions" />;
      case "casestatus":
        return <CaseStatusSummary key="casestatus" />;
      case "deadlines":
        return (
          <UpcomingDeadlinesPanel
            key="deadlines"
            optStatus={optStatus}
            isStemEligible={profile?.is_stem_eligible}
          />
        );
      case "tips":
        return (
          <PersonalizedTips
            key="tips"
            optStatus={optStatus}
            unemploymentDays={unemploymentDays}
            maxUnemploymentDays={maxUnemploymentDays}
            isStemEligible={profile?.is_stem_eligible}
            hasEmployment={employmentSpans.length > 0}
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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-2">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</a>
          <span>·</span>
          <a href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</a>
          <span>·</span>
          <a href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</a>
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

