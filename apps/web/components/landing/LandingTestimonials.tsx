"use client";

const testimonials = [
    {
        quote:
            "TrackMyOPT saved my OPT status. I was about to exceed my unemployment days without realizing it. The alerts gave me enough time to find a job.",
        name: "Priya Sharma",
        title: "Software Engineer",
        university: "Georgia Tech",
        avatar: "PS",
        color: "from-blue-500 to-indigo-500",
    },
    {
        quote:
            "The H-1B sponsor database is incredible. I found my current employer there — they had a 95% approval rate. Now I have my H-1B!",
        name: "Chen Wei",
        title: "Data Scientist",
        university: "UCLA",
        avatar: "CW",
        color: "from-purple-500 to-pink-500",
    },
    {
        quote:
            "As an international student, managing deadlines is stressful. TrackMyOPT gives me peace of mind knowing I won't miss anything important.",
        name: "Adebayo Oluwaseun",
        title: "Product Manager",
        university: "Carnegie Mellon",
        avatar: "AO",
        color: "from-green-500 to-emerald-500",
    },
];

export function LandingTestimonials() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full mb-4">
                        Testimonials
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Loved by{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            Students Worldwide
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Join thousands of international students who trust TrackMyOPT for their OPT journey.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-800/50 rounded-2xl p-8 border border-gray-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
                        >
                            {/* Quote */}
                            <div className="mb-6">
                                <svg
                                    className="w-8 h-8 text-gray-300 dark:text-zinc-600"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                >
                                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}
                                >
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {testimonial.title} • {testimonial.university}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 lg:p-12">
                    {[
                        { value: "15,000+", label: "Active Users" },
                        { value: "50,000+", label: "Cases Tracked" },
                        { value: "80,000+", label: "H-1B Sponsors" },
                        { value: "100+", label: "Countries" },
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <p className="text-3xl lg:text-4xl font-bold text-white mb-1">
                                {stat.value}
                            </p>
                            <p className="text-blue-100 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
