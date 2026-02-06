import { getApplications, getUserPlanTier, getCustomStages } from "./actions";
import { JobTrackerBoard } from "@/components/career/job-tracker/JobTrackerBoard";
import { ArrowLeft, ClipboardList } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function JobTrackerPage() {
    const applications = await getApplications();
    const planTier = await getUserPlanTier();
    const customStages = await getCustomStages();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">


                {/* Main Content */}
                <JobTrackerBoard
                    initialApplications={applications}
                    planTier={planTier}
                    customStages={customStages}
                />
            </div>
        </div>
    );
}
