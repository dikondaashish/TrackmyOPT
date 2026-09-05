import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, TrendingUp, BookOpen } from "lucide-react";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import { researchBlogCards } from "@/data/blog-series";
import { formatUsd, OFFERS_CATALOG_TOTAL_SAVINGS_USD } from "@/lib/offers/catalog-savings";

export const metadata: Metadata = {
    title: "OPT & F-1 Visa Blog — Guides for International Students",
    description: "Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, USCIS case tracking, and unemployment day rules. Written by former F-1 students.",
    keywords: ["OPT blog", "F-1 visa guide", "STEM OPT blog", "H-1B guide", "international student blog", "OPT tips"],
    alternates: {
        canonical: "https://www.trackmyopt.com/blog",
    },
    openGraph: {
        title: "OPT & F-1 Visa Blog — Guides for International Students",
        description: "Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, USCIS case tracking, and unemployment day rules.",
        url: "https://www.trackmyopt.com/blog",
        siteName: "TrackMyOPT",
        type: "website",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "TrackMyOPT Blog",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "OPT & F-1 Visa Blog — Guides for International Students",
        description: "Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, and USCIS case tracking.",
        images: ["/og-image.jpg"],
    },
};

const blogPosts = [
    ...researchBlogCards,
    {
        slug: "trackmyopt-student-deals-guide",
        title: `TrackMyOPT Student Deals: Save on AI, Health & Banking (Login Required)`,
        description: `Unlock ${formatUsd(OFFERS_CATALOG_TOTAL_SAVINGS_USD)}+ in verified student perks for F-1 and OPT workers — GitHub, Google AI, Wise, LinkedIn, and more. Available inside your dashboard after sign-in.`,
        category: "Student Life",
        readTime: "6 min read",
        date: "September 1, 2026",
        tags: ["Student Deals", "OPT", "College Email", "Savings"],
        featured: false,
    },
    {
        slug: "f1-visa-interview-country-of-residence-rule-2026",
        title: "New F-1 Visa Interview Rule: Apply in Your Country of Nationality or Residence",
        description: "The July 15, 2026 State Department rule changes where F-1 and OPT students should book visa interviews. Learn the third-country risks and planning steps.",
        category: "Visa Policy Update",
        readTime: "9 min read",
        date: "August 11, 2026",
        tags: ["F-1 Visa", "Visa Interview", "Travel", "OPT"],
        featured: true,
        image: "/blog/f1-visa-interview-country-of-residence-rule-2026.png"
    },
    {
        slug: "august-2026-visa-bulletin-opt-workers",
        title: "August 2026 Visa Bulletin: EB-2 India Unavailable and EB-1 at Risk",
        description: "EB-2 India is unavailable for final action and EB-1 India may follow. Understand the impact on OPT workers, I-140 petitions, and I-485 filings.",
        category: "Green Card Update",
        readTime: "10 min read",
        date: "August 11, 2026",
        tags: ["Visa Bulletin", "EB-2", "Green Card", "India"],
        featured: true,
        image: "/blog/august-2026-visa-bulletin-opt-workers.png"
    },
    {
        slug: "f1-visa-social-media-screening-2026",
        title: "F-1 Visa Social Media Screening in 2026: What Officers Can Review",
        description: "F-1 visa applicants face online-presence review and are instructed to make social profiles public. Separate confirmed requirements from rumors.",
        category: "Visa Screening Update",
        readTime: "9 min read",
        date: "August 11, 2026",
        tags: ["F-1 Visa", "Social Media", "DS-160", "Visa Interview"],
        featured: true,
        image: "/blog/f1-visa-social-media-screening-2026.png"
    },
    {
        slug: "uscis-deny-without-rfe-policy-2026",
        title: "USCIS Can Deny Your Case Without an RFE: What Changed August 5, 2026",
        description: "USCIS restored officers' discretion to deny incomplete cases without first sending an RFE or NOID. Learn who is affected and how to file a complete case.",
        category: "Critical USCIS Update",
        readTime: "10 min read",
        date: "August 11, 2026",
        tags: ["USCIS", "RFE", "Evidence", "OPT"],
        featured: true,
        image: "/blog/uscis-deny-without-rfe-policy-2026.png"
    },
    {
        slug: "h1b-fy2027-cap-closed-no-second-lottery",
        title: "USCIS Closes FY 2027 H-1B Cap: No Second Lottery & What OPT Students Must Do Next",
        description: "USCIS has officially reached the 85,000 cap for FY 2027 H-1B petitions and announced there will be no second lottery. Discover your backup options if you weren't selected.",
        category: "Breaking News",
        readTime: "6 min read",
        date: "July 18, 2026",
        tags: ["H-1B", "Second Lottery", "USCIS"],
        featured: true,
        image: "/blog/h1b-fy2027-cap-closed-no-second-lottery.png"
    },
    {
        slug: "uscis-new-strict-signature-requirements-2026",
        title: "Don't Get Denied: Navigate USCIS's New Strict Signature Rules for OPT",
        description: "USCIS has implemented stricter signature requirements for all applications, including Form I-765. Learn how to sign correctly to avoid instant denial.",
        category: "Compliance Update",
        readTime: "5 min read",
        date: "July 16, 2026",
        tags: ["USCIS", "Signatures", "I-765"],
        featured: true,
        image: "/blog/uscis-new-strict-signature-requirements-2026.png"
    },
    {
        slug: "f1-visa-interview-waivers-restricted-2026",
        title: "F-1 Visa Renewals in 2026: Why You Now Need an In-Person Interview",
        description: "The State Department has severely restricted interview waivers for nonimmigrant visas in 2026. Prepare for mandatory in-person consular interviews if traveling home.",
        category: "Travel Update",
        readTime: "6 min read",
        date: "July 15, 2026",
        tags: ["Travel", "Visa Interview", "Dropbox"],
        featured: false,
        image: "/blog/f1-visa-interview-waivers-restricted-2026.png"
    },
    {
        slug: "opt-premium-processing-fee-increase-1780",
        title: "Is the $1,780 Premium Processing Fee Worth It for Your OPT Application?",
        description: "USCIS increased the premium processing fee for Form I-765 to $1,780. We break down the timeline and help you decide if it's worth the cost for your OPT application.",
        category: "USCIS Fees",
        readTime: "7 min read",
        date: "July 14, 2026",
        tags: ["Premium Processing", "Fees", "USCIS"],
        featured: false,
        image: "/blog/opt-premium-processing-fee-increase-1780.png"
    },
    {
        slug: "form-i9-complete-guide",
        title: "Form I-9: The Complete 2026 Guide for Employees & Employers",
        description: "Everything you need to know about Form I-9 Employment Eligibility Verification — who fills it out, what documents are accepted, deadlines, and how OPT/STEM OPT students complete it.",
        category: "Compliance",
        readTime: "10 min read",
        date: "February 23, 2026",
        tags: ["Form I-9", "Employment Eligibility", "OPT", "Compliance"],
        featured: true,
        image: "/blog/form-i9.png"
    },
    {
        slug: "form-i765-ead-application-guide",
        title: "Form I-765: The Complete Guide to Applying for Your EAD Card (OPT & STEM OPT 2026)",
        description: "How to apply for your EAD card using Form I-765 — eligibility categories, filing fees, processing times, and step-by-step instructions for F-1 OPT and STEM OPT students.",
        category: "OPT",
        readTime: "12 min read",
        date: "February 21, 2026",
        tags: ["Form I-765", "EAD Card", "OPT Application", "STEM OPT"],
        featured: true,
        image: "/blog/form-i765.png"
    },
    {
        slug: "second-masters-opt-eligibility",
        title: "Can I Apply for OPT Again After a Second Master's Degree? (2026 Guide)",
        description: "Discover the USCIS rules on OPT eligibility when pursuing a second Master's degree. Learn about the 'once per higher degree level' rule.",
        category: "Compliance",
        readTime: "5 min read",
        date: "May 13, 2026",
        tags: ["F-1 Visa", "OPT Rules", "Second Degree"],
        featured: true,
        image: "/blog/second-masters-opt.png"
    },
    {
        slug: "start-company-f1-student-visa",
        title: "How to Start a Company on an F-1 Student Visa (Without Violating Your Status)",
        description: "Can an international student start a business in the US? Yes, but with strict limits. Learn how to incorporate and passively invest while on an F-1 visa.",
        category: "Careers",
        readTime: "8 min read",
        date: "May 25, 2026",
        tags: ["F-1 Visa", "Startup", "Entrepreneurship"],
        featured: true,
        image: "/blog/f1-startup.png"
    },
    {
        slug: "start-company-f1-opt-visa",
        title: "The Founder's Guide to Starting a Company on F-1 OPT (2026)",
        description: "Did you know you can be self-employed on OPT? Learn how to legally work for your own startup during your initial 12-month OPT period.",
        category: "Careers",
        readTime: "7 min read",
        date: "May 22, 2026",
        tags: ["OPT", "Startup", "Entrepreneurship"],
        featured: true,
        image: "/blog/f1-opt-startup.png"
    },
    {
        slug: "start-company-f1-stem-opt",
        title: "Can You Run a Startup on STEM OPT? The E-Verify Rules Explained (2026)",
        description: "Unlike standard OPT, STEM OPT explicitly forbids self-employment. Learn how founders restructure their startups with a Board of Directors to qualify for STEM OPT.",
        category: "Careers",
        readTime: "8 min read",
        date: "May 24, 2026",
        tags: ["STEM OPT", "Startup", "E-Verify"],
        featured: true,
        image: "/blog/f1-stem-opt-startup.png"
    },
    {
        slug: "uscis-green-card-adjustment-of-status-update-2026",
        title: "USCIS Adjustment of Status Policy Shift: 'Discretionary Grace' Explained (2026)",
        description: "May 2026 USCIS policy memo shifts 'Adjustment of Status' for Green Cards to an act of 'discretionary grace,' pushing many applicants to consular processing.",
        category: "Important",
        readTime: "7 min read",
        date: "May 28, 2026",
        tags: ["USCIS", "Green Card", "Adjustment of Status"],
        featured: true,
        image: "/blog/green-card-processing.png"
    },
    {
        slug: "dol-prevailing-wage-hikes-h1b-impact-2026",
        title: "DOL Proposes Massive Prevailing Wage Hikes for H-1B: What It Means (2026)",
        description: "The Department of Labor has proposed significant hikes to prevailing wage thresholds for H-1B, E-3, and PERM programs. Learn how this impacts international graduates.",
        category: "H-1B",
        readTime: "7 min read",
        date: "May 14, 2026",
        tags: ["H-1B", "Prevailing Wage", "DOL"],
        featured: true,
        image: "/blog/prevailing-wage-hikes.png"
    },
    {
        slug: "opt-stem-opt-legislation-congress-2026",
        title: "Dueling Congress Bills Target OPT & STEM OPT: What You Need to Know (2026)",
        description: "New 2026 legislation in Congress targets the OPT program. While some bills aim to restrict it, bipartisan efforts are pushing to protect and codify OPT into federal law.",
        category: "Important",
        readTime: "6 min read",
        date: "May 22, 2026",
        tags: ["OPT", "STEM OPT", "Congress"],
        featured: true,
        image: "/blog/opt-congress-bills.png"
    },
    {
        slug: "h1b-weighted-selection-process-fy2027",
        title: "FY 2027 H-1B Weighted Selection Process Explained (2026 Update)",
        description: "USCIS has implemented a new weighted selection process for the FY 2027 H-1B cap season. Learn how this favors higher-skilled workers and what it means for applicants.",
        category: "H-1B",
        readTime: "5 min read",
        date: "March 8, 2026",
        tags: ["H-1B", "Lottery", "FY 2027", "Wage Levels"],
        featured: true,
        image: "/blog/h1b-weighted-selection.png"
    },
    {
        slug: "opt-cpt-enforcement-scrutiny-2026",
        title: "Increased Scrutiny on OPT and CPT: What International Students Need to Know (2026)",
        description: "Government enforcement and scrutiny regarding OPT and CPT programs are intensifying in 2026. Learn how to stay compliant and protect your F-1 status.",
        category: "Important",
        readTime: "6 min read",
        date: "May 13, 2026",
        tags: ["OPT", "CPT", "Compliance", "Scrutiny"],
        featured: true,
        image: "/blog/opt-cpt-scrutiny.png"
    },
    {
        slug: "90-day-unemployment-rule-opt",
        title: "The 90-Day OPT Unemployment Rule: Everything You Need to Know in 2026",
        description: "Understand the 90-day unemployment limit for OPT, how days are counted, what counts as employment, and how to avoid violating your F-1 status.",
        category: "OPT Basics",
        readTime: "8 min read",
        date: "January 13, 2026",
        tags: ["OPT", "Unemployment", "F-1 Visa"],
        featured: true,
    },
    {
        slug: "when-does-opt-unemployment-clock-start",
        title: "When Does the OPT Unemployment Clock Start? (2026)",
        description: "Learn when OPT unemployment days begin, whether EAD delays count, how job gaps are calculated, and how to track your remaining days.",
        category: "OPT Compliance",
        readTime: "9 min read",
        date: "July 27, 2026",
        tags: ["OPT", "Unemployment", "EAD", "Compliance"],
        featured: true,
    },
    {
        slug: "laid-off-on-opt",
        title: "Laid Off on OPT? Reporting Deadlines, Unemployment Days & Next Steps",
        description: "What to report after an OPT layoff, how unemployment days are counted, what evidence to save, and how to plan your next qualifying role.",
        category: "OPT Compliance",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["OPT", "Layoff", "Unemployment", "Compliance"],
        featured: true,
    },
    {
        slug: "laid-off-on-stem-opt",
        title: "Laid Off on STEM OPT? I-983, Employer Changes & the 150-Day Rule",
        description: "A practical guide to final evaluations, reporting a STEM OPT layoff, completing a new I-983, and protecting your 150-day unemployment buffer.",
        category: "STEM OPT",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["STEM OPT", "Layoff", "I-983", "Unemployment"],
        featured: true,
    },
    {
        slug: "change-employers-stem-opt",
        title: "How to Change Employers on STEM OPT: New I-983 and SEVIS Deadlines",
        description: "The correct STEM OPT employer-change sequence, including final evaluations, E-Verify checks, new I-983 requirements, and DSO reporting.",
        category: "STEM OPT",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["STEM OPT", "Employer Change", "I-983", "SEVIS"],
        featured: true,
    },
    {
        slug: "stem-opt-six-month-validation-report",
        title: "STEM OPT 6-Month Validation Reports and Self-Evaluations: Complete Calendar",
        description: "Track six-month validation reports, the 12-month self-evaluation, final evaluation, and change-reporting windows with one STEM OPT calendar.",
        category: "STEM OPT",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["STEM OPT", "Reporting", "I-983", "Deadlines"],
        featured: true,
    },
    {
        slug: "opt-job-related-to-degree",
        title: "How to Explain How Your OPT Job Relates to Your Degree (SEVP Examples)",
        description: "What to write in the SEVP 'relation to field of study' field — copy-ready examples for CS, Business, Biology, and a duty-based template.",
        category: "OPT Employment",
        readTime: "12 min read",
        date: "September 1, 2026",
        tags: ["SEVP Portal", "Degree Relationship", "OPT Employment", "F-1"],
        featured: true,
    },
    {
        slug: "opt-employment-evidence-checklist",
        title: "OPT Employment Evidence Checklist: What to Save for USCIS and Future Visas",
        description: "A complete recordkeeping checklist for OPT job duties, dates, hours, worksite, supervisors, reporting, pay records, and future filings.",
        category: "OPT Recordkeeping",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["OPT", "Documents", "Evidence", "H-1B"],
        featured: true,
    },
    {
        slug: "ead-card-lost-stolen-incorrect-never-delivered",
        title: "EAD Card Lost, Stolen, Incorrect or Never Delivered? Complete Recovery Guide",
        description: "Separate lost, incorrect, damaged, and non-delivered EAD problems and follow the correct USCIS recovery path.",
        category: "USCIS and EAD",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["EAD", "USCIS", "I-765", "OPT"],
        featured: true,
    },
    {
        slug: "can-you-start-work-before-opt-ead-arrives",
        title: "Can You Start Working Before Your OPT EAD Arrives?",
        description: "Understand the difference between an OPT offer, approval, EAD delivery, and the date you may lawfully begin work.",
        category: "OPT Work Authorization",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["OPT", "EAD", "Work Authorization", "I-9"],
        featured: true,
    },
    {
        slug: "what-counts-as-20-hours-on-opt",
        title: "What Counts as 20 Hours per Week on OPT? Multiple Jobs, Gaps and Part-Time Work",
        description: "Learn how the 20-hour threshold interacts with degree-related work, multiple jobs, changing schedules, and STEM OPT requirements.",
        category: "OPT Employment Rules",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["OPT", "20 Hours", "Part-Time", "Employment"],
        featured: true,
    },
    {
        slug: "employer-refuses-form-i983",
        title: "What If Your Employer Refuses to Complete or Sign Form I-983?",
        description: "What to document, who to contact, and what not to sign when an employer will not complete or sign your STEM OPT training plan.",
        category: "STEM OPT Employer Issues",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["STEM OPT", "I-983", "Employer", "Compliance"],
        featured: true,
    },
    {
        slug: "stem-opt-employer-site-visit-preparation",
        title: "STEM OPT Employer Site Visits: How Students and Employers Should Prepare",
        description: "Prepare for STEM OPT verification by keeping Form I-983, worksite, supervisor, compensation, training, and evaluation records consistent.",
        category: "STEM OPT Compliance",
        readTime: "10 min read",
        date: "July 27, 2026",
        tags: ["STEM OPT", "Site Visit", "I-983", "Employer"],
        featured: true,
    },
    {
        slug: "stem-opt-processing-time-2026",
        title: "STEM OPT Processing Time 2026: Current Wait Times & Timeline",
        description: "How long does STEM OPT take in 2026? Most I-765 extensions finish in 2–5 months. 180-day auto-extension rules, delay causes, and free case tracker.",
        category: "STEM OPT",
        readTime: "8 min read",
        date: "September 1, 2026",
        tags: ["STEM OPT", "Processing Time", "I-765", "Timeline"],
        featured: true,
    },
    {
        slug: "opt-unemployment-days-calculator-guide",
        title: "OPT Unemployment Days Calculator: How to Check & Track (2026)",
        description: "Count OPT unemployment days correctly: 90 on initial OPT, 150 with STEM. SEVP portal steps, weekend rules, and TrackMyOPT's free calculator.",
        category: "OPT Compliance",
        readTime: "7 min read",
        date: "September 1, 2026",
        tags: ["Unemployment Days", "SEVP Portal", "OPT Clock", "Compliance"],
        featured: true,
    },
    {
        slug: "opt-processing-time-2026",
        title: "OPT Processing Time 2026: Current Wait Times & Tips to Avoid Delays",
        description: "Latest EAD processing times for OPT applications in 2026. Learn how long USCIS takes, tips to speed up approval, and what to do while waiting.",
        category: "USCIS",
        readTime: "7 min read",
        date: "May 20, 2026",
        tags: ["OPT", "Processing Time", "USCIS"],
        featured: true,
    },
    {
        slug: "stem-opt-unemployment-limit",
        title: "STEM OPT Unemployment Limit: The 150-Day Rule Explained",
        description: "How the 150-day unemployment limit works for STEM OPT, counting rules, what qualifies as employment, and strategies to stay compliant.",
        category: "STEM OPT",
        readTime: "6 min read",
        date: "June 2, 2026",
        tags: ["STEM OPT", "Unemployment", "Compliance"],
    },
    {
        slug: "opt-application-checklist-2026",
        title: "OPT Application Checklist 2026: Complete I-765 Filing Guide",
        description: "Step-by-step checklist for filing your OPT application. Every document, form, and deadline you need to know to avoid RFEs and delays.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "May 25, 2026",
        tags: ["OPT", "I-765", "Application"],
    },
    {
        slug: "opt-to-h1b-transition",
        title: "OPT to H-1B Transition: Step-by-Step Timeline & Guide (2026)",
        description: "Complete guide to transitioning from OPT to H-1B. Timeline, cap-gap extension, employer requirements, and backup plans if you're not selected.",
        category: "H-1B",
        readTime: "9 min read",
        date: "April 25, 2026",
        tags: ["H-1B", "OPT", "Cap-Gap"],
        featured: true,
    },
    {
        slug: "i-983-training-plan-guide",
        title: "I-983 Training Plan for STEM OPT: Complete Guide (2026)",
        description: "Section-by-section guide to Form I-983. Employer requirements, E-Verify enrollment, common mistakes, and how to get it right the first time.",
        category: "STEM OPT",
        readTime: "8 min read",
        date: "March 17, 2026",
        tags: ["STEM OPT", "I-983", "E-Verify"],
    },
    {
        slug: "what-happens-if-opt-expires",
        title: "What Happens If Your OPT Expires? Next Steps & Options",
        description: "Your OPT is expiring — what now? The 60-day grace period, STEM OPT extension, H-1B cap-gap, and what happens to your F-1 status.",
        category: "OPT Basics",
        readTime: "7 min read",
        date: "June 11, 2026",
        tags: ["OPT", "Expiration", "Grace Period"],
    },
    {
        slug: "h1b-approval-rates-by-company",
        title: "H-1B Approval Rates by Company 2026: Data Analysis & Top Sponsors",
        description: "Which companies have the highest H-1B approval rates? Data-driven analysis of 25,000+ employers with approval rates, denial trends, and red flags.",
        category: "H-1B",
        readTime: "8 min read",
        date: "March 4, 2026",
        tags: ["H-1B", "Approval Rates", "Data"],
        featured: true,
    },
    {
        slug: "stem-opt-extension-guide",
        title: "Complete STEM OPT Guide 2026: Extension, Eligibility & Application",
        description: "The definitive guide to the 24-month STEM OPT extension. Eligibility, CIP codes, I-983, employer requirements, and unemployment rules.",
        category: "STEM OPT",
        readTime: "15 min read",
        date: "May 31, 2026",
        tags: ["STEM OPT", "Extension", "Guide"],
        featured: true,
    },
    {
        slug: "opt-extension-guide",
        title: "OPT Extension Guide 2026: How to Extend Your Work Authorization",
        description: "All ways to extend OPT: STEM OPT extension, H-1B cap-gap, and 180-day auto extension. Side-by-side comparison with eligibility details.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "April 14, 2026",
        tags: ["OPT", "Extension", "STEM OPT"],
    },
    {
        slug: "f1-visa-jobs-guide",
        title: "F-1 Visa Jobs 2026: How to Find Jobs as an International Student",
        description: "Complete job search strategy for F-1 students. Work authorization types, H-1B sponsor companies, industries hiring, and job board recommendations.",
        category: "Careers",
        readTime: "12 min read",
        date: "February 14, 2026",
        tags: ["F-1 Visa", "Jobs", "H-1B Sponsors"],
    },
    {
        slug: "opt-ead-card-guide",
        title: "OPT EAD Card 2026: How to Apply, Track & What to Do If Delayed",
        description: "Everything about your OPT EAD card. Step-by-step I-765 application, tracking methods, processing times, and what to do if delayed.",
        category: "OPT Basics",
        readTime: "9 min read",
        date: "April 13, 2026",
        tags: ["OPT", "EAD Card", "I-765"],
    },
    {
        slug: "h1b-cap-gap-extension",
        title: "H-1B Cap-Gap Extension Explained: Timeline, Work Auth & Rules",
        description: "How the cap-gap bridges OPT expiration and H-1B start date. Work authorization rules, timeline, and what happens if H-1B is denied.",
        category: "H-1B",
        readTime: "10 min read",
        date: "March 6, 2026",
        tags: ["H-1B", "Cap-Gap", "OPT"],
    },
    {
        slug: "day-1-cpt-vs-opt",
        title: "Day 1 CPT vs OPT: Key Differences Every F-1 Student Should Know",
        description: "Comprehensive comparison of Day 1 CPT and OPT. Eligibility, risks, immigration impact, and when OPT is the better choice.",
        category: "Important",
        readTime: "11 min read",
        date: "February 4, 2026",
        tags: ["CPT", "OPT", "Comparison"],
    },
    {
        slug: "f1-student-tax-filing-guide-2026",
        title: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step",
        description: "Complete guide to F-1 student tax filing in 2026. Learn which forms to file (Form 8843, 1040-NR), FICA exemptions, tax treaty benefits, and step-by-step filing instructions.",
        category: "Tax & Finance",
        readTime: "12 min read",
        date: "May 19, 2026",
        tags: ["Taxes", "Form 8843", "1040-NR"],
        featured: true,
    },
    {
        slug: "opt-premium-processing-timeline-2026",
        title: "OPT Premium Processing Timeline 2026: How Long It Really Takes",
        description: "Premium processing targets 30 business days for adjudication — but EAD delivery takes longer. Stage-by-stage timeline for initial OPT and STEM OPT with real 2026 case data.",
        category: "USCIS",
        readTime: "9 min read",
        date: "September 1, 2026",
        tags: ["Premium Processing", "OPT Timeline", "I-907", "EAD"],
        featured: true,
    },
    {
        slug: "opt-health-insurance-guide-2026",
        title: "Health Insurance While on OPT (2026): Plans, Costs & Options",
        description: "Lost school coverage after graduation? Compare employer plans, COBRA, ACA marketplace, and international student insurance for F-1 workers on OPT.",
        category: "Health",
        readTime: "11 min read",
        date: "September 1, 2026",
        tags: ["Health Insurance", "OPT", "ACA", "COBRA"],
        featured: true,
    },
    {
        slug: "uscis-case-status-tracking-guide",
        title: "How to Track Your USCIS Case Status Online: Complete Guide (2026)",
        description: "Step-by-step guide to tracking your USCIS I-765 OPT EAD case status. Learn what status messages mean, processing times, RFE explanations, and what to do if delayed.",
        category: "USCIS",
        readTime: "10 min read",
        date: "June 5, 2026",
        tags: ["USCIS", "Case Status", "I-765"],
        featured: true,
    },
    {
        slug: "can-you-travel-on-opt-complete-guide",
        title: "Can You Travel on OPT? Complete Travel Guide for F-1 Students",
        description: "Complete guide to traveling while on OPT: travel while pending, required documents, advanced parole, re-entry permits, and travel authorization explained.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "January 24, 2026",
        tags: ["OPT", "Travel", "Re-entry"],
    },
    {
        slug: "ats-resume-international-students-2026",
        title: "ATS Resume for International Students 2026: Beat the Bots & Get Interviews",
        description: "Master ATS-optimized resume writing for international students. Learn formatting, keywords, H-1B requirements, and how to get past applicant tracking systems.",
        category: "Careers",
        readTime: "11 min read",
        date: "May 19, 2026",
        tags: ["Resume", "ATS", "Job Search"],
        featured: true,
    },
    {
        slug: "top-h1b-sponsor-companies-2026",
        title: "Top H-1B Sponsor Companies 2026: Data-Driven Rankings & Analysis",
        description: "Which companies sponsor the most H-1B visas? Data-driven rankings by petitions, approval rates, and industry with red flags to watch.",
        category: "H-1B",
        readTime: "10 min read",
        date: "May 14, 2026",
        tags: ["H-1B", "Sponsors", "Rankings"],
    },
    {
        slug: "stem-opt-employer-requirements",
        title: "STEM OPT Employer Requirements 2026: E-Verify, I-983 & Compliance Checklist",
        description: "Everything employers must do for STEM OPT: E-Verify enrollment, I-983 training plan, reporting requirements, and wage compliance.",
        category: "STEM OPT",
        readTime: "9 min read",
        date: "May 27, 2026",
        tags: ["STEM OPT", "E-Verify", "Employer"],
    },
    {
        slug: "opt-application-denied",
        title: "OPT Application Denied? What to Do Next (2026 Guide)",
        description: "Your OPT was denied — now what? Common denial reasons, your options (refile, transfer, leave), 60-day grace period rules, and prevention tips.",
        category: "OPT Basics",
        readTime: "8 min read",
        date: "April 11, 2026",
        tags: ["OPT", "Denial", "I-765"],
    },
    {
        slug: "opt-stem-opt-job-offer-verification-checklist",
        title: "OPT & STEM OPT Job Offer Verification Checklist (Before You Accept)",
        description: "Before accepting any OPT/STEM OPT role, verify W-2, E-Verify, degree alignment, I-983 readiness, and SEVIS/I-20 details with your DSO.",
        category: "STEM OPT",
        readTime: "8 min read",
        date: "April 23, 2026",
        tags: ["OPT", "STEM OPT", "Compliance"],
    },
    {
        slug: "leverage-job-search-trackmyopt-resume-generator",
        title: "Leverage Your Job Search with TrackMyOPT Resume Generator (2026)",
        description: "A practical guide for F-1 students to use TrackMyOPT Resume Generator for ATS-ready resumes, faster role tailoring, and better interview conversion.",
        category: "Careers",
        readTime: "9 min read",
        date: "March 31, 2026",
        tags: ["Resume", "ATS", "Job Search"],
    },
    {
        slug: "f1-opt-stem-opt-tax-filing-mistakes",
        title: "Tax Filing Mistakes to Avoid on F-1 OPT/STEM OPT (2026)",
        description: "Avoid common F-1 OPT/STEM OPT tax filing mistakes including wrong forms, FICA errors, and treaty claim pitfalls.",
        category: "Tax & Finance",
        readTime: "10 min read",
        date: "February 11, 2026",
        tags: ["Taxes", "OPT", "STEM OPT"],
    },
    {
        slug: "indian-bank-account-nro-opt-students",
        title: "Indian Students on OPT/STEM OPT: Is Your Indian Bank Account Illegal Under FEMA? (2026 Guide)",
        description: "If you've spent 182+ days in the US on OPT or STEM OPT, your Indian savings account is a FEMA violation. Learn how to convert to NRO without flying back to India.",
        category: "Finance & Compliance",
        readTime: "9 min read",
        date: "March 18, 2026",
        tags: ["Finance", "NRO", "FEMA", "Indian Students"],
    },
    {
        slug: "hsi-opt-fraud-crackdown-legitimate-students-guide",
        title: "HSI Is Cracking Down on OPT Fraud: What Every Legitimate OPT/STEM OPT Student Must Know (2026)",
        description: "DHS has identified 10,000+ students connected to suspected fraudulent OPT employers across 8 states. Here's how legitimate students verify their employer and protect their F-1 status.",
        category: "Important",
        readTime: "11 min read",
        date: "May 24, 2026",
        featured: true,
        tags: ["OPT Fraud", "HSI", "Compliance", "STEM OPT"],
    },
    {
        slug: "is-opt-ending-dhs-rule-2026",
        title: "Is OPT Really Ending in 2026? What the DHS Review and Policy Threats Actually Mean for F-1 Students",
        description: "DHS confirmed it is re-evaluating OPT and STEM OPT, and Trump's USCIS nominee wants to eliminate post-completion work authorization. Here is what is real vs. rumor — and what to do now.",
        category: "Important",
        readTime: "10 min read",
        date: "May 28, 2026",
        featured: true,
        tags: ["OPT Policy", "DHS Rule", "STEM OPT", "2026"],
    },
    {
        slug: "spring-graduates-opt-application-timing-2026",
        title: "Spring 2026 Graduates: How to Time Your OPT Application to Avoid a Work Gap",
        description: "Graduating in May or June 2026? With USCIS processing delays at record highs, the timing of your I-765 filing directly determines whether you can start work on day one.",
        category: "OPT Basics",
        readTime: "8 min read",
        date: "May 29, 2026",
        tags: ["OPT Application", "Spring 2026", "I-765", "Timing"],
    },
    {
        slug: "opt-ead-pending-processing-delays-2026",
        title: "OPT EAD Still Pending After 3, 6, or 12 Months? Here's Exactly What to Do (2026)",
        description: "USCIS OPT processing delays are at record highs in 2026, with some cases pending over a year. Here is a stage-by-stage action guide including service requests, congressional inquiries, and escalation tools.",
        category: "USCIS",
        readTime: "9 min read",
        date: "May 17, 2026",
        tags: ["OPT Delays", "I-765 Pending", "USCIS", "Processing Times"],
    },
    {
        slug: "cpt-complete-guide",
        title: "CPT Complete Guide 2026: Eligibility, Application & Rules for F-1 Students",
        description: "Everything F-1 students need to know about Curricular Practical Training (CPT): eligibility, part-time vs full-time, application steps, Day 1 CPT risks, and how CPT affects your OPT.",
        category: "Compliance",
        readTime: "12 min read",
        date: "February 2, 2026",
        tags: ["CPT", "F-1 Visa", "Work Authorization"],
        featured: true,
        image: "/blog/cpt-complete-guide.png"
    },
    {
        slug: "how-to-get-ssn-on-opt",
        title: "How to Get a Social Security Number (SSN) on OPT: Step-by-Step Guide (2026)",
        description: "Complete guide to getting your SSN as an F-1 student on OPT. Required documents, SSA office visit, processing times, what to do if denied, and why you need an SSN for employment.",
        category: "Finance & Compliance",
        readTime: "9 min read",
        date: "March 13, 2026",
        tags: ["SSN", "OPT", "Finance"],
        featured: true,
        image: "/blog/ssn-opt-guide.png"
    },
    {
        slug: "can-you-work-remotely-on-opt",
        title: "Can You Work Remotely on OPT? Remote Work Rules for F-1 Students (2026)",
        description: "Can F-1 students on OPT work remotely? Yes, but with rules. Learn about remote work compliance, working from different states, international remote work restrictions, and STEM OPT requirements.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "January 26, 2026",
        tags: ["Remote Work", "OPT", "Compliance"],
        featured: true,
        image: "/blog/remote-work-opt.png"
    },
    {
        slug: "h1b-alternatives-work-visas",
        title: "H-1B Visa Alternatives: Top 8 Work Visas for F-1 OPT Students (2026)",
        description: "Missed the H-1B lottery? Explore the top H-1B visa alternatives for F-1 and OPT students including O-1, L-1, E-2, TN, Cap-Exempt H-1B, and Day 1 CPT options.",
        category: "Work Visas",
        readTime: "14 min read",
        date: "March 2, 2026",
        tags: ["H-1B Alternatives", "Work Visas", "F-1 Students"],
        featured: true,
        image: "/blog/h1b-alternatives-work-visas.png"
    },
    {
        slug: "sevp-portal-guide-opt",
        title: "SEVP Portal Complete Guide: Setup, Unlock & Reporting for OPT & STEM OPT (2026)",
        description: "Learn how to set up your SEVP Portal account, unlock your profile, reset your password, and report address or employment changes for OPT and STEM OPT compliance.",
        category: "OPT Basics",
        readTime: "11 min read",
        date: "May 20, 2026",
        tags: ["SEVP Portal", "OPT Compliance", "F-1 Regulations"],
        featured: true,
        image: "/blog/sevp-portal-guide.png"
    },
    {
        slug: "green-card-after-opt",
        title: "Green Card After OPT: Top 5 Pathways for F-1 Students (2026)",
        description: "Guide to securing permanent residency (Green Card) after F-1 OPT or STEM OPT. Explore EB-2 NIW, EB-3 employer-sponsored, family green cards, and investment pathways.",
        category: "Work Visas",
        readTime: "13 min read",
        date: "March 1, 2026",
        tags: ["Green Card", "OPT", "Immigration"],
        featured: true,
        image: "/blog/green-card-after-opt.png"
    },
    {
        slug: "eb2-niw-green-card-opt",
        title: "EB-2 NIW Green Card Guide for OPT & STEM OPT Students (2026)",
        description: "Ultimate guide to the EB-2 National Interest Waiver (NIW) green card for F-1 OPT and STEM OPT students. Learn about the Matter of Dhanasar criteria, self-petition steps, and processing times.",
        category: "Work Visas",
        readTime: "12 min read",
        date: "February 7, 2026",
        tags: ["EB-2 NIW", "Green Card", "Immigration"],
        featured: true,
        image: "/blog/eb2-niw-green-card-opt.png"
    },
    {
        slug: "opt-reporting-requirements-dso",
        title: "OPT & STEM OPT Reporting Requirements: Complete DSO Guide (2026)",
        description: "Learn what F-1 students must report to their DSO and SEVIS during OPT and STEM OPT. Compliance deadlines, residential address changes, and employment updates.",
        category: "Compliance",
        readTime: "10 min read",
        date: "April 21, 2026",
        tags: ["OPT Reporting", "DSO", "F-1 Compliance"],
        featured: true,
        image: "/blog/opt-reporting-requirements.png"
    },
    {
        slug: "how-to-answer-sponsorship-question",
        title: "How to Answer the Visa Sponsorship Question in Job Interviews (2026)",
        description: "Crucial guide for international students on OPT. Learn exactly how to answer 'Will you now or in the future require visa sponsorship?' without getting disqualified immediately.",
        category: "Careers",
        readTime: "9 min read",
        date: "March 11, 2026",
        tags: ["Interview Prep", "Sponsorship", "Careers"],
        featured: true,
        image: "/blog/how-to-answer-sponsorship-question.png"
    },
    {
        slug: "is-my-degree-stem-eligible-cip-code",
        title: "Is My Degree STEM Eligible? CIP Code Lookup Guide for STEM OPT (2026)",
        description: "Learn how to find and check your degree CIP code against the DHS STEM Designated Degree Program List to confirm your eligibility for the 24-month STEM OPT extension.",
        category: "STEM OPT",
        readTime: "8 min read",
        date: "March 22, 2026",
        tags: ["STEM OPT", "CIP Code", "Compliance"],
        featured: true,
        image: "/blog/is-my-degree-stem-eligible-cip-code.png"
    },
    {
        slug: "pre-completion-opt-vs-cpt",
        title: "Pre-Completion OPT vs CPT: Which Should You Choose? (2026)",
        description: "Deciding between Pre-Completion OPT and CPT for your internship? Understand the rules, costs, and impacts on your post-graduation OPT.",
        category: "OPT Basics",
        readTime: "7 min read",
        date: "April 30, 2026",
        tags: ["Pre-Completion OPT", "CPT", "Internships"],
        featured: false,
        image: "/blog/pre-opt-vs-cpt.png"
    },
    {
        slug: "cpt-12-month-rule-opt-eligibility",
        title: "Does CPT Affect OPT? The 12-Month Rule Explained (2026)",
        description: "Will doing a CPT internship ruin your chances for OPT? Discover exactly how the 12-month CPT rule works and how to protect your post-graduation work authorization.",
        category: "OPT Basics",
        readTime: "6 min read",
        date: "January 31, 2026",
        tags: ["CPT 12 Month Rule", "CPT", "Compliance"],
        featured: false,
        image: "/blog/cpt-12-month-rule.png"
    },
    {
        slug: "o1-visa-international-students-opt",
        title: "O-1 Visa for International Students: Can You Qualify After OPT? (2026)",
        description: "The O-1 visa has no lottery, no prevailing wage requirements, and no cap. Discover the 8 criteria for the O-1 visa and how F-1 students can build a profile to qualify.",
        category: "Work Visas",
        readTime: "11 min read",
        date: "April 7, 2026",
        tags: ["O-1 Visa", "H-1B Alternative", "Work Visas"],
        featured: false,
        image: "/blog/o1-visa-international-students.png"
    },
    {
        slug: "perm-labor-certification-opt",
        title: "PERM Labor Certification Process: What OPT Workers Need to Know (2026)",
        description: "Navigating the PERM process for your Green Card? Understand the strict advertising requirements, prevailing wage delays, and ETA Form 9089.",
        category: "Work Visas",
        readTime: "9 min read",
        date: "April 29, 2026",
        tags: ["PERM", "Green Card", "Employer Sponsorship"],
        featured: false,
        image: "/blog/perm-labor-certification-opt.png"
    },
    {
        slug: "fall-out-of-f1-status-options",
        title: "What Happens If You Fall Out of F-1 Status? Options & Solutions (2026)",
        description: "Learn what falling out of F-1 status means, the severe consequences, and your options for reinstatement, travel and reentry, or voluntary departure.",
        category: "Compliance",
        readTime: "8 min read",
        date: "February 18, 2026",
        tags: ["Fall Out of Status", "F-1 Reinstatement", "Compliance"],
        featured: false,
        image: "/blog/fall-out-of-f1-status-options.png"
    },
    {
        slug: "building-credit-international-students-opt",
        title: "How to Build US Credit as an International Student (2026 Guide)",
        description: "No SSN? No credit history? No problem. Learn the exact steps to build a 700+ US credit score while on your F-1 visa or OPT.",
        category: "Finance & Compliance",
        readTime: "7 min read",
        date: "January 18, 2026",
        tags: ["Credit Score", "SSN", "Finance"],
        featured: false,
        image: "/blog/building-credit-international-students-opt.png"
    },
    {
        slug: "renting-apartment-without-us-credit-history",
        title: "How to Rent an Apartment Without US Credit History (2026)",
        description: "International student with no US credit score? Learn 5 proven strategies to get approved for an off-campus apartment on F-1 OPT.",
        category: "Life in US",
        readTime: "8 min read",
        date: "May 8, 2026",
        tags: ["Housing", "Credit Score", "Finance"],
        featured: false,
        image: "/blog/renting-apartment-without-us-credit-history.png"
    },
    {
        slug: "l1-visa-transfer-after-opt",
        title: "L-1 Visa Transfer: The Ultimate H-1B Backup Plan for OPT Workers",
        description: "Didn't win the H-1B lottery on OPT? Learn how the L-1 intracompany transferee visa works and how to relocate to a foreign branch.",
        category: "Work Visas",
        readTime: "9 min read",
        date: "March 27, 2026",
        tags: ["L-1 Visa", "H-1B Backup", "Work Visas"],
        featured: false,
        image: "/blog/l1-visa-transfer-after-opt.png"
    },
    {
        slug: "tn-visa-canadian-mexican-students-opt",
        title: "TN Visa Guide for Canadian & Mexican Students on OPT",
        description: "Learn how Canadian and Mexican citizens can easily transition from an F-1 OPT to a TN Visa under the USMCA agreement. Skip the H-1B lottery.",
        category: "Work Visas",
        readTime: "7 min read",
        date: "June 3, 2026",
        tags: ["TN Visa", "USMCA", "Work Visas"],
        featured: false,
        image: "/blog/tn-visa-canadian-mexican-students-opt.png"
    },
    {
        slug: "sevis-transfer-guide-opt-impact",
        title: "SEVIS Transfer Guide: How Moving Schools Impacts Your OPT",
        description: "Planning to transfer to a new university or start a master's degree? Learn how a SEVIS transfer instantly cancels your OPT and CPT authorization.",
        category: "Compliance",
        readTime: "7 min read",
        date: "May 18, 2026",
        tags: ["SEVIS Transfer", "OPT", "Compliance"],
        featured: false,
        image: "/blog/sevis-transfer-guide-opt-impact.png"
    },
    {
        slug: "buying-car-international-student-opt",
        title: "How to Buy and Finance a Car as an International Student on OPT",
        description: "Learn how to buy, finance, and insure a car in the US without a credit score. Guide for F-1 international students and OPT workers.",
        category: "Life in US",
        readTime: "8 min read",
        date: "January 20, 2026",
        tags: ["Auto Loan", "Finance", "Life in US"],
        featured: false,
        image: "/blog/buying-car-international-student-opt.png"
    },
    {
        slug: "renewing-f1-visa-on-opt",
        title: "Renewing Your F-1 Visa Stamp While on OPT (2026 Guide)",
        description: "Can you renew your expired F-1 visa stamp while on OPT or STEM OPT? Yes, but it carries high risks. Learn the process and common pitfalls.",
        category: "Travel",
        readTime: "9 min read",
        date: "May 6, 2026",
        tags: ["Visa Renewal", "Travel", "F-1 Status"],
        featured: false,
        image: "/blog/renewing-f1-visa-on-opt.png"
    },
    {
        slug: "real-id-domestic-flights-international-students",
        title: "Can International Students Fly Domestically Without a Passport?",
        description: "Learn the TSA rules for domestic flights in the US on an F-1 visa. Find out how to get a REAL ID and why you should never travel without your I-20.",
        category: "Life in US",
        readTime: "7 min read",
        date: "May 2, 2026",
        tags: ["REAL ID", "Domestic Travel", "Life in US"],
        featured: false,
        image: "/blog/real-id-domestic-flights-international-students.png"
    },
    {
        slug: "changing-majors-f1-student-opt-impact",
        title: "Changing Majors on an F-1 Visa: How it Impacts Your OPT",
        description: "Thinking about switching your major from Business to Computer Science? Learn how changing your degree program impacts your F-1 status and STEM OPT eligibility.",
        category: "Academics",
        readTime: "7 min read",
        date: "January 29, 2026",
        tags: ["Academics", "STEM OPT", "Compliance"],
        featured: false,
        image: "/blog/changing-majors-f1-student-opt-impact.png"
    },
    {
        slug: "withdrawing-from-classes-f1-visa",
        title: "Withdrawing from Classes on an F-1 Visa: Avoid Losing Your Status",
        description: "Failing a class and want to drop it? Learn the strict SEVIS rules for course withdrawals, full-time enrollment, and how it affects your future OPT.",
        category: "Academics",
        readTime: "8 min read",
        date: "June 12, 2026",
        tags: ["Course Withdrawal", "Compliance", "F-1 Status"],
        featured: false,
        image: "/blog/withdrawing-from-classes-f1-visa.png"
    },
    {
        slug: "academic-probation-f1-student-opt",
        title: "Academic Probation on an F-1 Visa: Will It Ruin Your OPT?",
        description: "Got an Academic Warning or placed on Academic Probation? Learn how a low GPA affects your F-1 student status, SEVIS record, and future OPT eligibility.",
        category: "Academics",
        readTime: "7 min read",
        date: "January 15, 2026",
        tags: ["Academics", "Compliance", "GPA"],
        featured: false,
        image: "/blog/academic-probation-f1-student-opt.png"
    },
    {
        slug: "j1-visa-vs-f1-visa-opt-differences",
        title: "F-1 vs J-1 Visa: Which is Better for International Students?",
        description: "Compare the F-1 and J-1 student visas. Learn the differences between OPT and Academic Training, spouse work rules, and the 2-year home residency requirement.",
        category: "Visa Types",
        readTime: "8 min read",
        date: "March 24, 2026",
        tags: ["F-1 Visa", "J-1 Visa", "OPT"],
        featured: false,
        image: "/blog/j1-visa-vs-f1-visa-opt-differences.png"
    },
    {
        slug: "j1-waiver-212e-two-year-home-residency",
        title: "J-1 Waiver (212e): How to Escape the 2-Year Home Residency Requirement",
        description: "Subject to the J-1 two-year home residency requirement? Learn 5 ways to get a 212(e) waiver so you can stay in the US and pursue an H-1B or Green Card.",
        category: "J-1 Visa",
        readTime: "9 min read",
        date: "March 26, 2026",
        tags: ["J-1 Visa", "212e Waiver", "Immigration"],
        featured: false,
        image: "/blog/j1-waiver-212e-two-year-home-residency.jpg"
    },
    {
        slug: "h4-ead-opt-spouse-work-authorization",
        title: "H-4 EAD: Can Your Spouse Work While You Are on OPT or H-1B?",
        description: "Learn whether H-4 visa holders can get work authorization. Understand the H-4 EAD rules, eligibility based on I-140 approval, and the OPT-to-H-1B impact.",
        category: "Dependent Visas",
        readTime: "8 min read",
        date: "March 10, 2026",
        tags: ["H-4 EAD", "Spouse Work", "Dependent Visas"],
        featured: false,
        image: "/blog/h4-ead-opt-spouse-work-authorization.jpg"
    },
    {
        slug: "f2-dependent-visa-rules-opt-students",
        title: "F-2 Dependent Visa Rules: What Your Spouse and Kids Can (and Cannot) Do",
        description: "Bringing your family to the US on an F-2 visa? Learn the strict rules: no work, limited study, and how your OPT status directly impacts your dependents.",
        category: "Dependent Visas",
        readTime: "7 min read",
        date: "February 16, 2026",
        tags: ["F-2 Visa", "Family", "Dependent Visas"],
        featured: false,
        image: "/blog/f2-dependent-visa-rules-opt-students.jpg"
    },
    {
        slug: "investing-stocks-crypto-401k-opt-tax",
        title: "Can You Invest in Stocks, Crypto & 401(k) on OPT?",
        description: "Yes, F-1 students on OPT can invest in stocks and crypto. Learn about capital gains taxes, 401(k) contributions, FBAR reporting, and nonresident alien tax rules.",
        category: "Finance",
        readTime: "8 min read",
        date: "March 20, 2026",
        tags: ["Investing", "Taxes", "Finance"],
        featured: false,
        image: "/blog/investing-stocks-crypto-401k-opt-tax.jpg"
    },
    {
        slug: "sending-money-home-opt-remittance",
        title: "How to Send Money Home from the US on OPT: Cheapest Options",
        description: "Compare the cheapest ways to send money from the US to your home country while on OPT. Wise, Remitly, Western Union, and bank wire fees compared.",
        category: "Finance",
        readTime: "7 min read",
        date: "May 15, 2026",
        tags: ["Remittance", "Finance", "Life in US"],
        featured: false,
        image: "/blog/sending-money-home-opt-remittance.jpg"
    },
    {
        slug: "first-us-paycheck-deductions-w4",
        title: "Understanding Your First US Paycheck: Deductions, W-4 & Net Pay Explained",
        description: "Your first US paycheck on OPT looks smaller than expected. Learn what federal tax, state tax, Social Security, Medicare, and FICA deductions mean for F-1 students.",
        category: "Finance",
        readTime: "7 min read",
        date: "February 20, 2026",
        tags: ["Paycheck", "W-4", "FICA Exemption"],
        featured: false,
        image: "/blog/first-us-paycheck-deductions-w4.jpg"
    },
    {
        slug: "relocating-for-opt-job-moving-states",
        title: "Relocating for Your OPT Job: Moving States Checklist for F-1 Students",
        description: "Got an OPT job in a different state? Follow this immigration-safe moving checklist: address updates, SEVIS reporting, new driver's license, and more.",
        category: "Life in US",
        readTime: "6 min read",
        date: "May 4, 2026",
        tags: ["Relocation", "Address Change", "Compliance"],
        featured: false,
        image: "/blog/relocating-for-opt-job-moving-states.jpg"
    },
    {
        slug: "drivers-license-opt-state-requirements",
        title: "Getting a US Driver's License on OPT: State-by-State Requirements",
        description: "Learn how F-1 international students on OPT can get a US driver's license. State-specific rules, required documents, REAL ID compliance, and renewal tips.",
        category: "Life in US",
        readTime: "7 min read",
        date: "February 5, 2026",
        tags: ["Driver License", "REAL ID", "DMV"],
        featured: false,
        image: "/blog/drivers-license-opt-state-requirements.jpg"
    },
    {
        slug: "freelance-gig-work-uber-doordash-opt",
        title: "Can You Freelance or Do Gig Work (Uber, DoorDash) on OPT?",
        description: "Learn the rules for freelancing, independent contracting (1099), and gig work (Uber, Lyft, DoorDash) while on standard OPT and STEM OPT.",
        category: "Work Rules",
        readTime: "7 min read",
        date: "February 27, 2026",
        tags: ["Freelance", "Gig Work", "1099"],
        featured: false,
        image: "/blog/freelance-gig-work-uber-doordash-opt.jpg"
    },
    {
        slug: "volunteer-work-opt-employment-rules",
        title: "Volunteer Work on OPT: Does Unpaid Work Stop the Unemployment Clock?",
        description: "Learn how to use unpaid volunteer work to stop your 90-day OPT unemployment clock. Rules for F-1 students, degree relevance, and STEM OPT restrictions.",
        category: "Work Rules",
        readTime: "6 min read",
        date: "June 7, 2026",
        tags: ["Volunteer", "Unpaid Work", "Unemployment"],
        featured: false,
        image: "/blog/volunteer-work-opt-employment-rules.jpg"
    },
    {
        slug: "multiple-jobs-opt-two-employers",
        title: "Multiple Jobs on OPT: Can You Work for Two Employers at Once?",
        description: "Learn if F-1 students can legally hold two or more jobs simultaneously on OPT and STEM OPT. SEVIS reporting rules, 20-hour minimums, and E-Verify requirements.",
        category: "Work Rules",
        readTime: "7 min read",
        date: "April 4, 2026",
        tags: ["Multiple Jobs", "STEM OPT", "Compliance"],
        featured: false,
        image: "/blog/multiple-jobs-opt-two-employers.jpg"
    },
    {
        slug: "linkedin-optimization-f1-h1b-sponsorship",
        title: "LinkedIn Profile Optimization for F-1 Students Seeking H-1B Sponsorship",
        description: "Learn how to optimize your LinkedIn profile to attract recruiters who offer H-1B sponsorship. Keywords, Open to Work settings, and networking strategies for F-1 students.",
        category: "Career Search",
        readTime: "7 min read",
        date: "April 2, 2026",
        tags: ["LinkedIn", "Networking", "H-1B"],
        featured: false,
        image: "/blog/linkedin-optimization-f1-h1b-sponsorship.jpg"
    },
    {
        slug: "opt-non-stem-majors-guide",
        title: "OPT for Non-STEM Majors: Maximizing Your 12 Months (Business, Arts, Humanities)",
        description: "Are you a non-STEM major? Learn how to maximize your 12 months of OPT. Strategies for H-1B sponsorship, O-1 visas, and finding employment in arts and business.",
        category: "Career Planning",
        readTime: "7 min read",
        date: "April 20, 2026",
        tags: ["Non-STEM", "O-1 Visa", "H-1B"],
        featured: false,
        image: "/blog/opt-non-stem-majors-guide.jpg"
    },
    {
        slug: "opt-anxiety-mental-health-international-students",
        title: "Dealing with OPT Anxiety: Mental Health Resources for International Students",
        description: "The 90-day unemployment clock, H-1B lotteries, and visa renewals create immense stress. Learn how to manage OPT anxiety and find accessible mental health support.",
        category: "Mental Health",
        readTime: "6 min read",
        date: "April 9, 2026",
        tags: ["Anxiety", "Mental Health", "Wellness"],
        featured: false,
        image: "/blog/opt-anxiety-mental-health-international-students.jpg"
    },
    {
        slug: "60-day-grace-period-f1-students",
        title: "The 60-Day Grace Period for F-1 Students: A Practical Guide",
        description: "What happens when your OPT expires or you run out of unemployment days? Learn the rules of the F-1 60-day grace period and your options to stay in the US.",
        category: "Visa Rules",
        readTime: "6 min read",
        date: "January 11, 2026",
        tags: ["Grace Period", "F-1 Status", "Compliance"],
        featured: false,
        image: "/blog/60-day-grace-period-f1-students.jpg"
    },
    {
        slug: "opt-mba-students-career-paths",
        title: "OPT for MBA Students: Maximizing ROI and Securing H-1B Sponsorship",
        description: "An international student's guide to navigating OPT after an MBA. Strategies for consulting, tech product management, finance, and STEM MBA extensions.",
        category: "Career Paths",
        readTime: "7 min read",
        date: "April 18, 2026",
        tags: ["MBA", "STEM", "H-1B"],
        featured: false,
        image: "/blog/opt-mba-students-career-paths.jpg"
    },
    {
        slug: "salary-negotiation-international-workers-opt",
        title: "Salary Negotiation for International Students on OPT",
        description: "Do you lose leverage because you need H-1B sponsorship? Learn how international students can successfully negotiate salary, sign-on bonuses, and relocation on OPT.",
        category: "Career Advice",
        readTime: "7 min read",
        date: "May 9, 2026",
        tags: ["Negotiation", "H-1B", "Salary"],
        featured: false,
        image: "/blog/salary-negotiation-international-workers-opt.jpg"
    },
    {
        slug: "networking-international-student-sponsorship",
        title: "Networking for H-1B Sponsorship: The International Student Playbook",
        description: "Cold applying online rarely works for international students. Learn how to network effectively to bypass ATS filters and find H-1B sponsoring employers.",
        category: "Career Search",
        readTime: "7 min read",
        date: "April 5, 2026",
        tags: ["Networking", "H-1B", "Career Tips"],
        featured: false,
        image: "/blog/networking-international-student-sponsorship.jpg"
    },
];

function CategoryBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        "OPT Basics": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        "USCIS": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        "STEM OPT": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        "H-1B": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        "Careers": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        "Important": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        "Tax & Finance": "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
        "Health": "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
        "Finance & Compliance": "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[category] || "bg-gray-100 text-gray-700"}`}>
            {category}
        </span>
    );
}

function getPostImage(post: (typeof blogPosts)[number]) {
    if ("image" in post && typeof post.image === "string") return post.image;
    const slugPath = `/blog/${post.slug}.png`;
    return slugPath;
}

export default function BlogIndexPage() {
    const featured = blogPosts.filter(p => p.featured);
    const rest = blogPosts.filter(p => !p.featured);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                    <BookOpen className="w-4 h-4" />
                    OPT Knowledge Hub
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    OPT & F-1 Visa Guides
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
                    Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, and USCIS tracking.
                    Written by former F-1 students who've been through it all.
                </p>
                
                {/* E-E-A-T / Editorial Density Section */}
                <div className="max-w-3xl mx-auto bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 text-left border border-blue-100 dark:border-blue-900/30">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xl">
                                VK
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Editorial Independence & Accuracy</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                Our content is exclusively authored by <strong>Vinay Kumar</strong>, our Lead Content Writer and former F-1 student. 
                                We regularly consult with immigration attorneys and review DHS/USCIS policy updates to ensure our guides remain accurate, objective, and up-to-date.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <em>TrackMyOPT is not a law firm. The guides below provide general educational information about the F-1 visa lifecycle and should not be construed as legal advice.</em>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Posts */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
                {featured.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                        <article className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-blue-100 dark:border-zinc-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="relative w-full h-48 sm:h-56 bg-blue-100 dark:bg-zinc-800">
                                <BlogPostImage 
                                    src={getPostImage(post)}
                                    alt={post.title} 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 mb-4">
                                    <CategoryBadge category={post.category} />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                                        <TrendingUp className="w-3 h-3" />
                                        Featured
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-grow">
                                    {post.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-sm text-gray-500">{post.date}</span>
                                    <span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                                        Read Guide <ArrowRight className="w-4 h-4 ml-1" />
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* All Posts */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">All Guides</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {rest.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                        <article className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="relative w-full h-40 bg-gray-100 dark:bg-zinc-800">
                                <BlogPostImage 
                                    src={getPostImage(post)}
                                    alt={post.title} 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 mb-3">
                                    <CategoryBadge category={post.category} />
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                                    {post.description}
                                </p>
                                <span className="text-sm text-gray-400 mt-auto">{post.date}</span>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </div>
    );
}
