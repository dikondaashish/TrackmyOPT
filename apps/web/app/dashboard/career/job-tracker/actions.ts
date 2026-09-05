"use server";

import { createClient } from "@/lib/supabase/server"; // Ensure this matches your project's server client getter
import { revalidatePath } from "next/cache";
import { JobApplication, JobFollowup, JobInterview, JobStage } from "@/lib/career/job-tracker/types";
import { captureServerEvent } from "@/lib/posthog-server";
import { getServerJob } from "@/lib/job-board/server-job-store";

const APP_PATH = "/dashboard/career/job-tracker";
const VERIFIED_JOB_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type VerifiedJobForTracker = {
    id: string;
    title: string;
    company_name: string | null;
    employer_board_name: string | null;
    location: string | null;
    job_url: string | null;
};

type VerifiedJobTrackerResult = VerifiedJobForTracker & {
    applicationId: string;
    wasCreated: boolean;
    wasRestored: boolean;
};

async function getVerifiedJobForTracker(jobId: string, userId: string): Promise<VerifiedJobTrackerResult> {
    if (!VERIFIED_JOB_ID.test(jobId)) throw new Error("Invalid job");

    const supabase = await createClient();
    const storeJob = await getServerJob(jobId);
    const job: VerifiedJobForTracker | null = storeJob && storeJob.listingStatus === "open" && storeJob.sourceTrustTier === "verified_ats"
        ? {
            id: storeJob.id,
            title: storeJob.title,
            company_name: storeJob.companyName,
            employer_board_name: storeJob.employerBoardName,
            location: storeJob.location,
            job_url: storeJob.jobUrl,
        }
        : null;
    if (!job) throw new Error("Verified job is no longer available");

    const companyName = job.company_name || job.employer_board_name;
    if (!companyName || !job.title) throw new Error("Verified job is missing required tracker details");

    const existingQuery = supabase
        .from("job_applications")
        .select("id, is_archived")
        .eq("user_id", userId)
        .limit(10);
    const { data: existing, error: existingError } = job.job_url
        ? await existingQuery.eq("job_url", job.job_url)
        : await existingQuery.eq("company_name", companyName).eq("role_title", job.title);

    if (existingError) throw new Error("Unable to check job tracker");
    const existingApplication = existing?.find((application) => !application.is_archived) || existing?.[0];
    if (existingApplication) {
        const wasRestored = Boolean(existingApplication.is_archived);
        if (wasRestored) {
            const { error: restoreError } = await supabase
                .from("job_applications")
                .update({ is_archived: false, archived_at: null, updated_at: new Date().toISOString() })
                .eq("id", existingApplication.id)
                .eq("user_id", userId);
            if (restoreError) throw new Error("Unable to restore job in tracker");
        }
        return { ...job, applicationId: existingApplication.id, wasCreated: false, wasRestored };
    }

    const { data: application, error: createError } = await supabase
        .from("job_applications")
        .insert({
            user_id: userId,
            company_name: companyName,
            role_title: job.title,
            location: job.location,
            job_url: job.job_url,
            status: "Wishlist",
            notes: "Saved from a verified employer job board. Record any application or interview manually.",
        })
        .select("id")
        .single();

    if (createError || !application) throw new Error("Unable to save job to tracker");
    await captureServerEvent(userId, "job_application_created", {
        company_name: companyName,
        role_title: job.title,
        status: "Wishlist",
        has_job_url: !!job.job_url,
        source: "verified_jobs",
    });
    return { ...job, applicationId: application.id, wasCreated: true, wasRestored: false };
}

/** Saves a verified listing into the user's existing manual Job Tracker. */
export async function saveVerifiedJobToTracker(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result = await getVerifiedJobForTracker(jobId, user.id);
    if (result.wasCreated || result.wasRestored) revalidatePath(APP_PATH);
    return { applicationId: result.applicationId, wasCreated: result.wasCreated };
}

/** Creates a user-selected follow-up in the existing tracker; it does not contact an employer. */
export async function setVerifiedJobFollowup(jobId: string, followupDate: string) {
    if (!ISO_DATE.test(followupDate)) throw new Error("Enter a valid follow-up date");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const result = await getVerifiedJobForTracker(jobId, user.id);
    const { error } = await supabase.from("job_followups").insert({
        user_id: user.id,
        job_application_id: result.applicationId,
        followup_at: followupDate,
        followup_type: "Other",
        notes: "Follow-up date set from a verified job listing.",
    });
    if (error) throw new Error("Unable to set follow-up date");

    const { error: updateError } = await supabase
        .from("job_applications")
        .update({ next_follow_up_at: followupDate, updated_at: new Date().toISOString() })
        .eq("id", result.applicationId)
        .eq("user_id", user.id);
    if (updateError) throw new Error("Unable to update job tracker");

    revalidatePath(APP_PATH);
    return { applicationId: result.applicationId };
}

export async function getApplications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("job_applications")
        .select(`
            *,
            job_interviews(*),
            job_followups(*)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }); // Most recent activity first

    if (error) {
        console.error("Error fetching applications:", error);
        throw new Error("Failed to fetch applications");
    }

    return data as (JobApplication & { job_interviews: JobInterview[], job_followups: JobFollowup[] })[];
}

export async function getUserPlanTier() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("plan_tier")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching plan tier:", error);
        return null;
    }

    return data?.plan_tier as string | null;
}

export async function createApplication(formData: {
    company_name: string;
    role_title: string;
    location?: string;
    job_url?: string;
    status: JobStage;
    applied_at?: string;
    notes?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase.from("job_applications").insert({
        user_id: user.id,
        ...formData
    }).select().single();

    if (error) {
        console.error("Error creating application:", error);
        throw new Error("Failed to create application");
    }

    await captureServerEvent(user.id, "job_application_created", {
        company_name: formData.company_name,
        role_title: formData.role_title,
        status: formData.status,
        has_job_url: !!formData.job_url,
    });

    revalidatePath(APP_PATH);
    return data as JobApplication;
}

export async function updateApplicationStatus(id: string, status: JobStage) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("job_applications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating status:", error);
        throw new Error("Failed to update status");
    }

    await captureServerEvent(user.id, "job_application_status_updated", {
        application_id: id,
        new_status: status,
    });

    revalidatePath(APP_PATH);
}

export async function updateApplicationDetails(id: string, updates: Partial<JobApplication>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Prevent user_id override
    const { user_id, id: _id, created_at, ...safeUpdates } = updates as any;

    const { error } = await supabase
        .from("job_applications")
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating details:", error);
        throw new Error("Failed to update details");
    }

    revalidatePath(APP_PATH);
}

export async function deleteApplication(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting application:", error);
        throw new Error("Failed to delete application");
    }

    await captureServerEvent(user.id, "job_application_deleted", {
        application_id: id,
    });

    revalidatePath(APP_PATH);
}

export async function archiveApplication(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("job_applications")
        .update({
            is_archived: true,
            archived_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error archiving application:", error);
        throw new Error("Failed to archive application");
    }

    revalidatePath(APP_PATH);
}

// Interviews

export async function addInterview(applicationId: string, interview: {
    round_name: string;
    interview_at: string;
    meeting_link?: string;
    notes?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("job_interviews").insert({
        user_id: user.id,
        job_application_id: applicationId,
        ...interview
    });

    if (error) {
        console.error("Error adding interview:", error);
        throw new Error("Failed to add interview");
    }

    // Update parent updated_at
    await supabase.from("job_applications").update({ updated_at: new Date().toISOString() }).eq("id", applicationId);

    revalidatePath(APP_PATH);
}

// Follow-ups

export async function addFollowup(applicationId: string, followup: {
    followup_at: string;
    followup_type: string;
    notes?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("job_followups").insert({
        user_id: user.id,
        job_application_id: applicationId,
        ...followup
    });

    if (error) {
        console.error("Error adding followup:", error);
        throw new Error("Failed to add followup");
    }

    // Set parent next_follow_up_at for quick visibility if this date is sooner?
    // Or we just let logic handle it. 
    // Let's update the parent's generic next_follow_up_at field to match this soonest one? 
    // Actually, simple update:
    await supabase.from("job_applications").update({
        next_follow_up_at: followup.followup_at,
        updated_at: new Date().toISOString()
    }).eq("id", applicationId);

    revalidatePath(APP_PATH);
}

export async function markFollowupDone(followupId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("job_followups")
        .update({ status: 'done' })
        .eq("id", followupId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error marking followup done:", error);
        throw new Error("Failed to update followup");
    }

    // We should ideally clear `next_follow_up_at` on parent if no pending followups remain, 
    // but that's complex logic for a server action. 
    // For MVP, we just update the child status.

    revalidatePath(APP_PATH);
}

export async function clearApplicationFollowup(applicationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("job_applications")
        .update({ next_follow_up_at: null, updated_at: new Date().toISOString() })
        .eq("id", applicationId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error clearing followup:", error);
        throw new Error("Failed to clear followup");
    }

    revalidatePath(APP_PATH);
}

export async function clearAllFollowups() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Clear all past/due follow-ups
    const now = new Date().toISOString();

    // Note: This updates ALL applications with a past date. 
    // In a more complex app, we might want to only clear 'unread' status, 
    // but for this tracker, 'Clear All' implies 'I executed or dismissed them'.
    const { error } = await supabase
        .from("job_applications")
        .update({ next_follow_up_at: null, updated_at: new Date().toISOString() })
        .lte("next_follow_up_at", now)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error clearing all followups:", error);
        throw new Error("Failed to clear all followups");
    }

    revalidatePath(APP_PATH);
}

// Custom Stages

export async function getCustomStages() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("job_stages")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

    if (error) {
        console.error("Error fetching custom stages:", error);
        return [];
    }

    return data as any[];
}

export async function createJobStage(stage: { title: string; color: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get max position to append
    const { data: maxPosData } = await supabase
        .from("job_stages")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

    const nextPos = (maxPosData?.position ?? 0) + 1;

    const { data, error } = await supabase.from("job_stages").insert({
        user_id: user.id,
        title: stage.title,
        color: stage.color,
        position: nextPos
    }).select().single();

    if (error) {
        console.error("Error creating stage:", error);
        throw new Error("Failed to create stage");
    }

    revalidatePath(APP_PATH);
    return data;
}

export async function deleteJobStage(stageId: string) { // stageId is the title for now effectively, but let's check.
    // Wait, in JobTrackerBoard we used 'title' as ID.
    // In database, we probably have a UUID.
    // When we fetch custom stages, we get the whole row including ID.
    // But in JobTrackerBoard we mapped: id: s.title.
    // PROPOSAL: Changing JobTrackerBoard to use s.id as ID for custom stages is risky if existing cards rely on status string matching.
    // The `job_applications` table has `status` column which stores the string title (e.g. "Applied").
    // If we delete the stage, what happens to cards in it?
    // We should probably move them to default "Applied" or "Wishlist".
    // AND `deleteJobStage` should take the TITLE or ID?
    // If we pass ID, we can delete the row.
    // But we also need to handle the applications.

    // Let's look at `createJobStage`. It inserts title.
    // `JobTrackerBoard`: `id: s.title`.
    // So the "ID" passed to dnd-kit is the title.
    // If I pass `onDelete` to `JobStageColumn`, I'll probably pass the column.

    // Ideally, we delete by ID (UUID).
    // So `JobTrackerBoard` should know the UUID.
    // I should update `JobTrackerBoard` to store the original `CustomStage` object or at least the UUID in the column definition.

    // Let's refine the plan for actions.ts:
    // It should accept `stageId` (UUID) AND `stageTitle` (to move apps away from it or just handle cascade?)
    // If I just delete the row, apps with that status string will be "orphaned" in the UI (fallback logic handles them).
    // Better to update them to "Applied" (default) before deleting.

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Optional: Move applications in this stage to 'Applied'
    // First, get the title to find apps?
    // Actually, let's just delete the stage. The `JobTrackerBoard` fallback logic I saw earlier:
    // `if (!cols.has(app.status)) { cols.get(KANBAN_COLUMNS[1].id)?.push(app); }`
    // This fallback logic handles orphaned apps by showing them in "Applied".
    // So safe to just delete the stage row.

    // However, I need to know WHICH row to delete.
    // I need the UUID.
    // I will assume `deleteJobStage` takes the UUID.

    const { error } = await supabase
        .from("job_stages")
        .delete()
        .eq("id", stageId) // This expects UUID
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting stage:", error);
        throw new Error("Failed to delete stage");
    }

    revalidatePath(APP_PATH);
}
