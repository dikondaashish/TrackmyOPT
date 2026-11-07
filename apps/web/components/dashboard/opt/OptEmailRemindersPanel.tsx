"use client";

import Link from "next/link";
import {
  Mail,
  BellOff,
  Pencil,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OPT_TOOL_ICONS, type OptToolIconKey } from "@/lib/opt-tool-icons";
import { PLAN_SALES_META } from "@/lib/pricing/sales-copy";
import {
  PRODUCT_CTAS,
  REMINDER_MESSAGING,
} from "@/lib/messaging/product-copy";

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
    color: "bg-blue-500",
  },
  opt_clock: {
    label: "OPT Clock Tracker",
    icon: "opt_clock",
    alertExample: "28 unemployment days left — act before 90",
    color: "bg-amber-500",
  },
  stem_apply: {
    label: "STEM Apply Dates",
    icon: "stem_apply",
    alertExample: "STEM extension deadline in 21 days",
    color: "bg-green-500",
  },
  stem_clock: {
    label: "STEM Clock Tracker",
    icon: "stem_clock",
    alertExample: "STEM unemployment days approaching limit",
    color: "bg-violet-500",
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
    <div className="rounded-xl border border-violet-200 bg-white p-4 dark:border-violet-800 dark:bg-gray-950 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Mail className="h-3.5 w-3.5" />
        <span>Sample reminder · Today, 9:00 AM ET</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {REMINDER_MESSAGING.sampleEmailSubject}
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {REMINDER_MESSAGING.sampleEmailBody}
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
        Open dashboard
        <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  );
}

function ProUpsellPanel({ onComparePlans }: { onComparePlans: () => void }) {
  const proCta = PLAN_SALES_META.pro.ctaDefault;

  return (
    <Card className="overflow-hidden border-violet-200 dark:border-violet-800">
      <div className="bg-violet-600 px-5 py-6 text-white sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <p className="text-sm font-medium text-violet-100">
              Pro · Morning reminders
            </p>
            <h3 className="text-xl font-bold sm:text-2xl">
              {REMINDER_MESSAGING.panelHeadline}
            </h3>
            <p className="text-sm text-white sm:text-base">
              {REMINDER_MESSAGING.panelSubhead}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-violet-50 p-5 dark:bg-violet-950 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
            const info = TOOL_INFO[tool];
            const ToolIcon = OPT_TOOL_ICONS[info.icon];
            return (
              <div
                key={tool}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-card"
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${info.color} text-white`}
                  >
                    <ToolIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {info.label}
                      </p>
                      <Lock className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Example: {info.alertExample}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ReminderPreviewMock />

        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-violet-900 dark:text-violet-200">
          {[
            "Separate email per tool",
            "Browser + inbox alerts",
            "Customize each tracker",
          ].map((label) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              {label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="w-full bg-violet-600 text-white hover:bg-violet-700 sm:w-auto"
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
            className="w-full text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:text-violet-300 dark:hover:bg-violet-900 sm:w-auto"
          >
            {PRODUCT_CTAS.comparePlans}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {REMINDER_MESSAGING.footerNote}
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
      className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800"
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start sm:gap-0">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${info.color} text-white`}
          >
            <ToolIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {info.label}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Example: {info.alertExample}
            </p>
          </div>
        </div>
        {hasEmail ? (
          <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
            Active
          </span>
        ) : (
          <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
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
            className="h-11 bg-white text-sm dark:bg-gray-900"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onSaveTool(tool)}
              size="sm"
              className="px-4 text-sm font-medium"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={onCancelEdit}
              size="sm"
              variant="ghost"
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-700 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {toolEmails[tool] || "No email set"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {hasEmail && (
              <button
                type="button"
                onClick={() => onStopTool(tool)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
              >
                <BellOff className="h-4 w-4" />
                <span>{isSaving ? "..." : "Stop"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onEditTool(tool)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
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
    <Card className="overflow-hidden border-violet-200 dark:border-violet-800">
      <div className="border-b border-violet-100 bg-violet-50 px-5 py-5 dark:border-violet-950 dark:bg-violet-950 sm:px-6">
        <div>
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
