"use client";

import Link from "next/link";
import { ArrowRight, Bell, Clock, Shield } from "lucide-react";
import { captureClientEvent } from "@/lib/posthog-client";

export type BlogProductCtaVariant = "case-status" | "opt-timeline" | "unemployment";

const VARIANTS: Record<
  BlogProductCtaVariant,
  {
    icon: typeof Bell;
    title: string;
    description: string;
    href: string;
    cta: string;
  }
> = {
  "case-status": {
    icon: Bell,
    title: "Track your USCIS case automatically",
    description:
      "Add your receipt number once — free manual refresh anytime. Pro adds daily auto-checks and email alerts when your I-765 or EAD status changes.",
    href: "/dashboard/case-status",
    cta: "Start tracking free",
  },
  "opt-timeline": {
    icon: Clock,
    title: "See your OPT timeline in one dashboard",
    description:
      "Track processing milestones, unemployment days, and deadlines alongside your case status.",
    href: "/dashboard/opt-tools/opt-clock",
    cta: "Open OPT timeline",
  },
  unemployment: {
    icon: Shield,
    title: "Count your OPT unemployment days",
    description:
      "Avoid the 90-day limit — live counter synced to your OPT dates with compliance reminders.",
    href: "/dashboard/opt-tools/opt-clock",
    cta: "Check unemployment days",
  },
};

type BlogProductCTAProps = {
  variant: BlogProductCtaVariant;
  /** Page path for PostHog, e.g. /blog/opt-processing-time-2026 */
  sourcePage: string;
};

export function BlogProductCTA({ variant, sourcePage }: BlogProductCTAProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  const handleClick = () => {
    captureClientEvent("blog_product_cta_clicked", {
      variant,
      source_page: sourcePage,
    });
  };

  return (
    <div className="my-10 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{config.title}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {config.description}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {variant === "case-status" ? (
              <>
                Case status information is for convenience only — not legal advice.{" "}
                <Link
                  href="/disclaimer"
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                >
                  Read disclaimer
                </Link>
                . Also see{" "}
              </>
            ) : (
              <>Also see </>
            )}
            <Link
              href="/features/case-status"
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
              onClick={() =>
                captureClientEvent("blog_product_cta_clicked", {
                  variant: "features-link",
                  source_page: sourcePage,
                })
              }
            >
              USCIS case status tracker features
            </Link>
          </p>
        </div>
        <Link
          href={config.href}
          onClick={handleClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors"
        >
          {config.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
