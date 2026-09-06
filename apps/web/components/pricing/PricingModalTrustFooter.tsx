'use client';

import { Shield, Sparkles, Zap } from 'lucide-react';
import {
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';
import { shouldShowDedicatedPlanForSale } from '@/lib/pricing/sales-copy';

interface PricingModalTrustFooterProps {
  isPremium: boolean;
}

export function PricingModalTrustFooter({
  isPremium,
}: PricingModalTrustFooterProps) {
  return (
    <div className="px-4 sm:px-5 md:px-4 pb-4 md:pb-3 pt-3 md:pt-2 border-t border-border/40 bg-background/95">
      <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-4 gap-y-2 md:gap-y-1">
        <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-green-600" />
          <span>Secure Payment</span>
        </div>
        {!isPremium && (
          <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 md:w-3 md:h-3 text-violet-600" />
            <span>
              Pro: ${PRO_PAID_INTRO_PRICE.toFixed(2)} for {PRO_TRIAL_DAYS}{' '}
              days for eligible accounts
            </span>
          </div>
        )}
        {shouldShowDedicatedPlanForSale() ? (
          <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 md:w-3 md:h-3 text-amber-600" />
            <span>Dedicated: 3-day money-back</span>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
          <Zap className="w-3.5 h-3.5 md:w-3 md:h-3 text-amber-600" />
          <span>Cancel in Settings → Billing</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs md:text-[11px]">
          <span className="text-muted-foreground/60">Powered by</span>
          <span className="font-semibold text-foreground/80">Stripe</span>
        </div>
      </div>
    </div>
  );
}
