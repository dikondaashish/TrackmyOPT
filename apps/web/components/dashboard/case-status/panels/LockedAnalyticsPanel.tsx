"use client";

import { Lock } from "lucide-react";

interface LockedAnalyticsPanelProps {
  title: string;
  /** What the panel would show. Concrete, so the upgrade is an informed one. */
  description: string;
  onUpgrade?: () => void;
}

/**
 * Stands in for a Pro-only analytics panel.
 *
 * States plainly what is behind the upgrade rather than teasing a blurred
 * chart. The people reading this are waiting on work authorization, and
 * dangling half-legible numbers at them would be a poor way to sell.
 */
export function LockedAnalyticsPanel({
  title,
  description,
  onUpgrade,
}: LockedAnalyticsPanelProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          Unlock with Pro
        </button>
      )}
    </div>
  );
}
