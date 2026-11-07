'use client';

/**
 * Document Stats Component
 * 
 * Shows statistics about user's documents:
 * - Total documents
 * - Expiring soon (within 30 days)
 * - Expired documents
 * - Documents by type
 */

import { FileText, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { daysUntilExpiry, documentTypeLabel } from '@/lib/documents/vault-utils';

interface Document {
  id: string;
  expiryDate: string | null;
  documentType: string;
  category?: string;
}

interface DocumentStatsProps {
  documents: Document[];
  loading?: boolean;
}

export function DocumentStats({ documents, loading = false }: DocumentStatsProps) {
  // Calculate stats
  const total = documents.length;

  const expiringSoon = documents.filter(doc => {
    const days = daysUntilExpiry(doc.expiryDate);
    return days !== null && days >= 0 && days <= 30;
  }).length;

  const expired = documents.filter(doc => {
    const days = daysUntilExpiry(doc.expiryDate);
    return days !== null && days < 0;
  }).length;

  const categoryCounts = documents.reduce((acc, doc) => {
    const type = doc.category || doc.documentType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Documents */}
      <StatCard
        icon={<FileText className="w-4 h-4 shrink-0" />}
        label="Total Documents"
        value={loading ? '…' : total}
        color="blue"
      />

      {/* Expiring Soon */}
      <StatCard
        icon={<Clock className="w-4 h-4 shrink-0" />}
        label="Expiring Soon"
        value={loading ? '…' : expiringSoon}
        color="orange"
        subtitle="Within 30 days"
      />

      {/* Expired */}
      <StatCard
        icon={<AlertCircle className="w-4 h-4 shrink-0" />}
        label="Expired"
        value={loading ? '…' : expired}
        color="red"
        subtitle="Review dates"
      />

      {/* Most Common Type */}
      <StatCard
        icon={<BarChart3 className="w-4 h-4 shrink-0" />}
        label="Most Common"
        value={loading ? '…' : mostCommonType ? documentTypeLabel(mostCommonType[0]) : 'None'}
        color="purple"
        subtitle={mostCommonType ? `${mostCommonType[1]} document${mostCommonType[1] > 1 ? 's' : ''}` : '0 documents'}
        isText
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  subtitle,
  isText = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'orange' | 'red' | 'cyan' | 'purple';
  subtitle?: string;
  isText?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-700',
    purple: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:border-violet-700',
  };

  return (
    <div className={`min-w-0 rounded-lg border p-3 sm:p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs sm:text-sm font-medium dark:text-white">{label}</span>
      </div>
      <div className={`${isText ? 'text-lg' : 'text-2xl'} break-words font-bold capitalize dark:text-white`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs mt-1 opacity-75 dark:opacity-100 dark:text-slate-200">
          {subtitle}
        </div>
      )}
    </div>
  );
}
