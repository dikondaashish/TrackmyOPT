import { Button } from "@/components/ui/button";
import { Check, Download, Layers } from "lucide-react";
import Image from "next/image";
import { ExtensionHeroVideo } from "./ExtensionHeroVideo";

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

                        <div className="prose-longform max-w-xl mx-auto lg:mx-0">
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                More than just a job tracker. Visualize your unemployment clock, get step-by-step USCIS guides, and safeguard your status without leaving the tab.
                            </p>
                        </div>

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
                            <Button asChild size="lg" className="min-h-12 h-12 px-8 text-base gap-2 bg-blue-700 text-white hover:bg-blue-800">
                                <a href="https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb" target="_blank" rel="noreferrer">
                                    <Download className="w-5 h-5" />
                                    Add to Chrome
                                </a>
                            </Button>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <div className="flex -space-x-2">
                                    {[
                                        { src: "/students/student1.png", alt: "International student from East Asia" },
                                        { src: "/students/student2.png", alt: "F-1 student from South Asia" },
                                        { src: "/students/student3.png", alt: "OPT graduate from Latin America" },
                                        { src: "/students/student4.png", alt: "STEM OPT student from Africa" }
                                    ].map((student, i) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background overflow-hidden">
                                            <Image
                                                src={student.src}
                                                alt={student.alt}
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span>TrackMyOPT: 3,000+ users signed up</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product video preview */}
                    <div className="flex-1 w-full max-w-2xl lg:max-w-none relative">
                        <ExtensionHeroVideo />
                    </div>

                </div>
            </div>
        </section>
    );
}
