"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className={cn("w-[72px] h-9 bg-gray-100/10 rounded-full animate-pulse", className)} />
        )
    }

    return (
        <div className={cn(
            "flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner",
            className
        )}>
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "max-md:min-h-11 max-md:min-w-11 max-md:w-11 max-md:h-11 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200",
                    theme === 'light'
                        ? "bg-white text-yellow-500 shadow-sm scale-110"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
                aria-label="Light mode"
            >
                <Sun className="w-4 h-4 fill-current" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "max-md:min-h-11 max-md:min-w-11 max-md:w-11 max-md:h-11 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200",
                    theme === 'dark'
                        ? "bg-gray-700 text-blue-400 shadow-sm scale-110"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
                aria-label="Dark mode"
            >
                <Moon className="w-4 h-4 fill-current" />
            </button>
        </div>
    )
}
