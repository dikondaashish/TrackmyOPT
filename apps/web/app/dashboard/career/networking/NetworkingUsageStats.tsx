'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';

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
  const percentage = Math.min(100, Math.max(0, (consumed / limit) * 100));
  const label = mode === 'manual' ? 'AI draft requests' : 'Outreach bundles';
  return (
    <section
      aria-label="Networking daily usage"
      className="ml-auto shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex w-[168px] flex-col gap-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] font-semibold uppercase leading-none tracking-wide text-gray-400 dark:text-gray-500">
            Daily Usage
          </span>
          {!failed && usage && (
            <span className="text-[9px] text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        {failed ? (
          <div className="text-xs text-gray-500">
            Usage unavailable{' '}
            <button
              className="text-blue-600 underline dark:text-blue-400"
              onClick={() => void refresh()}
            >
              Retry
            </button>
          </div>
        ) : !usage ? (
          <span className="text-xs text-gray-500" role="status">
            Loading usage…
          </span>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono leading-none">
                <span
                  className={`text-xs font-bold ${consumed >= limit ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
                >
                  {consumed}
                </span>
                <span className="text-[9px] text-gray-400"> / {limit}</span>
              </span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400">
                {usage.remaining} left today
              </span>
            </div>
            <Progress
              value={percentage}
              aria-label={`${consumed} of ${limit} ${label.toLowerCase()} used today`}
              className={`h-1 ${percentage >= 100 ? 'bg-red-100 [&>div]:bg-red-600' : percentage >= 80 ? 'bg-amber-100 [&>div]:bg-amber-500' : 'bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-600'}`}
            />
            <span className="text-[9px] text-gray-500 dark:text-gray-400">
              {label}
              {reserved > 0 ? ` · ${reserved} in progress` : ''} · Resets 00:00
              UTC
            </span>
          </>
        )}
      </div>
    </section>
  );
}
