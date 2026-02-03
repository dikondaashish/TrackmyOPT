import { useState } from 'react';
import { CreditCard, Loader2, Check, Zap, Shield, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionUsage } from './SubscriptionUsage';
import { BillingHistory } from './BillingHistory';
import { SubscriptionFAQ } from './SubscriptionFAQ';
import { PlanComparisonModal } from './PlanComparisonModal';

interface PremiumStatus {
    isPremium: boolean;
    planName?: string;
    expiresAt?: string;
}

interface SubscriptionSettingsProps {
    premium: PremiumStatus;
    isLoading: boolean;
    onManage: () => void;
}

interface PricingSectionProps {
    currentPlan: 'free' | 'pro' | 'dedicated';
    expiresAt?: string;
    onManage?: () => void;
    isLoading?: boolean;
}

function PricingSection({ currentPlan, expiresAt, onManage, isLoading = false }: PricingSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleDowngrade = (planName: string) => {
        if (currentPlan === 'dedicated') {
            alert(`You are on the Dedicated plan. Your access continues until ${expiresAt ? new Date(expiresAt).toLocaleDateString() : 'the end of your billing cycle'}. Please contact support to changes.`);
        } else if (onManage) {
            onManage();
        }
    };
    // ... (plans array remains the same)


    const plans = [
        {
            name: "Free",
            id: "free",
            description: "Essential timeline tracking for every F-1 student.",
            price: { monthly: 0, yearly: 0 },
            originalPrice: { monthly: null, yearly: null },
            features: [
                "Critical Deadline Alerts",
                "Unemployment Day Counter",
                "Basic Document Storage",
                "Community Access",
                "Premium Job Board (Pro)"
            ],
            cta: "Current Plan",
            popular: false,
            highlight: false
        },
        {
            name: "Pro",
            id: "pro",
            description: "Accelerate your job search & compliance.",
            price: { monthly: 4.99, yearly: 49.99 },
            originalPrice: { monthly: 7.99, yearly: 79.99 },
            features: [
                "Everything in Free",
                "Priority Case Alerts",
                "Verified H-1B Sponsor Data",
                "AI Resume Parser & Scorer",
                "Detailed Job Analytics"
            ],
            cta: "Start 7-Day Free Trial",
            popular: true,
            highlight: true
        },
        {
            name: "Dedicated",
            id: "dedicated",
            description: "Ultimate peace of mind with legal backup.",
            price: { monthly: 14.99, yearly: 149.99 },
            originalPrice: { monthly: 19.99, yearly: 199.99 },
            features: [
                "Everything in Pro",
                "24/7 Dedicated Support",
                "1-on-1 Lawyer Session (1 hr/mo)",
                "Complete Application Audit",
                "Personalized Strategy Plan"
            ],
            cta: "Start 7-Day Free Trial",
            popular: false,
            highlight: true
        }
    ];

    return (
        <div className="w-full">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-10">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex relative">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${billingCycle === 'monthly'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${billingCycle === 'yearly'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Annual <span className="text-[10px] text-green-600 dark:text-green-400 font-bold ml-1">(Save 20%)</span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {plans.map((plan, i) => {
                    const isCurrentPlan = currentPlan === plan.id;
                    // Determine Button Action
                    let buttonText = plan.cta;
                    let isDisabled = false;
                    let onClick = () => { };

                    if (isCurrentPlan) {
                        buttonText = "Current Plan";
                        isDisabled = true;
                    } else if (currentPlan === 'free') {
                        // User is free, can upgrade to anything
                        buttonText = plan.id === 'pro' || plan.id === 'dedicated' ? "Upgrade" : "Current Plan";
                        onClick = () => {
                            if (plan.price[billingCycle] > 0) {
                                const intervalParam = billingCycle === 'monthly' ? 'month' : 'year';
                                const planIdParam = plan.id; // Use ID
                                window.location.href = `/premium/checkout?planId=${planIdParam}&interval=${intervalParam}`;
                            }
                        };
                    } else if (currentPlan === 'pro') {
                        if (plan.id === 'free') {
                            buttonText = "Downgrade";
                            onClick = () => onManage && onManage();
                        } else if (plan.id === 'dedicated') {
                            buttonText = "Upgrade";
                            onClick = () => {
                                const intervalParam = billingCycle === 'monthly' ? 'month' : 'year';
                                const planIdParam = plan.id;
                                window.location.href = `/premium/checkout?planId=${planIdParam}&interval=${intervalParam}`;
                            };
                        }
                    } else if (currentPlan === 'dedicated') {
                        // Dedicated user cant downgrade easily
                        if (plan.id === 'free' || plan.id === 'pro') {
                            buttonText = "Downgrade";
                            onClick = () => handleDowngrade(plan.name);
                        }
                    }

                    return (
                        <div
                            key={i}
                            className={`relative rounded-2xl p-6 flex flex-col ${plan.popular
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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[40px]">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                        ${plan.price[billingCycle]}
                                    </span>
                                    <span className="text-sm text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                </div>
                                {plan.originalPrice[billingCycle] && (
                                    <div className="text-sm text-gray-400 line-through mt-1">
                                        ${plan.originalPrice[billingCycle]}
                                    </div>
                                )}
                                <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">
                                    {plan.price[billingCycle] === 0 ? "Forever Free — No Trial" : "7-Day Free Trial"}
                                </div>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-green-500" : "text-gray-400"}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={onClick}
                                className={`w-full py-6 font-semibold rounded-xl ${plan.popular
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                                    : plan.price[billingCycle] > 0
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                disabled={isDisabled || isLoading}
                                variant={isCurrentPlan ? "outline" : "default"}
                            >
                                {buttonText}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function SubscriptionSettings({ premium, isLoading, onManage }: SubscriptionSettingsProps) {
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
        currentPlan = (premium.planName?.toLowerCase() as 'pro' | 'dedicated') || 'pro';
    }

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
            />

            <div className="flex justify-center -mt-4 mb-8">
                <PlanComparisonModal />
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

                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{currentPlan === 'dedicated' ? 'Dedicated Plan' : 'PRO Plan'}</h3>
                                <p className="text-sm text-gray-500 mb-6">Active Subscription</p>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Member Since</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {premium.expiresAt ? new Date(premium.expiresAt).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={onManage}
                                    className="w-full mt-6 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                                >
                                    Manage Subscription
                                </Button>
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
        </div>
    );
}
