"use client";

import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Zap,
  CalendarRange,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FeatureMini({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3 text-left shadow-sm">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function PremiumCancelledClient() {
  const router = useRouter();

  const highlights: { icon: LucideIcon; title: string; description: string }[] =
    [
      {
        icon: Mail,
        title: "Morning reminders",
        description: "9 AM ET nudges for filings and deadlines.",
      },
      {
        icon: Zap,
        title: "Urgency signals",
        description: "Surface what needs attention first.",
      },
      {
        icon: CalendarRange,
        title: "OPT & STEM",
        description: "Track windows and EAD milestones.",
      },
      {
        icon: Tag,
        title: "Pro from $4.99/mo",
        description: "Upgrade when you’re ready—cancel anytime.",
      },
    ];

  return (
    <div className="flex w-full max-w-md flex-col px-2 sm:px-0">
      <main className="flex flex-col items-center justify-center">
        <div className="w-full">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex justify-center">
              <div
                className={cn(
                  "relative flex h-[88px] w-[88px] items-center justify-center rounded-full border border-border bg-muted shadow-sm",
                  "animate-premium-hero-in"
                )}
              >
                <div className="animate-premium-check-draw">
                  <X
                    className="h-10 w-10 text-muted-foreground"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                No charge — checkout closed.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You left before completing payment. Nothing was billed to your
                card.
              </p>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                What Pro includes
              </p>
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <FeatureMini
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:items-center">
              <Button
                size="lg"
                className="h-12 w-full font-semibold sm:max-w-md"
                onClick={() => router.push("/premium/checkout")}
              >
                Try again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full font-semibold sm:max-w-md"
                onClick={() => router.push("/dashboard")}
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-4 border-t border-border bg-muted/20 px-2 py-4 sm:px-0">
        <p className="mx-auto max-w-md text-center text-[10px] text-muted-foreground">
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
