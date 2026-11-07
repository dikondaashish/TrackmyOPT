'use client';

import { cn } from '@/lib/utils';
import { annualSavingsPercent } from '@/lib/pricing/plan-config';

interface PricingModalBillingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}

export function PricingModalBillingToggle({
  isYearly,
  onToggle,
}: PricingModalBillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-2.5 mt-3 sm:mt-4 md:mt-2.5">
      <span
        className={cn(
          'text-sm md:text-xs font-medium transition-all duration-200',
          !isYearly ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        Monthly
      </span>

      <button
        onClick={onToggle}
        className={cn(
          'relative w-16 h-8 md:w-14 md:h-7 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          isYearly
            ? 'bg-violet-600 shadow-button'
            : 'bg-muted border border-border'
        )}
        aria-label="Toggle billing period"
      >
        <div
          className={cn(
            'absolute top-1 w-6 h-6 md:w-5 md:h-5 md:top-1 rounded-full bg-white shadow-card transition-all duration-300 ease-out',
            isYearly ? 'left-[34px] md:left-[30px]' : 'left-1'
          )}
        />
      </button>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm md:text-xs font-medium transition-all duration-200',
            isYearly ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Annual
        </span>
        <span className="text-xs md:text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          Save up to {annualSavingsPercent('pro')}%
        </span>
      </div>
    </div>
  );
}
