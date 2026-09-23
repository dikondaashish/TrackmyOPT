'use client';

import { useId, type RefObject } from 'react';
import { EmployerNameInput } from './EmployerNameInput';
import { normalizeCompanyDomain } from '@/lib/company-domain';

interface EmploymentSpanFormProps {
  employer: string;
  employerDomain?: string;
  onEmployerDomainChange?: (value: string) => void;
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
  employerDomain = '',
  onEmployerDomainChange,
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
  const websiteId = useId();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[180px]">
          <EmployerNameInput
            inputRef={employerInputRef}
            value={employer}
            onChange={onEmployerChange}
            onSelect={(company) =>
              onEmployerDomainChange?.(
                normalizeCompanyDomain(company.domain) || ''
              )
            }
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
      {onEmployerDomainChange && (
        <div>
          <label
            htmlFor={websiteId}
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Company website (optional)
          </label>
          <input
            id={websiteId}
            type="text"
            inputMode="url"
            autoComplete="off"
            value={employerDomain}
            onChange={(event) => onEmployerDomainChange(event.target.value)}
            aria-describedby={`${websiteId}-help`}
            placeholder="example.com"
            className="w-full min-h-11 px-3 py-2 text-sm border border-border rounded-md bg-background"
          />
          <p
            id={`${websiteId}-help`}
            className="mt-1 text-xs text-muted-foreground"
          >
            Used for the company logo. Confirm the website before saving.
          </p>
        </div>
      )}
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
