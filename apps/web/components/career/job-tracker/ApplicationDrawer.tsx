"use client";

import { useEffect, useState } from "react";
import { JobApplication, JobFollowup, JobInterview, JobStage } from "@/lib/career/job-tracker/types";
import { JOB_STAGES } from "@/lib/career/job-tracker/constants";
import { X, Calendar, MapPin, ExternalLink, Trash2, CheckCircle, Clock, Archive, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { updateApplicationDetails, updateApplicationStatus, deleteApplication, archiveApplication, addInterview, addFollowup, markFollowupDone } from "@/app/dashboard/career/job-tracker/actions";
import { useRouter } from "next/navigation";
import { OfferDetailsSection } from "./OfferDetailsSection";

interface ExtendedJobApplication extends JobApplication {
    offer_salary?: number | null;
    offer_start_date?: string | null;
    offer_deadline?: string | null;
    sponsor_h1b?: boolean | null;
    is_archived?: boolean;
}

interface ApplicationDrawerProps {
    application: ExtendedJobApplication | null;
    onClose: () => void;
    interviews?: JobInterview[];
    followups?: JobFollowup[];
    onDelete?: (id: string) => void;
    onUpdate?: (app: JobApplication) => void;
    onArchive?: (id: string) => void;
}

export function ApplicationDrawer({ application, onClose, interviews = [], followups = [], onDelete, onUpdate, onArchive }: ApplicationDrawerProps) {
    const router = useRouter();
    const [status, setStatus] = useState<JobStage | "">("");
    const [notes, setNotes] = useState("");
    const [updating, setUpdating] = useState(false);

    // Inline form state
    const [isAddingInterview, setIsAddingInterview] = useState(false);
    const [newInterview, setNewInterview] = useState({ round: "Recruiter Screen", date: "" });

    const [isAddingFollowup, setIsAddingFollowup] = useState(false);
    const [newFollowup, setNewFollowup] = useState({ date: "", type: "Email" });

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

            if (onUpdate && (status !== application.status || notes !== application.notes)) {
                onUpdate({
                    ...application,
                    status: status as JobStage,
                    notes
                });
            }
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${application.company_name} - ${application.role_title}? This action cannot be undone.`)) {
            await deleteApplication(application.id);
            if (onDelete) {
                onDelete(application.id);
            }
            onClose();
        }
    };

    const handleArchive = async () => {
        try {
            await archiveApplication(application.id);
            if (onArchive) {
                onArchive(application.id);
            }
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    const handleOfferFieldChange = async (field: string, value: any) => {
        try {
            await updateApplicationDetails(application.id, { [field]: value });
        } catch (e) {
            console.error(e);
        }
    };

    const saveFollowup = async () => {
        if (!newFollowup.date) return;
        setUpdating(true);
        try {
            await addFollowup(application.id, {
                followup_at: newFollowup.date,
                followup_type: newFollowup.type,
                notes: "Routine follow-up"
            });
            setIsAddingFollowup(false);
            setNewFollowup({ date: "", type: "Email" });
            router.refresh(); // Refresh to show new data
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    const saveInterview = async () => {
        if (!newInterview.round || !newInterview.date) return;
        setUpdating(true);
        try {
            await addInterview(application.id, {
                round_name: newInterview.round,
                interview_at: new Date(newInterview.date).toISOString()
            });
            setIsAddingInterview(false);
            setNewInterview({ round: "Recruiter Screen", date: "" });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
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
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 gap-2 h-9"
                                onClick={() => {
                                    window.location.href = `/dashboard/career/resume-generator?company=${encodeURIComponent(application.company_name)}&role=${encodeURIComponent(application.role_title)}`;
                                }}
                            >
                                <FileText className="w-4 h-4" />
                                Tailor Resume with AI
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Timeline / Interviews */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Interviews</h3>
                            {!isAddingInterview && (
                                <Button variant="outline" size="sm" onClick={() => setIsAddingInterview(true)}>+ Add Round</Button>
                            )}
                        </div>

                        {isAddingInterview && (
                            <div className="p-4 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Round Name</Label>
                                        <Input
                                            value={newInterview.round}
                                            onChange={(e) => setNewInterview({ ...newInterview, round: e.target.value })}
                                            placeholder="e.g. Technical"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={newInterview.date}
                                            onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingInterview(false)}>Cancel</Button>
                                    <Button size="sm" onClick={saveInterview} disabled={!newInterview.date} className="bg-emerald-600">Save Round</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {interviews.length === 0 && !isAddingInterview ? (
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
                            {!isAddingFollowup && (
                                <Button variant="outline" size="sm" onClick={() => setIsAddingFollowup(true)}>+ Add Reminder</Button>
                            )}
                        </div>

                        {isAddingFollowup && (
                            <div className="p-4 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Date</Label>
                                        <Input
                                            type="date"
                                            value={newFollowup.date}
                                            onChange={(e) => setNewFollowup({ ...newFollowup, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Type</Label>
                                        <select
                                            className="w-full h-10 px-3 bg-white dark:bg-gray-900 border border-input rounded-md text-sm"
                                            value={newFollowup.type}
                                            onChange={(e) => setNewFollowup({ ...newFollowup, type: e.target.value })}
                                        >
                                            <option value="Email">Email</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Portal">Portal</option>
                                            <option value="Phone">Phone</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingFollowup(false)}>Cancel</Button>
                                    <Button size="sm" onClick={saveFollowup} disabled={!newFollowup.date} className="bg-emerald-600">Save Reminder</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {followups.length === 0 && !isAddingFollowup ? (
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

                    {/* Offer Details - Only show when status is Offer */}
                    {status === "Offer" && (
                        <>
                            <OfferDetailsSection
                                offerSalary={application.offer_salary}
                                offerStartDate={application.offer_start_date}
                                offerDeadline={application.offer_deadline}
                                sponsorH1B={application.sponsor_h1b}
                                onChange={handleOfferFieldChange}
                            />
                            <Separator />
                        </>
                    )}

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
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleArchive}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSavePrimary} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700">
                            {updating ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
