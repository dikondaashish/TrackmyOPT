import { PricingModule, PricingPlan } from "@/components/pricing/pricing-module";
import { Layers, Rocket, ShieldCheck } from "lucide-react";

export function LandingPricing() {
    const plans: PricingPlan[] = [
        {
            id: "free",
            name: "Free",
            description: "Essential timeline tracking for every F-1 student.",
            icon: <Layers className="w-10 h-10 text-muted-foreground" />,
            priceMonthly: 0,
            priceYearly: 0,
            users: "Forever Free",
            buttonLabel: "Create Free Account",
            features: [
                { label: "Core Immigration Tools", included: true, isHeader: true },
                { label: "OPT Filing Window Calculator", included: true, tooltip: "Calculate your I-765 filing window" },
                { label: "OPT 90-Day Unemployment Tracker", included: true, tooltip: "Track your 90-day unemployment limit" },
                { label: "STEM Extension Calculator", included: true, tooltip: "Calculate your STEM extension filing window" },
                { label: "STEM 60-Day Unemployment Tracker", included: true, tooltip: "Track your 60-day unemployment limit" },

                { label: "Tracking & Insights", included: true, isHeader: true },
                { label: "OPT Approval Community Stats", included: true, tooltip: "Community-driven approval trends" },
                { label: "USCIS Case Status (Manual Check)", included: true },
                { label: "H-1B Sponsor Data (100 Companies)", included: true },

                { label: "Career Tools", included: true, isHeader: true },
                { label: "Job Application Tracker (5 Jobs)", included: true },
                { label: "Resume Generator (5/mo)", included: true },
                { label: "ATS Resume Scanner (5/mo)", included: true },

                { label: "Platform Access", included: true, isHeader: true },
                { label: "Full Dashboard Access", included: true },
                { label: "Chrome Extension", included: true },
                { label: "Basic Notifications", included: true },

                { label: "Extras", included: true, isHeader: true },
                { label: "Health Insurance Plans (from $0/mo)", included: true },
                { label: "Tax Filing Resources", included: true },
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
            buttonLabel: "Start 7-Day Free Trial",
            features: [
                { label: "Everything in Free, plus:", included: true },

                { label: "Smart Automation", included: true, isHeader: true },
                { label: "Daily 9AM Email Reminders", included: true, tooltip: "All OPT & STEM tools with daily email updates" },
                { label: "Smart Suggestions & Auto-Tracking", included: true },

                { label: "USCIS Case Tracker", included: true, isHeader: true },
                { label: "Daily Auto-Checks", included: true, tooltip: "Automatic daily case status monitoring" },
                { label: "Instant Status Change Alerts", included: true, tooltip: "Email alerts for any status changes" },

                { label: "Enhanced Insights", included: true, isHeader: true },
                { label: "Real-Time Approval Data", included: true, tooltip: "Faster, more accurate approval stats" },
                { label: "H-1B Sponsor Data (Unlimited)", included: true },

                { label: "Secure Storage", included: true, isHeader: true },
                { label: "Document Vault", included: true, tooltip: "Secure document storage" },
                { label: "Expiry Reminders", included: true, tooltip: "Alerts at 60, 45, 30, 20, 15, 10, 5, 3, 2, 1 days before expiry" },

                { label: "Unlimited Career Tools", included: true, isHeader: true },
                { label: "Job App Tracker (Unlimited)", included: true },
                { label: "Resume Generator (500/mo)", included: true },
                { label: "ATS Scanner (Unlimited)", included: true },

                { label: "Premium Benefits", included: true, isHeader: true },
                { label: "Priority Chrome Notifications", included: true },
                { label: "Sprintax Tax Coupon ($20 Value)", included: true },
                { label: "Exclusive Partner Offers", included: true, tooltip: "Save $100s with partner discounts" },
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
            buttonLabel: "Get Started",
            features: [
                { label: "Everything in Pro", included: true },
                { label: "Resume Generator (1000/mo)", included: true },

                { label: "Legal & Strategy Access", included: true, isHeader: true },
                { label: "1-on-1 Lawyer Session (1 hr/mo)", included: true, tooltip: "1 hour per month included" },
                { label: "Complete Application Audit", included: true },
                { label: "Personalized Strategy Plan", included: true, tooltip: "Custom immigration strategy" },

                { label: "Priority Support", included: true, isHeader: true },
                { label: "24/7 Dedicated Support", included: true },
                { label: "Priority Responses", included: true, tooltip: "Priority across all channels" },
            ],
            recommended: false,
            badge: "Best Value",
        },
    ];

    return (
        <section id="pricing" className="py-24 relative">
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[2px] -z-10" />
            <PricingModule
                title="Simple, Transparent Pricing"
                subtitle="Start for free, upgrade when you're ready. Cancel anytime."
                annualBillingLabel="Annual Billing"
                buttonLabel="Start 7-Day Free Trial"
                plans={plans}
                defaultAnnual={false}
                className="!bg-transparent !py-0" // Override internal styles
            />
        </section>
    );
}
