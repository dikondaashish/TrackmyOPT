'use client';

import { Gift } from 'lucide-react';
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
          'relative w-16 h-8 md:w-14 md:h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40',
          isYearly
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30'
            : 'bg-muted border border-border'
        )}
        aria-label="Toggle billing period"
      >
        <div
          className={cn(
            'absolute top-1 w-6 h-6 md:w-5 md:h-5 md:top-1 rounded-full bg-white shadow-md transition-all duration-300 ease-out',
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 md:px-2 md:py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] md:text-[9px] font-bold uppercase tracking-wider border border-green-500/20">
          <Gift className="w-3 h-3" />
          Save up to {annualSavingsPercent('pro')}%
        </span>
      </div>
    </div>
  );
}
