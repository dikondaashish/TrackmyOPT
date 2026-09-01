"use client";

import {
    Clock,
    Star,
    ExternalLink,
    Tag,
    Fuel,
    Gift,
    X,
    MapPin,
    Banknote,
    ClipboardList,
    Sparkles,
    Music,
    Briefcase,
    Wallet,
    GraduationCap,
    type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { OfferBrandLogo } from "@/components/dashboard/offers/OfferBrandLogo";

// Fuel deal popup content
interface FuelDeal {
    id: string;
    title: string;
    subtitle: string;
    discount: string;
    description: string;
    benefits: string[];
    terms: string;
    link: string;
    availableStates: string[];
    category: string;
    badge: string;
    badgeColor: string;
    icon: typeof Fuel;
    maxSavings?: string; // e.g., "Save $17.50 on 35 gal"
}

const FUEL_DEALS: FuelDeal[] = [
    {
        id: "fuel-discount",
        title: "Fuel Savings",
        subtitle: "Bee's Knees Benefits™",
        discount: "$0.50/gal OFF",
        maxSavings: "Save $17.50 on 35 gal",
        description: "Save $0.50 per gallon on fuel, up to 35 gallons per fill-up. That's up to $17.50 in savings every time you fill up!",
        benefits: [
            "$0.50 off per gallon",
            "Up to 35 gallons per transaction",
            "Save up to $17.50 per fill-up",
            "No minimum purchase required",
            "Works at participating locations"
        ],
        terms: "Valid at participating locations. Savings applied at pump with registered account. Maximum 35 gallons per transaction.",
        link: "https://beesknees.myguestaccount.com/en-us/guest/enroll?card-template=gz6U71JdL9Y%3d&template=0",
        availableStates: ["TX", "VA", "NY", "CT", "MA", "RI", "NH", "VT", "ME"],
        category: "Fuel & Gas",
        badge: "Hot Deal",
        badgeColor: "from-amber-500 to-orange-500",
        icon: Fuel,
    },
    {
        id: "weekly-freebees",
        title: "Weekly FreeBees",
        subtitle: "Bee's Knees Benefits™",
        discount: "FREE Items",
        maxSavings: "Free product worth $3-$15",
        description: "Get one FREE item every Wednesday! Enrolled members receive exclusive weekly freebies at participating stores.",
        benefits: [
            "1 FREE item every Wednesday",
            "Products worth $3 to $15",
            "New product each week",
            "Valid 12:00 AM - 11:59 PM EST",
            "While supplies last"
        ],
        terms: "Weekly FreeBees is a program for enrolled, registered, and valid Bee's Knees Benefits™ members. Each offer is valid one day only, Wednesday, between 12:00 AM - 11:59 PM EST, while supplies last. Offer is for one (1) free item per member per week. Use your account at a participating location; to redeem, select YES on the pin pad at POS when prompted. Offer subject to change at any time. Offer valid on participating products only. Offer is non-transferable and cannot be combined with other offers, discounts, or redeemed for cash. Void where prohibited.",
        link: "https://beesknees.myguestaccount.com/en-us/guest/enroll?card-template=gz6U71JdL9Y%3d&template=0",
        availableStates: ["TX", "VA", "NY", "CT", "MA", "RI", "NH", "VT", "ME"],
        category: "Free Rewards",
        badge: "Weekly",
        badgeColor: "from-green-500 to-emerald-500",
        icon: Gift,
    },
];

// Sample offers data - using consistent icons from the project (Sidebar, health insurance page)
interface Offer {
    id: string;
    title: string;
    description: string;
    discount: string;
    category: string;
    section: "featured" | "essential" | "tech" | "lifestyle" | "career" | "finance";
    badge: string;
    badgeColor: string;
    logoDomain: string;
    link: string;
}

const OFFER_SECTIONS: { id: Offer["section"]; title: string; icon: LucideIcon }[] = [
    { id: "tech", title: "Tech & AI Productivity", icon: Sparkles },
    { id: "lifestyle", title: "Lifestyle & Streaming", icon: Music },
    { id: "career", title: "Professional & Career Development", icon: Briefcase },
    { id: "finance", title: "Relocation & Finance", icon: Wallet },
];

const OFFERS: Offer[] = [
    {
        id: "iso-insurance",
        title: "ISO Insurance",
        description: "Get comprehensive health insurance designed for international students and OPT workers.",
        discount: "Starting $38/mo",
        category: "Health Insurance",
        section: "featured",
        badge: "Popular",
        badgeColor: "from-blue-500 to-cyan-500",
        logoDomain: "isoa.org",
        link: "https://www.isoa.org/?ref=trackmyopt",
    },
    {
        id: "kimber-health",
        title: "Kimber Health",
        description: "NY Essential Plan enrollment assistance - $0/month coverage for eligible residents.",
        discount: "FREE for NY",
        category: "Health Insurance",
        section: "featured",
        badge: "Hot Deal",
        badgeColor: "from-orange-500 to-pink-500",
        logoDomain: "kimberhealth.com",
        link: "https://www.kimberhealth.com/",
    },
    {
        id: "chatgpt-student",
        title: "ChatGPT Work for Students",
        description: "4 months of ChatGPT Work free ($80 value) — study guides, docs, quizzes, voice mode, and connected apps. U.S. college students verify via SheerID; claim by Oct 31.",
        discount: "4 Months FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Limited Time",
        badgeColor: "from-emerald-600 to-teal-700",
        logoDomain: "openai.com",
        link: "https://chatgpt.com/students/2026/",
    },
    {
        id: "google-gemini-student",
        title: "Google AI Pro for Students",
        description: "12 months of Google AI Pro free ($240 value) — 4× Gemini limits, Gemini in Gmail/Docs, study tools, and 5 TB storage. College students 18+ verify via SheerID; US and select global markets.",
        discount: "12 Months FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Best Value",
        badgeColor: "from-blue-500 to-indigo-600",
        logoDomain: "google.com",
        link: "https://gemini.google.com/students",
    },
    {
        id: "figma-education",
        title: "Figma Education Plan",
        description: "Free Professional tier — unlimited files, team libraries, FigJam, Dev Mode, and version history. K-12 and higher-ed students worldwide; school email verification, no credit card or SSN.",
        discount: "FREE Pro",
        category: "Tech & AI",
        section: "tech",
        badge: "Design",
        badgeColor: "from-fuchsia-500 to-purple-600",
        logoDomain: "figma.com",
        link: "https://www.figma.com/education",
    },
    {
        id: "autodesk-education",
        title: "Autodesk Education Plan",
        description: "Free one-year access to AutoCAD, Fusion, Revit, and more — renewable while enrolled. Post-secondary students 18+ verify via SheerID; educational use only, no SSN required.",
        discount: "1 Year FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Engineering",
        badgeColor: "from-teal-600 to-cyan-700",
        logoDomain: "autodesk.com",
        link: "https://www.autodesk.com/education/home",
    },
    {
        id: "rowzero-student",
        title: "Row Zero Pro for Students",
        description: "Free Row Zero Pro big-data spreadsheet for U.S. and Canadian students. Sign up with your university email to unlock Pro — ideal for data, finance, and analytics coursework.",
        discount: "FREE Pro",
        category: "Tech & AI",
        section: "tech",
        badge: "Data",
        badgeColor: "from-sky-500 to-blue-700",
        logoDomain: "rowzero.com",
        link: "https://rowzero.com/edu",
    },
    {
        id: "quizplus-ai",
        title: "Quizplus AI Copilot",
        description: "Free AI study assistant with chat help, instant answers, and explanations. Add your university and courses to match your curriculum — no student verification or SSN required.",
        discount: "FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Study Aid",
        badgeColor: "from-violet-600 to-indigo-700",
        logoDomain: "quizplus.com",
        link: "https://quizplus.com/ai-chat",
    },
    {
        id: "github-student-pack",
        title: "GitHub Student Developer Pack",
        description: "Free $1,000+ bundle: Copilot, GitHub Pro, Azure credits, JetBrains IDEs, and more. School email or enrollment proof — no US .edu or SSN required.",
        discount: "$1,000+ FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Must-Have",
        badgeColor: "from-gray-700 to-gray-900",
        logoDomain: "github.com",
        link: "https://education.github.com/pack",
    },
    {
        id: "perplexity-education",
        title: "Perplexity Education Pro",
        description: "Discounted Pro (~$10/mo) with premium models for coursework, job research, and technical writing. SheerID verification; international students welcome.",
        discount: "~$10/mo",
        category: "Tech & AI",
        section: "tech",
        badge: "AI Tool",
        badgeColor: "from-cyan-500 to-blue-600",
        logoDomain: "perplexity.ai",
        link: "https://www.perplexity.ai/students",
    },
    {
        id: "notion-education",
        title: "Notion Education Plus",
        description: "Free Plus plan with unlimited uploads and version history. Organize job apps, visa tracking, and notes. Thousands of global school domains accepted.",
        discount: "FREE Plus",
        category: "Tech & AI",
        section: "tech",
        badge: "Productivity",
        badgeColor: "from-slate-600 to-slate-800",
        logoDomain: "notion.com",
        link: "https://www.notion.com/product/notion-for-education",
    },
    {
        id: "adobe-creative-cloud",
        title: "Adobe Creative Cloud Student",
        description: "Up to 77% off All Apps (~$19.99–$24.99/mo first year). Build portfolios, resumes, and video content. SheerID verification; global students eligible.",
        discount: "Up to 77% OFF",
        category: "Tech & AI",
        section: "tech",
        badge: "Creative",
        badgeColor: "from-red-500 to-rose-600",
        logoDomain: "adobe.com",
        link: "https://www.adobe.com/education/students/creativecloud.html",
    },
    {
        id: "kickresume-student",
        title: "Kickresume Student Premium",
        description: "Full Premium free for up to 6 months. ATS-optimized resume templates and cover letters for OPT/CPT job searches. Verify via ISIC, ITIC, or UNiDAYS.",
        discount: "6 Months FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Job Search",
        badgeColor: "from-violet-500 to-purple-600",
        logoDomain: "kickresume.com",
        link: "https://www.kickresume.com/en/students",
    },
    {
        id: "microsoft-office-education",
        title: "Microsoft Office 365 Education",
        description: "Free Office 365 Education A1 — web Word, Excel, PowerPoint, OneNote, Teams, and 1 TB OneDrive. Partner-school students with a valid academic email; no credit card or SSN.",
        discount: "FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Productivity",
        badgeColor: "from-blue-600 to-sky-600",
        logoDomain: "microsoft.com",
        link: "https://www.microsoft.com/en-us/education/products/office",
    },
    {
        id: "google-workspace-free",
        title: "Google Docs, Sheets & Drive",
        description: "Free Docs, Sheets, Slides, and Drive on any Google account. Write resumes, track job applications, and collaborate on coursework without paying for Office or Notion.",
        discount: "FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Productivity",
        badgeColor: "from-blue-500 to-green-600",
        logoDomain: "google.com",
        link: "https://www.google.com/docs/about/",
    },
    {
        id: "zotero",
        title: "Zotero Reference Manager",
        description: "Fully free, open-source reference manager — citations, PDFs, and bibliographies for theses and grad-school apps. No student verification or SSN; core features permanently free.",
        discount: "FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Research",
        badgeColor: "from-red-600 to-rose-700",
        logoDomain: "zotero.org",
        link: "https://www.zotero.org/download/",
    },
    {
        id: "photopea",
        title: "Photopea",
        description: "Free browser-based Photoshop alternative with PSD support and advanced editing. Tweak portfolio images and social posts without an Adobe subscription — no install required.",
        discount: "FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Creative",
        badgeColor: "from-emerald-500 to-teal-600",
        logoDomain: "photopea.com",
        link: "https://www.photopea.com",
    },
    {
        id: "davinci-resolve",
        title: "DaVinci Resolve Free",
        description: "Professional video editing, color correction, and audio tools with no time limit. Build demo reels and project videos without paying for Premiere Pro or Final Cut.",
        discount: "FREE",
        category: "Tech & AI",
        section: "tech",
        badge: "Video",
        badgeColor: "from-gray-700 to-slate-900",
        logoDomain: "blackmagicdesign.com",
        link: "https://www.blackmagicdesign.com/products/davinciresolve",
    },
    {
        id: "spotify-student",
        title: "Spotify Premium Student",
        description: "$6.99/mo bundled with Hulu (With Ads); first month free. Music and TV streaming in one bill for students at Title IV US institutions.",
        discount: "$6.99/mo",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Bundle",
        badgeColor: "from-green-500 to-emerald-600",
        logoDomain: "spotify.com",
        link: "https://www.spotify.com/us/student/",
    },
    {
        id: "google-gemini-youtube-bundle",
        title: "Google AI + YouTube Premium",
        description: "Up to ~70% off a bundle of Google AI Pro and YouTube Premium for eligible college students. Ad-free YouTube Music plus advanced AI tools in one discounted student price.",
        discount: "~70% OFF Bundle",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Bundle",
        badgeColor: "from-red-500 to-rose-600",
        logoDomain: "youtube.com",
        link: "https://gemini.google.com/students",
    },
    {
        id: "nordvpn-student",
        title: "NordVPN Student Discount",
        description: "Up to ~76% off 2-year plans plus extra student savings via Student Beans. Secure VPN for banking from home, streaming, and public Wi-Fi — verify as a student, no SSN.",
        discount: "Up to 76% OFF",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Security",
        badgeColor: "from-slate-600 to-blue-800",
        logoDomain: "nordvpn.com",
        link: "https://www.studentbeans.com/student-discount/us/nordvpn",
    },
    {
        id: "amazon-prime-student",
        title: "Amazon Prime Student",
        description: "6-month free trial, then 50% off Prime at $7.49/mo with free Grubhub+ delivery. Verify with .edu email or age 18–24; no SSN required.",
        discount: "6 Months FREE",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Student Deal",
        badgeColor: "from-amber-500 to-orange-500",
        logoDomain: "amazon.com",
        link: "https://www.amazon.com/joinstudent",
    },
    {
        id: "unidays",
        title: "UNiDAYS",
        description: "One free signup unlocks 300+ brand discounts — Apple, Uber Eats, Disney+, Nike, Samsung, and more. Accepts many international university domains.",
        discount: "300+ Deals",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Hub",
        badgeColor: "from-indigo-500 to-purple-600",
        logoDomain: "myunidays.com",
        link: "https://www.myunidays.com",
    },
    {
        id: "libby",
        title: "Libby by OverDrive",
        description: "Free ebooks, audiobooks, and magazines from your public library. Link a library card — great for test prep and language learning without Kindle or Audible costs.",
        discount: "FREE",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Reading",
        badgeColor: "from-teal-500 to-cyan-600",
        logoDomain: "overdrive.com",
        link: "https://www.overdrive.com/apps/libby",
    },
    {
        id: "tubi",
        title: "Tubi",
        description: "Free ad-supported streaming with a large catalog of movies and TV shows. No student status, payment method, or SSN — just create an account and start watching.",
        discount: "FREE",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Streaming",
        badgeColor: "from-orange-500 to-amber-600",
        logoDomain: "tubitv.com",
        link: "https://tubitv.com",
    },
    {
        id: "pluto-tv",
        title: "Pluto TV",
        description: "Free ad-supported live TV and on-demand movies and shows. Budget-friendly entertainment for students who can't afford Netflix or Disney+ — no subscription required.",
        discount: "FREE",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Streaming",
        badgeColor: "from-yellow-500 to-orange-600",
        logoDomain: "pluto.tv",
        link: "https://pluto.tv",
    },
    {
        id: "amazon-freevee",
        title: "Amazon Freevee",
        description: "Free ad-supported streaming from Amazon with movies and TV shows at zero subscription cost. Anyone can sign up — no student verification or payment method needed.",
        discount: "FREE",
        category: "Lifestyle",
        section: "lifestyle",
        badge: "Streaming",
        badgeColor: "from-amber-500 to-orange-500",
        logoDomain: "amazon.com",
        link: "https://www.amazon.com/freevee",
    },
    {
        id: "microsoft-linkedin-bundle",
        title: "Microsoft 365 + LinkedIn Premium",
        description: "Up to 12 months free Microsoft 365 and LinkedIn Premium Career for eligible schools. InMail credits and salary insights for OPT networking.",
        discount: "Up to 12 Mo FREE",
        category: "Career",
        section: "career",
        badge: "Bundle",
        badgeColor: "from-blue-600 to-sky-600",
        logoDomain: "microsoft.com",
        link: "https://www.microsoft.com/en-us/education/products/office",
    },
    {
        id: "linkedin-student-beans",
        title: "LinkedIn Premium (Student Beans)",
        description: "As low as $2.09/mo for extended terms vs $29.99/mo standard. Job insights and messaging tools for the OPT job hunt. International students eligible.",
        discount: "From $2.09/mo",
        category: "Career",
        section: "career",
        badge: "Networking",
        badgeColor: "from-blue-700 to-indigo-700",
        logoDomain: "linkedin.com",
        link: "https://www.studentbeans.com/student-discount/us/linkedin-premium",
    },
    {
        id: "google-ai-career-certificates",
        title: "Google AI Career Certificates",
        description: "Free AI training plus Google Career Certificates for U.S. college students through the Google AI for Education Accelerator. Strengthen your resume for tech, data, and cloud roles.",
        discount: "FREE Training",
        category: "Career",
        section: "career",
        badge: "Certification",
        badgeColor: "from-blue-500 to-green-600",
        logoDomain: "google.com",
        link: "https://blog.google/products-and-platforms/products/gemini/google-ai-pro-students-learning",
    },
    {
        id: "rowzero-scholarship",
        title: "Row Zero $1,000 Scholarship",
        description: "Annual $1,000 scholarship for analytics-focused students (data science, CS, business, engineering) at U.S. or Canadian colleges. Apply with resume and a short essay or video.",
        discount: "$1,000 Award",
        category: "Career",
        section: "career",
        badge: "Scholarship",
        badgeColor: "from-sky-500 to-blue-700",
        logoDomain: "rowzero.com",
        link: "https://rowzero.com/blog/scholarship",
    },
    {
        id: "acm-student",
        title: "ACM Student Membership",
        description: "From $19/year with optional Digital Library access. Research library and networking credentials for CS students — global enrollment, no SSN.",
        discount: "From $19/yr",
        category: "Career",
        section: "career",
        badge: "CS",
        badgeColor: "from-orange-500 to-amber-600",
        logoDomain: "acm.org",
        link: "https://www.acm.org/membership/membership-options",
    },
    {
        id: "ieee-student",
        title: "IEEE Student Membership",
        description: "Around $32/year with discounted IEEE Xplore and conference access. Boosts credibility for engineering and CS students applying to technical roles.",
        discount: "From $32/yr",
        category: "Career",
        section: "career",
        badge: "Engineering",
        badgeColor: "from-blue-500 to-cyan-600",
        logoDomain: "ieee.org",
        link: "https://www.ieee.org/membership",
    },
    {
        id: "princeton-review",
        title: "The Princeton Review",
        description: "Up to $600 off GRE, GMAT, and LSAT courses via ongoing promo codes. Open enrollment — international students welcome, no student ID required.",
        discount: "Up to $600 OFF",
        category: "Career",
        section: "career",
        badge: "Test Prep",
        badgeColor: "from-teal-500 to-emerald-600",
        logoDomain: "princetonreview.com",
        link: "https://www.princetonreview.com/promo",
    },
    {
        id: "kaplan-test-prep",
        title: "Kaplan Test Prep",
        description: "10–15% off GRE, GMAT, and MCAT courses with promo codes. Structured grad-school prep for international applicants — no SSN required.",
        discount: "10–15% OFF",
        category: "Career",
        section: "career",
        badge: "Test Prep",
        badgeColor: "from-emerald-600 to-green-700",
        logoDomain: "kaptest.com",
        link: "https://www.kaptest.com",
    },
    {
        id: "wise-students",
        title: "Wise International Student Account",
        description: "$0 monthly fee with mid-market exchange rates. Receive tuition or family support from abroad without bank markup fees. Passport-based KYC, no US SSN.",
        discount: "$0 Monthly Fee",
        category: "Finance",
        section: "finance",
        badge: "Banking",
        badgeColor: "from-lime-500 to-green-600",
        logoDomain: "wise.com",
        link: "https://wise.com/us/students",
    },
    {
        id: "zolve",
        title: "Zolve US Bank Account",
        description: "No-fee checking plus a credit card with $0 annual fee and merchant discounts. Apply with passport + F-1 visa + I-20 — no SSN or US credit history.",
        discount: "No Annual Fee",
        category: "Finance",
        section: "finance",
        badge: "New Arrivals",
        badgeColor: "from-fuchsia-500 to-pink-600",
        logoDomain: "zolve.com",
        link: "https://zolve.com",
    },
    {
        id: "remitly",
        title: "Remitly Money Transfer",
        description: "Discounted or fee-free first transfer for new users. Low-cost alternative to bank wires for sending earnings home or receiving family support.",
        discount: "First Transfer Deal",
        category: "Finance",
        section: "finance",
        badge: "Remittance",
        badgeColor: "from-sky-500 to-blue-600",
        logoDomain: "remitly.com",
        link: "https://www.remitly.com",
    },
    {
        id: "uhaul-collegeboxes",
        title: "U-Haul Collegeboxes",
        description: "No registration fee, up to 40% off shipping, plus periodic free self-storage offers. For students moving between dorms, internships, or after OPT placement.",
        discount: "Up to 40% OFF",
        category: "Finance",
        section: "finance",
        badge: "Moving",
        badgeColor: "from-orange-500 to-red-500",
        logoDomain: "uhaul.com",
        link: "https://www.uhaul.com/Discounts/",
    },
    {
        id: "isi-insurance",
        title: "ISI Student Insurance",
        description: "Affordable student health coverage with United Healthcare network and 24/7 telemedicine.",
        discount: "From $35/mo",
        category: "Health Insurance",
        section: "essential",
        badge: "Best Value",
        badgeColor: "from-green-500 to-emerald-500",
        logoDomain: "internationalstudentinsurance.com",
        link: "https://www.internationalstudentinsurance.com/?Trackmyopt",
    },
    {
        id: "sprintax",
        title: "Sprintax Tax Filing",
        description: "Partner coupon for all users. The #1 tax software for international students on F-1/OPT — get your code in Tax Filing.",
        discount: "$20 value",
        category: "Tax Services",
        section: "essential",
        badge: "Tax Season",
        badgeColor: "from-emerald-500 to-teal-500",
        logoDomain: "sprintax.com",
        link: "/dashboard/tax-filing",
    },
    {
        id: "chrome-extension",
        title: "Chrome Extension",
        description: "Quick access to your OPT countdown and case status right from your browser.",
        discount: "FREE",
        category: "Tools",
        section: "essential",
        badge: "New",
        badgeColor: "from-cyan-500 to-blue-500",
        logoDomain: "trackmyopt.com",
        link: "https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb",
    },
];

export default function OffersPage() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedFuelDeal, setSelectedFuelDeal] = useState<FuelDeal | null>(null);
    const [showStepsPopup, setShowStepsPopup] = useState(false);

    const handleClaimDeal = (link: string) => {
        window.open(link, "_blank", "noopener,noreferrer");
        setSelectedFuelDeal(null);
        setShowStepsPopup(false);
    };

    return (
        <div className="max-md:-mx-3 max-md:-my-3 md:min-h-screen bg-background">

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-500/30 mb-6">
                            <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Exclusive Partner Deals
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                                Special Offers
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Explore exclusive deals and personalized offers curated for international students and OPT workers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Featured Offers */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold">Featured Offers</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {OFFERS.filter(o => o.section === "featured").map((offer) => (
                        <a
                            key={offer.id}
                            href={offer.link}
                            target={offer.link.startsWith("http") ? "_blank" : "_self"}
                            rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                            onMouseEnter={() => setHoveredCard(offer.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
                        >
                            {/* Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase text-white rounded-full bg-gradient-to-r ${offer.badgeColor}`}>
                                {offer.badge}
                            </div>

                            {/* Content */}
                            <div className="flex items-start gap-4">
                                <OfferBrandLogo name={offer.title} domain={offer.logoDomain} size="lg" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {offer.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {offer.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {offer.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {offer.discount}
                                        </span>

                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
                                            Claim Offer
                                            <ExternalLink className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
                        </a>
                    ))}
                </div>

                {/* Fuel & Rewards Deals */}
                <div className="flex items-center gap-2 mb-6">
                    <Fuel className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-semibold">Fuel & Rewards Deals</h2>
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase text-white rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                        New Partner
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {FUEL_DEALS.map((deal) => (
                        <button
                            key={deal.id}
                            onClick={() => setSelectedFuelDeal(deal)}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-700 p-6 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] text-left"
                        >
                            {/* Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase text-white rounded-full bg-gradient-to-r ${deal.badgeColor}`}>
                                {deal.badge}
                            </div>

                            {/* Content */}
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deal.badgeColor} flex items-center justify-center flex-shrink-0`}>
                                    <deal.icon className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {deal.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {deal.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{deal.subtitle}</p>

                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {deal.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {deal.discount}
                                            </span>
                                            {deal.maxSavings && (
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1">
                                                    <Banknote className="w-3 h-3 shrink-0" />
                                                    {deal.maxSavings}
                                                </span>
                                            )}
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:gap-2 transition-all">
                                            View Details
                                            <ExternalLink className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Available states */}
                            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-700/50">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span>Available in: {deal.availableStates.join(", ")}</span>
                                </div>
                            </div>

                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all duration-300 pointer-events-none" />
                        </button>
                    ))}
                </div>

                {/* Student Offers Directory */}
                <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold">Student Offers Directory</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-8 max-w-3xl">
                    Verified evergreen deals for international students and F-1/OPT holders — prioritized where no US SSN is required.
                </p>

                {OFFER_SECTIONS.map((section) => {
                    const sectionOffers = OFFERS.filter(o => o.section === section.id);
                    if (sectionOffers.length === 0) return null;

                    return (
                        <div key={section.id} className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <section.icon className="w-5 h-5 text-purple-500" />
                                <h3 className="text-lg font-semibold">{section.title}</h3>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sectionOffers.map((offer) => (
                                    <a
                                        key={offer.id}
                                        href={offer.link}
                                        target={offer.link.startsWith("http") ? "_blank" : "_self"}
                                        rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                        className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <div className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase text-white rounded-full bg-gradient-to-r ${offer.badgeColor}`}>
                                            {offer.badge}
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <OfferBrandLogo name={offer.title} domain={offer.logoDomain} />

                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                                    {offer.category}
                                                </span>
                                                <h3 className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {offer.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                                            {offer.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                            <span className="text-base font-bold text-green-600 dark:text-green-400">
                                                {offer.discount}
                                            </span>

                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                                                Claim Offer
                                                <ExternalLink className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Essential Services */}
                <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-purple-500" />
                    <h2 className="text-xl font-semibold">Essential Services</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {OFFERS.filter(o => o.section === "essential").map((offer) => (
                        <a
                            key={offer.id}
                            href={offer.link}
                            target={offer.link.startsWith("http") ? "_blank" : "_self"}
                            rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200 hover:scale-[1.02]"
                        >
                            {/* Badge */}
                            <div className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase text-white rounded-full bg-gradient-to-r ${offer.badgeColor}`}>
                                {offer.badge}
                            </div>

                            <div className="flex items-start gap-3">
                                <OfferBrandLogo name={offer.title} domain={offer.logoDomain} />

                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                        {offer.category}
                                    </span>
                                    <h3 className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {offer.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                {offer.description}
                            </p>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <span className="text-base font-bold text-green-600 dark:text-green-400">
                                    {offer.discount}
                                </span>

                                <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                                    View
                                    <ExternalLink className="w-3 h-3" />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-8 sm:p-12">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                    <div className="relative text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Don't Miss Out!
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-6">
                            These exclusive offers are available for a limited time. Take advantage of our partner deals today.
                        </p>

                        <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Offers updated regularly</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 TrackMyOPT by Zyene, Inc. All rights reserved.</p>
                    <p className="mt-2 text-xs">
                        Partner offers are provided by third parties. TrackMyOPT may receive compensation for referrals.
                    </p>
                </div>
            </footer>

            {/* Fuel Deal Popup Modal */}
            {selectedFuelDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedFuelDeal(null)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${selectedFuelDeal.badgeColor} p-6 text-white`}>
                            <button
                                onClick={() => setSelectedFuelDeal(null)}
                                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                    <selectedFuelDeal.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">{selectedFuelDeal.subtitle}</p>
                                    <h3 className="text-2xl font-bold">{selectedFuelDeal.title}</h3>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="px-4 py-2 bg-white/20 rounded-full">
                                    <span className="text-xl font-bold">{selectedFuelDeal.discount}</span>
                                </div>
                                {selectedFuelDeal.maxSavings && (
                                    <div className="px-4 py-2 bg-white/30 rounded-full border border-white/40">
                                        <span className="text-lg font-semibold inline-flex items-center gap-1.5">
                                            <Banknote className="w-4 h-4 shrink-0" />
                                            {selectedFuelDeal.maxSavings}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-muted-foreground mb-4">
                                {selectedFuelDeal.description}
                            </p>

                            {/* Benefits */}
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">What You Get:</h4>
                                <ul className="space-y-2">
                                    {selectedFuelDeal.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                                            </div>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Available States */}
                            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                    <span className="font-medium text-amber-700 dark:text-amber-400">
                                        Available in: {selectedFuelDeal.availableStates.join(", ")}
                                    </span>
                                </div>
                            </div>

                            {/* Steps to Get This Offer - Clickable Button */}
                            {selectedFuelDeal.id === "fuel-discount" && (
                                <button
                                    onClick={() => setShowStepsPopup(true)}
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

                            {/* Steps Popup Modal */}
                            {showStepsPopup && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                    <div
                                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                        onClick={() => setShowStepsPopup(false)}
                                    />
                                    <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
                                            <button
                                                onClick={() => setShowStepsPopup(false)}
                                                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <ClipboardList className="w-5 h-5 shrink-0" />
                                                Steps to Get This Offer
                                            </h3>
                                        </div>

                                        {/* Steps Content */}
                                        <div className="p-5">
                                            <ol className="space-y-4">
                                                <li className="flex gap-3">
                                                    <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                                    <div>
                                                        <span className="text-sm font-medium">Click "Claim This Offer"</span>
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
                                                onClick={() => setShowStepsPopup(false)}
                                                className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                                            >
                                                Got It!
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Terms */}
                            <details className="mb-6">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                    View Terms & Conditions
                                </summary>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    {selectedFuelDeal.terms}
                                </p>
                            </details>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleClaimDeal(selectedFuelDeal.link)}
                                className={`w-full py-3 px-6 bg-gradient-to-r ${selectedFuelDeal.badgeColor} text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                            >
                                Claim This Offer
                                <ExternalLink className="w-4 h-4" />
                            </button>

                            <p className="text-xs text-center text-muted-foreground mt-3">
                                You'll be redirected to Bee's Knees Benefits™ to complete enrollment
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
