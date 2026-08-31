
import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { extractJobTitle, isLikelyFilename, normalizeRoleTitle } from '@/lib/resume/extract-job-title';
import { normalizeAtsAnalysis, type AtsAnalysis } from '@/lib/resume/ats-analysis-types';
import type { TemplateColor } from '@/lib/documents/templates';

export type { AtsAnalysis };

function resolveStoredJobTitle(title: string | undefined, text: string): string | null {
    if (title === undefined) return null;
    if (!title.trim()) return null;
    if (isLikelyFilename(title)) return extractJobTitle(text);
    return normalizeRoleTitle(title);
}

interface ResumeState {
    resumeText: string;
    resumeFilename: string | null;
    jobDescription: string;
    jobTitle: string | null;
    applicationId: string | null;
    selectedTemplateId: string | null;
    selectedColor: TemplateColor | null;
    generatedLatex: string;
    compiledPdfUrl: string | null;
    atsAnalysis: AtsAnalysis | null;
    isGenerating: boolean;
    isCompiling: boolean;

    setResumeText: (text: string, filename?: string) => void;
    setJobDescription: (text: string, title?: string) => void;
    setApplicationId: (id: string | null) => void;
    setSelectedTemplateId: (id: string) => void;
    setSelectedColor: (color: TemplateColor | null) => void;
    setGeneratedLatex: (latex: string) => void;
    setCompiledPdfUrl: (url: string) => void;
    setAtsAnalysis: (analysis: AtsAnalysis | null) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    setIsCompiling: (isCompiling: boolean) => void;
    reset: () => void;
}

type PersistedResumeState = Pick<
    ResumeState,
    | 'resumeText'
    | 'resumeFilename'
    | 'jobDescription'
    | 'jobTitle'
    | 'applicationId'
    | 'selectedTemplateId'
    | 'selectedColor'
    | 'generatedLatex'
    | 'atsAnalysis'
>;

export const useResumeStore = create<ResumeState>()(
    persist(
        (set) => ({
            resumeText: '',
            resumeFilename: null,
            jobDescription: '',
            jobTitle: null,
            applicationId: null,
            selectedTemplateId: 'professional',
            selectedColor: null,
            generatedLatex: '',
            compiledPdfUrl: null,
            atsAnalysis: null,
            isGenerating: false,
            isCompiling: false,

            setResumeText: (text: string, filename?: string) => set({ resumeText: text, resumeFilename: filename || null }),
            setJobDescription: (text: string, title?: string) =>
                set((state) => {
                    const trimmed = text.trim();
                    if (!trimmed) {
                        return { jobDescription: text, jobTitle: null };
                    }

                    if (title !== undefined) {
                        return {
                            jobDescription: text,
                            jobTitle: resolveStoredJobTitle(title, text),
                        };
                    }

                    return {
                        jobDescription: text,
                        jobTitle: extractJobTitle(text) ?? state.jobTitle,
                    };
                }),
            setApplicationId: (id: string | null) => set({ applicationId: id }),
            setSelectedTemplateId: (id: string) => set({ selectedTemplateId: id }),
            setSelectedColor: (color: TemplateColor | null) => set({ selectedColor: color }),
            setGeneratedLatex: (latex: string) => set({ generatedLatex: latex }),
            setCompiledPdfUrl: (url: string) => set({ compiledPdfUrl: url }),
            setAtsAnalysis: (analysis: AtsAnalysis | null) =>
                set({ atsAnalysis: normalizeAtsAnalysis(analysis) }),
            setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
            setIsCompiling: (isCompiling: boolean) => set({ isCompiling }),
            reset: () => set({
                resumeText: '',
                resumeFilename: null,
                jobDescription: '',
                jobTitle: null,
                applicationId: null,
                selectedTemplateId: 'professional',
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
                applicationId: state.applicationId,
                selectedTemplateId: state.selectedTemplateId,
                selectedColor: state.selectedColor,
                generatedLatex: state.generatedLatex,
                atsAnalysis: state.atsAnalysis
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                state.setAtsAnalysis(state.atsAnalysis);
            },
        } as PersistOptions<ResumeState, PersistedResumeState>
    )
);
