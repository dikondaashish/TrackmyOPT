"use client";

import { ArrowLeft, Shield, Receipt, FileText, Zap, Chrome, Tag, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

// Sample offers data - using icons consistent with rest of project (Sidebar uses Shield, Receipt, FileText, etc.)
const OFFERS = [
    {
        id: 1,
        title: "ISO Insurance",
        description: "Get comprehensive health insurance designed for international students and OPT workers.",
        discount: "Starting $38/mo",
        category: "Health Insurance",
        badge: "Popular",
        badgeColor: "bg-blue-500",
        icon: Shield,
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
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
        badgeColor: "bg-orange-500",
        icon: Shield,
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
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
        badgeColor: "bg-green-500",
        icon: Shield,
        iconColor: "text-indigo-600 dark:text-indigo-400",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
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
        badgeColor: "bg-purple-500",
        icon: Receipt,
        iconColor: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
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
        badgeColor: "bg-amber-500",
        icon: Zap,
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
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
        badgeColor: "bg-cyan-500",
        icon: Chrome,
        iconColor: "text-cyan-600 dark:text-cyan-400",
        iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
        link: "https://chrome.google.com/webstore",
        featured: false,
    },
];

export default function OffersPage() {
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

            {/* Page Title */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Special Offers</h1>
                    <p className="text-muted-foreground mt-1">
                        Exclusive deals curated for international students and OPT workers.
                    </p>
                </div>

                {/* Featured Offers */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-muted-foreground" />
                        Featured Offers
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {OFFERS.filter(o => o.featured).map((offer) => (
                            <a
                                key={offer.id}
                                href={offer.link}
                                target={offer.link.startsWith("http") ? "_blank" : "_self"}
                                rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="group flex gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-accent transition-colors"
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-lg ${offer.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <offer.icon className={`w-5 h-5 ${offer.iconColor}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground">{offer.title}</h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase text-white rounded-full ${offer.badgeColor}`}>
                                            {offer.badge}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            {offer.discount}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                            View <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* All Offers */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">All Offers</h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {OFFERS.filter(o => !o.featured).map((offer) => (
                            <a
                                key={offer.id}
                                href={offer.link}
                                target={offer.link.startsWith("http") ? "_blank" : "_self"}
                                rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="group p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-accent transition-colors"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-lg ${offer.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        <offer.icon className={`w-4 h-4 ${offer.iconColor}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-foreground">{offer.title}</h3>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{offer.category}</span>
                                    </div>

                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase text-white rounded ${offer.badgeColor}`}>
                                        {offer.badge}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{offer.description}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        {offer.discount}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                        View <ExternalLink className="w-3 h-3" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-lg bg-muted/50 border border-border p-6">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground">Offers updated regularly</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Partner offers are provided by third parties. TrackMyOPT may receive compensation for referrals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 TrackMyOPT by Zyene, Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
