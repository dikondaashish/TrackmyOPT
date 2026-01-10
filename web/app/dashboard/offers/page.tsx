"use client";

import { Tag, ExternalLink, Shield, Zap, FileText, Chrome } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Offers data
const OFFERS = [
    {
        id: 1,
        title: "ISO Insurance",
        description: "Comprehensive health insurance designed for international students and OPT workers. Aetna PPO network included.",
        category: "Health Insurance",
        price: "From $38/mo",
        icon: Shield,
        link: "https://www.isoa.org/?ref=trackmyopt",
        external: true,
    },
    {
        id: 2,
        title: "Kimber Health",
        description: "NY Essential Plan enrollment assistance. $0/month coverage for eligible New York residents.",
        category: "Health Insurance",
        price: "FREE for NY",
        icon: Shield,
        link: "https://www.kimberhealth.com/",
        external: true,
    },
    {
        id: 3,
        title: "ISI Student Insurance",
        description: "Affordable student health coverage with United Healthcare network and 24/7 telemedicine.",
        category: "Health Insurance",
        price: "From $35/mo",
        icon: Shield,
        link: "https://www.isistudentinsurance.com/",
        external: true,
    },
    {
        id: 4,
        title: "Tax Filing Assistance",
        description: "Get help filing your taxes as an international student. Special rates for F-1/OPT holders.",
        category: "Tax Services",
        price: "Free Resources",
        icon: FileText,
        link: "/dashboard/tax-filing",
        external: false,
    },
    {
        id: 5,
        title: "Premium Upgrade",
        description: "Unlock Document Vault, AI document analysis, and advanced email notifications.",
        category: "TrackMyOPT",
        price: "Only $2.99",
        icon: Zap,
        link: "/premium",
        external: false,
    },
    {
        id: 6,
        title: "Chrome Extension",
        description: "Quick access to your OPT countdown and case status right from your browser toolbar.",
        category: "Tools",
        price: "FREE",
        icon: Chrome,
        link: "https://chrome.google.com/webstore",
        external: true,
    },
];

export default function OffersPage() {
    return (
        <div className="space-y-6">
            {/* Page Header - matches DashboardContent pattern */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
                    <p className="text-sm text-muted-foreground">
                        Exclusive deals and resources for international students
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                        ← Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Offers Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OFFERS.map((offer) => (
                    <Card key={offer.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <offer.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    {offer.category}
                                </span>
                                <h3 className="font-semibold text-foreground mt-0.5">
                                    {offer.title}
                                </h3>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                            {offer.description}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <span className="text-sm font-semibold text-primary">
                                {offer.price}
                            </span>

                            {offer.external ? (
                                <a
                                    href={offer.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm" className="gap-1">
                                        View
                                        <ExternalLink className="w-3 h-3" />
                                    </Button>
                                </a>
                            ) : (
                                <Link href={offer.link}>
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Info Section */}
            <Card className="p-6 bg-muted/50">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Partner Offers</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            These offers are provided by our trusted partners. TrackMyOPT may receive compensation for referrals.
                            All offers are curated specifically for international students and OPT workers.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Footer - matches DashboardContent footer */}
            <footer className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                    <span>·</span>
                    <a href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</a>
                    <span>·</span>
                    <a href="/dashboard/help" className="hover:text-foreground transition-colors">Help</a>
                </div>
                <p>© 2025 TrackMyOPT by Zyene, Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
