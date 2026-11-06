"use client";

import {
    Clock,
    ExternalLink,
    Banknote,
    MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";
import { OfferBrandLogo } from "@/components/dashboard/offers/OfferBrandLogo";
import { formatUsd } from "@/lib/offers/catalog-savings";
import {
    FUEL_DEALS,
    OFFERS,
    OFFER_SECTIONS,
    getCatalogSavings,
    getFeaturedOffers,
    type FuelDeal,
} from "./offers-catalog";
import { useAnimatedNumber } from "./useAnimatedNumber";
import { FuelDealModal } from "./FuelDealModal";

export default function OffersPage() {
    const [selectedFuelDeal, setSelectedFuelDeal] = useState<FuelDeal | null>(null);
    const [showStepsPopup, setShowStepsPopup] = useState(false);
    const catalogSavings = useMemo(() => getCatalogSavings(OFFERS, FUEL_DEALS), []);
    const animatedSavings = useAnimatedNumber(catalogSavings.totalUsd);
    const savingsLabel = formatUsd(animatedSavings);

    const handleClaimDeal = (link: string) => {
        window.open(link, "_blank", "noopener,noreferrer");
        setSelectedFuelDeal(null);
        setShowStepsPopup(false);
    };

    return (
        <div className="max-md:-mx-3 max-md:-my-3 md:min-h-screen bg-background">

            {/* Hero Section */}
            <div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                            Special Offers
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Use your college email to save up to{" "}
                            <strong className="tabular-nums text-green-600 dark:text-green-400">{savingsLabel}</strong> across{" "}
                            {catalogSavings.dealCount} deals for international students and OPT workers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Featured Offers */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">Featured Offers</h2>
                    <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                        Hand-picked for international students and OPT workers — health coverage, taxes, banking without an SSN, and job-search essentials.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {getFeaturedOffers(OFFERS).map((offer) => (
                        <a
                            key={offer.id}
                            href={offer.link}
                            target={offer.link.startsWith("http") ? "_blank" : "_self"}
                            rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:scale-[1.02]"
                        >
                            {/* Content */}
                            <div className="flex items-start gap-4">
                                <OfferBrandLogo name={offer.title} domain={offer.logoDomain} size="lg" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {offer.category} · {offer.badge}
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
                        </a>
                    ))}
                </div>

                {/* Fuel & Rewards Deals */}
                <div className="flex items-baseline gap-3 mb-6">
                    <h2 className="text-xl font-semibold">Fuel & Rewards Deals</h2>
                    <span className="text-sm text-muted-foreground">New partner</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {FUEL_DEALS.map((deal) => (
                        <button
                            key={deal.id}
                            onClick={() => setSelectedFuelDeal(deal)}
                            className="group relative overflow-hidden rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-700 p-6 hover:shadow-2xl hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:scale-[1.02] text-left"
                        >
                            {/* Content */}
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg ${deal.badgeColor} flex items-center justify-center flex-shrink-0`}>
                                    <deal.icon className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {deal.category} · {deal.badge}
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
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-1 inline-flex items-center gap-1">
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
                            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span>Available in: {deal.availableStates.join(", ")}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Student Offers Directory */}
                <h2 className="text-xl font-semibold mb-2">Student Offers Directory</h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-3xl">
                    Verified evergreen deals for international students and F-1/OPT holders — prioritized where no US SSN is required.
                </p>

                {OFFER_SECTIONS.map((section) => {
                    const sectionOffers = OFFERS.filter(o => o.section === section.id);
                    if (sectionOffers.length === 0) return null;

                    return (
                        <div key={section.id} className="mb-12">
                            <h3 className="text-lg font-semibold mb-6">{section.title}</h3>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sectionOffers.map((offer) => (
                                    <a
                                        key={offer.id}
                                        href={offer.link}
                                        target={offer.link.startsWith("http") ? "_blank" : "_self"}
                                        rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                        className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <OfferBrandLogo name={offer.title} domain={offer.logoDomain} />

                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {offer.category} · {offer.badge}
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
                <h2 className="text-xl font-semibold mb-6">Essential Services</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {OFFERS.filter(o => o.section === "essential").map((offer) => (
                        <a
                            key={offer.id}
                            href={offer.link}
                            target={offer.link.startsWith("http") ? "_blank" : "_self"}
                            rel={offer.link.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:scale-[1.02]"
                        >
                            <div className="flex items-start gap-3">
                                <OfferBrandLogo name={offer.title} domain={offer.logoDomain} />

                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {offer.category} · {offer.badge}
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
                <div className="rounded-xl bg-purple-600 p-8 sm:p-12">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Don't Miss Out!
                        </h2>
                        <p className="text-white max-w-xl mx-auto mb-6">
                            These exclusive offers are available for a limited time. Take advantage of our partner deals today.
                        </p>

                        <div className="flex items-center justify-center gap-2 text-purple-100 text-sm">
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

            {selectedFuelDeal && (
                <FuelDealModal
                    deal={selectedFuelDeal}
                    showStepsPopup={showStepsPopup}
                    onClose={() => setSelectedFuelDeal(null)}
                    onShowSteps={() => setShowStepsPopup(true)}
                    onHideSteps={() => setShowStepsPopup(false)}
                    onClaim={handleClaimDeal}
                />
            )}
        </div>
    );
}
