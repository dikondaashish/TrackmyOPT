"use client";

import { Bookmark, LayoutGrid } from "lucide-react";

interface H1BSponsorTabsProps {
    activeTab: "all" | "saved";
    onTabChange: (tab: "all" | "saved") => void;
    savedCount: number;
}

export function H1BSponsorTabs({ activeTab, onTabChange, savedCount }: H1BSponsorTabsProps) {
    return (
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
            <button
                onClick={() => onTabChange("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "all"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
            >
                <LayoutGrid className="w-4 h-4" />
                All Sponsors
            </button>
            <button
                onClick={() => onTabChange("saved")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "saved"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
            >
                <Bookmark className="w-4 h-4" />
                Saved Sponsors
                {savedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-md">
                        {savedCount}
                    </span>
                )}
            </button>
        </div>
    );
}
