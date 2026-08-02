/**
 * Side panel — the workspace surface for long-running agent work.
 *
 * The injected widget is destroyed on navigation, so a 30–60s résumé run died
 * whenever the user clicked anything. Chrome's side panel survives navigation
 * and gets real width for progress, approvals, and results, so agent runs live
 * here instead.
 *
 * Data flow mirrors the widget's proven resume chooser (openResumeChooser in
 * content-job-portal.ts): job description box -> resume source -> template ->
 * generate. The one addition over the widget is a "paste resume text" option
 * alongside the saved-resume dropdown, so a user does not need a saved resume
 * on file to use the panel.
 *
 * Built entirely from the design primitives — no bespoke CSS.
 */

import {
    banner, button, card, field, heading, row, select, stack, text, textarea, liveRegion,
} from './design/primitives';
import { ensureThemeStyle } from './design/theme-css';
import { runConsole, type RunConsoleHandle } from './agent/run-console';
import { AgentRunClient } from './agent/run-client';
import { RESUME_TEMPLATES_FOR_PANEL } from './agent/panel-templates';

interface JobContext {
    roleTitle: string;
    companyName: string;
    jobUrl: string;
    jobDescription: string;
}

interface SavedResumeOption {
    id: string;
    filename: string;
    updatedAt?: string | null;
}

type ResumeSource = 'saved' | 'paste';

const client = new AgentRunClient();
let console_: RunConsoleHandle | null = null;
let jobContext: JobContext | null = null;

const root = document.getElementById('root');

function shell(): HTMLElement {
    document.body.style.cssText =
        'margin:0;padding:var(--tmo-space-4);background:var(--tmo-color-bg);' +
        'font-family:var(--tmo-font-sans);color:var(--tmo-color-ink);min-height:100vh';
    return root as HTMLElement;
}

/* ------------------------------------------------------------------ states */

function renderEmpty(message: string): void {
    const container = shell();
    container.replaceChildren(
        stack({
            gap: '3',
            children: [
                heading(1, 'TrackMyOPT'),
                banner({ tone: 'info', message }),
            ],
        })
    );
}

function renderJob(context: JobContext): void {
    const container = shell();
    jobContext = context;

    /* ---- job description: editable, pre-filled from the detected posting --- */
    const jdBox = textarea({
        rows: 7,
        placeholder: 'Paste the job description here',
        value: context.jobDescription,
        attrs: { 'aria-label': 'Job description' },
    });
    const jdCount = text({
        text: `${context.jobDescription.length.toLocaleString()} characters`,
        size: 'xs',
        tone: 'muted',
    });
    jdBox.addEventListener('input', () => {
        jdCount.textContent = `${jdBox.value.length.toLocaleString()} characters`;
        updateGenerateEnabled();
    });

    /* ---- resume source: saved dropdown, or paste ---------------------------- */
    const savedSelect = select({ options: [{ value: '', label: 'Loading your saved resumes…' }] });
    savedSelect.disabled = true;
    const pasteBox = textarea({
        rows: 8,
        placeholder: 'Paste your resume text here',
        attrs: { 'aria-label': 'Resume text' },
    });

    const savedBlock = stack({ gap: '1', children: [field({ label: 'Saved résumé', control: savedSelect })] });
    const pasteBlock = stack({ gap: '1', children: [field({ label: 'Resume text', control: pasteBox })] });
    pasteBlock.style.display = 'none';

    let resumeSource: ResumeSource = 'saved';
    const savedToggle = button({
        label: 'Use saved résumé',
        variant: 'primary',
        size: 'sm',
        attrs: { 'aria-pressed': 'true' },
        onClick: () => setResumeSource('saved'),
    });
    const pasteToggle = button({
        label: 'Paste résumé text',
        variant: 'secondary',
        size: 'sm',
        attrs: { 'aria-pressed': 'false' },
        onClick: () => setResumeSource('paste'),
    });

    function setResumeSource(next: ResumeSource): void {
        resumeSource = next;
        savedBlock.style.display = next === 'saved' ? '' : 'none';
        pasteBlock.style.display = next === 'paste' ? '' : 'none';
        savedToggle.setAttribute('aria-pressed', String(next === 'saved'));
        pasteToggle.setAttribute('aria-pressed', String(next === 'paste'));
        // button() has no variant setter; re-derive the visual state via class-free
        // background swap so the pressed control reads as selected.
        savedToggle.style.background = next === 'saved' ? 'var(--tmo-color-accent)' : 'var(--tmo-color-surface)';
        savedToggle.style.color = next === 'saved' ? 'var(--tmo-color-on-accent)' : 'var(--tmo-color-ink)';
        pasteToggle.style.background = next === 'paste' ? 'var(--tmo-color-accent)' : 'var(--tmo-color-surface)';
        pasteToggle.style.color = next === 'paste' ? 'var(--tmo-color-on-accent)' : 'var(--tmo-color-ink)';
        updateGenerateEnabled();
    }

    pasteBox.addEventListener('input', updateGenerateEnabled);
    savedSelect.addEventListener('change', updateGenerateEnabled);

    /* ---- template ------------------------------------------------------------ */
    const templateSelect = select({
        options: RESUME_TEMPLATES_FOR_PANEL.map((t) => ({ value: t.id, label: `${t.name} — ${t.hint}` })),
    });

    /* ---- generate -------------------------------------------------------------- */
    const runSlot = stack({ gap: '3' });
    const tailorButton = button({
        label: 'Tailor résumé for this job',
        variant: 'primary',
        fullWidth: true,
        disabled: true,
        onClick: () => startRun({
            templateId: templateSelect.value,
            jobDescription: jdBox.value,
            resumeSource,
            resumeId: savedSelect.value,
            resumeText: pasteBox.value,
        }, runSlot, tailorButton),
    });

    function updateGenerateEnabled(): void {
        const hasJd = jdBox.value.trim().length > 0;
        const hasResume =
            resumeSource === 'saved' ? Boolean(savedSelect.value) : pasteBox.value.trim().length > 0;
        tailorButton.disabled = !(hasJd && hasResume);
    }

    container.replaceChildren(
        stack({
            gap: '4',
            children: [
                stack({
                    gap: '1',
                    children: [
                        heading(1, context.roleTitle || 'This job', { size: 'xl' }),
                        text({
                            text: context.companyName || safeHostname(context.jobUrl),
                            size: 'sm',
                            tone: 'muted',
                        }),
                    ],
                }),
                card({
                    padding: '3',
                    label: 'Job description',
                    children: [
                        stack({
                            gap: '1',
                            children: [
                                field({ label: 'Job description', control: jdBox }),
                                jdCount,
                            ],
                        }),
                    ],
                }),
                card({
                    padding: '3',
                    label: 'Résumé',
                    children: [
                        stack({
                            gap: '3',
                            children: [
                                row({ gap: '2', children: [savedToggle, pasteToggle] }),
                                savedBlock,
                                pasteBlock,
                            ],
                        }),
                    ],
                }),
                card({
                    padding: '3',
                    label: 'Template',
                    children: [field({ label: 'Template', control: templateSelect })],
                }),
                tailorButton,
                runSlot,
            ],
        })
    );

    loadSavedResumes(savedSelect, updateGenerateEnabled);
}

function safeHostname(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

/* --------------------------------------------------------------- resumes */

function loadSavedResumes(savedSelect: HTMLSelectElement, onLoaded: () => void): void {
    chrome.runtime.sendMessage(
        { type: 'LIST_SAVED_RESUMES' },
        (response: { ok?: boolean; error?: string; resumes?: SavedResumeOption[] } | undefined) => {
            const resumes = response?.ok ? response.resumes ?? [] : [];
            savedSelect.disabled = false;
            savedSelect.replaceChildren();

            if (chrome.runtime.lastError || !response?.ok) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent =
                    response?.error === 'not_signed_in'
                        ? 'Sign in to TrackMyOPT to load your résumés'
                        : 'Could not load saved résumés';
                savedSelect.appendChild(option);
                savedSelect.disabled = true;
                onLoaded();
                return;
            }

            if (resumes.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No saved résumés — paste your résumé text instead';
                savedSelect.appendChild(option);
                savedSelect.disabled = true;
                onLoaded();
                return;
            }

            for (const resume of resumes) {
                const option = document.createElement('option');
                option.value = resume.id;
                option.textContent = resume.filename;
                savedSelect.appendChild(option);
            }
            onLoaded();
        }
    );
}

/* --------------------------------------------------------------- agent run */

interface StartRunInput {
    templateId: string;
    jobDescription: string;
    resumeSource: ResumeSource;
    resumeId: string;
    resumeText: string;
}

function startRun(input: StartRunInput, slot: HTMLElement, trigger: HTMLButtonElement): void {
    if (!jobContext) return;

    console_?.destroy();
    const handle = runConsole({
        title: 'Tailoring résumé',
        onCancel: () => client.cancel(),
        onRetry: () => startRun(input, slot, trigger),
    });
    console_ = handle;
    slot.replaceChildren(handle.node);
    trigger.disabled = true;

    client.start(
        'resume',
        {
            templateId: input.templateId,
            jobDescription: input.jobDescription.trim(),
            companyName: jobContext.companyName,
            roleTitle: jobContext.roleTitle,
            jobUrl: jobContext.jobUrl,
            jobKey: '',
            outputFilename: 'resume',
            ...(input.resumeSource === 'paste'
                ? { resumeText: input.resumeText.trim(), resumeId: '' }
                : { resumeId: input.resumeId }),
        },
        {
            onState: (state, steps) => {
                handle.setState(state, steps);
                if (state === 'succeeded' || state === 'failed' || state === 'cancelled') {
                    trigger.disabled = false;
                }
            },
            onStep: (step) => handle.updateStep(step),
            onError: (error) => {
                handle.showError(error);
                trigger.disabled = false;
            },
            onDone: (result) => renderResult(result, slot, handle),
        }
    );
}

function renderResult(result: unknown, slot: HTMLElement, handle: RunConsoleHandle): void {
    const data = result as { pdfBase64?: string; editorUrl?: string; baselineScore?: number; generatedScore?: number };
    const scoreLine =
        data.baselineScore !== undefined && data.generatedScore !== undefined
            ? `Match score ${data.baselineScore} → ${data.generatedScore}`
            : 'Résumé ready.';

    const actions: HTMLElement[] = [];
    if (data.pdfBase64) {
        actions.push(
            button({
                label: 'Download PDF',
                variant: 'primary',
                size: 'sm',
                onClick: () => downloadPdf(data.pdfBase64 as string),
            })
        );
    }
    if (data.editorUrl) {
        actions.push(
            button({
                label: 'Open in editor',
                variant: 'secondary',
                size: 'sm',
                onClick: () => chrome.tabs.create({ url: data.editorUrl }),
            })
        );
    }

    slot.replaceChildren(
        handle.node,
        banner({ tone: 'success', title: 'Done', message: scoreLine, actions })
    );
}

function downloadPdf(base64: string): void {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    chrome.tabs.create({ url });
}

/* ------------------------------------------------------------------- boot */

function requestJobContext(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId === undefined) {
            renderEmpty('Open a job posting to get started.');
            return;
        }
        chrome.tabs.sendMessage(tabId, { type: 'TMO_GET_JOB_CONTEXT' }, (response) => {
            // A job description is no longer required to render the form — the
            // job description box is editable, so the user can paste one in.
            // What still gates rendering is being on a page the content script
            // recognised as a job posting at all (a role, company, or URL).
            const context = response as JobContext | undefined;
            const hasJobContext = Boolean(
                context && (context.roleTitle || context.companyName || context.jobUrl)
            );
            if (chrome.runtime.lastError || !hasJobContext) {
                renderEmpty(
                    'No job posting detected on this page. Open a job listing and reopen this panel.'
                );
                return;
            }
            renderJob(context!);
        });
    });
}

ensureThemeStyle(document, { scope: ':root' });
const boot = liveRegion('polite');
document.body.appendChild(boot.node);
requestJobContext();

// Re-read context when the user switches tabs, so the panel always reflects
// what they are looking at.
chrome.tabs.onActivated.addListener(() => requestJobContext());
