"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { getDedicatedConsultationEligibility } from "@/lib/pricing/dedicated-consultation";
import {
  DEDICATED_CONSULTATION_MINUTES,
  DEDICATED_CONSULTATION_WAIT_DAYS,
} from "@/lib/legal/legal-config";

type ConsultationRequest = {
  id: string;
  topic: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
};

const TOPICS = [
  ["rfe", "Request for Evidence (RFE)"],
  ["denial", "Denial or unfavorable decision"],
  ["premium_processing_delay", "Premium Processing delay"],
  ["opt_stem", "OPT or STEM OPT question"],
  ["employer_change", "Employer or employment change"],
  ["other", "Other immigration question"],
] as const;

const STATUS_LABELS: Record<string, string> = {
  open: "Received — eligibility review pending",
  conflict_check: "Attorney conflict check in progress",
  accepted: "Accepted — scheduling next",
  scheduled: "Consultation scheduled",
  completed: "Consultation completed",
  declined: "Unable to place with an attorney",
  cancelled: "Request cancelled",
};

export function DedicatedConsultationCard({
  caseId,
  onCompareDedicated,
}: {
  caseId: string;
  onCompareDedicated: () => void;
}) {
  const premium = usePremiumStatus();
  const isDedicated =
    premium.isPremium === true &&
    (premium.planName ?? "").toLowerCase() === "dedicated";
  const [request, setRequest] = useState<ConsultationRequest | null>(null);
  const [topic, setTopic] = useState<(typeof TOPICS)[number][0]>("opt_stem");
  const [summary, setSummary] = useState("");
  const [availability, setAvailability] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDedicated) {
      setRequest(null);
      setLoadFailed(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    void fetch("/api/dedicated/consultation-request", {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      })
      .then(async (response) => {
        if (!response.ok) throw new Error("request_lookup_failed");
        return response.json();
      })
      .then((requestBody) => {
        if (controller.signal.aborted) return;
        setRequest(requestBody?.request ?? null);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setLoadFailed(true);
        setError("We could not load your consultation benefit. Please refresh and try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isDedicated]);

  const eligibility = useMemo(
    () => getDedicatedConsultationEligibility(premium.dedicatedStartedAt),
    [premium.dedicatedStartedAt]
  );

  const submit = async () => {
    setError(null);
    if (summary.trim().length < 20) {
      setError("Describe what you want to discuss in at least 20 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/dedicated/consultation-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          topic,
          summary: summary.trim(),
          availability: availability.trim() || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setRequest(body.request ?? null);
        setError(body.error || "Could not submit your request.");
        return;
      }
      setRequest(body.request);
      setSummary("");
      setAvailability("");
    } catch {
      setError("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (premium.isLoading) return null;

  if (!isDedicated) {
    return (
      <Card className="border-purple-200 bg-purple-50/60 p-5 shadow-sm dark:border-purple-900 dark:bg-purple-950/20 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white">
              <Scale className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-extrabold text-foreground">Need a licensed attorney to review your situation?</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Dedicated includes one complimentary {DEDICATED_CONSULTATION_MINUTES}-minute initial consultation per account after {DEDICATED_CONSULTATION_WAIT_DAYS} continuous days, subject to availability, conflict checks and attorney acceptance.
              </p>
            </div>
          </div>
          <Button type="button" onClick={onCompareDedicated} className="min-h-11 shrink-0 bg-purple-700 text-white hover:bg-purple-800">
            Compare Dedicated
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 p-5 shadow-sm dark:border-purple-900 sm:p-6" aria-labelledby="dedicated-consultation-title">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white">
          <Scale className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-purple-700 dark:text-purple-300">Dedicated benefit</p>
          <h2 id="dedicated-consultation-title" className="mt-1 text-lg font-extrabold text-foreground">
            Attorney consultation center
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex min-h-20 items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Checking eligibility and request status…
        </div>
      ) : loadFailed ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200" role="alert">
          We could not verify your consultation benefit. Refresh this page before submitting a request.
        </div>
      ) : request ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20" role="status">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-bold text-foreground">{STATUS_LABELS[request.status] ?? "Request received"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Request {request.id.slice(0, 8).toUpperCase()} · Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
              {request.scheduled_at && (
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Scheduled: {new Date(request.scheduled_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : eligibility.eligible ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Submit the topic and a short factual summary. Our team will complete eligibility and conflict checks before an attorney accepts the consultation.
          </p>
          <div>
            <label htmlFor="consultation-topic" className="mb-2 block text-sm font-bold text-foreground">Topic</label>
            <select
              id="consultation-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value as (typeof TOPICS)[number][0])}
              className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TOPICS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="consultation-summary" className="mb-2 block text-sm font-bold text-foreground">What do you want to discuss?</label>
            <Textarea
              id="consultation-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Give a short timeline and the question you want the attorney to address."
              aria-describedby="consultation-privacy"
            />
            <p id="consultation-privacy" className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Do not enter an SSN, A-Number, passport number, payment information or health records.
            </p>
          </div>
          <div>
            <label htmlFor="consultation-availability" className="mb-2 block text-sm font-bold text-foreground">Availability (optional)</label>
            <Textarea
              id="consultation-availability"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Example: Weekdays after 4 PM ET"
            />
          </div>
          <Button type="button" onClick={() => void submit()} disabled={submitting} className="min-h-11 bg-purple-700 text-white hover:bg-purple-800">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <CalendarDays className="mr-2 h-4 w-4" aria-hidden />}
            {submitting ? "Submitting…" : "Request consultation"}
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/20">
          <p className="font-bold text-foreground">Eligibility unlocks in {eligibility.daysRemaining} day{eligibility.daysRemaining === 1 ? "" : "s"}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The consultation request becomes available after seven uninterrupted days on Dedicated.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>}

      <p className="mt-5 text-xs leading-5 text-muted-foreground">
        Submitting a request does not guarantee a time slot or legal outcome and does not create an attorney-client relationship. Attorney availability, conflict checks, acceptance and the Dedicated terms apply.
      </p>
    </Card>
  );
}
