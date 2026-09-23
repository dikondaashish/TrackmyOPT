'use client';

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  status?: 'ok' | 'warning' | 'critical';
  large?: boolean;
}

export function ResultCard({
  icon,
  label,
  value,
  subtext,
  status,
  large,
}: ResultCardProps) {
  const statusStyles = {
    ok: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    warning: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  };

  const defaultStyle =
    'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';

  return (
    <div
      className={`
      min-w-0 p-4 rounded-xl border
      ${status ? statusStyles[status] : defaultStyle}
      ${large ? 'col-span-full' : ''}
    `}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
      <div
        className={`break-words font-semibold tabular-nums text-gray-900 dark:text-white ${large ? 'text-2xl' : 'text-xl'}`}
      >
        {value}
      </div>
      {subtext && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
}

interface ProgressBarProps {
  used: number;
  max: number;
  label?: string;
}

export function ProgressBar({ used, max, label }: ProgressBarProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeUsed = Number.isFinite(used) ? Math.max(0, used) : 0;
  const percentage = safeMax ? Math.min(100, (safeUsed / safeMax) * 100) : 0;

  const getColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {used} / {max} days
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label || 'Unemployment days used'}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={Math.min(safeUsed, safeMax)}
        aria-valuetext={`${safeUsed} of ${safeMax} days used`}
        className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      >
        <div
          className={`h-full ${getColor()} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
