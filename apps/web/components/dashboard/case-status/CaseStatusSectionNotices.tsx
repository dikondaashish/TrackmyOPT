"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  Info,
  Loader2,
  X,
} from "lucide-react";

export function CaseStatusLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
        <ClipboardCheck className="w-7 h-7 text-white" />
      </div>
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <p className="text-sm text-muted-foreground font-medium">
        Loading your case status…
      </p>
    </div>
  );
}

export function DeleteNoticeBanner({ message }: { message: string }) {
  return (
    <Card
      className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
      role="status"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
          {message}
        </p>
      </div>
    </Card>
  );
}

export function LoadErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card
      className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      role="alert"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Couldn&apos;t load your case status.</strong>{" "}
          <span className="opacity-90">{message}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Card>
  );
}

export function PackagingNoticeBanner({
  message,
  ctaLabel,
  onUpgrade,
  onDismiss,
}: {
  message: string;
  ctaLabel: string;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card
      className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-100 flex-1">
          {message}{" "}
          <button
            type="button"
            onClick={onUpgrade}
            className="font-medium underline underline-offset-2 hover:no-underline cursor-pointer"
          >
            {ctaLabel}
          </button>
        </p>
        <button
          type="button"
          aria-label="Dismiss packaging notice"
          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

export function TrialCtaStrip({
  message,
  ctaLabel,
  onUpgrade,
}: {
  message: string;
  ctaLabel: string;
  onUpgrade: () => void;
}) {
  return (
    <Card className="p-3 border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-purple-950 dark:text-purple-100 flex-1">
          {message}
        </p>
        <Button
          type="button"
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
          onClick={onUpgrade}
        >
          <Crown className="w-4 h-4 mr-1.5" />
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}

export function FormMismatchBanner({ message }: { message: string }) {
  return (
    <Card
      className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 dark:text-amber-100">{message}</p>
      </div>
    </Card>
  );
}

export function RefreshFailedBanner({ message }: { message: string }) {
  return (
    <Card
      className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 dark:text-amber-100">{message}</p>
      </div>
    </Card>
  );
}

export function UscisMockModeBadge() {
  return (
    <Card
      className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
            USCIS Mock Mode Active
          </p>
          <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
            Simulated data. Set USCIS_MOCK=false in production.
          </p>
        </div>
      </div>
    </Card>
  );
}
