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
        <div className="min-h-screen bg-[#e8edf5] dark:bg-gray-950">
            {/* Header */}
            <Header
                userEmail={user.email}
                userName={user.name}
                isPremium={user.isPremium}
                onMenuToggle={handleMobileMenuToggle}
            />

            {/* Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={handleMobileMenuClose}
            />

            {/* Main Content Area */}
            <main
                className={cn(
                    "pt-14 min-h-screen transition-all duration-300",
                    // Desktop: adjust for sidebar
                    "lg:pl-[200px]",
                    isSidebarCollapsed && "lg:pl-16",
                    // Mobile: no padding for sidebar
                    "pl-0"
                )}
            >
                {/* Inner Container with Light Background */}
                <div className="p-4 min-h-[calc(100vh-56px)]">
                    {children}
                </div>
            </main>
        </div>
    );
}
