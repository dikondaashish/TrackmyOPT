"use client";

export function LandingSEOContent() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left Column - What is OPT */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            What is OPT and Why Does It Matter?
                        </h2>
                        <div className="prose prose-gray prose-longform dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                <strong>Optional Practical Training (OPT)</strong> is a temporary employment
                                authorization that allows F-1 students to work in the United States for up to
                                12 months after completing their academic program. For STEM graduates, an
                                additional 24-month extension brings the total to 36 months of work authorization.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                During OPT, you must maintain employment in a position directly related to your
                                field of study. The <strong>90-day unemployment rule</strong> for initial OPT
                                (and an additional 60 days for STEM OPT holders) means you cannot be unemployed for more
                                than these limits, or you risk falling out of status.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                TrackMyOPT helps you stay compliant by automatically calculating your unemployment
                                days, sending deadline reminders, and providing all the tools you need to manage
                                your OPT journey successfully.
                            </p>
                        </div>

                        {/* Quick Facts */}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-zinc-700/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">12 mo</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Initial OPT duration</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-700/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+24 mo</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">STEM extension</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-700/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">90 days</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unemployment limit</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-700/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+60 days</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Additional STEM allowance</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Why TrackMyOPT */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Why Choose TrackMyOPT?
                        </h2>
                        <div className="space-y-6 prose-longform">
                            {[
                                {
                                    title: "Built by International Students",
                                    description:
                                        "We've been through OPT ourselves. We understand the stress, the confusion, and the high stakes. That's why we built the tool we wished existed.",
                                },
                                {
                                    title: "Trusted by 2,500+ Students",
                                    description:
                                        "Students from over 100 countries use TrackMyOPT to manage their immigration timelines. Join a community that understands your journey.",
                                },
                                {
                                    title: "Bank-Grade Security",
                                    description:
                                        "Your immigration documents deserve the highest protection. We use AES-256 encryption, the same standard used by financial institutions.",
                                },
                                {
                                    title: "Free Forever Core Features",
                                    description:
                                        "OPT timeline tracking, unemployment clock, and one case tracker are completely free. Premium adds Document Vault and unlimited cases.",
                                },
                                {
                                    title: "Proactive Notifications",
                                    description:
                                        "Get email alerts 30, 14, and 7 days before deadlines. When your USCIS case status changes, you'll know within hours.",
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mt-0.5">
                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Keywords for SEO - Hidden but crawlable */}
                <div className="mt-16 pt-12 border-t border-gray-200 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                        Frequently Searched Topics
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {[
                            "OPT timeline tracker",
                            "STEM OPT extension",
                            "F-1 visa employment",
                            "OPT unemployment days",
                            "USCIS case status",
                            "H-1B sponsor database",
                            "EAD card tracking",
                            "I-765 status check",
                            "OPT deadline calculator",
                            "International student taxes",
                            "90-day rule OPT",
                            "Cap-gap extension",
                        ].map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-sm rounded-full border border-gray-200 dark:border-zinc-600"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
