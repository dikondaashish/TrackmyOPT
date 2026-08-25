import {
    Bell,
    Clock,
    Shield,
    FileCheck,
    Briefcase,
    Zap,
} from "lucide-react";
import {
    DEDICATED_CONSULTATION_MINUTES,
    PRO_PAID_INTRO_PRICE,
    PRO_TRIAL_DAYS,
} from "@/lib/legal/legal-config";
import { PLAN_PRICES, annualSavingsPercent } from "@/lib/pricing/plan-config";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";

export { PLAN_COMPARISON_FEATURES as comparisonFeatures } from "@/lib/pricing/plan-features";

const basePricingFaqs = [
    {
        q: "Is TrackMyOPT Pro worth it?",
        a: "For most OPT and STEM OPT students, Pro is worth it if you want daily 9:00 AM ET reminders, unemployment day tracking with alerts, and USCIS case monitoring in one place — without spreadsheets. It helps you stay organized before deadlines sneak up. Always confirm requirements with your DSO.",
    },
    {
        q: "What does TrackMyOPT Pro include that the free plan doesn't?",
        a: "Pro adds 9:00 AM ET email reminders for all four trackers, daily USCIS auto-checks with change alerts, Document Vault, higher AI resume/ATS limits, and STEM OPT planning — designed to reduce the chance of missing deadlines. Free keeps manual case refresh and core OPT calculators.",
    },
    {
        q: "Can I track OPT without TrackMyOPT Pro?",
        a: "Yes. The free plan covers core OPT timelines, unemployment clocks, and manual case checks. Pro helps if you want automated reminders and daily USCIS monitoring so you spend less time tracking dates manually.",
    },
    {
        q: "Is TrackMyOPT free enough for OPT students?",
        a: "The free plan is a solid start for one OPT timeline. Students juggling unemployment limits, job changes, or STEM extensions often upgrade to Pro for daily reminders and alerts.",
    },
    {
        q: "Is TrackMyOPT really free?",
        a: "Yes. The Free plan includes core OPT tracking features — timeline calculator, unemployment clock, STEM extension tools, manual USCIS case checks, and basic career tools. These are free forever, no credit card required.",
    },
    {
        q: "Can I try Pro before paying?",
        a: `Eligible accounts can start Pro for $${PRO_PAID_INTRO_PRICE.toFixed(2)} for the first ${PRO_TRIAL_DAYS} days. It is a paid introductory period, not a free trial, and then renews at the selected monthly or annual price unless canceled.`,
    },
    {
        q: "What payment methods do you accept?",
        a: "Stripe securely displays the eligible payment methods enabled for your location and checkout session. TrackMyOPT never stores your full payment credentials.",
    },
    {
        q: "What is your refund policy?",
        a: `For eligible Pro accounts, only the $${PRO_PAID_INTRO_PRICE.toFixed(2)} introductory charge is refundable during the first ${PRO_TRIAL_DAYS} days. Pro renewal charges are not refundable for change of mind. Dedicated has a separate 3-day guarantee on its first subscription charge.`,
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Yes. Go to Settings → Subscription → Cancel subscription (Stripe billing portal). Cancellation stops future charges; you keep access through the end of your current paid or introductory period.",
    },
    {
        q: "Do you offer annual billing?",
        a: `Yes. Annual Pro is $${PLAN_PRICES.pro.year.toFixed(2)} (about $${(PLAN_PRICES.pro.year / 12).toFixed(2)}/month), saving ${annualSavingsPercent("pro")}% versus monthly billing. The full annual amount is charged at checkout.`,
    },
    {
        q: "Is my payment information secure?",
        a: "All payments are processed by Stripe, a PCI Level 1 certified payment processor. We never store your credit card information on our servers.",
    },
];

const dedicatedFaqs = [
    {
        q: "When should I choose Dedicated over Pro?",
        a: `Choose Pro for automated tracking and the complete career workflow. Choose Dedicated for higher career-tool capacity, priority support, and one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial consultation per account with a partnered licensed immigration attorney, subject to availability, conflict checks, acceptance, and the Dedicated terms.`,
    },
];

/** FAQs for /pricing — omit Dedicated sales Qs when the plan is closed to new purchases. */
export const pricingFaqs = shouldShowDedicatedPlanForSale()
    ? [...dedicatedFaqs, ...basePricingFaqs]
    : basePricingFaqs;

export const testimonials = [
    {
        quote: "I tracked unemployment days in a spreadsheet and almost lost count. Pro emailed me at day 75 — I had time to log my new job and stay organized.",
        name: "Priya S.",
        role: "CS Graduate",
        university: "University of Illinois",
    },
    {
        quote: "Pro caught my USCIS status change the same morning it posted. I could review it and talk to my DSO right away instead of finding out days later.",
        name: "Wei L.",
        role: "ECE Graduate",
        university: "Georgia Tech",
    },
    {
        quote: "On STEM OPT I had two employers to track. TrackMyOPT Pro keeps my unemployment days and reminders in one place — I recommend it to every international student I know.",
        name: "Ravi M.",
        role: "Data Science Graduate",
        university: "UC Berkeley",
    },
];

export const whyPremiumReasons = [
    {
        icon: Bell,
        title: "Daily OPT Deadline Reminders",
        description: "9:00 AM ET emails before I-765 filing windows, unemployment limits, and STEM reporting dates.",
        risk: "Missing a deadline can disrupt your OPT timeline — check with your DSO",
    },
    {
        icon: Clock,
        title: "Unemployment Day Tracking",
        description: "Automatic counting with alerts as you approach the 90- or 150-day limits.",
        risk: "Stay organized so you know when to log employment or talk to your DSO",
    },
    {
        icon: Shield,
        title: "Daily USCIS Case Monitoring",
        description: "Your case checked each morning. Email when we detect a status change on scheduled checks.",
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
        title: "Visa-Aware Career Tools",
        description: "AI resume tailoring, ATS analysis, job tracking, application prefill, and full H-1B sponsor data in one workflow.",
        risk: "Poor resume formatting = automatic ATS rejection",
    },
    {
        icon: Zap,
        title: "STEM OPT Compliance",
        description: "I-983 training plan tracking, E-Verify employer verification, and 150-day unemployment monitoring across the full 36-month OPT period.",
        risk: "STEM OPT violations affect future H-1B eligibility",
    },
];
