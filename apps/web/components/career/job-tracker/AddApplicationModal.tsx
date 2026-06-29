"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { JobApplication, JobStage } from "@/lib/career/job-tracker/types";
import { JOB_STAGES } from "@/lib/career/job-tracker/constants";
import { createApplication } from "@/app/dashboard/career/job-tracker/actions";
import { cn } from "@/lib/utils";

interface AddApplicationModalProps {
    onAdd?: (app: JobApplication) => void;
    isPrimaryEmptyState?: boolean;
}

export function AddApplicationModal({ onAdd, isPrimaryEmptyState }: AddApplicationModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdApplicationId, setCreatedApplicationId] = useState<string | null>(null);
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

            if (onAdd && newApp) {
                onAdd(newApp);
            }

            setCreatedApplicationId(newApp?.id ?? null);
            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Failed to create application");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button 
                onClick={() => {
                    setIsSuccess(false);
                    setCreatedApplicationId(null);
                    setOpen(true);
                }} 
                className={cn(
                    "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-all duration-500",
                    isPrimaryEmptyState && "animate-pulse ring-4 ring-emerald-500/40 ring-offset-2 ring-offset-background shadow-lg shadow-emerald-500/20"
                )}
            >
                <Plus className="w-4 h-4" />
                Add Application
            </Button>

            <Dialog open={open} onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                    setTimeout(() => {
                        setIsSuccess(false);
                        setCreatedApplicationId(null);
                        setFormData({
                            company_name: "",
                            role_title: "",
                            location: "",
                            job_url: "",
                            status: "Wishlist",
                            applied_at: "",
                        });
                    }, 300);
                }
            }}>
                <DialogContent
                    className={cn(
                        "p-0 gap-0 overflow-hidden rounded-xl border-border bg-card text-card-foreground shadow-2xl",
                        "max-w-[min(100vw-1.5rem,28rem)] sm:max-w-lg w-full"
                    )}
                    onClose={() => setOpen(false)}
                >
                    <DialogHeader className="space-y-1.5 px-6 sm:px-8 pt-6 pb-4 pr-14 text-left border-b border-border/80 bg-muted/35 dark:bg-muted/25">
                        <DialogTitle className="text-xl font-semibold tracking-tight">
                            {isSuccess ? "Application added" : "Add job application"}
                        </DialogTitle>
                        {!isSuccess && (
                            <DialogDescription className="text-left text-sm leading-relaxed">
                                Add a role to your tracker. Company and role title are required.
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    {isSuccess ? (
                        <div className="px-6 sm:px-8 py-8 flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">What's Next?</h3>
                                <p className="text-sm text-muted-foreground max-w-[300px]">
                                    We've added <span className="font-semibold text-foreground">{formData.company_name}</span> to your tracker. Now, let's make sure your resume is perfect for this role.
                                </p>
                            </div>

                            <div className="flex flex-col w-full gap-3 pt-4">
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 py-6 text-base shadow-lg shadow-blue-500/20"
                                    onClick={() => {
                                        const params = new URLSearchParams({
                                            company: formData.company_name,
                                            role: formData.role_title,
                                        });
                                        if (createdApplicationId) {
                                            params.set("applicationId", createdApplicationId);
                                        }
                                        window.location.href = `/dashboard/career/resume-generator?${params.toString()}`;
                                    }}
                                >
                                    <FileText className="w-5 h-5" />
                                    Tailor Resume with AI
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </Button>
                                
                                <Button 
                                    variant="ghost" 
                                    className="w-full text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setOpen(false);
                                        // Reset success state after closing
                                        setTimeout(() => setIsSuccess(false), 300);
                                    }}
                                >
                                    I'll do it later
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="px-6 sm:px-8 py-6 sm:py-7">
                                <div className="rounded-xl border border-border/70 bg-muted/20 dark:bg-muted/10 p-5 sm:p-6 space-y-5 sm:space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="space-y-2 min-w-0">
                                            <Label htmlFor="tmo-add-company" className="text-sm font-medium">
                                                Company name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="tmo-add-company"
                                                className="h-11 bg-background"
                                                placeholder="e.g. Google"
                                                value={formData.company_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, company_name: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 min-w-0">
                                            <Label htmlFor="tmo-add-role" className="text-sm font-medium">
                                                Role title <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="tmo-add-role"
                                                className="h-11 bg-background"
                                                placeholder="e.g. Software Engineer"
                                                value={formData.role_title}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, role_title: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="space-y-2 min-w-0">
                                            <Label htmlFor="tmo-add-location" className="text-sm font-medium">
                                                Location
                                            </Label>
                                            <Input
                                                id="tmo-add-location"
                                                className="h-11 bg-background"
                                                placeholder="e.g. Remote / SF"
                                                value={formData.location}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, location: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2 min-w-0">
                                            <Label htmlFor="tmo-add-status" className="text-sm font-medium">
                                                Status
                                            </Label>
                                            <select
                                                id="tmo-add-status"
                                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        status: e.target.value as JobStage,
                                                    })
                                                }
                                            >
                                                {JOB_STAGES.map((stage) => (
                                                    <option key={stage} value={stage}>
                                                        {stage}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tmo-add-url" className="text-sm font-medium">
                                            Job URL
                                        </Label>
                                        <Input
                                            id="tmo-add-url"
                                            className="h-11 bg-background"
                                            placeholder="https://..."
                                            type="url"
                                            inputMode="url"
                                            value={formData.job_url}
                                            onChange={(e) =>
                                                setFormData({ ...formData, job_url: e.target.value })
                                            }
                                        />
                                    </div>

                                    {formData.status !== "Wishlist" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="tmo-add-applied" className="text-sm font-medium">
                                                Date applied
                                            </Label>
                                            <Input
                                                id="tmo-add-applied"
                                                className="h-11 max-w-full sm:max-w-[12rem] bg-background"
                                                type="date"
                                                value={formData.applied_at}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, applied_at: e.target.value })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 sm:px-8 py-4 sm:py-5 border-t border-border/80 bg-muted/25 dark:bg-muted/15">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto min-h-11"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid || loading}
                                    className="w-full sm:w-auto min-h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {loading ? "Saving…" : "Save application"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
