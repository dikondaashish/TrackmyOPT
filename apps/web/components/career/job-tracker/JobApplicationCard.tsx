"use client";

import { useEffect, useRef, useState } from "react";
import { JobApplication } from "@/lib/career/job-tracker/types";
import { MapPin, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { getRelativeDate } from "@/lib/career/job-tracker/filtering";
import { CompanyLogo } from "./CompanyLogo";

interface JobApplicationCardProps {
    application: JobApplication & {
        sponsor_h1b?: boolean;
        is_archived?: boolean;
    };
    onClick: () => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void | Promise<void>;
}

export function JobApplicationCard({
    application,
    onClick,
    onArchive,
    onDelete,
}: JobApplicationCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: application.id,
        data: {
            type: "JobCard",
            application,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                "group relative bg-white dark:bg-gray-800 rounded-lg p-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
                "border border-gray-200 dark:border-gray-700",
                "hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900",
                isDragging && "opacity-50 shadow-xl rotate-2 scale-105 ring-2 ring-blue-500 z-50",
                application.is_archived && "opacity-50 grayscale",
                menuOpen && "ring-2 ring-blue-400 border-blue-300 dark:border-blue-700 z-20"
            )}
        >
            <div className="flex gap-4">
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg border border-gray-100 dark:border-gray-700 p-1 bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                        <CompanyLogo
                            companyName={application.company_name}
                            jobUrl={application.job_url}
                            size="sm"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px] leading-tight truncate">
                        {application.role_title}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400">
                        <span className="text-xs truncate max-w-[120px]">{application.company_name}</span>
                        {application.location && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="flex items-center gap-0.5 text-[11px] truncate">
                                    <MapPin className="w-3 h-3" />
                                    {application.location}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div
                    ref={menuRef}
                    className={cn(
                        "absolute top-2 right-2 transition-opacity",
                        menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                    )}
                >
                    <button
                        type="button"
                        aria-label="Application actions"
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        onPointerDown={(event) => {
                            // Keep dnd-kit from treating this as a drag start.
                            event.stopPropagation();
                        }}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setMenuOpen((open) => !open);
                        }}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-1"
                        >
                            {onArchive && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setMenuOpen(false);
                                        onArchive(application.id);
                                    }}
                                >
                                    <Archive className="w-4 h-4" />
                                    Archive
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setMenuOpen(false);
                                        if (
                                            !confirm(
                                                `Are you sure you want to delete ${application.company_name} - ${application.role_title}? This action cannot be undone.`
                                            )
                                        ) {
                                            return;
                                        }
                                        void onDelete(application.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    Added {getRelativeDate(application.applied_at || application.created_at)}
                </span>

                {application.sponsor_h1b && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        H-1B
                    </span>
                )}
            </div>
        </div>
    );
}
