import { Metadata } from 'next';
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { ArrowLeft, Cookie } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Cookie Policy | TrackMyOPT',
    description: 'Cookie Policy for TrackMyOPT - How we handle your data',
    alternates: {
        canonical: 'https://www.trackmyopt.com/cookie-policy',
    },
};

export default function CookiePolicyPage() {
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
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">Cookie Policy</h1>
                        </div>

                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-12 uppercase tracking-widest pl-1">
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

                            <h2>1. What Are Cookies?</h2>
                            <p>
                                Cookies are small text files that are stored on your device (computer or mobile phone) when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
                            </p>

                            <h2>2. How We Use Cookies</h2>
                            <p>
                                At TrackMyOPT, we use cookies sparingly and only for essential functions. We do <strong>NOT</strong> use cookies for third-party advertising or non-essential tracking.
                            </p>

                            <h3>2.1 Essential Cookies (Strictly Necessary)</h3>
                            <p>
                                These cookies are necessary for the website to function and cannot be switched off.
                            </p>
                            <ul>
                                <li><strong>Supabase Auth</strong>: We use Supabase for authentication. When you log in, a cookie is stored to maintain your secure session. This ensures you don't have to log in every time you refresh the page.</li>
                                <li><strong>Session Security</strong>: These cookies help prevent Cross-Site Request Forgery (CSRF) attacks to keep your data safe.</li>
                            </ul>

                            <h3>2.2 Functional Cookies</h3>
                            <p>
                                These cookies enable the website to provide enhanced functionality and personalization.
                            </p>
                            <ul>
                                <li><strong>Theme Preference</strong>: We may store a cookie to remember if you prefer "Light Mode" or "Dark Mode."</li>
                            </ul>

                            <h2>3. What We Do NOT Use</h2>
                            <p>
                                We value your privacy. Unlike many other sites, <strong>we do NOT use</strong>:
                            </p>
                            <ul>
                                <li>Google Analytics tracking cookies</li>
                                <li>Facebook Pixel or social media tracking</li>
                                <li>Advertising or retargeting cookies</li>
                            </ul>

                            <h2>4. Managing Cookies</h2>
                            <p>
                                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
                            </p>

                            <h2>5. Updates to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
                            </p>

                            <hr className="my-8" />
                            <p className="text-sm">
                                For more information on how we handle your data, please read our <Link href="/privacy">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </main>
    );
}
