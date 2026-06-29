"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, Download } from "lucide-react";

interface DownloadGateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    score: number;
    onFixAutomatically: () => void;
    onDownloadAnyway: () => void;
    isFixing?: boolean;
}

export function DownloadGateModal({
    open,
    onOpenChange,
    score,
    onFixAutomatically,
    onDownloadAnyway,
    isFixing,
}: DownloadGateModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Resume may not pass ATS
                    </DialogTitle>
                    <DialogDescription>
                        Your ATS score is <strong>{score}/100</strong> (target: 75+). Many
                        companies auto-reject below this threshold. Fix gaps before applying, or
                        download anyway if you have reviewed manually.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onDownloadAnyway}
                        className="w-full sm:w-auto"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download anyway
                    </Button>
                    <Button
                        onClick={onFixAutomatically}
                        disabled={isFixing}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isFixing ? "Fixing…" : "Fix automatically"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
