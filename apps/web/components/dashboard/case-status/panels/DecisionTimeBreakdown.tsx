'use client';

import { useState } from 'react';

type Group = { label: string; count: number };

/** The ring is a part-to-whole view; the visible table is its accessible equivalent. */
export function DecisionTimeBreakdown({
  distribution,
  total,
}: {
  distribution: Group[];
  total: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const valid =
    Number.isSafeInteger(total) &&
    total > 0 &&
    distribution.length > 0 &&
    distribution.length <= 5 &&
    distribution.every(
      (group) => Number.isSafeInteger(group.count) && group.count >= 0
    ) &&
    distribution.reduce((sum, group) => sum + group.count, 0) === total;

  if (!valid)
    return (
      <div className="py-6 text-sm text-muted-foreground">
        A complete decision-time breakdown is not available for this sample.
      </div>
    );

  const active = distribution.find((group) => group.label === selected);
  const share = (count: number) =>
    count === 0
      ? '0%'
      : count / total < 0.001
        ? '<0.1%'
        : `${((count / total) * 100).toFixed(1)}%`;

  return (
    <figure
      className="mt-6 border-t border-border pt-5"
      aria-label="Decision time distribution"
    >
      <figcaption>
        <h4 className="text-sm font-semibold text-foreground">
          When decisions were recorded
        </h4>
        <div className="mt-1 text-xs text-muted-foreground">
          Select a time range to highlight its share of the sample.
        </div>
      </figcaption>
      <div className="mt-4 grid items-center gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="flex flex-col items-center">
          <div className="relative h-[200px] w-[200px]">
            <svg
              viewBox="0 0 200 200"
              className="h-full w-full -rotate-90"
              aria-hidden="true"
              focusable="false"
            >
              {distribution.map((group, index) => (
                <circle
                  key={group.label}
                  cx="100"
                  cy="100"
                  r="82"
                  fill="none"
                  stroke={`var(--chart-seq-${index + 2})`}
                  strokeWidth="22"
                  pathLength="100"
                  strokeDasharray={`${(group.count / total) * 100} ${100 - (group.count / total) * 100}`}
                  strokeDashoffset={
                    -distribution
                      .slice(0, index)
                      .reduce(
                        (sum, item) => sum + (item.count / total) * 100,
                        0
                      )
                  }
                  opacity={!active || active.label === group.label ? 1 : 0.25}
                  className="motion-safe:transition-opacity motion-safe:duration-200"
                />
              ))}
            </svg>
            <div
              className="absolute inset-8 flex flex-col items-center justify-center text-center"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {active
                  ? share(active.count)
                  : total.toLocaleString('en-US', {
                      notation: total >= 1000000 ? 'compact' : 'standard',
                      maximumFractionDigits: 1,
                    })}
              </span>
              <span className="mt-1 text-xs font-medium text-muted-foreground">
                {active ? active.label : 'decided cases'}
              </span>
              {active && (
                <span className="mt-1 text-xs tabular-nums text-muted-foreground">
                  {active.count.toLocaleString()} cases
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={!active}
            onClick={() => setSelected(null)}
            className="min-h-11 rounded-md px-3 text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-muted-foreground disabled:no-underline dark:text-blue-300"
          >
            {active ? 'Show all time ranges' : 'All time ranges'}
          </button>
        </div>
        <table className="w-full table-fixed text-xs tabular-nums">
          <caption className="sr-only">
            Decision-time ranges, recorded case counts, and percentage of the
            complete sample. Percentages are rounded.
          </caption>
          <thead className="text-muted-foreground">
            <tr>
              <th scope="col" className="w-[46%] pb-2 text-left font-medium">
                Time to decision
              </th>
              <th scope="col" className="pb-2 text-right font-medium">
                Cases
              </th>
              <th scope="col" className="w-[22%] pb-2 text-right font-medium">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((group, index) => (
              <tr
                key={group.label}
                className={active?.label === group.label ? 'bg-muted/60' : ''}
              >
                <th scope="row" className="py-1 pr-3 text-left font-medium">
                  <button
                    type="button"
                    aria-pressed={active?.label === group.label}
                    onClick={() =>
                      setSelected(
                        active?.label === group.label ? null : group.label
                      )
                    }
                    className="flex min-h-11 w-full flex-col justify-center gap-1.5 rounded-md py-1 text-left text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-sm border border-border"
                        style={{ background: `var(--chart-seq-${index + 2})` }}
                      />
                      {group.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="block h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(group.count / total) * 100}%`,
                          background: 'var(--chart-seq-5)',
                        }}
                      />
                    </span>
                  </button>
                </th>
                <td className="text-right font-medium text-foreground">
                  {group.count.toLocaleString()}
                </td>
                <td className="text-right text-muted-foreground">
                  {share(group.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Ring and bars show the same sample. Shares are rounded, not approval
        probabilities.
      </div>
    </figure>
  );
}
