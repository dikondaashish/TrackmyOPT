import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Calendar, Users, GraduationCap, XCircle } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "End of 'Duration of Status': What the New DHS 4-Year Visa Rule Means for OPT Students | TrackMyOPT",
    description: "DHS announced a final rule ending 'Duration of Status' for F-1 visas. Learn how the new 4-year cap, mandatory USCIS extensions, and 30-day grace period impact you.",
    keywords: ["duration of status", "F-1 visa rule 2026", "DHS student visa rule", "F1 4 year limit", "OPT grace period 30 days", "USCIS EOS"],
    openGraph: {
        title: "The End of 'Duration of Status' (D/S): Complete Guide for OPT Students",
        description: "DHS has finalized a rule ending 'Duration of Status' for F-1 students. Visas will now be capped at 4 years, and the OPT grace period is reduced to 30 days. Here is what you need to know.",
        type: "article",
        url: "https://trackmyopt.com/blog/end-of-duration-of-status-f1-visa-rule",
        images: [
            {
                url: "/blog/dhs-visa-rule.png",
                width: 1200,
                height: 630,
                alt: "US Passport with an hourglass next to it, symbolizing time limit on visa",
            },
        ],
    },
    alternates: {
        canonical: "https://trackmyopt.com/blog/end-of-duration-of-status-f1-visa-rule",
    }
};

export default function DurationOfStatusRulePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-07-16"
                modifiedDate="2026-07-16"
                author="TrackMyOPT Team"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Important</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Visa Policy</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    End of 'Duration of Status': What the New DHS 4-Year Visa Rule Means for OPT Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    The DHS has officially published a final rule eliminating "Duration of Status" (D/S) for F-1 visas. Visas will now have a maximum 4-year limit and the grace period is reduced to 30 days.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 min read</span>
                    <span>•</span>
                    <span>Updated July 16, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/dhs-visa-rule.png"
                    alt="US Passport with an hourglass next to it, symbolizing time limit on visa"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    In a massive shift for international education, the Department of Homeland Security (DHS) announced today (July 16, 2026) the publication of a final rule that officially ends the "Duration of Status" (D/S) framework. For nearly 50 years, F-1 students were admitted for an unspecified period as long as they remained enrolled. Now, they face strict fixed admission periods, mandatory federal extensions, and reduced grace periods.
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        Key Takeaway
                    </h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">
                        The rule goes into effect <strong>60 days after publication</strong> in the Federal Register. Current F-1 students will automatically transition to the new system, with their authorized stay capped at a maximum of four years from the rule's effective date.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What Exactly is Changing? The 4 Major Reforms</h2>

                <p>
                    The "Duration of Status" system allowed students to extend their stay by simply getting a new I-20 from their university's Designated School Official (DSO) when changing levels (e.g., Bachelor's to Master's) or needing more time. The new rule transitions oversight from university staff back to federal authorities.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">1. Fixed Admission Caps (4-Year Maximum)</h3>
                <p>
                    Under the new rule, nonimmigrant students (F visas) will be admitted for the length of their specific academic program, <strong>not to exceed a maximum period of four years</strong>. 
                </p>
                <ul>
                    <li>If your Bachelor's degree takes 4 years, you will be admitted for 4 years.</li>
                    <li>If your Master's program takes 2 years, you will be admitted for 2 years.</li>
                    <li>If you are in a 5-6 year Ph.D. program, you will initially only get 4 years and <em>must</em> apply for an extension to finish your degree.</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">2. Mandatory Federal Extensions (EOS)</h3>
                <p>
                    Previously, if you needed an extra semester to graduate, your DSO just printed you a new I-20. Under the new rule, visa holders requiring additional time to complete a program or transition to a new one (like OPT) must formally apply for an <strong>Extension of Stay (EOS) directly through USCIS</strong>.
                </p>
                <p>
                    This means submitting an application, paying fees, and undergoing biometric vetting, background checks, and fraud screenings.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">3. Reduced Grace Period (60 Days → 30 Days)</h3>
                <p>
                    The standard 60-day grace period that F-1 students enjoyed after graduation, after OPT ends, or to prepare for departure/transfer schools has been <strong>slashed to 30 days</strong>.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-6 my-6">
                    <h4 className="flex items-center gap-2 font-bold text-yellow-900 dark:text-yellow-400 mt-0 mb-3">
                        <FileText className="w-5 h-5" /> How this affects OPT students:
                    </h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 mb-0 space-y-2">
                        <li>You now have only 30 days after graduation to apply for OPT (if you didn't apply beforehand).</li>
                        <li>You have only 30 days after your OPT or STEM OPT expires to leave the country, transfer to a new degree, or transition to a new visa like H-1B.</li>
                    </ul>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">4. Strict Program Change Restrictions</h3>
                <p>
                    The rule introduces strict limitations on academic changes to prevent individuals from perpetually enrolling in new courses just to stay in the U.S. Transferring to a lower educational level or a second degree at the same level may face heightened scrutiny during the EOS application process.
                </p>

                <h2 className="text-3xl font-bold mt-16 mb-8 text-gray-900 dark:text-white">The Ultimate 25-Question FAQ: F-1, J-1, & I Visa Scenarios</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    We've simulated 25 different student and scholar scenarios to comprehensively cover how the new fixed-admission limits affect different visa types, degree levels, and dependents.
                </p>

                {/* FAQ JSON-LD Schema for AEO/SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                { "@type": "Question", "name": "I am currently an F-1 student in the US. Will my status expire immediately?", "acceptedAnswer": { "@type": "Answer", "text": "No, you will automatically transition to the new fixed-admission system. Your authorized stay is capped at a maximum of four years starting from the effective date of this rule." } },
                                { "@type": "Question", "name": "I am starting a 4-year Bachelor's degree. How does this affect me?", "acceptedAnswer": { "@type": "Answer", "text": "You will be admitted for the exact length of your program (four years). If you graduate on time, you won't need to file for an extension of stay (EOS) for your studies." } },
                                { "@type": "Question", "name": "I am starting a 2-year Master’s program. Do I get 4 years?", "acceptedAnswer": { "@type": "Answer", "text": "No. You will be admitted for the length of your specific academic program (two years). You only get the maximum 4 years if your program takes that long." } },
                                { "@type": "Question", "name": "My Ph.D. program takes 6 years. How do I stay legal?", "acceptedAnswer": { "@type": "Answer", "text": "You will initially be admitted for a maximum of 4 years. Before those 4 years expire, you must file a formal Extension of Stay (EOS) application with USCIS to cover the remaining years of your Ph.D." } },
                                { "@type": "Question", "name": "I am transferring from a community college to a 4-year university. Do I need an extension?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. If your transfer requires you to stay beyond your initial fixed admission date, you cannot just get a new I-20 from your DSO. You must file an EOS with USCIS." } },
                                { "@type": "Question", "name": "I finished my Bachelor's and got into a Master's at the same school. Can my DSO extend my I-20?", "acceptedAnswer": { "@type": "Answer", "text": "No. Changing educational levels requires you to file a formal Extension of Stay (EOS) with USCIS, including biometrics and fees, because you need more time beyond your original fixed admission." } },
                                { "@type": "Question", "name": "I am applying for OPT. Do I need an Extension of Stay (EOS)?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Because OPT extends your stay beyond your academic program's fixed admission, you must file an EOS alongside your I-765 Employment Authorization Document application." } },
                                { "@type": "Question", "name": "I am currently on STEM OPT (24 months). Does the 4-year rule cut it short?", "acceptedAnswer": { "@type": "Answer", "text": "No, if you are already on STEM OPT, you will transition to a fixed admission date that aligns with the end of your current authorized STEM OPT period." } },
                                { "@type": "Question", "name": "Is the H-1B Cap-Gap extension eliminated?", "acceptedAnswer": { "@type": "Answer", "text": "The automatic nature of Cap-Gap is heavily impacted. Because of fixed admission dates and the 30-day grace period, students may need to file a formal EOS if their status expires before October 1st." } },
                                { "@type": "Question", "name": "What happened to the 60-day grace period?", "acceptedAnswer": { "@type": "Answer", "text": "The standard 60-day grace period for F-1 students after graduation or OPT completion has been permanently reduced to 30 days. You must depart the US or transition status within this window." } },
                                { "@type": "Question", "name": "My spouse is on an F-2 visa. Does the 4-year limit apply to them?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. F-2 dependent visas are tied to the primary F-1 student. Their fixed admission date will be exactly the same as the F-1 student, capped at 4 years." } },
                                { "@type": "Question", "name": "Are F-1 public high school students affected?", "acceptedAnswer": { "@type": "Answer", "text": "F-1 students in public high schools are already restricted to a maximum of 12 months. This rule does not change that limit, but it formalizes their fixed admission period." } },
                                { "@type": "Question", "name": "I am enrolled in an ESL (language training) program. How long can I stay?", "acceptedAnswer": { "@type": "Answer", "text": "Students in language training programs are restricted to a lifetime aggregate of 24 months (2 years) of study, including breaks and vacations." } },
                                { "@type": "Question", "name": "I am a J-1 research scholar. Does the 4-year rule apply to me?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. J-1 exchange visitors (except certain categories) will now be admitted for the length of their program, capped at a maximum of four years, requiring an EOS for longer stays." } },
                                { "@type": "Question", "name": "I am a J-1 Au Pair. Will my program be cut short?", "acceptedAnswer": { "@type": "Answer", "text": "J-1 Au Pairs are admitted for the length of their program (typically one year). You can still apply for the standard extension (up to 12 more months) but must do so through USCIS as an EOS." } },
                                { "@type": "Question", "name": "I am a J-1 exchange student here for one semester. What is my limit?", "acceptedAnswer": { "@type": "Answer", "text": "You will be given a fixed admission date that aligns exactly with the end date of your one-semester program (as listed on your DS-2019)." } },
                                { "@type": "Question", "name": "Does this change the J-1 two-year home residency requirement (212e)?", "acceptedAnswer": { "@type": "Answer", "text": "No. The 212(e) home residency requirement remains completely unchanged. You still need a waiver to transition to H, L, or immigrant statuses." } },
                                { "@type": "Question", "name": "I am a J-2 dependent with an EAD. When does my work authorization end?", "acceptedAnswer": { "@type": "Answer", "text": "Your J-2 EAD work authorization will end precisely on your fixed admission date (the same as the primary J-1), unless an Extension of Stay is approved." } },
                                { "@type": "Question", "name": "I am a foreign journalist on an I visa. How long can I stay?", "acceptedAnswer": { "@type": "Answer", "text": "I visa holders (media representatives) are now limited to the duration of their assignment, capped at a maximum of 240 days per admission period." } },
                                { "@type": "Question", "name": "How much will the Extension of Stay (EOS) application cost?", "acceptedAnswer": { "@type": "Answer", "text": "You must pay the standard Form I-539 filing fee (currently $470 for paper, $420 online), plus an $85 biometric services fee." } },
                                { "@type": "Question", "name": "Do I have to do biometrics (fingerprints) every time I extend my stay?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Moving away from Duration of Status means you must undergo biometric collection and background checks every time you file an Extension of Stay with USCIS." } },
                                { "@type": "Question", "name": "What happens if my fixed admission date expires while my EOS is pending?", "acceptedAnswer": { "@type": "Answer", "text": "If you filed a timely EOS, you are allowed to remain in the US while it is pending (lawful presence). However, your ability to work on campus or participate in CPT/OPT may be paused until approved." } },
                                { "@type": "Question", "name": "Can I travel outside the US while my Extension of Stay is pending?", "acceptedAnswer": { "@type": "Answer", "text": "No. Leaving the United States while an I-539 Extension of Stay application is pending will result in USCIS considering the application abandoned and denied." } },
                                { "@type": "Question", "name": "What happens if I forget to file an EOS and stay past my fixed date?", "acceptedAnswer": { "@type": "Answer", "text": "You will immediately begin accruing 'unlawful presence.' Accruing more than 180 days of unlawful presence triggers a 3-year ban from the US; over 1 year triggers a 10-year ban." } },
                                { "@type": "Question", "name": "Are there 2-year limits for certain countries or schools?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Students from countries on the State Sponsor of Terrorism list, or countries with high visa overstay rates (>10%), or those attending non-E-Verify schools, are capped at a 2-year maximum admission instead of 4 years." } }
                            ]
                        })
                    }}
                />

                <div className="space-y-4">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">1.</span> I am currently an F-1 student in the US. Will my status expire immediately?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>No.</strong> You will automatically transition to the new fixed-admission system. Your authorized stay is capped at a maximum of four years starting from the effective date of this rule.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">2.</span> I am starting a 4-year Bachelor's degree. How does this affect me?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            You will be admitted for the exact length of your program (four years). If you graduate on time, you won't need to file for an extension of stay (EOS) for your studies.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">3.</span> I am starting a 2-year Master’s program. Do I get 4 years?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>No.</strong> You will be admitted for the length of your specific academic program (two years). You only get the maximum 4 years if your program takes that long.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">4.</span> My Ph.D. program takes 6 years. How do I stay legal?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            You will initially be admitted for a maximum of 4 years. Before those 4 years expire, you <strong>must file a formal Extension of Stay (EOS) application</strong> with USCIS to cover the remaining years of your Ph.D.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">5.</span> I am transferring from a community college to a 4-year university. Do I need an extension?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>Yes.</strong> If your transfer requires you to stay beyond your initial fixed admission date, you cannot just get a new I-20 from your DSO. You must file an EOS with USCIS.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">6.</span> I finished my Bachelor's and got into a Master's at the same school. Can my DSO extend my I-20?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>No.</strong> Changing educational levels requires you to file a formal Extension of Stay (EOS) with USCIS, including biometrics and fees, because you need more time beyond your original fixed admission.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">7.</span> I am applying for OPT. Do I need an Extension of Stay (EOS)?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>Yes.</strong> Because OPT extends your stay beyond your academic program's fixed admission, you must file an EOS alongside your I-765 Employment Authorization Document application.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">8.</span> I am currently on STEM OPT (24 months). Does the 4-year rule cut it short?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>No.</strong> If you are already on STEM OPT, you will transition to a fixed admission date that aligns with the end of your current authorized STEM OPT period.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">9.</span> Is the H-1B Cap-Gap extension eliminated?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            The automatic nature of Cap-Gap is heavily impacted. Because of fixed admission dates and the 30-day grace period, students may need to file a formal EOS if their status expires before October 1st.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">10.</span> What happened to the 60-day grace period?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            The standard 60-day grace period for F-1 students after graduation or OPT completion has been <strong>permanently reduced to 30 days</strong>. You must depart the US or transition status within this window.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">11.</span> My spouse is on an F-2 visa. Does the 4-year limit apply to them?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>Yes.</strong> F-2 dependent visas are tied to the primary F-1 student. Their fixed admission date will be exactly the same as the F-1 student, capped at 4 years.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">12.</span> Are F-1 public high school students affected?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            F-1 students in public high schools are already restricted to a maximum of 12 months. This rule does not change that limit, but it formalizes their fixed admission period.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">13.</span> I am enrolled in an ESL (language training) program. How long can I stay?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            Students in language training programs are restricted to a lifetime aggregate of <strong>24 months (2 years)</strong> of study, including breaks and vacations.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">14.</span> I am a J-1 research scholar. Does the 4-year rule apply to me?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>Yes.</strong> J-1 exchange visitors (except certain categories) will now be admitted for the length of their program, capped at a maximum of four years, requiring an EOS for longer stays.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">15.</span> I am a J-1 Au Pair. Will my program be cut short?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            J-1 Au Pairs are admitted for the length of their program (typically one year). You can still apply for the standard extension (up to 12 more months) but must do so through USCIS as an EOS.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">16.</span> I am a J-1 exchange student here for one semester. What is my limit?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            You will be given a fixed admission date that aligns exactly with the end date of your one-semester program (as listed on your DS-2019).
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">17.</span> Does this change the J-1 two-year home residency requirement (212e)?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>No.</strong> The 212(e) home residency requirement remains completely unchanged. You still need a waiver to transition to H, L, or immigrant statuses.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">18.</span> I am a J-2 dependent with an EAD. When does my work authorization end?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            Your J-2 EAD work authorization will end precisely on your fixed admission date (the same as the primary J-1), unless an Extension of Stay is approved.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">19.</span> I am a foreign journalist on an I visa. How long can I stay?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            I visa holders (media representatives) are now limited to the duration of their assignment, capped at a maximum of <strong>240 days</strong> per admission period.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">20.</span> How much will the Extension of Stay (EOS) application cost?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            You must pay the standard Form I-539 filing fee (currently $470 for paper, $420 online), plus an <strong>$85 biometric services fee</strong>.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">21.</span> Do I have to do biometrics (fingerprints) every time I extend my stay?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>Yes.</strong> Moving away from Duration of Status means you must undergo biometric collection and background checks every time you file an Extension of Stay with USCIS.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">22.</span> What happens if my fixed admission date expires while my EOS is pending?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            If you filed a timely EOS, you are allowed to remain in the US while it is pending (lawful presence). However, your ability to work on campus or participate in CPT/OPT may be paused until approved.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">23.</span> Can I travel outside the US while my Extension of Stay is pending?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>No.</strong> Leaving the United States while an I-539 Extension of Stay application is pending will result in USCIS considering the application abandoned and denied.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">24.</span> What happens if I forget to file an EOS and stay past my fixed date?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            You will immediately begin accruing "unlawful presence." Accruing more than 180 days of unlawful presence triggers a 3-year ban from the US; over 1 year triggers a 10-year ban.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="text-primary mt-0.5">25.</span> Are there 2-year limits for certain countries or schools?
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-0 ml-6">
                            <strong>Yes.</strong> Students from countries on the State Sponsor of Terrorism list, or countries with high visa overstay rates (>10%), or those attending non-E-Verify schools, are capped at a 2-year maximum admission instead of 4 years.
                        </p>
                    </div>
                </div>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-12">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Stay Compliant with TrackMyOPT
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        With grace periods slashed to 30 days and strict caps on your stay, compliance is more critical than ever. <strong>TrackMyOPT</strong> automatically tracks your unemployment counter, sends deadline alerts, and keeps your SEVIS reporting on schedule so you never accidentally fall out of status.
                    </p>
                </div>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Protect Your Immigration Status Today
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    A single mistake—exceeding unemployment days or missing a SEVIS reporting deadline—can ruin your legal presence in the US. TrackMyOPT provides the tools you need to stay compliant.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Sign Up for Free
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/what-happens-if-opt-expires" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                What Happens If Your OPT Expires?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Your OPT is expiring — what now? Learn how the grace period works, how to extend your stay, and what happens to your F-1 status.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/opt-unemployment-rules-90-day-limit" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                The 90-Day Unemployment Rule
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Exceeding 90 unemployment days terminates your OPT instantly. Understand the rules and how days are counted.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
