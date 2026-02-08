import { PricingModule, PricingPlan } from "@/components/ui/pricing-module";
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
                { label: "Core Immigration Tools (Manual Access)", included: true, isHeader: true },
                { label: "OPT Apply Dates (I-765 Window)", included: true },
                { label: "OPT Clock Tracker (90-Day Limit)", included: true },
                { label: "STEM OPT Dates (Extension Window)", included: true },
                { label: "STEM Clock Tracker (60-Day Limit)", included: true },
                { label: "Tools Open on Demand (No Automation)", included: false },

                { label: "Tracking & Insights", included: true, isHeader: true },
                { label: "OPT Approval Community Stats", included: true },
                { label: "USCIS Case Status (Manual Check)", included: true },
                { label: "H-1B Sponsor Intelligence (100 Companies)", included: true },

                { label: "Career Tools", included: true, isHeader: true },
                { label: "Job Application Tracker (5 Jobs)", included: true },
                { label: "Resume Generator (5/mo)", included: true },
                { label: "ATS Scanner (5/mo)", included: true },

                { label: "Platform Access", included: true, isHeader: true },
                { label: "Full Dashboard Access", included: true },
                { label: "Chrome Extension (Free)", included: true },
                { label: "Chrome Notifications (Basic)", included: true },

                { label: "Extras", included: true, isHeader: true },
                { label: "Health Insurance Info ($0/mo plans)", included: true },
                { label: "Tax Filing Info (No Coupons)", included: true },
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
                { label: "Smart Immigration Automation", included: true, isHeader: true },
                { label: "Daily 9AM Email Reminders", included: true },
                { label: "Smart Suggestions & Auto-Tracking", included: true },

                { label: "USCIS Case Tracker", included: true, isHeader: true },
                { label: "Auto-Checks Every 6 Hours", included: true },
                { label: "Instant Status Change Alerts", included: true },

                { label: "Faster & Deeper Insights", included: true, isHeader: true },
                { label: "Real-Time Accurate Approval Data", included: true },
                { label: "H-1B Sponsor Data (Unlimited)", included: true },

                { label: "Secure Storage", included: true, isHeader: true },
                { label: "Document Vault (Secure Storage)", included: true },
                { label: "Expiry Reminders (60d to 1d alerts)", included: true },

                { label: "Unlimited Career Tools", included: true, isHeader: true },
                { label: "Job App Tracker (Unlimited)", included: true },
                { label: "Resume Generator (500/mo)", included: true },
                { label: "ATS Scanner (Unlimited)", included: true },

                { label: "Platform & Benefits", included: true, isHeader: true },
                { label: "Chrome Ext + Priority Alerts", included: true },
                { label: "Sprintax Tax Coupon ($20 Value)", included: true },
                { label: "Special Offers (Save $100s)", included: true },
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

                { label: "Legal & Strategy Access", included: true, isHeader: true },
                { label: "1-on-1 Lawyer Session (1 hr/mo)", included: true },
                { label: "Complete Application Audit", included: true },
                { label: "Personalized Strategy Plan", included: true },

                { label: "Priority Support", included: true, isHeader: true },
                { label: "24/7 Dedicated Support", included: true },
                { label: "Priority Responses", included: true },
                { label: "Resume Generator (1000/mo)", included: true },
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
