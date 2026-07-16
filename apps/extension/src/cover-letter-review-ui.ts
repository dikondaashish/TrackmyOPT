import type {
  GeneratedCoverLetterAttachment,
  GeneratedResumeArtifactV1,
} from './resume-autofill-contract';

export interface CoverLetterLimits {
  dailyRemaining: number;
  itemRegenerationsRemaining: number;
  itemRegenerationLimit: number;
}

export interface CoverLetterReviewOptions {
  artifact: GeneratedResumeArtifactV1;
  limits: CoverLetterLimits;
  generate(regenerate: boolean): Promise<{
    attachment: GeneratedCoverLetterAttachment;
    text: string;
    limits: CoverLetterLimits;
  }>;
  recompile(editedText: string, sourceContentHash: string): Promise<GeneratedCoverLetterAttachment>;
  onArtifactChanged(artifact: GeneratedResumeArtifactV1): void;
}

function action(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  return button;
}

function downloadPdf(attachment: GeneratedCoverLetterAttachment): void {
  const anchor = document.createElement('a');
  anchor.download = attachment.filename;
  anchor.href = `data:application/pdf;base64,${attachment.base64}`;
  anchor.rel = 'noopener';
  anchor.click();
}

/** Review surface intentionally remains independent of resume readiness. */
export function createCoverLetterReviewUI(options: CoverLetterReviewOptions): HTMLElement {
  const root = document.createElement('section');
  root.className = 'tmo-cover-letter-review';
  const heading = document.createElement('strong');
  heading.textContent = 'Tailored cover letter';
  const usage = document.createElement('p');
  const editor = document.createElement('textarea');
  editor.setAttribute('aria-label', 'Cover letter text');
  editor.hidden = true;
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const generate = action('Generate cover letter');
  const download = action('Download');
  const edit = action('Edit');
  const save = action('Save and recompile');
  download.hidden = edit.hidden = save.hidden = true;

  let limits = options.limits;
  let attachment = options.artifact.coverLetter;
  const renderLimits = () => {
    usage.textContent = `You have ${limits.dailyRemaining} AI generations left today. ${limits.itemRegenerationsRemaining} of ${limits.itemRegenerationLimit} regenerations remaining for this job.`;
  };
  renderLimits();

  const install = (
    next: GeneratedCoverLetterAttachment,
    text: string,
  ) => {
    attachment = next;
    editor.value = text;
    editor.hidden = false;
    download.hidden = edit.hidden = false;
    options.artifact.coverLetter = next;
    options.onArtifactChanged(options.artifact);
    status.textContent = 'Cover letter ready for review.';
  };

  generate.addEventListener('click', async () => {
    if (limits.dailyRemaining <= 0) {
      status.textContent = 'AI generation limit reached.';
      return;
    }
    const result = await options.generate(Boolean(attachment));
    limits = result.limits;
    renderLimits();
    install(result.attachment, result.text);
  });

  download.addEventListener('click', () => {
    if (attachment && attachment.sourceContentHash === options.artifact.generatedContentHash) {
      downloadPdf(attachment);
    }
  });

  edit.addEventListener('click', () => {
    // Invalidate immediately; a stale PDF cannot be attached while editing.
    attachment = undefined;
    options.artifact.coverLetter = undefined;
    options.onArtifactChanged(options.artifact);
    editor.focus();
    save.hidden = false;
    status.textContent = 'Editing — the previous attachment is no longer eligible.';
  });

  save.addEventListener('click', async () => {
    const recompiled = await options.recompile(
      editor.value,
      options.artifact.generatedContentHash,
    );
    if (recompiled.sourceContentHash !== options.artifact.generatedContentHash) {
      status.textContent = 'Cover letter source changed. Generate it again.';
      return;
    }
    install(recompiled, editor.value);
    save.hidden = true;
  });

  root.append(heading, usage, generate, editor, download, edit, save, status);
  return root;
}
