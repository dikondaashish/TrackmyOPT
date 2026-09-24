'use client';

import { Route } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { getStemFilingWindow } from '@/lib/immigration/opt-calculations';
import type { SavedDates } from './SavedOptDates';
import { EmploymentContext } from './EmploymentContext';
import { Card } from '@/components/ui/card';
import { MilestoneTimeline, buildMilestones } from './MilestoneTimeline';
import { EadStemCards } from './EadStemCards';
import { DsoDeadlineManager } from './DsoDeadlineManager';
import { SavedOptDates } from './SavedOptDates';
import {
  buildOptComplianceActions,
  type OptComplianceAction,
} from '@/lib/case-status/opt-compliance-actions';
import {
  normalizeFilingCategory,
  type FilingCategory,
} from '@/lib/case-status/filing-category';
import { useClientDate } from '@/hooks/useClientDate';
import { formatDisplayDateNoon } from '@/lib/case-status/safe-dates';

interface OptJourneySectionProps {
  caseId?: string;
  isPro?: boolean;
  filingCategory?: FilingCategory | string | null;
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
  caseId,
  isPro = false,
  filingCategory = null,
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
  const normalizedCategory = normalizeFilingCategory(filingCategory);
  const isStemExtension = normalizedCategory === 'stem_extension';
  // Client-only date — null during SSR/hydration to avoid error #418.
  const clientNow = useClientDate();
  const [saved, setSaved] = useState<SavedDates | null>(null);
  const [savedEmploymentChange, setSavedEmploymentChange] = useState<
    string | null
  >(null);
  const savedWindow = saved?.opt_ead_end_date
    ? getStemFilingWindow(
        saved.opt_ead_end_date,
        saved.stem_dso_recommendation_date
      )
    : null;
  const windowOpens = stemWindowOpens ?? savedWindow?.earliestFile ?? null;
  const milestones = buildMilestones(
    optFiledDate,
    eadProjected,
    windowOpens,
    stemFiled,
    clientNow
  );
  const tasks =
    dsoTasks ??
    buildOptComplianceActions({
      uscisFiledDate: optFiledDate,
      employmentChangeDate: employmentChangeDate ?? savedEmploymentChange,
      stemStartDate: stemStartDate ?? saved?.stem_start_date,
      stemEndDate: stemEndDate ?? saved?.stem_ead_end_date,
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
          <h2 className="text-base font-bold text-foreground">
            {isStemExtension ? 'STEM OPT Journey' : 'OPT Journey'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isStemExtension
              ? 'Your STEM extension filing and what comes next'
              : 'Your F-1 → OPT → STEM → H-1B timeline'}
          </p>
        </div>
      </div>

      {/* Milestone timeline */}
      <MilestoneTimeline milestones={milestones} />
      <SavedOptDates onLoaded={setSaved} />
      <EmploymentContext onChangeDate={setSavedEmploymentChange} />
      {savedWindow && (
        <section
          aria-label="STEM filing window from saved dates"
          className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20"
        >
          <h3 className="text-sm font-semibold">STEM filing window</h3>
          <dl className="mt-3 grid grid-cols-2 gap-4 ph-mask" data-ph-mask>
            <div>
              <dt className="text-xs text-muted-foreground">Opens</dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">
                {formatDisplayDateNoon(savedWindow.earliestFile)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Deadline</dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">
                {formatDisplayDateNoon(savedWindow.hardDeadline)}
              </dd>
            </div>
          </dl>
          <div className="mt-3 text-xs text-muted-foreground">
            From saved dates · confirm eligibility and your recommendation date
            with your DSO.
          </div>
          <Link
            href="/dashboard/opt-dates#employment"
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 dark:text-blue-300"
          >
            Review employment and reminder settings
          </Link>
        </section>
      )}

      {/* EAD + Cap-gap cards */}
      <EadStemCards
        filingCategory={normalizedCategory}
        eadProjected={eadProjected}
        stemWindowOpens={windowOpens}
        capGapActive={capGapActive}
      />

      {/* DSO deadline manager */}
      <DsoDeadlineManager
        key={caseId}
        caseId={caseId}
        isPro={isPro}
        tasks={tasks}
      />
    </Card>
  );
}
