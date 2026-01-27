import { PricingModule, PricingPlan } from "@/components/ui/pricing-module";
import { Layers, Rocket, ShieldCheck } from "lucide-react";

export function LandingPricing() {
    const plans: PricingPlan[] = [
        {
            id: "free",
            name: "Free",
            description: "Essential tools for every F-1 student.",
            icon: <Layers className="w-10 h-10 text-muted-foreground" />,
            priceMonthly: 0,
            priceYearly: 0,
            users: "Forever Free",
            features: [
                { label: "TrackMyOPT Chrome Extension", included: true },
                { label: "Job Application Tracker", included: true },
                { label: "Case Status Updates", included: true },
                { label: "Community Access", included: true },
                { label: "Dedicated Lawyer Support", included: false },
            ],
            recommended: false,
        },
        {
            id: "pro",
            name: "Pro",
            description: "Accelerate your job search & compliance.",
            icon: <Rocket className="w-10 h-10 text-primary" />,
            priceMonthly: 4.99,
            priceMonthlyOriginal: 7.99,
            priceYearly: 49.99,
            priceYearlyOriginal: 79.99,
            users: "7-Day Free Trial",
            features: [
                { label: "Everything in Free", included: true },
                { label: "Priority Case Alerts", included: true },
                { label: "Verified H-1B Sponsor Data", included: true },
                { label: "Resume Builder (ATS Optimized)", included: true },
                { label: "Detailed Job Analytics", included: true },
            ],
            recommended: true,
            badge: "Most Popular",
        },
        {
            id: "dedicated",
            name: "Dedicated",
            description: "Ultimate peace of mind with legal backup.",
            icon: <ShieldCheck className="w-10 h-10 text-primary" />,
            priceMonthly: 14.99,
            priceMonthlyOriginal: 19.99,
            priceYearly: 149.99,
            priceYearlyOriginal: 199.99,
            users: "1-Hr Lawyer Session Included",
            features: [
                { label: "Everything in Pro", included: true },
                { label: "24/7 Dedicated Support", included: true },
                { label: "1-on-1 Lawyer Session (1 hr/mo)", included: true },
                { label: "Complete Application Audit", included: true },
                { label: "Personalized Strategy Plan", included: true },
            ],
            recommended: false,
            badge: "Best Value",
        },
    ];

    return (
        <div id="pricing">
            <PricingModule
                title="Simple, Transparent Pricing"
                subtitle="Start for free, upgrade when you're ready. Cancel anytime."
                annualBillingLabel="Annual Billing"
                buttonLabel="Start 7-Day Free Trial"
                plans={plans}
                defaultAnnual={true}
            />
        </div>
    );
}
