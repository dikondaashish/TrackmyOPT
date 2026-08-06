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

interface ProcessingTimeTrendProps {
  points: WeeklyTrendPoint[];
  /** Highlights the bar for the week the user filed. */
  filedWeekStart?: string | null;
  premiumProcessing?: boolean;
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
        {premiumProcessing !== undefined
          ? premiumProcessing
            ? " · premium processing cases"
            : " · regular (non-PP) cases"
          : ""}
      </p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}d`}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            <Bar dataKey="medianDays" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {points.map((p) => (
                <Cell
                  key={p.weekStart}
                  fill={p.weekStart === filedWeekStart ? "#2563eb" : "#10b981"}
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
              <span className="inline-block w-2 h-2 rounded-sm bg-blue-600 mr-1.5 align-middle" />
              Blue bar is the week you filed.
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
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Community-reported timelines from partner datasets · median shown, not average ·
          weeks with fewer than 5 reported approvals, and weeks too recent for their slower
          cases to have been decided, are excluded so the trend does not show a false
          speed-up. Not affiliated with USCIS, not an official processing time, and not a
          prediction of your case.
        </p>
      </div>
    </div>
  );
}
