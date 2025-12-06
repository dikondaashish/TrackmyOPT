"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface LiveStats {
  averageApprovalTime: number;
  recentApprovals: number;
  trend: 'faster' | 'slower' | 'stable';
  recentReports: {
    days: number;
    status: string;
    timestamp: string;
  }[];
  lastUpdated: Date;
}

export function LiveStatsWidget() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchStats = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    
    // Simulated data - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStats({
      averageApprovalTime: 87,
      recentApprovals: 15,
      trend: 'faster',
      recentReports: [
        { days: 45, status: 'Approved', timestamp: '2 hours ago' },
        { days: 62, status: 'Approved', timestamp: '5 hours ago' },
        { days: 78, status: 'RFE Received', timestamp: '1 day ago' },
        { days: 55, status: 'Approved', timestamp: '1 day ago' },
      ],
      lastUpdated: new Date(),
    });
    
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

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
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer lg:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Live Processing Stats</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); fetchStats(true); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="lg:hidden p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {stats && (
          <div className="p-4 space-y-5">
            {/* Average Time */}
            <div className="text-center py-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Approval Time</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.averageApprovalTime}</span>
                <span className="text-lg text-gray-500">days</span>
              </div>
              <div className={`flex items-center justify-center gap-1 mt-2 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{getTrendText()}</span>
              </div>
            </div>

            {/* Recent Approvals */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recent Approvals</span>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">{stats.recentApprovals} in 24h</span>
            </div>

            {/* Latest Reports */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Latest Reports</h4>
              <div className="space-y-2">
                {stats.recentReports.map((report, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {report.status === 'Approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">{report.days} days</span>
                    </div>
                    <span className="text-gray-500 text-xs">{report.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Last updated: {stats.lastUpdated.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Source: Reddit & Community Data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
