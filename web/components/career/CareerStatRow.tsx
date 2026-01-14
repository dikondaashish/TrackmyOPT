"use client";

import { Briefcase, Users, Clock } from "lucide-react";

interface CareerStats {
    applications: number;
    interviews: number;
    followUps: number;
}

interface CareerStatRowProps {
    stats: CareerStats;
}

export function CareerStatRow({ stats }: CareerStatRowProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="text-2xl font-bold">{stats.applications}</p>
                </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                    <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Follow-ups Due</p>
                    <p className="text-2xl font-bold">{stats.followUps}</p>
                </div>
            </div>
        </div>
    );
}
