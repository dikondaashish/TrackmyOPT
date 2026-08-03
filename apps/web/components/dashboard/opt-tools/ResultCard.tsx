"use client";

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  status?: 'ok' | 'warning' | 'critical';
  large?: boolean;
}

export function ResultCard({ icon, label, value, subtext, status, large }: ResultCardProps) {
  const statusStyles = {
    ok: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    warning: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  };

  const defaultStyle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';

  return (
    <div className={`
      p-4 rounded-xl border-2 transition-all
      ${status ? statusStyles[status] : defaultStyle}
      ${large ? 'col-span-full' : ''}
    `}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <p className={`font-bold text-gray-900 dark:text-white ${large ? 'text-3xl' : 'text-lg'}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
      )}
    </div>
  );
}

interface CountdownCardProps {
  days: number;
  label: string;
  deadline: string;
}

interface ProgressBarProps {
  used: number;
  max: number;
  label?: string;
}

export function ProgressBar({ used, max, label }: ProgressBarProps) {
  const percentage = Math.min(100, (used / max) * 100);

  const getColor = () => {
    if (percentage >= 89) return 'bg-red-500';
    if (percentage >= 67) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium text-gray-900 dark:text-white">{used} / {max} days</span>
        </div>
      )}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
