"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getServiceCenterLabel, formatDaysAgoLabel, formatStatusLabel } from "@/lib/case-status/case-status-display";
import { CASE_STATUS_DISCLAIMER } from "@/lib/legal/legal-config";
import { cn } from "@/lib/utils";

interface CaseInfoFooterProps {
  caseStatus: {
    receipt_number: string;
    case_type?: string | null;
    received_date?: string | null;
    last_status_change_at?: string | null;
    current_status?: string | null;
  };
}

function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return "—"; }
}

function daysSince(s: string | null | undefined): number {
  if (!s) return 0;
  try { return Math.floor((Date.now() - new Date(s).getTime()) / 86_400_000); } catch { return 0; }
}

export function CaseInfoFooter({ caseStatus }: CaseInfoFooterProps) {
  const [open, setOpen] = useState(false);
  const days = daysSince(caseStatus.received_date);

  return (
    <div className="mt-4 space-y-3">
      {/* Collapsible case info */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer"
        >
          <span className="font-medium">Case Information</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {open && (
          <div className="px-4 pb-4 text-xs border-t border-border space-y-2 pt-3">
            <Row label="Receipt" value={<span className="font-mono ph-mask" data-ph-mask>{caseStatus.receipt_number}</span>} />
            <Row label="Type" value={caseStatus.case_type || "Form I-765"} />
            <Row label="Filed" value={formatDate(caseStatus.received_date)} />
            <Row label="Service Center" value={getServiceCenterLabel(caseStatus.receipt_number)} />
            <Row label="Current Status" value={formatStatusLabel(caseStatus.current_status, "Pending")} />
            {days > 0 && <Row label="Days Since Filed" value={`${days} days`} />}
          </div>
        )}
      </div>

      {/* Single disclaimer — only appears here */}
      <p className="text-xs text-muted-foreground leading-relaxed px-1">
        {CASE_STATUS_DISCLAIMER}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right text-foreground">{value}</span>
    </div>
  );
}
