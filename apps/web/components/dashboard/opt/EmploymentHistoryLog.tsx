'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Plus,
  ChevronDown,
  ChevronUp,
  Building2,
} from 'lucide-react';
import { EmploymentIncompleteCallout } from './EmploymentIncompleteCallout';
import { EmploymentSpanForm } from './EmploymentSpanForm';
import { EmploymentSpanRow } from './EmploymentSpanRow';
import { EmploymentStatsSummary } from './EmploymentStatsSummary';
import { useEmploymentSetupAck } from '@/hooks/useEmploymentSetupAck';
import {
  employerLogoDomain,
  normalizeCompanyDomain,
} from '@/lib/company-domain';
import {
  clearEmploymentSetupAck,
  isEmploymentTrackingIncomplete,
  shouldShowUnemploymentComplianceNumbers,
} from '@/lib/immigration/employment-tracking';
import {
  computeEmploymentStats,
  mapEmploymentSpans,
  toEmploymentInputDate,
  type EmploymentSpan,
} from './employment-history-helpers';

interface EmploymentHistoryLogProps {
  employmentSpans?: EmploymentSpan[];
  optStartDate?: string;
  optEndDate?: string;
  stemStartDate?: string;
  stemEndDate?: string;
  asOfISO?: string;
  maxUnemploymentDays?: number;
  /** When true, opens the add-employment form (e.g. after setup modal). */
  autoOpenForm?: boolean;
  onSpansChange?: (spans: EmploymentSpan[]) => void;
}

export function EmploymentHistoryLog({
  employmentSpans = [],
  optStartDate,
  optEndDate,
  stemStartDate,
  stemEndDate,
  asOfISO,
  maxUnemploymentDays = 90,
  autoOpenForm = false,
  onSpansChange,
}: EmploymentHistoryLogProps) {
  const { ack, setAck } = useEmploymentSetupAck();
  const employerInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [spans, setSpans] = useState<EmploymentSpan[]>(employmentSpans);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [newEmployer, setNewEmployer] = useState('');
  const [newEmployerDomain, setNewEmployerDomain] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newIsCurrent, setNewIsCurrent] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmployer, setEditEmployer] = useState('');
  const [editEmployerDomain, setEditEmployerDomain] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editIsCurrent, setEditIsCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const stats = computeEmploymentStats(
    spans,
    optStartDate,
    optEndDate,
    stemStartDate,
    asOfISO,
    stemEndDate
  );

  useEffect(() => {
    setSpans(employmentSpans);
  }, [employmentSpans]);

  useEffect(() => {
    if (autoOpenForm) {
      setShowInlineForm(true);
      setTimeout(() => {
        employerInputRef.current?.focus();
        document
          .getElementById('employment')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [autoOpenForm]);

  const spanCount = spans.length;
  const trackingIncomplete = isEmploymentTrackingIncomplete(
    optStartDate,
    spanCount,
    ack
  );
  const showComplianceNumbers =
    !!optEndDate &&
    shouldShowUnemploymentComplianceNumbers(optStartDate, spanCount, ack);
  const notOnOptYet = ack === 'not_on_opt' && spanCount === 0;

  const sortedSpans = [...spans].sort(
    (a, b) =>
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const displayedSpans = isExpanded ? sortedSpans : sortedSpans.slice(0, 3);

  const handleSaveInline = async () => {
    setFormError(null);
    if (!newEmployer.trim() || !newStartDate.trim()) {
      setFormError('Employer name and start date are required.');
      return;
    }

    if (
      newEmployerDomain.trim() &&
      !normalizeCompanyDomain(newEmployerDomain)
    ) {
      setFormError(
        'Enter a valid company website, such as example.com, or leave it blank.'
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/employment-spans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          spans: [
            {
              employer_name: newEmployer.trim(),
              employer_domain: normalizeCompanyDomain(newEmployerDomain),
              start_date: newStartDate.trim(),
              end_date: newIsCurrent ? null : newEndDate.trim() || null,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save employment');
      }

      const spansRes = await fetch('/api/employment-spans', {
        credentials: 'include',
      });
      const spansData = await spansRes.json();
      if (spansRes.ok && spansData.ok && Array.isArray(spansData.spans)) {
        const mapped = mapEmploymentSpans(spansData.spans);
        setSpans(mapped);
        clearEmploymentSetupAck();
        onSpansChange?.(mapped);
      }

      setShowInlineForm(false);
      setNewEmployer('');
      setNewEmployerDomain('');
      setNewStartDate('');
      setNewEndDate('');
      setNewIsCurrent(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save employment');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (span: EmploymentSpan) => {
    setFormError(null);
    setEditingId(span.id);
    setEditEmployer(span.employer_name || '');
    setEditEmployerDomain(
      employerLogoDomain(span.employer_name, span.employer_domain) || ''
    );
    setEditStartDate(toEmploymentInputDate(span.start_date));
    setEditEndDate(toEmploymentInputDate(span.end_date));
    setEditIsCurrent(span.is_current ?? !span.end_date);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditEmployer('');
    setEditEmployerDomain('');
    setEditStartDate('');
    setEditEndDate('');
    setEditIsCurrent(false);
    setFormError(null);
  };

  const handleSaveEdit = async () => {
    setFormError(null);
    if (!editingId) return;
    if (!editEmployer.trim() || !editStartDate.trim()) {
      setFormError('Employer name and start date are required.');
      return;
    }

    if (
      editEmployerDomain.trim() &&
      !normalizeCompanyDomain(editEmployerDomain)
    ) {
      setFormError(
        'Enter a valid company website, such as example.com, or leave it blank.'
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/employment-spans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          spans: [
            {
              id: editingId,
              employer_name: editEmployer.trim(),
              employer_domain: normalizeCompanyDomain(editEmployerDomain),
              start_date: editStartDate.trim(),
              end_date: editIsCurrent ? null : editEndDate.trim() || null,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update employment');
      }

      const spansRes = await fetch('/api/employment-spans', {
        credentials: 'include',
      });
      const spansData = await spansRes.json();
      if (spansRes.ok && spansData.ok && Array.isArray(spansData.spans)) {
        const mapped = mapEmploymentSpans(spansData.spans);
        setSpans(mapped);
        if (mapped.length > 0) {
          clearEmploymentSetupAck();
        }
        onSpansChange?.(mapped);
      }

      handleCancelEdit();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update employment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, employerName: string) => {
    const confirmed = window.confirm(
      `Delete employment record for ${employerName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setFormError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/employment-spans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to delete employment');
      }

      const spansRes = await fetch('/api/employment-spans', {
        credentials: 'include',
      });
      const spansData = await spansRes.json();
      if (spansRes.ok && spansData.ok && Array.isArray(spansData.spans)) {
        const mapped = mapEmploymentSpans(spansData.spans);
        setSpans(mapped);
        if (mapped.length > 0) {
          clearEmploymentSetupAck();
        }
        onSpansChange?.(mapped);
      }

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete employment');
    } finally {
      setSaving(false);
    }
  };

  const openAddJobForm = () => {
    setShowInlineForm(true);
    setTimeout(() => employerInputRef.current?.focus(), 50);
  };

  return (
    <div
      id="employment"
      className={`scroll-mt-24 rounded-2xl border border-slate-200 bg-card shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 ${showInlineForm || editingId ? 'overflow-visible' : 'overflow-hidden'}`}
    >
      <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/60 p-4 dark:from-emerald-950/20 dark:via-card dark:to-blue-950/20 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Employment History</h2>
            <p className="text-sm text-muted-foreground">
              {spans.length} employment record{spans.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowInlineForm(true)}
          className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-primary/15 bg-white/80 px-3 py-2 text-sm font-semibold text-primary shadow-sm transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-card sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Employment
        </button>
      </div>

      {trackingIncomplete && optStartDate && (
        <EmploymentIncompleteCallout
          optStartDate={optStartDate}
          onAddJob={openAddJobForm}
          onBetweenJobs={() => setAck('between_jobs')}
        />
      )}

      {notOnOptYet && optStartDate && (
        <div className="mx-4 mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-blue-950 dark:border-blue-950 dark:bg-blue-950/20 dark:text-blue-100">
          OPT dates are saved. The unemployment clock will start counting once
          your OPT period begins and you confirm your employment status.
        </div>
      )}

      {!notOnOptYet && (
        <EmploymentStatsSummary
          stats={stats}
          maxUnemploymentDays={maxUnemploymentDays}
          showComplianceNumbers={showComplianceNumbers}
          trackingIncomplete={trackingIncomplete}
          betweenJobsEmpty={ack === 'between_jobs' && spanCount === 0}
        />
      )}

      {showInlineForm && (
        <div className="border-t border-border bg-muted/30 px-4 pb-2 pt-4">
          <EmploymentSpanForm
            employer={newEmployer}
            startDate={newStartDate}
            endDate={newEndDate}
            isCurrent={newIsCurrent}
            saving={saving}
            formError={formError}
            employerInputRef={employerInputRef}
            submitLabel="Save Employment"
            employerDomain={newEmployerDomain}
            onEmployerDomainChange={setNewEmployerDomain}
            onEmployerChange={(value) => {
              setNewEmployer(value);
              setNewEmployerDomain('');
            }}
            onStartDateChange={setNewStartDate}
            onEndDateChange={setNewEndDate}
            onIsCurrentChange={(checked) => {
              setNewIsCurrent(checked);
              if (checked) setNewEndDate('');
            }}
            onCancel={() => {
              setShowInlineForm(false);
              setFormError(null);
            }}
            onSubmit={handleSaveInline}
          />
        </div>
      )}

      {spans.length === 0 && !showInlineForm ? (
        <div className="p-8 text-center sm:p-10">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-foreground mb-1">
            No employment records yet
          </p>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
            Add each employer since your OPT started. For your current job,
            check &quot;I currently work here&quot; when adding it.
          </p>
          <button
            type="button"
            onClick={openAddJobForm}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Job
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayedSpans.map((span) => (
            <div
              key={span.id}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              {editingId === span.id ? (
                <EmploymentSpanForm
                  employer={editEmployer}
                  startDate={editStartDate}
                  endDate={editEndDate}
                  isCurrent={editIsCurrent}
                  saving={saving}
                  submitLabel="Save Changes"
                  formError={formError}
                  employerDomain={editEmployerDomain}
                  onEmployerDomainChange={setEditEmployerDomain}
                  onEmployerChange={(value) => {
                    setEditEmployer(value);
                    setEditEmployerDomain('');
                  }}
                  onStartDateChange={setEditStartDate}
                  onEndDateChange={setEditEndDate}
                  onIsCurrentChange={(checked) => {
                    setEditIsCurrent(checked);
                    if (checked) setEditEndDate('');
                  }}
                  onCancel={handleCancelEdit}
                  onSubmit={handleSaveEdit}
                />
              ) : (
                <EmploymentSpanRow
                  span={span}
                  saving={saving}
                  onEdit={handleStartEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {sortedSpans.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1 border-t border-border"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show All ({sortedSpans.length}){' '}
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
