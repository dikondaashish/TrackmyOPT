"use client";

import Testimonials from "../ui/twitter-testimonial-cards";

export function LandingTestimonials() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden" id="testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        Don't Just Take Our Word For It
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join 15,000+ international students who use TrackMyOPT to secure their future in the United States.
                    </p>
                </div>

                {/* New Interactive Stacked Cards */}
                <div className="flex justify-center w-full px-4 overflow-visible">
                    <div className="scale-[0.6] sm:scale-75 md:scale-90 origin-top">
                        <Testimonials />
                    </div>
                </div>
            </div>
        </section>
    );
}
