import { Metadata } from 'next';
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { ArrowLeft, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Legal Disclaimer | TrackMyOPT',
    description: 'Legal Disclaimer and Liability Statement for TrackMyOPT',
    alternates: {
        canonical: 'https://www.trackmyopt.com/disclaimer',
    },
};

export default function DisclaimerPage() {
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

                <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>

                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl p-8 md:p-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Legal Disclaimer</h1>

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

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-xl my-8">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mt-0">Crucial Warning</h3>
                                        <p className="text-yellow-800 dark:text-yellow-300 mb-0">
                                            We are NOT attorneys, and this is NOT legal advice.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h2>1. Nature of Service</h2>
                            <p>
                                TrackMyOPT is a software tool designed to assist F-1 international students in organizing their OPT and STEM OPT timelines. The information, calculations, and reminders provided by TrackMyOPT are for educational and organizational purposes only.
                            </p>
                            <p>
                                <strong>We are an independent technology company, not a law firm.</strong> We are not affiliated with the U.S. Citizenship and Immigration Services (USCIS), the Department of Homeland Security (DHS), or any government agency.
                            </p>

                            <h2>2. Not Legal Advice</h2>
                            <p>
                                Nothing on our website, Chrome extension, or in our communications should be considered legal advice. Immigration laws are complex and subject to change.
                            </p>
                            <ul>
                                <li><strong>No Attorney-Client Relationship</strong>: Using TrackMyOPT does not create an attorney-client relationship between you and Zyene, Inc.</li>
                                <li><strong>Professional Counsel</strong>: You should always consult with your Designated School Official (DSO) or a qualified immigration attorney for advice specific to your situation.</li>
                            </ul>

                            <h2>3. Liability Waiver</h2>
                            <p>
                                By using TrackMyOPT, you agree that <strong>Zyene, Inc. assumes no liability</strong> for any consequences resulting from your use of the service, including but not limited to:
                            </p>
                            <ul>
                                <li>Missed filing deadlines</li>
                                <li>Rejected OPT/STEM OPT applications</li>
                                <li>Loss of F-1 status</li>
                                <li>Accrual of unemployment days</li>
                                <li>Data entry errors</li>
                            </ul>
                            <p>
                                You are solely responsible for verifying all dates and requirements with official USCIS sources and your university.
                            </p>

                            <h2>4. Dedicated Plan & Attorney Services</h2>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl my-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white m-0">Attorney Session Details</h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    If you subscribe to our <strong>Dedicated Plan</strong>, you are eligible for the following benefit:
                                </p>
                                <ul className="mt-4 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span><strong>1 Hour / 1 Session Per Month</strong>: You are entitled to one free consultation session (up to 1 hour) with a qualified immigration attorney per billing month.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 font-bold">ℹ</span>
                                        <span><strong>Third-Party Service</strong>: These attorneys are independent professionals and not employees of TrackMyOPT.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-500 font-bold">$</span>
                                        <span><strong>Additional Time</strong>: Any consultation time exceeding the included 1 hour/session per month is subject to additional fees, which are determined solely by the attorney.</span>
                                    </li>
                                </ul>
                            </div>

                            <h2>5. Accuracy of Data</h2>
                            <p>
                                While we strive for accuracy, USCIS processing times and policies change frequently. We cannot guarantee that the information surrounding H-1B sponsors, case statuses, or filing windows is 100% up-to-date at all times. Always cross-reference with <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer">uscis.gov</a>.
                            </p>

                            <hr className="my-8" />
                            <p className="text-sm">
                                If you have any questions about this disclaimer, please contact <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a>.
                            </p>
                        </div>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </main>
    );
}
