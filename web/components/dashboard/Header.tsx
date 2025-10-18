"use client";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Header({ darkMode, setDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative w-10 h-10 rounded-lg bg-muted hover:bg-accent transition-all duration-200 flex items-center justify-center group"
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <div className="relative w-5 h-5">
              <Sun 
                className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                  darkMode 
                    ? 'rotate-90 scale-0 opacity-0' 
                    : 'rotate-0 scale-100 opacity-100'
                }`} 
              />
              <Moon 
                className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                  darkMode 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : '-rotate-90 scale-0 opacity-0'
                }`} 
              />
            </div>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              DA
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">dikondaashish@gmail.com</p>
              <p className="text-xs text-muted-foreground">Premium User</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

