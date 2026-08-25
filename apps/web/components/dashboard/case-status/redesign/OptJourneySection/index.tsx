"use client";

import { Route } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MilestoneTimeline, buildMilestones } from "./MilestoneTimeline";
import { EadStemCards } from "./EadStemCards";
import { DsoDeadlineManager } from "./DsoDeadlineManager";
import {
  buildOptComplianceActions,
  type OptComplianceAction,
} from "@/lib/case-status/opt-compliance-actions";
import { useClientDate } from "@/hooks/useClientDate";

interface OptJourneySectionProps {
  optFiledDate: string | null;
  eadProjected?: string | null;
  stemWindowOpens?: string | null;
  stemFiled?: string | null;
  stemStartDate?: string | null;
  stemEndDate?: string | null;
  employmentChangeDate?: string | null;
  capGapActive?: boolean | null;
  /** If not provided, only tasks supported by the supplied compliance dates are shown. */
  dsoTasks?: OptComplianceAction[];
}

export function OptJourneySection({
  optFiledDate,
  eadProjected = null,
  stemWindowOpens = null,
  stemFiled,
  stemStartDate = null,
  stemEndDate = null,
  employmentChangeDate = null,
  capGapActive = null,
  dsoTasks,
}: OptJourneySectionProps) {
  // Client-only date — null during SSR/hydration to avoid error #418.
  const clientNow = useClientDate();
  const milestones = buildMilestones(optFiledDate, eadProjected, stemWindowOpens, stemFiled, clientNow);
  const tasks = dsoTasks ?? buildOptComplianceActions({
    uscisFiledDate: optFiledDate,
    employmentChangeDate,
    stemStartDate,
    stemEndDate,
    now: clientNow ?? undefined,
  });

  return (
    <Card className="p-5 sm:p-6 border-0 shadow-lg">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
          <Route className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">OPT Journey</h2>
          <p className="text-xs text-muted-foreground">Your F-1 → OPT → STEM → H-1B timeline</p>
        </div>
      </div>

      {/* Milestone timeline */}
      <MilestoneTimeline milestones={milestones} />

      {/* EAD + Cap-gap cards */}
      <EadStemCards
        eadProjected={eadProjected}
        stemWindowOpens={stemWindowOpens}
        capGapActive={capGapActive}
      />

      {/* DSO deadline manager */}
      <DsoDeadlineManager tasks={tasks} />
    </Card>
  );
}
