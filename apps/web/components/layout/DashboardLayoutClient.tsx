"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ResumePromoBanner } from "@/components/promo/ResumePromoBanner";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { PremiumStatusProvider, usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { PolicyUpdateConsentModal } from "@/components/compliance/PolicyUpdateConsentModal";
import { PostHogIdentify } from "@/components/analytics/PostHogIdentify";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
}

export function DashboardLayoutClient(props: DashboardLayoutClientProps) {
    // ISS-014 + ISS-002: wrap the whole dashboard in the premium-status provider
    // so the shell, sidebar, and feature pages all read from ONE source that
    // self-heals via Stripe (instead of reading profile.premium_status directly).
    return (
        <PremiumStatusProvider>
            <DashboardLayoutInner {...props} />
        </PremiumStatusProvider>
    );
}

function DashboardLayoutInner({ children }: DashboardLayoutClientProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{
        email?: string;
        name?: string;
    }>({});
    const premium = usePremiumStatus();

    // Fetch user identity (email/name). Premium comes from PremiumStatusProvider so
    // it stays in sync with /api/premium/status self-heal logic.
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("first_name, last_name")
                        .eq("user_id", authUser.id)
                        .single();

                    const fullName = profile?.first_name
                        ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                        : authUser.user_metadata?.full_name || authUser.user_metadata?.name || undefined;

                    setUser({
                        email: authUser.email,
                        name: fullName,
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setIsLoading(false);
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
            <PostHogIdentify />
            <PolicyUpdateConsentModal />
            <ResumePromoBanner variant="dashboard" />
            {/* Fixed Header — below promo banner */}
            <Header
                userEmail={user.email}
                userName={user.name}
                isPremium={premium.isPremium === true}
                onMenuToggle={handleMobileMenuToggle}
            />

            {/* Fixed Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={handleMobileMenuClose}
                userEmail={user.email}
                userName={user.name}
                isPremium={premium.isPremium === true}
                isLoading={isLoading || premium.isLoading}
            />

            {/* Main Content Area - This is the only scrollable section */}
            <main
                className={cn(
                    "fixed bottom-0 right-0 transition-all duration-300 overflow-hidden",
                    "top-[calc(3.5rem+var(--tmopt-dashboard-promo,0px))]",
                    // Desktop: adjust for sidebar
                    isSidebarCollapsed ? "lg:left-16" : "lg:left-[230px]",
                    // Mobile: full width
                    "left-0"
                )}
            >
                {/* Outer Padding Container */}
                <div className="h-full p-1 sm:p-4 overflow-hidden">
                    {/* White Container - THIS IS THE SCROLLABLE AREA */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-full overflow-y-auto">
                        {/* Inner Padding */}
                        <div className="p-3 sm:p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
