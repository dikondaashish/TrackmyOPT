"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Check,
  Mail,
  Zap,
  Shield,
  Crown,
  FileText,
  Search,
  Clock,
  Sparkles,
  AlertCircle,
  LayoutDashboard,
  UserRound,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { capturePremiumCheckoutCompleted } from "@/lib/posthog-client";

const CONFETTI = [
  { tx: "28px", ty: "-52px", rot: "18deg", delay: "0s" },
  { tx: "-36px", ty: "-44px", rot: "-14deg", delay: "0.04s" },
  { tx: "42px", ty: "-28px", rot: "22deg", delay: "0.08s" },
  { tx: "-22px", ty: "-56px", rot: "-8deg", delay: "0.12s" },
  { tx: "8px", ty: "-48px", rot: "10deg", delay: "0.16s" },
  { tx: "-48px", ty: "-32px", rot: "-20deg", delay: "0.2s" },
];

function SuccessHeroMark({ variant }: { variant: "pro" | "dedicated" }) {
  const ring =
    variant === "dedicated"
      ? "bg-secondary text-secondary-foreground ring-1 ring-border"
      : "bg-primary text-primary-foreground ring-1 ring-primary/20";

  return (
    <div className="relative mx-auto mb-8 flex h-[120px] w-[120px] items-center justify-center">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 animate-premium-confetti rounded-[1px] bg-primary/40 dark:bg-primary/50"
          style={
            {
              "--tx": c.tx,
              "--ty": c.ty,
              "--rot": c.rot,
              animationDelay: c.delay,
            } as any
          }
        />
      ))}
      <div
        className={cn(
          "relative flex h-[88px] w-[88px] items-center justify-center rounded-full shadow-sm animate-premium-hero-in",
          ring
        )}
      >
        <div className="animate-premium-check-draw">
          <Check className="h-10 w-10" strokeWidth={2.5} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  variant,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  variant: "pro" | "dedicated";
}) {
  const iconWrap =
    variant === "dedicated"
      ? "bg-secondary text-secondary-foreground"
      : "bg-primary/10 text-primary";

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md">
      <div
        className={cn(
          "mb-3 flex h-9 w-9 items-center justify-center rounded-md",
          iconWrap
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Stepper({
  steps,
}: {
  steps: { title: string; detail: string }[];
}) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className="my-1 w-px flex-1 min-h-[1.25rem] bg-border"
                aria-hidden
              />
            )}
          </div>
          <div className={cn("pb-6", i === steps.length - 1 && "pb-0")}>
            <p className="text-sm font-medium text-foreground">{step.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PremiumSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const planId = searchParams.get("planId") || "pro";
  const [countdown, setCountdown] = useState(8);
  const [syncState, setSyncState] = useState<
    "idle" | "syncing" | "synced" | "error"
  >("idle");

  const isDedicated = planId === "dedicated";
  const variant = isDedicated ? "dedicated" : "pro";

  useEffect(() => {
    if (!sessionId) return;
    capturePremiumCheckoutCompleted({
      plan_tier: variant,
      session_id: sessionId,
    });
  }, [sessionId, variant]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const run = async (attempt: number) => {
      setSyncState("syncing");
      try {
        const res = await fetch("/api/premium/confirm-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data.ok) {
          setSyncState("synced");
          return;
        }
        if (attempt < 5 && !cancelled) {
          await new Promise((r) => setTimeout(r, 1200));
          return run(attempt + 1);
        }
        if (!cancelled) setSyncState("error");
      } catch (error) {
        console.error('[premium/success] Error confirming checkout:', error);
        if (attempt < 5 && !cancelled) {
          await new Promise((r) => setTimeout(r, 1200));
          return run(attempt + 1);
        }
        if (!cancelled) setSyncState("error");
      }
    };

    run(1);
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const headline = isDedicated ? "You're set for Dedicated." : "You're all set.";
  const sub =
    isDedicated
      ? "Expert-backed support is live on your account."
      : "Pro is live—here’s what you can use first.";

  const proFeatures = [
    {
      icon: Mail,
      title: "Morning reminders",
      description: "9 AM ET nudges for deadlines and filings.",
    },
    {
      icon: Zap,
      title: "Smart urgency",
      description: "Surfaces what needs attention first.",
    },
    {
      icon: Search,
      title: "Full tracking suite",
      description: "OPT, STEM, case status, and jobs in one place.",
    },
    {
      icon: Shield,
      title: "Priority support",
      description: "Faster answers when you’re stuck.",
    },
  ];

  const dedicatedFeatures = [
    {
      icon: Clock,
      title: "Attorney session",
      description: "Included session each month for strategy.",
    },
    {
      icon: FileText,
      title: "Application audit",
      description: "Structured review of your filings.",
    },
    {
      icon: Sparkles,
      title: "Dedicated support",
      description: "Direct line when timing matters.",
    },
    {
      icon: Crown,
      title: "Everything in Pro",
      description: "All automation and tracking from Pro.",
    },
  ];

  const steps = isDedicated
    ? [
        {
          title: "Open your dashboard",
          detail: "Add OPT dates so countdowns stay accurate.",
        },
        {
          title: "Watch your email",
          detail: "We’ll send next steps for your attorney session.",
        },
        {
          title: "Confirm notification email",
          detail: "Settings → verify email for alerts.",
        },
      ]
    : [
        {
          title: "Open your dashboard",
          detail: "Enter program and EAD dates when you have them.",
        },
        {
          title: "Add a notification email",
          detail: "Settings → email used for reminders.",
        },
        {
          title: "Verify that email",
          detail: "So reminders and case alerts can reach you.",
        },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <SuccessHeroMark variant={variant} />

            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                {headline}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
            </div>

            {sessionId && (
              <div className="mt-6 flex min-h-[1.5rem] items-center justify-center gap-2 text-sm text-muted-foreground">
                {syncState === "syncing" && (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                    <span>Activating subscription…</span>
                  </>
                )}
                {syncState === "synced" && (
                  <>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>Subscription active</span>
                  </>
                )}
                {syncState === "error" && (
                  <>
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
                    <span className="text-center text-xs leading-snug">
                      Couldn&apos;t confirm automatically. If you still see Upgrade, wait a minute and refresh, or{" "}
                      <a
                        href="mailto:support@trackmyopt.com"
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        email support
                      </a>
                      .
                    </span>
                  </>
                )}
                {syncState === "idle" && (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                    <span>Preparing account…</span>
                  </>
                )}
              </div>
            )}

            <div className="mt-8">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Included with your plan
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(isDedicated ? dedicatedFeatures : proFeatures).map((f) => (
                  <FeatureCard
                    key={f.title}
                    icon={f.icon}
                    title={f.title}
                    description={f.description}
                    variant={variant}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Next steps
              </p>
              <Stepper steps={steps} />
            </div>

            <div className="mt-8 flex w-full justify-center sm:justify-center">
              <Button
                size="lg"
                className="h-12 w-full max-w-md font-semibold sm:w-auto sm:min-w-[240px]"
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden />
                {countdown > 0 ? (
                  <>Go to Dashboard ({countdown}s)</>
                ) : (
                  <>Go to Dashboard</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/20 px-4 py-4">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 text-center text-[10px] text-muted-foreground sm:flex-row sm:gap-6 sm:text-left">
          <a
            href="mailto:support@trackmyopt.com"
            className="order-2 font-medium text-foreground/80 underline-offset-2 hover:underline sm:order-1"
          >
            support@trackmyopt.com
          </a>
          {sessionId && (
            <span className="order-1 font-mono text-[10px] text-muted-foreground/80 sm:order-2">
              Session {sessionId.slice(0, 24)}…
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
