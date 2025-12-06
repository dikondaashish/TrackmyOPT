"use client";

import { RefreshCw, CheckCircle2, AlertCircle, Cloud, CloudOff } from "lucide-react";

interface SyncStatusProps {
  lastSynced: Date | null;
  isSyncing: boolean;
  error: string | null;
  onSync?: () => void;
}

export function SyncStatus({ lastSynced, isSyncing, error, onSync }: SyncStatusProps) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  // Don't show anything if not synced yet and no error (initial state)
  if (!lastSynced && !error && !isSyncing) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Sync Status */}
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Syncing...</p>
              <p className="text-xs text-gray-500">Saving to cloud</p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <CloudOff className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Sync failed</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          </>
        ) : lastSynced ? (
          <>
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Saved to cloud</p>
              <p className="text-xs text-gray-500">{getTimeAgo(lastSynced)}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Sync Button */}
      {onSync && (
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
        >
          {error ? 'Retry' : 'Sync'}
        </button>
      )}
    </div>
  );
}
