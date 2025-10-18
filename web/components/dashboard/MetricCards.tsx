"use client";
import { ArrowUp, ArrowDown, TrendingUp, Clock, Calendar, GraduationCap } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
}

function MetricCard({ title, value, change, isPositive, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {subtitle && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md mt-1 inline-block">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-card-foreground">{value}</p>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUp className="w-3 h-3 text-green-500" />
          ) : (
            <ArrowDown className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Days Until Filing Window"
        value="45"
        change="+0%"
        isPositive={true}
        subtitle="On Track"
        icon={<Calendar className="w-5 h-5" />}
      />
      <MetricCard
        title="Unemployment Days Used"
        value="0/90"
        change="+0"
        isPositive={true}
        icon={<Clock className="w-5 h-5" />}
      />
      <MetricCard
        title="Days Until OPT End"
        value="365"
        change="+0%"
        isPositive={true}
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <MetricCard
        title="STEM Extension Status"
        value="Eligible"
        change="+100%"
        isPositive={true}
        icon={<GraduationCap className="w-5 h-5" />}
      />
    </div>
  );
}

