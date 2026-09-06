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
  clearEmploymentSetupAck,
  isEmploymentTrackingIncomplete,
  shouldShowUnemploymentComplianceNumbers,
} from '@/lib/immigration/employment-tracking';
import {
  computeEmploymentStats,
  EMPTY_EMPLOYMENT_STATS,
  mapEmploymentSpans,
  toEmploymentInputDate,
  type EmploymentSpan,
} from './employment-history-helpers';

interface EmploymentHistoryLogProps {
  employmentSpans?: EmploymentSpan[];
  optStartDate?: string;
  optEndDate?: string;
  maxUnemploymentDays?: number;
  /** When true, opens the add-employment form (e.g. after setup modal). */
  autoOpenForm?: boolean;
  onSpansChange?: (spans: EmploymentSpan[]) => void;
}

export function EmploymentHistoryLog({
  employmentSpans = [],
  optStartDate,
  optEndDate,
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
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newIsCurrent, setNewIsCurrent] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmployer, setEditEmployer] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editIsCurrent, setEditIsCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [stats, setStats] = useState(EMPTY_EMPLOYMENT_STATS);

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
  const showComplianceNumbers = shouldShowUnemploymentComplianceNumbers(
    optStartDate,
    spanCount,
    ack
  );
  const notOnOptYet = ack === 'not_on_opt' && spanCount === 0;

  useEffect(() => {
    setStats(computeEmploymentStats(spans, optStartDate, optEndDate));
  }, [spans, optStartDate, optEndDate]);

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
    setEditStartDate(toEmploymentInputDate(span.start_date));
    setEditEndDate(toEmploymentInputDate(span.end_date));
    setEditIsCurrent(span.is_current ?? !span.end_date);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditEmployer('');
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
      className="scroll-mt-24 bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
            <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
          className="flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors w-full sm:w-auto"
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
        <div className="mx-4 mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
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
        <div className="px-4 pt-4 pb-2 border-t border-border bg-muted/30">
          <EmploymentSpanForm
            employer={newEmployer}
            startDate={newStartDate}
            endDate={newEndDate}
            isCurrent={newIsCurrent}
            saving={saving}
            formError={formError}
            employerInputRef={employerInputRef}
            submitLabel="Save Employment"
            onEmployerChange={setNewEmployer}
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
        <div className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
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
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
                  onEmployerChange={setEditEmployer}
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
              Show All ({sortedSpans.length}) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
