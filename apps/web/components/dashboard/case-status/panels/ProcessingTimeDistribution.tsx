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
import type { CommunityCaseKind } from "@/lib/community-opt/types";
import { communityChartSegmentSuffix } from "@/lib/case-status/filing-category";
import { CHART } from "@/lib/community-opt/chart-theme";

interface ProcessingTimeDistributionProps {
  histogram: ProcessingHistogram | null;
  /** Days since the user filed, used to mark where they currently sit. */
  daysSinceFiled?: number;
  premiumProcessing?: boolean;
  caseKind?: CommunityCaseKind;
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
  caseKind = "initial_opt",
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
        {communityChartSegmentSuffix({ caseKind, premiumProcessing })}
      </p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {/* Top margin leaves room for the median reference label, which is
              drawn above the plot area and is otherwise clipped away. */}
          <BarChart data={bins} margin={{ top: 18, right: 4, bottom: 0, left: 0 }}>
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
              minTickGap={16}
              tickLine={false}
            />
            <YAxis
              stroke={CHART.axis}
              tick={{ fontSize: 10 }}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              // Room for a three-digit count; a narrower axis clips the
              // leading digits rather than shrinking the label.
              width={36}
            />
            <Tooltip
              content={<DistributionTooltip total={totalCases} />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            {medianBin && (
              <ReferenceLine
                x={medianBin.label}
                stroke={CHART.axis}
                strokeDasharray="4 3"
                label={{
                  value: `median ${medianDays}d`,
                  position: "top",
                  fontSize: 10,
                  fill: CHART.axis,
                }}
              />
            )}
            {/* One hue for every bin, with the reader's own bin in the reserved
                second hue — so the bar that matters is found without hunting. */}
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            >
              {bins.map((bin) => {
                const isUser = userBin && bin.from === userBin.from;
                return (
                  <Cell
                    key={bin.from}
                    fill={isUser ? CHART.you : CHART.series}
                    fillOpacity={userBin && !isUser ? 0.45 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-1.5">
        {userBin && (
          <p className="text-xs text-muted-foreground">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5 align-middle"
              style={{ background: CHART.you }}
            />
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
        {/* Method note only — the compliance notice is stated once for the
            whole analytics section rather than repeated per chart. */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          7-day ranges. Only filing weeks old enough for their slower cases to have
          been decided are counted, so the long tail is not undercounted.
        </p>
      </div>
    </div>
  );
}
