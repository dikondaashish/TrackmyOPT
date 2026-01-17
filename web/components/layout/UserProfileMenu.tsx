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
}

export function UserProfileMenu({ userEmail, userName, isCollapsed }: UserProfileMenuProps) {
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
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                    "flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    isCollapsed ? "p-0 justify-center w-8 h-8" : "px-2 py-1.5 w-full"
                )}
                aria-label="User menu"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(userName, userEmail)}
                </div>

                {!isCollapsed && (
                    <>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {userName || userEmail?.split("@")[0] || "User"}
                            </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
                <div className={cn(
                    "absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 w-64",
                    isCollapsed ? "left-0" : "left-0 right-0"
                )}>
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
