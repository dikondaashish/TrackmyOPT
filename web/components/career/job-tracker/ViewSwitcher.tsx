"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, Table2, Calendar } from "lucide-react";

export type JobTrackerView = "board" | "table" | "calendar";

interface ViewSwitcherProps {
    currentView: JobTrackerView;
    onViewChange: (view: JobTrackerView) => void;
}

const VIEWS = [
    { id: "board" as const, label: "Board", icon: LayoutGrid },
    { id: "table" as const, label: "Table", icon: Table2 },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
];

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {VIEWS.map((view) => {
                const Icon = view.icon;
                const isActive = currentView === view.id;

                return (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{view.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
