import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle, Download, ShieldCheck, CreditCard } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Form I-765 Complete Guide: How to Apply for Your EAD Card (OPT & STEM OPT 2026)",
    description: "Everything you need to know about Form I-765 Application for Employment Authorization — who files it, how to complete it, filing fees, processing times, and how F-1 OPT and STEM OPT students use it to get their EAD card.",
    keywords: ["form I-765", "I-765 form guide", "application for employment authorization", "EAD card application", "OPT application I-765", "STEM OPT I-765", "how to file I-765", "I-765 processing time 2026", "EAD card for F-1 students"],
    openGraph: {
        title: "Form I-765 Complete Guide: How to Apply for Your EAD Card | TrackMyOPT",
        description: "The definitive 2026 guide to Form I-765 for F-1 students on OPT and STEM OPT — step-by-step instructions, fees, and processing times.",
        url: "https://www.trackmyopt.com/blog/form-i765-ead-application-guide",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/blog/form-i765.png", width: 1200, height: 630, alt: "Form I-765 Application for Employment Authorization with EAD card on a desk" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/form-i765-ead-application-guide" },
};

export default function FormI765GuidePage() {
    const faqItems = [
        { question: "What is Form I-765?", answer: "Form I-765, Application for Employment Authorization, is the USCIS form you file to request an Employment Authorization Document (EAD card). It is used by F-1 students applying for OPT, STEM OPT extension, and by many other nonimmigrant categories to get legal authorization to work in the US." },
        { question: "How long does it take for USCIS to process Form I-765 for OPT?", answer: "As of 2026, USCIS processing times for I-765 OPT applications average 3 to 5 months. F-1 students should apply 90 days before their OPT start date. The earliest you can apply is 90 days before your program end date." },
        { question: "What is the filing fee for Form I-765?", answer: "As of April 1, 2024, the USCIS filing fee for Form I-765 is $520 for most applicants. However, F-1 students filing for OPT (category (c)(3)(A), (c)(3)(B), or (c)(3)(C)) may qualify for a reduced fee. Check the current USCIS fee schedule at uscis.gov before filing." },
        { question: "What eligibility category do OPT students use on I-765?", answer: "F-1 students applying for standard 12-month OPT use category (c)(3)(B). Students applying for STEM OPT extension use category (c)(3)(C). Pre-completion OPT students use category (c)(3)(A). These codes are entered in Question 27 on the current form." },
        { question: "Can I start working before I receive my EAD card?", answer: "No. You cannot begin working until you have your physical EAD card in hand AND your OPT start date has arrived. Working before receiving your EAD card is considered unauthorized employment, which is a serious violation of your F-1 status." },
        { question: "What do I do if my I-765 for STEM OPT is taking too long?", answer: "If you applied for your STEM OPT EAD before your current EAD expired, you may receive an automatic extension of up to 540 days (as of the May 2022 DHS rule) while your I-765 is pending. Carry your Form I-797C (receipt notice) as proof of the pending renewal." },
        { question: "Where do I mail Form I-765 for OPT?", answer: "The mailing address depends on where you live. As of 2026, most OPT I-765 applications are mailed to the USCIS Dallas or Elgin Lockbox facilities. Check the current USCIS Direct Filing Addresses page for Form I-765 before mailing, as addresses change periodically." },
    ];

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Form I-765 EAD Application Guide", url: "https://www.trackmyopt.com/blog/form-i765-ead-application-guide" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-06-12"
                modifiedDate="2026-06-12"
                author="TrackMyOPT Team"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Form I-765 Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">Immigration Forms</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />12 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Form I-765: The Complete Guide to Applying for Your EAD Card (OPT & STEM OPT 2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Form I-765 is the application that gets you your EAD card — your legal permission to work in the United States as an F-1 student on OPT. This guide covers every field, every fee, every deadline, and every common mistake.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: June 12, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <img
                src="/blog/form-i765.png"
                alt="Form I-765 Application for Employment Authorization document with EAD card on office desk"
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
            />
            <figcaption className="mt-3 mb-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Form I-765 is the USCIS application F-1 OPT students file to receive their Employment Authorization Document (EAD card).
            </figcaption>

            {/* TL;DR */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Form I-765 is how F-1 students apply for their EAD card (OPT work permit). Apply 90 days before your OPT start date, use eligibility category (c)(3)(B) for standard OPT or (c)(3)(C) for STEM OPT, pay the $520 fee, and mail to the correct USCIS lockbox. Never start working until your physical EAD arrives and your OPT start date has passed.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Table of Contents
                </h2>
                <ol className="space-y-2 text-sm text-indigo-600 dark:text-indigo-400">
                    <li><a href="#what-is-i765" className="hover:underline">1. What Is Form I-765?</a></li>
                    <li><a href="#who-files" className="hover:underline">2. Who Files Form I-765?</a></li>
                    <li><a href="#eligibility-categories" className="hover:underline">3. Eligibility Categories: Which One Do You Use?</a></li>
                    <li><a href="#how-to-fill" className="hover:underline">4. How to Fill Out Form I-765 Step by Step</a></li>
                    <li><a href="#fees" className="hover:underline">5. Filing Fees for I-765</a></li>
                    <li><a href="#where-to-file" className="hover:underline">6. Where to File & What to Include</a></li>
                    <li><a href="#processing" className="hover:underline">7. Processing Times & How to Track Your Application</a></li>
                    <li><a href="#ead-extension" className="hover:underline">8. EAD Automatic Extension for STEM OPT Renewals</a></li>
                    <li><a href="#mistakes" className="hover:underline">9. Common Mistakes to Avoid</a></li>
                    <li><a href="#faq" className="hover:underline">10. Frequently Asked Questions</a></li>
                </ol>
            </div>

            {/* Section 1 */}
            <section id="what-is-i765" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">1. What Is Form I-765?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Form I-765, the <strong>Application for Employment Authorization</strong>, is the official USCIS form used to request an <strong>Employment Authorization Document (EAD)</strong>, commonly known as the <strong>EAD card</strong> or <strong>work permit</strong>. The EAD is a plastic credit-card-sized document with your photo that proves you are legally authorized to work for any employer in the United States.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Form I-765 is authorized under <a href="https://www.uscis.gov/i-765" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">8 CFR § 274a.12</a> and is one of the most commonly filed USCIS forms, with hundreds of thousands of applications processed each year — the largest share coming from F-1 international students applying for OPT.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <CreditCard className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">What You Get After Filing I-765</p>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400">After USCIS approves your I-765, they mail you an EAD card (Form I-766). This card shows your name, photo, USCIS number, category code, and authorization expiration date. You use this card to complete Form I-9 with your employer and to prove your work authorization at airports and other locations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2 */}
            <section id="who-files" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">2. Who Files Form I-765?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    While Form I-765 is used by many visa categories, the most common filers include:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                        { title: "F-1 OPT Students (Pre & Post)", desc: "Students in their last year or having completed their program, applying for 12-month work authorization" },
                        { title: "F-1 STEM OPT Students", desc: "Students with STEM degrees applying for the 24-month extension of their OPT" },
                        { title: "Pending Adjustment of Status", desc: "Green card applicants whose I-485 is pending more than 180 days" },
                        { title: "Asylum Applicants", desc: "Individuals with a pending asylum application over 150 days old" },
                        { title: "DACA Recipients", desc: "Deferred Action for Childhood Arrivals recipients seeking work authorization renewal" },
                        { title: "J-2 Dependents", desc: "Spouses of J-1 visa holders who are authorized to work independently" },
                    ].map((item) => (
                        <div key={item.title} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3 */}
            <section id="eligibility-categories" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">3. Eligibility Categories: Which One Do F-1 Students Use?</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    Question 27 on Form I-765 asks for your eligibility category. This is a critical field — getting it wrong can result in your application being rejected. Here are the F-1 student categories:
                </p>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">OPT Type</th>
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Category Code</th>
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Pre-Completion OPT (before graduation)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 font-mono font-bold text-indigo-600 dark:text-indigo-400">(c)(3)(A)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Up to 12 months (counts against total OPT)</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Post-Completion OPT (after graduation) ← Most Common</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 font-mono font-bold text-indigo-600 dark:text-indigo-400">(c)(3)(B)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">12 months</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">STEM OPT Extension (24-month extension)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 font-mono font-bold text-indigo-600 dark:text-indigo-400">(c)(3)(C)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">24 months additional</td>
            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">The category code must match the OPT type your DSO recommended in your I-20. If there is a mismatch, USCIS may reject or deny your application. Always confirm with your DSO (Designated School Official) before filing.</p>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section id="how-to-fill" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">4. How to Fill Out Form I-765 Step by Step</h2>
                <div className="space-y-4 mb-6">
                    {[
                        { step: "01", title: "Download the current form from USCIS.gov", desc: "Always use the most current version. As of 2026, the edition date is 04/01/24. Download at uscis.gov/i-765. Do not use old forms saved on your computer." },
                        { step: "02", title: "Part 1 — Reason for Applying", desc: "Check whether you are applying for initial EAD, renewing an existing EAD, or replacing a lost/stolen EAD." },
                        { step: "03", title: "Part 2 — Information About You", desc: "Enter your full legal name (exactly matching your passport), US mailing address, date of birth, Social Security Number (if you have one), country of citizenship, SEVIS number, and current immigration status." },
                        { step: "04", title: "Part 3 — Passport & Travel Document", desc: "Enter your passport number, country of issuance, and expiration date. For F-1 students, also enter your I-94 Admission Number." },
                        { step: "05", title: "Part 4 — Information About Immigration History", desc: "State when you last entered the US, your most recent immigration status, and your authorized period of stay (for F-1 students, this will be D/S — Duration of Status)." },
                        { step: "06", title: "Part 5 — Eligibility Category", desc: "Enter (c)(3)(B) for standard OPT or (c)(3)(C) for STEM OPT. This is the most important question on the form. Also enter your proposed employment start and end dates." },
                        { step: "07", title: "Part 6 — Applicant's Statement & Signature", desc: "Read the certification carefully. Sign and date the form. The form cannot be processed without your signature." },
                        { step: "08", title: "Prepare your packet", desc: "Assemble: completed I-765, copy of I-20 with DSO OPT recommendation, copy of SEVIS I-20, copy of passport bio page, copy of current US visa, copy of I-94, and two passport-style photos. For STEM OPT: also include Form I-983 and copy of current EAD." },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 5 */}
            <section id="fees" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">5. Filing Fees for Form I-765</h2>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Applicant Type</th>
                                <th className="text-left p-4 border border-gray-200 dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">Fee (as of April 1, 2024)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Standard I-765 (most applicants)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 font-bold text-gray-900 dark:text-white">$520</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">Online filing (eligible categories)</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 font-bold text-gray-900 dark:text-white">$470 (reduced online fee)</td>
                            </tr>
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">STEM OPT (c)(3)(C) — filed concurrently with pending I-485</td>
                                <td className="p-4 border border-gray-200 dark:border-zinc-700 font-bold text-gray-900 dark:text-white">$0 (fee waived)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Payment can be made by check or money order payable to &quot;U.S. Department of Homeland Security&quot; or online via pay.gov when filing electronically. Do not send cash. Always verify the current fee at <a href="https://www.uscis.gov/i-765" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">uscis.gov/i-765</a> before filing, as fees are updated periodically.
                </p>
            </section>

            {/* Section 6 */}
            <section id="where-to-file" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">6. Where to File Form I-765 & What to Include in Your Packet</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    The mailing address for Form I-765 depends on your eligibility category and your state of residence. USCIS routes most OPT applications to their lockbox facilities in <strong>Dallas, TX</strong> or <strong>Elgin, IL</strong>. Always check the <a href="https://www.uscis.gov/i-765" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">USCIS Direct Filing Addresses page</a> before mailing, as these change.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Standard OPT Packet Checklist</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {["Completed Form I-765 (signed)", "Two passport-style photos (2x2 inches)", "Copy of current I-20 with OPT recommendation page", "Copy of all previous I-20s", "Copy of passport bio-data page", "Copy of current US visa", "Copy of I-94 arrival/departure record", "Filing fee ($520 check or MO payable to USDHS)"].map(item => (
                                <li key={item} className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Additional for STEM OPT</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {["Completed Form I-983 (Training Plan)", "Copy of current EAD card (both sides)", "Copy of I-20 with STEM OPT recommendation", "Employer&apos;s E-Verify company ID number", "Evidence of STEM degree (transcript or diploma)"].map(item => (
                                <li key={item} className="flex gap-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 7 */}
            <section id="processing" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">7. Processing Times & How to Track Your I-765</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    USCIS processing times for Form I-765 vary significantly by year and filing volume. As of 2026:
                </p>
                <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-500 dark:text-gray-400">Average Processing Time (OPT)</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">3–5 months</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400">Earliest You Can Apply</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">90 days before OPT start</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400">Latest You Can Apply</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Must apply before program end + 60 days</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400">Receipt Notice (I-797C)</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2–4 weeks after mailing</p></div>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    After mailing your packet, you will receive a Form I-797C (Receipt Notice) by mail in 2–4 weeks. Use the receipt number (starts with EAC, WAC, LIN, etc.) to track your case at <a href="https://egov.uscis.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">egov.uscis.gov</a> or via the myUSCIS mobile app.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300"><strong>Apply early!</strong> Because processing times average 3–5 months, students who apply at the last minute often experience gaps in their work authorization. Most DSOs recommend submitting your I-765 no later than 3 months before your program end date.</p>
                    </div>
                </div>
            </section>

            {/* Section 8 */}
            <section id="ead-extension" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">8. Automatic EAD Extension for STEM OPT Renewal Applicants</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    If you file a timely renewal of your STEM OPT (category (c)(3)(C)) before your current EAD expires, you are entitled to an <strong>automatic 540-day extension</strong> of your existing work authorization while USCIS processes your renewal. This rule was implemented by DHS in May 2022 and was codified in the 2024 OPT regulations.
                </p>
                <div className="space-y-3">
                    {[
                        "Your renewal must be filed before your current EAD expiration date",
                        "Carry your Form I-797C (receipt notice) + your expired EAD card + your I-20 at all times",
                        "Your employer must complete a new I-9 Section 3 entry noting the 540-day extension",
                        "The 540-day clock begins on the day your old EAD expires",
                        "If USCIS approves or denies your renewal before 540 days, the extension ends on that date",
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 9 */}
            <section id="mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">9. Common I-765 Mistakes That Cause Rejections</h2>
                <div className="space-y-4">
                    {[
                        { mistake: "Wrong eligibility category", fix: "Triple-check with your DSO. Use (c)(3)(B) for standard OPT, (c)(3)(C) for STEM OPT extension." },
                        { mistake: "Name doesn't match passport", fix: "Your name on I-765 must exactly match your passport. Use your full legal name including middle name if applicable." },
                        { mistake: "Missing signature or date", fix: "An unsigned form is automatically rejected. Sign Part 6 with blue or black ink before mailing." },
                        { mistake: "Wrong filing address", fix: "USCIS lockbox addresses change frequently. Always verify on uscis.gov the day you mail your packet." },
                        { mistake: "Outdated form version", fix: "Only the current edition (04/01/24 or later) is accepted. Check the edition date at the bottom of each page." },
                        { mistake: "Applying too late (after program end + 60 days)", fix: "The filing window closes 60 days after your program end date. After that, you lose OPT eligibility entirely." },
                        { mistake: "Not including both sides of current EAD for STEM OPT", fix: "For STEM OPT renewals, USCIS requires a copy of both the front AND back of your existing EAD card." },
                    ].map((item, i) => (
                        <div key={i} className="border border-red-200 dark:border-red-900 rounded-xl p-5">
                            <p className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ Mistake: {item.mistake}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">✅ <strong>Fix:</strong> {item.fix}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions About Form I-765</h2>
                <div className="space-y-6">
                    {faqItems.map((item, i) => (
                        <div key={i} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.question}</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-3">Never Miss Your I-765 Filing Deadline</h2>
                <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                    TrackMyOPT calculates your OPT application deadline automatically — telling you exactly when to apply for your I-765 based on your program end date, sends you EAD expiration reminders, and tracks your STEM OPT 540-day extension countdown.
                </p>
                <Link href="/auth/sign-up" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                    Track My OPT Deadlines Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Sources */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600" />
                    Official Resources & Sources
                </h3>
                <ul className="space-y-2 text-sm">
                    <li><a href="https://www.uscis.gov/i-765" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">USCIS — Form I-765 (Download & Filing Instructions)</a></li>
                    <li><a href="https://www.ice.gov/sevis/opt" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">ICE SEVIS — OPT for F-1 Students</a></li>
                    <li><a href="https://egov.uscis.gov/casestatus/landing.do" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">USCIS Case Status Online — Track Your I-765</a></li>
                    <li><a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">USCIS — OPT for F-1 Students Official Page</a></li>
                </ul>
            </div>
        </article>
    );
}
