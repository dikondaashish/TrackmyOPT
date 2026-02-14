"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

interface CountUpProps {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    delay?: number;
    className?: string;
}

export function CountUp({ value, prefix = "", suffix = "", duration = 2, delay = 0, className = "" }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000,
    });
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(value);
            }, delay * 1000);
        }
    }, [isInView, value, motionValue, delay]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${latest.toFixed(0)}${suffix}`;
            }
        });
    }, [springValue, prefix, suffix]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
}
