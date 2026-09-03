"use client";

import { CreditCard, Fingerprint, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  JourneyPhase,
  JourneyStages,
  StageId,
  StageStat,
} from "@/lib/community-opt/stages";
import type { CommunityCaseKind } from "@/lib/community-opt/types";
import { getCommunityCaseKindLabel } from "@/lib/case-status/filing-category";

interface JourneyStagesCardProps {
  stages: JourneyStages | null;
  phase: JourneyPhase;
  premiumProcessing?: boolean;
  caseKind?: CommunityCaseKind;
  isPro: boolean;
  onUpgrade?: () => void;
  loading?: boolean;
}

type StepConfig = {
  id: StageId;
  title: string;
  /** What the wait is measured from, in the user's words. */
  from: string;
  icon: React.ReactNode;
  /** Phases for which this step is the one the user is waiting on. */
  activeIn: JourneyPhase[];
  /** Phases by which this step is already behind them. */
  doneIn: JourneyPhase[];
};

const STEPS: StepConfig[] = [
  {
    id: "biometrics",
    title: "Biometrics update",
    from: "after filing",
    icon: <Fingerprint className="w-4 h-4" />,
    activeIn: ["filed"],
    doneIn: ["biometrics_done", "approved", "card_produced", "delivered"],
  },
  {
    id: "card_produced",
    title: "Card produced",
    from: "after approval",
    icon: <CreditCard className="w-4 h-4" />,
    activeIn: ["approved"],
    doneIn: ["card_produced", "delivered"],
  },
  {
    id: "card_delivered",
    title: "Card in hand",
    from: "after approval",
    icon: <Mail className="w-4 h-4" />,
    activeIn: ["card_produced"],
    doneIn: ["delivered"],
  },
];

function statFor(stages: JourneyStages, id: StageId): StageStat | null {
  if (id === "biometrics") return stages.biometrics;
  if (id === "card_produced") return stages.cardProduced;
  return stages.cardDelivered;
}

/**
 * The waits either side of adjudication.
 *
 * These steps are mechanical rather than discretionary, so they land in a far
 * tighter band than the approval estimate and are worth stating plainly. The
 * card is deliberately quiet once a case is delivered — there is nothing left
 * to wait for.
 */
export function JourneyStagesCard({
  stages,
  phase,
  premiumProcessing,
  caseKind = "initial_opt",
  isPro,
  onUpgrade,
  loading = false,
}: JourneyStagesCardProps) {
  if (loading && !stages) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Loading community milestone timings…
      </p>
    );
  }

  if (phase === "delivered") return null;

  const visible = stages
    ? STEPS.map((step) => ({ step, stat: statFor(stages, step.id) })).filter(
        ({ step, stat }) => stat !== null && !step.doneIn.includes(phase)
      )
    : [];

  if (!visible.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">What comes next</p>
        <p className="text-xs text-muted-foreground">
          Typical {getCommunityCaseKindLabel(caseKind)} timings for the steps ahead of you
          {premiumProcessing === undefined
            ? ""
            : premiumProcessing
              ? " · premium processing"
              : " · standard processing"}
        </p>
      </div>

      <ol className="space-y-2">
        {visible.map(({ step, stat }) => {
          const active = step.activeIn.includes(phase);
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 border",
                active
                  ? "border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30"
                  : "border-transparent bg-muted/30"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 shrink-0",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                )}
              >
                {step.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {step.title}
                    {active && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        You're here
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-bold text-foreground whitespace-nowrap">
                    ~{stat!.medianDays}d
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {step.from}
                  {isPro && stat!.p25Days !== undefined && (
                    <>
                      {" · "}
                      middle 50%: {stat!.p25Days}–{stat!.p75Days}d
                      {stat!.sampleSize !== undefined && (
                        <> · {stat!.sampleSize.toLocaleString()} reports</>
                      )}
                    </>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {!isPro && (
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
        >
          <Lock className="w-3 h-3" />
          See the full range and how many reports each timing is based on
        </button>
      )}
    </div>
  );
}
