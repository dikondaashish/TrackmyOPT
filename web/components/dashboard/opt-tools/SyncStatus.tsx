"use client";

import { RefreshCw, CheckCircle2, AlertCircle, Mail } from "lucide-react";

interface SyncStatusProps {
  lastSynced: Date | null;
  isSyncing: boolean;
  error: string | null;
  email?: string;
  onSync?: () => void;
}

export function SyncStatus({ lastSynced, isSyncing, error, email, onSync }: SyncStatusProps) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Email Section */}
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {email}
          </span>
        </div>
      )}

      {/* Sync Status */}
      <div className="flex items-center gap-3">
        {isSyncing ? (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Syncing...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={onSync}
              className="text-sm font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : lastSynced ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Synced {getTimeAgo(lastSynced)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Not synced yet</span>
          </div>
        )}

        {/* Manual Sync Button */}
        {!isSyncing && onSync && (
          <button
            onClick={onSync}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Sync now"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
