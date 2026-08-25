"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Search,
  SearchX,
  XCircle,
} from "lucide-react";
import type { EVerifyLookupResponse } from "@/lib/everify/types";

interface LookupError {
  company: string;
  found: false;
  error: string;
  message: string;
}

const publicDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const checkedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(value: string | null): string {
  if (!value) return "Not provided";
  return publicDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatCheckedAt(value: string): string {
  return checkedAtFormatter.format(new Date(value));
}

function StatusBadge({ result }: { result: EVerifyLookupResponse }) {
  if (!result.found) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        <SearchX className="h-4 w-4" aria-hidden="true" />
        Not Found
      </span>
    );
  }
  if (result.status === "terminated") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
        <XCircle className="h-4 w-4" aria-hidden="true" />
        E-Verify Terminated
      </span>
    );
  }
  if (result.status === "suspended") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        E-Verify Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      E-Verify Enrolled
    </span>
  );
}

export function EVerifyEmployerLookup() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<EVerifyLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = company.trim().replace(/\s+/g, " ");
    if (query.length < 2) {
      setError("Enter at least 2 characters.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(
        `/api/everify-lookup?company=${encodeURIComponent(query)}`,
        { credentials: "include" }
      );
      const payload = (await response.json()) as EVerifyLookupResponse | LookupError;
      if (!response.ok || "error" in payload) {
        throw new Error(payload.message || "Employer lookup is unavailable.");
      }
      setResult(payload);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Employer lookup is unavailable."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="everify-lookup-heading"
      className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900 dark:bg-gray-800"
    >
      <div className="border-b border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-950/25 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="everify-lookup-heading"
              className="text-lg font-bold text-gray-950 dark:text-white"
            >
              Check an employer&apos;s E-Verify enrollment
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Search the public E-Verify tool before accepting a STEM OPT role.
              Cached checks return instantly; a new live check can take about a minute.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5" aria-busy={isLoading}>
          <label
            htmlFor="everify-company"
            className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Employer legal name or DBA
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="everify-company"
                type="search"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Microsoft, Google, Infosys…"
                maxLength={120}
                autoComplete="organization"
                disabled={isLoading}
                className="min-h-12 w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-base text-gray-950 outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-wait disabled:opacity-70 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || company.trim().length < 2}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-900"
            >
              {isLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-5 w-5" aria-hidden="true" />
              )}
              {isLoading ? "Checking…" : "Check E-Verify"}
            </button>
          </div>
        </form>
      </div>

      <div className="min-h-24 p-5 sm:p-6" aria-live="polite">
        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
            Querying the public E-Verify Employer Search tool…
          </div>
        )}

        {error && !isLoading && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Lookup unavailable</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-base font-bold text-gray-950 dark:text-white">
                  {result.employer_name || result.company}
                </p>
                {result.dba_name && result.dba_name !== result.employer_name && (
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                    DBA: {result.dba_name}
                  </p>
                )}
              </div>
              <StatusBadge result={result} />
            </div>

            {result.found ? (
              <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-900/60 sm:grid-cols-3">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Enrollment date</dt>
                  <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(result.enrollment_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Workforce size</dt>
                  <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                    {result.workforce_size_band || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Hiring-site states</dt>
                  <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                    {result.hiring_site_states.length
                      ? result.hiring_site_states.join(", ")
                      : "Not provided"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                {result.message}
              </p>
            )}

            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Last checked {formatCheckedAt(result.last_checked)} · {result.source === "cache" ? "Cached result" : "Live result"}
            </p>
          </div>
        )}

        <p className="mt-5 border-t border-gray-200 pt-4 text-xs leading-5 text-gray-600 dark:border-gray-700 dark:text-gray-400">
          Data sourced from the public E-Verify Employer Search tool. Only employers
          with 5+ reported employees are listed. Not a real-time verification — always
          confirm directly with the employer if in doubt.
        </p>
      </div>
    </section>
  );
}
