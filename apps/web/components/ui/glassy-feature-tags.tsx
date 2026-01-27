"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Badge {
    id: string
    label: string
    size: "sm" | "md" | "lg"
    rotation: number
    zIndex: number
    offsetX: number
    offsetY: number
}

const badges: Badge[] = [
    {
        id: "h1b",
        label: "H-1B Selected",
        size: "lg",
        rotation: -4,
        zIndex: 1,
        offsetX: -20,
        offsetY: -60,
    },
    {
        id: "opt",
        label: "OPT Approved",
        size: "md",
        rotation: 3,
        zIndex: 2,
        offsetX: 60,
        offsetY: -35,
    },
    {
        id: "stem",
        label: "STEM Extension",
        size: "lg",
        rotation: -2,
        zIndex: 3,
        offsetX: -40,
        offsetY: 10,
    },
    {
        id: "offer",
        label: "Job Offer",
        size: "lg",
        rotation: 1,
        zIndex: 4,
        offsetX: 10,
        offsetY: 35,
    },
    {
        id: "ead",
        label: "EAD Card",
        size: "sm",
        rotation: 5,
        zIndex: 5,
        offsetX: -25,
        offsetY: 80,
    },
    {
        id: "i983",
        label: "I-983 Signed",
        size: "md",
        rotation: -3,
        zIndex: 6,
        offsetX: 50,
        offsetY: 90,
    },
]

const sizeClasses = {
    sm: "px-5 py-2 text-sm",
    md: "px-7 py-2.5 text-base",
    lg: "px-9 py-3 text-lg font-bold",
}

export function GlassyFeatureTags() {
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    return (
        <div className="relative flex h-[350px] w-full items-center justify-center overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl opacity-30 animate-pulse-slow" />

            {badges.map((badge) => {
                const isHovered = hoveredId === badge.id
                const isOtherHovered = hoveredId !== null && hoveredId !== badge.id

                return (
                    <div
                        key={badge.id}
                        className={cn(
                            "absolute cursor-default select-none rounded-full border border-white/20 shadow-lg backdrop-blur-md transition-all duration-500 ease-out",
                            "bg-white/10 dark:bg-black/20 text-foreground", // Glassmorphism base
                            sizeClasses[badge.size],
                            "hover:border-primary/50 hover:bg-white/20 hover:shadow-primary/20 hover:shadow-2xl", // Hover state
                        )}
                        style={{
                            transform: `
                translate(${badge.offsetX}px, ${badge.offsetY}px) 
                rotate(${isHovered ? 0 : badge.rotation}deg)
                scale(${isHovered ? 1.1 : isOtherHovered ? 0.95 : 1})
                translateY(${isHovered ? -5 : 0}px)
              `,
                            zIndex: isHovered ? 50 : badge.zIndex,
                        }}
                        onMouseEnter={() => setHoveredId(badge.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <span className="relative z-10 font-medium tracking-tight">
                            {badge.label}
                        </span>

                        {/* Inner gloss effect */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/20 to-transparent opacity-50 rounded-full" />
                    </div>
                )
            })}
        </div>
    )
}
