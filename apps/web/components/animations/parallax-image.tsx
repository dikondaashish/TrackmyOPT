"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

interface ParallaxImageProps {
    children: React.ReactNode;
    offset?: number; // How many pixels to shift
    className?: string; // Additional classes for the container
}

export function ParallaxImage({ children, offset = 50, className = "" }: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Track scroll position of the element relative to the viewport
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Map scroll progress (0 to 1) to transform Y values (-offset to offset)
    const y = useTransform(smoothProgress, [0, 1], [-offset, offset]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div style={{ y }} className="w-full h-full">
                {children}
            </motion.div>
        </div>
    );
}
