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
import { WEBSITE_URL } from './config';
import { looksLikeRealJobPostingText, jobDescriptionCacheKey, htmlToPlainText } from './job-description';
import { jobDescriptionField } from './job-description-field';
import type { JobDescriptionResolution } from './job-description-scrape';
import { downloadGeneratedPdf } from './job-portal-widget-ui';
import { savedJobResumeCard } from './saved-job-resume-card';
import { savedResumeChangeHint, type SavedJobResumeResponse } from './saved-job-resume';
import type { GeneratedResumeArtifactV1 } from './resume-autofill-contract';
import {
    getAlignJobTitlesPreference,
    setAlignJobTitlesPreference,
} from './resume-generation-preferences';
import {
    arrayBufferToBase64,
    describeOversizedResumeFile,
    describeUnsupportedResumeFile,
    isResumeFileSizeAllowed,
    isSupportedResumeFileName,
} from './resume-file-upload';

interface JobContext {
    tabId?: number;
    roleTitle: string;
    companyName: string;
    jobUrl: string;
    /** Live page URL — must match what Prefill uses for artifact matching. */
    pageUrl: string;
    jobDescription: string;
    jobDescriptionSource?: JobDescriptionResolution['source'];
    jobDescriptionSourceUrl?: string;
    applicationId?: string;
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
        'margin:0;padding:16px;background:var(--tmo-color-bg);box-sizing:border-box;' +
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
    const savedJobSlot = stack({gap:'2',children:[text({text:'Checking for a tailored résumé…',size:'xs',tone:'muted'})]});
    savedJobSlot.setAttribute('aria-live','polite');
    let savedArtifact: GeneratedResumeArtifactV1 | null = null;
    let savedDate: string | undefined;
    let savedCard: ReturnType<typeof savedJobResumeCard> | undefined;
    let lookupRevision = 0;
    function showSaved(artifact:GeneratedResumeArtifactV1, generatedAt:string|undefined, savedToAccount:boolean) {
        savedArtifact = artifact; savedDate = generatedAt;
        savedCard = savedJobResumeCard({artifact,generatedAt,savedToAccount,
            onDownload:()=>downloadGeneratedPdf(artifact.pdf.base64,artifact.pdf.filename),
            onPreview:()=>previewResumePdf(artifact.pdf.base64),
            onPrefill:async()=>{
                if (context.tabId === undefined) return false;
                const result = await chrome.tabs.sendMessage(context.tabId,{type:'TMO_PREFILL_SAVED_RESUME',jobUrl:context.pageUrl,artifactId:artifact.artifactId});
                return result?.ok === true;
            },
            onRetrySave:async()=>{
                const response = await chrome.runtime.sendMessage({type:'RETRY_JOB_RESUME_SAVE',jobUrl:context.pageUrl,artifactId:artifact.artifactId});
                if (response?.ok && savedJobSlot.isConnected) showSaved(artifact,generatedAt,true);
                return response?.ok === true;
            },
        });
        savedJobSlot.replaceChildren(savedCard.node);
        updateGenerateEnabled();
    }
    async function loadJobResume() {
        const revision = ++lookupRevision;
        let result: SavedJobResumeResponse;
        try { result = await chrome.runtime.sendMessage({type:'GET_SAVED_JOB_RESUME',jobUrl:context.pageUrl}); }
        catch { result = {ok:false,error:'unavailable'}; }
        if (!savedJobSlot.isConnected || revision !== lookupRevision) return;
        if (result?.ok && result.artifact) showSaved(result.artifact,result.generatedAt,result.savedToAccount !== false);
        else if (result?.ok) savedJobSlot.replaceChildren();
        else savedJobSlot.replaceChildren(banner({tone:'warning',message:result?.error === 'not_signed_in' ? 'Sign in to see your saved résumé.' : 'Could not check for a saved résumé.',actions:[button({label:'Retry',size:'sm',onClick:()=>void loadJobResume()})]}));
    }

    /* ---- job description: editable, pre-filled from the detected posting --- */
    const descriptionField = jobDescriptionField({
        initial: {text:context.jobDescription,source:context.jobDescriptionSource || 'current_page',sourceUrl:context.jobDescriptionSourceUrl || jobDescriptionCacheKey(context.pageUrl)},
        onChange: () => updateGenerateEnabled(),
        onOpenOverview: () => {
            const url = context.jobDescriptionSourceUrl || jobDescriptionCacheKey(context.pageUrl);
            if (/^https?:\/\//.test(url)) void chrome.tabs.create({url});
        },
        onRetry: async () => {
            const latest = await readActiveJobContext();
            if (!latest || latest.pageUrl !== context.pageUrl) throw new Error('job_changed');
            return {text:latest.jobDescription,source:latest.jobDescriptionSource || 'current_page',sourceUrl:latest.jobDescriptionSourceUrl || ''};
        },
    });
    const jdBox = descriptionField.input;

    /* ---- resume source: saved dropdown, or paste ---------------------------- */
    const savedSelect = select({ options: [{ value: '', label: 'Loading your saved resumes…' }] });
    savedSelect.disabled = true;
    const pasteBox = textarea({
        rows: 8,
        placeholder: 'Paste your resume text here',
        attrs: { 'aria-label': 'Resume text' },
    });

    /* ---- upload: same website endpoint as the dashboard, no client-side --- */
    /* ---- PDF/DOCX parsing or OCR duplicated in the extension --------------- */
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = '.pdf,.docx,.txt';
    uploadInput.style.display = 'none';
    const uploadStatus = stack({ gap: '1' });
    const uploadButton = button({
        label: 'Upload PDF / DOCX / TXT',
        variant: 'secondary',
        size: 'sm',
        onClick: () => uploadInput.click(),
    });
    uploadInput.addEventListener('change', () => {
        const file = uploadInput.files?.[0];
        uploadInput.value = ''; // allow re-selecting the same file after a fix
        if (!file) return;
        handleResumeFileUpload(file, uploadStatus, pasteBox, () => {
            setResumeSource('paste');
            updateGenerateEnabled();
        });
    });

    const savedBlock = stack({ gap: '1', children: [field({ label: 'Saved résumé', control: savedSelect })] });
    const pasteBlock = stack({
        gap: '2',
        children: [
            field({ label: 'Resume text', control: pasteBox }),
            row({
                gap: '2',
                align: 'center',
                children: [uploadButton, text({ text: 'or upload a file · max 10MB', size: 'xs', tone: 'muted' })],
            }),
            uploadStatus,
            uploadInput,
        ],
    });
    pasteBlock.style.display = 'none';

    let resumeSource: ResumeSource = 'saved';
    const savedToggle = button({
        label: 'Saved résumé',
        variant: 'primary',
        size: 'sm',
        attrs: { 'aria-pressed': 'true' },
        onClick: () => setResumeSource('saved'),
    });
    const pasteToggle = button({
        label: 'Paste or upload',
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
        // Swap variant classes so CSS hover still works (inline bg would block it).
        savedToggle.classList.toggle('tmo-ds-btn--primary', next === 'saved');
        savedToggle.classList.toggle('tmo-ds-btn--secondary', next !== 'saved');
        pasteToggle.classList.toggle('tmo-ds-btn--primary', next === 'paste');
        pasteToggle.classList.toggle('tmo-ds-btn--secondary', next !== 'paste');
        updateGenerateEnabled();
    }

    pasteBox.addEventListener('input', updateGenerateEnabled);
    savedSelect.addEventListener('change', () => {
        savedSelect.title = savedSelect.selectedOptions[0]?.textContent || '';
        updateGenerateEnabled();
    });

    /* ---- template ------------------------------------------------------------ */
    const templateSelect = select({
        options: RESUME_TEMPLATES_FOR_PANEL.map((t) => ({ value: t.id, label: `${t.name} · ${t.hint}` })),
    });

    const alignJobTitlesCheckbox = document.createElement('input');
    alignJobTitlesCheckbox.type = 'checkbox';
    alignJobTitlesCheckbox.id = 'tmo-sidepanel-align-job-titles';
    void getAlignJobTitlesPreference().then((enabled) => {
        alignJobTitlesCheckbox.checked = enabled;
    });
    alignJobTitlesCheckbox.addEventListener('change', () => {
        void setAlignJobTitlesPreference(alignJobTitlesCheckbox.checked);
    });
    const alignJobTitlesLabel = document.createElement('label');
    alignJobTitlesLabel.htmlFor = 'tmo-sidepanel-align-job-titles';
    alignJobTitlesLabel.textContent = 'Align job titles to this role';
    alignJobTitlesLabel.style.cssText = 'font-size:var(--tmo-text-sm);cursor:pointer;';
    const alignJobTitlesHelp = text({
        text: 'Adjusts title wording for this role. Companies and dates stay unchanged. Review all changes before applying.',
        size: 'xs',
        tone: 'muted',
    });

    /* ---- generate -------------------------------------------------------------- */
    const runSlot = stack({ gap: '3' });
    const advanced = document.createElement('details');
    advanced.className = 'tmo-resume-advanced';
    const advancedSummary = document.createElement('summary');
    advancedSummary.textContent = 'Title alignment (optional)';
    advanced.append(advancedSummary,row({gap:'2',align:'center',children:[alignJobTitlesCheckbox,alignJobTitlesLabel]}),alignJobTitlesHelp);
    const sourceSwitch = row({gap:'1',children:[savedToggle,pasteToggle]});
    sourceSwitch.classList.add('tmo-resume-source-switch');
    const tailorButton = button({
        label: 'Create tailored résumé',
        variant: 'primary',
        fullWidth: true,
        disabled: true,
        onClick: () => startRun({
            templateId: templateSelect.value,
            jobDescription: jdBox.value,
            resumeSource,
            resumeId: savedSelect.value,
            resumeText: pasteBox.value,
            alignJobTitles: alignJobTitlesCheckbox.checked,
        }, runSlot, tailorButton, (result) => {
            if (!savedJobSlot.isConnected) return;
            ++lookupRevision; // Ignore a lookup started before this generation completed.
            const data = result as {artifact?:GeneratedResumeArtifactV1;savedToAccount?:boolean};
            if (data.artifact) showSaved(data.artifact,data.artifact.generatedAt,data.savedToAccount === true);
        }),
    });

    function updateGenerateEnabled(): void {
        const hasJd = descriptionField.isValid();
        const hasResume =
            resumeSource === 'saved' ? Boolean(savedSelect.value) : pasteBox.value.trim().length > 0;
        tailorButton.disabled = tailorButton.dataset.running === 'true' || !(hasJd && hasResume);
        if (tailorButton.dataset.running !== 'true') {
            const label = tailorButton.querySelector('span');
            if (label) label.textContent = savedArtifact ? 'Create a new version' : 'Create tailored résumé';
        }
        if (savedArtifact && savedCard) {
            savedCard.setHint(savedResumeChangeHint(savedArtifact,descriptionField.isValid()?jdBox.value:'',resumeSource==='saved' && savedSelect.value ? {id:savedSelect.value,updatedAt:savedSelect.selectedOptions[0]?.dataset.updatedAt}:undefined,savedDate));
        }
    }
    tailorButton.addEventListener('tmo-run-settled',updateGenerateEnabled);

    container.replaceChildren(
        stack({
            gap: '3',
            children: [
                stack({
                    gap: '1',
                    children: [
                        text({text:'TAILOR YOUR RÉSUMÉ',size:'xs',tone:'muted',weight:'medium',style:'letter-spacing:.06em'}),
                        heading(1, htmlToPlainText(context.roleTitle) || 'This job', { size: 'lg' }),
                        text({
                            text: htmlToPlainText(context.companyName) || safeHostname(context.jobUrl),
                            size: 'sm',
                            tone: 'muted',
                        }),
                    ],
                }),
                savedJobSlot,
                card({
                    padding: '3',
                    label: 'Job description',
                    children: [
                        descriptionField.node,
                    ],
                }),
                card({
                    padding: '3',
                    label: 'Résumé',
                    children: [
                        stack({
                            gap: '3',
                            children: [
                                sourceSwitch,
                                savedBlock,
                                pasteBlock,
                                field({ label: 'Template', control: templateSelect }),
                                advanced,
                            ],
                        }),
                    ],
                }),
                runSlot,
                tailorButton,
            ],
        })
    );

    loadSavedResumes(savedSelect, () => {
        savedSelect.title = savedSelect.selectedOptions[0]?.textContent || '';
        updateGenerateEnabled();
    });
    void loadJobResume();
}

function previewResumePdf(base64:string): void {
    const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    void chrome.tabs.create({url}).catch(()=>URL.revokeObjectURL(url));
    // Give Chrome's PDF viewer time to consume the blob before releasing it.
    window.setTimeout(()=>URL.revokeObjectURL(url),60_000);
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
                if (resume.updatedAt) option.dataset.updatedAt = resume.updatedAt;
                savedSelect.appendChild(option);
            }
            onLoaded();
        }
    );
}

/* ------------------------------------------------------------- resume file */

interface UploadResumeFileResponse {
    success?: boolean;
    error?: string;
    message?: string;
    text?: string;
    filename?: string;
    canOcr?: boolean;
}

/**
 * Uploads a résumé file for text extraction. The extraction itself happens
 * server-side via the same endpoint the website's dashboard uses — this
 * function only validates, reads, and relays the bytes; background.ts holds
 * the Bearer token and does the actual fetch.
 */
function handleResumeFileUpload(
    file: File,
    statusSlot: HTMLElement,
    pasteBox: HTMLTextAreaElement,
    onExtracted: () => void
): void {
    statusSlot.replaceChildren();

    if (!isSupportedResumeFileName(file.name)) {
        statusSlot.appendChild(
            text({ text: describeUnsupportedResumeFile(file.name), size: 'xs', tone: 'danger' })
        );
        return;
    }
    if (!isResumeFileSizeAllowed(file.size)) {
        statusSlot.appendChild(
            text({ text: describeOversizedResumeFile(file.size), size: 'xs', tone: 'danger' })
        );
        return;
    }

    statusSlot.appendChild(text({ text: `Reading ${file.name}…`, size: 'xs', tone: 'muted' }));

    file.arrayBuffer()
        .then((buffer) => {
            const fileBase64 = arrayBufferToBase64(buffer);
            return new Promise<UploadResumeFileResponse>((resolve) => {
                chrome.runtime.sendMessage(
                    { type: 'UPLOAD_RESUME_FILE', filename: file.name, fileType: file.type, fileBase64 },
                    (response: UploadResumeFileResponse | undefined) => resolve(response ?? {})
                );
            });
        })
        .then((response) => {
            statusSlot.replaceChildren();

            if (response.success && response.text) {
                pasteBox.value = response.text;
                statusSlot.appendChild(
                    text({
                        text: `Extracted ${response.text.length.toLocaleString()} characters from ${response.filename || file.name}.`,
                        size: 'xs',
                        tone: 'success',
                    })
                );
                onExtracted();
                return;
            }

            if (response.canOcr) {
                // Scanned PDF: the extension does not run OCR itself — that
                // path (AWS Textract) goes through a separate, security-
                // hardened proxy that also serves resume save/download and
                // was deliberately left untouched for this feature.
                statusSlot.appendChild(
                    stack({
                        gap: '1',
                        children: [
                            text({
                                text: "This looks like a scanned PDF. OCR isn't available from the extension yet.",
                                size: 'xs',
                                tone: 'warning',
                            }),
                            button({
                                label: 'Open TrackMyOPT to finish this file',
                                variant: 'secondary',
                                size: 'sm',
                                onClick: () =>
                                    chrome.tabs.create({
                                        url: `${WEBSITE_URL}/dashboard/career/resume-generator`,
                                    }),
                            }),
                        ],
                    })
                );
                return;
            }

            statusSlot.appendChild(
                text({
                    text: response.message || 'Could not read that file. Try pasting your resume text instead.',
                    size: 'xs',
                    tone: 'danger',
                })
            );
        })
        .catch(() => {
            statusSlot.replaceChildren(
                text({ text: 'Upload failed. Try pasting your resume text instead.', size: 'xs', tone: 'danger' })
            );
        });
}

/* --------------------------------------------------------------- agent run */

interface StartRunInput {
    templateId: string;
    jobDescription: string;
    resumeSource: ResumeSource;
    resumeId: string;
    resumeText: string;
    alignJobTitles?: boolean;
}

function startRun(input: StartRunInput, slot: HTMLElement, trigger: HTMLButtonElement, onResult?: (result:unknown)=>void): void {
    if (!jobContext) return;
    if (!looksLikeRealJobPostingText(input.jobDescription)) {
        slot.replaceChildren(banner({tone:'warning',message:'Add the actual job description before tailoring your resume.'}));
        return;
    }

    console_?.destroy();
    const handle = runConsole({
        title: 'Tailoring résumé',
        onCancel: () => client.cancel(),
        onRetry: () => startRun(input, slot, trigger, onResult),
    });
    console_ = handle;
    slot.replaceChildren(handle.node);
    trigger.dataset.running = 'true';
    trigger.disabled = true;
    const triggerLabel = trigger.querySelector('span');
    if (triggerLabel) triggerLabel.textContent = 'Creating your résumé…';
    let revealedProgress = false;
    const settle = () => {
        trigger.dataset.running = 'false';
        if (triggerLabel) triggerLabel.textContent = 'Create tailored résumé';
        trigger.dispatchEvent(new Event('tmo-run-settled'));
    };

    client.start(
        'resume',
        {
            templateId: input.templateId,
            jobDescription: input.jobDescription.trim(),
            companyName: jobContext.companyName,
            roleTitle: jobContext.roleTitle,
            // Prefer the live page URL so Prefill on this tab can attach the PDF.
            jobUrl: jobContext.pageUrl || jobContext.jobUrl,
            jobKey: [
                jobContext.pageUrl || jobContext.jobUrl,
                jobContext.companyName,
                jobContext.roleTitle,
            ].join('|'),
            alignJobTitles: input.alignJobTitles === true,
            ...(jobContext.applicationId
                ? { applicationId: jobContext.applicationId }
                : {}),
            ...(input.resumeSource === 'paste'
                ? { resumeText: input.resumeText.trim(), resumeId: '' }
                : { resumeId: input.resumeId }),
        },
        {
            onState: (state, steps) => {
                handle.setState(state, steps);
                if (!revealedProgress && (state === 'preparing' || state === 'running')) {
                    revealedProgress = true;
                    slot.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
                }
                if (state === 'succeeded' || state === 'failed' || state === 'cancelled') {
                    settle();
                }
            },
            onStep: (step) => handle.updateStep(step),
            onError: (error) => {
                handle.showError(error);
                settle();
            },
            onDone: (result) => { renderResult(result, slot, handle); onResult?.(result); },
        }
    );
}

function renderResult(result: unknown, slot: HTMLElement, handle: RunConsoleHandle): void {
    const data = result as { pdfBase64?: string; filename?: string; editorUrl?: string; baselineScore?: number; generatedScore?: number; savedToAccount?:boolean };
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
                onClick: () => downloadGeneratedPdf(data.pdfBase64 as string, data.filename || 'Resume.pdf'),
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
        banner({ tone: data.savedToAccount === false ? 'warning':'success', title: 'Done', message: scoreLine + (data.savedToAccount === false ? ' Not saved to your account. Download a copy before closing.' : ''), actions })
    );
}

/* ------------------------------------------------------------------- boot */

function readActiveJobContext(): Promise<JobContext | null> {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId === undefined) {
            resolve(null);
            return;
        }
        chrome.tabs.sendMessage(tabId, { type: 'TMO_GET_JOB_CONTEXT' }, (response) => {
            // A job description is no longer required to render the form — the
            // job description box is editable, so the user can paste one in.
            // What still gates rendering is being on a page the content script
            // recognised as a job posting at all (a role, company, or URL).
            const context = response as JobContext | undefined;
            const hasJobContext = Boolean(
                context && (context.roleTitle || context.companyName || context.jobUrl || context.pageUrl)
            );
            if (chrome.runtime.lastError || !hasJobContext) {
                resolve(null);
                return;
            }
            resolve({
                ...context!,
                tabId,
                pageUrl: context!.pageUrl || context!.jobUrl,
            });
        });
    });
  });
}
let contextRequestRevision = 0;
async function requestJobContext(): Promise<void> {
    const revision = ++contextRequestRevision;
    const context = await readActiveJobContext();
    if (revision !== contextRequestRevision) return;
    if (context) renderJob(context);
    else { jobContext = null; renderEmpty('No job posting detected on this page. Open a job listing and reopen this panel.'); }
}

ensureThemeStyle(document, { scope: ':root' });
const boot = liveRegion('polite');
document.body.appendChild(boot.node);
requestJobContext();

// Re-read context when the user switches tabs, so the panel always reflects
// what they are looking at.
chrome.tabs.onActivated.addListener(() => requestJobContext());
chrome.tabs.onUpdated.addListener((_tabId, change, tab) => {
    if (tab.active && change.status === 'complete') void requestJobContext();
});
// Do not leave another account's PDF visible after switching accounts or signing out.
chrome.storage.onChanged.addListener((changes,area)=>{
    if ((area==='local' && changes.idTokenUserId) || (area==='sync' && changes.extensionLocalSignedOut)) {
        ++contextRequestRevision;
        console_?.destroy();
        renderEmpty('Checking your account…');
        void requestJobContext();
    }
});
