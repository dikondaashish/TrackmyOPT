"use client";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle?: string;
}

function MetricCard({ title, value, change, isPositive, subtitle }: MetricCardProps) {
  return (
    <div className="group bg-card hover:bg-card/80 border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {subtitle && (
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {subtitle}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight mb-2 text-foreground">{value}</p>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <ArrowUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        )}
        <span className={`text-xs font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Days Until Filing Window"
        value="45"
        change="+0%"
        isPositive={true}
        subtitle="On Track"
      />
      <MetricCard
        title="Unemployment Days Used"
        value="0/90"
        change="+0"
        isPositive={true}
      />
      <MetricCard
        title="Days Until OPT End"
        value="365"
        change="+0%"
        isPositive={true}
      />
      <MetricCard
        title="STEM Extension Status"
        value="Eligible"
        change="+100%"
        isPositive={true}
      />
    </div>
  );
}

