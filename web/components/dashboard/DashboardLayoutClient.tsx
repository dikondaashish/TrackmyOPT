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
  }, []);

  // Fetch user data and premium status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🔄 Starting user data fetch...');
        const response = await fetch('/api/me', {
          credentials: 'include', // Include cookies for authentication
          cache: 'no-store', // Don't cache the response
        });
        
        console.log('📡 API /me response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Full API response:', JSON.stringify(data, null, 2));
          console.log('👤 User object:', data.user);
          console.log('📧 User email:', data.user?.email);
          
          if (data.user) {
            setUser(data.user);
            console.log('✅ User state updated with:', data.user.email);
          } else {
            console.error('❌ No user object in response');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch user data:', response.status, errorText);
        }

        console.log('🔄 Starting premium status fetch...');
        const premiumResponse = await fetch('/api/premium/status', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        console.log('📡 API /premium/status response status:', premiumResponse.status);
        
        if (premiumResponse.ok) {
          const premiumData = await premiumResponse.json();
          console.log('✅ Premium status response:', JSON.stringify(premiumData, null, 2));
          setIsPremium(premiumData.isPremium || false);
          console.log('✅ Premium state updated:', premiumData.isPremium);
        } else {
          const errorText = await premiumResponse.text();
          console.error('❌ Failed to fetch premium status:', premiumResponse.status, errorText);
        }
      } catch (error) {
        console.error('❌ Exception during fetch:', error);
      }
    };

    // Small delay to ensure cookies are set
    const timer = setTimeout(() => {
      fetchUserData();
    }, 100);

    return () => clearTimeout(timer);
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
