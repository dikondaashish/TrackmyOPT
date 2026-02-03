import { Button } from "@/components/ui/button";
import { Check, Download, Layers, Zap } from "lucide-react";
import Image from "next/image";

export function LandingChromeExtension() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden border-y border-border/50">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Layers className="w-96 h-96 text-primary" />
            </div>

            <div className="container px-4 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Column: Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Top Rated Extension
                        </div>

                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Your F-1 Copilot, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                Built Into Your Browser
                            </span>
                        </h2>

                        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                            More than just a job tracker. Visualize your unemployment clock, get step-by-step USCIS guides, and safeguard your status without leaving the tab.
                        </p>

                        <div className="space-y-4 max-w-sm mx-auto lg:mx-0">
                            {[
                                "Live Unemployment Clock in Toolbar",
                                "USCIS Application Checklists",
                                "One-Click Job Saving",
                                "H-1B Sponsor Flags"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-foreground/80 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                            <Button size="lg" className="h-12 px-8 text-base gap-2 bg-[#2563EB] hover:bg-[#1d4ed8]">
                                <Download className="w-5 h-5" />
                                Add to Chrome - It's Free
                            </Button>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <div className="flex -space-x-2">
                                    {[
                                        "/students/student1.jpg",
                                        "/students/student2.jpg",
                                        "/students/student3.jpg",
                                        "/students/student4.jpg"
                                    ].map((src, i) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background overflow-hidden">
                                            <Image
                                                src={src}
                                                alt="Student"
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span>2,500+ students using it</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Mockup */}
                    <div className="flex-1 w-full max-w-2xl lg:max-w-none relative">
                        <div className="relative rounded-xl border border-border shadow-2xl bg-background overflow-hidden aspect-[16/10] group">
                            {/* Browser Toolbar Mockup */}
                            <div className="bg-muted border-b border-border h-10 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <div className="flex-1 mx-4 h-6 bg-background rounded-md border border-border/50 text-xs flex items-center px-3 text-muted-foreground">
                                    linkedin.com/jobs/view/...
                                </div>
                            </div>

                            {/* Content Area - Simulated Job Board Overlay */}
                            <div className="relative p-6 bg-[#F3F2EF] dark:bg-card h-full flex flex-col gap-4">
                                {/* Simulated Job Header */}
                                <div className="h-24 w-full bg-white dark:bg-background rounded-lg border border-border p-4 shadow-sm flex gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-md" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 w-1/2 bg-gray-200 dark:bg-muted rounded" />
                                        <div className="h-3 w-1/3 bg-gray-200 dark:bg-muted rounded" />
                                    </div>
                                </div>

                                {/* The Extension Floating Element */}
                                <div className="absolute top-12 right-8 w-64 bg-background rounded-lg shadow-xl border border-primary/20 p-4 animate-in slide-in-from-right-10 duration-700 fade-in fill-mode-forwards z-20">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                                                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                                            </div>
                                            <span className="font-bold text-sm">TrackMyOPT</span>
                                        </div>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">H-1B Safe</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-muted-foreground">Role detected:</label>
                                            <div className="text-sm font-medium">Software Engineer</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">Company:</label>
                                            <div className="text-sm font-medium">TechCorp Inc.</div>
                                        </div>
                                        <Button size="sm" className="w-full text-xs h-8">
                                            Save to Dashboard
                                        </Button>
                                    </div>
                                </div>

                                {/* Cursor Graphic */}
                                <div className="absolute top-[180px] right-[100px] pointer-events-none drop-shadow-xl z-30">
                                    <svg className="w-8 h-8 fill-black stroke-white stroke-2" viewBox="0 0 32 32">
                                        <path d="M12 24l-6-18 18 6-8 4-4 8z" />
                                    </svg>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
