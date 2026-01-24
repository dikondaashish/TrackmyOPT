"use client";

import { useState, useMemo } from "react";
import { JobApplication } from "@/lib/career/job-tracker/types";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Bell, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "./CompanyLogo";

interface JobTrackerCalendarViewProps {
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
}

interface CalendarEvent {
    id: string;
    date: Date;
    type: "interview" | "followup";
    title: string;
    company: string;
    application: JobApplication;
}

export function JobTrackerCalendarView({ applications, onCardClick }: JobTrackerCalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Generate all events from applications
    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];

        applications.forEach(app => {
            // Add interview events
            const appInterviews = (app as any).job_interviews || (app as any).interviews || [];
            if (Array.isArray(appInterviews)) {
                appInterviews.forEach((interview: any) => {
                    if (interview.date) {
                        allEvents.push({
                            id: `interview-${app.id}-${interview.date}`,
                            date: parseISO(interview.date),
                            type: "interview",
                            title: interview.round_name || "Interview",
                            company: app.company_name,
                            application: app
                        });
                    }
                });
            }

            // Add follow-up events
            if (app.next_follow_up_at) {
                allEvents.push({
                    id: `followup-${app.id}`,
                    date: parseISO(app.next_follow_up_at),
                    type: "followup",
                    title: "Follow-up",
                    company: app.company_name,
                    application: app
                });
            }
        });

        return allEvents;
    }, [applications]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    // Get events for selected date
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(event => isSameDay(event.date, selectedDate));
    }, [events, selectedDate]);

    // Get events count for a day
    const getEventsForDay = (day: Date) => {
        return events.filter(event => isSameDay(event.date, day));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "relative h-20 p-1 rounded-lg transition-all text-left",
                                    isCurrentMonth
                                        ? "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                        : "opacity-40",
                                    isSelected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
                                    isTodayDate && !isSelected && "ring-1 ring-emerald-400"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-medium",
                                    isTodayDate
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {format(day, "d")}
                                </span>

                                {/* Event Dots */}
                                {dayEvents.length > 0 && (
                                    <div className="absolute bottom-1.5 left-1 right-1 flex flex-wrap gap-1">
                                        {dayEvents.slice(0, 3).map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full",
                                                    event.type === "interview"
                                                        ? "bg-blue-500"
                                                        : "bg-amber-500"
                                                )}
                                            />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[9px] text-gray-500">+{dayEvents.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Interview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Follow-up</span>
                    </div>
                </div>
            </div>

            {/* Event Detail Panel */}
            <div className="lg:w-80 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
                    </h3>
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onCardClick(event.application)}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        event.type === "interview"
                                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                                    )}>
                                        {event.type === "interview" ? (
                                            <Video className="w-4 h-4" />
                                        ) : (
                                            <Bell className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {event.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {event.company}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No events on this day
                            </p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Click on a date to see events
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
