import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, Key, Info, Laptop, User } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "SEVP Portal Complete Guide: Setup, Unlock & Reporting for OPT & STEM OPT (2026)",
    description: "Learn how to set up your SEVP Portal account, unlock your profile, reset your password, and report address or employment changes for OPT and STEM OPT compliance.",
    keywords: ["SEVP portal", "SEVP portal reset", "OPT reporting", "SEVP portal unlock", "SEVP portal email", "STEM OPT reporting", "SEVP account help"],
    openGraph: {
        title: "SEVP Portal Complete Guide: Setup, Unlock & Reporting | TrackMyOPT",
        description: "Step-by-step guide on how to register, unlock, and manage your SEVP portal account to stay in status during your OPT and STEM OPT period.",
        url: "https://www.trackmyopt.com/blog/sevp-portal-guide-opt",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/sevp-portal-guide.png",
                width: 1200,
                height: 630,
                alt: "Laptop screen showing account settings dashboard on a clean desk",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/sevp-portal-guide-opt",
    },
    twitter: {
        card: "summary_large_image",
        title: "SEVP Portal Complete Guide: Setup, Unlock & Reporting | TrackMyOPT",
        description: "Step-by-step guide on how to register, unlock, and manage your SEVP portal account to stay in status during your OPT and STEM OPT period.",
        images: ["/blog/sevp-portal-guide.png"],
    },
};

export default function SEVPortalGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "SEVP Portal Guide", url: "https://www.trackmyopt.com/blog/sevp-portal-guide-opt" },
            ]} />
            <BlogPostSchema
                title="SEVP Portal Complete Guide: Setup, Unlock & Reporting for OPT & STEM OPT"
                description="Ultimate step-by-step guide for setting up, unlocking, and managing your SEVP Portal account to report OPT compliance events."
                publishedDate="2026-05-20"
                modifiedDate="2026-05-20"
                author="Vinay Kumar"
                faqItems={[
                    { question: "How do I get an SEVP Portal registration email?", answer: "Once your OPT application is approved by USCIS and your OPT start date arrives, the Student and Exchange Visitor Program (SEVP) automatically emails a registration link to your school's registered email address. The email comes from do-not-reply.sevp@ice.dhs.gov." },
                    { question: "What do I do if my SEVP Portal account is locked?", answer: "If your account is locked due to too many failed login attempts, you must contact your school's Designated School Official (DSO). Only your DSO can send a portal reset or profile unlocking request to SEVP on your behalf." },
                    { question: "How long do I have to report changes in the SEVP portal?", answer: "Under federal regulations, you must report any change to your residential address, phone number, employer name, or employer address within 10 days of the change." },
                    { question: "Do STEM OPT students report everything in the SEVP portal?", answer: "No. While STEM OPT students can report basic profile updates in the portal, any additions or changes of employers must be submitted directly to the DSO using Form I-983, not just edited in the portal." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">SEVP Portal Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        F-1 Rules
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        11 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    SEVP Portal Complete Guide: Setup, Unlock & Reporting for OPT & STEM OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The Student and Exchange Visitor Portal (SEVP Portal) is the federal government&apos;s direct reporting system for F-1 OPT students. Failing to set up your account or report within 10 days can result in SEVIS termination. Here is how to keep your record in status.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 20, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800">
                    <BlogPostImage src="/blog/sevp-portal-guide.png" alt="Laptop screen showing account settings dashboard on a clean desk" className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" sizes="(max-width: 768px) 100vw, 768px" priority />
                </div>
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Your SEVP Portal access is tied directly to your active SEVIS record. Keep your login information secure.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The <strong>SEVP Portal</strong> is where you report your address and employer info to the government during OPT. You will receive an invitation email from <strong>do-not-reply.sevp@ice.dhs.gov</strong> once your OPT is approved and starts. You must update your info in the portal within <strong>10 days</strong> of any change. If locked out, contact your school&apos;s DSO immediately to reset it.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Updating the SEVP Portal is a mandatory legal requirement under 8 CFR § 214.2(f)(12). Keep your profile current to avoid automatic SEVIS cancellation by the Department of Homeland Security.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://sevp.ice.gov/opt/#/login" target="_blank" rel="noopener noreferrer" className="underline">Official SEVP Portal Login</a>
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#how-it-works", "How the SEVP Portal Works"],
                        ["#creation-steps", "Step-by-Step Account Registration"],
                        ["#reporting-rules", "Reporting Requirements: The 10-Day Rule"],
                        ["#locked-out", "Locked Out? Password Resets & Unlock Guide"],
                        ["#stem-opt-differences", "SEVP Portal Rules for STEM OPT Students"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="how-it-works" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How the SEVP Portal Works
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The SEVP Portal is a secure website managed by the US Department of Homeland Security (DHS). It allows students on OPT and STEM OPT to report their home addresses, phone numbers, and employer details directly without needing their DSO to log every minor detail manually in SEVIS.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                What You Can Update
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Residential home address</li>
                                <li>• Primary mailing address</li>
                                <li>• Personal telephone number</li>
                                <li>• Regular OPT employer information</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                What You CANNOT Update
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Legal name or birth date</li>
                                <li>• Major or degree level</li>
                                <li>• Program extension requests</li>
                                <li>• STEM OPT employer additions</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="creation-steps" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step Account Registration
                    </h2>
                    <div className="space-y-4">
                        {[
                            { step: "1", title: "Wait for USCIS Approval", desc: "You cannot register until your Form I-765 is approved by USCIS and your OPT period is active." },
                            { step: "2", title: "Check for Invitation Email", desc: "Check your university email or personal inbox for an invitation from do-not-reply.sevp@ice.dhs.gov. Be sure to check your spam/junk folder." },
                            { step: "3", title: "Complete Activation Within 30 Days", desc: "The link in the invitation email expires exactly 30 days after it is sent. Click the link, input your SEVIS ID, and set up your password immediately." },
                            { step: "4", title: "Log In & Verify Information", desc: "Sign in at sevp.ice.gov/opt. Check that your current legal name and OPT start/end dates match your approved EAD card." },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold flex-shrink-0">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="reporting-rules" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Reporting Requirements: The 10-Day Rule
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Homeland Security regulations specify that you must report all changes to your address or work status <strong>within 10 days</strong>. If you do not report your employment, the system will continue to deduct your 90 days of allowed unemployment.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-4 text-amber-900 dark:text-amber-100">
                        <div className="flex gap-2">
                            <Info className="w-5 h-5 flex-shrink-0 text-amber-600" />
                            <div>
                                If you exceed 90 days of cumulative unemployment without reporting your job details, DHS may automatically terminate your SEVIS record, putting you out of F-1 status.
                            </div>
                        </div>
                    </div>
                </section>

                <section id="locked-out" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Locked Out? Password Resets & Unlock Guide
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Account lockouts occur frequently due to password expiration (required every 90 days) or three consecutive failed password entry attempts.
                    </p>
                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                            <Key className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-950 dark:text-white">Self-Service Reset</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">If your account is simply locked but not deleted, use the &apos;Forgot Password&apos; link on the login page to send a reset link to your email.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                            <User className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-950 dark:text-white">Contacting Your DSO</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">If the self-service reset fails or your account remains disabled, email your school&apos;s DSO. They can access SEVIS and request a manual unlock or issue a new registration invitation.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="stem-opt-differences" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        SEVP Portal Rules for STEM OPT Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Students on the 24-month STEM OPT extension face stricter reporting regulations:
                    </p>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
                        <li><strong>Form I-983 required:</strong> You cannot add a new STEM OPT employer directly in the portal. You must first submit a signed Form I-983 to your DSO, who will manually enter the employer details.</li>
                        <li><strong>6-Month Validation Reports:</strong> You must submit validation reports to your DSO every 6 months confirming your status and employment details, even if nothing has changed.</li>
                        <li><strong>Annual Evaluations:</strong> You must submit annual evaluations (page 5 of Form I-983) to your DSO at the 12-month mark and at the end of your STEM OPT period.</li>
                    </ul>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Laptop className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Simplify Your OPT Compliance</h3>
                        </div>
                        <p className="text-blue-100 mb-6 text-lg max-w-2xl">
                            TrackMyOPT helps you log and verify your employment records so you never fall out of status. Get reminders when it&apos;s time to report changes.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "What should I do if I don't receive the portal email?", answer: "Confirm that your DSO has updated your active status in SEVIS. If they did, ask them to check which email address is registered. They can also request SEVP to re-send the welcome email." },
                            { question: "Can my employer update the portal for me?", answer: "No. The SEVP portal account is strictly personal. You are legally responsible for all submissions and updates on your profile." },
                            { question: "Will I get a new I-20 after making an update?", answer: "Yes, you should request an updated I-20 from your DSO after changing employers to show the updated employment details on page 2." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/opt-reporting-requirements-dso" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Reporting Requirements Guide</Link>
                    <Link href="/blog/can-you-work-remotely-on-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Remote Work on OPT Rules</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
