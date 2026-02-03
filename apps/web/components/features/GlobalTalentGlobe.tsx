"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function GlobalTalentGlobe() {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center overflow-hidden">
            {/* Globe Container - Masked Circle */}
            <div className="relative w-[80%] h-[80%] rounded-full bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-950 shadow-inner overflow-hidden border border-blue-100 dark:border-zinc-800">
                {/* Grid Overlay for 3D effect */}
                <div className="absolute inset-0 z-10 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] pointer-events-none" />

                {/* Moving Map Texture (Simulated with Dot Grid) */}
                <div className="absolute inset-0 flex items-center">
                    <motion.div
                        className="flex gap-12"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    >
                        {/* We repeat the map segment twice for seamless loop */}
                        <MapSegment />
                        <MapSegment />
                    </motion.div>
                </div>

                {/* Atmosphere Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/0 pointer-events-none" />
            </div>

            {/* Orbiting Elements / Satellites */}
            <motion.div
                className="absolute w-[90%] h-[30%] border border-blue-200/50 dark:border-blue-500/20 rounded-full top-[35%] left-[5%]"
                style={{ transform: "rotate(-15deg)" }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
            />
        </div>
    );
}

function MapSegment() {
    // Generate a random-looking but deterministic dot grid to simulate continents
    // In a real app, this would be an SVG of the world map
    return (
        <div className="w-[400px] h-[300px] relative flex-shrink-0 opacity-40">
            {/* North America approximation */}
            <DotGroup x={50} y={50} width={80} height={60} />

            {/* South America */}
            <DotGroup x={100} y={150} width={40} height={80} />

            {/* Europe */}
            <DotGroup x={200} y={60} width={50} height={40} />

            {/* Africa */}
            <DotGroup x={210} y={120} width={60} height={70} />

            {/* Asia */}
            <DotGroup x={280} y={50} width={100} height={80} />

            {/* Australia */}
            <DotGroup x={350} y={180} width={50} height={40} />

            {/* Active User Pings */}
            <Ping x={70} y={80} color="bg-blue-500" delay={0} />
            <Ping x={220} y={70} color="bg-purple-500" delay={1} />
            <Ping x={320} y={90} color="bg-emerald-500" delay={2} />
            <Ping x={120} y={160} color="bg-amber-500" delay={3} />
        </div>
    )
}

function DotGroup({ x, y, width, height }: any) {
    const dots = [];
    for (let i = 0; i < width; i += 10) {
        for (let j = 0; j < height; j += 10) {
            if (Math.random() > 0.4) { // Randomize slightly for organic shape
                dots.push(
                    <div
                        key={`${i}-${j}`}
                        className="absolute w-1 h-1 rounded-full bg-blue-300 dark:bg-zinc-600"
                        style={{ left: x + i, top: y + j }}
                    />
                )
            }
        }
    }
    return <>{dots}</>;
}

function Ping({ x, y, color, delay }: any) {
    return (
        <div className="absolute" style={{ left: x, top: y }}>
            <motion.div
                className={`w-2 h-2 rounded-full ${color}`}
                animate={{ scale: [0, 1.5], opacity: [1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay }}
            />
            <div className={`w-1.5 h-1.5 rounded-full ${color} absolute top-0.5 left-0.5`} />
        </div>
    )
}
