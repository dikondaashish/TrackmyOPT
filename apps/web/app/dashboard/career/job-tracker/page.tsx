import { getApplications, getUserPlanTier } from "./actions";
import { JobTrackerBoard } from "@/components/career/job-tracker/JobTrackerBoard";
import { ArrowLeft, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function JobTrackerPage() {
    // Fetch initial data on server
    const applications = await getApplications();
    const planTier = await getUserPlanTier();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Link */}
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                        <ClipboardList className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Job Application Tracker</h1>
                        <p className="text-muted-foreground">
                            Track applications, interviews, and offers in one unified board
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <JobTrackerBoard
                    initialApplications={applications}
                    planTier={planTier}
                />
            </div>
        </div>
    );
}
