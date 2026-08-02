"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { Info, Loader2, X } from "lucide-react";
import { getPortalRoot } from "@/lib/portal-root";
import { getTemplateById } from "@/lib/documents/templates";
import { supabase } from "@/lib/supabaseClient";

export type ResumeInfoSource = {
  id: string;
  filename: string;
  content?: string | null;
  created_at: string;
  file_path?: string | null;
  is_parsed?: boolean | null;
  structuredData?: Record<string, unknown> | null;
};

type FullResume = {
  id: string;
  filename: string;
  content: string | null;
  created_at: string;
  file_path: string | null;
  is_parsed: boolean | null;
  structuredData: Record<string, unknown>;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function InfoSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </h3>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
        {children}
      </div>
    </section>
  );
}

function PreviewBlock({ text, empty }: { text: string; empty: string }) {
  if (!text.trim()) {
    return <p className="text-slate-500 dark:text-slate-400">{empty}</p>;
  }
  return (
    <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed">
      {text}
    </pre>
  );
}

export function ResumeInfoDrawer({
  resume,
  open,
  onOpenChange,
}: {
  resume: ResumeInfoSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<FullResume | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !resume) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setDetails(null);

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Please log in to view resume details.");

        const response = await fetch(
          `/api/proxy/resume/${resume.id}?userId=${user.id}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Could not load resume details.");

        const full = await response.json();
        if (cancelled) return;

        const structured =
          (full.structuredData as Record<string, unknown> | undefined) ||
          (full.structured_data as Record<string, unknown> | undefined) ||
          resume.structuredData ||
          {};

        setDetails({
          id: String(full.id || resume.id),
          filename: String(full.filename || resume.filename),
          content:
            typeof full.content === "string"
              ? full.content
              : resume.content || null,
          created_at: String(full.created_at || resume.created_at),
          file_path:
            typeof full.file_path === "string"
              ? full.file_path
              : resume.file_path || null,
          is_parsed:
            typeof full.is_parsed === "boolean"
              ? full.is_parsed
              : resume.is_parsed ?? null,
          structuredData: structured,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, resume]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !mounted || !resume) return null;

  const structured = details?.structuredData || resume.structuredData || {};
  const jobDescription = asString(structured.jobDescription);
  const jobTitle = asString(structured.jobTitle);
  const templateId = asString(structured.templateId);
  const template = getTemplateById(templateId);
  const latex = asString(structured.latexCode || structured.generatedLatex);
  const isGenerated =
    Boolean(latex) || asString(structured.type) === "generated";
  const atsScore =
    typeof structured.atsScore === "number"
      ? structured.atsScore
      : typeof (structured.atsAnalysis as { score?: unknown } | undefined)
            ?.score === "number"
        ? ((structured.atsAnalysis as { score: number }).score)
        : null;
  const pastedResume = details?.content || resume.content || "";
  const status = asString(structured.resumeStatus) || (isGenerated ? "generated" : "uploaded");

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close resume details"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-info-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-200 dark:border-slate-700 dark:bg-slate-950"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Resume details
            </p>
            <h2
              id="resume-info-title"
              className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-white"
              title={resume.filename}
            >
              {resume.filename}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <p className="text-sm">Loading details…</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : (
            <>
              <InfoSection label="Overview">
                <dl className="grid grid-cols-1 gap-3">
                  <div>
                    <dt className="text-xs text-slate-500">Created</dt>
                    <dd>
                      {format(
                        new Date(details?.created_at || resume.created_at),
                        "MMM d, yyyy · h:mm a",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Status</dt>
                    <dd className="capitalize">{status.replace(/_/g, " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Generated resume</dt>
                    <dd>{isGenerated ? "Yes — AI tailored version saved" : "No — source/uploaded text only"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Template</dt>
                    <dd>
                      {template
                        ? `${template.name}`
                        : templateId
                          ? templateId
                          : "Not set"}
                    </dd>
                  </div>
                  {jobTitle ? (
                    <div>
                      <dt className="text-xs text-slate-500">Target role</dt>
                      <dd>{jobTitle}</dd>
                    </div>
                  ) : null}
                  {atsScore !== null ? (
                    <div>
                      <dt className="text-xs text-slate-500">ATS score</dt>
                      <dd>{atsScore}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-xs text-slate-500">Downloadable file</dt>
                    <dd>{details?.file_path || resume.file_path ? "Yes" : "No"}</dd>
                  </div>
                </dl>
              </InfoSection>

              <InfoSection label="Job description">
                <PreviewBlock
                  text={jobDescription}
                  empty="No job description was saved with this resume."
                />
              </InfoSection>

              <InfoSection label="Pasted / source resume">
                <PreviewBlock
                  text={pastedResume}
                  empty="No source resume text is available."
                />
              </InfoSection>

              {isGenerated ? (
                <InfoSection label="Generated LaTeX">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {latex.length.toLocaleString()} characters saved for the editor.
                  </p>
                </InfoSection>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>,
    getPortalRoot(),
  );
}

export function ResumeInfoButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
      title="Resume info"
      aria-label="Resume info"
    >
      <Info className="w-4 h-4" />
    </button>
  );
}
