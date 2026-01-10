"use client";
import { Moon, Sun, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Header({ darkMode, setDarkMode }: HeaderProps) {
  const pathname = usePathname();
  const isOffersActive = pathname === "/dashboard/offers";

  return (
    <header className="sticky top-0 z-10 border-b border-border/50 backdrop-blur-xl bg-background/80 px-8 py-4">
      <div className="flex items-center justify-end gap-3">
        {/* Offers Button - Matches sidebar nav style */}
        <Link
          href="/dashboard/offers"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isOffersActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
        >
          <Tag className="w-4 h-4" />
          <span>Offers</span>
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
            New
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
