'use client';

import { useId, type RefObject } from 'react';
import { EmployerSuggestionLogo } from './EmployerSuggestionLogo';
import {
  useEmployerNameSuggestions,
  type Company,
} from './useEmployerNameSuggestions';

export function EmployerNameInput({
  value,
  onChange,
  inputRef,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSelect?: (company: Company) => void;
}) {
  const id = useId();
  const suggestions = useEmployerNameSuggestions(value, onChange, onSelect);

  return (
    <div className="relative min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-muted-foreground"
      >
        Employer Name
      </label>
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={suggestions.expanded}
        aria-controls={suggestions.expanded ? `${id}-list` : undefined}
        aria-activedescendant={
          suggestions.expanded && suggestions.active >= 0
            ? `${id}-option-${suggestions.active}`
            : undefined
        }
        aria-describedby={`${id}-help ${id}-status`}
        value={value}
        placeholder="Type a company name"
        onChange={(event) => suggestions.onChange(event.target.value)}
        onBlur={suggestions.onBlur}
        onCompositionStart={suggestions.onCompositionStart}
        onCompositionEnd={(event) =>
          suggestions.onCompositionEnd(event.currentTarget.value)
        }
        onKeyDown={suggestions.onKeyDown}
        className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm"
      />
      {suggestions.expanded && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label="Company suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          {suggestions.companies.map((company, index) => (
            <li
              key={company.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === suggestions.active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => suggestions.select(company)}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm outline-none transition-[background-color,box-shadow] motion-reduce:transition-none hover:bg-primary/[0.05] ${index === suggestions.active ? 'bg-primary/10 text-foreground ring-1 ring-inset ring-primary/30' : 'text-foreground'}`}
            >
              <EmployerSuggestionLogo
                name={company.name}
                domain={company.domain}
              />
              <span className="min-w-0">
                <span className="block break-words font-semibold">
                  {company.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {company.domain}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
        Search by Brandfetch · Or enter the legal employer name.
      </p>
      <p
        id={`${id}-status`}
        role="status"
        className={
          suggestions.expanded
            ? 'sr-only'
            : 'mt-1 text-xs text-muted-foreground'
        }
      >
        {suggestions.status}
      </p>
    </div>
  );
}
