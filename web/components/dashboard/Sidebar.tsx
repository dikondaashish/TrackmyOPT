"use client";
import { LayoutDashboard, Calendar, ClipboardCheck, Clock, FileText, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight, Shield, Receipt, Briefcase } from "lucide-react";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  user: User | null;
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

export function Sidebar({ collapsed, setCollapsed, user, isPremium, onUpgradeClick }: SidebarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Get user initials from email or name
  const getUserInitials = () => {

    if (!user) {
      return "U";
    }

    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ');
      const initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
      return initials;
    }

    if (user.email) {
      const emailParts = user.email.split('@')[0].split('.');
      const initials = emailParts.length > 1
        ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
        : emailParts[0].substring(0, 2).toUpperCase();
      return initials;
    }

    return "U";
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", badge: null },
    { icon: Calendar, label: "OPT Dates", path: "/dashboard/opt-dates", badge: null },
    { icon: ClipboardCheck, label: "Case Status", path: "/dashboard/case-status", badge: null },
    { icon: Clock, label: "OPT Tools", path: "/dashboard/opt-tools", badge: null },
    { icon: Briefcase, label: "Job Tracker", path: "/dashboard/career", badge: "New" },
    { icon: Shield, label: "Health Insurance", path: "/dashboard/opt-health-insurance-finder", badge: "From $0" },
    { icon: FileText, label: "Documents", path: "/dashboard/documents", badge: null },
    { icon: Receipt, label: "Tax Filing", path: "/dashboard/tax-filing", badge: "Free" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings", badge: null },
    { icon: HelpCircle, label: "Help", path: "/dashboard/help", badge: null },
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
      }

      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      // Force redirect anyway to ensure user is logged out
      window.location.href = '/';
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image
              src="/TrackMyOPT Logo/1.gif"
              alt="TrackMyOPT Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
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
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0">
            {/* User Avatar Circle */}
            <div
              className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-semibold shadow-md"
              title={collapsed ? user?.email || "User" : undefined}
            >
              {getUserInitials()}
            </div>
            {/* PRO Badge */}
            {isPremium && (
              <div className="absolute -bottom-3.5 -right-0.5 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg border-2 border-background uppercase">
                Pro
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
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${collapsed ? 'justify-center' : ''
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

