"use client";
import { Calendar, GraduationCap, Clock, Package } from "lucide-react";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
}

function ToolCard({ icon, title, description, available }: ToolCardProps) {
  return (
    <div
      className={`group bg-card border border-border rounded-xl p-6 transition-all duration-200 ${
        available 
          ? "hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] cursor-pointer" 
          : "opacity-50 cursor-not-allowed"
      }`}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
    >
      <div className="mb-4 transition-transform duration-200 group-hover:scale-110">{icon}</div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {available && (
        <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Open tool
          <svg className="w-3 h-3 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function ToolsGrid() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Your Toolkit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolCard icon={<span className="text-3xl">📝</span>} title="OPT Apply Start Dates" description="Calculate when you can start applying for OPT" available />
        <ToolCard icon={<span className="text-3xl">🎒</span>} title="STEM OPT Apply Start Dates" description="Calculate STEM OPT extension application dates" available />
        <ToolCard icon={<span className="text-3xl">⏱️</span>} title="OPT Clock Tracker" description="Track your unemployment days in real-time" available />
        <ToolCard icon={<span className="text-3xl">📅</span>} title="More Tools Coming" description="Stay tuned for additional OPT resources" available={false} />
      </div>
    </div>
  );
}

