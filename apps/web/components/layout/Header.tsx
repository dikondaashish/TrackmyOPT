"use client";

import Link from "next/link";
import Image from "next/image";
import { Crown, Menu, Tag } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { formatUsd, OFFERS_CATALOG_TOTAL_SAVINGS_USD } from "@/lib/offers/catalog-savings";

interface HeaderProps {
    userEmail?: string;
    userName?: string;
    isPremium?: boolean;
    onMenuToggle?: () => void;
}

export function Header({ isPremium, onMenuToggle }: HeaderProps) {

    return (
        <header className="fixed left-0 right-0 top-[var(--tmopt-dashboard-promo,0px)] z-50 flex h-14 items-center justify-between bg-[#0F3162] px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
                {/* Mobile Menu Toggle */}
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden min-h-11 min-w-11 p-2.5 rounded-lg hover:bg-[#163B73] transition-colors flex items-center justify-center"
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
                        className="flex items-center gap-2 px-3 py-2 max-md:min-h-11 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        <Crown className="w-4 h-4" />
                        <span className="hidden md:inline">Get Pro</span>
                        <span className="md:hidden">Go Pro</span>
                    </Link>
                )}

                {/* Deals Button - Premium UI */}
                <Link
                    href="/dashboard/offers"
                    className="group relative hidden sm:flex items-center gap-3 px-3 py-1 bg-[#163B73] hover:bg-[#1D4A8C] border border-[#2A5596] rounded-lg transition-colors"
                >
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[#0F3162] text-indigo-200">
                        <Tag className="w-4 h-4" />
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white leading-none mb-0.5">Deals</span>
                        <span className="text-[10px] font-medium text-blue-200 leading-none">
                            {formatUsd(OFFERS_CATALOG_TOTAL_SAVINGS_USD)} free for you
                        </span>
                    </div>
                </Link>

                {/* Mobile Simple Deals Icon */}
                <Link
                    href="/dashboard/offers"
                    className="sm:hidden min-h-11 min-w-11 p-2.5 text-gray-300 hover:text-white transition-colors relative flex items-center justify-center"
                >
                    <Tag className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0F3162]" />
                </Link>

                <ThemeToggle />
            </div>
        </header>
    );
}
