'use client';

/**
 * Document Card Component
 * 
 * Individual document display with:
 * - Document type icon
 * - Expiry status badge
 * - AI confidence indicator
 * - Quick actions (view, delete)
 */

import { getDocumentTypeIcon } from '@/lib/document-type-icons';

interface Document {
  id: string;
  filename: string;
  documentType: string;
  category: string;
  issueDate: string | null;
  expiryDate: string | null;
  summary: string;
  extractedFields: Record<string, any>;
  aiConfidence: number;
  uploadedAt: string;
}

interface DocumentCardProps {
  document: Document;
  onView: () => void;
  onDelete: () => void;
  onAddExpiry?: () => void;
  onDownload?: () => void;
}

export function DocumentCard({ document, onView, onDelete, onAddExpiry, onDownload }: DocumentCardProps) {
  const expiryStatus = getExpiryStatus(document.expiryDate);
  // Use category first (which holds the updated type), fall back to documentType
  const displayType = document.category || document.documentType || 'other';
  const DocIcon = getDocumentTypeIcon(displayType);

  return (
    <div className="group bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-200 overflow-hidden">
      {/* Modern Header */}
      <div className={`p-4 ${getHeaderColor(expiryStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-900/40">
              <DocIcon className="w-5 h-5 text-gray-700 dark:text-slate-200" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white capitalize text-sm">
                {displayType?.replace(/_/g, ' ') || 'Document'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {document.uploadedAt && isValidDate(document.uploadedAt)
                  ? new Date(document.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently uploaded'}
              </p>
            </div>
          </div>

          {/* Expiry Badge */}
          {document.expiryDate && isValidDate(document.expiryDate) ? (
            <div className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-1 font-medium ${getExpiryBadgeColor(expiryStatus)}`}>
              <span>{getExpiryIcon(expiryStatus)}</span>
              <span>{Math.ceil((new Date(document.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full px-2.5 py-1 font-medium">
              <span>—</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Filename */}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={document.filename}>
            {document.filename}
          </p>
        </div>

        {/* Summary */}
        {document.summary && (
          <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {document.summary}
          </p>
        )}

        {/* Expiry Date - Prominent Display */}
        {document.expiryDate && isValidDate(document.expiryDate) ? (
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-slate-400">Expires on</span>
              <span className={`text-sm font-semibold ${getExpiryTextColor(expiryStatus)}`}>
                {new Date(document.expiryDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onAddExpiry}
            className="w-full bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg p-3 border border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-700 dark:text-amber-400">No expiry date</span>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Expiry
              </span>
            </div>
          </button>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium hover:shadow-md"
          >
            View Document
          </button>
          <button
            onClick={onDownload}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            title="Download document"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
            title="Delete document"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function isValidDate(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function getExpiryStatus(expiryDate: string | null): 'good' | 'attention' | 'warning' | 'critical' | 'expired' | 'no_expiry' {
  if (!expiryDate) return 'no_expiry';

  const days = Math.ceil(
    (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  if (days <= 90) return 'attention';
  return 'good';
}

function getHeaderColor(status: string): string {
  const colors: Record<string, string> = {
    good: 'bg-green-50 dark:bg-green-900/30',
    attention: 'bg-yellow-50 dark:bg-yellow-900/30',
    warning: 'bg-orange-50 dark:bg-orange-900/30',
    critical: 'bg-red-50 dark:bg-red-900/30',
    expired: 'bg-gray-100 dark:bg-slate-700/50',
    no_expiry: 'bg-blue-50 dark:bg-blue-900/30',
  };
  return colors[status] || 'bg-gray-50 dark:bg-slate-700/50';
}

function getExpiryTextColor(status: string): string {
  const colors: Record<string, string> = {
    good: 'text-green-600 dark:text-green-400',
    attention: 'text-yellow-600 dark:text-yellow-400',
    warning: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
    expired: 'text-gray-600 dark:text-gray-400',
    no_expiry: 'text-blue-600 dark:text-blue-400',
  };
  return colors[status] || 'text-gray-600 dark:text-gray-400';
}

function getExpiryBadge(status: string, expiryDate: string) {
  const days = Math.ceil(
    (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const badges: Record<string, { icon: string; label: string; class: string }> = {
    good: { icon: '✅', label: `${days} days remaining`, class: 'bg-green-100 text-green-800' },
    attention: { icon: '⚠️', label: `${days} days remaining`, class: 'bg-yellow-100 text-yellow-800' },
    warning: { icon: '🟠', label: `${days} days remaining`, class: 'bg-orange-100 text-orange-800' },
    critical: { icon: '🔴', label: `${days} days remaining`, class: 'bg-red-100 text-red-800' },
    expired: { icon: '❌', label: 'Expired', class: 'bg-gray-100 text-gray-800' },
    no_expiry: { icon: 'ℹ️', label: 'No expiry date', class: 'bg-blue-100 text-blue-800' },
  };

  const badge = badges[status] || badges.no_expiry;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </div>
  );
}

function getExpiryBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    good: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    attention: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    expired: 'bg-gray-100 text-gray-700 dark:bg-slate-600 dark:text-slate-300',
    no_expiry: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 dark:bg-slate-600 dark:text-slate-300';
}

function getExpiryIcon(status: string): string {
  const icons: Record<string, string> = {
    good: '✓',
    attention: '⚠',
    warning: '!',
    critical: '🔴',
    expired: '✕',
    no_expiry: '∞',
  };
  return icons[status] || '—';
}

