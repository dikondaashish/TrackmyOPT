'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import { US_STATES } from '@/lib/job-board/us-location';

export type PlaceOption = {
  /** `state:CA`, `city:San Francisco, CA` or `remote:us`. */
  key: string;
  kind: 'state' | 'city' | 'remote';
  label: string;
  count: number;
};

const KIND_LABEL: Record<PlaceOption['kind'], string> = {
  state: 'State',
  city: 'City',
  remote: 'Remote',
};

const POPULAR_STATES = 6;
const POPULAR_CITIES = 8;
const MAX_RESULTS = 60;

function fold(value: string) {
  return value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** "Remote (US)", the busiest states, then the busiest cities. */
export function popularPlaces(options: readonly PlaceOption[]): PlaceOption[] {
  const byCount = [...options].sort((left, right) => right.count - left.count);
  return [
    ...byCount.filter((option) => option.kind === 'remote'),
    ...byCount.filter((option) => option.kind === 'state').slice(0, POPULAR_STATES),
    ...byCount.filter((option) => option.kind === 'city').slice(0, POPULAR_CITIES),
  ];
}

/**
 * Places whose name, or whose state's name, contains the query. "tex" finds
 * Texas and its cities; names that start with the query come first.
 */
export function searchPlaces(options: readonly PlaceOption[], query: string): PlaceOption[] {
  const needle = fold(query);
  if (!needle) return [];
  const scored: Array<{ option: PlaceOption; rank: number }> = [];
  for (const option of options) {
    const label = fold(option.label);
    const stateCode = option.kind === 'city' ? option.label.slice(-2) : '';
    const stateName = fold(US_STATES[stateCode] || '');
    let rank = -1;
    if (label.startsWith(needle)) rank = 0;
    else if (label.split(/[\s,()-]+/).some((word) => word.startsWith(needle))) rank = 1;
    else if (stateName.startsWith(needle) || fold(stateCode) === needle) rank = 2;
    else if (label.includes(needle)) rank = 3;
    if (rank >= 0) scored.push({ option, rank });
  }
  return scored
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        (left.option.kind === 'state' ? 0 : 1) - (right.option.kind === 'state' ? 0 : 1) ||
        right.option.count - left.option.count,
    )
    .slice(0, MAX_RESULTS)
    .map(({ option }) => option);
}

/** Multi-select US location filter with search and a popular list. */
export function LocationPicker({
  options,
  value,
  onChange,
}: {
  options: readonly PlaceOption[];
  value: readonly string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const byKey = useMemo(() => new Map(options.map((option) => [option.key, option])), [options]);
  const selected = useMemo(() => new Set(value), [value]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (key: string) => {
    onChange(selected.has(key) ? value.filter((item) => item !== key) : [...value, key]);
  };

  const searching = query.trim().length > 0;
  const results = searching ? searchPlaces(options, query) : [];
  // Selected places stay at the top of the list so they can be unticked.
  const selectedOptions = value.map((key) => byKey.get(key)).filter((option): option is PlaceOption => Boolean(option));
  const popular = popularPlaces(options).filter((option) => !selected.has(option.key));
  const allStates = options
    .filter((option) => option.kind === 'state' && !selected.has(option.key))
    .sort((left, right) => left.label.localeCompare(right.label, 'en'));

  const first = selectedOptions[0]?.label;
  const buttonLabel = !first ? 'Location' : selectedOptions.length > 1 ? `${first} +${selectedOptions.length - 1}` : first;

  const row = (option: PlaceOption) => (
    <li key={option.key}>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
        <input
          type="checkbox"
          checked={selected.has(option.key)}
          onChange={() => toggle(option.key)}
          className="size-4 shrink-0 rounded border-slate-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-600"
        />
        <span className="min-w-0 flex-1 truncate">{option.label}</span>
        <span className="shrink-0 text-xs tabular-nums text-slate-400">{option.count.toLocaleString('en-US')}</span>
        <span className="w-14 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-center text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{KIND_LABEL[option.kind]}</span>
      </label>
    </li>
  );

  const section = (title: string, items: PlaceOption[]) => items.length > 0 && (
    <div className="py-1">
      <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <ul>{items.map(row)}</ul>
    </div>
  );

  return (
    <div ref={rootRef} className="relative min-w-0 max-w-full">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex min-h-11 max-w-56 items-center gap-1.5 rounded-lg border bg-white px-3 text-sm font-medium outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-slate-950 ${selectedOptions.length ? 'border-blue-300 text-blue-800 dark:border-blue-800 dark:text-blue-200' : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-100'}`}
      >
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className={`size-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={listId}
          role="dialog"
          aria-label="Choose US locations"
          className="absolute left-0 top-full z-30 mt-2 flex max-h-[min(28rem,70vh)] w-[22rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl max-sm:fixed max-sm:inset-x-4 max-sm:top-24 max-sm:mt-0 max-sm:w-auto dark:border-slate-700 dark:bg-slate-950"
        >
          <div className="border-b border-slate-100 p-2.5 dark:border-slate-800">
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-600/20 dark:border-slate-700">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="sr-only">Search US states and cities</span>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search states and cities…"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              {query && (
                <button type="button" aria-label="Clear location search" onClick={() => setQuery('')} className="rounded p-1 text-slate-400 hover:text-slate-700">
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
            {section('Selected', selectedOptions)}
            {searching ? (
              results.length ? section('Results', results.filter((option) => !selected.has(option.key))) : (
                <p className="px-3 py-6 text-center text-sm text-slate-500">No US jobs in “{query.trim()}”.</p>
              )
            ) : (
              <>
                {section('Popular', popular)}
                {section('All states', allStates)}
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-2 dark:border-slate-800">
            <button
              type="button"
              disabled={!value.length}
              onClick={() => onChange([])}
              className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
