'use client';

import { useState } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import { filingPreview } from '@/lib/immigration/tool-calculations';
import { formatDate } from '@/lib/immigration/opt-calculations';
import { ToolDateField, ToolSave, ToolWorkspace } from './ToolWorkspace';
import { panelClass, toolThemes } from './tool-config';
import { useToolDates, type ToolDates } from './useToolDates';
import { ResultCard } from './ResultCard';
import { LiveStatsWidget } from './LiveStatsWidget';
import { EmailReminder } from './EmailReminder';
import { PricingModal } from '@/components/pricing/PricingModal';

export function FilingTool({ kind }: { kind: 'opt' | 'stem' }) {
  const state = useToolDates();
  const [pricing, setPricing] = useState(false);
  const stem = kind === 'stem';
  const slug = stem ? 'stem-apply' : 'opt-apply';
  const endKey = stem ? 'opt_ead_end_date' : 'program_end_date';
  const recommendationKey = stem
    ? 'stem_dso_recommendation_date'
    : 'dso_recommendation_date';
  const fields: (keyof ToolDates)[] = [endKey, recommendationKey];
  const result = filingPreview(
    kind,
    state.dates[endKey],
    state.dates[recommendationKey],
    state.today
  );
  const theme = toolThemes[slug];
  const dateIcon = (
    <CalendarDays aria-hidden="true" className={`h-4 w-4 ${theme.text}`} />
  );
  return (
    <ToolWorkspace slug={slug} aside={<LiveStatsWidget toolType={slug} />}>
      <div className={panelClass} aria-busy={state.loading}>
        <h3 className="font-semibold">Your filing dates</h3>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          {state.loading
            ? 'Loading saved dates…'
            : 'Use the actual dates on your documents. Nothing is saved automatically.'}
        </p>
        <fieldset
          disabled={state.loading}
          className="grid min-w-0 gap-5 sm:grid-cols-2"
        >
          <legend className="sr-only">Filing date inputs</legend>
          <ToolDateField
            state={state}
            name={endKey}
            label={stem ? 'Current OPT EAD End Date' : 'Program End Date'}
            description={
              stem
                ? 'Expiration date printed on your current EAD.'
                : 'Program end date on your I-20.'
            }
          />
          <ToolDateField
            state={state}
            name={recommendationKey}
            label={
              stem ? 'STEM DSO Recommendation Date' : 'DSO Recommendation Date'
            }
            optional
            description="The date your DSO entered the recommendation in SEVIS, not the date you requested it."
          />
        </fieldset>
        <ToolSave slug={slug} state={state} fields={fields} valid={!!result} />
      </div>
      {result ? (
        <section className={panelClass} aria-label="Filing estimate">
          <div className="mb-4 flex items-start gap-3">
            <Clock3
              aria-hidden="true"
              className={`mt-1 h-5 w-5 shrink-0 ${theme.text}`}
            />
            <div>
              <h3 className="font-semibold">{result.status}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.transitionReview
                  ? 'Filing rules changed in September 2026. Confirm your I-94, applicable filing window, and extension-of-stay requirements with your DSO. Historical dates below are not your confirmed deadline.'
                  : result.noWindow
                    ? 'This recommendation does not overlap the filing window. Ask your DSO to review it.'
                    : result.daysLeft < 0
                      ? 'The calculated receipt deadline has passed. Contact your DSO about your options.'
                      : !result.recommendation ||
                          result.recommendation > state.today
                        ? 'An actual SEVIS recommendation is required before filing. Adding a planned date does not mean it has been issued.'
                        : 'This checks dates only. It does not confirm eligibility or authorize work.'}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              icon={dateIcon}
              label="Earliest Filing Date"
              value={formatDate(result.earliestFile)}
              subtext={
                stem
                  ? '90 days before OPT EAD expiry'
                  : '90 days before program end'
              }
            />
            <ResultCard
              icon={dateIcon}
              label={
                result.transitionReview
                  ? 'Historical deadline estimate'
                  : 'Filing Deadline'
              }
              value={formatDate(result.hardDeadline)}
              subtext={
                result.recommendation
                  ? 'Earlier of the outer window and DSO limit'
                  : 'DSO date may shorten this window'
              }
              status={
                result.transitionReview || !result.recommendation
                  ? 'warning'
                  : result.daysLeft <= 0
                    ? 'critical'
                    : undefined
              }
            />
            {!stem && !result.transitionReview && (
              <>
                <ResultCard
                  icon={dateIcon}
                  label="Earliest requested OPT start"
                  value={formatDate(result.requestedStartEarliest)}
                  subtext="Day after program end; approval and EAD required"
                />
                <ResultCard
                  icon={dateIcon}
                  label="Latest requested OPT start"
                  value={formatDate(result.requestedStartLatest)}
                  subtext="Historical 60-day window; confirm with your DSO"
                />
              </>
            )}
          </div>
          {stem && (
            <div className={`mt-4 rounded-xl border p-4 ${theme.surface}`}>
              <h4 className="font-semibold">
                Work authorization while STEM is pending
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                If eligible and filed timely, authorization may continue for up
                to 180 days after OPT expiry or until USCIS decides, whichever
                comes first. Confirm eligibility with your DSO.
              </p>
              <p className="mt-2 text-sm">
                180-day outer estimate:{' '}
                <strong>{formatDate(result.pendingExtensionEnd)}</strong>. Not
                an approval or guaranteed work-through date.
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          Enter valid filing dates to see your timeline. Clear or incomplete
          dates will not leave an old result on screen.
        </div>
      )}
      <details className={panelClass}>
        <summary className="min-h-11 cursor-pointer font-semibold focus-visible:ring-2">
          How this estimate works
        </summary>
        <p className="mt-2 text-sm text-muted-foreground">
          {stem
            ? 'The receipt estimate uses the earlier of your current OPT expiration and 60 days after the STEM recommendation. Confirm E-Verify participation and your I-983 with your DSO before filing.'
            : 'Historical rules allowed filing from 90 days before through 60 days after program end, also within 30 days of the SEVIS recommendation. Current rules and transitional treatment can change the post-program window; this tool requires DSO review for potentially affected dates.'}{' '}
          The requested start date is separate from the filing deadline.
        </p>
      </details>
      {!state.loading && !state.guest && !state.loadError && (
        <EmailReminder
          toolType={slug}
          isPremium={state.premium}
          onUpgradeClick={() => setPricing(true)}
        />
      )}
      <PricingModal open={pricing} onClose={() => setPricing(false)} />
    </ToolWorkspace>
  );
}
