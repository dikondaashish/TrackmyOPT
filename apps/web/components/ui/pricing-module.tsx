"use client";

import * as React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanFeature {
    label: string;
    included: boolean;
    isHeader?: boolean;
}

export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    priceMonthly: number;
    priceMonthlyOriginal?: number; // Added for strikethrough logic
    priceYearly: number;
    priceYearlyOriginal?: number; // Added for strikethrough logic
    users: string;
    features: PlanFeature[];
    recommended?: boolean;
    badge?: string; // e.g. "Most Popular"
    buttonLabel?: string; // Custom CTA per plan
}

export interface PricingModuleProps {
    title?: string;
    subtitle?: string;
    annualBillingLabel?: string;
    buttonLabel?: string;
    plans: PricingPlan[];
    defaultAnnual?: boolean;
    className?: string;
}

export function PricingModule({
    title = "Pricing Plans",
    subtitle = "Choose a plan that fits your needs.",
    annualBillingLabel = "Annual billing",
    buttonLabel = "Get started",
    plans,
    defaultAnnual = false,
    className,
}: PricingModuleProps) {
    const [isAnnual, setIsAnnual] = React.useState(defaultAnnual);
    const [showAllFeatures, setShowAllFeatures] = React.useState(false);

    return (
        <section
            className={cn(
                "w-full bg-background text-foreground py-20 px-4 md:px-8",
                className
            )}
        >
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold tracking-tight mb-2">{title}</h2>
                <p className="text-muted-foreground mb-8">{subtitle}</p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    <Switch
                        id="billing-toggle"
                        checked={isAnnual}
                        onCheckedChange={(checked) => setIsAnnual(checked)}
                    />
                    <label
                        htmlFor="billing-toggle"
                        className="text-sm text-muted-foreground cursor-pointer font-medium"
                    >
                        {annualBillingLabel} <span className="text-primary font-bold">(Save 20%)</span>
                    </label>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative border rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col",
                                plan.recommended
                                    ? "border-primary shadow-md scale-[1.02] sm:scale-105 z-10"
                                    : "border-border hover:border-primary/30"
                            )}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {plan.badge}
                                </div>
                            )}

                            <CardHeader className="text-center pt-8 pb-2">
                                <div className="flex justify-center mb-4">{plan.icon}</div>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription className="min-h-[40px] flex items-center justify-center">{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="text-center flex-1 flex flex-col">
                                <div className="mb-6">
                                    {/* Discount logic display */}
                                    {(isAnnual ? plan.priceYearlyOriginal : plan.priceMonthlyOriginal) && (
                                        <div className="text-muted-foreground/60 line-through text-sm font-medium mb-1">
                                            ${isAnnual ? plan.priceYearlyOriginal : plan.priceMonthlyOriginal}
                                        </div>
                                    )}
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-extrabold tracking-tight">
                                            ${isAnnual ? plan.priceYearly : plan.priceMonthly}
                                        </span>
                                        <span className="text-muted-foreground font-medium">
                                            /{isAnnual ? "year" : "month"}
                                        </span>
                                    </div>
                                    {plan.users && (
                                        <p className="text-sm font-bold text-muted-foreground mt-2">
                                            {plan.users}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    variant={plan.recommended ? "default" : "outline"}
                                    className="w-full mb-8 font-semibold"
                                >
                                    {plan.buttonLabel || buttonLabel}
                                </Button>

                                <div className="text-left text-sm flex-1">
                                    <div className="space-y-4">
                                        <ul className="space-y-3">
                                            {plan.features.slice(0, 7).map((f, i) => (
                                                f.isHeader ? (
                                                    <li key={i} className="font-semibold text-foreground/90 mt-5 mb-2 text-xs uppercase tracking-wide border-l-2 border-primary/40 pl-2">{f.label}</li>
                                                ) : (
                                                    <li key={i} className="flex items-start gap-3">
                                                        {f.included ? (
                                                            <Check className="w-5 h-5 text-primary shrink-0" />
                                                        ) : (
                                                            <X className="w-5 h-5 text-muted-foreground shrink-0" />
                                                        )}
                                                        <span
                                                            className={cn(
                                                                "leading-tight",
                                                                f.included
                                                                    ? "text-foreground"
                                                                    : "text-muted-foreground/60 line-through"
                                                            )}
                                                        >
                                                            {f.label}
                                                        </span>
                                                    </li>
                                                )
                                            ))}

                                            {/* Collapsible Features */}
                                            {plan.features.length > 7 && (
                                                <FeatureCollapse
                                                    features={plan.features.slice(7)}
                                                    isOpen={showAllFeatures}
                                                    onToggle={() => setShowAllFeatures(!showAllFeatures)}
                                                />
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section >
    );
}

function FeatureCollapse({
    features,
    isOpen,
    onToggle
}: {
    features: PlanFeature[],
    isOpen: boolean,
    onToggle: () => void
}) {
    return (
        <>
            {isOpen && features.map((f, i) => (
                f.isHeader ? (
                    <li key={`more-${i}`} className="font-semibold text-foreground/90 mt-5 mb-2 text-xs uppercase tracking-wide border-l-2 border-primary/40 pl-2 animate-in fade-in slide-in-from-top-1 duration-200">{f.label}</li>
                ) : (
                    <li key={`more-${i}`} className="flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {f.included ? (
                            <Check className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                            <X className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <span
                            className={cn(
                                "leading-tight",
                                f.included
                                    ? "text-foreground"
                                    : "text-muted-foreground/60 line-through"
                            )}
                        >
                            {f.label}
                        </span>
                    </li>
                )
            ))}
            <li className="pt-2">
                <button
                    onClick={onToggle}
                    className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                    {isOpen ? "Show less" : "See all features"}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen ? "rotate-180" : "")} />
                </button>
            </li>
        </>
    );
}

