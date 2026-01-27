import AnimatedCardStack from "@/components/ui/animate-card-animation";

export function LandingSuccessStories() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-background to-background dark:from-blue-900/10 dark:via-background dark:to-background pointer-events-none" />

            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">
                            Success Stories
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Real Results from <br className="hidden lg:block" />
                            <span className="text-primary">Real Students</span>
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
