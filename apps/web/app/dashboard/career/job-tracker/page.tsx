import { getApplications, getUserPlanTier, getCustomStages } from "./actions";
import { JobTrackerBoard } from "@/components/career/job-tracker/JobTrackerBoard";

export const dynamic = 'force-dynamic';

export default async function JobTrackerPage() {
    const applications = await getApplications();
    const planTier = await getUserPlanTier();
    const customStages = await getCustomStages();

    return (
        <div className="max-md:-mx-3 max-md:-my-3 md:min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto max-md:px-0 max-md:py-0 px-4 sm:px-6 lg:px-8 py-8">


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
