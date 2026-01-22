"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Download,
    Copy,
    RefreshCw,
    Sparkles,
    FileText,
    Code,
    Eye,
    Loader2,
    Check,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Settings,
} from "lucide-react";
import Link from "next/link";

// Sample LaTeX template
const generateSampleLatex = (templateId: string) => {
    return `%-------------------------
% Resume in LaTeX
% Template: ${templateId}
%-------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1in}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape John Doe} \\\\ \\vspace{1pt}
    \\small 123-456-7890 $|$ 
    \\href{mailto:john@email.com}{\\underline{john@email.com}} $|$ 
    \\href{https://linkedin.com/in/johndoe}{\\underline{linkedin.com/in/johndoe}} $|$
    \\href{https://github.com/johndoe}{\\underline{github.com/johndoe}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{University of Technology} \\hfill May 2024 \\\\
     Bachelor of Science in Computer Science \\hfill \\textit{GPA: 3.8/4.0} \\\\
    }}
  \\end{itemize}

%-----------EXPERIENCE-----------
\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Software Engineer Intern} \\hfill June 2023 -- August 2023 \\\\
     \\textit{Tech Company Inc.} \\hfill \\textit{San Francisco, CA} \\\\
     \\begin{itemize}
         \\item Developed and maintained web applications using React and Node.js
         \\item Collaborated with cross-functional teams to deliver features on time
         \\item Improved application performance by 40\\% through code optimization
     \\end{itemize}
    }}
  \\end{itemize}

%-----------SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: JavaScript, TypeScript, Python, Java, SQL} \\\\
     \\textbf{Frameworks}{: React, Node.js, Next.js, Express} \\\\
     \\textbf{Tools}{: Git, Docker, AWS, PostgreSQL, MongoDB}
    }}
 \\end{itemize}

\\end{document}`;
};

export default function ResumeEditorPage() {
    const [latexCode, setLatexCode] = useState("");
    const [templateId, setTemplateId] = useState("modern");
    const [resumeText, setResumeText] = useState("");
    const [jobText, setJobText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [editorWidth, setEditorWidth] = useState(50); // Percentage
    const [showPreview, setShowPreview] = useState(true);

    // Load data from sessionStorage
    useEffect(() => {
        const storedResume = sessionStorage.getItem("resumeGenerator_resumeText");
        const storedJob = sessionStorage.getItem("resumeGenerator_jobText");
        const storedTemplate = sessionStorage.getItem("resumeGenerator_template");

        if (storedResume) setResumeText(storedResume);
        if (storedJob) setJobText(storedJob);
        if (storedTemplate) setTemplateId(storedTemplate);

        // Generate initial LaTeX
        setLatexCode(generateSampleLatex(storedTemplate || "modern"));
    }, []);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(latexCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [latexCode]);

    const handleDownload = useCallback(() => {
        // Create a blob and download
        const blob = new Blob([latexCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.tex";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [latexCode]);

    const handleRegenerate = async () => {
        setIsGenerating(true);
        // Simulate AI regeneration
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLatexCode(generateSampleLatex(templateId));
        setIsGenerating(false);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <Link
                            href="/dashboard/career/resume-generator/templates"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Templates</span>
                        </Link>

                        {/* Title + Progress */}
                        <div className="text-center">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                                Resume Editor
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-1 rounded-full bg-blue-600" />
                                    <div className="w-6 h-1 rounded-full bg-blue-600" />
                                    <div className="w-6 h-1 rounded-full bg-blue-600" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Step 3 of 3</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="hidden sm:flex items-center gap-1"
                            >
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {isCopied ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownload}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-4 sm:px-6 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-1" />
                            )}
                            {isGenerating ? "Regenerating..." : "Regenerate with AI"}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowPreview(false); setEditorWidth(100); }}
                                className={`px-3 py-1 rounded ${!showPreview ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <Code className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowPreview(true); setEditorWidth(50); }}
                                className={`px-3 py-1 rounded ${showPreview && editorWidth === 50 ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowPreview(true); setEditorWidth(0); }}
                                className={`px-3 py-1 rounded ${showPreview && editorWidth === 0 ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* LaTeX Editor */}
                {editorWidth > 0 && (
                    <div
                        className="flex flex-col border-r border-gray-200 dark:border-gray-800"
                        style={{ width: showPreview ? `${editorWidth}%` : '100%' }}
                    >
                        {/* Editor Header */}
                        <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LaTeX Editor</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {latexCode.split('\n').length} lines
                            </span>
                        </div>

                        {/* Code Editor */}
                        <div className="flex-1 overflow-hidden">
                            <textarea
                                value={latexCode}
                                onChange={(e) => setLatexCode(e.target.value)}
                                className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
                                spellCheck={false}
                                style={{
                                    lineHeight: '1.6',
                                    tabSize: 2,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Resize Handle */}
                {showPreview && editorWidth > 0 && editorWidth < 100 && (
                    <div className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize flex-shrink-0" />
                )}

                {/* PDF Preview */}
                {showPreview && (
                    <div
                        className="flex flex-col bg-gray-100 dark:bg-gray-800"
                        style={{ width: editorWidth === 0 ? '100%' : `${100 - editorWidth}%` }}
                    >
                        {/* Preview Header */}
                        <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Preview</span>
                            </div>
                            <Button variant="ghost" size="sm">
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto p-6 flex justify-center">
                            <div className="w-full max-w-[8.5in] bg-white shadow-2xl rounded-lg overflow-hidden">
                                {/* Simulated PDF Preview */}
                                <div className="p-8 sm:p-12 min-h-[11in]">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-1">John Doe</h1>
                                        <p className="text-sm text-gray-600">
                                            123-456-7890 | john@email.com | linkedin.com/in/johndoe | github.com/johndoe
                                        </p>
                                    </div>

                                    {/* Education */}
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                                            EDUCATION
                                        </h2>
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-semibold">University of Technology</p>
                                                <p className="text-sm text-gray-600">Bachelor of Science in Computer Science</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">May 2024</p>
                                                <p className="text-sm text-gray-600 italic">GPA: 3.8/4.0</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                                            EXPERIENCE
                                        </h2>
                                        <div className="mb-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-semibold">Software Engineer Intern</p>
                                                    <p className="text-sm text-gray-600 italic">Tech Company Inc.</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm">June 2023 – August 2023</p>
                                                    <p className="text-sm text-gray-600 italic">San Francisco, CA</p>
                                                </div>
                                            </div>
                                            <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                                                <li>Developed and maintained web applications using React and Node.js</li>
                                                <li>Collaborated with cross-functional teams to deliver features on time</li>
                                                <li>Improved application performance by 40% through code optimization</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                                            TECHNICAL SKILLS
                                        </h2>
                                        <div className="text-sm">
                                            <p><strong>Languages:</strong> JavaScript, TypeScript, Python, Java, SQL</p>
                                            <p><strong>Frameworks:</strong> React, Node.js, Next.js, Express</p>
                                            <p><strong>Tools:</strong> Git, Docker, AWS, PostgreSQL, MongoDB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
