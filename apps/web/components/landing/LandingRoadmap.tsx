import { AnimatedRoadmap } from "@/components/landing/animated-roadmap";

export function LandingRoadmap() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background gradient blob */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <div className="container px-4 mx-auto text-center space-y-8">
                <div className="prose-longform space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                        The Road to <span className="text-primary">H-1B</span>
                    </h2>
                    <p className="text-muted-foreground text-lg sm:text-xl">
                        From your first OPT application to your final visa approval, TrackMyOPT guides you through every critical milestone.
                    </p>
                </div>

                <div className="w-full">
                    <AnimatedRoadmap />
                </div>
            </div>
        </section>
    );
}
