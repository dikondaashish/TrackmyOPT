'use client';

import { useId } from 'react';
import { Search } from 'lucide-react';
import { EmployerSuggestionLogo } from '@/components/dashboard/opt/EmployerSuggestionLogo';
import {
  useEmployerNameSuggestions,
  type Company,
} from '@/components/dashboard/opt/useEmployerNameSuggestions';

export function CompanySearchInput({
  id,
  label,
  value,
  onChange,
  onSelect,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (company: Company) => void;
  required?: boolean;
}) {
  const listId = useId();
  const suggestions = useEmployerNameSuggestions(
    value,
    onChange,
    onSelect,
    'company'
  );

  return (
    <div className="relative min-w-0 space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-900 dark:text-white"
      >
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          role="combobox"
          required={required}
          maxLength={120}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={suggestions.expanded}
          aria-controls={suggestions.expanded ? listId : undefined}
          aria-activedescendant={
            suggestions.expanded && suggestions.active >= 0
              ? `${listId}-${suggestions.active}`
              : undefined
          }
          aria-describedby={`${listId}-status`}
          value={value}
          onChange={(event) => suggestions.onChange(event.target.value)}
          onBlur={suggestions.onBlur}
          onCompositionStart={suggestions.onCompositionStart}
          onCompositionEnd={(event) =>
            suggestions.onCompositionEnd(event.currentTarget.value)
          }
          onKeyDown={suggestions.onKeyDown}
          placeholder="Type a company name"
          className="w-full min-w-0 rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-base text-slate-950 placeholder:text-slate-500 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-950 sm:text-sm"
        />
      </div>
      {suggestions.expanded && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Company suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {suggestions.companies.map((company, index) => (
            <li
              key={company.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === suggestions.active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => suggestions.select(company)}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-900 hover:bg-blue-50 dark:text-white dark:hover:bg-slate-800 ${index === suggestions.active ? 'bg-blue-50 ring-1 ring-inset ring-blue-300 dark:bg-slate-800' : ''}`}
            >
              <EmployerSuggestionLogo
                name={company.name}
                domain={company.domain}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {company.name}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {company.domain}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p
        id={`${listId}-status`}
        role="status"
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        {suggestions.status}
      </p>
    </div>
  );
}
