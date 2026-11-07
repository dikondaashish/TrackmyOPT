import { AlertTriangle, ExternalLink, ArrowLeft } from "lucide-react";
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
        <div className="min-h-screen bg-surface font-sans">
            {/* Header */}
            <header className="bg-background border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
                                Report Fraud & Abuse
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                International students are often targets of employment scams. Use these official channels to report violations and protect your status.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Critical Warning */}
                    <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 p-6 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">Know Your Rights</h3>
                            <p className="text-amber-900 dark:text-amber-100">
                                It is <strong>illegal</strong> for an employer to demand payment for a job offer ("Pay-to-Play") or to force you to pay for your own H-1B petition costs. If you encounter this, Report it immediately.
                            </p>
                        </div>
                    </div>

                    {/* Reporting Channels */}
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Official Reporting Channels
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* DOL WHD */}
                            <a
                                href="https://webapps.dol.gov/contactwhd/"
                                target="_blank"
                                rel="noreferrer"
                                className="group block surface-card-interactive p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <h3 className="flex items-center justify-between gap-2 text-xl font-bold text-foreground mb-2">
                                    Wage & Hour Division
                                    <ExternalLink className="w-5 h-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Report unpaid wages, H-1B benching without pay, or employers forcing you to pay visa fees.
                                </p>
                            </a>

                            {/* USCIS Fraud */}
                            <a
                                href="https://www.uscis.gov/report-fraud/uscis-tip-form"
                                target="_blank"
                                rel="noreferrer"
                                className="group block surface-card-interactive p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <h3 className="flex items-center justify-between gap-2 text-xl font-bold text-foreground mb-2">
                                    USCIS Fraud Tip Form
                                    <ExternalLink className="w-5 h-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Report "Ghost Jobs", fake offer letters designed only to collect personal data, or immigration fraud.
                                </p>
                            </a>

                            {/* DOJ IER */}
                            <a
                                href="https://www.justice.gov/crt/reporting-unfair-visa-related-employment-practices"
                                target="_blank"
                                rel="noreferrer"
                                className="group block surface-card-interactive p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <h3 className="flex items-center justify-between gap-2 text-xl font-bold text-foreground mb-2">
                                    DOJ Immigrant Rights
                                    <ExternalLink className="w-5 h-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Report citizenship status discrimination or unfair documentary practices (I-9 abuse).
                                </p>
                            </a>

                            {/* FTC Fraud */}
                            <a
                                href="https://reportfraud.ftc.gov/"
                                target="_blank"
                                rel="noreferrer"
                                className="group block surface-card-interactive p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <h3 className="flex items-center justify-between gap-2 text-xl font-bold text-foreground mb-2">
                                    FTC Fraud Report
                                    <ExternalLink className="w-5 h-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Report scams, including recruiters asking for money or identity theft attempts.
                                </p>
                            </a>
                        </div>
                    </section>

                    {/* Common Red Flags */}
                    <section className="surface-card p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Common Red Flags</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-foreground">Asking for Money</h4>
                                    <p className="text-muted-foreground text-sm mt-1">Legitimate employers NEVER ask you to pay for training, equipment, or visa filing fees upfront.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-foreground">"Ghost Jobs"</h4>
                                    <p className="text-muted-foreground text-sm mt-1">If a recruiter ghosts you immediately after getting your resume/date of birth, they might be harvesting data. Report it.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">3</div>
                                <div>
                                    <h4 className="font-bold text-foreground">Guaranteed H-1B</h4>
                                    <p className="text-muted-foreground text-sm mt-1">No one can guarantee lottery selection. This is a hallmark of fraud.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
