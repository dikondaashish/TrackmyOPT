"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, GraduationCap, Timer, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickStats {
  nextDeadline: { label: string; days: number } | null;
  unemploymentStatus: { used: number; max: number } | null;
}

interface ToolCard {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const TOOLS: ToolCard[] = [
  {
    id: "opt-apply",
    title: "OPT Apply Dates",
    description: "Calculate your I-765 filing window and track important deadlines.",
    highlights: [
      "Filing window calculator",
      "Key deadline alerts",
      "90-day timeline view",
    ],
    icon: Calendar,
    href: "/dashboard/opt-tools/opt-apply",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "opt-clock",
    title: "OPT Clock Tracker",
    description: "Monitor your 90-day unemployment limit and stay compliant.",
    highlights: [
      "Real-time countdown",
      "Usage history log",
      "Compliance alerts",
    ],
    icon: Clock,
    href: "/dashboard/opt-tools/opt-clock",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "stem-apply",
    title: "STEM OPT Apply",
    description: "Plan your STEM extension filing and cap-gap protection.",
    highlights: [
      "24-month extension dates",
      "Cap-gap calculator",
      "E-Verify requirements",
    ],
    icon: GraduationCap,
    href: "/dashboard/opt-tools/stem-apply",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "stem-clock",
    title: "STEM Clock Tracker",
    description: "Track your 60-day STEM OPT unemployment limit.",
    highlights: [
      "60-day max tracker",
      "Daily usage log",
      "Status overview",
    ],
    icon: Timer,
    href: "/dashboard/opt-tools/stem-clock",
    gradient: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export function OptToolsSection() {
  const router = useRouter();
  const [, setStats] = useState<QuickStats>({ nextDeadline: null, unemploymentStatus: null });
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const response = await fetch('/api/opt-status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (data.status.program_end_date) {
            const programEnd = new Date(data.status.program_end_date);
            const mustArriveBy = new Date(programEnd);
            mustArriveBy.setDate(mustArriveBy.getDate() + 60);

            const daysUntil = Math.ceil((mustArriveBy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil > 0) {
              setStats(prev => ({
                ...prev,
                nextDeadline: { label: 'OPT Filing Deadline', days: daysUntil }
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-background flex flex-col">
      {/* Hero Section - Centered */}
      <div className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          {/* Badge */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                OPT Compliance
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70 mb-2">
            OPT Tools
          </h1>
          <p className="text-base text-muted-foreground">
            Calculate deadlines, track unemployment, and stay compliant
          </p>
        </div>
      </div>

      {/* Tool Cards Section - Fills remaining space */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col"
            >
              {/* Gradient top accent */}
              <div className={`h-1 bg-gradient-to-r ${tool.gradient}`} />

              <div className="p-4 flex flex-col flex-1">
                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 rounded-lg ${tool.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-4 flex-1">
                  {tool.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${tool.gradient}`} />
                      {highlight}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => router.push(tool.href)}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm bg-gradient-to-r ${tool.gradient} hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group/btn`}
                >
                  Open Tool
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${tool.gradient} transition-opacity duration-300 pointer-events-none`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
