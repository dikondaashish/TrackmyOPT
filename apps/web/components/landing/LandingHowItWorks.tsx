"use client";

export function LandingHowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Create Your Account",
            description:
                "Sign up in 30 seconds with Google or email. No credit card required.",
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                </svg>
            ),
        },
        {
            number: "02",
            title: "Enter Your OPT Dates",
            description:
                "Add your program end date, OPT start date, and EAD expiration. We calculate everything else.",
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
        },
        {
            number: "03",
            title: "Never Miss a Deadline",
            description:
                "Get real-time countdowns, email alerts, and smart reminders before critical dates.",
            icon: (
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="prose-longform text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full mb-4">
                        How It Works
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Get Started in{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                            3 Simple Steps
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        No complicated setup. Just enter your dates and let TrackMyOPT handle the rest.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector Line (hidden on mobile) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-zinc-600" />
                            )}

                            <div className="prose-longform relative bg-white dark:bg-zinc-800 rounded-2xl p-8 border border-gray-200 dark:border-zinc-700 hover:shadow-lg transition-shadow">
                                {/* Step Number */}
                                <div className="absolute -top-4 left-8 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-full">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mt-2">
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <a
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-xl shadow-gray-900/20"
                    >
                        Start Tracking Now
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
