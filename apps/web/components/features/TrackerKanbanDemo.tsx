"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MoreHorizontal, GripVertical, Building2, Calendar, DollarSign } from "lucide-react";
import confetti from "canvas-confetti";

export function TrackerKanbanDemo() {
    const [columns, setColumns] = useState([
        {
            id: "applied",
            title: "Applied",
            color: "bg-blue-500",
            cards: [
                { id: 1, company: "Netflix", role: "Senior Engineer", date: "2d ago" },
                { id: 2, company: "Uber", role: "Product Manager", date: "5d ago" }
            ]
        },
        {
            id: "interview",
            title: "Interview",
            color: "bg-purple-500",
            cards: [
                { id: 3, company: "Stripe", role: "Frontend Dev", date: "Tomorrow" }
            ]
        },
        {
            id: "offer",
            title: "Offer",
            color: "bg-green-500",
            cards: [
                { id: 4, company: "Spotify", role: "UX Designer", date: "Accepted!" }
            ]
        }
    ]);

    // Simulate a card moving to "Offer" to trigger confetti
    useEffect(() => {
        const timer = setTimeout(() => {
            triggerConfetti();
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6', '#F59E0B']
        });
    };

    return (
        <div className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-gray-400 font-medium">Pipeline View</div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-3 gap-4">
                {columns.map((col) => (
                    <div key={col.id} className="bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-2 min-h-[300px]">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{col.title}</span>
                                <span className="bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 text-[10px] px-1.5 py-0.5 rounded-full">{col.cards.length}</span>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="space-y-2">
                            {col.cards.map((card, i) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 group hover:border-blue-500/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{card.role}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{card.company}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-zinc-800">
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {card.date}
                                        </div>
                                        {col.id === 'offer' && (
                                            <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                                <DollarSign className="w-2.5 h-2.5" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Celebration Particles for Offer Card */}
                                    {col.id === 'offer' && (
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" style={{ left: '20%', top: '10%' }} />
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-400 rounded-full" style={{ left: '80%', top: '30%' }} />
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full" style={{ left: '50%', top: '60%' }} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Drag Overlay (Simulated) */}
            <motion.div
                className="absolute top-[40%] left-[40%] w-48 bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-xl border-2 border-blue-500 rotate-6 z-20 cursor-grabbing pointer-events-none"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.8 }}
                animate={{
                    x: [0, 150],
                    y: [0, -50],
                    opacity: [0, 1, 1, 0],
                    scale: [0.8, 1.05, 1.05, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <Building2 className="w-4 h-4" />
                    </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Software Engineer</h4>
                <p className="text-xs text-gray-500">Google</p>
            </motion.div>
        </div>
    );
}
