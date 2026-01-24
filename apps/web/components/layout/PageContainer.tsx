"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    fullWidth?: boolean;
}

export function PageContainer({
    children,
    className,
    noPadding = false,
    fullWidth = false
}: PageContainerProps) {
    return (
        <div className={cn(
            "bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm",
            !noPadding && "p-6",
            !fullWidth && "max-w-[1600px] mx-auto",
            className
        )}>
            {children}
        </div>
    );
}
