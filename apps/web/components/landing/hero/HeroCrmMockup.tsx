"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Search,
    Filter,
    GripVertical,
    CheckCircle,
} from "lucide-react";

interface JobCard {
    id: string;
    company: string;
    role: string;
    tag?: string;
    tagColor?: string;
    time?: string;
}

interface Column {
    id: string;
    name: string;
    color: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    countBgClass: string;
    countTextClass: string;
}

function CrmMockup() {
    const [columns, setColumns] = useState<{ [key: string]: JobCard[] }>({
        wishlist: [
            { id: "1", company: "Google", role: "Software Engineer, L3", tag: "H-1B Sponsor", tagColor: "green" },
            { id: "2", company: "Netflix", role: "Frontend Developer" },
        ],
        applied: [
            { id: "3", company: "Microsoft", role: "Product Manager", tag: "Referral", tagColor: "purple", time: "2d ago" },
        ],
        interview: [
            { id: "4", company: "Airbnb", role: "Full Stack Eng" },
        ],
    });

    const [draggingCard, setDraggingCard] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const columnConfig: Column[] = [
        {
            id: "wishlist",
            name: "Wishlist",
            color: "gray",
            bgClass: "bg-gray-50/50 dark:bg-zinc-900/30",
            borderClass: "",
            textClass: "text-muted-foreground",
            countBgClass: "bg-gray-200 dark:bg-zinc-700",
            countTextClass: "text-foreground"
        },
        {
            id: "applied",
            name: "Applied",
            color: "blue",
            bgClass: "bg-blue-50/30 dark:bg-blue-900/10",
            borderClass: "border border-blue-100/50 dark:border-blue-900/20",
            textClass: "text-blue-600 dark:text-blue-400",
            countBgClass: "bg-blue-100 dark:bg-blue-900/40",
            countTextClass: "text-blue-700 dark:text-blue-300"
        },
        {
            id: "interview",
            name: "Interview",
            color: "gray",
            bgClass: "bg-gray-50/50 dark:bg-zinc-900/30",
            borderClass: "",
            textClass: "text-muted-foreground",
            countBgClass: "bg-gray-200 dark:bg-zinc-700",
            countTextClass: "text-foreground"
        },
    ];

    const handleDragEnd = (cardId: string, sourceColumn: string) => {
        if (dragOverColumn && dragOverColumn !== sourceColumn) {
            setColumns(prev => {
                const sourceCards = [...prev[sourceColumn]];
                const targetCards = [...prev[dragOverColumn]];
                const cardIndex = sourceCards.findIndex(c => c.id === cardId);

                if (cardIndex !== -1) {
                    const [card] = sourceCards.splice(cardIndex, 1);
                    targetCards.push(card);
                    return {
                        ...prev,
                        [sourceColumn]: sourceCards,
                        [dragOverColumn]: targetCards,
                    };
                }
                return prev;
            });
        }
        setDraggingCard(null);
        setDragOverColumn(null);
    };

    return (
        <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
            {/* Transparency Label - positioned below window controls area */}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-[10px] text-purple-600 dark:text-purple-300 z-20 font-medium">
                Try Drag & Drop!
            </div>
            {/* Window Controls - Left aligned */}
            <div className="flex gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            {/* Header */}
            <motion.div
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <Briefcase className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">Job Tracker</h3>
                        <p className="text-xs text-muted-foreground">Application Pipeline</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.div
                        className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-muted-foreground cursor-pointer"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Search className="w-4 h-4" />
                    </motion.div>
                    <motion.div
                        className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-muted-foreground cursor-pointer"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Filter className="w-4 h-4" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Kanban Columns with real drag & drop */}
            <div ref={constraintsRef} className="flex gap-3 h-full overflow-hidden">
                {columnConfig.map((column, colIndex) => (
                    <motion.div
                        key={column.id}
                        className={`flex-1 rounded-xl p-2 flex flex-col gap-2 transition-all duration-200 ${column.bgClass} ${column.borderClass} ${dragOverColumn === column.id ? "ring-2 ring-purple-500 ring-opacity-50 scale-[1.02]" : ""
                            }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: column.id === "interview" ? 0.8 : 1, y: 0 }}
                        transition={{ delay: 0.2 + colIndex * 0.1 }}
                        onMouseEnter={() => draggingCard && setDragOverColumn(column.id)}
                        onMouseLeave={() => setDragOverColumn(null)}
                    >
                        <div className="flex items-center justify-between px-2 mb-1">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${column.textClass}`}>
                                {column.name}
                            </span>
                            <motion.span
                                className={`text-[10px] px-1.5 rounded-full ${column.countBgClass} ${column.countTextClass}`}
                                key={columns[column.id].length}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                            >
                                {columns[column.id].length}
                            </motion.span>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {columns[column.id].map((card, _cardIndex) => (
                                <motion.div
                                    key={card.id}
                                    className={`bg-white dark:bg-zinc-800 p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing select-none ${draggingCard === card.id
                                        ? "border-purple-400 shadow-lg shadow-purple-500/20 z-50"
                                        : "border-border/50"
                                        } ${column.id === "applied" ? "ring-1 ring-blue-500/20" : ""}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: draggingCard === card.id ? 1.05 : 1,
                                        rotate: draggingCard === card.id ? 3 : 0,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                                    drag
                                    dragConstraints={constraintsRef}
                                    dragElastic={0.1}
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

                        {/* Empty state indicator */}
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

// Wrapper for CrmMockup that triggers confetti on successful drag
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
