"use client";
import { Moon, Sun, ChevronDown, LogOut, Settings, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  user: User | null;
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

export function Header({ darkMode, setDarkMode, user, isPremium, onUpgradeClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user display name
  const getUserName = () => {
    if (!user) return "User";
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.email) return user.email.split("@")[0];
    return "User";
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch("/auth/signout", { method: "POST", credentials: "include" });
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 h-14 bg-[#1e3a5f] dark:bg-[#0f1d2f] flex items-center justify-between px-4 lg:px-6 shadow-md">
      {/* Left Side: Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
          <Image
            src="/TrackMyOPT Logo/1.gif"
            alt="TrackMyOPT Logo"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
        </div>
        <span className="text-white font-semibold text-lg hidden sm:block">
          TrackMyOPT
        </span>
      </Link>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3">
        {/* Upgrade Button (for free users) */}
        {!isPremium && (
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white text-sm font-medium shadow-lg shadow-teal-500/25 transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Upgrade to Premium</span>
            <span className="sm:hidden">Upgrade</span>
          </button>
        )}

        {/* Premium Badge (for premium users) */}
        {isPremium && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRO</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Moon className="w-4.5 h-4.5 text-white" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-white" />
          )}
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-inner">
              {getUserInitials()}
            </div>
            <span className="text-white text-sm font-medium hidden md:block max-w-[120px] truncate">
              {getUserName()}
            </span>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getUserName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <LogOut className={`w-4 h-4 ${isSigningOut ? "animate-spin" : ""}`} />
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
