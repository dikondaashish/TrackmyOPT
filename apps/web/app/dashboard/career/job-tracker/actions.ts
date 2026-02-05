"use server";

import { createClient } from "@/lib/supabase/server"; // Ensure this matches your project's server client getter
import { revalidatePath } from "next/cache";
import { JobApplication, JobFollowup, JobInterview, JobStage } from "@/lib/career/job-tracker/types";

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
        .eq("id", user.id)
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
