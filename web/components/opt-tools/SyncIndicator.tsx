"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Check, AlertCircle, Cloud, CloudOff } from "lucide-react";

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncIndicatorProps {
  status: SyncStatus;
  lastSynced: Date | null;
  onSync?: () => void;
  className?: string;
}

export function SyncIndicator({ status, lastSynced, onSync, className = '' }: SyncIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never synced';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSynced.getTime()) / 1000);
    
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastSynced.toLocaleDateString();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Sync Button */}
      <button
        onClick={onSync}
        disabled={status === 'syncing'}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Sync data"
      >
        <RefreshCw className={`w-4 h-4 text-gray-500 ${status === 'syncing' ? 'animate-spin' : ''}`} />
      </button>

      {/* Status Display */}
      <div className="flex items-center gap-2">
        {status === 'syncing' && (
          <>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Syncing...</span>
          </>
        )}
        
        {(status === 'success' || (status === 'idle' && showSuccess)) && (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Synced</span>
          </>
        )}
        
        {status === 'idle' && !showSuccess && (
          <>
            <Cloud className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last synced: {formatLastSynced()}
            </span>
          </>
        )}
        
        {status === 'error' && (
          <>
            <CloudOff className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Sync failed</span>
          </>
        )}
      </div>
    </div>
  );
}

// Toast notification component for sync feedback
interface SyncToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function SyncToast({ type, message, onClose }: SyncToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success' 
        ? 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800'
    }`}>
      {type === 'success' ? (
        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      )}
      <span className={`text-sm font-medium ${
        type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
      }`}>
        {message}
      </span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">×</button>
    </div>
  );
}

// Sync status bar for tool interfaces
interface SyncStatusBarProps {
  status: SyncStatus;
  lastSynced: Date | null;
  dataSource: string;
  onSync?: () => void;
}

export function SyncStatusBar({ status, lastSynced, dataSource, onSync }: SyncStatusBarProps) {
  const formatTime = () => {
    if (!lastSynced) return '--:--';
    return lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {status === 'syncing' ? (
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        ) : status === 'error' ? (
          <CloudOff className="w-4 h-4 text-red-500" />
        ) : (
          <Check className="w-4 h-4 text-green-500" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {status === 'syncing' ? 'Syncing data...' : status === 'error' ? 'Sync failed' : 'Data synced'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {dataSource} • {formatTime()}
          </p>
        </div>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          disabled={status === 'syncing'}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
