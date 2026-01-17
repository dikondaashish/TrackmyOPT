"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { PricingModal } from "@/components/pricing/PricingModal";
import { User } from "@supabase/supabase-js";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const searchParams = useSearchParams();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
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
      setDarkMode(savedMode === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Listen for storage changes (cross tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tmo_dark_mode' && e.newValue !== null) {
        setDarkMode(e.newValue === 'true');
      }
    };

    // Listen for custom event (same page sync from settings)
    const handleDarkModeChange = (e: CustomEvent) => {
      setDarkMode(e.detail.darkMode);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('darkModeChanged', handleDarkModeChange as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('darkModeChanged', handleDarkModeChange as EventListener);
    };
  }, []);

  // Fetch user data and premium status
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();

          if (data.user && mounted) {
            setUser(data.user);

            // Record web session for login activity tracking
            fetch('/api/user/sessions', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                device_type: 'web',
                device_info: navigator.userAgent.includes('Chrome') ? 'Chrome Browser' :
                  navigator.userAgent.includes('Firefox') ? 'Firefox Browser' :
                    navigator.userAgent.includes('Safari') ? 'Safari Browser' :
                      'Web Browser',
              }),
            }).catch(() => { });
          }
        }

        // Fetch premium status
        const premiumResponse = await fetch('/api/premium/status', {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!mounted) return;

        if (premiumResponse.ok) {
          const premiumData = await premiumResponse.json();
          if (mounted) {
            setIsPremium(premiumData.isPremium || false);
          }
        }
      } catch (error) {
        // Silently fail
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []);

  // Check for pricing modal URL parameter from extension
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade === 'true') {
      setShowPricingModal(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('tmo_dark_mode', String(value));
    window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { darkMode: value } }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-foreground">
      {/* Fixed Header - Full Width at Top */}
      <Header
        darkMode={darkMode}
        setDarkMode={handleDarkModeToggle}
        user={user}
        isPremium={isPremium}
        onUpgradeClick={() => setShowPricingModal(true)}
      />

      {/* Fixed Sidebar - Below Header */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area - shifts based on sidebar state */}
      <div
        className={`transition-all duration-300 pt-0 ${sidebarCollapsed ? 'ml-16' : 'ml-60'
          }`}
      >
        {/* Scrollable Content */}
        <main className="min-h-[calc(100vh-56px)] p-6">
          {children}
        </main>
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
