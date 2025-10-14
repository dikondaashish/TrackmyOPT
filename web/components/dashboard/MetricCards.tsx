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
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {subtitle}
          </span>
        )}
      </div>
      <p className="text-3xl mb-2">{value}</p>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <ArrowUp className="w-3 h-3 text-green-500" />
        ) : (
          <ArrowDown className="w-3 h-3 text-red-500" />
        )}
        <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
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

