import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "HSI Is Cracking Down on OPT Fraud: What Every Legitimate OPT/STEM OPT Student Must Know (2026)",
    description: "The Department of Homeland Security has identified 10,000+ foreign students connected to suspected fraudulent OPT employers. If you are on OPT or STEM OPT, here is how to verify your employer is legitimate and protect yourself from consequences.",
    keywords: [
        "HSI OPT fraud investigation 2026",
        "USCIS OPT fraud crackdown",
        "fake OPT employer fraud",
        "OPT employer verification",
        "STEM OPT employer requirements",
        "phantom OPT employer",
        "OPT fraud consequences for students",
        "legitimate OPT employer checklist",
        "HSI DHS immigration investigation",
        "how to verify OPT employer",
        "OPT compliance 2026",
    ],
    openGraph: {
        title: "HSI Is Cracking Down on OPT Fraud: What Legitimate OPT Students Must Know | TrackMyOPT",
        description: "DHS has identified 10,000+ students connected to suspected fraudulent OPT employers. Here's how legitimate students can verify their employer and protect their F-1 status.",
        url: "https://www.trackmyopt.com/blog/hsi-opt-fraud-crackdown-legitimate-students-guide",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "HSI OPT Fraud Crackdown: What Every Legitimate OPT Student Must Know",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/hsi-opt-fraud-crackdown-legitimate-students-guide",
    },
    twitter: {
        card: "summary_large_image",
        title: "HSI Is Cracking Down on OPT Fraud: What Legitimate OPT Students Must Know | TrackMyOPT",
        description: "DHS has identified 10,000+ students connected to suspected fraudulent OPT employers. Here's how legitimate students can verify their employer and protect their F-1 status.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

const faqItems = [
    {
        question: "What is OPT fraud and who is at risk?",
        answer: "OPT fraud occurs when an employer falsely claims to employ foreign students on OPT when no actual training or work relationship exists. Students are at risk if they are listed under an employer they never worked for, worked at a site that does not actually exist, or were 'employed' by a company that has no real business operations. Even if a student was not aware of the fraud, they can face serious immigration consequences.",
    },
    {
        question: "What is HSI and why are they investigating OPT?",
        answer: "HSI stands for Homeland Security Investigations — the principal investigative arm of the Department of Homeland Security (DHS). HSI investigates immigration fraud, including cases where companies exploit OPT work authorization to generate fraudulent billing or where students use fake employers to maintain F-1 status without genuine employment.",
    },
    {
        question: "Can I lose my F-1 status if my OPT employer turns out to be fraudulent?",
        answer: "Yes. If your OPT authorization is tied to a fraudulent employer, USCIS or your DSO may terminate your SEVIS record. This could result in loss of F-1 status, required departure from the US, bars on future visa applications, and in serious cases, criminal charges for immigration fraud. If you are unsure about your employer's legitimacy, consult an immigration attorney immediately.",
    },
    {
        question: "What red flags indicate a potentially fraudulent OPT employer?",
        answer: "Key red flags include: the employer cannot describe what you specifically do; the listed work address is a residential building or empty suite; multiple unrelated companies share the same address; all HR and management is claimed to be overseas; the employer has no verifiable web presence, business registration, or tax records; and you have never physically worked at the site or met your supervisor in person.",
    },
    {
        question: "What should I do if I suspect my current OPT employer is fraudulent?",
        answer: "Stop reporting the employer as your active workplace immediately. Contact your DSO (Designated School Official) to report the situation and update your SEVIS record. Consult an immigration attorney before taking any action that could affect your status. Do not simply stop showing up — proactively correcting the record gives you a much stronger position than being discovered in an investigation.",
    },
    {
        question: "How do I verify that an OPT employer is legitimate before accepting a job?",
        answer: "Check the company's registration with the state Secretary of State office, verify a real physical business address on Google Street View and Maps, look for the employer on LinkedIn and professional databases like D&B or Hoovers, confirm an EIN (Employer Identification Number) is present, ensure you will have a named US-based supervisor who can directly train you, and verify that the job description clearly relates to your major field of study.",
    },
];

export default function HsiOptFraudBlogPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "HSI OPT Fraud Crackdown: Legitimate Students Guide", url: "https://www.trackmyopt.com/blog/hsi-opt-fraud-crackdown-legitimate-students-guide" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-05-24"
                modifiedDate="2026-05-24"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">HSI OPT Fraud Crackdown</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                        IMPORTANT
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        11 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    HSI Is Cracking Down on OPT Fraud: What Every Legitimate OPT and STEM OPT Student Must Know in 2026
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The Department of Homeland Security has publicly identified over 10,000 foreign students connected to suspected fraudulent employers — and investigations are ongoing across eight states. If you are on OPT or STEM OPT, here is what is happening, what the red flags look like, and how to protect yourself.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 23, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Quick Answer */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    HSI (Homeland Security Investigations) has conducted site visits across Virginia, Texas, Georgia, Illinois, New York, New Jersey, North Carolina, and Florida — finding empty buildings, fake employers, and thousands of students listed under companies that do not exist. Legitimate students need to proactively verify their employers and document their employment now, not when agents knock on the door.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    This crackdown targets <strong>fraudulent employers and students</strong> — not legitimate F-1 students working real jobs. But the environment has shifted. Every OPT student should now be able to demonstrate a genuine, documentable employment relationship. If there is any doubt about your employer's legitimacy, act now.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.ice.gov/news/releases" target="_blank" rel="noopener noreferrer" className="underline">ICE / HSI Public Announcements</a>, USCIS OPT Program Requirements (8 CFR § 214.2(f))
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#what-happened", "What HSI Found: The Investigation in Plain English"],
                        ["#red-flags", "Red Flags of a Fraudulent OPT Employer"],
                        ["#consequences", "What Happens to Students Caught in Fraud"],
                        ["#protect-yourself", "How Legitimate Students Should Protect Themselves Right Now"],
                        ["#verify-employer", "How to Verify an OPT Employer Is Legitimate"],
                        ["#documents", "Documents You Should Have Ready"],
                        ["#what-if", "What to Do If You Suspect Your Employer Is Fraudulent"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href as string} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="what-happened" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What HSI Found: The Investigation in Plain English
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Homeland Security Investigations (HSI) — the investigative arm of the Department of Homeland Security — has been conducting a multi-state investigation into Optional Practical Training fraud. Their findings, announced publicly, paint a troubling picture of systematic abuse of the OPT program.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "We have identified over 10,000 foreign students who claim to be working for highly suspect employers — and that's just among the top 25 OPT employers. Fraud nationwide."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — HSI Special Agent in Charge, public announcement on OPT fraud operations
                        </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Here is what agents actually found when they visited OPT employer work sites across the country:
                    </p>

                    <div className="space-y-4 mb-6">
                        {[
                            {
                                finding: "Empty buildings and locked doors",
                                detail: "Agents visited addresses where hundreds of students were allegedly employed and found no one — just empty offices or locked suites with no signage.",
                            },
                            {
                                finding: "Multiple employers at one address",
                                detail: "In one cluster, several unrelated companies all claimed the same physical address as their place of business, none of which actually leased the facility.",
                            },
                            {
                                finding: "Residential addresses as work sites",
                                detail: "Small residential addresses were listed as work sites for hundreds of foreign students, but no employees were present.",
                            },
                            {
                                finding: "Phantom employees — students who never showed up",
                                detail: "HSI identified students who obtained valid EAD work authorization through OPT but never worked at the employer sites they were listed under.",
                            },
                            {
                                finding: "All management claimed to be offshore in India",
                                detail: "Multiple OPT employers stated that all HR, management, and payroll personnel were based overseas — a direct violation of USCIS requirements that OPT employers provide direct, on-site training.",
                            },
                            {
                                finding: "Suspicious financial activity",
                                detail: "Investigators discovered suspicious financial transactions moving cash across multiple countries, along with tax liens, civil lawsuits, and failures to maintain basic employment records.",
                            },
                            {
                                finding: "Malware-flagged websites",
                                detail: "In North Texas, one OPT employer's website was flagged by DHS firewalls as potential malware — described by investigators as a common marker of fraudulent OPT employers.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-100">{item.finding}</h3>
                                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Investigations are confirmed in: <strong>Virginia, Texas, Georgia, Illinois, New York, New Jersey, North Carolina, and Florida</strong>. HSI has explicitly stated that more actions are forthcoming.
                    </p>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mt-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">The Shifting Tone at USCIS and DHS</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            If you have visited the USCIS social media accounts recently, you may have noticed a sharp change in tone. The content has shifted heavily toward fraud enforcement, arrests, and deportations — a reflection of the current administration's posture on immigration compliance. This is not a background event. It is the active operating environment for every F-1 student in the US right now. Being proactively compliant is no longer optional — it is essential.
                        </p>
                    </div>
                </section>

                <section id="red-flags" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Red Flags of a Fraudulent OPT Employer
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Based on what HSI publicly disclosed, here are the clearest warning signs that an OPT employer may not be legitimate. If more than one of these apply to your situation, treat it as urgent.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            { flag: "No real physical office", detail: "The work address is a virtual office, coworking suite, residential address, or a building where no employees are present." },
                            { flag: "All management is overseas", detail: "Your 'supervisor' or HR contact is entirely based in India or another country and you have never met them in person." },
                            { flag: "You have never physically worked there", detail: "You received OPT authorization under the employer but have never shown up for actual work or training at their US location." },
                            { flag: "Multiple unrelated companies at the same address", detail: "The building houses several different, unrelated companies with similar-looking websites, all claiming to hire foreign students." },
                            { flag: "No EIN or verifiable business registration", detail: "The employer cannot provide a federal Employer Identification Number or is not registered with the state Secretary of State." },
                            { flag: "Website has no specific business content", detail: "The company website is generic, template-based, or describes services too vaguely to verify what the company actually does." },
                            { flag: "No W-2 or pay stubs", detail: "You have never received a pay stub, W-2, or formal employment record from this employer." },
                            { flag: "Training happens at a third-party company in India", detail: "You were told that your 'training' is being done by a vendor in India rather than by the US employer listed on your EAD." },
                        ].map((item) => (
                            <div key={item.flag} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {item.flag}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="consequences" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Happens to Students Caught in OPT Fraud
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        HSI was direct in its public statement: <em>"If you're an employer or foreign student engaged in fraud against the United States, you are advised to return home or surrender immediately. The criminal, civil, and immigration consequences for fraud are severe and unavoidable."</em>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Even students who were not the primary actors in the fraud — who were recruited by staffing companies or consulting firms and did not fully understand what was happening — can face serious consequences once their SEVIS record is flagged.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-red-100 dark:bg-red-900/40">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Consequence</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Who It Applies To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["SEVIS termination", "Any student listed under a fraudulent employer, regardless of intent"],
                                    ["Loss of F-1 status", "Follows SEVIS termination — student is no longer in lawful status"],
                                    ["Removal / deportation proceedings", "USCIS or ICE can initiate removal for students out of status"],
                                    ["Bar on future US visas", "A fraud-related finding can bar future visa applications for years or permanently"],
                                    ["Criminal charges", "Students who actively participated in or knowingly benefited from fraud"],
                                    ["Impact on pending H-1B or green card", "Any pending immigration benefit can be denied or revoked if F-1 status was fraudulent"],
                                ].map(([consequence, scope], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{consequence}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{scope}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ "I didn't know" is not a guaranteed defense.</strong> Immigration enforcement in fraud cases evaluates whether a reasonable person should have known. If the employer displayed obvious red flags and you continued the arrangement, lack of knowledge may not fully protect you. Document everything and consult an attorney if you have concerns.
                        </p>
                    </div>
                </section>

                <section id="protect-yourself" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How Legitimate Students Should Protect Themselves Right Now
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you are working a real job — showing up, being paid, getting trained, doing work that relates to your degree — you are in a fundamentally different position than the students HSI is targeting. But this environment means you need to be <strong>proactively documentable</strong>, not just actually compliant.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                action: "1. Verify your employer's physical address exists",
                                detail: "Google Street View your work address right now. Confirm it is a real office building. If you have worked there, you should have been inside it.",
                                icon: "green",
                            },
                            {
                                action: "2. Confirm your employer is registered with the state",
                                detail: "Search your state's Secretary of State business registry for your employer's legal name. A real business will have a registration record. This takes 2 minutes.",
                                icon: "green",
                            },
                            {
                                action: "3. Collect and store your employment records",
                                detail: "Gather pay stubs, offer letter, W-2s, email threads with your supervisor, screenshots of your work product, any training materials, and your I-983 (if on STEM OPT). Store them in a secure cloud folder.",
                                icon: "green",
                            },
                            {
                                action: "4. Make sure your SEVP Portal information is current",
                                detail: "Log into the SEVP Portal and confirm your employer name, address, and job title are correct and current. You are required to update within 10 days of any employment change.",
                                icon: "green",
                            },
                            {
                                action: "5. Know your US-based supervisor by name",
                                detail: "You should be able to immediately name the person in the US who directly supervises and trains you, and have their contact information. If all management is overseas, that is a red flag under USCIS rules — and now an HSI red flag too.",
                                icon: "green",
                            },
                            {
                                action: "6. Talk to your DSO if anything feels uncertain",
                                detail: "Your Designated School Official (DSO) at your university is your first line of support. They can review your SEVIS record, flag any discrepancies, and advise you on corrective steps before an investigation reaches you.",
                                icon: "green",
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-green-900 dark:text-green-100">{item.action}</h3>
                                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="verify-employer" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Verify an OPT Employer Is Legitimate Before You Accept
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you are currently job searching on OPT or STEM OPT, use this checklist before signing anything with a new employer. This due diligence takes less than an hour and can prevent a life-altering immigration outcome.
                    </p>

                    <div className="space-y-3 mb-6">
                        {[
                            { check: "Search the company name + your state on the Secretary of State business registry website", why: "Confirms the company is a legally registered business in the state they claim to operate in." },
                            { check: "Look up the company's physical address on Google Maps and Street View", why: "Verify it is a real commercial office, not a residential address, a UPS store, or an empty building." },
                            { check: "Search the company on LinkedIn", why: "A legitimate employer will have employee profiles, company history, and verifiable activity. Zero employees or profiles created recently are red flags." },
                            { check: "Ask for the name and email of your direct US-based supervisor", why: "You should be able to speak to or email the person who will directly train you in the US. If HR is 'overseas only,' that violates USCIS OPT requirements." },
                            { check: "Confirm the job description is clearly related to your major", why: "OPT employment must be directly related to your field of study. Vague job descriptions that could apply to anyone are a compliance risk." },
                            { check: "Ask for a copy of the employer's EIN", why: "A real employer who pays employees will have a federal Employer Identification Number and should be able to provide it." },
                            { check: "Search the company name in Google News for any fraud or legal issues", why: "HSI has already been investigating some employers for months. News reports, court filings, or BBB complaints can surface early." },
                            { check: "For STEM OPT: confirm they can complete the I-983 Training Plan", why: "STEM OPT requires a fully completed Form I-983 with specific training goals. An employer who cannot or will not complete it is not a valid STEM OPT employer." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.check}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><em>Why it matters:</em> {item.why}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="documents" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Documents Every OPT/STEM OPT Student Should Have Ready
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Think of this as your compliance folder. If you were asked today to prove that your employment is legitimate, could you produce these documents in under 10 minutes?
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { doc: "EAD Card (front and back)", desc: "Your current Employment Authorization Document with correct employer information if name-specific, or open market authorization." },
                            { doc: "Signed Offer Letter", desc: "Formal employment offer from your employer with job title, start date, salary, and work address." },
                            { doc: "Pay stubs or bank transfer records", desc: "Proof that the employer has actually paid you for your work — at least one pay stub per month of employment." },
                            { doc: "W-2 or 1099 from the employer", desc: "Annual tax documentation showing the employer-employee relationship with your real SSN." },
                            { doc: "Email communications with your US supervisor", desc: "A thread of work-related communications with your on-site US supervisor, discussing your actual training and job duties." },
                            { doc: "I-983 Training Plan (STEM OPT only)", desc: "Fully completed and signed Form I-983, including your supervisor's name, title, direct contact information, and detailed training goals." },
                            { doc: "Evidence of your work product", desc: "Screenshots, deliverables, project files, or client-facing work that shows you actually performed the job role listed on your authorization." },
                            { doc: "SEVP Portal screenshot with current employer info", desc: "A recent screenshot showing your employer data in the SEVP Portal matches your actual employment situation." },
                        ].map((item) => (
                            <div key={item.doc} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    {item.doc}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="what-if" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What to Do If You Suspect Your OPT Employer Is Fraudulent
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you are reading this and feeling uneasy about your current employer — take that seriously. The worst outcome is doing nothing and having investigators find you before you find an attorney. Here is the order of steps that immigration lawyers typically recommend:
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                step: "Step 1: Consult an immigration attorney immediately",
                                detail: "Before you update anything, cancel anything, or talk to anyone official — speak to a qualified immigration attorney. They can advise you on your specific situation without creating an official record. Many attorneys offer free initial consultations.",
                                urgent: true,
                            },
                            {
                                step: "Step 2: Contact your DSO at your university",
                                detail: "Your DSO has direct access to your SEVIS record and can note in the system that you are addressing an employment issue proactively. This matters — it shows good faith before any investigation reaches you.",
                                urgent: false,
                            },
                            {
                                step: "Step 3: Stop using the fraudulent employer for any official purpose",
                                detail: "Do not continue reporting this employer in the SEVP Portal, do not sign new employer verification forms, and do not use this address on visa or tax applications.",
                                urgent: false,
                            },
                            {
                                step: "Step 4: Begin a legitimate job search immediately",
                                detail: "Finding real, qualifying employment in your field is the fastest path back to full compliance. Document your search. Your DSO needs to see you are actively pursuing legitimate employment.",
                                urgent: false,
                            },
                            {
                                step: "Step 5: Do not simply 'disappear'",
                                detail: "Stopping OPT activity without updating SEVIS or your DSO is itself a violation. Proactive correction of your record is legally and practically far better than letting the system catch you.",
                                urgent: false,
                            },
                        ].map((item, i) => (
                            <div key={i} className={`p-5 rounded-xl border ${item.urgent ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"}`}>
                                <h3 className={`font-bold mb-2 ${item.urgent ? "text-red-900 dark:text-red-100" : "text-blue-900 dark:text-blue-100"}`}>{item.step}</h3>
                                <p className={`text-sm ${item.urgent ? "text-red-800 dark:text-red-200" : "text-blue-800 dark:text-blue-200"}`}>{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* STEM OPT callout */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Special Note for STEM OPT Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        STEM OPT carries additional employer obligations that make fraudulent employment even easier to detect. Under USCIS requirements:
                    </p>
                    <ul className="space-y-3 mb-6">
                        {[
                            "The employer must be enrolled in and participate in E-Verify",
                            "The employer must complete Form I-983, which requires a named US supervisor, a specific training plan with learning objectives, and evaluations every 6 months",
                            "All training must happen at the employer's US-based location — not at a vendor, subcontractor, or overseas affiliate",
                            "The employer must pay the student at least the same wage paid to similarly situated US workers",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ STEM OPT check:</strong> HSI specifically called out employers who claim all management is overseas in India as a clear violation. If your I-983 lists a supervisor who has never been in the US and all your "training" is coming from an offshore team, your STEM OPT may not be validly authorized. Talk to your DSO immediately.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
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
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day OPT Unemployment Rule</Link>
                    <Link href="/blog/stem-opt-employer-requirements" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Employer Requirements</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/opt-application-denied" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What to Do If Your OPT Is Denied</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/compare" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT vs STEM OPT →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Stay Fully Documented and Compliant on OPT</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT keeps your unemployment days, employer updates, SEVP records, and USCIS deadlines organized and audit-ready — so you can prove compliance instantly if you ever need to.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Track Your OPT Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
