"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileCheck,
    Search,
    Download,
    Eye,
    Lock,
    ChevronLeft,
    Shield,
} from "lucide-react";

export function HeroDocumentsMockup() {
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
