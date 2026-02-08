import { Metadata } from 'next';
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Refund Policy | TrackMyOPT',
    description: 'Refund Policy for TrackMyOPT - Transparent & Fair',
};

export default function RefundPolicyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-100 relative">
            {/* Background Vignette */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950" />
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>

            <div className="relative z-10">
                <LandingNavbar />

                <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>

                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl p-8 md:p-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Refund Policy</h1>

                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-12 uppercase tracking-widest">
                            Last Updated: January 28, 2026
                        </p>

                        <div className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:text-gray-900 dark:prose-headings:text-white 
              prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-gray-600 dark:prose-p:text-gray-400
              prose-li:text-gray-600 dark:prose-li:text-gray-400
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-hr:border-gray-200 dark:prose-hr:border-white/10">

                            <h2>1. Our Philosophy</h2>
                            <p>
                                At TrackMyOPT, we believe in transparency and fairness. We want you to be completely confident in our value before you commit financially. That's why we offer a comprehensive free trial instead of a complex refund process.
                            </p>

                            <h2>2. 7-Day Free Trial</h2>
                            <p>
                                Pro subscription plan comes with a <strong>7-Day Free Trial</strong>. Dedicated plan is billed immediately with a 14-day money-back guarantee for the first month.
                            </p>
                            <ul>
                                <li>You get full access to all features during this period.</li>
                                <li>You will <strong>NOT</strong> be charged if you cancel before the trial ends.</li>
                                <li>This 7-day period serves as your risk-free opportunity to evaluate our service.</li>
                            </ul>

                            <h2>3. No Refunds After Trial Ends</h2>
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl my-6">
                                <p className="font-bold text-red-900 dark:text-red-200 m-0">Important Policy</p>
                                <p className="text-red-800 dark:text-red-300 mt-2 m-0">
                                    Once your 7-day free trial expires and your payment is processed, we implement a strict <strong>No Refund Policy</strong>.
                                </p>
                            </div>
                            <p>
                                We do not offer refunds, pro-rated or full, for any subscription fees once charged. This applies to both monthly and annual plans.
                            </p>
                            <p>
                                <strong>Why?</strong> Since you have had full access to the platform for 7 days to test every feature, we consider the service "delivered" upon the start of the billing cycle.
                            </p>

                            <h2>4. How to Cancel</h2>
                            <p>
                                You can cancel your subscription at any time to prevent future charges.
                            </p>
                            <ul>
                                <li>Go to <strong>Settings &gt; Billing</strong> in your dashboard.</li>
                                <li>Click <strong>Cancel Subscription</strong>.</li>
                                <li>Your access will continue until the end of your current billing period.</li>
                            </ul>

                            <h2>5. Exceptions</h2>
                            <p>
                                The only exceptions to this policy are:
                            </p>
                            <ul>
                                <li><strong>Billing Errors</strong>: If you were charged due to a technical error on our end after a valid cancellation.</li>
                                <li><strong>Fraud</strong>: If the charge was fraudulent and not authorized by you.</li>
                            </ul>
                            <p>
                                In these specific cases, please contact <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a> immediately.
                            </p>

                            <hr className="my-8" />
                            <p className="text-sm">
                                By starting a subscription, you acknowledge that you have read and agree to this Refund Policy.
                            </p>
                        </div>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </main>
    );
}
