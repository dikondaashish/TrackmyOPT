import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  CheckCircle2,
  Chrome,
  FileInput,
  LockKeyhole,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";

import { ApplicationProfileSection } from "@/components/dashboard/settings/ApplicationProfileSection";
import { PrivateApplicationAnswersSection } from "@/components/dashboard/settings/PrivateApplicationAnswersSection";

export const metadata: Metadata = {
  title: "Chrome Job Prefill | TrackMyOPT",
  description:
    "Set up the dedicated TrackMyOPT Chrome extension profile used to prefill job applications.",
};

const WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm";

const steps = [
  {
    icon: FileInput,
    title: "1. Save your data",
    description:
      "Add the exact contact, address, visa, compensation, and work-preference answers you want available.",
  },
  {
    icon: Chrome,
    title: "2. Open a job application",
    description:
      "Click the TrackMyOPT extension while you are on a supported employer or ATS application page.",
  },
  {
    icon: MousePointerClick,
    title: "3. Review and prefill",
    description:
      "Approve private answers for that application, watch fields fill, then review everything yourself.",
  },
] as const;

export default function ExtensionPrefillPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-sm dark:border-blue-900 dark:from-blue-950/35 dark:via-gray-950 dark:to-orange-950/20 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-gray-950 dark:text-blue-300">
              <Chrome className="h-4 w-4" />
              Chrome Extension
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
              Set up Job Application Prefill
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
              Save your job-application information once, then use TrackMyOPT
              to fill supported empty fields on employer portals. Private
              answers always require your approval for each application.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={WEB_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Chrome className="h-4 w-4" />
                Install or open extension
              </a>
              <Link
                href="/dashboard/settings?tab=extension"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
              >
                Check connection
              </Link>
            </div>
          </div>

          <div className="grid shrink-0 gap-3 rounded-xl border border-green-200 bg-white/90 p-4 text-sm shadow-sm dark:border-green-900 dark:bg-gray-950/80">
            <p className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
              <ShieldCheck className="h-5 w-5" />
              You stay in control
            </p>
            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Fills only empty supported fields
            </p>
            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Private answers require review
            </p>
            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Never auto-submits applications
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="job-prefill-how-it-works"
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 sm:p-6"
      >
        <h2
          id="job-prefill-how-it-works"
          className="text-lg font-semibold text-gray-950 dark:text-white"
        >
          How it works
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          A simple preview of what happens after you finish this setup.
        </p>
        <ol className="mt-5 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <ArrowDown className="absolute -bottom-4 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full bg-white text-gray-400 dark:bg-gray-950 lg:-right-3 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:-rotate-90" />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-8" aria-labelledby="job-prefill-profile-heading">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="job-prefill-profile-heading"
              className="text-xl font-semibold text-gray-950 dark:text-white"
            >
              Your Chrome Job Prefill data
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
              This information is separate from your normal TrackMyOPT profile.
              You can update or delete it whenever you want.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <ApplicationProfileSection />
          <PrivateApplicationAnswersSection />
        </div>
      </section>
    </main>
  );
}
