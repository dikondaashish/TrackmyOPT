"use client";

import Link from "next/link";
import { LogOut, Settings, HelpCircle, ChevronDown, ShieldCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOutWithAnalytics } from "@/lib/auth/sign-out-with-analytics";
import { requestOpenPrivacyChoices } from "@/lib/cookie-consent";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface UserProfileMenuProps {
    userEmail?: string;
    userName?: string;
    isCollapsed?: boolean;
    isPremium?: boolean;

    isLoading?: boolean;
    side?: "bottom" | "top"; // 'bottom' = button is at bottom (expand up), 'top' = button is at top (expand down)
    align?: "start" | "end"; // 'start' = left aligned, 'end' = right aligned
}

export function UserProfileMenu({ userEmail, userName, isCollapsed, isPremium, isLoading, side = "bottom", align = "start" }: UserProfileMenuProps) {
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
        await signOutWithAnalytics("profile_menu");
        router.push("/login");
    };

    // Get user initials for avatar
    const getInitials = (name?: string, email?: string) => {
        if (name) {
            const names = name
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            if (names.length === 0) return "U";

            const firstInitial = names[0]?.[0] || "";
            const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || "" : "";

            return `${firstInitial}${lastInitial}`.toUpperCase();
        }

        if (email) {
            const emailParts = email.split("@")[0].split(".");
            return emailParts.length > 1
                ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
                : emailParts[0].substring(0, 2).toUpperCase();
        }

        return "U";
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                    "flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 active:scale-[0.98] transition-colors text-left group",
                    isCollapsed ? "justify-center w-full py-2" : "px-2 py-1.5 w-full"
                )}
                aria-label="User menu"
            >
                {/* ... (button content same as before) ... */}
                {/* Avatar with Badge */}
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm border border-gray-200 dark:border-gray-700">
                        {getInitials(userName, userEmail)}
                    </div>
                    {isPremium && (
                        <div className="absolute -bottom-3.5 -right-0.5 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg border-2 border-white dark:border-gray-900 uppercase">
                            Pro
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-full">
                            {userEmail}
                        </p>
                        {isLoading ? (
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
                        ) : isPremium ? (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Pro Member
                            </span>
                        ) : (
                            <Link
                                href="/premium/checkout?planId=pro&interval=year"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Try Pro Free
                            </Link>
                        )}
                    </div>
                )}

                {!isCollapsed && (
                    <ChevronDown className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </button>

            {/* Dropdown Menu with Framer Motion */}
            <AnimatePresence>
                {showProfileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                            "absolute bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 w-52",
                            align === "end" ? "right-0" : "left-0",
                            side === "bottom"
                                ? "bottom-full mb-3"
                                : "top-full mt-3",
                            side === "bottom"
                                ? (align === "end" ? "origin-bottom-right" : "origin-bottom-left")
                                : (align === "end" ? "origin-top-right" : "origin-top-left")
                        )}
                    >
                        {/* User Info Header */}
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
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    requestOpenPrivacyChoices();
                                }}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Privacy choices
                            </button>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
