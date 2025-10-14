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
      className={`bg-card border border-border rounded-xl p-6 transition-all ${
        available ? "hover:border-blue-600 cursor-pointer" : "opacity-60"
      }`}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ToolsGrid() {
  return (
    <div className="space-y-4">
      <h2>Your Toolkit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolCard icon={<span className="text-3xl">📝</span>} title="OPT Apply Start Dates" description="Calculate when you can start applying for OPT" available />
        <ToolCard icon={<span className="text-3xl">🎒</span>} title="STEM OPT Apply Start Dates" description="Calculate STEM OPT extension application dates" available />
        <ToolCard icon={<span className="text-3xl">⏱️</span>} title="OPT Clock Tracker" description="Track your unemployment days in real-time" available />
        <ToolCard icon={<span className="text-3xl">📅</span>} title="More Tools Coming" description="Stay tuned for additional OPT resources" available={false} />
      </div>
    </div>
  );
}

