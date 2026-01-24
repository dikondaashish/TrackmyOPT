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

export function SubscriptionSettings({ premium, isLoading, onManage }: SubscriptionSettingsProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    Subscription & Billing
                    {premium.isPremium && (
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 dark:from-amber-600 dark:to-yellow-600 text-[10px] text-amber-900 dark:text-white font-extrabold tracking-wide uppercase shadow-sm">
                            PRO
                        </span>
                    )}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your plan, billing details, and invoices.
                </p>
            </div>

            {!premium.isPremium ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Current Status & Usage (1/3 width) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Plan Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 dark:bg-gray-700/50 rounded-bl-full -mr-4 -mt-4" />
                            <div className="relative">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Current Plan
                                </h3>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    Free Tier
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Basic essential features</p>
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full inline-block">
                                    Active Now
                                </div>
                            </div>
                        </div>

                        {/* Usage Stats (Refactored visual integration) */}
                        <SubscriptionUsage />

                        <div className="flex justify-center">
                            <PlanComparisonModal />
                        </div>
                    </div>

                    {/* Right Column: Upgrade Hero (2/3 width) */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold text-yellow-400 tracking-wide text-sm uppercase">Recommended</span>
                                        </div>
                                        <h3 className="text-3xl font-bold mb-2">Upgrade to Pro</h3>
                                        <p className="text-gray-300 max-w-md">
                                            Unlock the full potential of TrackMyOPT. One-time payment, lifetime access.
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                        <div className="text-3xl font-bold">$2.99</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">One-time payment</div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                    {[
                                        "Unlimited Job Tracking",
                                        "Automated H-1B Insights",
                                        "Document Vault & Safe Export",
                                        "AI-Powered Resume Analysis",
                                        "Daily Email Reminders",
                                        "Priority Support"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-green-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-200">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => window.location.href = '/premium/checkout'}
                                    className="w-full sm:w-auto px-8 py-6 text-lg bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02]"
                                >
                                    Get Lifetime Access &rarr;
                                </Button>

                                <p className="mt-4 text-xs text-center sm:text-left text-gray-400">
                                    Secure payment via Stripe. 30-day money-back guarantee.
                                </p>
                            </div>
                        </div>

                        {/* Testimonials / Trust - Optional, can add later */}
                        <div className="mt-8 grid sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 italic">"The document vault saved me during my RFE. Worth every penny."</p>
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-300 mt-2">- Sarah K., USC Grad</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 italic">"Finally a tracker that understands the OPT timeline. Love the reminders."</p>
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-300 mt-2">- Rahul M., NEU Student</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Pro User View */
                <div className="grid lg:grid-cols-3 gap-8">
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

                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">PRO Plan</h3>
                                <p className="text-sm text-gray-500 mb-6">Lifetime Access</p>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Member Since</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {premium.expiresAt ? new Date(premium.expiresAt).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Billing Cycle</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">One-time</span>
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

                        {/* Contact Support Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Need Help?</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                                Questions about your billing or features? Our support team is here.
                            </p>
                            <a href="mailto:support@trackmyopt.com" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                Contact Support &rarr;
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Billing History & Features (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <BillingHistory />
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Your Pro Benefits
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Unlimited Tracking</p>
                                        <p className="text-xs text-gray-500">Track as many jobs as you need</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Document Vault</p>
                                        <p className="text-xs text-gray-500">Secure storage for your OPT documents</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Export Data</p>
                                        <p className="text-xs text-gray-500">Download your data anytime</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Daily Reminders</p>
                                        <p className="text-xs text-gray-500">Never miss a deadline</p>
                                    </div>
                                </div>
                            </div>
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
