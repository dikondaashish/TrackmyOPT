"use client";

import { useRouter } from "next/navigation";
import {
  X,
  Clock,
  Zap,
  CalendarDays,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAN_PRICES } from "@/lib/pricing/plan-config";

type FeatureTone = "ink" | "clay" | "pine" | "plum";

/** Curated “paper” tiles — muted saturation, clear borders (not generic rainbow pastels). */
const TILE: Record<
  FeatureTone,
  { wrap: string; iconBg: string; icon: string; title: string; body: string }
> = {
  ink: {
    wrap: "border-[#c9d7ea]/90 bg-[#eef4fc] dark:border-slate-600/50 dark:bg-slate-900/60",
    iconBg: "bg-white/85 dark:bg-slate-800/80",
    icon: "text-[#1e3a5f] dark:text-sky-200",
    title: "text-[#0f172a] dark:text-stone-100",
    body: "text-[#475569] dark:text-slate-400",
  },
  clay: {
    wrap: "border-[#e8d5c4]/90 bg-[#fff8f3] dark:border-amber-900/40 dark:bg-amber-950/25",
    iconBg: "bg-white/85 dark:bg-amber-950/50",
    icon: "text-[#9a3412] dark:text-amber-200",
    title: "text-[#0f172a] dark:text-stone-100",
    body: "text-[#57534e] dark:text-stone-400",
  },
  pine: {
    wrap: "border-[#bfe8d4]/80 bg-[#f0fdf6] dark:border-emerald-900/45 dark:bg-emerald-950/20",
    iconBg: "bg-white/85 dark:bg-emerald-950/40",
    icon: "text-[#166534] dark:text-emerald-200",
    title: "text-[#0f172a] dark:text-stone-100",
    body: "text-[#4b5563] dark:text-slate-400",
  },
  plum: {
    wrap: "border-[#ddd6fe]/90 bg-[#faf8ff] dark:border-violet-900/40 dark:bg-violet-950/20",
    iconBg: "bg-white/85 dark:bg-violet-950/40",
    icon: "text-[#5b21b6] dark:text-violet-200",
    title: "text-[#0f172a] dark:text-stone-100",
    body: "text-[#575569] dark:text-slate-400",
  },
};

function FeatureTile({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone: FeatureTone;
}) {
  const s = TILE[tone];
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] dark:shadow-none",
        s.wrap
      )}
    >
      <div
        className={cn(
          "mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/[0.04] dark:ring-white/10",
          s.iconBg
        )}
      >
        <Icon className={cn("h-4 w-4", s.icon)} strokeWidth={2} aria-hidden />
      </div>
      <p className={cn("text-[13px] font-semibold leading-snug", s.title)}>
        {title}
      </p>
      {description ? (
        <p className={cn("mt-1.5 text-[11px] leading-relaxed", s.body)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PremiumCancelledClient() {
  const router = useRouter();

  const highlights: {
    icon: LucideIcon;
    title: string;
    description?: string;
    tone: FeatureTone;
  }[] = [
    {
      icon: Clock,
      title: "Morning reminders",
      description: "9 AM ET nudges for filings and deadlines.",
      tone: "ink",
    },
    {
      icon: Zap,
      title: "Urgency signals",
      description: "Surface what needs attention first.",
      tone: "clay",
    },
    {
      icon: CalendarDays,
      title: "OPT & STEM",
      description: "Track windows and EAD milestones.",
      tone: "pine",
    },
    {
      icon: Tag,
      title: `Pro from $${PLAN_PRICES.pro.month.toFixed(2)}/mo`,
      description: "Upgrade when you’re ready—cancel anytime.",
      tone: "plum",
    },
  ];

  return (
    <div className="flex w-full max-w-4xl flex-col px-2 sm:px-0">
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
        <div className="grid min-h-[min(520px,85vh)] md:grid-cols-2">
          {/* Left — warm neutral panel + soft watermark */}
          <div
            className={cn(
              "relative flex flex-col justify-center border-b border-stone-200/80 p-8 sm:p-10 md:border-b-0 md:border-r md:border-stone-200/80",
              "bg-gradient-to-br from-[#faf8f5] via-[#f5f2ed] to-[#ebe7e1] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950"
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              aria-hidden
            >
              <span className="select-none font-serif text-[clamp(7rem,26vw,14rem)] font-extralight leading-none text-stone-300/50 dark:text-zinc-700/35">
                ×
              </span>
            </div>
            <div className="relative z-10">
              <div className="mb-7 flex justify-center md:justify-start">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border border-stone-200/90 bg-white/90 shadow-sm ring-2 ring-amber-100/80 dark:border-zinc-700 dark:bg-zinc-900/90 dark:ring-amber-900/30",
                    "animate-premium-hero-in"
                  )}
                >
                  <X
                    className="h-6 w-6 text-stone-500 dark:text-zinc-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
              </div>
              <h1 className="text-center text-[1.35rem] font-semibold leading-snug tracking-tight text-stone-900 sm:text-[1.5rem] md:text-left dark:text-stone-50">
                No charge — checkout closed.
              </h1>
              <p className="mt-4 max-w-[28ch] text-center text-[0.9375rem] leading-relaxed text-stone-600 md:text-left dark:text-zinc-400">
                You left before completing payment. Nothing was billed to your
                card.
              </p>
            </div>
          </div>

          {/* Right — features + actions */}
          <div className="flex flex-col justify-between gap-8 bg-[#fcfcfb] p-8 sm:p-10 dark:bg-zinc-950/80">
            <div>
              <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 md:text-left dark:text-zinc-500">
                What Pro includes
              </p>
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <FeatureTile
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    tone={item.tone}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Button
                size="lg"
                className={cn(
                  "h-12 flex-1 font-semibold text-white shadow-md",
                  "bg-gradient-to-b from-teal-700 to-teal-900",
                  "hover:from-teal-800 hover:to-teal-950",
                  "dark:from-teal-600 dark:to-teal-800 dark:hover:from-teal-500 dark:hover:to-teal-700"
                )}
                onClick={() => router.push("/premium/checkout?planId=pro&interval=year")}
              >
                Try again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "h-12 flex-1 border-stone-300 bg-white font-semibold text-stone-800",
                  "hover:bg-stone-50 hover:text-stone-900",
                  "dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                )}
                onClick={() => router.push("/dashboard")}
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-5 px-1 py-3">
        <p className="text-center text-[10px] text-stone-500 dark:text-zinc-500">
          Questions?{" "}
          <a
            href="mailto:support@trackmyopt.com"
            className="font-medium text-stone-700 underline-offset-2 hover:underline dark:text-zinc-300"
          >
            support@trackmyopt.com
          </a>
        </p>
      </footer>
    </div>
  );
}
