/**
 * Template list shared by the side panel and the in-page widget.
 *
 * The widget previously owned a private copy (SIDE_PANEL_TEMPLATES in
 * content-job-portal.ts) which drifted out of sync with the web app's
 * RESUME_TEMPLATES — it still advertised "Creative Portfolio — design ·
 * marketing" after that template became a single-column engineering résumé.
 * Both surfaces now read this one list, and extension-template-sync.test.ts
 * in the web app fails if it diverges from RESUME_TEMPLATES.
 *
 * Every shipped template is single-column and ATS-safe.
 */
export const RESUME_TEMPLATES_FOR_PANEL = [
    { id: 'professional', name: 'Professional', hint: 'ATS-safe · senior IC' },
    { id: 'tech', name: 'Tech Focused', hint: 'ATS-safe · backend & infra' },
    { id: 'modern', name: 'Modern Minimalist', hint: 'ATS-safe · software engineering' },
    { id: 'academic', name: 'Research & Academic', hint: 'ATS-safe · research & publications' },
    { id: 'executive', name: 'Executive Brief', hint: 'ATS-safe · leadership' },
    { id: 'creative', name: 'Creative Clean', hint: 'ATS-safe · frontend & product' },
] as const;

export type PanelTemplateId = (typeof RESUME_TEMPLATES_FOR_PANEL)[number]['id'];
