import { GlassyFeatureTags } from "@/components/ui/glassy-feature-tags";

export function LandingFeatureCloud() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="container px-4 mx-auto text-center space-y-8">
                <div className="space-y-4 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                        Everything You Need for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                            Peace of Mind
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Navigating F-1 status is complex. We turn the chaos into a structured, trackable journey.
                    </p>
                </div>

                <div className="w-full max-w-3xl mx-auto">
                    {/* The re-branded component */}
                    <GlassyFeatureTags />
                </div>
            </div>
        </section>
    );
}
