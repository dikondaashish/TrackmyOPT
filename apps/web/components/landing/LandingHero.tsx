"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants, useReducedMotion } from "framer-motion";
import { LandingTrustedUniversities } from "./LandingTrustedUniversities";
import { ResumeEditorMockup } from "./ResumeEditorMockup";
import { GuestPreviewModal } from "./GuestPreviewModal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParallaxImage } from "@/components/animations/parallax-image";
import {
    Clock,
    Calendar,
    Bell,
    CheckCircle,
    ArrowRight,
    ChevronDown,
    Shield,
    Sparkles,
    Building2,
    FileText,
    LayoutDashboard,
    Briefcase,
    FileCheck,
    Search,
    Filter,
    ChevronLeft,
    Download,
    Eye,
    Lock,
    Loader2,
    Code,
    Check,
    Send,
    GripVertical,
    type LucideIcon,
} from "lucide-react";

// Animation variants
const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const tabContentVariants: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

// Mockup Components
const TimelineMockup = () => (
    <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
        {/* Transparency Label */}
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded text-[10px] text-muted-foreground z-20 opacity-70">
            Sample Data
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
                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Calendar className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                    <h3 className="font-semibold text-foreground text-sm">OPT Timeline</h3>
                    <p className="text-xs text-muted-foreground">Graduation to STEM Extension</p>
                </div>
            </div>
        </motion.div>

        {/* USCIS Case Tracker Badge */}
        <motion.div
            className="mb-4 bg-white dark:bg-zinc-800 rounded-xl p-3 border border-border/50 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">USCIS Case Status</span>
                <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    Active
                </span>
            </div>
            <div className="relative px-2">
                {/* Connecting Line */}
                <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-gray-100 dark:bg-zinc-700 -z-10" />

                {/* Steps */}
                <div className="flex justify-between items-start">
                    {[
                        { label: "Received", status: "completed" },
                        { label: "Biometric", status: "completed" },
                        { label: "Approved", status: "active" },
                        { label: "Card", status: "pending" }
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <motion.div
                                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 z-10
                                    ${step.status === 'completed' || step.status === 'active'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-300'}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                            >
                                {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                {step.status === 'active' && (
                                    <motion.div
                                        className="w-2 h-2 bg-white rounded-full"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[9px] font-medium ${step.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>

        {/* Stats with animated counters */}
        <div className="grid grid-cols-2 gap-4 mb-4">
            <motion.div
                className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100/50 dark:border-blue-800/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)" }}
            >
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mb-0.5">Days Remaining</p>
                <motion.p
                    className="text-xl font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    247
                </motion.p>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-1 mt-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
            <motion.div
                className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100/50 dark:border-green-800/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(34, 197, 94, 0.15)" }}
            >
                <p className="text-[10px] font-medium text-green-600 dark:text-green-400 mb-0.5">Unemployment</p>
                <div className="flex items-end gap-1">
                    <motion.p
                        className="text-xl font-bold text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        12
                    </motion.p>
                    <p className="text-[10px] text-muted-foreground mb-0.5">/ 90 days</p>
                </div>
                <div className="w-full bg-green-100 dark:bg-green-900/30 h-1 mt-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-green-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "15%" }}
                        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
        </div>

        {/* Vertical Timeline with staggered animations */}
        <div className="space-y-4 relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-700 flex-1 overflow-visible">
            <motion.div
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
            >
                <motion.div
                    className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                />
                <p className="text-[10px] text-muted-foreground mb-0.5">May 15, 2025</p>
                <p className="text-xs font-medium text-foreground">Program End Date</p>
            </motion.div>
            <motion.div
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <motion.div
                    className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-800 ring-4 ring-blue-500/20"
                    animate={{
                        boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 8px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-0.5">Aug 12, 2025</p>
                <p className="text-xs font-medium text-foreground">OPT Start Date</p>
                <motion.div
                    className="mt-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 1.3 }}
                >
                    Target start date for max unemployment buffer
                </motion.div>
            </motion.div>
            <motion.div
                className="relative opacity-50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.5, x: 0 }}
                transition={{ delay: 1.2 }}
            >
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full border-2 border-white dark:border-zinc-800" />
                <p className="text-[10px] text-muted-foreground mb-0.5">Nov 10, 2025</p>
                <p className="text-xs font-medium text-foreground">Next Reporting Deadline</p>
            </motion.div>
        </div>
    </div>
);

// Draggable CRM Card component
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

const CrmMockup = () => {
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
                            {columns[column.id].map((card, cardIndex) => (
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
const CrmMockupWithConfetti = ({ onDragSuccess }: { onDragSuccess: () => void }) => {
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




const DocumentsMockup = () => {
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const documents = [
        { name: "OPT I-20", type: "PDF", size: "2.4 MB", date: "Expires in 8mo", color: "blue", status: "Verified" },
        { name: "EAD Card", type: "IMG", size: "1.1 MB", date: "Expires in 8mo", color: "purple", status: "Verified" },
        { name: "Passport", type: "PDF", size: "4.2 MB", date: "Expires in 6mo", color: "orange", status: "Expires Soon" },
        { name: "Offer Letter", type: "PDF", size: "1.8 MB", date: "Uploaded 2d ago", color: "gray", status: "Encrypted" },
    ];

    return (
        <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
            {/* Window Controls - Left aligned */}
            <div className="flex gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>

            <AnimatePresence mode="wait">
                {!selectedDoc ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col"
                    >
                        {/* Header */}
                        <motion.div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <Shield className="w-5 h-5 text-white" />
                                </motion.div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm">Document Vault</h3>
                                    <p className="text-xs text-muted-foreground">Encrypted Storage</p>
                                </div>
                            </div>
                            <div className="relative flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-[10px] text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-900/50 overflow-hidden">
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                                />
                                <Shield className="w-3 h-3 relative z-10" />
                                <span className="relative z-10">AES-256</span>
                            </div>
                        </motion.div>

                        {/* Grid with interactive cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {documents.map((doc, i) => (
                                <motion.div
                                    key={i}
                                    className="group p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/40 border border-border/50 hover:border-primary/30 cursor-pointer relative overflow-hidden"
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.1 + (i * 0.05), type: "spring", stiffness: 200 }}
                                    whileHover={{
                                        y: -4,
                                        scale: 1.02,
                                        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedDoc(doc)}
                                >
                                    {/* Hover selection effect */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="flex items-start justify-between mb-3 relative z-10">
                                        <motion.div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                                                ${doc.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                ${doc.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                                                ${doc.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                                ${doc.color === 'gray' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                                            `}
                                        >
                                            {doc.type}
                                        </motion.div>
                                        <motion.div
                                            className="opacity-0 group-hover:opacity-100"
                                            initial={{ x: -10 }}
                                            whileHover={{ x: 0 }}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                                                <Eye className="w-3 h-3 text-primary" />
                                            </div>
                                        </motion.div>
                                    </div>
                                    <p className="text-xs font-semibold text-foreground mb-0.5 relative z-10">{doc.name}</p>
                                    <p className="text-[10px] text-muted-foreground relative z-10">{doc.date}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col"
                    >
                        {/* Preview Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">{selectedDoc.name}</h3>
                                <p className="text-[10px] text-muted-foreground">Secure Viewer</p>
                            </div>
                            <div className="ml-auto flex gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${selectedDoc.status === "Expires Soon"
                                    ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30"
                                    : "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-900/30"
                                    }`}>
                                    {selectedDoc.status}
                                </span>
                            </div>
                        </div>

                        {/* Document Preview Area */}
                        <div className="flex-1 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-border/50 p-4 relative overflow-hidden group">
                            {/* Vault Locking Animation Overlay */}
                            <motion.div
                                className="absolute inset-0 bg-green-500/5 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                            >
                                <motion.div
                                    initial={{ scale: 1.5, opacity: 1 }}
                                    animate={{ scale: 1, opacity: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    <Lock className="w-8 h-8 text-green-600" />
                                </motion.div>
                            </motion.div>

                            {/* Dummy Document Content */}
                            <div className="bg-white dark:bg-zinc-800 w-full h-full rounded shadow-sm p-4 space-y-3 opacity-80">
                                <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded" />
                                <div className="space-y-2 pt-2">
                                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-700/50 rounded" />
                                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-700/50 rounded" />
                                    <div className="h-2 w-3/4 bg-gray-100 dark:bg-zinc-700/50 rounded" />
                                </div>
                                <div className="flex justify-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-700/50" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-700/50 rounded" />
                                    <div className="h-2 w-5/6 bg-gray-100 dark:bg-zinc-700/50 rounded" />
                                </div>
                            </div>

                            {/* Encryption Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                <Shield className="w-32 h-32" />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
                                <Download className="w-3 h-3" />
                                Download
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-foreground text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                                <Eye className="w-3 h-3" />
                                View Full
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};






type TabType = "timeline" | "crm" | "docs" | "resume";

// Tab configuration with badges
const tabsConfig = [
    { id: "timeline" as TabType, label: "Timeline", icon: LayoutDashboard, badge: "Live", badgeColor: "green" },
    { id: "crm" as TabType, label: "Job CRM", icon: Briefcase, badge: "4", badgeColor: "purple" },
    { id: "docs" as TabType, label: "Documents", icon: FileCheck, badge: "New", badgeColor: "blue" },
    { id: "resume" as TabType, label: "AI Resume", icon: Sparkles, badge: "Beta", badgeColor: "orange" },
];

// Toast messages per tab
const toastMessages: Record<TabType, { icon: LucideIcon; message: string }> = {
    timeline: { icon: CheckCircle, message: "OPT start date optimized!" },
    crm: { icon: Send, message: "Application saved to tracker" },
    docs: { icon: Bell, message: "Passport expires in 6 months" },
    resume: { icon: Sparkles, message: "AI suggestions ready!" },
};

// Tooltip content
const tooltipContent: Record<string, string> = {
    "days-remaining": "Days remaining until your OPT expires",
    "unemployment": "Days of unemployment used out of 90 allowed",
    "program-end": "Your graduation date from the university",
    "opt-start": "When your OPT authorization begins",
};

export function LandingHero() {
    const prefersReducedMotion = useReducedMotion();
    const [activeTab, setActiveTab] = useState<TabType>("timeline");
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState(toastMessages.timeline);
    const [showConfetti, setShowConfetti] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const mockupRef = useRef<HTMLDivElement>(null);

    const AUTO_ROTATE_INTERVAL = 6000; // 6 seconds

    // Auto-rotate tabs (disabled when user prefers reduced motion)
    useEffect(() => {
        if (prefersReducedMotion) return;
        if (isHovered) {
            setProgress(0);
            return;
        }

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    // Switch to next tab
                    const currentIndex = tabsConfig.findIndex(t => t.id === activeTab);
                    const nextIndex = (currentIndex + 1) % tabsConfig.length;
                    setActiveTab(tabsConfig[nextIndex].id);
                    return 0;
                }
                return prev + (100 / (AUTO_ROTATE_INTERVAL / 100));
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, [activeTab, isHovered, prefersReducedMotion]);

    // Show toast on tab change
    useEffect(() => {
        setToastContent(toastMessages[activeTab]);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }, [activeTab]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const currentIndex = tabsConfig.findIndex(t => t.id === activeTab);
                let nextIndex: number;
                if (e.key === "ArrowRight") {
                    nextIndex = (currentIndex + 1) % tabsConfig.length;
                } else {
                    nextIndex = (currentIndex - 1 + tabsConfig.length) % tabsConfig.length;
                }
                setActiveTab(tabsConfig[nextIndex].id);
                setProgress(0);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeTab]);

    // 3D tilt effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mockupRef.current) return;
        const rect = mockupRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        setTiltStyle({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTiltStyle({ rotateX: 0, rotateY: 0 });
        setIsHovered(false);
    };

    // Confetti trigger (called from CrmMockup on successful drag)
    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
    };


    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-8 lg:pt-12 pb-24">
            {/* Animated Aurora Background (YC/Linear Style) */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-50"></div>

                {prefersReducedMotion ? (
                    <>
                        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-200/35 mix-blend-multiply blur-[100px] dark:bg-blue-900/15 dark:mix-blend-screen" />
                        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-200/35 mix-blend-multiply blur-[100px] dark:bg-purple-900/15 dark:mix-blend-screen" />
                        <div className="absolute right-[-10%] top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-200/30 mix-blend-multiply blur-[100px] dark:bg-indigo-900/15 dark:mix-blend-screen" />
                    </>
                ) : (
                    <>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 10, 0],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-200/40 mix-blend-multiply blur-[100px] dark:bg-blue-900/20 dark:mix-blend-screen"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, -15, 0],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-200/40 mix-blend-multiply blur-[100px] dark:bg-purple-900/20 dark:mix-blend-screen"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                x: [0, 50, 0],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute right-[-10%] top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-200/40 mix-blend-multiply blur-[100px] dark:bg-indigo-900/20 dark:mix-blend-screen"
                        />
                    </>
                )}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        {/* Who This Is For - Trust Signals */}
                        <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                                <span className="relative flex h-2 w-2">
                                    {!prefersReducedMotion && (
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                    )}
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                                </span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    #1 Platform for International Students
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance leading-tight">
                            The Ultimate <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                OPT Tracker
                            </span>{" "}
                            & H-1B Finder
                        </motion.h1>

                        <motion.div
                            variants={fadeInUp}
                            className="prose-longform mx-auto mb-10 max-w-xl lg:mx-0"
                        >
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                                Stop using spreadsheets. TrackMyOPT automates your <strong>OPT Timeline</strong>, helps you find <strong>Visa Sponsorship</strong>, and builds <strong>AI Resumes</strong> in one dashboard.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                            <MagneticButton>
                                <Link
                                    href="/login"
                                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-500/40 sm:w-auto lg:min-h-0 lg:hover:-translate-y-0.5"
                                >
                                    Start Free Tracking
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </MagneticButton>
                            <GuestPreviewModal />
                        </motion.div>

                        {/* Mobile-only: one clear preview card (readable type; full mockup stays on lg+) */}
                        <motion.div variants={fadeInUp} className="mx-auto mt-10 w-full max-w-sm lg:hidden">
                            <div className="rounded-2xl border border-border/80 bg-white/90 p-5 shadow-xl backdrop-blur-sm dark:bg-zinc-900/90">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
                                        <Calendar className="h-6 w-6 text-white" aria-hidden />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-base font-semibold text-foreground">OPT Timeline</p>
                                        <p className="text-sm text-muted-foreground">Deadlines & reminders</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Filing window</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">Open</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        One place to track OPT, STEM, and case status — same tools on desktop.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Interactive Mockup with Tab Switching */}
                    <div className="relative hidden lg:block w-full">
                        {/* Toast Notification */}
                        <AnimatePresence>
                            {showToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                                    className="absolute -top-4 left-1/2 z-50 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2"
                                >
                                    {(() => {
                                        const ToastIcon = toastContent.icon;
                                        return <ToastIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />;
                                    })()}
                                    <span className="text-sm font-medium text-foreground">{toastContent.message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Confetti Effect */}
                        <AnimatePresence>
                            {showConfetti && (
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 pointer-events-none overflow-hidden"
                                >
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 rounded-full"
                                            style={{
                                                background: ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"][i % 5],
                                                left: `${50 + (Math.random() - 0.5) * 40}%`,
                                                top: "50%",
                                            }}
                                            initial={{ y: 0, x: 0, scale: 1, opacity: 1 }}
                                            animate={{
                                                y: [0, -150 - Math.random() * 100, 200],
                                                x: [(Math.random() - 0.5) * 200],
                                                scale: [1, 1.2, 0.5],
                                                opacity: [1, 1, 0],
                                                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                                            }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3D Tilt Container */}
                        <motion.div
                            ref={mockupRef}
                            className="relative w-full aspect-[4/3] max-w-[600px] mx-auto"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                perspective: 1000,
                            }}
                        >
                            <motion.div
                                className="relative w-full h-full"
                                animate={{
                                    rotateX: tiltStyle.rotateX,
                                    rotateY: tiltStyle.rotateY,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Dynamic Glow Based on Active Tab */}
                                <AnimatePresence mode="wait">
                                    {activeTab === "timeline" && (
                                        <motion.div
                                            key="glow-timeline"
                                            className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-cyan-500/30 to-blue-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    {activeTab === "crm" && (
                                        <motion.div
                                            key="glow-crm"
                                            className="absolute inset-0 bg-gradient-to-tr from-purple-500/40 via-pink-500/30 to-purple-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    {activeTab === "docs" && (
                                        <motion.div
                                            key="glow-docs"
                                            className="absolute inset-0 bg-gradient-to-tr from-green-500/40 via-emerald-500/30 to-teal-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    {activeTab === "resume" && (
                                        <motion.div
                                            key="glow-resume"
                                            className="absolute inset-0 bg-gradient-to-tr from-orange-500/40 via-amber-500/30 to-yellow-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}

                                </AnimatePresence>

                                {/* Tab Content */}
                                <div className="relative z-10 h-full">
                                    <AnimatePresence mode="wait">
                                        {activeTab === "timeline" && (
                                            <motion.div
                                                key="timeline"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <TimelineMockup />
                                            </motion.div>
                                        )}
                                        {activeTab === "crm" && (
                                            <motion.div
                                                key="crm"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <CrmMockupWithConfetti onDragSuccess={triggerConfetti} />
                                            </motion.div>
                                        )}
                                        {activeTab === "docs" && (
                                            <motion.div
                                                key="docs"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <DocumentsMockup />
                                            </motion.div>
                                        )}
                                        {activeTab === "resume" && (
                                            <motion.div
                                                key="resume"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <ResumeEditorMockup />
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>

                                {/* Floating Status Badge (appears on Timeline tab) */}
                                <AnimatePresence>
                                    {activeTab === "timeline" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 z-20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center border-2 border-green-200 dark:border-green-800">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Status: Active</p>
                                                    <p className="text-xs text-muted-foreground">e-Verified Employer</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating H-1B Match Badge (appears on CRM tab) */}
                                <AnimatePresence>
                                    {activeTab === "crm" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-purple-200 dark:border-purple-800 z-20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">H-1B Match</p>
                                                    <p className="text-[10px] text-purple-600 dark:text-purple-400">85% Sponsorship Prob.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating Expiry Alert Badge (appears on Documents tab) */}
                                <AnimatePresence>
                                    {activeTab === "docs" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-orange-200 dark:border-orange-800 z-20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                                                    <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">Expiry Alert</p>
                                                    <p className="text-[10px] text-orange-600 dark:text-orange-400">Passport expires in 6mo</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating AI Score Badge (appears on Resume tab) */}
                                <AnimatePresence>
                                    {activeTab === "resume" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-amber-200 dark:border-amber-800 z-20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">ATS Score</p>
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-400">92% Match</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>


                            </motion.div>
                        </motion.div>

                        {/* Interactive Tab Triggers moved to Right Column */}
                        <motion.div variants={fadeInUp} className="mt-8 flex flex-col items-center z-20 relative">
                            <div className="inline-flex flex-nowrap gap-1.5 p-1.5 rounded-xl bg-gray-100/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-border/50 justify-center overflow-hidden shadow-lg">
                                {tabsConfig.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setProgress(0);
                                        }}
                                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                            ? "bg-white dark:bg-zinc-700 text-primary shadow-md"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        {/* Badge */}
                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${tab.badgeColor === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                                            tab.badgeColor === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                                                tab.badgeColor === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                                                    tab.badgeColor === "pink" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" :
                                                        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                            }`}>
                                            {tab.badge}
                                        </span>
                                        {/* Active indicator pulse for "Live" badge */}
                                        {tab.badge === "Live" && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden w-full max-w-sm">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1, ease: "linear" }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
