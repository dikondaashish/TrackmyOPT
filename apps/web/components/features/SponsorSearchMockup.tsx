"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Building2, ChevronDown, SlidersHorizontal, DollarSign } from "lucide-react";

export function SponsorSearchMockup() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xl w-full max-w-lg mx-auto">
            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search sponsors..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        readOnly
                    />
                </div>
                <button className="p-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-600 dark:text-gray-400">
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                <FilterChip label="Technology" active />
                <FilterChip label="> $100k Salary" icon={DollarSign} />
                <FilterChip label="Grade A" />
                <FilterChip label="California" icon={MapPin} />
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Matches</span>
                <span className="text-xs text-emerald-600 cursor-pointer hover:underline">View all 24</span>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                <ResultItem
                    name="NVIDIA Corporation"
                    location="Santa Clara, CA"
                    count="1,240"
                    salary="$185k"
                    trend="+15%"
                    category="A+"
                    delay={0}
                />
                <ResultItem
                    name="Adobe Inc."
                    location="San Jose, CA"
                    count="450"
                    salary="$162k"
                    trend="+8%"
                    category="A"
                    delay={0.1}
                />
                <ResultItem
                    name="Salesforce"
                    location="San Francisco, CA"
                    count="892"
                    salary="$170k"
                    trend="+5%"
                    category="A"
                    delay={0.2}
                />
            </div>
        </div>
    );
}

function FilterChip({ label, icon: Icon, active }: any) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${active
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}>
            {Icon && <Icon className="w-3 h-3" />}
            {label}
        </div>
    );
}

function ResultItem({ name, location, count, salary, trend, category, delay }: any) {
    return (
        <motion.div
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer group bg-white dark:bg-zinc-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <Building2 className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {location}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{salary}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">{category}</span>
                </div>
                <p className="text-[10px] text-gray-400">{count} filings <span className="text-emerald-500 ml-1">{trend}</span></p>
            </div>
        </motion.div>
    );
}
