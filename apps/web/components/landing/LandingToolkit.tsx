import { HeartPulse, FileText, ArrowRight, Gift, Shield } from "lucide-react";

export function LandingToolkit() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="prose-longform mb-16 md:text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Essential Tools for F-1 OPT Students
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        We built the specific tools you need to survive the confusing parts of international student life. Included free.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Health Insurance Card */}
                    <div className="prose-longform group relative overflow-hidden surface-card p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-300">
                                <HeartPulse className="w-8 h-8" />
                            </div>
                            <span className="rounded-md bg-surface-strong px-2 py-0.5 text-xs font-medium text-muted-foreground">Dashboard tool</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Health Insurance Finder
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            University plans are expensive. Our finder tool compares ACA-compliant plans specifically for F-1/OPT students to save you thousands.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                            Find Plans <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Tax Filing Card */}
                    <div className="prose-longform group relative overflow-hidden surface-card p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                                <FileText className="w-8 h-8" />
                            </div>
                            <span className="rounded-md bg-surface-strong px-2 py-0.5 text-xs font-medium text-muted-foreground">Dashboard tool</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Tax Filing Assistant
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            "Am I a resident alien yet?" Stop guessing. Our built-in assistant helps you determine your status and file Form 8843 correctly.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                            Start Filing <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Partner Perks Card */}
                    <div className="prose-longform group relative overflow-hidden surface-card p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-300">
                                <Gift className="w-8 h-8" />
                            </div>
                            <span className="rounded-md bg-surface-strong px-2 py-0.5 text-xs font-medium text-muted-foreground">Exclusive deals</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Student Savers Club
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Unlock exclusive discounts on gas, food, and essentials. We partner with brands to help you save $100s/month while studying.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                            View Deals <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Document Vault Card (New 4th Card) */}
                    <div className="prose-longform group relative overflow-hidden surface-card p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-300">
                                <Shield className="w-8 h-8" />
                            </div>
                            <span className="rounded-md bg-surface-strong px-2 py-0.5 text-xs font-medium text-muted-foreground">Compliance tool</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Smart Document Vault
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Never lose a critical document. Securely store I-20s, EADs, and offer letters with AI extraction to auto-fill your profile.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                            Secure Docs <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
