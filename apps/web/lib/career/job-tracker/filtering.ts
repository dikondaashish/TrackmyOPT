import { JobApplication, JobStage } from "./types";

// ============================================================================
// FILTER TYPES
// ============================================================================

export type SortOption =
    | "recently-added"
    | "recently-updated"
    | "applied-newest"
    | "applied-oldest";

export type FollowupFilterOption = "all" | "today" | "week" | "overdue";

interface FilterCriteria {
    search?: string;
    status?: JobStage | "all";
    followupFilter?: FollowupFilterOption;
    showArchived?: boolean;
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search applications by company, role, or location (case-insensitive)
 */
export function searchApplications(
    applications: JobApplication[],
    searchTerm: string
): JobApplication[] {
    if (!searchTerm.trim()) return applications;

    const term = searchTerm.toLowerCase().trim();

    return applications.filter(app =>
        app.company_name.toLowerCase().includes(term) ||
        app.role_title.toLowerCase().includes(term) ||
        (app.location && app.location.toLowerCase().includes(term))
    );
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filter applications by status, followup, and archive state
 */
export function filterApplications(
    applications: JobApplication[],
    filters: FilterCriteria
): JobApplication[] {
    let results = [...applications];

    // Archive filter
    if (!filters.showArchived) {
        results = results.filter(app => !(app as any).is_archived);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
        results = results.filter(app => app.status === filters.status);
    }

    // Follow-up filter
    if (filters.followupFilter && filters.followupFilter !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        results = results.filter(app => {
            const nextFollowup = (app as any).next_follow_up_at;
            if (!nextFollowup) return false;

            const followupDate = new Date(nextFollowup);
            followupDate.setHours(0, 0, 0, 0);

            switch (filters.followupFilter) {
                case "today":
                    return followupDate.getTime() === today.getTime();
                case "week":
                    return followupDate >= today && followupDate <= weekFromNow;
                case "overdue":
                    return followupDate < today;
                default:
                    return true;
            }
        });
    }

    return results;
}

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sort applications by various criteria
 */
export function sortApplications(
    applications: JobApplication[],
    sortBy: SortOption
): JobApplication[] {
    const sorted = [...applications];

    switch (sortBy) {
        case "recently-added":
            return sorted.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        case "recently-updated":
            return sorted.sort((a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
        case "applied-newest":
            return sorted.sort((a, b) => {
                if (!a.applied_at) return 1;
                if (!b.applied_at) return -1;
                return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
            });
        case "applied-oldest":
            return sorted.sort((a, b) => {
                if (!a.applied_at) return 1;
                if (!b.applied_at) return -1;
                return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
            });
        default:
            return sorted;
    }
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get relative date string (e.g., "Today", "Tomorrow", "3 days ago")
 */
export function getRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
}

/**
 * Get follow-up badge variant based on date
 */
export function getFollowupBadgeInfo(dateStr: string): { text: string; variant: "overdue" | "today" | "soon" | "none" } {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", variant: "overdue" };
    if (diffDays === 0) return { text: "Today", variant: "today" };
    if (diffDays <= 3) return { text: `Due in ${diffDays}d`, variant: "soon" };
    return { text: "", variant: "none" };
}
