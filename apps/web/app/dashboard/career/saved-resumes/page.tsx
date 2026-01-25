"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    ArrowLeft,
    FileText,
    Trash2,
    Loader2,
    Calendar,
    ChevronRight,
    AlertCircle,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { format } from "date-fns";

interface SavedResume {
    id: string;
    filename: string;
    description: string;
    content: string;
    created_at: string;
}

export default function SavedResumesPage() {
    const router = useRouter();
    const { toast } = useToast();
    // const supabase = createClientComponentClient(); -> Removed, using imported singleton


    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("Please log in to view saved resumes.");
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/resume/list?userId=${user.id}`, {
                headers: {
                    "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY || "",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch resumes");

            const data = await response.json();
            setResumes(data);
        } catch (error) {
            console.error("Fetch error:", error);
            setError("Could not load your saved resumes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/resume/${id}?userId=${user.id}`, {
                method: "DELETE",
                headers: {
                    "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY || "",
                },
            });

            if (!response.ok) throw new Error("Failed to delete resume");

            toast({
                title: "Resume Deleted",
                description: "The resume has been removed from your profile.",
            });

            setResumes(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Delete Failed",
                description: "Could not delete the resume. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleLoadResume = (resume: SavedResume) => {
        // Store in localStorage to pass to generator page
        localStorage.setItem("selectedResumeData", JSON.stringify({
            text: resume.content,
            filename: resume.filename,
            source: "saved",
        }));
        router.push("/dashboard/career/resume-generator");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dashboard/career/resume-generator"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>

                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                Saved Resumes
                            </h1>
                        </div>

                        <Link href="/dashboard/career/resume-generator">
                            <Button size="sm" className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4" />
                                New Resume
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500">Loading your resumes...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Resumes</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Button onClick={fetchResumes}>Try Again</Button>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved resumes yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Upload and save your resumes to quickly access them when generating new applications.
                        </p>
                        <Link href="/dashboard/career/resume-generator">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Resume
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {resumes.map((resume) => (
                            <Card key={resume.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                <span className="truncate max-w-[200px]">{resume.filename}</span>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1.5 text-xs">
                                                <Calendar className="w-3 h-3" />
                                                Created {format(new Date(resume.created_at), "MMM d, yyyy")}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                                        {resume.content}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-2 flex justify-between border-t border-gray-100 dark:border-gray-800/50 mt-auto">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-8">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this resume from your saved list.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(resume.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <Button
                                        size="sm"
                                        onClick={() => handleLoadResume(resume)}
                                        className="text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 h-8 gap-1.5"
                                    >
                                        Use Resume
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
