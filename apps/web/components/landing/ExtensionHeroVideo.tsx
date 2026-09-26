"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const FULL_DEMO_URL = "https://youtu.be/ZBAWEeII2kE";

export function ExtensionHeroVideo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [isInView, setIsInView] = useState(false);
    const [hasBeenInView, setHasBeenInView] = useState(false);
    const [hasRequestedPlayback, setHasRequestedPlayback] = useState(false);
    const [isPausedByUser, setIsPausedByUser] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!("IntersectionObserver" in window)) {
            const frame = requestAnimationFrame(() => {
                setIsInView(true);
                setHasBeenInView(true);
            });
            return () => cancelAnimationFrame(frame);
        }

        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
            if (entry.isIntersecting) setHasBeenInView(true);
        }, { threshold: 0.15 });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const shouldLoad = hasBeenInView && (!prefersReducedMotion || hasRequestedPlayback);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (!shouldLoad || !isInView || isPausedByUser) {
            video.pause();
            return;
        }

        void video.play().catch(() => setIsPlaying(false));
    }, [shouldLoad, isInView, isPausedByUser]);

    const togglePlayback = () => {
        if (isPlaying) {
            setIsPausedByUser(true);
        } else {
            setHasRequestedPlayback(true);
            setIsPausedByUser(false);
        }
    };

    const toggleSound = () => {
        const video = videoRef.current;
        const nextMuted = !isMuted;
        if (video) video.muted = nextMuted;
        setIsMuted(nextMuted);
        if (!nextMuted && video?.paused && isInView) {
            setHasRequestedPlayback(true);
            setIsPausedByUser(false);
            void video.play().catch(() => setIsPlaying(false));
        }
    };

    return (
        <div ref={containerRef} className="overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-2xl dark:bg-slate-900" aria-label="TrackMyOPT Chrome extension video preview">
            <video
                ref={videoRef}
                className="block aspect-video w-full bg-slate-100 object-contain dark:bg-slate-900"
                src={shouldLoad ? "/videos/extension-hero-loop.mp4" : undefined}
                poster="/videos/extension-hero-poster.jpg"
                autoPlay={!prefersReducedMotion}
                muted={isMuted}
                loop
                playsInline
                preload="none"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                aria-label="Short product preview showing application prefill, the OPT clock, and job saving"
            >
                Your browser does not support video. Watch the full TrackMyOPT demo on YouTube.
            </video>
            <div className="flex min-h-12 items-center justify-between gap-2 bg-slate-950 px-3 text-white sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={togglePlayback}
                        aria-label={isPlaying ? "Pause preview" : "Play preview"}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        {isPlaying ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                    </button>
                    <button
                        type="button"
                        onClick={toggleSound}
                        className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        {isMuted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                        {isMuted ? "Unmute" : "Mute"}
                    </button>
                </div>
                <a
                    href={FULL_DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                    Watch full demo <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
            </div>
        </div>
    );
}
