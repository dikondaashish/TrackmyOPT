export type JobStage =
    | "Wishlist"
    | "Applied"
    | "Recruiter Screen"
    | "Interviewing"
    | "Final Round"
    | "Offer"
    | "Rejected";

export interface JobApplication {
    id: string;
    user_id: string; // Foreign key to auth.users
    company_name: string;
    role_title: string;
    location?: string | null;
    job_url?: string | null;
    status: JobStage;
    applied_at?: string | null; // ISO Date
    next_follow_up_at?: string | null; // ISO Date
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface JobInterview {
    id: string;
    job_application_id: string;
    round_name: string;
    interview_at: string; // ISO Timestamp
    meeting_link?: string | null;
    notes?: string | null;
}

export interface JobFollowup {
    id: string;
    job_application_id: string;
    followup_at: string; // ISO Date or Timestamp
    followup_type: "Email" | "LinkedIn" | "Phone" | "Other";
    notes?: string | null;
    status: "pending" | "done";
}

export interface KanbanColumn {
    id: JobStage;
    title: string;
    color: string; // Tailwind class component for badge
}
