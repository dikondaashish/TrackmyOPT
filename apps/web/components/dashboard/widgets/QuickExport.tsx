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

    // Generate PDF content using jsPDF
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TrackMyOPT", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("DSO Summary Report", pageWidth / 2, 28, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 34, { align: "center" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 40, pageWidth - 14, 40);

    // Profile Info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Student Information", 14, 52);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${data.profile?.firstName || "-"} ${data.profile?.lastName || ""}`, 14, 60);
    doc.text(`Email: ${data.user?.email || "N/A"}`, 14, 66);
    doc.text(`STEM Eligible: ${data.profile?.isStemEligible ? "Yes" : "No"}`, 14, 72);

    // OPT Timeline Table
    const timelineData = [
      ["Program End Date", data.optStatus?.programEndDate || "Not set"],
      ["DSO Recommendation Date", data.optStatus?.dsoRecommendationDate || "Not set"],
      ["OPT Start Date", data.optStatus?.optStartDate || "Not set"],
      ["OPT EAD End Date", data.optStatus?.optEadEndDate || "Not set"],
    ];
    
    if (data.profile?.isStemEligible) {
      timelineData.push(["STEM Start Date", data.optStatus?.stemStartDate || "Not set"]);
    }

    autoTable(doc, {
      startY: 85,
      head: [["Milestone", "Date"]],
      body: timelineData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
      margin: { left: 14, right: 14 }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 130;

    // Employment History Table
    if (data.employmentSpans && data.employmentSpans.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Employment History", 14, finalY + 15);
      
      const empData = data.employmentSpans.map((span: any) => [
        span.employer_name,
        span.job_title || "-",
        `${new Date(span.start_date).toLocaleDateString()} - ${span.end_date ? new Date(span.end_date).toLocaleDateString() : 'Present'}`,
        span.is_current ? "Yes" : "No"
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Employer", "Title", "Dates", "Current"]],
        body: empData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // emerald-500
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { left: 14, right: 14 }
      });
      finalY = (doc as any).lastAutoTable.finalY || finalY + 40;
    }

    // Case Status Table
    if (data.caseStatus && data.caseStatus.receiptNumber) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("USCIS Case Status", 14, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [["Receipt Number", "Status", "Last Checked"]],
        body: [[
          data.caseStatus.receiptNumber || "N/A",
          data.caseStatus.currentStatus || "N/A",
          data.caseStatus.lastCheckedAt ? new Date(data.caseStatus.lastCheckedAt).toLocaleString() : "N/A"
        ]],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] }, // indigo-500
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { left: 14, right: 14 }
      });
    }

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("This report is for personal records only. Always verify information with your DSO.", pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });
    }

    // Download PDF
    doc.save(`trackmyopt-dso-summary-${new Date().toISOString().split("T")[0]}.pdf`);
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
