"use client";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Header({ darkMode, setDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background px-8 py-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}

