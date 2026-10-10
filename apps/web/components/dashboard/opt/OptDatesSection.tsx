'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import dynamic from 'next/dynamic';
import { EmploymentHistoryLog } from './EmploymentHistoryLog';
import { EmploymentSetupModal } from './EmploymentSetupModal';
import { OptDatesStatusSummary } from './OptDatesStatusSummary';
import { OptDatesSetupChecklist } from './OptDatesSetupChecklist';
import {
  EmploymentHistoryEmptyCard,
  EmploymentHistoryLoadingCard,
  OptDatesDayCountExplainer,
  OptDatesFormFields,
  OptDatesHeader,
  OptDatesLoadingSkeleton,
  OptDatesUnemploymentWarning,
} from './OptDatesSectionParts';
import { localTodayISO } from '@/lib/immigration/calendar-days';
import { getEmploymentSetupAck } from '@/lib/immigration/employment-tracking';
import { useEmploymentSetupAck } from '@/hooks/useEmploymentSetupAck';
import {
  areOptDatesEqual,
  buildOptDatesStatusSnapshot,
  optDateInputToISO,
  type OptDatesFormData,
} from '@/lib/immigration/opt-dates-page-utils';
import {
  OptEmailRemindersPanel,
  type ToolEmails,
  type ToolName,
} from './OptEmailRemindersPanel';

const PricingModal = dynamic(
  () =>
    import('@/components/pricing/PricingModal').then((m) => ({
      default: m.PricingModal,
    })),
  { ssr: false }
);

type OptDatesData = OptDatesFormData;

interface EmploymentSpan {
  id: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  job_title?: string;
  location?: string;
}

// Tool email types
export function OptDatesSection() {
  const { toast } = useToast();
  const [dates, setDates] = useState<OptDatesData>({});
  const [savedDates, setSavedDates] = useState<OptDatesData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastModifiedField, setLastModifiedField] = useState<string | null>(
    null
  );
  const dateLoadRequest = useRef(0);
  const dateEditVersion = useRef(0);
  const [datesLoadError, setDatesLoadError] = useState(false);

  // Premium & Email states - now with 4 separate emails
  const [isPremium, setIsPremium] = useState(false);
  const [toolEmails, setToolEmails] = useState<ToolEmails>({
    opt_apply: '',
    opt_clock: '',
    stem_apply: '',
    stem_clock: '',
  });
  const [editingTool, setEditingTool] = useState<ToolName | null>(null);
  const [emailSaving, setEmailSaving] = useState<ToolName | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [employmentLoadState, setEmploymentLoadState] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [asOfISO, setAsOfISO] = useState(() => localTodayISO());
  const [showEmploymentSetupModal, setShowEmploymentSetupModal] =
    useState(false);
  const [autoOpenEmploymentForm, setAutoOpenEmploymentForm] = useState(false);
  const { setAck, ack } = useEmploymentSetupAck();

  useEffect(() => {
    const refresh = () => setAsOfISO(localTodayISO());
    const timer = setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  // Deep link: /dashboard/opt-dates#employment
  useEffect(() => {
    if (isLoading) return;
    if (
      typeof window !== 'undefined' &&
      window.location.hash === '#employment'
    ) {
      const timeout = setTimeout(() => {
        document
          .getElementById('employment')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, savedDates.opt_start_date]);

  const scrollToEmployment = () => {
    document
      .getElementById('employment')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddJobFromSetup = () => {
    setAutoOpenEmploymentForm(true);
    scrollToEmployment();
  };

  const loadEmploymentSpans = async () => {
    setEmploymentLoadState('loading');
    try {
      const response = await fetch('/api/employment-spans', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok && Array.isArray(data.spans)) {
          setEmploymentSpans(
            data.spans.map((s: EmploymentSpan) => ({
              ...s,
              is_current: s.is_current ?? !s.end_date,
            }))
          );
          setEmploymentLoadState('ready');
          return;
        }
      }
      throw new Error('Employment history unavailable');
    } catch {
      setEmploymentLoadState('error');
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/premium/status', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium || false);
      }
    } catch {
      // Silently fail
    }
  };

  const loadToolEmails = async () => {
    try {
      const response = await fetch('/api/user/tool-email', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.emails) {
          setToolEmails({
            opt_apply: data.emails.opt_apply || '',
            opt_clock: data.emails.opt_clock || '',
            stem_apply: data.emails.stem_apply || '',
            stem_clock: data.emails.stem_clock || '',
          });
        }
      }
    } catch {
      // Silently fail
    }
  };

  const handleToolEmailSave = async (tool: ToolName) => {
    const email = toolEmails[tool];
    if (!email || !email.includes('@')) {
      return;
    }

    try {
      setEmailSaving(tool);
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email }),
      });

      if (response.ok) {
        setEditingTool(null);
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const handleToolEmailStop = async (tool: ToolName) => {
    if (!confirm('Stop email reminders for this tool?')) {
      return;
    }

    try {
      setEmailSaving(tool);
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email: '' }),
      });

      if (response.ok) {
        setToolEmails((prev) => ({ ...prev, [tool]: '' }));
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const updateToolEmail = (tool: ToolName, email: string) => {
    setToolEmails((prev) => ({ ...prev, [tool]: email }));
  };

  const loadDates = async () => {
    const request = ++dateLoadRequest.current;
    const editVersion = dateEditVersion.current;
    try {
      setIsLoading(true);
      setDatesLoadError(false);

      // Use same endpoint as extension for perfect sync
      const response = await fetch('/api/opt/calculator', {
        credentials: 'include',
        cache: 'no-store', // Prevent caching to ensure fresh data
      });

      if (!response.ok) throw new Error('Failed to load dates');
      const result = await response.json();
      if (!result.ok) throw new Error('Failed to load dates');
      if (request !== dateLoadRequest.current) return;
      const loadedDates = result.data || {};
      if (editVersion === dateEditVersion.current) setDates(loadedDates);
      setSavedDates(loadedDates);
    } catch (_err) {
      if (request === dateLoadRequest.current) setDatesLoadError(true);
    } finally {
      if (request === dateLoadRequest.current) {
        setIsLoading(false);
      }
    }
  };

  // Load all data in parallel on mount.
  useEffect(() => {
    void Promise.all([
      loadDates(),
      checkPremiumStatus(),
      loadToolEmails(),
      loadEmploymentSpans(),
    ]);
    return () => {
      dateLoadRequest.current += 1;
    };
  }, []);

  const handleDateChange = (field: keyof OptDatesData, value: string) => {
    dateEditVersion.current += 1;
    // School/SEVIS/EAD dates are independent facts, never inferred from edits.
    setDates((prev) => ({ ...prev, [field]: value }));
    setLastModifiedField(field);

    // Real-time validation
    if (value.trim() && !optDateInputToISO(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]: 'Invalid date format (MM/DD/YYYY)',
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (isSaving || datesLoadError) return;
    // Validate: at least one date must be filled
    const hasAtLeastOneDate = Object.values(dates).some(
      (date) => date && date.trim() !== ''
    );

    if (
      !hasAtLeastOneDate &&
      !Object.values(savedDates).some((date) => date?.trim())
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please enter at least one date.',
        variant: 'destructive',
      });
      return;
    }

    // Validate date format (MM/DD/YYYY) for filled fields
    const dateFields: (keyof OptDatesData)[] = [
      'program_end_date',
      'dso_recommendation_date',
      'opt_start_date',
      'opt_ead_end_date',
      'stem_start_date',
      'stem_ead_end_date',
      'stem_dso_recommendation_date',
    ];

    let hasError = false;
    const newErrors: Record<string, string> = {};

    for (const field of dateFields) {
      const value = dates[field as keyof OptDatesData];
      if (value?.trim() && !optDateInputToISO(value)) {
        newErrors[field] = `Invalid date format`;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      toast({
        title: 'Validation Error',
        description: 'Please correct the invalid date formats.',
        variant: 'destructive',
      });
      return;
    }

    const submittedDates = Object.fromEntries(
      dateFields
        .filter(
          (field) =>
            (dates[field]?.trim() || '') !== (savedDates[field]?.trim() || '')
        )
        .map((field) => [field, dates[field]?.trim() || null])
    ) as OptDatesData;
    if (Object.keys(submittedDates).length === 0) return;

    try {
      setIsSaving(true);

      const payload = {
        ...submittedDates,
        _lastModifiedField: lastModifiedField,
      };

      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to save dates');
      const result = await response.json();

      if (response.ok && result.ok) {
        const savedOptStart = dates.opt_start_date;
        const needsEmploymentSetup =
          !!savedOptStart &&
          employmentSpans.length === 0 &&
          !getEmploymentSetupAck();

        if (savedOptStart && employmentSpans.length === 0) {
          toast({
            title: 'OPT start date saved',
            description: needsEmploymentSetup
              ? 'Next step: add your job history so we can calculate unemployment days accurately.'
              : 'Add or update employment records below to keep your unemployment clock accurate.',
            className:
              'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Dates saved successfully!',
            className:
              'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          });
        }

        // Keep edits made during this request; only advance the saved baseline.
        setSavedDates((previous) => ({ ...previous, ...submittedDates }));

        if (needsEmploymentSetup) {
          setShowEmploymentSetupModal(true);
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save dates',
          variant: 'destructive',
        });
      }
    } catch (_err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    dateEditVersion.current += 1;
    setDates({ ...savedDates });
    setErrors({});
    setLastModifiedField(null);
  };

  const isDirty = !areOptDatesEqual(dates, savedDates);
  const statusSnapshot = buildOptDatesStatusSnapshot(
    savedDates,
    employmentSpans.length,
    ack,
    employmentSpans,
    asOfISO
  );
  if (employmentLoadState !== 'ready' || datesLoadError) {
    statusSnapshot.unemploymentLabel =
      employmentLoadState === 'loading' && !datesLoadError
        ? 'Loading…'
        : 'Unavailable';
    statusSnapshot.unemploymentDetail =
      'Saved dates and employment history are needed to calculate';
    statusSnapshot.unemploymentTone = 'neutral';
    statusSnapshot.unemploymentWarning = null;
    statusSnapshot.clockActive = false;
  }
  const hasSavedOptStart = !!savedDates.opt_start_date?.trim();

  if (isLoading) {
    return <OptDatesLoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 pb-4 sm:px-6">
      {/* Header */}
      <OptDatesHeader />

      <OptDatesStatusSummary status={statusSnapshot} />
      <OptDatesUnemploymentWarning
        warning={statusSnapshot.unemploymentWarning}
      />
      <OptDatesDayCountExplainer />

      <OptDatesSetupChecklist
        status={statusSnapshot}
        isDirty={isDirty}
        onScrollToEmployment={scrollToEmployment}
      />

      {isDirty && (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          Unsaved changes: dashboard summaries and email reminders use your
          saved dates until you save.
        </p>
      )}

      {/* Main Form Card */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800">
        <div className="space-y-5 p-4 sm:p-6 lg:p-7">
          <OptDatesFormFields
            dates={dates}
            errors={errors}
            onDateChange={handleDateChange}
          />

          {/* Action Buttons */}
          {datesLoadError && (
            <p role="alert" className="text-sm text-red-600">
              Could not load your saved dates.{' '}
              <button
                type="button"
                className="underline"
                onClick={() => void loadDates()}
              >
                Try again
              </button>
            </p>
          )}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/35 p-3 sm:flex-row sm:items-center">
            <Button
              onClick={handleSave}
              disabled={isSaving || datesLoadError}
              className="min-w-[140px] shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Dates'}
            </Button>
            {isDirty && (
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                disabled={isSaving}
              >
                Discard changes
              </Button>
            )}
          </div>
        </div>
      </Card>

      {hasSavedOptStart && employmentLoadState !== 'ready' ? (
        <EmploymentHistoryLoadingCard
          loadState={employmentLoadState}
          onRetry={() => void loadEmploymentSpans()}
        />
      ) : hasSavedOptStart ? (
        <EmploymentHistoryLog
          employmentSpans={employmentSpans}
          optStartDate={savedDates.opt_start_date || undefined}
          optEndDate={savedDates.opt_ead_end_date || undefined}
          stemStartDate={savedDates.stem_start_date || undefined}
          stemEndDate={savedDates.stem_ead_end_date || undefined}
          asOfISO={asOfISO}
          maxUnemploymentDays={statusSnapshot.unemploymentMax}
          autoOpenForm={autoOpenEmploymentForm}
          onSpansChange={(spans) => {
            setEmploymentSpans(
              spans.map((s) => ({
                ...s,
                is_current: s.is_current ?? !s.end_date,
              }))
            );
            if (spans.length > 0) {
              setAutoOpenEmploymentForm(false);
              setShowEmploymentSetupModal(false);
            }
          }}
        />
      ) : (
        <EmploymentHistoryEmptyCard />
      )}

      <EmploymentSetupModal
        open={showEmploymentSetupModal}
        onOpenChange={setShowEmploymentSetupModal}
        optStartDate={savedDates.opt_start_date || dates.opt_start_date || ''}
        onAddJob={handleAddJobFromSetup}
        onBetweenJobs={() => {
          setAck('between_jobs');
          scrollToEmployment();
        }}
        onNotOnOpt={() => {
          setAck('not_on_opt');
          scrollToEmployment();
        }}
      />

      <OptEmailRemindersPanel
        isPremium={isPremium}
        toolEmails={toolEmails}
        editingTool={editingTool}
        emailSaving={emailSaving}
        onEditTool={setEditingTool}
        onCancelEdit={() => setEditingTool(null)}
        onSaveTool={handleToolEmailSave}
        onStopTool={handleToolEmailStop}
        onUpdateEmail={updateToolEmail}
        onComparePlans={() => setShowPremiumModal(true)}
      />

      {/* Premium Modal */}
      <PricingModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
