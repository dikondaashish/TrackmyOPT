"use client";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Header({ darkMode, setDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 backdrop-blur-xl bg-background/80 px-8 py-4">
      <div className="flex items-center justify-end">
        {/* Apple-style theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="group relative w-16 h-8 rounded-full bg-muted hover:bg-accent transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {/* Toggle track */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                darkMode ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
            </div>
          </div>
          
          {/* Toggle thumb */}
          <div
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center transition-transform duration-300 ease-out ${
              darkMode ? 'translate-x-8' : 'translate-x-0'
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

