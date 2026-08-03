"use client";

import { motion } from "framer-motion";
import { Search, MapPin, TrendingUp, Filter, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

const mockResults = [
    {
        name: "Google LLC",
        location: "Mountain View, CA",
        role: "Software Engineer",
        salary: "$165,000",
        approvals: "928",
        grade: "A+",
        trend: "up"
    },
    {
        name: "Microsoft Corp",
        location: "Redmond, WA",
        role: "Data Scientist",
        salary: "$152,000",
        approvals: "845",
        grade: "A",
        trend: "up"
    },
    {
        name: "Amazon.com Services",
        location: "Seattle, WA",
        role: "SDE II",
        salary: "$158,000",
        approvals: "1,204",
        grade: "A-",
        trend: "down"
    },
    {
        name: "Tesla, Inc.",
        location: "Austin, TX",
        role: "Mechanical Engineer",
        salary: "$115,000",
        approvals: "142",
        grade: "B+",
        trend: "up"
    }
];

export function SponsorSearchPreview() {
    const [searchText, setSearchText] = useState("");
    const targetText = "Software Engineer";
    const [showResults, setShowResults] = useState(false);

    // Simulate typing effect
    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= targetText.length) {
                setSearchText(targetText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => setShowResults(true), 500);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Browser/Dashboard Window Frame */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
                {/* Window Header */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 p-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                </div>

                {/* Dashboard Header & Search */}
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg dark:text-white">Sponsor Database</h3>
                        <div className="flex gap-2">
                            <div className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Q4 Data
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchText}
                                readOnly
                                placeholder="Search by company or job title..."
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    {/* Filter Tags (Appearing) */}
                    <div className="flex gap-2 mt-3 overflow-hidden">
                        <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded border border-blue-100 dark:border-blue-800">Software Engineer</div>
                        <div className="px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded border border-gray-200 dark:border-zinc-700">Full-time</div>
                        <div className="px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded border border-gray-200 dark:border-zinc-700">Past 12 Months</div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="bg-gray-50 dark:bg-zinc-950/50 p-2 min-h-[300px]">
                    <div className="mb-2 px-4 py-2 grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-4">Company</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-2 text-right">Approvals</div>
                        <div className="col-span-2 text-center">Grade</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-2">
                        {showResults ? (
                            mockResults.map((result, i) => (
                                <motion.div
                                    key={result.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm grid grid-cols-12 items-center gap-2 hover:border-emerald-500/30 transition-colors cursor-pointer group"
                                >
                                    {/* Company */}
                                    <div className="col-span-4">
                                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            {result.name}
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3" />
                                            {result.location}
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="col-span-3">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">{result.role}</div>
                                        <div className="text-xs text-gray-500">{result.salary}</div>
                                    </div>

                                    {/* Approvals */}
                                    <div className="col-span-2 text-right">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{result.approvals}</div>
                                        {result.trend === 'up' && (
                                            <div className="text-[10px] text-green-600 flex items-center justify-end gap-0.5">
                                                <TrendingUp className="w-3 h-3" /> 12%
                                            </div>
                                        )}
                                    </div>

                                    {/* Grade */}
                                    <div className="col-span-2 flex justify-center">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                                            ${result.grade.startsWith('A') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                                            ${result.grade.startsWith('B') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                        `}>
                                            {result.grade}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-1 flex justify-end">
                                        <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Loading Skeleton
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800/50 shadow-sm h-16 animate-pulse" />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
