"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Check,
    Crown,
    Sparkles,
    ChevronRight,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    isPremium: boolean;
    preview: string; // Color for preview placeholder
}

const templates: Template[] = [
    {
        id: "modern",
        name: "Modern",
        description: "Clean, minimal design with bold headers",
        category: "Professional",
        isPremium: false,
        preview: "from-blue-500 to-cyan-500",
    },
    {
        id: "professional",
        name: "Professional",
        description: "Traditional corporate style, ATS-friendly",
        category: "Business",
        isPremium: false,
        preview: "from-gray-600 to-gray-800",
    },
    {
        id: "creative",
        name: "Creative",
        description: "Bold colors with unique layout",
        category: "Design",
        isPremium: true,
        preview: "from-purple-500 to-pink-500",
    },
    {
        id: "academic",
        name: "Academic",
        description: "Research and CV focused format",
        category: "Education",
        isPremium: false,
        preview: "from-emerald-500 to-teal-500",
    },
    {
        id: "executive",
        name: "Executive",
        description: "Premium design for senior roles",
        category: "Leadership",
        isPremium: true,
        preview: "from-amber-500 to-orange-500",
    },
    {
        id: "tech",
        name: "Tech Focus",
        description: "Optimized for software and engineering",
        category: "Technology",
        isPremium: false,
        preview: "from-indigo-500 to-violet-500",
    },
];

export default function TemplateSelectionPage() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [jobText, setJobText] = useState("");

    // Load data from sessionStorage
    useEffect(() => {
        const storedResume = sessionStorage.getItem("resumeGenerator_resumeText");
        const storedJob = sessionStorage.getItem("resumeGenerator_jobText");

        if (storedResume) setResumeText(storedResume);
        if (storedJob) setJobText(storedJob);
    }, []);

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
    };

    const handleContinue = () => {
        if (!selectedTemplate) return;

        // Store template selection
        sessionStorage.setItem("resumeGenerator_template", selectedTemplate);

        router.push("/dashboard/career/resume-generator/editor");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <Link
                            href="/dashboard/career/resume-generator"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>

                        {/* Title + Progress */}
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                Select Template
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-1 rounded-full bg-blue-600" />
                                    <div className="w-8 h-1 rounded-full bg-blue-600" />
                                    <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Step 2 of 3</span>
                            </div>
                        </div>

                        {/* Placeholder for alignment */}
                        <div className="w-20" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Resume loaded: {resumeText.length} characters
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Job description: {jobText.length} characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            onClick={() => handleSelectTemplate(template.id)}
                            className={`relative cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${selectedTemplate === template.id
                                    ? "ring-2 ring-blue-600 dark:ring-blue-400 shadow-xl shadow-blue-500/20"
                                    : "border-gray-200 dark:border-gray-800"
                                }`}
                        >
                            {/* Preview Area */}
                            <div className={`h-40 bg-gradient-to-br ${template.preview} relative`}>
                                {/* Template Preview Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-32 bg-white/90 dark:bg-gray-900/90 rounded shadow-lg p-2">
                                        <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-2 w-18 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                                        <div className="h-2 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-2 w-18 bg-gray-200 dark:bg-gray-800 rounded" />
                                    </div>
                                </div>

                                {/* Premium Badge */}
                                {template.isPremium && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        Premium
                                    </div>
                                )}

                                {/* Selected Check */}
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Template Info */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {template.name}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {template.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedTemplate}
                        className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Resume
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {!selectedTemplate && (
                    <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Select a template to continue
                    </p>
                )}
            </div>
        </div>
    );
}
