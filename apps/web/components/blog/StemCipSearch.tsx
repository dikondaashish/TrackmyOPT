'use client';

import { useId, useMemo, useState } from 'react';
import {
  STEM_CIP_CODES,
  STEM_CIP_LIST_EDITION,
  STEM_CIP_LIST_URL,
  type StemCipCode,
} from '@/data/stem-cip-list';

export const MAX_STEM_CIP_RESULTS = 50;

/** Series that DHS designates as STEM at the two-digit level. */
const CORE_STEM_SERIES = new Set(['14', '26', '27', '40']);

const NUMERIC_QUERY = /^[\d.\s]+$/;

const digitsOnly = (value: string) => value.replace(/\D/g, '');

/**
 * Filters the STEM list by code or title. Codes match with or without the
 * dot ("11.0701", "110701" and "11.07" all find Computer Science); any other
 * text matches titles and codes case-insensitively.
 */
export function filterStemCipCodes(
  query: string,
  codes: readonly StemCipCode[] = STEM_CIP_CODES
): StemCipCode[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  if (NUMERIC_QUERY.test(trimmed)) {
    const digits = digitsOnly(trimmed);
    if (!digits) return [];
    return codes.filter((entry) => digitsOnly(entry.code).startsWith(digits));
  }
  return codes.filter(
    (entry) =>
      entry.title.toLowerCase().includes(trimmed) ||
      entry.code.includes(trimmed)
  );
}

export function StemCipSearch() {
  const inputId = useId();
  const statusId = useId();
  const [query, setQuery] = useState('');
  const matches = useMemo(() => filterStemCipCodes(query), [query]);
  const trimmed = query.trim();
  const isNumeric = trimmed !== '' && NUMERIC_QUERY.test(trimmed);
  const series = isNumeric ? digitsOnly(trimmed).slice(0, 2) : '';
  const isCoreSeries = series.length === 2 && CORE_STEM_SERIES.has(series);
  const shown = matches.slice(0, MAX_STEM_CIP_RESULTS);

  let status: string;
  if (!trimmed) {
    status = `Type a CIP code or a word from your major to search ${STEM_CIP_CODES.length} codes.`;
  } else if (matches.length === 0) {
    status = `No match on the ${STEM_CIP_LIST_EDITION} list.`;
  } else if (matches.length > shown.length) {
    status = `Showing ${shown.length} of ${matches.length} matches. Type more to narrow the list.`;
  } else {
    status = `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}.`;
  }

  return (
    <div className="not-prose border rounded-xl border-border p-5 bg-card shadow-card">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
      >
        CIP code or field of study
      </label>
      <input
        id={inputId}
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="For example 11.0701, 110701 or data science"
        aria-describedby={statusId}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="mt-3 text-sm text-gray-600 dark:text-gray-400"
      >
        {status}
      </p>
      {isCoreSeries ? (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          DHS designates the whole {series} series as STEM at the two-digit
          level, so any CIP code that starts with {series} counts, even if it is
          not printed on the list.
        </p>
      ) : null}
      {shown.length > 0 ? (
        <ul className="mt-3 divide-y divide-border border-t border-border">
          {shown.map((entry) => (
            <li key={entry.code} className="flex gap-4 py-2 text-sm">
              <span className="w-16 shrink-0 font-mono font-semibold text-gray-900 dark:text-white">
                {entry.code}
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {entry.title}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Source:{' '}
        <a
          href={STEM_CIP_LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          DHS STEM Designated Degree Program List (PDF)
        </a>
        , last updated {STEM_CIP_LIST_EDITION}. Your DSO and USCIS rely on the
        official list, not this search.
      </p>
    </div>
  );
}
