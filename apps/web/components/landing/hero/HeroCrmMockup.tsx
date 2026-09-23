"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, GripVertical } from "lucide-react";

interface JobCard {
    id: string;
    company: string;
    role: string;
    tag?: string;
    tagColor?: string;
    time?: string;
}

// Trigger confetti when a card moves to another column.
export function HeroCrmMockup({ onDragSuccess }: { onDragSuccess: () => void }) {
    const [columns, setColumns] = useState<Record<string, JobCard[]>>({
        wishlist: [
            { id: "1", company: "Google", role: "Software Engineer", tag: "H-1B Sponsor", tagColor: "green" },
        ],
        applied: [
            { id: "2", company: "Microsoft", role: "Product Manager", time: "2d ago" },
            { id: "3", company: "Meta", role: "Data Scientist", tag: "H-1B Sponsor", tagColor: "green" },
        ],
        interview: [
            { id: "4", company: "Amazon", role: "SDE II", tag: "Final Round", tagColor: "purple" },
        ],
    });

    const constraintsRef = useRef(null);
    const [draggingCard, setDraggingCard] = useState<string | null>(null);
    const [hoverColumn, setHoverColumn] = useState<string | null>(null);

    const columnConfigs = [
        { id: "wishlist", title: "Wishlist", color: "from-blue-500/20 to-blue-600/20" },
        { id: "applied", title: "Applied", color: "from-purple-500/20 to-purple-600/20" },
        { id: "interview", title: "Interview", color: "from-green-500/20 to-green-600/20" },
    ];

    const handleDragEnd = (cardId: string, fromColumn: string) => {
        if (hoverColumn && hoverColumn !== fromColumn) {
            const card = columns[fromColumn].find(c => c.id === cardId);
            if (card) {
                setColumns(prev => ({
                    ...prev,
                    [fromColumn]: prev[fromColumn].filter(c => c.id !== cardId),
                    [hoverColumn]: [...prev[hoverColumn], card],
                }));
                onDragSuccess(); // Trigger confetti!
            }
        }
        setDraggingCard(null);
        setHoverColumn(null);
    };

    return (
        <div ref={constraintsRef} className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-4 overflow-hidden h-full flex flex-col">
            {/* Window Controls - Left aligned */}
            <div className="flex gap-1.5 mb-3">
                <motion.div className="w-3 h-3 rounded-full bg-red-400/80" whileHover={{ scale: 1.3 }} />
                <motion.div className="w-3 h-3 rounded-full bg-yellow-400/80" whileHover={{ scale: 1.3 }} />
                <motion.div className="w-3 h-3 rounded-full bg-green-400/80" whileHover={{ scale: 1.3 }} />
            </div>

            {/* Header with Try Drag & Drop hint */}
            <motion.div
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-2">
                    <motion.div
                        className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <Briefcase className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Job Tracker</p>
                        <p className="text-[10px] text-muted-foreground">12 Applications</p>
                    </div>
                </div>
                <motion.div
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        Try Drag & Drop!
                    </span>
                </motion.div>
            </motion.div>

            {/* Kanban Board */}
            <div
                className="grid grid-cols-3 gap-3 flex-1"
                onMouseLeave={() => setHoverColumn(null)}
            >
                {columnConfigs.map((column) => (
                    <motion.div
                        key={column.id}
                        className={`bg-gradient-to-b ${column.color} rounded-xl p-2 flex flex-col min-h-[140px] transition-all duration-200 ${hoverColumn === column.id && draggingCard ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-800" : ""
                            }`}
                        onMouseEnter={() => draggingCard && setHoverColumn(column.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * columnConfigs.indexOf(column) }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold text-foreground">{column.title}</span>
                            <motion.span
                                className="text-[10px] bg-white/50 dark:bg-zinc-700/50 px-1.5 rounded"
                                key={columns[column.id].length}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {columns[column.id].length}
                            </motion.span>
                        </div>
                        <AnimatePresence>
                            {columns[column.id].map((card) => (
                                <motion.div
                                    key={card.id}
                                    className={`bg-white dark:bg-zinc-700 p-2 rounded-lg mb-2 cursor-grab active:cursor-grabbing shadow-sm ${draggingCard === card.id ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20" : ""
                                        }`}
                                    layout
                                    drag
                                    dragConstraints={constraintsRef}
                                    dragElastic={0.1}
                                    whileDrag={{ scale: 1.05, zIndex: 50 }}
                                    onDragStart={() => setDraggingCard(card.id)}
                                    onDragEnd={() => handleDragEnd(card.id, column.id)}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-semibold text-foreground">{card.company}</p>
                                        {card.time && (
                                            <span className="text-[10px] text-muted-foreground">{card.time}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{card.role}</p>
                                    {card.tag && (
                                        <div className="mt-2 flex gap-1">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded ${card.tagColor === "green"
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                                }`}>
                                                {card.tag}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {columns[column.id].length === 0 && (
                            <motion.div
                                className="flex-1 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                            >
                                <p className="text-[10px] text-muted-foreground">Drop here</p>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
