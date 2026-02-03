"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { LandingTrustedUniversities } from "./LandingTrustedUniversities";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
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
            className="flex items-center justify-between mb-6"
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


        {/* Stats with animated counters */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
                className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)" }}
            >
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Days Remaining</p>
                <motion.p
                    className="text-2xl font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    247
                </motion.p>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-1.5 mt-2 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
            <motion.div
                className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100/50 dark:border-green-800/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(34, 197, 94, 0.15)" }}
            >
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Unemployment</p>
                <div className="flex items-end gap-1">
                    <motion.p
                        className="text-2xl font-bold text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        12
                    </motion.p>
                    <p className="text-sm text-muted-foreground mb-1">/ 90 days</p>
                </div>
                <div className="w-full bg-green-100 dark:bg-green-900/30 h-1.5 mt-2 rounded-full overflow-hidden">
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
        <div className="space-y-4 relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-700">
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
                <p className="text-xs text-muted-foreground mb-0.5">May 15, 2025</p>
                <p className="text-sm font-medium text-foreground">Program End Date</p>
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
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">Aug 12, 2025</p>
                <p className="text-sm font-medium text-foreground">OPT Start Date</p>
                <motion.div
                    className="mt-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded-lg"
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
                <p className="text-xs text-muted-foreground mb-0.5">Nov 10, 2025</p>
                <p className="text-sm font-medium text-foreground">Next Reporting Deadline</p>
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


const DocumentsMockup = () => (
    <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
        {/* Window Controls - Left aligned */}
        <div className="flex gap-1.5 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        {/* Header */}
        <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
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
            <motion.div
                className="relative flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-[10px] text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-900/50 overflow-hidden"
                whileHover={{ scale: 1.05 }}
            >
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                />
                <Shield className="w-3 h-3 relative z-10" />
                <span className="relative z-10">AES-256 Encrypted</span>
            </motion.div>
        </motion.div>

        {/* Grid with staggered animations */}
        <div className="grid grid-cols-2 gap-3">
            {[
                { name: "OPT I-20", type: "PDF", size: "2.4 MB", date: "Expires in 8mo", color: "blue" },
                { name: "EAD Card", type: "IMG", size: "1.1 MB", date: "Expires in 8mo", color: "purple" },
                { name: "Passport", type: "PDF", size: "4.2 MB", date: "Expires in 6mo", color: "orange" },
                { name: "Offer Letter", type: "PDF", size: "1.8 MB", date: "Uploaded 2d ago", color: "gray" },
            ].map((doc, i) => (
                <motion.div
                    key={i}
                    className="group p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/40 border border-border/50 hover:border-primary/30 cursor-pointer"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.2 + (i * 0.1), type: "spring", stiffness: 200 }}
                    whileHover={{
                        y: -4,
                        scale: 1.02,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                        transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                                ${doc.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                ${doc.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                                ${doc.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                ${doc.color === 'gray' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                            `}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.4 }}
                        >
                            {doc.type}
                        </motion.div>
                        <motion.div
                            className="opacity-0 group-hover:opacity-100"
                            initial={{ x: -5 }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                className="w-6 h-6 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm"
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                            >
                                <ArrowRight className="w-3 h-3 text-primary" />
                            </motion.div>
                        </motion.div>
                    </div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{doc.name}</p>
                    <motion.p
                        className="text-[10px] text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                        {doc.date}
                    </motion.p>
                </motion.div>
            ))}
        </div>
    </div>
);


type TabType = "timeline" | "crm" | "docs";

export function LandingHero() {
    const [activeTab, setActiveTab] = useState<TabType>("timeline");

    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-20 lg:pt-32 pb-24">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900" />

            {/* Mesh Gradients with Parallax */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ParallaxImage offset={100} className="w-full h-full absolute top-0 left-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-blue-100/20 to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10 blur-3xl rounded-full opacity-50" />
                </ParallaxImage>
                <ParallaxImage offset={-50} className="w-full h-full absolute top-0 left-0">
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/30 to-blue-50/30 dark:from-indigo-900/10 dark:to-blue-900/10 blur-3xl rounded-full opacity-50" />
                </ParallaxImage>
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
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    #1 Platform for International Students
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance leading-tight">
                            Your Entire <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                OPT Journey
                            </span>{" "}
                            in One System
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Stop using spreadsheets. TrackMyOPT connects your timeline, job search, and compliance documents in a single, professional dashboard.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <MagneticButton>
                                <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 text-white bg-primary rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                                    Start Free Tracking
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </MagneticButton>
                            <Link href="#features" className="inline-flex items-center justify-center px-8 py-4 text-foreground bg-white dark:bg-zinc-800 border border-border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all">
                                View Demo
                            </Link>
                        </motion.div>

                        {/* Interactive Tab Triggers for Mobile/Desktop */}
                        <motion.div variants={fadeInUp} className="mt-12 flex gap-2 justify-center lg:justify-start overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { id: "timeline", label: "Timeline", icon: LayoutDashboard },
                                { id: "crm", label: "Job CRM", icon: Briefcase },
                                { id: "docs", label: "Documents", icon: FileCheck },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-md ring-1 ring-border"
                                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Interactive Mockup with Tab Switching */}
                    <div className="relative hidden lg:block w-full">
                        <div className="relative w-full aspect-[4/3] max-w-[600px] mx-auto">
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
                                            <CrmMockup />
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
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
