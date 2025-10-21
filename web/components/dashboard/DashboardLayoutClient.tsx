"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { PricingModal } from "@/components/pricing/PricingModal";
import { User } from "@supabase/supabase-js";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialUser: User | null;
  initialIsPremium: boolean;
}

export function DashboardLayoutClient({ children, initialUser, initialIsPremium }: DashboardLayoutClientProps) {
  const searchParams = useSearchParams();
  const [darkMode, setDarkMode] = useState(false); // Default to light
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user] = useState<User | null>(initialUser);
  const [isPremium] = useState(initialIsPremium);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    // Apply dark mode class to html element
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Load dark mode preference from localStorage or system preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('tmo_dark_mode');
    if (savedMode !== null) {
      // User has a saved preference
      setDarkMode(savedMode === 'true');
    } else {
      // No saved preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // User data is now passed from server-side, no need to fetch

  // Check for pricing modal URL parameter from extension
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade === 'true') {
      setShowPricingModal(true);
      // Clean up URL without reload
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('tmo_dark_mode', String(value));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        user={user}
        isPremium={isPremium}
        onUpgradeClick={() => setShowPricingModal(true)}
      />
      
      {/* Main Content Area - shifts based on sidebar state */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Fixed Header */}
        <Header darkMode={darkMode} setDarkMode={handleDarkModeToggle} />
        
        {/* Scrollable Content */}
        <main className="px-6 py-6">{children}</main>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        userEmail={user?.email}
        isPremium={isPremium}
      />
    </div>
  );
}
