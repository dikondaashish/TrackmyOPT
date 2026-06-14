"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { User } from "@supabase/supabase-js";
import { MetricCards } from "./MetricCards";
import { OnboardingCard } from "./OnboardingCard";
import { OnboardingWizard } from "../onboarding/OnboardingWizard";
import { QuickActions } from "./QuickActions";
import { NotificationBanner } from "../case-status/NotificationBanner";
import {
  useDashboardWidgets,
  DashboardCustomizeButton
} from "./DashboardWidgets";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardViewTracker } from "@/components/analytics/DashboardViewTracker";
import { DashboardNextStepCard } from "./DashboardNextStepCard";
import { calculateUnemploymentDays, type EmploymentSpan as CalculationEmploymentSpan } from "@/lib/immigration/optCalculations";

const WidgetSkeleton = () => (
  <div className="rounded-lg border bg-card p-6 space-y-4 min-h-[180px]">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
    <Skeleton className="h-28 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-8 w-1/3" />
    </div>
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
const ResourceCenter = dynamic(
  () => import("./ResourceCenter").then((m) => ({ default: m.ResourceCenter })),
  { loading: () => <WidgetSkeleton /> }
);
const PersonalizedTips = dynamic(
  () => import("./PersonalizedTips").then((m) => ({ default: m.PersonalizedTips })),
  { loading: () => <WidgetSkeleton /> }
);
const ToolsGrid = dynamic(
  () => import("./ToolsGrid").then((m) => ({ default: m.ToolsGrid })),
  { loading: () => <WidgetSkeleton /> }
);
const DashboardWidgetsSettings = dynamic(
  () => import("./DashboardWidgets").then((m) => ({ default: m.DashboardWidgetsSettings })),
  { ssr: false }
);
const ProfileCompletionWidget = dynamic(
  () => import("./ProfileCompletionWidget").then((m) => ({ default: m.ProfileCompletionWidget })),
  { loading: () => <WidgetSkeleton /> }
);
const RecentActivityLog = dynamic(
  () => import("./RecentActivityLog").then((m) => ({ default: m.RecentActivityLog })),
  { loading: () => <WidgetSkeleton /> }
);
const UscisProcessingTimes = dynamic(
  () => import("./UscisProcessingTimes").then((m) => ({ default: m.UscisProcessingTimes })),
  { loading: () => <WidgetSkeleton /> }
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
  degree_level?: string | null;
  major_name?: string | null;
}

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const displayName =
    (user.user_metadata as any)?.fullName ||
    [ (user.user_metadata as any)?.firstName, (user.user_metadata as any)?.lastName ]
      .filter(Boolean)
      .join(" ") ||
    (user.email ? user.email.split("@")[0] : "");

  const [optStatus, setOptStatus] = useState<OptStatus | null>(null);
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unemploymentDays, setUnemploymentDays] = useState(0);
  const [maxUnemploymentDays, setMaxUnemploymentDays] = useState(90);
  const [showSettings, setShowSettings] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeUsage, setResumeUsage] = useState(0);
  // ISS-029: explicit error state instead of silent console.error
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchRetryNonce, setFetchRetryNonce] = useState(0);

  const {
    widgets,
    toggleWidget,
    moveWidget,
    resetToDefaults,
    isWidgetVisible,
    isLoaded: widgetsLoaded,
  } = useDashboardWidgets();

  const onboardingDismissedKey = `trackmyopt_onboarding_dismissed_${user.id}`;

  // Fetch user data
  useEffect(() => {
    const dismissKey = `trackmyopt_onboarding_dismissed_${user.id}`;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include", cache: "no-store" });
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

          // Compute unemployment client-side from live spans to keep Dashboard
          // perfectly aligned with Employment History calculations.
          if (data.optStatus?.opt_start_date && data.optStatus?.opt_ead_end_date) {
            const spansForCalc: CalculationEmploymentSpan[] = (data.employmentSpans || []).map((s: EmploymentSpan) => ({
              id: s.id,
              employer_name: s.employer_name || "",
              start_date: s.start_date,
              end_date: s.end_date,
              is_current: s.is_current,
              job_title: s.job_title,
              location: s.location,
            }));
            const calc = calculateUnemploymentDays(
              data.optStatus.opt_start_date,
              data.optStatus.opt_ead_end_date,
              spansForCalc,
              data.optStatus.stem_start_date,
              data.optStatus.stem_end_date
            );
            setUnemploymentDays(calc.used);
            // Trust the calculator's phase-aware max so denominator matches numerator.
            setMaxUnemploymentDays(calc.max);
          } else if (data.unemploymentDays !== undefined) {
            // Fallback for incomplete status payloads.
            setUnemploymentDays(data.unemploymentDays);
          }

          if (!data.optStatus) {
            let dismissed = false;
            try {
              dismissed = typeof window !== "undefined" && localStorage.getItem(dismissKey) === "1";
            } catch {
              dismissed = false;
            }
            if (!dismissed) {
              setShowWizard(true);
            }
          }

          // Fetch Resume Usage for Profile Completion
          const usageResponse = await fetch("/api/user/usage");
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            setResumeUsage(usageData.resumeUsage || 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // ISS-029: surface error to user with retry CTA
        setFetchError(
          error instanceof Error ? error.message : 'Could not load your dashboard data.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    setFetchError(null);
    fetchData();
     
  }, [user.id, fetchRetryNonce]);

  // Render widget based on ID
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "profile-completion":
        return (
          <ProfileCompletionWidget 
            key="profile-completion" 
            optStatus={optStatus} 
            employmentSpans={employmentSpans} 
            profile={profile} 
            resumeUsage={resumeUsage}
          />
        );
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
      case "recent-activity":
        return (
          <RecentActivityLog 
            key="recent-activity" 
            user={user} 
            optStatus={optStatus} 
            employmentSpans={employmentSpans} 
          />
        );
      case "tools":
        return <ToolsGrid key="tools" />;
      case "charts":
        return <ChartsSection key="charts" />;
      case "uscis":
        return <UscisProcessingTimes key="uscis" />;
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
      <DashboardViewTracker />
      {/* Header with customize button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{displayName ? `, ${displayName}` : ""}
            {profile?.major_name && profile?.degree_level && (
              <span className="hidden sm:inline opacity-80">
                {" "}({profile.degree_level} in {profile.major_name})
              </span>
            )}
          </p>
        </div>
        <DashboardCustomizeButton onClick={() => setShowSettings(true)} />
      </div>

      <DashboardNextStepCard />

      {/* ISS-029: explicit error + retry instead of silent failure */}
      {fetchError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Couldn&apos;t load your dashboard data.</strong>{' '}
            <span className="opacity-90">{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFetchRetryNonce((n) => n + 1)}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Try again
          </button>
        </div>
      )}

      {/* Show onboarding if no OPT dates */}
      {!isLoading && !optStatus && !showWizard && <OnboardingCard />}
      <OnboardingWizard
        isOpen={showWizard}
        onComplete={() => window.location.reload()}
        onSkip={() => {
          try {
            localStorage.setItem(onboardingDismissedKey, "1");
          } catch {
            /* ignore quota / private mode */
          }
          setShowWizard(false);
        }}
      />

      {/* Render visible widgets after localStorage config is applied (avoids hydration/order flash) */}
      <div className="grid gap-6">
        {!widgetsLoaded
          ? [...Array(3)].map((_, i) => <WidgetSkeleton key={`widget-skeleton-${i}`} />)
          : visibleWidgets.map((widget) => renderWidget(widget.id))}
      </div>

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
        <p suppressHydrationWarning>© {new Date().getFullYear()} TrackMyOPT by Zyene, Inc. All rights reserved.</p>
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

