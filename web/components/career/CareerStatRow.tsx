"use client";

import { FileText, Calendar, AlertCircle, TrendingUp } from "lucide-react";

interface CareerStatRowProps {
    applicationsCount: number;
    interviewsCount: number;
    followUpsDueCount: number;
}

export function CareerStatRow({
    applicationsCount,
    interviewsCount,
    followUpsDueCount
}: CareerStatRowProps) {
    const stats = [
        {
            label: "Applications",
            count: applicationsCount,
            icon: FileText,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/10 to-cyan-500/10",
            iconBg: "bg-blue-500"
        },
        {
            label: "Interviews",
            count: interviewsCount,
            icon: Calendar,
            gradient: "from-green-500 to-emerald-500",
            bgGradient: "from-green-500/10 to-emerald-500/10",
            iconBg: "bg-green-500"
        },
        {
            label: "Follow-ups Due",
            count: followUpsDueCount,
            icon: AlertCircle,
            gradient: "from-amber-500 to-orange-500",
            bgGradient: "from-amber-500/10 to-orange-500/10",
            iconBg: "bg-amber-500"
        },
    ];

    const totalProgress = applicationsCount + interviewsCount;

    return (
        <div className="w-full max-w-2xl">
            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl 
                                   bg-gradient-to-r ${stat.bgGradient} 
                                   border border-white/10 backdrop-blur-sm
                                   hover:scale-105 hover:shadow-lg transition-all duration-300`}
                    >
                        {/* Icon with gradient background */}
                        <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-lg`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {stat.label}
                            </p>
                            <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                                {stat.count}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress indicator - shows only when there's activity */}
            {totalProgress > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>You're making progress! Keep going.</span>
                </div>
            )}

            {/* Empty state message */}
            {totalProgress === 0 && (
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Start tracking your job applications to see your progress here ✨
                    </p>
                </div>
            )}
        </div>
    );
}
