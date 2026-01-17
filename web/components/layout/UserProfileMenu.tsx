"use client";

import Link from "next/link";
import { LogOut, Settings, HelpCircle, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserProfileMenuProps {
    userEmail?: string;
    userName?: string;
    isCollapsed?: boolean;
    isPremium?: boolean;
}

export function UserProfileMenu({ userEmail, userName, isCollapsed, isPremium }: UserProfileMenuProps) {
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

    // Get user initials for avatar: First letter of First Name + First letter of Last Name
    const getInitials = (name?: string, email?: string) => {
        if (name) {
            const parts = name.trim().split(" ");
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return parts[0].substring(0, 2).toUpperCase();
        }
        if (email) {
            return email.substring(0, 2).toUpperCase();
        }
        return "U";
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                    "flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group",
                    isCollapsed ? "p-0 justify-center w-8 h-8" : "px-2 py-2 w-full"
                )}
                aria-label="User menu"
            >
                {/* Avatar with Badge */}
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-gray-100 font-bold text-sm border border-gray-200 dark:border-gray-700">
                        {getInitials(userName, userEmail)}
                    </div>
                    {/* PRO Badge */}
                    {isPremium && (
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-900 leading-none shadow-sm">
                            PRO
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {userEmail}
                        </p>
                        {isPremium ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                Premium Member
                            </p>
                        ) : (
                            <Link
                                href="/premium/checkout"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium truncate flex items-center gap-1 hover:underline decoration-blue-600/30"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Upgrade to Premium
                            </Link>
                        )}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
                <div className={cn(
                    "absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 w-64",
                    isCollapsed ? "left-0" : "left-0 right-0"
                )}>
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-gray-100 font-bold text-sm">
                                {getInitials(userName, userEmail)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {userName || "User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                        {!isPremium && (
                            <Link
                                href="/premium/checkout"
                                className="block w-full py-2 px-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs font-bold text-center rounded-lg transition-all shadow-sm"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                Upgrade to Premium
                            </Link>
                        )}
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
    );
}
