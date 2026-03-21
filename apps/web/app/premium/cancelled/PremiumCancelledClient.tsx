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

type FeatureTone = "sky" | "amber" | "emerald" | "violet";

const TONE_CLASS: Record<
  FeatureTone,
  { card: string; icon: string }
> = {
  sky: {
    card: "bg-sky-100/90 dark:bg-sky-950/50 border-sky-200/60 dark:border-sky-800/50",
    icon: "text-sky-700 dark:text-sky-300",
  },
  amber: {
    card: "bg-amber-100/90 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50",
    icon: "text-amber-700 dark:text-amber-300",
  },
  emerald: {
    card: "bg-emerald-100/90 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/50",
    icon: "text-emerald-700 dark:text-emerald-300",
  },
  violet: {
    card: "bg-violet-100/90 dark:bg-violet-950/40 border-violet-200/60 dark:border-violet-800/50",
    icon: "text-violet-700 dark:text-violet-300",
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
  const t = TONE_CLASS[tone];
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-3.5 text-left shadow-sm transition-shadow hover:shadow-md",
        t.card
      )}
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20">
        <Icon className={cn("h-4 w-4", t.icon)} strokeWidth={2} aria-hidden />
      </div>
      <p className="text-xs font-semibold text-foreground leading-snug">{title}</p>
      {description ? (
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
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
      tone: "sky",
    },
    {
      icon: Zap,
      title: "Urgency signals",
      description: "Surface what needs attention first.",
      tone: "amber",
    },
    {
      icon: CalendarDays,
      title: "OPT & STEM",
      description: "Track windows and EAD milestones.",
      tone: "emerald",
    },
    {
      icon: Tag,
      title: "Pro from $4.99/mo",
      description: "Upgrade when you’re ready—cancel anytime.",
      tone: "violet",
    },
  ];

  return (
    <div className="flex w-full max-w-4xl flex-col px-2 sm:px-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="grid min-h-[min(520px,85vh)] md:grid-cols-2">
          {/* Left: status + large X watermark */}
          <div className="relative flex flex-col justify-center border-b border-border p-8 sm:p-10 md:border-b-0 md:border-r">
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              aria-hidden
            >
              <span className="select-none text-[clamp(8rem,28vw,16rem)] font-extralight leading-none text-sky-200/45 dark:text-sky-500/15">
                ×
              </span>
            </div>
            <div className="relative z-10">
              <div className="mb-6 flex justify-center md:justify-start">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/80 shadow-sm",
                    "animate-premium-hero-in"
                  )}
                >
                  <X
                    className="h-7 w-7 text-muted-foreground"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
              </div>
              <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem] md:text-left">
                No charge — checkout closed.
              </h1>
              <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground md:text-left">
                You left before completing payment. Nothing was billed to your
                card.
              </p>
            </div>
          </div>

          {/* Right: what Pro includes + actions */}
          <div className="flex flex-col justify-between gap-8 p-8 sm:p-10">
            <div>
              <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:text-left">
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
                  "bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600",
                  "hover:from-sky-600 hover:via-indigo-600 hover:to-violet-700"
                )}
                onClick={() => router.push("/premium/checkout")}
              >
                Try again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 flex-1 border-border bg-background font-semibold"
                onClick={() => router.push("/dashboard")}
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-5 px-1 py-3">
        <p className="text-center text-[10px] text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:support@trackmyopt.com"
            className="font-medium text-foreground/80 underline-offset-2 hover:underline"
          >
            support@trackmyopt.com
          </a>
        </p>
      </footer>
    </div>
  );
}
