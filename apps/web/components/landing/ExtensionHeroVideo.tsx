"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";

const VIDEO_ID = "GoaFPpoygoQ";
const VIDEO_TITLE = "Day 1 of OPT: TrackMyOPT, the free Chrome extension for your OPT timeline and job search";
const WATCH_URL = `https://youtu.be/${VIDEO_ID}`;
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&rel=0&playsinline=1`;

/** The YouTube player loads only after a click, so the landing page ships no third-party video code up front. It starts muted; viewers unmute with the player controls. */
export function ExtensionHeroVideo() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-2xl dark:bg-slate-900" aria-label="TrackMyOPT Chrome extension video">
            <div className="relative aspect-video w-full bg-slate-950">
                {isPlaying ? (
                    <iframe
                        className="absolute inset-0 h-full w-full"
                        src={EMBED_URL}
                        title={VIDEO_TITLE}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsPlaying(true)}
                        aria-label="Play the TrackMyOPT video"
                        className="group absolute inset-0 block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                    >
                        <Image
                            src="/videos/extension-hero-poster.jpg"
                            alt="TrackMyOPT sidebar on a job application page with Prefill, custom resume, and job tracking tools"
                            fill
                            sizes="(min-width: 1024px) 640px, 100vw"
                            className="object-cover"
                            priority={false}
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition-colors group-hover:bg-slate-950/10">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-lg transition-transform group-hover:scale-105">
                                <Play className="ml-1 h-7 w-7" aria-hidden />
                            </span>
                        </span>
                    </button>
                )}
            </div>
            <div className="flex min-h-12 items-center justify-between gap-2 bg-slate-950 px-3 text-white sm:px-4">
                <span className="text-sm font-medium">Watch the 46-second demo</span>
                <a
                    href={WATCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                    Watch on YouTube <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
            </div>
        </div>
    );
}
