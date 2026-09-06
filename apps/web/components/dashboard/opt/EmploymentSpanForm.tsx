'use client';

import type { RefObject } from 'react';

interface EmploymentSpanFormProps {
  employer: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  saving: boolean;
  formError?: string | null;
  employerInputRef?: RefObject<HTMLInputElement | null>;
  submitLabel: string;
  onEmployerChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onIsCurrentChange: (checked: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function EmploymentSpanForm({
  employer,
  startDate,
  endDate,
  isCurrent,
  saving,
  formError,
  employerInputRef,
  submitLabel,
  onEmployerChange,
  onStartDateChange,
  onEndDateChange,
  onIsCurrentChange,
  onCancel,
  onSubmit,
}: EmploymentSpanFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Employer Name
          </label>
          <input
            ref={employerInputRef}
            type="text"
            value={employer}
            onChange={(e) => onEmployerChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
            placeholder="Company Inc."
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Start Date (MM/DD/YYYY)
          </label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
            placeholder="08/01/2025"
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            End Date (optional)
          </label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={isCurrent}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background disabled:opacity-50"
            placeholder="MM/DD/YYYY"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => onIsCurrentChange(e.target.checked)}
          className="rounded border-border"
        />
        <span>I currently work here</span>
      </label>
      {formError && (
        <p className="text-xs text-red-500 font-medium">{formError}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
