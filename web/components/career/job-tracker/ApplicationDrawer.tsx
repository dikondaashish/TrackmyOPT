"use client";

import { useEffect, useState } from "react";
import { JobApplication, JobFollowup, JobInterview, JobStage } from "@/lib/career/job-tracker/types";
import { JOB_STAGES } from "@/lib/career/job-tracker/constants";
import { X, Calendar, MapPin, ExternalLink, Trash2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { updateApplicationDetails, updateApplicationStatus, deleteApplication, addInterview, addFollowup, markFollowupDone } from "@/app/dashboard/career/job-tracker/actions";

interface ApplicationDrawerProps {
    application: JobApplication | null;
    onClose: () => void;
    interviews?: JobInterview[];
    followups?: JobFollowup[];
}

export function ApplicationDrawer({ application, onClose, interviews = [], followups = [] }: ApplicationDrawerProps) {
    const [status, setStatus] = useState<JobStage | "">("");
    const [notes, setNotes] = useState("");
    const [updating, setUpdating] = useState(false);

    // Sync local state when app changes
    useEffect(() => {
        if (application) {
            setStatus(application.status);
            setNotes(application.notes || "");
        }
    }, [application]);

    if (!application) return null;

    const handleSavePrimary = async () => {
        setUpdating(true);
        try {
            if (status && status !== application.status) {
                await updateApplicationStatus(application.id, status as JobStage);
            }
            if (notes !== application.notes) {
                await updateApplicationDetails(application.id, { notes });
            }
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this application?")) {
            await deleteApplication(application.id);
            onClose();
        }
    };

    const handleAddFollowup = async () => {
        const date = prompt("Follow-up Date (YYYY-MM-DD):", format(new Date(), 'yyyy-MM-dd'));
        if (!date) return;
        const type = prompt("Type (Email/LinkedIn):", "Email") || "Email";

        await addFollowup(application.id, {
            followup_at: date,
            followup_type: type,
            notes: "Routine follow-up"
        });
    };

    const handleAddInterview = async () => {
        const round = prompt("Round Name (e.g. Recruiter):", "Recruiter Screen");
        if (!round) return;
        const dateStr = prompt("Date & Time (YYYY-MM-DD HH:mm):", format(new Date(), "yyyy-MM-dd HH:mm"));
        if (!dateStr) return;

        // Basic ISO conversion for simple prompt
        const iso = new Date(dateStr).toISOString();

        await addInterview(application.id, {
            round_name: round,
            interview_at: iso
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col pointer-events-auto border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {application.company_name}
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            {application.role_title}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Status & Links */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                className="w-full h-10 px-3 bg-white dark:bg-gray-800 border rounded-md"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as JobStage)}
                            >
                                {JOB_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            {application.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {application.location}
                                </div>
                            )}
                            {application.job_url && (
                                <a href={application.job_url} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <ExternalLink className="w-4 h-4" />
                                    View Job Post
                                </a>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Timeline / Interviews */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Interviews</h3>
                            <Button variant="outline" size="sm" onClick={handleAddInterview}>+ Add Round</Button>
                        </div>
                        <div className="space-y-3">
                            {interviews.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No interviews scheduled yet.</p>
                            ) : (
                                interviews.map(inv => (
                                    <div key={inv.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-sm">{inv.round_name}</span>
                                            <span className="text-xs text-gray-500">
                                                {format(parseISO(inv.interview_at), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Follow-ups */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Follow-ups</h3>
                            <Button variant="outline" size="sm" onClick={handleAddFollowup}>+ Add Reminder</Button>
                        </div>
                        <div className="space-y-3">
                            {followups.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No follow-ups pending.</p>
                            ) : (
                                followups.map(fp => (
                                    <div key={fp.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${fp.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {fp.status === 'done' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{fp.followup_type}</p>
                                                <p className="text-xs text-gray-500">Due: {fp.followup_at}</p>
                                            </div>
                                        </div>
                                        {fp.status === 'pending' && (
                                            <Button size="sm" variant="ghost" className="text-xs" onClick={() => markFollowupDone(fp.id)}>Mark Done</Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Private Notes</Label>
                        <Textarea
                            placeholder="Add notes about this application..."
                            className="min-h-[100px]"
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                    <Button variant="destructive" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSavePrimary} disabled={updating} className="bg-emerald-600">
                            {updating ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
