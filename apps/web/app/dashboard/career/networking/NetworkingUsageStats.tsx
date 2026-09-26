'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Usage = {
  used: number;
  remaining: number;
  reserved?: number;
  limit?: number;
};

export function NetworkingUsageStats({ mode }: { mode: 'manual' | 'bundles' }) {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [failed, setFailed] = useState(false);
  const latest = useRef(0);
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const request = ++latest.current;
      try {
        const response = await fetch(
          `/api/career/networking/${mode === 'manual' ? 'draft' : 'bundles'}`,
          { cache: 'no-store', signal }
        );
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error('Usage unavailable');
        if (signal?.aborted || request !== latest.current) return;
        setUsage(body.data);
        setFailed(false);
      } catch {
        if (!signal?.aborted && request === latest.current) setFailed(true);
      }
    },
    [mode]
  );

  useEffect(() => {
    const controller = new AbortController();
    const reload = () => {
      void refresh(controller.signal);
    };
    const initial = window.setTimeout(reload, 0);
    const onFocus = () => {
      if (!document.hidden) reload();
    };
    window.addEventListener('networking-usage-updated', reload);
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(onFocus, 60_000);
    return () => {
      controller.abort();
      window.clearTimeout(initial);
      window.clearInterval(timer);
      window.removeEventListener('networking-usage-updated', reload);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const limit = usage?.limit ?? 15;
  const reserved = usage?.reserved ?? 0;
  const consumed = (usage?.used ?? 0) + reserved;
  return (
    <section
      aria-label="Networking daily usage"
      className="self-end rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:shrink-0"
    >
      <div className="min-w-[144px]">
        <p className="text-[10px] font-semibold uppercase leading-none tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Daily usage
        </p>
        {failed ? (
          <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
            Usage unavailable{' '}
            <button
              type="button"
              className="font-medium text-blue-600 underline dark:text-blue-400"
              onClick={() => void refresh()}
            >
              Retry
            </button>
          </div>
        ) : !usage ? (
          <p className="mt-1.5 text-xs text-slate-500" role="status">
            Loading usage…
          </p>
        ) : (
          <p
            className="mt-1.5 flex items-baseline justify-between gap-3 whitespace-nowrap"
            role="status"
            aria-label={`${consumed} of ${limit} daily requests used or in progress; ${usage.remaining} left today`}
          >
            <span
              className={`text-sm font-semibold leading-none ${consumed >= limit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-950 dark:text-white'}`}
            >
              {consumed}
              <span className="font-normal text-slate-400 dark:text-slate-500">
                {' '}
                / {limit}
              </span>
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {usage.remaining} left
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
