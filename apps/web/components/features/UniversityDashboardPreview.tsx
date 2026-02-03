"use client";

import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle, BarChart3, Search, Bell, Settings, PieChart, Download } from "lucide-react";
import { useState } from "react";

export function UniversityDashboardPreview() {
    return (
        <motion.div
            className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px] md:h-[600px] text-left"
            initial={{ rotateX: 5, y: 20 }}
            whileInView={{ rotateX: 0, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ perspective: "1000px" }}
        >
            {/* Sidebar Mockup */}
            <div className="w-64 bg-gray-50 dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 hidden md:flex flex-col p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                    <span className="font-bold text-gray-900 dark:text-white">TrackMyOPT Edu</span>
                </div>

                <div className="space-y-1">
                    <SidebarItem icon={PieChart} label="Overview" active />
                    <SidebarItem icon={Users} label="Student Roster" />
                    <SidebarItem icon={BarChart3} label="Placement Data" />
                    <SidebarItem icon={AlertTriangle} label="Compliance Alerts" badge="3" />
                    <SidebarItem icon={Settings} label="Settings" />
                </div>

                <div className="mt-auto bg-blue-100 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Upcoming Webinar</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">"H-1B Trends 2025" for DSOs</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-zinc-900/50">
                {/* Header */}
                <div className="h-16 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-900">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dashboard Overview</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <div className="w-64 h-9 bg-gray-100 dark:bg-zinc-800 rounded-lg pl-9 pr-3 text-sm flex items-center text-gray-500">Search students...</div>
                        </div>
                        <div className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            US
                        </div>
                    </div>
                </div>

                {/* Dashboard Body */}
                <div className="p-6 overflow-hidden flex-1 relative">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatCard
                            title="Total Students"
                            value="2,450"
                            change="+12%"
                            trend="up"
                        />
                        <StatCard
                            title="At Risk (Compliance)"
                            value="14"
                            change="-5"
                            trend="down"
                            isBad={false} /* Lower is better for risk */
                            color="red"
                        />
                        <StatCard
                            title="Placement Rate"
                            value="92%"
                            change="+4.5%"
                            trend="up"
                            color="green"
                        />
                    </div>

                    {/* Action Items / Table Mockup */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Urgent Compliance Alerts</h4>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Download className="w-3 h-3" /> Export
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                            <AlertRow name="Alex Chen" id="902103" issue="Pending STEM Extension" daysLeft="5 days" status="Critical" />
                            <AlertRow name="Maria Gonzalez" id="882101" issue="Unemployment Limit Near" daysLeft="10 days" status="Warning" />
                            <AlertRow name="Priya Patel" id="772391" issue="Employer EIN Mismatch" daysLeft="14 days" status="Warning" />
                            <AlertRow name="James Smith" id="992011" issue="Address Update Required" daysLeft="15 days" status="Info" />
                        </div>
                    </div>

                    {/* Animated Cursor Overlay Mockup (Optional) */}
                    <motion.div
                        initial={{ x: 300, y: 300, opacity: 0 }}
                        animate={{ x: 100, y: 150, opacity: 1 }}
                        transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
                        className="absolute z-20 pointer-events-none"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-xl">
                            <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#2563EB" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}

function SidebarItem({ icon: Icon, label, active = false, badge }: { icon: any, label: string, active?: boolean, badge?: string }) {
    return (
        <div className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${active ? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"}`}>
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">{badge}</span>
            )}
        </div>
    );
}

function StatCard({ title, value, change, trend, isBad, color = "blue" }: { title: string, value: string, change: string, trend: "up" | "down", isBad?: boolean, color?: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <div className={`flex items-center text-xs font-bold ${color === 'red' ? 'text-red-500' :
                        color === 'green' ? 'text-green-500' :
                            'text-blue-500'
                    }`}>
                    {change}
                </div>
            </div>
        </div>
    );
}

function AlertRow({ name, id, issue, daysLeft, status }: { name: string, id: string, issue: string, daysLeft: string, status: "Critical" | "Warning" | "Info" }) {
    return (
        <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-[10px] text-gray-500">ID: {id}</p>
                </div>
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {issue}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{daysLeft}</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${status === 'Critical' ? 'bg-red-100 text-red-600' :
                        status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                    }`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
