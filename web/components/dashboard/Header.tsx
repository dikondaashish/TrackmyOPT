"use client";
import { Moon, Sun, Tag } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Header({ darkMode, setDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background px-8 py-4">
      <div className="flex items-center justify-end gap-4">
        {/* Deals Button - Compact */}
        <Link
          href="/dashboard/offers"
          className="group relative flex flex-col items-center px-3 py-1 rounded-full 
                     bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 
                     hover:from-purple-500/20 hover:via-pink-500/20 hover:to-orange-500/20
                     dark:from-purple-500/20 dark:via-pink-500/20 dark:to-orange-500/20
                     dark:hover:from-purple-500/30 dark:hover:via-pink-500/30 dark:hover:to-orange-500/30
                     border border-purple-200/50 dark:border-purple-500/30
                     hover:border-purple-300 dark:hover:border-purple-400/50
                     hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/10
                     transition-all duration-200 ease-out"
        >
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-xs text-purple-700 dark:text-purple-300">
              Deals
            </span>
          </div>
          <span className="text-[8px] text-purple-600/70 dark:text-purple-300/70 leading-tight">
            Get your premium back
          </span>
          {/* Hot Badge */}
          <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold uppercase
                          bg-gradient-to-r from-orange-500 to-pink-500 text-white 
                          rounded-full shadow-sm animate-pulse">
            Hot
          </span>
        </Link>

        {/* Apple-style theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="group relative w-16 h-8 rounded-full bg-muted hover:bg-accent transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {/* Toggle track */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-out ${darkMode ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
            </div>
          </div>

          {/* Toggle thumb */}
          <div
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center transition-transform duration-300 ease-out ${darkMode ? 'translate-x-8' : 'translate-x-0'
              }`}
          >
            {darkMode ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </div>

          {/* Icons in track */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            <Sun className={`w-3.5 h-3.5 transition-opacity duration-200 ${darkMode ? 'opacity-30' : 'opacity-0'}`} />
            <Moon className={`w-3.5 h-3.5 transition-opacity duration-200 ${darkMode ? 'opacity-0' : 'opacity-30'}`} />
          </div>
        </button>
      </div>
    </header>
  );
}
