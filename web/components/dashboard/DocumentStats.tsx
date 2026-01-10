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

interface Document {
  id: string;
  expiryDate: string | null;
  documentType: string;
}

interface DocumentStatsProps {
  documents: Document[];
}

export function DocumentStats({ documents }: DocumentStatsProps) {
  // Calculate stats
  const total = documents.length;

  const expiringSoon = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;

  const expired = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    return new Date(doc.expiryDate) < new Date();
  }).length;

  const categoryCounts = documents.reduce((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Documents */}
      <StatCard
        icon={<FileText className="w-5 h-5" />}
        label="Total Documents"
        value={total}
        color="blue"
      />

      {/* Expiring Soon */}
      <StatCard
        icon={<Clock className="w-5 h-5" />}
        label="Expiring Soon"
        value={expiringSoon}
        color="orange"
        subtitle="Within 30 days"
      />

      {/* Expired */}
      <StatCard
        icon={<AlertCircle className="w-5 h-5" />}
        label="Expired"
        value={expired}
        color="red"
        subtitle="Action required"
      />

      {/* Most Common Type */}
      <StatCard
        icon={<BarChart3 className="w-5 h-5" />}
        label="Most Common"
        value={mostCommonType?.[0]?.replace(/_/g, ' ') || 'None'}
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
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-gradient-to-br dark:from-blue-700/50 dark:via-blue-800/70 dark:to-indigo-800/50 dark:text-blue-300 dark:border-blue-400/50',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-gradient-to-br dark:from-orange-700/50 dark:via-orange-800/70 dark:to-amber-800/50 dark:text-orange-300 dark:border-orange-400/50',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-gradient-to-br dark:from-red-700/50 dark:via-red-800/70 dark:to-rose-800/50 dark:text-red-300 dark:border-red-400/50',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-gradient-to-br dark:from-cyan-700/50 dark:via-cyan-800/70 dark:to-teal-800/50 dark:text-cyan-300 dark:border-cyan-400/50',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-gradient-to-br dark:from-purple-700/50 dark:via-purple-800/70 dark:to-violet-800/50 dark:text-purple-300 dark:border-purple-400/50',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`${isText ? 'text-xl' : 'text-3xl'} font-bold capitalize`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs mt-1 opacity-75">
          {subtitle}
        </div>
      )}
    </div>
  );
}

