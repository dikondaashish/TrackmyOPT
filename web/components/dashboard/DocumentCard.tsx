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
}

export function DocumentCard({ document, onView, onDelete }: DocumentCardProps) {
  const expiryStatus = getExpiryStatus(document.expiryDate);
  const icon = getDocumentIcon(document.documentType);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with Icon */}
      <div className={`p-4 ${getHeaderColor(expiryStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">
                {document.documentType.replace('_', ' ')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* AI Confidence Badge */}
          <div className="flex items-center gap-1 text-xs bg-white rounded-full px-2 py-1">
            <span>🤖</span>
            <span className="font-medium">{document.aiConfidence}%</span>
          </div>
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
          <p className="text-xs text-gray-600 line-clamp-2">
            {document.summary}
          </p>
        )}

        {/* Dates */}
        {(document.issueDate || document.expiryDate) && (
          <div className="space-y-1 text-xs">
            {document.issueDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Issued:</span>
                <span className="font-medium">
                  {new Date(document.issueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {document.expiryDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Expires:</span>
                <span className={`font-medium ${getExpiryTextColor(expiryStatus)}`}>
                  {new Date(document.expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Expiry Status Badge */}
        {document.expiryDate && (
          <div className="pt-2">
            {getExpiryBadge(expiryStatus, document.expiryDate)}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            View
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

