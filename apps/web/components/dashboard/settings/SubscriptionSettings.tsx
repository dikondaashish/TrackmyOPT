import { useEffect, useState } from 'react';
import {
  Loader2,
  Check,
  Crown,
  CalendarDays,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlanBullets } from '@/lib/pricing/plan-features';
import { shouldShowDedicatedPlanForSale } from '@/lib/pricing/sales-copy';
import {
  DEDICATED_CONSULTATION_MINUTES,
  DEDICATED_CONSULTATION_WAIT_DAYS,
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';
import {
  PLAN_LIST_PRICES,
  PLAN_PRICES,
  annualSavingsPercent,
} from '@/lib/pricing/plan-config';
import { getDedicatedConsultationEligibility } from '@/lib/pricing/dedicated-consultation';
import { formatMonthlyEquivalentFromYearly } from '@/lib/premium/format-monthly-equivalent-from-yearly';
import { BillingHistory } from './BillingHistory';
import { SubscriptionFAQ } from './SubscriptionFAQ';
import { PlanComparisonModal } from './PlanComparisonModal';
import { PricingModal } from '@/components/pricing/PricingModal';
import { CancelSubscriptionCard } from '@/components/billing/CancelSubscriptionCard';

interface PremiumStatus {
  isPremium: boolean;
  planName?: string;
  expiresAt?: string;
  dedicatedStartedAt?: string | null;
}

interface SubscriptionSettingsProps {
  premium: PremiumStatus;
  isLoading: boolean;
  onManage: () => void;
  userEmail: string;
}

interface PricingSectionProps {
  currentPlan: 'free' | 'pro' | 'dedicated';
  expiresAt?: string;
  onManage?: () => void;
  isLoading?: boolean;
  userEmail: string;
  premium: PremiumStatus;
  onUpgrade: (planId: string, interval: string) => Promise<void>;
  isCheckoutLoading?: string | null;
}

function PricingSection({
  currentPlan,
  expiresAt,
  onManage,
  isLoading = false,
  userEmail,
  premium,
  onUpgrade,
  isCheckoutLoading,
}: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'yearly'
  );

  const handleDowngrade = (planName: string) => {
    if (currentPlan === 'dedicated') {
      // Phase 6: Dedicated → Pro uses create-checkout migration path.
      if (planName.toLowerCase() === 'pro') {
        void onUpgrade('pro', 'year');
        return;
      }
      alert(
        `You are on the Dedicated plan. Your access continues until ${expiresAt ? new Date(expiresAt).toLocaleDateString() : 'the end of your billing cycle'}. Switch to Pro from the banner, or contact support@trackmyopt.com.`
      );
    } else if (onManage) {
      onManage();
    }
  };
  // ... (plans array remains the same)

  const plans = [
    {
      name: 'Free',
      id: 'free',
      description: 'Essential timeline tracking for every F-1 student.',
      price: { monthly: PLAN_PRICES.free.month, yearly: PLAN_PRICES.free.year },
      originalPrice: {
        monthly: PLAN_LIST_PRICES.pro.month,
        yearly: PLAN_LIST_PRICES.pro.year,
      },
      features: getPlanBullets('free'),
      cta: 'Current Plan',
      popular: false,
      highlight: false,
    },
    {
      name: 'Pro',
      id: 'pro',
      description:
        'Daily reminders, unemployment alerts, and unlimited job tracking.',
      price: { monthly: PLAN_PRICES.pro.month, yearly: PLAN_PRICES.pro.year },
      originalPrice: {
        monthly: PLAN_LIST_PRICES.dedicated.month,
        yearly: PLAN_LIST_PRICES.dedicated.year,
      },
      features: getPlanBullets('pro'),
      cta: 'Get Pro',
      popular: true,
      highlight: true,
    },
    {
      name: 'Dedicated',
      id: 'dedicated',
      description: `Pro plus priority support and one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days.`,
      price: {
        monthly: PLAN_PRICES.dedicated.month,
        yearly: PLAN_PRICES.dedicated.year,
      },
      originalPrice: { monthly: null, yearly: null },
      features: getPlanBullets('dedicated'),
      cta: 'Upgrade to Dedicated',
      popular: false,
      highlight: true,
    },
  ].filter(
    (plan) =>
      plan.id !== 'dedicated' ||
      shouldShowDedicatedPlanForSale() ||
      currentPlan === 'dedicated'
  );

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex relative">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Annual{' '}
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold ml-1">
              (Save up to {annualSavingsPercent('pro')}%)
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div
        className={`grid gap-6 ${plans.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
      >
        {plans.map((plan, i) => {
          const isCurrentPlan = currentPlan === plan.id;
          // Determine Button Action
          let buttonText = plan.cta;
          let isDisabled = false;
          let onClick = () => {};
          const isPlanLoading = isCheckoutLoading === plan.id;

          if (isCurrentPlan) {
            buttonText = 'Current Plan';
            isDisabled = true;
          } else if (currentPlan === 'free') {
            // User is free, can upgrade to anything
            buttonText =
              plan.id === 'pro' || plan.id === 'dedicated'
                ? plan.cta
                : 'Current Plan';
            onClick = () => {
              if (plan.price[billingCycle] > 0) {
                const intervalParam =
                  billingCycle === 'monthly' ? 'month' : 'year';
                onUpgrade(plan.id, intervalParam);
              }
            };
          } else if (currentPlan === 'pro') {
            if (plan.id === 'free') {
              buttonText = 'Downgrade';
              onClick = () => onManage && onManage();
            } else if (plan.id === 'dedicated') {
              buttonText = plan.cta;
              onClick = () => {
                const intervalParam =
                  billingCycle === 'monthly' ? 'month' : 'year';
                onUpgrade(plan.id, intervalParam);
              };
            }
          } else if (currentPlan === 'dedicated') {
            if (plan.id === 'pro') {
              buttonText = 'Switch to Pro';
              onClick = () =>
                onUpgrade('pro', billingCycle === 'monthly' ? 'month' : 'year');
            } else if (plan.id === 'free') {
              buttonText = 'Manage billing';
              onClick = () => onManage && onManage();
            }
          }

          return (
            <div
              key={i}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? 'bg-white dark:bg-gray-800 border-2 border-primary shadow-xl scale-105 z-10'
                  : 'bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                {plan.price[billingCycle] === 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        $0
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">
                      Forever Free — No Trial
                    </div>
                  </>
                ) : billingCycle === 'yearly' ? (
                  <>
                    {plan.originalPrice.yearly != null &&
                      plan.originalPrice.yearly > plan.price.yearly && (
                        <div className="text-sm text-gray-400 line-through mb-1 tabular-nums">
                          $
                          {formatMonthlyEquivalentFromYearly(
                            plan.originalPrice.yearly
                          )}
                          /mo
                        </div>
                      )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                        ${formatMonthlyEquivalentFromYearly(plan.price.yearly)}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">billed yearly</p>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">
                      {plan.id === 'pro'
                        ? `$${PRO_PAID_INTRO_PRICE.toFixed(2)} for ${PRO_TRIAL_DAYS} days for eligible accounts`
                        : `${DEDICATED_CONSULTATION_MINUTES}-minute attorney consultation included`}
                    </div>
                  </>
                ) : (
                  <>
                    {plan.originalPrice.monthly != null &&
                      plan.originalPrice.monthly > plan.price.monthly && (
                        <div className="text-sm text-gray-400 line-through mb-1 tabular-nums">
                          ${plan.originalPrice.monthly}
                        </div>
                      )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                        ${plan.price.monthly}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">
                      {plan.id === 'pro'
                        ? `$${PRO_PAID_INTRO_PRICE.toFixed(2)} for ${PRO_TRIAL_DAYS} days for eligible accounts`
                        : `${DEDICATED_CONSULTATION_MINUTES}-minute attorney consultation included`}
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={onClick}
                className={`w-full py-6 font-semibold rounded-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                    : plan.price[billingCycle] > 0
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={isDisabled || isLoading || !!isCheckoutLoading}
                variant={isCurrentPlan ? 'outline' : 'default'}
              >
                {isPlanLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  buttonText
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SubscriptionSettings({
  premium,
  isLoading,
  onManage,
  userEmail,
}: SubscriptionSettingsProps) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [selectedInterval, setSelectedInterval] = useState<string>('year');
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<string | null>(
    null
  );
  const [dedicatedStartedAt, setDedicatedStartedAt] = useState<string | null>(
    premium.dedicatedStartedAt ?? null
  );

  useEffect(() => {
    if (!premium.isPremium || premium.planName?.toLowerCase() !== 'dedicated') {
      setDedicatedStartedAt(null);
      return;
    }
    if (premium.dedicatedStartedAt) {
      setDedicatedStartedAt(premium.dedicatedStartedAt);
      return;
    }

    const controller = new AbortController();
    void fetch('/api/premium/status', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((status) =>
        setDedicatedStartedAt(status?.dedicatedStartedAt ?? null)
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setDedicatedStartedAt(null);
      });
    return () => controller.abort();
  }, [premium.dedicatedStartedAt, premium.isPremium, premium.planName]);

  const dedicatedConsultation =
    getDedicatedConsultationEligibility(dedicatedStartedAt);

  // Open pricing modal so recurring-billing disclosures + consent apply before Stripe
  const handleDirectCheckout = async (
    planId: string,
    interval: string
  ): Promise<void> => {
    setSelectedPlan(planId);
    setSelectedInterval(interval);
    setShowPricingModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Determine current plan
  let currentPlan: 'free' | 'pro' | 'dedicated' = 'free';
  if (premium.isPremium) {
    currentPlan =
      (premium.planName?.toLowerCase() as 'pro' | 'dedicated') || 'pro';
  }

  const handleOpenPricing = (planId: string, interval: string) => {
    setSelectedPlan(planId);
    setSelectedInterval(interval);
    setShowPricingModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Subscription & Billing
          {premium.isPremium && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 dark:from-amber-600 dark:to-yellow-600 text-[10px] text-amber-900 dark:text-white font-extrabold tracking-wide uppercase shadow-sm">
              {currentPlan.toUpperCase()}
            </span>
          )}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your plan, billing details, and invoices.
        </p>
      </div>

      {/* Always show Pricing Section for upgrades/downgrades */}
      <PricingSection
        currentPlan={currentPlan}
        expiresAt={premium.expiresAt}
        onManage={onManage}
        isLoading={isLoading}
        userEmail={userEmail}
        premium={premium}
        onUpgrade={handleDirectCheckout}
        isCheckoutLoading={checkoutLoadingPlan}
      />

      <div className="flex justify-center -mt-4 mb-8">
        <PlanComparisonModal
          onUpgrade={() => handleOpenPricing('pro', 'year')}
        />
      </div>

      {premium.isPremium && (
        <div className="grid lg:grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          {/* Left Column: Plan Details (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 pointer-events-none" />
              <div className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Crown className="w-6 h-6 fill-current" />
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wide">
                    Active
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {currentPlan === 'dedicated' ? 'Dedicated Plan' : 'PRO Plan'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Active Subscription
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current period ends</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {premium.expiresAt
                        ? new Date(premium.expiresAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onManage}
                  variant="outline"
                  className="group mt-5 h-auto min-h-14 w-full justify-between rounded-xl border-gray-200 bg-white px-3.5 py-3 text-left text-gray-900 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/70 hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-white"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:group-hover:bg-blue-900/60">
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5">
                        Manage billing
                      </span>
                      <span className="block text-xs font-normal leading-4 text-gray-500 dark:text-gray-400">
                        Payment methods and invoices
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    aria-hidden="true"
                  />
                </Button>

                <div className="mt-4">
                  <CancelSubscriptionCard
                    accessThroughDate={premium.expiresAt ?? null}
                    onCancel={onManage}
                    isLoading={isLoading}
                  />
                </div>

                {currentPlan === 'dedicated' &&
                  dedicatedConsultation.eligible && (
                    <a
                      href={`mailto:support@trackmyopt.com?subject=${encodeURIComponent('Dedicated 60-minute attorney consultation request')}`}
                      className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Request attorney consultation
                    </a>
                  )}
                {currentPlan === 'dedicated' &&
                  !dedicatedConsultation.eligible && (
                    <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      {dedicatedConsultation.eligibleAt
                        ? `Attorney consultation unlocks ${dedicatedConsultation.eligibleAt.toLocaleDateString()} after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days on Dedicated.`
                        : 'Checking your attorney-consultation eligibility…'}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column: Billing History & Features (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <BillingHistory />
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section (Shared) */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        <SubscriptionFAQ />
      </div>

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        initialPlan={selectedPlan}
        initialInterval={selectedInterval}
        userEmail={userEmail}
        isPremium={premium.isPremium}
      />
    </div>
  );
}
