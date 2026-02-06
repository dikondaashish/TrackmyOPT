"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

interface AddColumnModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { createJobStage } from "@/app/dashboard/career/job-tracker/actions";

// ... props

export function AddColumnModal({ isOpen, onClose }: AddColumnModalProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("bg-blue-100");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createJobStage({ title: name, color });
            onClose();
            // Router refresh handles the UI update
        } catch (error) {
            alert("Failed to create column. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Add Custom Stage
                    </DialogTitle>
                    <DialogDescription>
                        Create a custom stage for your job application pipeline.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Stage Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Assessment, On-site..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color Code</Label>
                        <div className="flex gap-2">
                            {['bg-blue-100', 'bg-purple-100', 'bg-pink-100', 'bg-orange-100', 'bg-emerald-100', 'bg-indigo-100'].map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${c} ${color === c ? 'ring-2 ring-offset-2 ring-black' : 'hover:ring-2 hover:ring-gray-300'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Stage"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
