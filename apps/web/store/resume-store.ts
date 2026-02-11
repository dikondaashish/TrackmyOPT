
import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface AtsAnalysis {
    passed: boolean;
    score: number;
    issues: string[];
}

interface ResumeState {
    resumeText: string;
    resumeFilename: string | null;
    jobDescription: string;
    jobTitle: string | null;
    selectedTemplateId: string | null;
    selectedColor: { name: string; class: string; ring: string } | null;
    generatedLatex: string;
    compiledPdfUrl: string | null;
    atsAnalysis: AtsAnalysis | null;
    isGenerating: boolean;
    isCompiling: boolean;

    setResumeText: (text: string, filename?: string) => void;
    setJobDescription: (text: string, title?: string) => void;
    setSelectedTemplateId: (id: string) => void;
    setSelectedColor: (color: { name: string; class: string; ring: string } | null) => void;
    setGeneratedLatex: (latex: string) => void;
    setCompiledPdfUrl: (url: string) => void;
    setAtsAnalysis: (analysis: AtsAnalysis | null) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    setIsCompiling: (isCompiling: boolean) => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeState>()(
    persist(
        (set) => ({
            resumeText: '',
            resumeFilename: null,
            jobDescription: '',
            jobTitle: null,
            selectedTemplateId: 'modern',
            selectedColor: null,
            generatedLatex: '',
            compiledPdfUrl: null,
            atsAnalysis: null,
            isGenerating: false,
            isCompiling: false,

            setResumeText: (text: string, filename?: string) => set({ resumeText: text, resumeFilename: filename || null }),
            setJobDescription: (text: string, title?: string) => set({ jobDescription: text, jobTitle: title || null }),
            setSelectedTemplateId: (id: string) => set({ selectedTemplateId: id }),
            setSelectedColor: (color: { name: string; class: string; ring: string } | null) => set({ selectedColor: color }),
            setGeneratedLatex: (latex: string) => set({ generatedLatex: latex }),
            setCompiledPdfUrl: (url: string) => set({ compiledPdfUrl: url }),
            setAtsAnalysis: (analysis: AtsAnalysis | null) => set({ atsAnalysis: analysis }),
            setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
            setIsCompiling: (isCompiling: boolean) => set({ isCompiling }),
            reset: () => set({
                resumeText: '',
                resumeFilename: null,
                jobDescription: '',
                jobTitle: null,
                selectedTemplateId: 'modern',
                selectedColor: null,
                generatedLatex: '',
                compiledPdfUrl: null,
                atsAnalysis: null,
                isGenerating: false,
                isCompiling: false
            })
        }),
        {
            name: 'resume-storage',
            partialize: (state) => ({
                resumeText: state.resumeText,
                resumeFilename: state.resumeFilename,
                jobDescription: state.jobDescription,
                jobTitle: state.jobTitle,
                selectedTemplateId: state.selectedTemplateId,
                selectedColor: state.selectedColor,
                generatedLatex: state.generatedLatex,
                atsAnalysis: state.atsAnalysis
            }),
        } as PersistOptions<ResumeState>
    )
);
