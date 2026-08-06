"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistogramBin, ProcessingHistogram } from "@/lib/community-opt/estimate";

interface ProcessingTimeDistributionProps {
  histogram: ProcessingHistogram | null;
  /** Days since the user filed, used to mark where they currently sit. */
  daysSinceFiled?: number;
  premiumProcessing?: boolean;
}

function DistributionTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: HistogramBin }>;
  total: number;
}) {
  const bin = active ? payload?.[0]?.payload : null;
  if (!bin) return null;
  const share = total ? Math.round((bin.count / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">
        {bin.from}–{bin.to} days
      </p>
      <p className="text-muted-foreground mt-1">
        <span className="font-semibold text-foreground">{bin.count}</span> approved
        {share > 0 ? ` · ${share}% of reports` : ""}
      </p>
    </div>
  );
}

export function ProcessingTimeDistribution({
  histogram,
  daysSinceFiled = 0,
  premiumProcessing,
}: ProcessingTimeDistributionProps) {
  if (!histogram) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Not enough matched community reports yet to show a distribution.
      </p>
    );
  }

  const { bins, totalCases, medianDays } = histogram;
  const medianBin = bins.find((b) => medianDays >= b.from && medianDays <= b.to);
  const userBin =
    daysSinceFiled > 0
      ? bins.find((b) => daysSinceFiled >= b.from && daysSinceFiled <= b.to)
      : undefined;

  // Share of reported cases already decided by the time the user has waited.
  const decidedByNow = daysSinceFiled
    ? bins.reduce((sum, b) => (b.to <= daysSinceFiled ? sum + b.count : sum), 0)
    : 0;
  const decidedShare = Math.round((decidedByNow / totalCases) * 100);

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-sm font-semibold text-foreground">
          Processing time distribution
        </h4>
        <span className="text-xs text-muted-foreground">
          {totalCases.toLocaleString()} reported cases
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        How many cases were approved within each time range
        {premiumProcessing !== undefined
          ? premiumProcessing
            ? " · premium processing cases"
            : " · regular (non-PP) cases"
          : ""}
      </p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
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
              minTickGap={16}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 10 }}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<DistributionTooltip total={totalCases} />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            {medianBin && (
              <ReferenceLine
                x={medianBin.label}
                stroke="#f59e0b"
                strokeDasharray="4 3"
                label={{
                  value: `median ${medianDays}d`,
                  position: "top",
                  fontSize: 10,
                  fill: "#b45309",
                }}
              />
            )}
            <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {bins.map((bin) => (
                <Cell
                  key={bin.from}
                  fill={userBin && bin.from === userBin.from ? "#2563eb" : "#3b82f6"}
                  fillOpacity={userBin && bin.from !== userBin.from ? 0.55 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-1.5">
        {userBin && (
          <p className="text-xs text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-sm bg-blue-600 mr-1.5 align-middle" />
            You are {daysSinceFiled} days in — {decidedShare}% of reported cases like
            yours were approved by this point.
          </p>
        )}
        {!userBin && daysSinceFiled > 0 && (
          <p className="text-xs text-muted-foreground">
            You are {daysSinceFiled} days in, beyond the range most reported cases fall
            into. Cases do run longer than this; the community data thins out here.
          </p>
        )}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Community-reported timelines from partner datasets · 7-day ranges · only filing
          weeks old enough for their slower cases to have been decided are counted, so the
          long tail is not undercounted. Not affiliated with USCIS, not an official
          processing time, and not a prediction of your case.
        </p>
      </div>
    </div>
  );
}
