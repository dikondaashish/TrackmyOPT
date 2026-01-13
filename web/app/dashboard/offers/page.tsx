"use client";

import { Shield, FileText, Receipt, Clock, Star, ExternalLink, CreditCard, Chrome, Tag, Fuel, Gift, X, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";

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
const OFFERS = [
    {
        id: 1,
        title: "ISO Insurance",
        description: "Get comprehensive health insurance designed for international students and OPT workers.",
        discount: "Starting $38/mo",
        category: "Health Insurance",
        badge: "Popular",
        badgeColor: "from-blue-500 to-cyan-500",
        icon: Shield,
        link: "https://www.isoa.org/?ref=trackmyopt",
        featured: true,
    },
    {
        id: 2,
        title: "Kimber Health",
        description: "NY Essential Plan enrollment assistance - $0/month coverage for eligible residents.",
        discount: "FREE for NY",
        category: "Health Insurance",
        badge: "Hot Deal",
        badgeColor: "from-orange-500 to-pink-500",
        icon: CreditCard,
        link: "https://www.kimberhealth.com/",
        featured: true,
    },
    {
        id: 3,
        title: "Migrate Mate",
        description: "Find 500,000+ verified jobs at companies that sponsor H-1B, OPT, TN, E-3, J-1 & Green Cards. Land your dream job in the U.S.",
        discount: "30 Days FREE",
        category: "Job Search",
        badge: "New Partner",
        badgeColor: "from-indigo-500 to-purple-500",
        icon: Briefcase,
        link: "https://www.migratemate.co/trackmyopt",
        featured: true,
    },
    {
        id: 4,
        title: "ISI Student Insurance",
        description: "Affordable student health coverage with United Healthcare network and 24/7 telemedicine.",
        discount: "From $35/mo",
        category: "Health Insurance",
        badge: "Best Value",
        badgeColor: "from-green-500 to-emerald-500",
        icon: Shield,
        link: "https://www.isistudentinsurance.com/",
        featured: false,
    },
    {
        id: 5,
        title: "Tax Filing Assistance",
        description: "Get help filing your taxes as an international student. Special rates for F-1/OPT holders.",
        discount: "20% OFF",
        category: "Tax Services",
        badge: "Limited Time",
        badgeColor: "from-purple-500 to-indigo-500",
        icon: Receipt,
        link: "/dashboard/tax-filing",
        featured: false,
    },
    {
        id: 6,
        title: "Chrome Extension",
        description: "Quick access to your OPT countdown and case status right from your browser.",
        discount: "FREE",
        category: "Tools",
        badge: "New",
        badgeColor: "from-cyan-500 to-blue-500",
        icon: Chrome,
        link: "https://chrome.google.com/webstore",
        featured: false,
    },
];

export default function OffersPage() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedFuelDeal, setSelectedFuelDeal] = useState<FuelDeal | null>(null);
    const [showStepsPopup, setShowStepsPopup] = useState(false);

    const handleClaimDeal = (link: string) => {
        window.open(link, "_blank", "noopener,noreferrer");
        setSelectedFuelDeal(null);
        setShowStepsPopup(false);
    };

    return (
        <div className="min-h-screen bg-background">

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
                    {OFFERS.filter(o => o.featured).map((offer) => (
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
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${offer.badgeColor} flex items-center justify-center flex-shrink-0`}>
                                    <offer.icon className="w-6 h-6 text-white" />
                                </div>

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
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full mt-1">
                                                    💰 {deal.maxSavings}
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

                {/* All Offers */}
                <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-purple-500" />
                    <h2 className="text-xl font-semibold">All Offers</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {OFFERS.filter(o => !o.featured).map((offer) => (
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
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${offer.badgeColor} flex items-center justify-center flex-shrink-0`}>
                                    <offer.icon className="w-5 h-5 text-white" />
                                </div>

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
                                        <span className="text-lg font-semibold">💰 {selectedFuelDeal.maxSavings}</span>
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
                                        📋 Steps to Get This Offer
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
                                                📋 Steps to Get This Offer
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
                                                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Save at the Pump! 🎉</span>
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
