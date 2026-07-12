import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, Car, ShieldCheck, FileText, MapPin, IdCard } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Getting a US Driver's License on OPT: State-by-State Requirements | TrackMyOPT",
    description: "Learn how F-1 international students on OPT can get a US driver's license. State-specific rules, required documents, REAL ID compliance, and renewal tips.",
    keywords: ["Driver license international student", "OPT driver license", "F1 student driving", "REAL ID F1 visa", "DMV documents international student"],
    openGraph: {
        title: "How to Get a US Driver's License on OPT (2026 Guide)",
        description: "Every state has different DMV requirements for F-1 students. Learn what documents to bring and how to get a REAL ID-compliant license.",
        type: "article",
        url: "https://trackmyopt.com/blog/drivers-license-opt-state-requirements",
        images: [{ url: "/blog/drivers-license-opt-state-requirements.jpg", width: 1200, height: 630, alt: "US driver's license with REAL ID gold star next to an I-20 and passport" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/drivers-license-opt-state-requirements" }
};

export default function DriversLicensePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-12" modifiedDate="2026-07-12" author="TrackMyOPT Team" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Life in US</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Practical Guide</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Getting a US Driver's License on OPT: State-by-State Requirements</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Every state has different DMV rules for F-1 students. Learn what documents to bring, how to get a REAL ID-compliant license, and what happens when your EAD expires.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/drivers-license-opt-state-requirements.jpg" alt="US driver's license with REAL ID gold star next to an I-20 and passport" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">A US driver's license is more than just a license to drive. It is your primary form of identification in America. You will use it to open bank accounts, pick up packages, enter bars, board domestic flights (if REAL ID compliant), and verify your identity at job interviews. Here is how F-1 students on OPT can get one.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Documents You Need to Bring to the DMV</h2>
                <p>While every state's DMV has slightly different requirements, most will ask for the following:</p>
                <ul>
                    <li><strong>Valid foreign passport</strong> (must be unexpired).</li>
                    <li><strong>I-94 Arrival/Departure Record</strong> (print from cbp.gov).</li>
                    <li><strong>Valid I-20</strong> or <strong>EAD card</strong> (proving your legal status in the US).</li>
                    <li><strong>Social Security Number (SSN)</strong> or an SSA denial letter (if you don't have one yet).</li>
                    <li><strong>Two proofs of residency</strong> (utility bill, bank statement, lease agreement).</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2"><AlertTriangle className="w-5 h-5" /> The "Limited Term" License</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">Because you are a temporary resident, your driver's license will be marked as "Limited Term" and will expire on the same date as your I-20 or EAD card. When you get a STEM OPT extension, you must go back to the DMV to extend your license. <strong>Bring your new EAD card.</strong></p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">State-Specific Highlights</h2>
                <div className="overflow-x-auto my-8">
                    <table className="min-w-full text-sm">
                        <thead><tr className="border-b border-gray-200 dark:border-zinc-700">
                            <th className="text-left py-3 px-4 font-bold">State</th>
                            <th className="text-left py-3 px-4 font-bold">SSN Required?</th>
                            <th className="text-left py-3 px-4 font-bold">Notes</th>
                        </tr></thead>
                        <tbody>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">California</td><td className="py-3 px-4">No (SSA denial letter accepted)</td><td className="py-3 px-4">AB-60 license available regardless of status</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Texas</td><td className="py-3 px-4">Yes (SSN or SSA denial)</td><td className="py-3 px-4">Appointment required via DPS website</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">New York</td><td className="py-3 px-4">No</td><td className="py-3 px-4">Standard license does not require SSN</td></tr>
                            <tr className="border-b border-gray-100 dark:border-zinc-800"><td className="py-3 px-4 font-medium">Illinois</td><td className="py-3 px-4">Yes (for REAL ID)</td><td className="py-3 px-4">TVDL available without SSN</td></tr>
                            <tr><td className="py-3 px-4 font-medium">Florida</td><td className="py-3 px-4">Yes</td><td className="py-3 px-4">Must show I-94 and valid EAD</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Store Your License Digitally</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Your limited-term license expires when your EAD expires. Set a reminder with <strong>TrackMyOPT</strong> to renew your license when you receive your STEM OPT extension EAD. Our Document Safe also lets you securely store a digital copy of your license alongside your I-20, EAD, and passport for quick reference.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can You Use Your Home Country License?</h2>
                <p>In most states, you can drive with your foreign driver's license for a limited time (usually 30-90 days) after arriving. After that, you must get a US license. Some states accept an International Driving Permit (IDP) alongside your foreign license, but an IDP is never a substitute for a US license.</p>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Never Miss an Expiration Date</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Your license, EAD, and I-20 all have different expiration dates. TrackMyOPT helps you track all of them with automated reminders and a secure document vault.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your Documents</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/real-id-domestic-flights-international-students" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">REAL ID and Domestic Travel</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Learn why you need a REAL ID-compliant license to fly domestically starting May 2025.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/buying-car-international-student-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Buying a Car on OPT</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Now that you have a license, learn how to finance and buy a car as an international student.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
