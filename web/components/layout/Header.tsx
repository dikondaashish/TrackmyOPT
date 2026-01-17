"use client";

import Link from "next/link";
import { Crown, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    userEmail?: string;
    userName?: string;
    isPremium?: boolean;
    onMenuToggle?: () => void;
}

export function Header({ userEmail, userName, isPremium, onMenuToggle }: HeaderProps) {
    const router = useRouter();

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#0F3162] z-50 flex items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
                {/* Mobile Menu Toggle */}
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5 text-white" />
                    </button>
                )}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex items-center justify-center bg-[#226BE7] rounded-lg p-1">
                        <img
                            src="/TrackMyOPT Logo/logo.gif"
                            alt="TrackMyOPT Logo"
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                    <span className="text-white font-bold text-xl hidden sm:block">
                        TrackMyOPT
                    </span>
                </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                {/* Upgrade Button */}
                {!isPremium && (
                    <Link
                        href="/premium/checkout"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-full hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Crown className="w-4 h-4" />
                        <span className="hidden sm:inline">Upgrade to Premium</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
