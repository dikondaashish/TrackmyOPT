"use client";

import {
    X,
    MapPin,
    Banknote,
    ClipboardList,
    ExternalLink,
} from "lucide-react";
import type { FuelDeal } from "./offers-catalog";

type FuelDealModalProps = {
    deal: FuelDeal;
    showStepsPopup: boolean;
    onClose: () => void;
    onShowSteps: () => void;
    onHideSteps: () => void;
    onClaim: (link: string) => void;
};

export function FuelDealModal({
    deal,
    showStepsPopup,
    onClose,
    onShowSteps,
    onHideSteps,
    onClaim,
}: FuelDealModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${deal.badgeColor} p-6 text-white`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <deal.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">{deal.subtitle}</p>
                            <h3 className="text-2xl font-bold">{deal.title}</h3>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="px-4 py-2 bg-white/20 rounded-full">
                            <span className="text-xl font-bold">{deal.discount}</span>
                        </div>
                        {deal.maxSavings && (
                            <div className="px-4 py-2 bg-white/30 rounded-full border border-white/40">
                                <span className="text-lg font-semibold inline-flex items-center gap-1.5">
                                    <Banknote className="w-4 h-4 shrink-0" />
                                    {deal.maxSavings}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground mb-4">
                        {deal.description}
                    </p>

                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">What You Get:</h4>
                        <ul className="space-y-2">
                            {deal.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                                    </div>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-amber-700 dark:text-amber-400">
                                Available in: {deal.availableStates.join(", ")}
                            </span>
                        </div>
                    </div>

                    {deal.id === "fuel-discount" && (
                        <button
                            onClick={onShowSteps}
                            className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400 group-hover:text-blue-900 dark:group-hover:text-blue-300 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 shrink-0" />
                                Steps to Get This Offer
                            </span>
                            <span className="text-blue-400 dark:text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                                →
                            </span>
                        </button>
                    )}

                    {showStepsPopup && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={onHideSteps}
                            />
                            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
                                    <button
                                        onClick={onHideSteps}
                                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 shrink-0" />
                                        Steps to Get This Offer
                                    </h3>
                                </div>

                                <div className="p-5">
                                    <ol className="space-y-4">
                                        <li className="flex gap-3">
                                            <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                            <div>
                                                <span className="text-sm font-medium">Click &quot;Claim This Offer&quot;</span>
                                                <p className="text-xs text-muted-foreground">The button at the bottom of this popup</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                            <div>
                                                <span className="text-sm font-medium">Create Your Account</span>
                                                <p className="text-xs text-muted-foreground">Fill in your details on the sign-up page</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                            <div>
                                                <span className="text-sm font-medium">Verify Your Email</span>
                                                <p className="text-xs text-muted-foreground">Check your inbox & confirm to earn points</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                            <div>
                                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Save at the Pump!</span>
                                                <p className="text-xs text-muted-foreground">
                                                    Go to a participating gas station, select the app, enter your <strong>Alt ID</strong>
                                                </p>
                                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                                        Save $0.50/gal → Up to $17.50!
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    </ol>

                                    <button
                                        onClick={onHideSteps}
                                        className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        Got It!
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <details className="mb-6">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View Terms & Conditions
                        </summary>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                            {deal.terms}
                        </p>
                    </details>

                    <button
                        onClick={() => onClaim(deal.link)}
                        className={`w-full py-3 px-6 bg-gradient-to-r ${deal.badgeColor} text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                    >
                        Claim This Offer
                        <ExternalLink className="w-4 h-4" />
                    </button>

                    <p className="text-xs text-center text-muted-foreground mt-3">
                        You&apos;ll be redirected to Bee&apos;s Knees Benefits™ to complete enrollment
                    </p>
                </div>
            </div>
        </div>
    );
}
