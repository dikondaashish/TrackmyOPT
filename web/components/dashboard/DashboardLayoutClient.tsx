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
  const [darkMode, setDarkMode] = useState(false); // Default to light
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
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

    // Listen for storage changes (when settings page changes dark mode - cross tab)
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
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        
        if (!mounted) return;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.user && mounted) {
            setUser(data.user);
            
            // Force a re-render
            setTimeout(() => {
            }, 100);
          } else {
          }
        } else {
          const errorText = await response.text();
        }

        // Fetch premium status
        const premiumResponse = await fetch('/api/premium/status', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        
        if (!mounted) return;
        
        if (premiumResponse.ok) {
          const premiumData = await premiumResponse.json();
          if (mounted) {
            setIsPremium(premiumData.isPremium || false);
          }
        } else {
          const errorText = await premiumResponse.text();
        }
      } catch (error) {
      }
    };

    // Immediate fetch
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
      // Clean up URL without reload
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('tmo_dark_mode', String(value));
    // Dispatch custom event to sync with settings page
    window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { darkMode: value } }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Sidebar */}
      <Sidebar 
        key={user?.email || 'no-user'} // Force re-render when user changes
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
