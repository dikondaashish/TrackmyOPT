"use client";

import { useEffect, useState } from "react";

export function useAnimatedNumber(target: number, durationMs = 1400) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - (1 - progress) ** 3;
            setValue(Math.round(target * eased));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, durationMs]);

    return value;
}
