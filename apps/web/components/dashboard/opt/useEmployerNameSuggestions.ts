'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

// Public browser identifier, NOT a Brand API secret. Brand Search requires
// direct browser requests. Never persist/cache its result list or proxy it.
const CLIENT_ID =
  process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || '1id3ID8l_yCrvOwwj-w';
const SEARCH_DELAY_MS = 300;
const SEARCH_TIMEOUT_MS = 8_000;
const MAX_SUGGESTIONS = 5;

export type Company = { id: string; name: string; domain: string };
type SearchState = {
  query: string;
  status: 'loading' | 'ready' | 'error';
  companies: Company[];
};

function normalizeCompanies(data: unknown): Company[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (item): item is { name: string; domain: string; brandId?: string } =>
        !!item &&
        typeof item.name === 'string' &&
        !!item.name.trim() &&
        typeof item.domain === 'string'
    )
    .slice(0, MAX_SUGGESTIONS)
    .map((item) => ({
      id:
        typeof item.brandId === 'string' && item.brandId
          ? item.brandId
          : `${item.name}\u0000${item.domain}`,
      name: item.name,
      domain: item.domain,
    }));
}

function statusMessage(
  visible: boolean,
  result: SearchState | null,
  count: number
): string {
  if (!visible) return '';
  if (result?.status === 'loading') return 'Searching companies…';
  if (result?.status === 'error')
    return 'Suggestions unavailable. You can still enter your employer name.';
  return count
    ? `${count} suggestions. Use arrow keys and Enter to select.`
    : 'No matches. You can keep the name you typed.';
}

export function useEmployerNameSuggestions(
  value: string,
  onChange: (value: string) => void,
  onSelect?: (company: Company) => void
) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState<SearchState | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controller = useRef<AbortController | null>(null);
  const composing = useRef(false);

  const cancel = useCallback(() => {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    controller.current?.abort();
  }, []);
  useEffect(() => cancel, [cancel]);

  const dismiss = useCallback(() => {
    cancel();
    setOpen(false);
    setActive(-1);
    setResult(null);
  }, [cancel]);

  const search = useCallback(
    (text: string) => {
      cancel();
      setActive(-1);
      setResult(null);
      const query = text.trim();
      const canSearch = query.length >= 3 && !composing.current;
      setOpen(canSearch);
      if (!canSearch) return;

      const version = generation.current;
      timer.current = setTimeout(async () => {
        const abort = new AbortController();
        controller.current = abort;
        setResult({ query, status: 'loading', companies: [] });
        const timeout = setTimeout(() => abort.abort(), SEARCH_TIMEOUT_MS);
        try {
          const url = new URL(
            `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}`
          );
          url.searchParams.set('c', CLIENT_ID);
          const response = await fetch(url.toString(), {
            signal: abort.signal,
            credentials: 'omit',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
          });
          if (!response.ok) throw new Error('Search unavailable');
          const companies = normalizeCompanies(await response.json());
          if (generation.current === version)
            setResult({ query, status: 'ready', companies });
        } catch {
          if (generation.current === version)
            setResult({ query, status: 'error', companies: [] });
        } finally {
          clearTimeout(timeout);
        }
      }, SEARCH_DELAY_MS);
    },
    [cancel]
  );

  const select = useCallback(
    (company: Company) => {
      onChange(company.name);
      onSelect?.(company);
      dismiss();
    },
    [dismiss, onChange, onSelect]
  );

  const visible = open && result?.query === value.trim();
  const companies = useMemo(
    () => (visible && result ? result.companies : []),
    [result, visible]
  );
  const expanded = Boolean(visible && companies.length);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing || composing.current) return;
      if (event.key === 'Escape' || event.key === 'Tab') {
        if (event.key === 'Escape' && open) event.preventDefault();
        dismiss();
        return;
      }
      if (expanded && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        setActive((current) =>
          event.key === 'ArrowDown'
            ? (current + 1) % companies.length
            : (current <= 0 ? companies.length : current) - 1
        );
        return;
      }
      if (expanded && event.key === 'Enter' && active >= 0) {
        event.preventDefault();
        select(companies[active]);
        return;
      }
      if (!open && event.key === 'ArrowDown') {
        event.preventDefault();
        search(value);
      }
    },
    [active, companies, dismiss, expanded, open, search, select, value]
  );

  return {
    active,
    companies,
    expanded,
    status: statusMessage(visible, result, companies.length),
    onBlur: dismiss,
    onChange: (text: string) => {
      onChange(text);
      search(text);
    },
    onCompositionEnd: (text: string) => {
      composing.current = false;
      search(text);
    },
    onCompositionStart: () => {
      composing.current = true;
      dismiss();
    },
    onKeyDown,
    select,
  };
}
