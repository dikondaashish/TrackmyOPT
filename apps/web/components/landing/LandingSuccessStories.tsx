import AnimatedCardStack from "@/components/animations/animate-card-animation";

export function LandingSuccessStories() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[2px] -z-10" />

            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="prose-longform order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">
                            Success Stories
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            F-1 Student OPT <br className="hidden lg:block" />
                            <span className="text-primary">Success Stories</span>
                        </h2>
                        <p className="mx-auto lg:mx-0 max-w-[600px] text-muted-foreground text-lg sm:text-xl">
                            Join thousands of international students who secured their future with TrackMyOPT.
                            From finding sponsors to staying compliant, we've got you covered.
                        </p>
                    </div>

                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end w-full">
                        <AnimatedCardStack />
                    </div>
                </div>
            </div>
        </section>
    );
}
