'use client';

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';

// Public browser identifier, NOT a Brand API secret. Brand Search requires
// direct browser requests. Never persist/cache its result list or proxy it.
const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || '1id3ID8l_yCrvOwwj-w';
type Company = { name: string; domain: string };
type SearchState = { query: string; status: 'loading' | 'ready' | 'error'; companies: Company[] };

export function EmployerNameInput({ value, onChange, inputRef }: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const id = useId();
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

  function dismiss() { cancel(); setOpen(false); setActive(-1); setResult(null); }
  function select(company: Company) { onChange(company.name); dismiss(); }
  function search(text: string) {
    cancel(); setActive(-1); setResult(null);
    const query = text.trim();
    const eligible = query.length >= 3 && !composing.current;
    setOpen(eligible);
    if (!eligible) return;
    const version = generation.current;
    timer.current = setTimeout(async () => {
      const abort = new AbortController();
      controller.current = abort;
      setResult({ query, status: 'loading', companies: [] });
      const timeout = setTimeout(() => abort.abort(), 8000);
      try {
        const url = new URL(`https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}`);
        url.searchParams.set('c', CLIENT_ID);
        const response = await fetch(url.toString(), {
          signal: abort.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
        });
        if (!response.ok) throw new Error('Search unavailable');
        const data: unknown = await response.json();
        const companies = (Array.isArray(data) ? data : []).filter((item): item is Company =>
          !!item && typeof item.name === 'string' && !!item.name.trim() && typeof item.domain === 'string'
        ).slice(0, 5);
        if (generation.current === version) setResult({ query, status: 'ready', companies });
      } catch {
        if (generation.current === version) setResult({ query, status: 'error', companies: [] });
      } finally { clearTimeout(timeout); }
    }, 300);
  }

  const visible = open && result?.query === value.trim();
  const companies = visible ? result.companies : [];
  const expanded = !!visible && companies.length > 0;
  const status = !visible ? '' : result.status === 'loading' ? 'Searching companies…'
    : result.status === 'error' ? 'Suggestions unavailable. You can still enter your employer name.'
    : companies.length ? `${companies.length} suggestions. Use arrow keys and Enter to select.`
    : 'No matches. You can keep the name you typed.';

  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1">Employer Name</label>
      <input
        id={id} ref={inputRef} type="text" role="combobox" autoComplete="off"
        aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? `${id}-list` : undefined}
        aria-activedescendant={expanded && active >= 0 ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-help ${id}-status`}
        value={value} placeholder="Type a company name"
        onChange={e => { onChange(e.target.value); search(e.target.value); }}
        onBlur={dismiss}
        onCompositionStart={() => { composing.current = true; dismiss(); }}
        onCompositionEnd={e => { composing.current = false; search(e.currentTarget.value); }}
        onKeyDown={e => {
          if (e.nativeEvent.isComposing || composing.current) return;
          if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape' && open) e.preventDefault(); dismiss(); }
          else if (expanded && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            setActive(current => e.key === 'ArrowDown' ? (current + 1) % companies.length : (current <= 0 ? companies.length : current) - 1);
          } else if (expanded && e.key === 'Enter' && active >= 0) { e.preventDefault(); select(companies[active]); }
          else if (!open && e.key === 'ArrowDown') { e.preventDefault(); search(value); }
        }}
        className="w-full min-h-11 px-3 py-2 text-base sm:text-sm border border-border rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
      {expanded && (
        <ul id={`${id}-list`} role="listbox" aria-label="Company suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg">
          {companies.map((company, index) => (
            <li key={`${company.domain}-${index}`} id={`${id}-option-${index}`} role="option" aria-selected={index === active}
              onMouseDown={e => e.preventDefault()} onClick={() => select(company)}
              className={`min-h-11 cursor-pointer rounded-md px-3 py-2 text-sm transition-colors motion-reduce:transition-none hover:bg-muted ${index === active ? 'bg-primary/10 text-foreground ring-1 ring-inset ring-primary/30' : 'text-foreground'}`}>
              <span className="block break-words font-medium">{company.name}</span>
              <span className="block break-all text-xs text-muted-foreground">{company.domain}</span>
            </li>
          ))}
        </ul>
      )}
      <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">Search by Brandfetch · Or enter the legal employer name.</p>
      <p id={`${id}-status`} role="status" className={expanded ? 'sr-only' : 'mt-1 text-xs text-muted-foreground'}>{status}</p>
    </div>
  );
}
