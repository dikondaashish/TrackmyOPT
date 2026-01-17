"use client";

import Link from "next/link";
import { Crown, ChevronDown, LogOut, Settings, HelpCircle, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface HeaderProps {
    userEmail?: string;
    userName?: string;
    isPremium?: boolean;
    onMenuToggle?: () => void;
}

export function Header({ userEmail, userName, isPremium, onMenuToggle }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // Get user initials for avatar
    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return "U";
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
                {/* Mobile Menu Toggle */}
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                )}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex items-center justify-center">
                        <img
                            src="/TrackMyOPT Logo/logo.gif"
                            alt="TrackMyOPT Logo"
                            className="w-10 h-10 object-contain"
                        />
                    </div>
                    <span className="text-gray-900 dark:text-white text-lg hidden sm:block font-normal">
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

                {/* Profile Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(userName, userEmail)}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium hidden md:block max-w-[120px] truncate">
                            {userName || userEmail?.split("@")[0] || "User"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                            {/* User Info */}
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {userName || "User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {userEmail}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <Link
                                    href="/dashboard/help"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    Help & Support
                                </Link>
                            </div>

                            {/* Sign Out */}
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
