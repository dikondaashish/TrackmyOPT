"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { JobApplication, JobStage } from "@/lib/career/job-tracker/types";
import { JOB_STAGES } from "@/lib/career/job-tracker/constants";
import { createApplication } from "@/app/dashboard/career/job-tracker/actions";

interface AddApplicationModalProps {
    onAdd?: (app: JobApplication) => void;
}

export function AddApplicationModal({ onAdd }: AddApplicationModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: "",
        role_title: "",
        location: "",
        job_url: "",
        status: "Wishlist" as JobStage,
        applied_at: "", // YYYY-MM-DD
    });

    const isFormValid = formData.company_name && formData.role_title;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            setLoading(true);
            const newApp = await createApplication({
                ...formData,
                location: formData.location || undefined,
                job_url: formData.job_url || undefined,
                applied_at: formData.applied_at || undefined,
            });

            setOpen(false);
            setFormData({
                company_name: "",
                role_title: "",
                location: "",
                job_url: "",
                status: "Wishlist",
                applied_at: ""
            });

            if (onAdd && newApp) {
                onAdd(newApp);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to create application");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Application
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" onClose={() => setOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Add Job Application</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company Name *</Label>
                                <Input
                                    placeholder="e.g. Google"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role Title *</Label>
                                <Input
                                    placeholder="e.g. Software Engineer"
                                    value={formData.role_title}
                                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    placeholder="e.g. Remote / SF"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStage })}
                                >
                                    {JOB_STAGES.map(stage => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Job URL</Label>
                            <Input
                                placeholder="https://..."
                                value={formData.job_url}
                                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                            />
                        </div>

                        {/* Show Applied Date only if status is past wishlist */}
                        {formData.status !== "Wishlist" && (
                            <div className="space-y-2">
                                <Label>Date Applied</Label>
                                <Input
                                    type="date"
                                    value={formData.applied_at}
                                    onChange={(e) => setFormData({ ...formData, applied_at: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!isFormValid || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {loading ? "Saving..." : "Save Application"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
