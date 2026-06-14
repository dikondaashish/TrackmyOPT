"use client";

import { useState, useEffect } from "react";
import { COMMUNITY_REPORTS_MESSAGING } from "@/lib/messaging/product-copy";
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Briefcase, FileText, Upload, BarChart3 } from "lucide-react";

type ToolType = 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';

interface LiveStats {
  mainStat: { value: number; label: string; unit: string };
  secondaryStat: { value: number; label: string };
  trend: 'faster' | 'slower' | 'stable';
  recentReports: {
    value: number;
    label: string;
    timestamp: string;
    positive: boolean;
  }[];
  lastUpdated: Date;
}

interface LiveStatsWidgetProps {
  toolType?: ToolType;
}

const TOOL_CONFIGS: Record<ToolType, {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  mainStatLabel: string;
  mainStatUnit: string;
  secondaryLabel: string;
  reportLabel: string;
}> = {
  'opt-apply': {
    title: 'OPT Approval Stats',
    icon: <Clock className="w-4 h-4 text-white" />,
    gradient: 'from-blue-500 to-indigo-600',
    mainStatLabel: 'Average Approval Time',
    mainStatUnit: 'days',
    secondaryLabel: 'Approvals in 24h',
    reportLabel: 'days to approval',
  },
  'opt-clock': {
    title: 'Employment Stats',
    icon: <Briefcase className="w-4 h-4 text-white" />,
    gradient: 'from-amber-500 to-orange-600',
    mainStatLabel: 'Avg. Time to Find Job',
    mainStatUnit: 'days',
    secondaryLabel: 'Found jobs this week',
    reportLabel: 'days to employment',
  },
  'stem-apply': {
    title: 'STEM Approval Stats',
    icon: <FileText className="w-4 h-4 text-white" />,
    gradient: 'from-green-500 to-emerald-600',
    mainStatLabel: 'Average Approval Time',
    mainStatUnit: 'days',
    secondaryLabel: 'Approvals in 24h',
    reportLabel: 'days to approval',
  },
  'stem-clock': {
    title: 'Document Upload Stats',
    icon: <Upload className="w-4 h-4 text-white" />,
    gradient: 'from-purple-500 to-violet-600',
    mainStatLabel: 'Avg. Document Upload',
    mainStatUnit: 'days',
    secondaryLabel: 'Uploads this week',
    reportLabel: 'days to upload docs',
  },
};



export function LiveStatsWidget({ toolType = 'opt-apply' }: LiveStatsWidgetProps) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const config = TOOL_CONFIGS[toolType];

  const fetchStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);

      const response = await fetch('/api/opt/community-stats');
      if (response.ok) {
        const data = await response.json();
        const toolData = data[toolType];
        if (toolData) {
          toolData.lastUpdated = new Date(toolData.lastUpdated);
          setStats(toolData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchStats();
    const interval = setInterval(() => fetchStats(), 300000); // 5 minutes
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolType]);

  const getTrendIcon = () => {
    if (!stats) return null;
    switch (stats.trend) {
      case 'faster': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'slower': return <TrendingUp className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    if (!stats) return '';
    switch (stats.trend) {
      case 'faster': return 'Faster than usual';
      case 'slower': return 'Slower than usual';
      default: return 'Normal pace';
    }
  };

  const getTrendColor = () => {
    if (!stats) return 'text-gray-500';
    switch (stats.trend) {
      case 'faster': return 'text-green-600 dark:text-green-400';
      case 'slower': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 bg-gradient-to-r ${config.gradient} cursor-pointer lg:cursor-default`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-white">{config.title}</h3>
            <p className="text-xs text-white/70">{COMMUNITY_REPORTS_MESSAGING.sectionSubhead}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); fetchStats(true); }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="lg:hidden p-1 text-white">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {stats && (
          <div className="p-4 space-y-4">
            {/* Main Stat */}
            <div className="text-center py-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stats.mainStat.label}</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">{stats.mainStat.value}</span>
                <span className="text-lg text-gray-500">{stats.mainStat.unit}</span>
              </div>
              <div className={`flex items-center justify-center gap-1 mt-3 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{getTrendText()}</span>
              </div>
            </div>

            {/* Secondary Stat */}
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.secondaryStat.label}</span>
              </div>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">{stats.secondaryStat.value}</span>
            </div>

            {/* Latest Reports */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {COMMUNITY_REPORTS_MESSAGING.sectionTitle}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {COMMUNITY_REPORTS_MESSAGING.sourceNote}
              </p>
              <div className="space-y-2">
                {stats.recentReports.map((report, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      {report.positive ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{report.value}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">{report.label}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">{report.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Last updated: {stats.lastUpdated.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-400 text-center mt-1 flex items-center justify-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Source: Reddit & Community Data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
