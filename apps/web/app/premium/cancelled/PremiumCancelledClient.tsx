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

function FeatureTile({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3.5 text-left shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </div>
      <p className="text-[13px] font-semibold leading-snug text-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function PremiumCancelledClient() {
  const router = useRouter();
  const proMonthly = PLAN_PRICES.pro.month.toFixed(2);

  const highlights: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[] = [
    {
      icon: Clock,
      title: "Morning reminders",
      description: "9 AM ET nudges for filings and deadlines.",
    },
    {
      icon: Zap,
      title: "Urgency signals",
      description: "Surface what needs attention first.",
    },
    {
      icon: CalendarDays,
      title: "OPT & STEM",
      description: "Track windows and EAD milestones.",
    },
    {
      icon: Tag,
      title: `Pro from $${proMonthly}/mo`,
      description: "Upgrade when you’re ready—cancel anytime.",
    },
  ];

  return (
    <div className="flex w-full max-w-4xl flex-col px-2 sm:px-0">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid min-h-[min(520px,85vh)] md:grid-cols-2">
          {/* Left — status */}
          <div
            className={cn(
              "relative flex flex-col justify-center border-b border-border p-8 sm:p-10",
              "bg-muted/40 md:border-b-0 md:border-r"
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              aria-hidden
            >
              <span className="select-none text-[clamp(7rem,26vw,14rem)] font-extralight leading-none text-primary/[0.06]">
                ×
              </span>
            </div>
            <div className="relative z-10">
              <div className="mb-7 flex justify-center md:justify-start">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full",
                    "bg-primary text-primary-foreground ring-1 ring-primary/20 shadow-sm",
                    "animate-premium-hero-in"
                  )}
                >
                  <X className="h-6 w-6" strokeWidth={2.5} aria-hidden />
                </div>
              </div>
              <h1 className="text-center text-[1.35rem] font-semibold leading-snug tracking-tight text-foreground sm:text-[1.5rem] md:text-left">
                No charge — checkout closed.
              </h1>
              <p className="mt-4 max-w-[32ch] text-center text-[0.9375rem] leading-relaxed text-muted-foreground md:text-left md:mx-0 mx-auto">
                You left before completing payment. Nothing was billed to your
                card.
              </p>
            </div>
          </div>

          {/* Right — what Pro includes + actions */}
          <div className="flex flex-col justify-between gap-8 bg-card p-8 sm:p-10">
            <div>
              <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-left">
                What Pro includes
              </p>
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <FeatureTile
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Button
                size="lg"
                className="h-12 flex-1 font-semibold"
                onClick={() =>
                  router.push("/premium/checkout?planId=pro&interval=year")
                }
              >
                Try again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 flex-1 font-semibold"
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
