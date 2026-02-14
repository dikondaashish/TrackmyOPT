"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Clock, GraduationCap, Briefcase, FileCheck, Building2 } from "lucide-react";

// Define the type for a single milestone
interface Milestone {
    id: number;
    name: string;
    description: string;
    status: "complete" | "in-progress" | "pending";
    icon: React.ElementType;
    position: {
        top?: string;
        left?: string;
        right?: string;
        bottom?: string;
    };
}

const defaultMilestones: Milestone[] = [
    {
        id: 1,
        name: "Graduation",
        description: "Apply for OPT 90 days before",
        status: "complete",
        icon: GraduationCap,
        position: { top: "10%", left: "5%" }, // Original positions mostly work relative to SVG
    },
    {
        id: 2,
        name: "EAD Received",
        description: "Start working within 90 days",
        status: "complete",
        icon: FileCheck,
        // Adjusted slightly for compressed curve
        position: { top: "45%", left: "25%" },
    },
    {
        id: 3,
        name: "Job Secured",
        description: "Report to SEVP Portal",
        status: "in-progress",
        icon: Briefcase,
        position: { top: "75%", left: "50%" },
    },
    {
        id: 4,
        name: "STEM Extension",
        description: "File I-983 Training Plan",
        status: "pending",
        icon: Clock,
        position: { top: "45%", right: "20%" },
    },
    {
        id: 5,
        name: "H-1B Visa",
        description: "Change of Status Approved",
        status: "pending",
        icon: Building2,
        position: { top: "10%", right: "5%" },
    },
];

// Define the props for the AnimatedRoadmap component
interface AnimatedRoadmapProps extends React.HTMLAttributes<HTMLDivElement> {
    milestones?: Milestone[];
}

// Sub-component for a single milestone marker
const MilestoneMarker = ({ milestone }: { milestone: Milestone }) => {
    const statusColors = {
        complete: "bg-primary text-primary-foreground border-primary",
        "in-progress": "bg-blue-500 text-white border-blue-500 animate-pulse",
        pending: "bg-muted text-muted-foreground border-border",
    };

    const Icon = milestone.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: milestone.id * 0.2, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.8 }}
            className="absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
                top: milestone.position.top,
                left: milestone.position.left,
                right: milestone.position.right,
                bottom: milestone.position.bottom,
            }}
        >
            {/* Marker Circle */}
            <div className={cn(
                "relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-4 shadow-lg z-10",
                statusColors[milestone.status]
            )}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <div className="absolute top-12 md:top-14 w-40 text-center">
                <div className="font-bold text-xs md:text-sm bg-background/80 backdrop-blur-sm px-2 rounded-md border border-border/50 inline-block shadow-sm">
                    {milestone.name}
                </div>
                <div className="hidden md:block text-xs text-muted-foreground mt-1 bg-background/50 backdrop-blur-sm rounded px-1">
                    {milestone.description}
                </div>
            </div>
        </motion.div>
    );
};

// Main AnimatedRoadmap component
const AnimatedRoadmap = React.forwardRef<HTMLDivElement, AnimatedRoadmapProps>(
    ({ className, milestones = defaultMilestones, ...props }, ref) => {
        const targetRef = React.useRef<HTMLDivElement>(null);
        const { scrollYProgress } = useScroll({
            target: targetRef,
            offset: ["start center", "end center"],
        });

        // Animate the path drawing based on scroll progress
        const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

        return (
            <div
                ref={targetRef}
                className={cn("relative w-full max-w-lg mx-auto py-8 px-4", className)}
                {...props}
            >
                {/* Reduced height from 400px to 240px (~40% reduction) */}
                <div className="relative h-[200px] md:h-[240px] w-full">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 1000 240"
                        preserveAspectRatio="none"
                        className="absolute top-0 left-0 overflow-visible"
                    >
                        {/* Background Path (Gray) - Scaled Y coordinates by ~0.6 */}
                        {/* Original Ys: 40 -> 180 -> 300 -> 180 -> 40 */}
                        {/* New Ys:    25 -> 110 -> 180 -> 110 -> 25 */}
                        <path
                            d="M 50 25 C 150 25, 150 110, 250 110 S 400 180, 500 180 S 700 110, 800 110 S 900 25, 950 25"
                            fill="none"
                            stroke="hsl(var(--muted-foreground) / 0.2)"
                            strokeWidth="4"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                        />

                        {/* Foreground Path (Animated Color) */}
                        <motion.path
                            d="M 50 25 C 150 25, 150 110, 250 110 S 400 180, 500 180 S 700 110, 800 110 S 900 25, 950 25"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{ pathLength }}
                        />
                    </svg>

                    {/* Render each milestone */}
                    {milestones.map((milestone) => (
                        <MilestoneMarker key={milestone.id} milestone={milestone} />
                    ))}
                </div>
            </div>
        );
    }
);

AnimatedRoadmap.displayName = "AnimatedRoadmap";

export { AnimatedRoadmap };
