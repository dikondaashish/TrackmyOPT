"use client";

import Link from "next/link";
import {
  Mail,
  Bell,
  BellOff,
  Pencil,
  Lock,
  ArrowRight,
  Clock,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OPT_TOOL_ICONS, type OptToolIconKey } from "@/lib/opt-tool-icons";
import { PLAN_SALES_META } from "@/lib/pricing/sales-copy";

export interface ToolEmails {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
}

export type ToolName = keyof ToolEmails;

const TOOL_INFO: Record<
  ToolName,
  { label: string; icon: OptToolIconKey; alertExample: string; color: string }
> = {
  opt_apply: {
    label: "OPT Apply Dates",
    icon: "opt_apply",
    alertExample: "I-765 filing window closes in 14 days",
    color: "from-blue-500 to-blue-600",
  },
  opt_clock: {
    label: "OPT Clock Tracker",
    icon: "opt_clock",
    alertExample: "28 unemployment days left — act before 90",
    color: "from-amber-500 to-orange-500",
  },
  stem_apply: {
    label: "STEM Apply Dates",
    icon: "stem_apply",
    alertExample: "STEM extension deadline in 21 days",
    color: "from-green-500 to-emerald-600",
  },
  stem_clock: {
    label: "STEM Clock Tracker",
    icon: "stem_clock",
    alertExample: "STEM unemployment days approaching limit",
    color: "from-purple-500 to-violet-600",
  },
};

const PRO_CHECKOUT = "/premium/checkout?planId=pro&interval=year";

interface OptEmailRemindersPanelProps {
  isPremium: boolean;
  toolEmails: ToolEmails;
  editingTool: ToolName | null;
  emailSaving: ToolName | null;
  onEditTool: (tool: ToolName) => void;
  onCancelEdit: () => void;
  onSaveTool: (tool: ToolName) => void;
  onStopTool: (tool: ToolName) => void;
  onUpdateEmail: (tool: ToolName, email: string) => void;
  onComparePlans: () => void;
}

function ReminderPreviewMock() {
  return (
    <div className="rounded-xl border border-purple-200/80 bg-white/90 p-4 shadow-sm dark:border-purple-800/60 dark:bg-gray-950/80">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Mail className="h-3.5 w-3.5" />
        <span>Sample reminder · Today, 9:00 AM ET</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        TrackMyOPT — unemployment alert
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        You have{" "}
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          28 unemployment days
        </span>{" "}
        remaining on OPT. Log your job or update employment to stay compliant.
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400">
        Open dashboard
        <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  );
}

function ProUpsellPanel({ onComparePlans }: { onComparePlans: () => void }) {
  const proCta = PLAN_SALES_META.pro.ctaDefault;

  return (
    <Card className="overflow-hidden border-purple-200/80 dark:border-purple-800/60">
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 px-5 py-6 text-white sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Bell className="h-3.5 w-3.5" />
              Pro · Morning reminders
            </div>
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
              Never miss a critical OPT date
            </h3>
            <p className="text-sm text-white/90 sm:text-base">
              Get a personal email every morning at{" "}
              <span className="font-semibold">9:00 AM ET</span> — unemployment
              limits, filing windows, and STEM deadlines before they become
              emergencies.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Clock className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-gradient-to-b from-purple-50/50 to-white p-5 dark:from-purple-950/20 dark:to-gray-950 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
            const info = TOOL_INFO[tool];
            const ToolIcon = OPT_TOOL_ICONS[info.icon];
            return (
              <div
                key={tool}
                className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-[0.07] dark:opacity-[0.12]`}
                />
                <div className="relative flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${info.color} text-white shadow-sm`}
                  >
                    <ToolIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {info.label}
                      </p>
                      <Lock className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {info.alertExample}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ReminderPreviewMock />

        <div className="flex flex-wrap gap-2">
          {[
            "Separate email per tool",
            "Browser + inbox alerts",
            "Customize each tracker",
          ].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-800 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-200"
            >
              <Check className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="w-full bg-purple-600 text-white shadow-md hover:bg-purple-700 sm:w-auto"
          >
            <Link href={PRO_CHECKOUT}>
              {proCta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onComparePlans}
            className="w-full text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40 sm:w-auto"
          >
            Compare all plans
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          7-day free trial · cancel anytime · unlock reminders for all four
          trackers
        </p>
      </div>
    </Card>
  );
}

function PremiumToolCard({
  tool,
  toolEmails,
  editingTool,
  emailSaving,
  onEditTool,
  onCancelEdit,
  onSaveTool,
  onStopTool,
  onUpdateEmail,
}: {
  tool: ToolName;
  toolEmails: ToolEmails;
  editingTool: ToolName | null;
  emailSaving: ToolName | null;
  onEditTool: (tool: ToolName) => void;
  onCancelEdit: () => void;
  onSaveTool: (tool: ToolName) => void;
  onStopTool: (tool: ToolName) => void;
  onUpdateEmail: (tool: ToolName, email: string) => void;
}) {
  const info = TOOL_INFO[tool];
  const ToolIcon = OPT_TOOL_ICONS[info.icon];
  const isEditing = editingTool === tool;
  const isSaving = emailSaving === tool;
  const hasEmail = !!toolEmails[tool];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl ${info.color}`}
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <ToolIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold">{info.label}</h4>
            <p className="text-sm opacity-90">{info.alertExample}</p>
          </div>
        </div>
        {hasEmail ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/30 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/30 px-3 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Inactive
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="email"
            value={toolEmails[tool]}
            onChange={(e) => onUpdateEmail(tool, e.target.value)}
            placeholder="your.email@example.com"
            className="h-11 border-white/30 bg-white/20 text-sm text-white placeholder:text-white/60"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onSaveTool(tool)}
              size="sm"
              className="bg-white/25 px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-white/35"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={onCancelEdit}
              size="sm"
              variant="ghost"
              className="text-sm text-white/80 transition-all duration-200 hover:bg-white/15 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between gap-4 border-t border-white/15 pt-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium">
              {toolEmails[tool] || "No email set"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {hasEmail && (
              <button
                type="button"
                onClick={() => onStopTool(tool)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-200 shadow-sm transition-all duration-200 hover:bg-red-500/30 hover:text-red-100 hover:shadow disabled:opacity-50"
              >
                <BellOff className="h-4 w-4" />
                <span>{isSaving ? "..." : "Stop"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onEditTool(tool)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white/90 shadow-sm transition-all duration-200 hover:bg-white/25 hover:text-white hover:shadow"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function OptEmailRemindersPanel({
  isPremium,
  toolEmails,
  editingTool,
  emailSaving,
  onEditTool,
  onCancelEdit,
  onSaveTool,
  onStopTool,
  onUpdateEmail,
  onComparePlans,
}: OptEmailRemindersPanelProps) {
  if (!isPremium) {
    return <ProUpsellPanel onComparePlans={onComparePlans} />;
  }

  return (
    <Card className="overflow-hidden border-purple-200 dark:border-purple-800">
      <div className="border-b border-purple-100 bg-gradient-to-br from-purple-50/80 to-blue-50/80 px-5 py-5 dark:border-purple-900/50 dark:from-purple-900/20 dark:to-blue-900/20 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Your morning reminders
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daily at <span className="font-medium">9:00 AM ET</span> — choose
              where each tracker sends alerts
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-2">
        {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => (
          <PremiumToolCard
            key={tool}
            tool={tool}
            toolEmails={toolEmails}
            editingTool={editingTool}
            emailSaving={emailSaving}
            onEditTool={onEditTool}
            onCancelEdit={onCancelEdit}
            onSaveTool={onSaveTool}
            onStopTool={onStopTool}
            onUpdateEmail={onUpdateEmail}
          />
        ))}
      </div>
    </Card>
  );
}
