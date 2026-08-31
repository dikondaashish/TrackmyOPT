"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

interface AddToTrackerModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyName: string;
    onSave: (job: JobTrackerItem) => void;
}

export interface JobTrackerItem {
    id: string;
    company: string;
    title: string;
    link?: string;
    location?: string;
    status: "Wishlist" | "Applied";
    dateAdded: string;
}

export function AddToTrackerModal({ isOpen, onClose, companyName, onSave }: AddToTrackerModalProps) {
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState<"Wishlist" | "Applied">("Wishlist");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: JobTrackerItem = {
            id: crypto.randomUUID(),
            company: companyName,
            title,
            link,
            location,
            status,
            dateAdded: new Date().toISOString(),
        };
        onSave(newItem);
        onClose();
        // Reset form
        setTitle("");
        setLink("");
        setLocation("");
        setStatus("Wishlist");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="add-job-tracker-title" className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 id="add-job-tracker-title" className="text-xl font-bold text-gray-900 dark:text-white">Add to Job Tracker</h3>
                    <button type="button" onClick={onClose} aria-label="Close add to job tracker dialog" className="min-h-11 min-w-11 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="job-tracker-company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                        <input
                            id="job-tracker-company"
                            type="text"
                            value={companyName}
                            disabled
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="job-tracker-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Title <span className="text-red-500">*</span></label>
                        <input
                            id="job-tracker-title"
                            type="text"
                            required
                            placeholder="e.g. Software Engineer"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="job-tracker-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                id="job-tracker-status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as JobTrackerItem["status"])}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            >
                                <option value="Wishlist">Wishlist</option>
                                <option value="Applied">Applied</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="job-tracker-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Optional)</label>
                            <input
                                id="job-tracker-location"
                                type="text"
                                placeholder="e.g. Remote"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="job-tracker-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Link (Optional)</label>
                        <input
                            id="job-tracker-link"
                            type="url"
                            placeholder="https://..."
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/25"
                        >
                            <Check className="w-5 h-5" />
                            Save to Job Tracker
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
