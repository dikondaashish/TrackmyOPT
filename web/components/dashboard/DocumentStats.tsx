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
        icon="📁"
        label="Total Documents"
        value={total}
        color="blue"
      />

      {/* Expiring Soon */}
      <StatCard
        icon="⚠️"
        label="Expiring Soon"
        value={expiringSoon}
        color="orange"
        subtitle="Within 30 days"
      />

      {/* Expired */}
      <StatCard
        icon="❌"
        label="Expired"
        value={expired}
        color="red"
        subtitle="Action required"
      />

      {/* Most Common Type */}
      <StatCard
        icon="📊"
        label="Most Common"
        value={mostCommonType ? mostCommonType[0].replace('_', ' ') : 'None'}
        color="cyan"
        subtitle={mostCommonType ? `${mostCommonType[1]} documents` : undefined}
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
  icon: string;
  label: string;
  value: string | number;
  color: 'blue' | 'orange' | 'red' | 'cyan';
  subtitle?: string;
  isText?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
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

