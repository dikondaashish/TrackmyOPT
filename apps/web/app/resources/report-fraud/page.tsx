import { ShieldAlert, Globe, Phone, FileText, AlertTriangle, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Report Fraud & Protect Yourself | TrackMyOPT",
    description: "Resources for international students to report visa fraud, ghost jobs, and unfair employment practices.",
    alternates: {
        canonical: 'https://www.trackmyopt.com/resources/report-fraud',
    },
};

export default function ReportFraudPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 mb-4">
                                Report Fraud & Abuse
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                                International students are often targets of employment scams. Use these official channels to report violations and protect your status.
                            </p>
                        </div>
                        <ShieldAlert className="w-16 h-16 text-red-500 dark:text-red-400 opacity-20 md:opacity-100" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Critical Warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-6 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">Know Your Rights</h3>
                            <p className="text-amber-700 dark:text-amber-300">
                                It is **illegal** for an employer to demand payment for a job offer ("Pay-to-Play") or to force you to pay for your own H-1B petition costs. If you encounter this, Report it immediately.
                            </p>
                        </div>
                    </div>

                    {/* Reporting Channels */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-blue-500" />
                            Official Reporting Channels
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* DOL WHD */}
                            <a
                                href="https://webapps.dol.gov/contactwhd/"
                                target="_blank"
                                rel="noreferrer"
                                className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Wage & Hour Division</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Report unpaid wages, H-1B benching without pay, or employers forcing you to pay visa fees.
                                </p>
                            </a>

                            {/* USCIS Fraud */}
                            <a
                                href="https://www.uscis.gov/report-fraud/uscis-tip-form"
                                target="_blank"
                                rel="noreferrer"
                                className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">USCIS Fraud Tip Form</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Report "Ghost Jobs", fake offer letters designed only to collect personal data, or immigration fraud.
                                </p>
                            </a>

                            {/* DOJ IER */}
                            <a
                                href="https://www.justice.gov/crt/reporting-unfair-visa-related-employment-practices"
                                target="_blank"
                                rel="noreferrer"
                                className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">DOJ Immigrant Rights</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Report citizenship status discrimination or unfair documentary practices (I-9 abuse).
                                </p>
                            </a>

                            {/* FTC Fraud */}
                            <a
                                href="https://reportfraud.ftc.gov/"
                                target="_blank"
                                rel="noreferrer"
                                className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">FTC Fraud Report</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Report scams, including recruiters asking for money or identity theft attempts.
                                </p>
                            </a>
                        </div>
                    </section>

                    {/* Common Red Flags */}
                    <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Common Red Flags 🚩</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Asking for Money</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Legitimate employers NEVER ask you to pay for training, equipment, or visa filing fees upfront.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">"Ghost Jobs"</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">If a recruiter ghosts you immediately after getting your resume/date of birth, they might be harvesting data. Report it.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">3</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Guaranteed H-1B</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">No one can guarantee lottery selection. This is a hallmark of fraud.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function Scale(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
    )
}
