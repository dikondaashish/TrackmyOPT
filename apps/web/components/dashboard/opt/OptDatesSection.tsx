"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import dynamic from "next/dynamic";
import { JargonTooltip } from "@/components/ui/jargon-tooltip";
import { EmploymentHistoryLog } from "./EmploymentHistoryLog";
import { EmploymentSetupModal } from "./EmploymentSetupModal";
import { OptDatesStatusSummary } from "./OptDatesStatusSummary";
import { OptDatesSetupChecklist } from "./OptDatesSetupChecklist";
import { DateInput } from "./OptDateInput";
import { localTodayISO } from '@/lib/immigration/calendar-days';
import { getEmploymentSetupAck } from "@/lib/immigration/employment-tracking";
import { useEmploymentSetupAck } from "@/hooks/useEmploymentSetupAck";
import {
  areOptDatesEqual,
  buildOptDatesStatusSnapshot,
  optDateInputToISO,
  type OptDatesFormData,
} from "@/lib/immigration/opt-dates-page-utils";
import {
  OptEmailRemindersPanel,
  type ToolEmails,
  type ToolName,
} from "./OptEmailRemindersPanel";

const PricingModal = dynamic(
  () => import("@/components/pricing/PricingModal").then((m) => ({ default: m.PricingModal })),
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
  const [lastModifiedField, setLastModifiedField] = useState<string | null>(null);
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
  const [employmentLoadState, setEmploymentLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [asOfISO, setAsOfISO] = useState(() => localTodayISO());
  const [showEmploymentSetupModal, setShowEmploymentSetupModal] = useState(false);
  const [autoOpenEmploymentForm, setAutoOpenEmploymentForm] = useState(false);
  const { setAck, ack } = useEmploymentSetupAck();

  useEffect(() => {
    const refresh = () => setAsOfISO(localTodayISO());
    const timer = setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  // Deep link: /dashboard/opt-dates#employment
  useEffect(() => {
    if (isLoading) return;
    if (typeof window !== "undefined" && window.location.hash === "#employment") {
      const timeout = setTimeout(() => {
        document.getElementById("employment")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, savedDates.opt_start_date]);

  const scrollToEmployment = () => {
    document.getElementById("employment")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddJobFromSetup = () => {
    setAutoOpenEmploymentForm(true);
    scrollToEmployment();
  };

  const loadEmploymentSpans = async () => {
    setEmploymentLoadState('loading');
    try {
      const response = await fetch("/api/employment-spans", {
        credentials: "include",
        cache: "no-store",
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
      const response = await fetch('/api/premium/status', { credentials: 'include' });
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
      const response = await fetch('/api/user/tool-email', { credentials: 'include' });
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
        setToolEmails(prev => ({ ...prev, [tool]: '' }));
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const updateToolEmail = (tool: ToolName, email: string) => {
    setToolEmails(prev => ({ ...prev, [tool]: email }));
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
    void Promise.all([loadDates(), checkPremiumStatus(), loadToolEmails(), loadEmploymentSpans()]);
    return () => { dateLoadRequest.current += 1; };
  }, []);

  const handleDateChange = (field: keyof OptDatesData, value: string) => {
    dateEditVersion.current += 1;
    // School/SEVIS/EAD dates are independent facts, never inferred from edits.
    setDates(prev => ({ ...prev, [field]: value }));
    setLastModifiedField(field);

    // Real-time validation
    if (value.trim() && !optDateInputToISO(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Invalid date format (MM/DD/YYYY)' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (isSaving || datesLoadError) return;
    // Validate: at least one date must be filled
    const hasAtLeastOneDate = Object.values(dates).some(date => date && date.trim() !== '');

    if (!hasAtLeastOneDate && !Object.values(savedDates).some(date => date?.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one date.",
        variant: "destructive",
      });
      return;
    }

    // Validate date format (MM/DD/YYYY) for filled fields
    const dateFields: (keyof OptDatesData)[] = ['program_end_date', 'dso_recommendation_date', 'opt_start_date', 'opt_ead_end_date', 'stem_start_date', 'stem_dso_recommendation_date'];

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
        title: "Validation Error",
        description: "Please correct the invalid date formats.",
        variant: "destructive",
      });
      return;
    }

    const submittedDates = Object.fromEntries(
      dateFields
        .filter(field => (dates[field]?.trim() || '') !== (savedDates[field]?.trim() || ''))
        .map(field => [field, dates[field]?.trim() || null])
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
          !!savedOptStart && employmentSpans.length === 0 && !getEmploymentSetupAck();

        if (savedOptStart && employmentSpans.length === 0) {
          toast({
            title: "OPT start date saved",
            description: needsEmploymentSetup
              ? "Next step: add your job history so we can calculate unemployment days accurately."
              : "Add or update employment records below to keep your unemployment clock accurate.",
            className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
          });
        } else {
          toast({
            title: "Success",
            description: "Dates saved successfully!",
            className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
          });
        }

        // Keep edits made during this request; only advance the saved baseline.
        setSavedDates(previous => ({ ...previous, ...submittedDates }));

        if (needsEmploymentSetup) {
          setShowEmploymentSetupModal(true);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to save dates',
          variant: "destructive",
        });
      }
    } catch (_err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
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
    statusSnapshot.unemploymentLabel = employmentLoadState === 'loading' && !datesLoadError ? 'Loading…' : 'Unavailable';
    statusSnapshot.unemploymentDetail = 'Saved dates and employment history are needed to calculate';
    statusSnapshot.unemploymentTone = 'neutral';
    statusSnapshot.unemploymentWarning = null;
    statusSnapshot.clockActive = false;
  }
  const hasSavedOptStart = !!savedDates.opt_start_date?.trim();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">OPT Dates</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track filing windows, OPT dates, and employment history in one place.
        </p>
      </div>

      <OptDatesStatusSummary status={statusSnapshot} />
      {statusSnapshot.unemploymentWarning && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{statusSnapshot.unemploymentWarning}</p>}
      <p className="text-xs text-muted-foreground">
        Calendar-day estimate through today, including weekends. Job start and end dates count as employed.
        {' '}Only qualifying employment stops the clock; confirm your records and status with your DSO.
      </p>

      <OptDatesSetupChecklist
        status={statusSnapshot}
        isDirty={isDirty}
        onScrollToEmployment={scrollToEmployment}
      />

      {isDirty && (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-300">
          Unsaved changes: dashboard summaries and email reminders use your saved dates until you save.
        </p>
      )}

      {/* Main Form Card */}
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div id="dates-before-opt" className="scroll-mt-24 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Before OPT</h2>
              <p className="text-xs text-muted-foreground mt-1">
                School and filing dates — start here if you have not applied yet.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <DateInput
                id="program_end_date"
                label="Program End Date"
                value={dates.program_end_date || ''}
                onChange={(value) => handleDateChange('program_end_date', value)}
                description="The date your academic program officially ends"
              />
              <DateInput
                id="dso_recommendation_date"
                label={<span className="flex items-center gap-1"><JargonTooltip term="DSO" showIcon={true} /> Recommendation Date</span>}
                value={dates.dso_recommendation_date || ''}
                onChange={(value) => handleDateChange('dso_recommendation_date', value)}
                description="Actual date your DSO entered the OPT recommendation in SEVIS — not your graduation date"
                optional
              />
            </div>
          </div>

          <div id="dates-on-opt" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
            <div>
              <h2 className="text-base font-semibold">On OPT</h2>
              <p className="text-xs text-muted-foreground mt-1">
                From your EAD card — required to track unemployment days.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <DateInput
                id="opt_start_date"
                label={<span className="flex items-center gap-1"><JargonTooltip term="OPT" showIcon={true} /> Start Date</span>}
                value={dates.opt_start_date || ''}
                onChange={(value) => handleDateChange('opt_start_date', value)}
                description="Start date printed on your EAD — save to unlock employment tracking"
                optional
              />
              <DateInput
                id="opt_ead_end_date"
                label={<span className="flex items-center gap-1"><JargonTooltip term="OPT" showIcon={false} /> <JargonTooltip term="EAD" showIcon={true} /> End Date</span>}
                value={dates.opt_ead_end_date || ''}
                onChange={(value) => handleDateChange('opt_ead_end_date', value)}
                description="Enter the actual expiration printed on your initial OPT EAD; do not estimate"
                optional
              />
            </div>
          </div>

          <div id="dates-stem" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
            <div>
              <h2 className="text-base font-semibold">STEM extension</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Add your STEM recommendation when applying. Add a start date once your extension is approved.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <DateInput
                id="stem_dso_recommendation_date"
                label="STEM DSO Recommendation Date"
                value={dates.stem_dso_recommendation_date || ''}
                onChange={(value) => handleDateChange('stem_dso_recommendation_date', value)}
                description="Date your DSO recommended the STEM extension in SEVIS; separate from your initial OPT recommendation. Clear to remove."
                error={errors.stem_dso_recommendation_date}
                optional
              />
              <DateInput
                id="stem_start_date"
                label={<span className="flex items-center gap-1"><JargonTooltip term="STEM OPT" showIcon={true}>STEM Extension</JargonTooltip> Start Date</span>}
                value={dates.stem_start_date || ''}
                onChange={(value) => handleDateChange('stem_start_date', value)}
                description="Start date of STEM OPT extension (if applicable)"
                optional
              />
            </div>
          </div>

          {/* Action Buttons */}
          {datesLoadError && (
            <p role="alert" className="text-sm text-red-600">
              Could not load your saved dates.{' '}
              <button type="button" className="underline" onClick={() => void loadDates()}>Try again</button>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={isSaving || datesLoadError}
              className="min-w-[140px]"
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
        <Card id="employment" className="p-6">
          <p role={employmentLoadState === 'error' ? 'alert' : 'status'}>
            {employmentLoadState === 'error' ? 'Could not load employment history. Counts are unavailable.' : 'Loading employment history…'}
          </p>
          {employmentLoadState === 'error' && <Button variant="outline" onClick={() => void loadEmploymentSpans()}>Retry employment history</Button>}
        </Card>
      ) : hasSavedOptStart ? (
        <EmploymentHistoryLog
          employmentSpans={employmentSpans}
          optStartDate={savedDates.opt_start_date || undefined}
          optEndDate={savedDates.opt_ead_end_date || undefined}
          stemStartDate={savedDates.stem_start_date || undefined}
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
        <Card id="employment" className="scroll-mt-24 overflow-hidden border-dashed">
          <div className="p-6 sm:p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Employment History</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Save your <strong>OPT start date</strong> above to track jobs and calculate unemployment days.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#dates-on-opt">Go to OPT start date</a>
            </Button>
          </div>
        </Card>
      )}

      <EmploymentSetupModal
        open={showEmploymentSetupModal}
        onOpenChange={setShowEmploymentSetupModal}
        optStartDate={savedDates.opt_start_date || dates.opt_start_date || ""}
        onAddJob={handleAddJobFromSetup}
        onBetweenJobs={() => {
          setAck("between_jobs");
          scrollToEmployment();
        }}
        onNotOnOpt={() => {
          setAck("not_on_opt");
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
