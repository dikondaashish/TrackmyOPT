"use client";

import { ParallaxScroll } from "@/components/animations/parallax-scroll";

export function LandingTrustedUniversities() {
    const universities = [
        { name: "Carnegie Mellon", logo: "/unis/cmu.png" },
        { name: "Georgia Tech", logo: "/unis/gatech.png" },
        { name: "USC", logo: "/unis/usc.png" },
        { name: "NYU", logo: "/unis/nyu.png" },
        { name: "Columbia", logo: "/unis/columbia.png" },
        { name: "MIT", logo: "/unis/mit.png" },
        { name: "Stanford", logo: "/unis/stanford.png" },
        { name: "UC Berkeley", logo: "/unis/berkeley.svg" },
        { name: "Harvard", logo: "/unis/harvard.png" },
        { name: "Cornell", logo: "/unis/cornell.png" },
        { name: "UIUC", logo: "/unis/illinois.png" },
        { name: "Purdue", logo: "/unis/purdue.png" },
        { name: "UT Austin", logo: "/unis/utexas.png" },
        { name: "Northeastern", logo: "/unis/northeastern.png" }
    ];

    const companies = [
        { name: "Google", logo: "/companies/google.svg" },
        { name: "Amazon", logo: "/companies/amazon.svg" },
        { name: "Microsoft", logo: "/companies/microsoft.svg" },
        { name: "Meta", logo: "/companies/meta.svg" },
        { name: "Tesla", logo: "/companies/tesla.svg" },
        { name: "Netflix", logo: "/companies/netflix.svg" }
    ];

    const allLogos = [...universities, ...companies];
    // Split into two rows for different speeds/directions
    const row1 = allLogos.slice(0, Math.ceil(allLogos.length / 2));
    const row2 = allLogos.slice(Math.ceil(allLogos.length / 2));

    const renderLogo = (item: any, index: number) => (
        <div
            key={index}
            className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default px-6"
        >
            {item.logo ? (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.logo}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                    {item.name[0]}
                </div>
            )}
            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground whitespace-nowrap">
                {item.name}
            </span>
        </div>
    );

    return (
        <div className="w-full py-12 border-y border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Trusted by students from top universities and companies
                </p>
            </div>

            <div className="flex flex-col gap-8">
                <ParallaxScroll baseVelocity={-1}>
                    {row1.map(renderLogo)}
                </ParallaxScroll>

                <ParallaxScroll baseVelocity={1}>
                    {row2.map(renderLogo)}
                </ParallaxScroll>
            </div>
        </div>
    );
}
