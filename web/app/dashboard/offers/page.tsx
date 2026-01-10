"use client";

import { ArrowLeft, Shield, FileText, Receipt, Clock, Star, ExternalLink, CreditCard, Chrome, Crown, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
        id: 4,
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
        id: 5,
        title: "Premium Upgrade",
        description: "Unlock Document Vault, AI analysis, and advanced email notifications.",
        discount: "Only $2.99",
        category: "TrackMyOPT",
        badge: "One-Time",
        badgeColor: "from-yellow-500 to-orange-500",
        icon: Crown,
        link: "/premium",
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                </div>
            </div>

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
        </div>
    );
}
