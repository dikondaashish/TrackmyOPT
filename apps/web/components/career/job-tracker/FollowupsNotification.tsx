"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { JobApplication } from "@/lib/career/job-tracker/types";
import { Bell, Check, Video, Clock } from "lucide-react";
import { isToday, parseISO, isBefore, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";

interface FollowupsNotificationProps {
    applications: JobApplication[];
    onMarkDone: (id: string) => void;
    onClearAll: () => void;
}

export function FollowupsNotification({ applications, onMarkDone, onClearAll }: FollowupsNotificationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const notifications = useMemo(() => {
        const list: {
            id: string;
            type: 'followup' | 'interview';
            app: JobApplication;
            title: string;
            date?: string;
            isOverdue?: boolean;
        }[] = [];

        applications.forEach(app => {
            // 1. Follow-ups
            if (app.next_follow_up_at && !app.is_archived) {
                const date = parseISO(app.next_follow_up_at);
                if (isToday(date) || isBefore(date, new Date())) {
                    list.push({
                        id: `followup-${app.id}`,
                        type: 'followup',
                        app,
                        title: "Follow-up Due",
                        date: app.next_follow_up_at,
                        isOverdue: isBefore(date, new Date()) && !isToday(date)
                    });
                }
            }

            // 2. Interviews (Next 48h)
            const interviews = (app as any).job_interviews || (app as any).interviews || [];
            interviews.forEach((interview: any) => {
                if (interview.date) {
                    const interviewDate = parseISO(interview.date);
                    const hours = differenceInHours(interviewDate, new Date());
                    if (hours >= 0 && hours <= 48) {
                        list.push({
                            id: `interview-${interview.id}`,
                            type: 'interview',
                            app,
                            title: `Interview: ${interview.round_name || 'Scheduled'}`,
                            date: interview.date
                        });
                    }
                }
            });
        });

        return list.sort((a, b) => {
            // Interviews first, then overdue followups, then today followups
            if (a.type === 'interview' && b.type !== 'interview') return -1;
            if (a.type !== 'interview' && b.type === 'interview') return 1;
            return 0;
        });
    }, [applications]);

    const count = notifications.length;

    // Click Outside Handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-200 relative",
                    isOpen
                        ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                )}
            >
                <Bell className="w-5 h-5" />
                {count > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900 animate-in zoom-in duration-300">
                        {count}
                    </span>
                )}
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                        {count > 0 && (
                            <button
                                onClick={onClearAll}
                                className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
                        {count === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">All caught up!</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No pending notifications.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {notifications.map(item => (
                                    <div key={item.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                        <div className="flex items-start gap-3">
                                            {item.type === 'interview' ? (
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                    item.isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                                )}>
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {item.app.company_name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] mt-0.5 text-gray-400">
                                                    {item.app.role_title}
                                                </p>
                                            </div>

                                            {item.type === 'followup' && (
                                                <button
                                                    onClick={() => onMarkDone(item.app.id)}
                                                    className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Mark as done"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
