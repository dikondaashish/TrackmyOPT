"use client";

import { useState, useEffect } from "react";
import { FileCheck, Clock, AlertCircle, CheckCircle2, RefreshCw, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDisplayDateTime } from "@/lib/case-status/safe-dates";

interface CaseStatus {
  id?: string;
  receipt_number: string;
  current_status: string | null;
  status_description?: string;
  last_checked_at: string;
  last_updated_at?: string;
  is_primary?: boolean;
  label?: string | null;
}

function normalizeStatusText(status: string | null | undefined): string {
  return (status ?? "").trim();
}

export function CaseStatusSummary() {
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [caseCount, setCaseCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseStatus = async () => {
    try {
      const response = await fetch("/api/case-status", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        // API returns { ok: true, data: caseStatus }
        if (data.ok && data.data) {
          setCaseStatus(data.data);
          setCaseCount(data.cases?.length ?? 1);
        }
      }
    } catch {
      // Fetch failed silently — non-critical widget
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStatus();
  }, []);

  const refreshStatus = async () => {
    if (isRefreshing || !caseStatus?.receipt_number) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch("/api/case-status/refresh", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        await fetchCaseStatus();
      } else {
        setError("Unable to refresh status");
      }
    } catch (err) {
      setError("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    const normalizedStatus = normalizeStatusText(status).toLowerCase();
    if (!normalizedStatus) {
      return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
    
    if (normalizedStatus.includes("approved") || normalizedStatus.includes("produced")) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
    if (normalizedStatus.includes("denied") || normalizedStatus.includes("rejected")) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (normalizedStatus.includes("rfe") || normalizedStatus.includes("evidence")) {
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getStatusColor = (status: string | null | undefined) => {
    const normalizedStatus = normalizeStatusText(status).toLowerCase();
    if (!normalizedStatus) {
      return "bg-muted text-muted-foreground";
    }
    
    if (normalizedStatus.includes("approved") || normalizedStatus.includes("produced")) {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    }
    if (normalizedStatus.includes("denied") || normalizedStatus.includes("rejected")) {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
    if (normalizedStatus.includes("rfe") || normalizedStatus.includes("evidence")) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Not yet checked";
    return formatDisplayDateTime(dateStr);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
        <div className="h-12 bg-muted rounded" />
      </div>
    );
  }

  if (!caseStatus) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-muted rounded-lg">
            <FileCheck className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Case Status</h3>
            <p className="text-xs text-muted-foreground">Track your USCIS application</p>
          </div>
        </div>
        
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">No case being tracked</p>
          <Link
            href="/dashboard/case-status"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Receipt Number
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const statusText = normalizeStatusText(caseStatus.current_status);
  const isPending = !statusText;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Case Status</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {caseStatus.receipt_number}
              {caseCount > 1 ? ` · +${caseCount - 1} more` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/dashboard/case-status"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="View details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Current Status */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        {getStatusIcon(caseStatus.current_status)}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {statusText || "Checking USCIS status…"}
          </p>
          {caseStatus.status_description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {caseStatus.status_description}
            </p>
          )}
          {isPending && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              We&apos;ll update this automatically once USCIS responds.
            </p>
          )}
        </div>
        <span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(caseStatus.current_status)}`}>
          {isPending ? "Pending" : statusText.includes("Approved") ? "Complete" : "In Progress"}
        </span>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>Last checked: {formatDate(caseStatus.last_checked_at)}</span>
        <a
          href={`https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=${caseStatus.receipt_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          View on USCIS
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
