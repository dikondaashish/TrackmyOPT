"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteJobStage } from "@/app/dashboard/career/job-tracker/actions";
import { CustomStage } from "@/lib/career/job-tracker/types";

interface DeleteStageModalProps {
    isOpen: boolean;
    onClose: () => void;
    stageToDelete: CustomStage | null;
    onConfirm: () => void;
}

export function DeleteStageModal({ isOpen, onClose, stageToDelete, onConfirm }: DeleteStageModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!stageToDelete) return;
        setIsLoading(true);
        try {
            await deleteJobStage(stageToDelete.id);
            onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to delete stage", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 text-red-600 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <DialogTitle>Delete Column?</DialogTitle>
                    </div>
                    <DialogDescription className="space-y-3 pt-2">
                        <p>
                            Are you sure you want to delete the <span className="font-semibold text-foreground">"{stageToDelete?.title}"</span> column?
                        </p>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2 items-start text-sm text-amber-700 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>Any jobs currently in this column will be automatically moved to the <strong>"Applied"</strong> stage so you don't lose them.</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete Column"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
