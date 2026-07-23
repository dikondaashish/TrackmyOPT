import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, HeartPulse, CheckCircle2, ShieldCheck, Heart, UserPlus, Phone } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Dealing with OPT Anxiety: Mental Health Resources for International Students | TrackMyOPT",
    description: "The 90-day unemployment clock, H-1B lotteries, and visa renewals create immense stress. Learn how to manage OPT anxiety and find accessible mental health support.",
    keywords: ["OPT anxiety", "International student mental health", "H1B stress", "F1 student depression", "US immigration anxiety", "Mental health support F1"],
    openGraph: {
        title: "Managing the Silent Struggle of OPT Anxiety",
        description: "The ticking unemployment clock and the H-1B lottery take a severe toll on international students' mental health. Here is how to cope and find support.",
        type: "article",
        url: "https://trackmyopt.com/blog/opt-anxiety-mental-health-international-students",
        images: [{ url: "/blog/opt-anxiety-mental-health-international-students.jpg", width: 1200, height: 630, alt: "A calm desk setup with a journal, herbal tea, and a smartphone showing a mindfulness app" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/opt-anxiety-mental-health-international-students" }
};

export default function OPTAnxietyPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-04-09" modifiedDate="2026-04-09" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Mental Health</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Community</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Dealing with OPT Anxiety: The Silent Struggle</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">The ticking 90-day unemployment clock, H-1B lotteries, and constant visa uncertainty create immense stress. You are not alone. Here is how to manage OPT anxiety.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/opt-anxiety-mental-health-international-students.jpg" alt="A calm desk setup with a journal, herbal tea, and a smartphone showing a mindfulness app" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">No one warns you about the emotional toll of the US immigration system. The moment you graduate, a literal countdown clock begins. You have 90 days to find a job in a brutal market, all while answering to family expectations back home and facing the looming uncertainty of a random H-1B lottery. It is entirely normal to feel overwhelmed.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Unique Stressors of F-1 Status</h2>
                <p>Domestic students stress about finding a <em>good</em> job. International students stress about finding a job that will prevent their deportation. The mental health burden includes:</p>
                <ul>
                    <li><strong>The 90-Day Clock:</strong> The daily dread of watching your unemployment days tick down.</li>
                    <li><strong>The "Sponsorship" Rejection:</strong> Getting to the final round of interviews only to be rejected when they find out you need an H-1B.</li>
                    <li><strong>Financial Guilt:</strong> The pressure of paying off massive international tuition loans.</li>
                    <li><strong>The Lottery Trauma:</strong> Knowing your entire future in the US relies on a random computer drawing in March.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">Actionable Coping Strategies</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">1. Separate Your Worth from Your Visa Status</h3>
                <p>It is easy to internalize corporate rejections. Remember that when a company says "no" because of sponsorship, they are rejecting the US immigration system's bureaucracy, not your talent, intelligence, or worth.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">2. Build a "Control" Inventory</h3>
                <p>Anxiety thrives on uncertainty. Combat it by clearly separating what you can control from what you cannot.</p>
                <ul>
                    <li><strong>Cannot Control:</strong> The job market, H-1B lottery results, USCIS processing times.</li>
                    <li><strong>Can Control:</strong> Your daily networking outreach, upskilling, your resume quality, and your backup plans (O-1, Canada PR, L-1).</li>
                </ul>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Automate the Anxiety Away</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Constantly checking SEVP and manually calculating your unemployment days feeds anxiety. <strong>TrackMyOPT</strong> automates this. We track your days, remind you of deadlines, and store your documents securely, so you can stop obsessing over compliance and focus on your well-being.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Where to Find Support</h2>
                <p>If you are struggling with depression, severe anxiety, or panic attacks, professional help is available and confidential. (Seeking therapy does <em>not</em> affect your visa status or background checks in any way).</p>
                <ul>
                    <li><strong>Your Employer's EAP:</strong> Most corporate benefits include an Employee Assistance Program (EAP) that offers 3-5 free, confidential therapy sessions.</li>
                    <li><strong>University Alumni Resources:</strong> Many universities extend telehealth counseling services to recent alumni on OPT for a limited time.</li>
                    <li><strong>Crisis Text Line:</strong> Text HOME to 741741 to connect with a crisis counselor 24/7 (free and confidential in the US).</li>
                </ul>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-400 mt-0 mb-2"><Heart className="w-5 h-5" /> You Are Not Alone</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mb-0">Every single international student working in the US has felt this exact same anxiety. Reach out to F-1 alumni from your university. Build a community of people who understand what the H-1B struggle actually feels like.</p>
                </div>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Regain Control of Your OPT</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Don't let compliance anxiety rule your life. TrackMyOPT provides the exact calculations and automated reminders you need to sleep soundly at night.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/60-day-grace-period-f1-students" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Understanding the 60-Day Grace Period</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Even if you run out of unemployment days, you still have a 60-day grace period to make a plan.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/h1b-visa-alternatives-opt-expires" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">H-1B Visa Alternatives</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Having a solid backup plan is the best way to reduce anxiety. Explore O-1, L-1, and Canada options.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
