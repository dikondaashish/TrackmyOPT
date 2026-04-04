"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, Loader2, Check } from "lucide-react";

interface QuickExportProps {
  className?: string;
}

type ExportFormat = "json" | "csv" | "pdf";

export function QuickExport({ className = "" }: QuickExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setError(null);
    setExportSuccess(null);

    try {
      if (format === "pdf") {
        // PDF export is handled differently - generate client-side
        await generatePDFExport();
        setExportSuccess("pdf");
      } else {
        const response = await fetch(`/api/user/export?format=${format}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to export data");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trackmyopt-data-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setExportSuccess(format);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
      // Clear success message after 3 seconds
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  const generatePDFExport = async () => {
    // Fetch data first
    const response = await fetch("/api/user/export?format=json", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data for PDF");
    }

    const data = await response.json();

    // Generate PDF content
    const pdfContent = `
TrackMyOPT - OPT Timeline Report
Generated: ${new Date().toLocaleString()}
========================================

USER INFORMATION
----------------
Email: ${data.user?.email || "N/A"}
Account Created: ${data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : "N/A"}

PROFILE
-------
Name: ${data.profile?.firstName || ""} ${data.profile?.lastName || ""}
Timezone: ${data.profile?.timezone || "N/A"}
STEM Eligible: ${data.profile?.isStemEligible ? "Yes" : "No"}

OPT DATES
---------
Program End Date: ${data.optStatus?.programEndDate || "Not set"}
DSO Recommendation: ${data.optStatus?.dsoRecommendationDate || "Not set"}
OPT Start Date: ${data.optStatus?.optStartDate || "Not set"}
OPT EAD End Date: ${data.optStatus?.optEadEndDate || "Not set"}
STEM Start Date: ${data.optStatus?.stemStartDate || "Not set"}

CASE STATUS
-----------
Receipt Number: ${data.caseStatus?.receiptNumber || "Not set"}
Current Status: ${data.caseStatus?.currentStatus || "Not set"}
Last Checked: ${data.caseStatus?.lastCheckedAt ? new Date(data.caseStatus.lastCheckedAt).toLocaleString() : "N/A"}

========================================
This report is for personal records only.
Always verify information with your DSO.
    `.trim();

    // Create a blob and download
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trackmyopt-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      format: "json" as ExportFormat,
      label: "JSON",
      description: "Machine-readable format",
      icon: <FileJson className="w-5 h-5" />,
    },
    {
      format: "csv" as ExportFormat,
      label: "CSV",
      description: "Open in Excel/Sheets",
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      format: "pdf" as ExportFormat,
      label: "Report",
      description: "Plain text summary",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Export Your Data</h3>
          <p className="text-xs text-muted-foreground">Download for your records</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {exportOptions.map((option) => (
          <button
            key={option.format}
            onClick={() => handleExport(option.format)}
            disabled={isExporting}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
              exportSuccess === option.format
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-border hover:border-primary hover:bg-muted/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : exportSuccess === option.format ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span className="text-muted-foreground">{option.icon}</span>
            )}
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400 text-center">{error}</p>
      )}

      {exportSuccess && (
        <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 text-center">
          Export successful!
        </p>
      )}
    </div>
  );
}
