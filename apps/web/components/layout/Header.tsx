"use client";

import Link from "next/link";
import Image from "next/image";
import { Crown, Menu, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { formatUsd, OFFERS_CATALOG_TOTAL_SAVINGS_USD } from "@/lib/offers/catalog-savings";

interface HeaderProps {
    userEmail?: string;
    userName?: string;
    isPremium?: boolean;
    onMenuToggle?: () => void;
}

export function Header({ userEmail, userName, isPremium, onMenuToggle }: HeaderProps) {
    const router = useRouter();

    return (
        <header className="fixed left-0 right-0 top-[var(--tmopt-dashboard-promo,0px)] z-50 flex h-14 items-center justify-between bg-[#0F3162] px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
                {/* Mobile Menu Toggle */}
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden min-h-11 min-w-11 p-2.5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5 text-white" />
                    </button>
                )}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex items-center justify-center bg-[#226BE7] rounded-lg p-1">
                        <Image
                            src="/TrackMyOPT Logo/logo.gif"
                            alt="TrackMyOPT Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                            unoptimized
                        />
                    </div>
                    <span className="text-white font-bold text-xl hidden sm:block">
                        TrackMyOPT
                    </span>
                </Link>
            </div>


            {/* Right Side */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Upgrade Button - Moved to Left per request */}
                {!isPremium && (
                    <Link
                        href="/premium/checkout?planId=pro&interval=year"
                        className="flex items-center gap-2 px-3 py-2 max-md:min-h-11 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Crown className="w-4 h-4" />
                        <span className="hidden md:inline">Get Pro</span>
                        <span className="md:hidden">Go Pro</span>
                    </Link>
                )}

                {/* Deals Button - Premium UI */}
                <Link
                    href="/dashboard/offers"
                    className="group relative hidden sm:flex items-center gap-3 px-4 py-1 bg-gray-900/40 dark:bg-black/40 hover:bg-gray-900/60 dark:hover:bg-black/60 border border-white/10 dark:border-white/5 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                    {/* Icon Circle */}
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500/30 group-hover:text-indigo-200 transition-colors">
                        <Tag className="w-4 h-4" />
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-100 dark:text-gray-100 leading-none mb-0.5">Deals</span>
                        <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300 transition-colors leading-none">
                            {formatUsd(OFFERS_CATALOG_TOTAL_SAVINGS_USD)} free for you
                        </span>
                    </div>

                    {/* HOT Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg scale-90 animate-bounce-slow">
                        HOT
                    </div>
                </Link>

                {/* Mobile Simple Deals Icon */}
                <Link
                    href="/dashboard/offers"
                    className="sm:hidden min-h-11 min-w-11 p-2.5 text-gray-300 hover:text-white transition-colors relative flex items-center justify-center"
                >
                    <Tag className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-gray-900" />
                </Link>

                <ThemeToggle />
            </div>
        </header>
    );
}
