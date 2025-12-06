"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Users, Clock, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";

interface LiveStats {
  averageProcessingDays: number;
  previousAverage: number;
  recentApprovals: number;
  pendingCases: number;
  trend: 'faster' | 'slower' | 'stable';
  recentReports: Array<{
    id: string;
    timeline: string;
    status: 'approved' | 'pending' | 'rfe';
    timeAgo: string;
    center?: string;
  }>;
  alerts: Array<{
    type: 'delay' | 'surge' | 'info';
    message: string;
  }>;
  lastUpdated: Date;
}

interface LiveStatsWidgetProps {
  toolType: string;
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function LiveStatsWidget({ toolType, className = '', collapsed = false, onToggle }: LiveStatsWidgetProps) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Simulated API call - replace with actual Reddit/community API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isStem = toolType.includes('stem');
      const baseProcessing = isStem ? 85 : 45;
      const variance = Math.floor(Math.random() * 20) - 10;
      
      setStats({
        averageProcessingDays: baseProcessing + variance,
        previousAverage: baseProcessing,
        recentApprovals: Math.floor(Math.random() * 30) + 120,
        pendingCases: Math.floor(Math.random() * 300) + 800,
        trend: variance < -5 ? 'faster' : variance > 5 ? 'slower' : 'stable',
        recentReports: [
          { id: '1', timeline: '42 days', status: 'approved', timeAgo: '2h ago', center: 'Texas' },
          { id: '2', timeline: '58 days', status: 'approved', timeAgo: '4h ago', center: 'California' },
          { id: '3', timeline: '65 days', status: 'pending', timeAgo: '6h ago', center: 'Nebraska' },
          { id: '4', timeline: '38 days', status: 'approved', timeAgo: '8h ago', center: 'Texas' },
          { id: '5', timeline: 'RFE received', status: 'rfe', timeAgo: '12h ago', center: 'California' },
        ],
        alerts: variance > 5 ? [{ type: 'delay', message: 'Processing times slightly increased this week' }] : [],
        lastUpdated: new Date(),
      });
    } catch (err) {
      setError('Failed to load live stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toolType]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    if (!refreshing) fetchStats(true);
  };

  // Mobile collapsed view
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">Live Stats</span>
        <ChevronUp className="w-4 h-4 text-gray-500" />
      </button>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
          <div className="h-24 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 ${className}`}>
        <div className="text-center py-6">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const TrendIcon = stats.trend === 'faster' ? TrendingDown : stats.trend === 'slower' ? TrendingUp : Minus;
  const trendColor = stats.trend === 'faster' ? 'text-green-600' : stats.trend === 'slower' ? 'text-red-600' : 'text-amber-600';
  const trendText = stats.trend === 'faster' ? 'Faster than usual' : stats.trend === 'slower' ? 'Slower than usual' : 'Normal pace';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Live Processing Stats</h3>
        </div>
        <div className="flex items-center gap-2">
          {onToggle && (
            <button onClick={onToggle} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg lg:hidden">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Avg. Processing</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.averageProcessingDays}</p>
            <p className="text-xs text-blue-500 dark:text-blue-400">days</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Approvals</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.recentApprovals}</p>
            <p className="text-xs text-green-500 dark:text-green-400">this week</p>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Trend</span>
            <span className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              {trendText}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                stats.trend === 'faster' ? 'bg-green-500' : stats.trend === 'slower' ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: stats.trend === 'faster' ? '40%' : stats.trend === 'slower' ? '75%' : '55%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Based on {stats.pendingCases.toLocaleString()} pending cases
          </p>
        </div>

        {/* Alerts */}
        {stats.alerts.length > 0 && (
          <div className="space-y-2">
            {stats.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  alert.type === 'delay' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                  alert.type === 'surge' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Recent Reports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Community Reports</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    report.status === 'approved' ? 'bg-green-500' :
                    report.status === 'rfe' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{report.timeline}</p>
                    {report.center && <p className="text-xs text-gray-500">{report.center} Center</p>}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{report.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs text-gray-400">
          <span>Source: Reddit & Community</span>
          <span>Updated {stats.lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
