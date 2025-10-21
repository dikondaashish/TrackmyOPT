"use client";
import { LayoutDashboard, Calendar, Clock, FileText, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { User } from "@supabase/supabase-js";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  user: User | null;
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

export function Sidebar({ collapsed, setCollapsed, user, isPremium, onUpgradeClick }: SidebarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Get user initials from email or name
  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    
    if (user.email) {
      const emailParts = user.email.split('@')[0].split('.');
      return emailParts.length > 1
        ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
        : emailParts[0].substring(0, 2).toUpperCase();
    }
    
    return "U";
  };
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Calendar, label: "OPT Dates", active: false },
    { icon: Clock, label: "Clock Tracker", active: false },
    { icon: FileText, label: "Documents", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: HelpCircle, label: "Help", active: false },
  ];
  
  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent double-clicks
    
    setIsSigningOut(true);
    try {
      // Call signout API
      await fetch('/auth/signout', { 
        method: 'POST',
        credentials: 'include', // Include cookies
      });
      
      // Clear any client-side storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      // Force redirect anyway to ensure user is logged out
      window.location.href = '/';
    }
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white">🔷</span>
          </div>
          {!collapsed && <span className="font-semibold">TrackMyOPT</span>}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-8 h-8 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Expand Button (shown when collapsed) */}
      {collapsed && (
        <div className="px-4 py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full h-10 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0">
            <div 
              className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-semibold" 
              title={collapsed ? user?.email || "User" : undefined}
            >
              {getUserInitials()}
            </div>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">
                PRO
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.email || "Loading..."}</p>
              {isPremium ? (
                <p className="text-xs text-muted-foreground">Premium Member</p>
              ) : (
                <button
                  onClick={onUpgradeClick}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className={`w-4 h-4 flex-shrink-0 ${isSigningOut ? 'animate-spin' : ''}`} />
          {!collapsed && <span className="text-sm">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>}
        </button>
      </div>
    </div>
  );
}

