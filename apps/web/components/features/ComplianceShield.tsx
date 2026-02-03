"use client";

import { motion } from "framer-motion";
import { Shield, Check, Lock, Bell, AlertTriangle, FileCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function ComplianceShield() {
    return (
        <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
            {/* Pulsing Rings */}
            {[1, 2, 3].map((ring) => (
                <motion.div
                    key={ring}
                    className="absolute inset-0 rounded-full border border-blue-500/20 dark:border-blue-400/10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.8, 1.5],
                        opacity: [0.5, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: ring * 0.8,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Central Shield */}
            <div className="relative z-20 w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Shield className="w-16 h-16 text-white" fill="currentColor" strokeWidth={1} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-950">
                    <Check className="w-4 h-4 text-white font-bold" strokeWidth={4} />
                </div>
            </div>

            {/* Orbiting Status Pills */}
            <OrbitingPill
                angle={0}
                radius={130}
                delay={0}
                icon={<Lock className="w-3 h-3 text-blue-600" />}
                text="Status: Active"
                color="bg-blue-50 text-blue-700 border-blue-200"
            />
            <OrbitingPill
                angle={120}
                radius={140}
                delay={1}
                icon={<Bell className="w-3 h-3 text-amber-600" />}
                text="90-Day Report Due"
                color="bg-amber-50 text-amber-700 border-amber-200"
            />
            <OrbitingPill
                angle={240}
                radius={130}
                delay={2}
                icon={<FileCheck className="w-3 h-3 text-green-600" />}
                text="SEVP Updated"
                color="bg-green-50 text-green-700 border-green-200"
            />

            {/* Radar Sweep Effect */}
            <motion.div
                className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-t from-blue-500/10 to-transparent z-10 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ clipPath: "polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 50%)", maskImage: "radial-gradient(circle, transparent 30%, black 70%)" }}
            />
        </div>
    );
}

function OrbitingPill({ angle, radius, delay, icon, text, color }: { angle: number, radius: number, delay: number, icon: React.ReactNode, text: string, color: string }) {
    return (
        <motion.div
            className={`absolute flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${color} dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200 z-20`}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
                x: [
                    Math.cos((angle * Math.PI) / 180) * radius,
                    Math.cos(((angle + 360) * Math.PI) / 180) * radius
                ],
                y: [
                    Math.sin((angle * Math.PI) / 180) * radius,
                    Math.sin(((angle + 360) * Math.PI) / 180) * radius
                ],
                opacity: 1
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                delay: -delay * 5 // Negative delay to start at different positions immediately
            }}
        >
            {icon}
            <span className="text-xs font-semibold whitespace-nowrap">{text}</span>
        </motion.div>
    );
}
