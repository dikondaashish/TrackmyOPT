"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{
        email?: string;
        name?: string;
        isPremium?: boolean;
    }>({});

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // Get profile for premium status
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_premium, first_name, last_name")
                    .eq("user_id", authUser.id)
                    .single();

                setUser({
                    email: authUser.email,
                    name: profile?.first_name
                        ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                        : undefined,
                    isPremium: profile?.is_premium || false,
                });
            }
        };

        fetchUser();
    }, []);

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("trackmyopt_sidebar_collapsed");
        if (saved === "true") {
            setIsSidebarCollapsed(true);
        }
    }, []);

    const handleToggleCollapse = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("trackmyopt_sidebar_collapsed", String(newState));
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="h-screen overflow-hidden bg-[#e8edf5] dark:bg-gray-950">
            {/* Fixed Header */}
            <Header
                userEmail={user.email}
                userName={user.name}
                isPremium={user.isPremium}
                onMenuToggle={handleMobileMenuToggle}
            />

            {/* Fixed Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={handleMobileMenuClose}
            />

            {/* Main Content Area - This is the only scrollable section */}
            <main
                className={cn(
                    "fixed top-14 bottom-0 right-0 transition-all duration-300 overflow-hidden",
                    // Desktop: adjust for sidebar
                    "lg:left-[230px]",
                    isSidebarCollapsed && "lg:left-16",
                    // Mobile: full width
                    "left-0"
                )}
            >
                {/* Outer Padding Container */}
                <div className="h-full p-4 overflow-hidden">
                    {/* White Container - THIS IS THE SCROLLABLE AREA */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-full overflow-y-auto">
                        {/* Inner Padding */}
                        <div className="p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
