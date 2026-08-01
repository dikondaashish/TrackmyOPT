/**
 * Side panel — the workspace surface for long-running agent work.
 *
 * The injected widget is destroyed on navigation, so a 30–60s résumé run died
 * whenever the user clicked anything. Chrome's side panel survives navigation
 * and gets real width for progress, approvals, and results, so agent runs live
 * here instead.
 *
 * Built entirely from the design primitives — no bespoke CSS.
 */

import {
    banner, button, card, heading, row, stack, text, liveRegion,
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

    const templateSelect = document.createElement('select');
    templateSelect.id = 'tmo-panel-template';
    templateSelect.style.cssText =
        'width:100%;min-height:var(--tmo-min-target);padding:var(--tmo-space-1\\.5) var(--tmo-space-2);' +
        'font-family:var(--tmo-font-sans);font-size:var(--tmo-text-md);color:var(--tmo-color-ink);' +
        'background:var(--tmo-color-surface);border:1px solid var(--tmo-color-border);' +
        'border-radius:var(--tmo-radius-sm)';
    for (const template of RESUME_TEMPLATES_FOR_PANEL) {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} — ${template.hint}`;
        templateSelect.appendChild(option);
    }

    const templateLabel = document.createElement('label');
    templateLabel.setAttribute('for', templateSelect.id);
    templateLabel.textContent = 'Template';
    templateLabel.style.cssText =
        'font-size:var(--tmo-text-sm);font-weight:var(--tmo-weight-medium)';

    const runSlot = stack({ gap: '3' });

    const tailorButton = button({
        label: 'Tailor résumé for this job',
        variant: 'primary',
        fullWidth: true,
        onClick: () => startRun(templateSelect.value, runSlot, tailorButton),
    });

    container.replaceChildren(
        stack({
            gap: '4',
            children: [
                stack({
                    gap: '1',
                    children: [
                        heading(1, context.roleTitle || 'This job', { size: 'xl' }),
                        text({
                            text: context.companyName || new URL(context.jobUrl || 'https://example.com').hostname,
                            size: 'sm',
                            tone: 'muted',
                        }),
                    ],
                }),
                card({
                    padding: '3',
                    label: 'Tailor résumé',
                    children: [
                        stack({
                            gap: '3',
                            children: [
                                stack({ gap: '1', children: [templateLabel, templateSelect] }),
                                tailorButton,
                            ],
                        }),
                    ],
                }),
                runSlot,
            ],
        })
    );
}

/* --------------------------------------------------------------- agent run */

function startRun(templateId: string, slot: HTMLElement, trigger: HTMLButtonElement): void {
    if (!jobContext) return;

    console_?.destroy();
    const handle = runConsole({
        title: 'Tailoring résumé',
        onCancel: () => client.cancel(),
        onRetry: () => startRun(templateId, slot, trigger),
    });
    console_ = handle;
    slot.replaceChildren(handle.node);
    trigger.disabled = true;

    client.start(
        'resume',
        {
            templateId,
            resumeId: '__latest__',
            jobDescription: jobContext.jobDescription,
            companyName: jobContext.companyName,
            roleTitle: jobContext.roleTitle,
            jobUrl: jobContext.jobUrl,
            jobKey: '',
            outputFilename: 'resume',
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
            if (chrome.runtime.lastError || !response?.jobDescription) {
                renderEmpty(
                    'No job posting detected on this page. Open a job listing and reopen this panel.'
                );
                return;
            }
            renderJob(response as JobContext);
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
