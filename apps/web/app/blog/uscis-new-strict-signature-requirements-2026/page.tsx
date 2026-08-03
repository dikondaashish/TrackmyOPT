import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "USCIS Strict Signature Requirements 2026: Avoid Rejection | TrackMyOPT",
    description: "USCIS has implemented stricter signature requirements for all applications, including Form I-765. Learn how to sign correctly to avoid instant denial.",
    keywords: ["USCIS signature rules 2026", "Form I-765 signature", "USCIS rejection invalid signature", "OPT application signature", "STEM OPT signature"],
    openGraph: {
        title: "USCIS Strict Signature Requirements 2026",
        description: "USCIS is now rejecting applications with invalid signatures. Make sure your Form I-765 is signed perfectly.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/uscis-new-strict-signature-requirements-2026",
        images: [
            {
                url: "/blog/uscis-new-strict-signature-requirements-2026.png",
                width: 1200,
                height: 630,
                alt: "Fountain pen signing a government document",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/uscis-new-strict-signature-requirements-2026",
    }
};

const faqItems = [
    {
        question: "Can I use an electronic signature on my paper OPT application?",
        answer: "No. If you are mailing a paper Form I-765, you must use a wet ink signature. Typed or drawn digital signatures on printed forms will result in a rejection."
    },
    {
        question: "How do I sign if I file Form I-765 online?",
        answer: "When filing online through myUSCIS, you will electronically type your name into the designated signature field before submission. This is the only acceptable electronic signature."
    },
    {
        question: "What happens if my OPT application is rejected for a signature error?",
        answer: "If rejected, USCIS returns the entire application. If your 60-day or 30-day grace period has passed by the time you receive the rejection, you will lose your OPT eligibility entirely."
    }
];

export default function USCISSignaturePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "USCIS Strict Signature Requirements", url: "https://www.trackmyopt.com/blog/uscis-new-strict-signature-requirements-2026" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-07-16"
                modifiedDate="2026-07-16"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
                faqItems={faqItems}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance Update</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">July 2026</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Don't Get Denied: Navigate USCIS's New Strict Signature Rules for OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    A simple signature mistake can now cost you your OPT. Learn about the July 10, 2026 USCIS policy update and how to sign your Form I-765 correctly.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 5 min read</span>
                    <span>•</span>
                    <span>July 16, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/uscis-new-strict-signature-requirements-2026.png"
                    alt="Fountain pen signing a government document"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary hover:prose-a:text-blue-700">
                <p>
                    Effective July 10, 2026, U.S. Citizenship and Immigration Services (USCIS) has implemented significantly stricter signature requirements across all immigration forms, including <Link href="/blog/form-i765-ead-application-guide">Form I-765 for OPT and STEM OPT applications</Link>.
                </p>
                <p>
                    Previously, if a signature was missing or improper, USCIS might issue a Request for Evidence (RFE) to give the applicant a chance to correct it. Under the new policy, USCIS will <strong>outright reject or deny</strong> the petition. 
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 my-8 rounded-r-xl">
                    <h3 className="text-red-800 dark:text-red-300 m-0 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        The Risk to OPT Students
                    </h3>
                    <p className="text-red-900 dark:text-red-200/80 m-0">
                        If your OPT application is rejected due to a signature error and your 60-day grace period has expired (or the upcoming 30-day grace period), you will not be able to re-file. You will lose your OPT eligibility entirely.
                    </p>
                </div>

                <h2>What Are the New Signature Rules?</h2>
                <p>
                    USCIS requires a valid signature on all applications, petitions, and requests. A valid signature must meet these criteria:
                </p>
                <ul>
                    <li>It must be a handwritten mark or sign.</li>
                    <li>It must be personally signed by the applicant (no one else can sign for you, unless you are under 14 or mentally incompetent).</li>
                    <li>If filing electronically, it must follow the specific electronic signature prompts on the myUSCIS portal.</li>
                </ul>

                <div className="grid sm:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-xl shadow-sm">
                        <XCircle className="w-8 h-8 text-red-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2 text-red-900 dark:text-red-300">Invalid Signatures (DO NOT USE)</h3>
                        <ul className="text-sm space-y-2 text-red-800 dark:text-red-200/80">
                            <li>• Typewritten names (even in cursive fonts) on printed forms</li>
                            <li>• Stamped signatures</li>
                            <li>• Digital signatures drawn with a mouse on a PDF (for paper filings)</li>
                            <li>• Signatures by a parent, spouse, or DSO</li>
                        </ul>
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-6 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2 text-green-900 dark:text-green-300">Valid Signatures</h3>
                        <ul className="text-sm space-y-2 text-green-800 dark:text-green-200/80">
                            <li>• Wet ink signature (black ink preferred) on paper forms</li>
                            <li>• Typing your name in the designated electronic signature box on myUSCIS (when filing online)</li>
                        </ul>
                    </div>
                </div>

                <h2>How to Ensure Compliance for OPT</h2>
                <p>
                    Most students now file Form I-765 online. When filing online, the electronic signature process is built into the system. You simply type your name when prompted at the end of the application. <strong>Make sure the name you type exactly matches the name on your application.</strong>
                </p>
                <p>
                    However, you still have paper documents that require wet signatures:
                </p>
                <ol>
                    <li><strong>Form I-20:</strong> You must print your new OPT-endorsed I-20 sent by your DSO, sign the bottom of page 1 in <strong>blue or black ink</strong>, and scan it back in before uploading it to USCIS. Do not sign it digitally.</li>
                    <li><strong>Form I-983 (STEM OPT only):</strong> The Training Plan must be signed in wet ink or using a compliant e-signature software by both you and your employer.</li>
                </ol>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white my-12 shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-4 mt-0">Prepare for Your OPT Successfully</h3>
                    <p className="text-blue-100 mb-6 text-lg">
                        Use TrackMyOPT to track your application status, manage deadlines, and stay on top of the latest USCIS rules.
                    </p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                        Create Your Free Account <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <section className="mb-12 mt-12 not-prose">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <AuthorBio />
            </div>
        </article>
    );
}
