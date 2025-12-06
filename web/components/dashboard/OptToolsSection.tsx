"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, GraduationCap, Timer, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { ToolCard } from "./opt-tools/ToolCard";

interface QuickStats {
  nextDeadline: { label: string; days: number } | null;
  unemploymentStatus: { used: number; max: number } | null;
}

export function OptToolsSection() {
  const [stats, setStats] = useState<QuickStats>({ nextDeadline: null, unemploymentStatus: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const response = await fetch('/api/opt-status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // Calculate quick stats from OPT data
        if (data.status) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Calculate next deadline
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

  const tools = [
    {
      title: "OPT Apply Dates",
      description: "Calculate your OPT filing window and track important deadlines. Know exactly when to submit your I-765.",
      icon: <Calendar className="w-7 h-7 text-blue-600" />,
      href: "/dashboard/opt-tools/opt-apply",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "OPT Clock Tracker",
      description: "Monitor your 90-day unemployment limit. Track employment periods and stay compliant with USCIS rules.",
      icon: <Clock className="w-7 h-7 text-amber-600" />,
      href: "/dashboard/opt-tools/opt-clock",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "STEM OPT Apply",
      description: "Plan your STEM extension filing. Calculate cap-gap protection and ensure timely submission.",
      icon: <GraduationCap className="w-7 h-7 text-green-600" />,
      href: "/dashboard/opt-tools/stem-apply",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "STEM Clock Tracker",
      description: "Track your 150-day aggregate unemployment limit for STEM OPT, including prior OPT unemployment.",
      icon: <Timer className="w-7 h-7 text-purple-600" />,
      href: "/dashboard/opt-tools/stem-clock",
      gradient: "bg-gradient-to-br from-purple-500 to-violet-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OPT Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Calculate deadlines, track unemployment, and stay compliant with all OPT requirements
        </p>
      </div>

      {/* Quick Stats Banner */}
      {!isLoading && stats.nextDeadline && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Upcoming Deadline</p>
                <p className="font-bold text-lg">{stats.nextDeadline.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <span className="text-3xl font-bold">{stats.nextDeadline.days}</span>
              <span className="text-sm opacity-90">days left</span>
            </div>
          </div>
        </div>
      )}

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.href}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            href={tool.href}
            gradient={tool.gradient}
            iconBg={tool.iconBg}
          />
        ))}
      </div>

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-gray-900 dark:text-white">Auto-Sync</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your dates sync automatically with OPT Dates page
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-gray-900 dark:text-white">Live Stats</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See real-time community approval data
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-gray-900 dark:text-white">Smart Alerts</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get notified about approaching deadlines
          </p>
        </div>
      </div>
    </div>
  );
}
