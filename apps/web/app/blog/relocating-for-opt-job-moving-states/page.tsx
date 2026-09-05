import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Relocating for Your OPT Job: Moving States Checklist for F-1 Students | TrackMyOPT",
    description: "Got an OPT job in a different state? Follow this immigration-safe moving checklist: address updates, SEVIS reporting, new driver's license, and more.",
    keywords: ["Relocate OPT job", "Move states F1 student", "Address change OPT", "SEVP address update", "Moving for OPT"],
    openGraph: {
        title: "The Complete Relocation Checklist for OPT Workers",
        description: "Moving from your college town to a new city for your OPT job? Do not forget the mandatory SEVIS address update. Here is the full checklist.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/relocating-for-opt-job-moving-states",
        images: [{ url: "/blog/relocating-for-opt-job-moving-states.jpg", width: 1200, height: 630, alt: "Moving boxes with a laptop showing apartment listings and a US map with a route drawn" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/relocating-for-opt-job-moving-states" },
    twitter: {
        card: "summary_large_image",
        title: "The Complete Relocation Checklist for OPT Workers",
        description: "Moving from your college town to a new city for your OPT job? Do not forget the mandatory SEVIS address update. Here is the full checklist.",
        images: ["/blog/relocating-for-opt-job-moving-states.jpg"],
    },
};

export default function RelocatingPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-05-04" modifiedDate="2026-05-04" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Life in US</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Relocating for Your OPT Job: Moving States Checklist</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Got an OPT job in a different state? Follow this immigration-safe moving checklist to ensure you don't accidentally violate your F-1 status during the move.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/relocating-for-opt-job-moving-states.jpg" alt="Moving boxes with a laptop showing apartment listings and a US map with a route drawn" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">Congratulations on landing your OPT job! But there is a catch: the job is in San Francisco, and you went to school in Boston. Moving across the country as an international student involves a lot more than just packing boxes. Here is the immigration-critical checklist you must follow.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The 10-Day Address Update Rule</h2>
                <p>Under federal immigration law, you are required to update your physical US address with both <strong>USCIS (via AR-11 form)</strong> and <strong>SEVP (via the SEVP Portal)</strong> within <strong>10 days</strong> of moving to a new address. This is not optional—failure to comply can be grounds for SEVIS termination.</p>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> This Is a Legal Requirement</h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">Under INA Section 265, every noncitizen must report an address change within 10 days using USCIS Form AR-11 (online at uscis.gov). Additionally, OPT students must update their address in the SEVP Portal. Missing this deadline can result in deportation proceedings.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Your Complete Relocation Checklist</h2>
                <div className="space-y-4 my-8">
                    {[
                        { title: "Update your address in the SEVP Portal", desc: "Log into the SEVP Portal and update your physical address within 10 days of moving." },
                        { title: "File Form AR-11 with USCIS", desc: "Go to uscis.gov and file the AR-11 online. It takes 5 minutes and is free." },
                        { title: "Notify your DSO", desc: "Email your school's International Student Office. They may need to update your SEVIS record as well." },
                        { title: "Get a new state driver's license", desc: "Most states require you to get a new license within 30-60 days of establishing residency." },
                        { title: "Register your car in the new state", desc: "If you own a car, you must register it and get new plates (usually within 30 days)." },
                        { title: "Update your employer's records", desc: "Give HR your new address for W-2 and tax purposes." },
                        { title: "Forward your mail via USPS", desc: "Set up mail forwarding at usps.com so you don't miss any USCIS or immigration notices." },
                        { title: "Update your bank address", desc: "Banks use your address for verification. Update it to avoid account freezes." },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div><p className="font-bold mb-1 text-sm">{item.title}</p><p className="text-xs text-gray-500 dark:text-gray-400 mb-0">{item.desc}</p></div>
                        </div>
                    ))}
                </div>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> TrackMyOPT Keeps You on Track</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Moving is chaotic enough without worrying about immigration deadlines. <strong>TrackMyOPT</strong> sends you automated reminders for address update deadlines, tracks your SEVIS reporting, and stores all your documents securely in the cloud—so no matter where you move, your immigration file travels with you.</p>
                </div>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Move with Confidence</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">TrackMyOPT makes sure you never miss an immigration deadline during your relocation. Automated alerts, document storage, and compliance tracking—all in one place.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/opt-reporting-requirements-dso" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">OPT Reporting Requirements</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Address changes are just one of many mandatory reporting requirements on OPT.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/renting-apartment-without-us-credit-history" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Renting Without Credit History</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Moving to a new city? Learn how to rent an apartment without US credit history.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
