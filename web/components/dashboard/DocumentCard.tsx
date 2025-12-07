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
}

export function DocumentCard({ document, onView, onDelete, onAddExpiry }: DocumentCardProps) {
  const expiryStatus = getExpiryStatus(document.expiryDate);
  // Use category first (which holds the updated type), fall back to documentType
  const displayType = document.category || document.documentType || 'other';
  const icon = getDocumentIcon(displayType);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Modern Header */}
      <div className={`p-4 ${getHeaderColor(expiryStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize text-sm">
                {displayType?.replace(/_/g, ' ') || 'Document'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
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
            <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-medium">
              <span>—</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Filename */}
        <div>
          <p className="text-sm font-medium text-gray-900 truncate" title={document.filename}>
            {document.filename}
          </p>
        </div>

        {/* Summary */}
        {document.summary && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {document.summary}
          </p>
        )}

        {/* Expiry Date - Prominent Display */}
        {document.expiryDate && isValidDate(document.expiryDate) ? (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Expires on</span>
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
            className="w-full bg-amber-50 hover:bg-amber-100 rounded-lg p-3 border border-amber-200 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-700">No expiry date</span>
              <span className="text-sm font-semibold text-amber-700 flex items-center gap-1">
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
            onClick={onDelete}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
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

function getDocumentIcon(type: string): string {
  const icons: Record<string, string> = {
    passport: '📘',
    visa: '🛂',
    i20: '📋',
    ead_card: '💳',
    i983: '📄',
    offer_letter: '📨',
    paystub: '💰',
    receipt_notice: '📬',
    other: '📁',
  };
  return icons[type] || '📁';
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
    good: 'bg-green-50',
    attention: 'bg-yellow-50',
    warning: 'bg-orange-50',
    critical: 'bg-red-50',
    expired: 'bg-gray-100',
    no_expiry: 'bg-blue-50',
  };
  return colors[status] || 'bg-gray-50';
}

function getExpiryTextColor(status: string): string {
  const colors: Record<string, string> = {
    good: 'text-green-600',
    attention: 'text-yellow-600',
    warning: 'text-orange-600',
    critical: 'text-red-600',
    expired: 'text-gray-600',
    no_expiry: 'text-blue-600',
  };
  return colors[status] || 'text-gray-600';
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
    good: 'bg-green-100 text-green-700',
    attention: 'bg-yellow-100 text-yellow-700',
    warning: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700',
    no_expiry: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
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

