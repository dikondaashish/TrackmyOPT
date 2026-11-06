import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import Image from "next/image";
import { ExtensionHeroVideo } from "./ExtensionHeroVideo";

export function LandingChromeExtension() {
    return (
        <section className="py-24 bg-muted relative overflow-hidden border-y border-border">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Column: Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <p className="text-sm text-muted-foreground">
                            Top rated extension
                        </p>

                        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                            Your F-1 copilot, built into your browser
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
                                    <Check className="w-5 h-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
                                    <span className="text-foreground font-medium">{feature}</span>
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
                                <span>TrackMyOPT: 3,500+ users signed up</span>
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
