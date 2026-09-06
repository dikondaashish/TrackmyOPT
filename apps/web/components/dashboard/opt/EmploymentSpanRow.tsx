'use client';

import { Building2, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import {
  calculateEmploymentDuration,
  formatEmploymentDate,
  type EmploymentSpan,
} from './employment-history-helpers';

interface EmploymentSpanRowProps {
  span: EmploymentSpan;
  saving: boolean;
  onEdit: (span: EmploymentSpan) => void;
  onDelete: (id: string, employerName: string) => void;
}

export function EmploymentSpanRow({
  span,
  saving,
  onEdit,
  onDelete,
}: EmploymentSpanRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          span.is_current
            ? 'bg-emerald-100 dark:bg-emerald-900/30'
            : 'bg-muted'
        }`}
      >
        <Building2
          className={`w-5 h-5 ${
            span.is_current
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-medium text-sm truncate max-w-full">
            {span.employer_name}
          </h3>
          {span.is_current && (
            <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
              Current
            </span>
          )}
          <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
            <button
              type="button"
              onClick={() => onEdit(span)}
              className="text-[11px] text-primary hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(span.id, span.employer_name)}
              disabled={saving}
              className="text-[11px] text-red-600 hover:underline disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Delete
              </span>
            </button>
          </div>
        </div>
        {span.job_title && (
          <p className="text-xs text-muted-foreground mt-0.5">{span.job_title}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatEmploymentDate(span.start_date)} -{' '}
            {span.end_date ? formatEmploymentDate(span.end_date) : 'Present'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {calculateEmploymentDuration(span.start_date, span.end_date)}
          </span>
          {span.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {span.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
