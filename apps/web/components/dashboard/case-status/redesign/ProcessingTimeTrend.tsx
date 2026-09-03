"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyTrendPoint } from "@/lib/community-opt/weekly-trend";
import type { CommunityCaseKind } from "@/lib/community-opt/types";
import { communityChartSegmentSuffix } from "@/lib/case-status/filing-category";
import { CHART } from "@/lib/community-opt/chart-theme";

interface ProcessingTimeTrendProps {
  points: WeeklyTrendPoint[];
  /** Highlights the bar for the week the user filed. */
  filedWeekStart?: string | null;
  premiumProcessing?: boolean;
  caseKind?: CommunityCaseKind;
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: WeeklyTrendPoint }>;
}) {
  const point = active ? payload?.[0]?.payload : null;
  if (!point) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">Filed week of {point.weekStart}</p>
      <p className="text-muted-foreground mt-1">
        Median <span className="font-semibold text-foreground">{point.medianDays}d</span> to
        approval
      </p>
      <p className="text-muted-foreground">
        Middle 50%: {point.p25Days}–{point.p75Days}d
      </p>
      <p className="text-muted-foreground">{point.sampleSize} reported cases</p>
    </div>
  );
}

export function ProcessingTimeTrend({
  points,
  filedWeekStart,
  premiumProcessing,
  caseKind = "initial_opt",
}: ProcessingTimeTrendProps) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Not enough resolved community cases yet to plot a weekly trend.
      </p>
    );
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const delta = last.medianDays - first.medianDays;
  const totalReports = points.reduce((sum, p) => sum + p.sampleSize, 0);

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-sm font-semibold text-foreground">
          Median processing time
        </h4>
        <span className="text-xs text-muted-foreground">
          {totalReports.toLocaleString()} reported cases
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Days from filing to approval, by week filed
        {communityChartSegmentSuffix({ caseKind, premiumProcessing })}
      </p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={CHART.grid}
            />
            <XAxis
              dataKey="label"
              stroke={CHART.axis}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickLine={false}
            />
            <YAxis
              stroke={CHART.axis}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}d`}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              // Wide enough for a three-digit day count plus its "d" suffix;
              // too narrow and recharts clips the leading digits, so "120d"
              // silently renders as "0d".
              width={44}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            {/* One series, so one hue — the reader's own week takes the second
                hue rather than a darker shade of the first, which reads as
                "more" rather than "yours". */}
            {/* No grow-in animation: the bars start at zero height, which
                recharts renders as nothing at all, and on a tab that mounts on
                click that leaves the chart briefly empty. The answer should be
                on screen the moment the tab is. */}
            <Bar
              dataKey="medianDays"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            >
              {points.map((p) => (
                <Cell
                  key={p.weekStart}
                  fill={p.weekStart === filedWeekStart ? CHART.you : CHART.series}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-1.5">
        {filedWeekStart &&
          points.some((p) => p.weekStart === filedWeekStart) && (
            <p className="text-xs text-muted-foreground">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5 align-middle"
                style={{ background: CHART.you }}
              />
              The highlighted bar is the week you filed.
            </p>
          )}
        {points.length >= 4 && (
          <p className="text-xs text-muted-foreground">
            {delta < -3
              ? `Trending faster — about ${Math.abs(delta)} days shorter than the earliest week shown.`
              : delta > 3
                ? `Trending slower — about ${delta} days longer than the earliest week shown.`
                : "Roughly stable across the period shown."}
          </p>
        )}
        {/* Method note only — the compliance notice is stated once for the
            whole analytics section rather than repeated per chart. */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Median shown, not average. Weeks with fewer than 5 reported approvals, and
          weeks too recent for their slower cases to have been decided, are excluded
          so the trend does not show a false speed-up.
        </p>
      </div>
    </div>
  );
}
