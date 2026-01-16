import { KanbanColumn, JobStage } from "./types";

export const JOB_STAGES: JobStage[] = [
    "Wishlist",
    "Applied",
    "Recruiter Screen",
    "Interviewing",
    "Final Round",
    "Offer",
    "Rejected"
];

export const KANBAN_COLUMNS: KanbanColumn[] = [
    { id: "Wishlist", title: "Wishlist", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    { id: "Applied", title: "Applied", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { id: "Recruiter Screen", title: "Recruiter Screen", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { id: "Interviewing", title: "Interviewing", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { id: "Final Round", title: "Final Round", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    { id: "Offer", title: "Offer", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { id: "Rejected", title: "Rejected", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" }
];
