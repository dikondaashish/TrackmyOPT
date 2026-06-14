"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, GraduationCap, Timer, TrendingUp, CheckCircle2, AlertCircle, Wrench, Shield, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickStats {
  nextDeadline: { label: string; days: number } | null;
  unemploymentStatus: { used: number; max: number } | null;
}

export function OptToolsSection() {
  const router = useRouter();
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

  const tools = [
    {
      title: "OPT Apply Dates",
      description: "Calculate your I-765 filing window and track important deadlines",
      icon: Calendar,
      href: "/dashboard/opt-tools/opt-apply",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      shadowColor: "shadow-blue-500/25",
      hoverShadow: "hover:shadow-blue-500/40",
    },
    {
      title: "OPT Clock Tracker",
      description: "Monitor your 90-day unemployment limit and stay compliant",
      icon: Clock,
      href: "/dashboard/opt-tools/opt-clock",
      gradient: "from-amber-500 via-orange-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
      hoverShadow: "hover:shadow-amber-500/40",
    },
    {
      title: "STEM OPT Apply",
      description: "Plan your STEM extension filing and cap-gap protection",
      icon: GraduationCap,
      href: "/dashboard/opt-tools/stem-apply",
      gradient: "from-emerald-500 via-green-500 to-teal-600",
      shadowColor: "shadow-emerald-500/25",
      hoverShadow: "hover:shadow-emerald-500/40",
    },
    {
      title: "STEM Clock Tracker",
      description: "Track your 60-day STEM OPT unemployment limit",
      icon: Timer,
      href: "/dashboard/opt-tools/stem-clock",
      gradient: "from-purple-500 via-violet-500 to-violet-600",
      shadowColor: "shadow-purple-500/25",
      hoverShadow: "hover:shadow-purple-500/40",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OPT Tools</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Calculate deadlines, track unemployment, and stay compliant
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        {!isLoading && stats.nextDeadline && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Upcoming Deadline</p>
                  <p className="font-bold text-xl">{stats.nextDeadline.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <span className="text-4xl font-bold tabular-nums">{stats.nextDeadline.days}</span>
                <span className="text-sm text-blue-100">days<br />remaining</span>
              </div>
            </div>
          </div>
        )}

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.href}
                onClick={() => router.push(tool.href)}
                className={`
                  group relative overflow-hidden rounded-3xl p-8 text-left text-white
                  bg-gradient-to-br ${tool.gradient}
                  shadow-xl ${tool.shadowColor} ${tool.hoverShadow}
                  hover:shadow-2xl transition-all duration-500
                  hover:scale-[1.02] hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2
                `}
              >
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 group-hover:scale-150 transition-transform duration-700"></div>

                {/* Shine sweep effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000"></div>

                {/* Floating particles */}
                <div className="absolute top-6 right-12 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-16 right-6 w-1.5 h-1.5 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-12 right-20 w-1 h-1 bg-white/25 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity" style={{ animationDelay: '0.4s' }}></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 mb-6 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 font-semibold">
                    <span>Open Tool</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Features Info - Premium Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Auto-Sync</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your dates sync automatically with OPT Dates page in real-time
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Community Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Self-reported OPT/STEM timelines from students — a planning reference, not official USCIS data
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Pro Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                9:00 AM ET emails before filing windows, unemployment limits, and STEM dates (Pro)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Stay Compliant with USCIS Requirements</p>
              <p className="text-sm text-gray-400">All calculations follow official USCIS guidelines and regulations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
