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

interface OptJourneySectionProps {
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
        <p className="mt-3 text-sm text-muted-foreground">
          STEM filing window from your saved dates: {savedWindow.earliestFile}{' '}
          to {savedWindow.hardDeadline}. Confirm eligibility and your
          recommendation date with your DSO.{' '}
          <Link
            href="/dashboard/opt-dates#employment"
            className="text-blue-600 underline"
          >
            Review employment and reminder settings
          </Link>
        </p>
      )}

      {/* EAD + Cap-gap cards */}
      <EadStemCards
        filingCategory={normalizedCategory}
        eadProjected={eadProjected}
        stemWindowOpens={windowOpens}
        capGapActive={capGapActive}
      />

      {/* DSO deadline manager */}
      <DsoDeadlineManager tasks={tasks} />
    </Card>
  );
}
