"use server";

import { createClient } from "@/lib/supabase/server"; // Ensure this matches your project's server client getter
import { revalidatePath } from "next/cache";
import { JobApplication, JobFollowup, JobInterview, JobStage } from "@/lib/career/job-tracker/types";
import { getPostHogClient } from "@/lib/posthog-server";

const APP_PATH = "/dashboard/career/job-tracker";

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
        .single();

    if (error) {
        console.error("Error fetching plan tier:", error);
        return null;
    }

    return data.plan_tier as string | null;
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

    const posthog = getPostHogClient();
    posthog.capture({
        distinctId: user.id,
        event: 'job_application_created',
        properties: {
            company_name: formData.company_name,
            role_title: formData.role_title,
            status: formData.status,
            has_job_url: !!formData.job_url,
        },
    });
    await posthog.shutdown();

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

    const posthog = getPostHogClient();
    posthog.capture({
        distinctId: user.id,
        event: 'job_application_status_updated',
        properties: { application_id: id, new_status: status },
    });
    await posthog.shutdown();

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

    const posthog = getPostHogClient();
    posthog.capture({
        distinctId: user.id,
        event: 'job_application_deleted',
        properties: { application_id: id },
    });
    await posthog.shutdown();

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
