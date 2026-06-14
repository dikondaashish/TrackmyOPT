"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Shield } from "lucide-react";
import Link from "next/link";
import type { EmploymentSpan } from "@/lib/immigration/optCalculations";
import {
  buildOptDistributionData,
  buildWeeklyUnemploymentTrend,
} from "@/lib/dashboard/chart-data";

export interface ChartsSectionProps {
  unemploymentDays?: number;
  maxUnemploymentDays?: number;
  optStartDate?: string | null;
  optEadEndDate?: string | null;
  stemStartDate?: string | null;
  stemEndDate?: string | null;
  employmentSpans?: EmploymentSpan[];
}

export function ChartsSection({
  unemploymentDays = 0,
  maxUnemploymentDays = 90,
  optStartDate,
  optEadEndDate,
  stemStartDate,
  stemEndDate,
  employmentSpans = [],
}: ChartsSectionProps) {
  const hasOptData = Boolean(optStartDate && optEadEndDate);

  const pieData = useMemo(
    () => buildOptDistributionData(unemploymentDays, maxUnemploymentDays),
    [unemploymentDays, maxUnemploymentDays]
  );

  const lineData = useMemo(() => {
    if (!hasOptData || !optStartDate || !optEadEndDate) {
      return [];
    }
    return buildWeeklyUnemploymentTrend(
      optStartDate,
      optEadEndDate,
      employmentSpans,
      stemStartDate,
      stemEndDate
    );
  }, [
    hasOptData,
    optStartDate,
    optEadEndDate,
    employmentSpans,
    stemStartDate,
    stemEndDate,
  ]);

  const pieTotal = pieData.reduce((sum, slice) => sum + slice.value, 0);

  if (!hasOptData) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">OPT charts</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your OPT dates to see unemployment distribution and weekly trends.
          </p>
          <Link
            href="/dashboard/opt"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Set up OPT dates
          </Link>
        </div>
        <ComplianceNote />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card hover:bg-card/80 border border-border rounded-xl p-6 transition-colors duration-200">
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-lg">Unemployment allowance</h3>
          <p className="text-sm text-muted-foreground">
            {unemploymentDays} of {maxUnemploymentDays} days used
          </p>
        </div>
        <div className="h-64 flex items-center justify-center">
          {pieTotal === 0 ? (
            <p className="text-sm text-muted-foreground">No unemployment days recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card hover:bg-card/80 border border-border rounded-xl p-6 transition-colors duration-200">
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-lg">Unemployment trend</h3>
          <p className="text-sm text-muted-foreground">Cumulative days used — last 7 days</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ComplianceNote />
    </div>
  );
}

function ComplianceNote() {
  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6 transition-colors duration-200">
      <div className="flex items-start gap-3">
        <Shield className="w-6 h-6 text-amber-700 dark:text-amber-300 shrink-0" aria-hidden />
        <div>
          <h3 className="mb-2 font-semibold text-lg text-amber-900 dark:text-amber-100">
            Stay Compliant
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200/80">
            Charts reflect your logged employment history. Always consult your DSO for official
            guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
