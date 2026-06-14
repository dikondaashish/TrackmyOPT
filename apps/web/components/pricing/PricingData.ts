import {
    Bell,
    Clock,
    Shield,
    FileCheck,
    Briefcase,
    Zap,
} from "lucide-react";

export { PLAN_COMPARISON_FEATURES as comparisonFeatures } from "@/lib/pricing/plan-features";

export const pricingFaqs = [
    {
        q: "When should I choose Dedicated over Pro?",
        a: "Choose Pro if you want automated USCIS monitoring, unemployment alerts, document vault, and career tools — it covers most OPT and STEM OPT students. Choose Dedicated if you want monthly access to a licensed immigration attorney, hands-on application completeness review, or 24/7 priority support for a complex case (RFE, status issues, or H-1B planning).",
    },
    {
        q: "Is TrackMyOPT premium worth it?",
        a: "Yes — for F-1 students on OPT or STEM OPT, premium is worth it because it automates unemployment day tracking, sends deadline alerts before USCIS cutoffs, and consolidates job tracking, resume tools, and I-983 planning in one place. Missing an OPT deadline can result in status termination, making the cost of premium negligible compared to the risk.",
    },
    {
        q: "What does TrackMyOPT premium include that the free plan doesn't?",
        a: "Premium adds automated deadline reminders, unemployment day alerts, daily USCIS case auto-checks, employer tracking, unlimited AI resume generation, secure document vault, STEM OPT extension planning, and priority support — all designed to eliminate manual USCIS monitoring and reduce compliance risk.",
    },
    {
        q: "Can I track OPT without TrackMyOPT premium?",
        a: "You can track basic dates manually with the free plan, but premium removes the risk of human error for unemployment day counts, which directly affect your F-1 status. A single miscalculation could push you over the 90-day limit and trigger status termination.",
    },
    {
        q: "Is TrackMyOPT free enough for OPT students?",
        a: "The free plan is a solid starting point for basic OPT date tracking. However, OPT students managing unemployment limits, job transitions, or STEM OPT extensions benefit significantly from premium automation to stay compliant and avoid costly errors.",
    },
    {
        q: "Is TrackMyOPT really free?",
        a: "Yes. The Free plan includes core OPT tracking features — timeline calculator, unemployment clock, STEM extension tools, manual USCIS case checks, and basic career tools. These are free forever, no credit card required.",
    },
    {
        q: "Can I try Pro before paying?",
        a: "Pro includes one 7-day free trial per account, ever: the first time you complete Pro checkout you can start with a trial (full access). After that, Pro checkout starts billing on Stripe’s schedule with no additional trial period. Cancel anytime before the trial ends and you will not be charged.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe, a PCI DSS Level 1 certified payment processor. All transactions are processed by Stripe over an encrypted connection.",
    },
    {
        q: "What is your refund policy?",
        a: "Pro includes a 7-day free trial when eligible—cancel before it ends and you are not charged. Dedicated is billed immediately with a 3-day money-back guarantee on the first paid month only. After those windows, we generally do not refund change-of-mind charges. See our Refund Policy for exceptions.",
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Yes. Go to Settings → Subscription → Cancel subscription (Stripe billing portal). Cancellation stops future charges; you keep access through the end of your current paid or trial period.",
    },
    {
        q: "Do you offer annual billing?",
        a: "Yes. Annual billing saves you up to 40% compared to paying monthly. In the app we show the monthly equivalent for annual plans (about $4.17/mo for Pro and $12.50/mo for Dedicated) with a clear \"billed yearly\" label; you are charged the full annual amount at checkout.",
    },
    {
        q: "Is my payment information secure?",
        a: "All payments are processed by Stripe, a PCI Level 1 certified payment processor. We never store your credit card information on our servers.",
    },
];

export const testimonials = [
    {
        quote: "I was manually tracking my unemployment days in a spreadsheet and almost missed the 90-day limit. Premium alerts saved my OPT status — I got a warning at day 75 and found a job in time.",
        name: "Priya S.",
        role: "CS Graduate",
        university: "University of Illinois",
    },
    {
        quote: "The daily USCIS auto-check caught my case status change the same morning it happened. Without premium, I wouldn't have known for days. Worth every penny for the peace of mind alone.",
        name: "Wei L.",
        role: "ECE Graduate",
        university: "Georgia Tech",
    },
    {
        quote: "As a STEM OPT student, tracking the 150-day unemployment limit across two employers was a nightmare. TrackMyOPT Premium handles it automatically and sends me weekly reports. I recommend it to every international student I know.",
        name: "Ravi M.",
        role: "Data Science Graduate",
        university: "UC Berkeley",
    },
];

export const whyPremiumReasons = [
    {
        icon: Bell,
        title: "Automated Deadline Alerts",
        description: "Daily 9AM email reminders before every USCIS cutoff. Never miss a filing window, reporting deadline, or unemployment limit.",
        risk: "Missing a deadline can terminate your F-1 status",
    },
    {
        icon: Clock,
        title: "Automated Unemployment Tracking",
        description: "Automatic counting of unemployment days with alerts at 60, 75, and 85 days. Tracks across job transitions and gaps.",
        risk: "Exceeding 90 days ends your OPT authorization",
    },
    {
        icon: Shield,
        title: "Daily USCIS Case Monitoring",
        description: "Your case status checked every morning. Email when we detect changes on scheduled daily checks — approvals, RFEs, or transfers.",
        risk: "Delayed RFE response can result in case denial",
    },
    {
        icon: FileCheck,
        title: "Secure Document Vault",
        description: "Store your I-20, EAD, passport, and tax documents in one encrypted vault with expiry reminders. Always ready for employer audits.",
        risk: "Lost documents cause delays and missed opportunities",
    },
    {
        icon: Briefcase,
        title: "Unlimited Career Tools",
        description: "Unlimited AI resume generation, ATS scanning, job tracking, and full H-1B sponsor database with approval rate data.",
        risk: "Poor resume formatting = automatic ATS rejection",
    },
    {
        icon: Zap,
        title: "STEM OPT Compliance",
        description: "I-983 training plan tracking, E-Verify employer verification, and 150-day unemployment monitoring across the full 36-month OPT period.",
        risk: "STEM OPT violations affect future H-1B eligibility",
    },
];
