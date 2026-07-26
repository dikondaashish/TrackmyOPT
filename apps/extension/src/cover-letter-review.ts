import type {
  GeneratedCoverLetterAttachment,
  GeneratedResumeArtifactV1,
} from './resume-autofill-contract';
import {
  formatAiAllowanceCopy,
  remainingAiAllowance,
} from './ai-allowance-copy';

export interface CoverLetterLimitState {
  allowed: boolean;
  quotaPeriod?: 'day' | 'month';
  quotaLimit?: number;
  quotaRemaining?: number;
  dailyLimit: number;
  dailyRemaining: number;
  itemRegenerationLimit: number;
  itemRegenerationsRemaining: number;
  error?:
    | 'ai_daily_limit_reached'
    | 'ai_monthly_limit_reached'
    | 'ai_item_regeneration_limit_reached'
    | 'ai_rate_limited';
}

export interface CoverLetterGenerationResult {
  ok: boolean;
  attachment?: GeneratedCoverLetterAttachment;
  /** Plain-text review source. The PDF remains the attachment source of truth. */
  draftText?: string;
  limits?: CoverLetterLimitState;
  error?: string;
}

export interface CoverLetterReviewState {
  phase: 'ready' | 'generating' | 'review' | 'editing' | 'recompiling' | 'error';
  attachment?: GeneratedCoverLetterAttachment;
  draftText: string;
  limits: CoverLetterLimitState;
  error?: string;
}

export interface CoverLetterReviewDependencies {
  generate(): Promise<CoverLetterGenerationResult>;
  /** Must invalidate the old payload synchronously before this promise starts. */
  invalidateCurrent(): void;
  recompile(editedText: string): Promise<CoverLetterGenerationResult>;
}

const INITIAL_LIMITS: CoverLetterLimitState = {
  allowed: true,
  dailyLimit: 25,
  dailyRemaining: 25,
  itemRegenerationLimit: 3,
  itemRegenerationsRemaining: 3,
};

/**
 * Small state machine kept outside the DOM so safety-critical edit/invalidation
 * behavior is unit-testable without a browser. It never submits or navigates.
 */
export class CoverLetterReviewController {
  state: CoverLetterReviewState = {
    phase: 'ready',
    draftText: '',
    limits: { ...INITIAL_LIMITS },
  };

  constructor(
    private readonly deps: CoverLetterReviewDependencies,
    private readonly changed: (state: CoverLetterReviewState) => void = () => {},
  ) {}

  private update(patch: Partial<CoverLetterReviewState>): void {
    this.state = { ...this.state, ...patch };
    this.changed(this.state);
  }

  async generate(): Promise<void> {
    if (this.state.phase === 'generating' || !this.state.limits.allowed) return;
    this.update({ phase: 'generating', error: undefined });
    const result = await this.deps.generate();
    if (!result.ok || !result.attachment) {
      this.update({
        phase: 'error',
        error: result.error || 'Cover letter generation failed.',
        ...(result.limits ? { limits: result.limits } : {}),
      });
      return;
    }
    this.update({
      phase: 'review',
      attachment: result.attachment,
      draftText: result.draftText || '',
      limits: result.limits || this.state.limits,
      error: undefined,
    });
  }

  beginEdit(): void {
    if (!this.state.attachment || this.state.phase !== 'review') return;
    this.update({ phase: 'editing' });
  }

  async saveEdit(editedText: string): Promise<void> {
    const normalized = editedText.trim();
    if (this.state.phase !== 'editing' || !normalized) return;

    // Invalidate first: an attachment derived from pre-edit content must become
    // ineligible even while compilation is in flight or if compilation fails.
    this.deps.invalidateCurrent();
    this.update({ phase: 'recompiling', attachment: undefined, error: undefined });
    const result = await this.deps.recompile(normalized);
    if (!result.ok || !result.attachment) {
      this.update({
        phase: 'error',
        error: result.error || 'Edited cover letter could not be compiled.',
        ...(result.limits ? { limits: result.limits } : {}),
      });
      return;
    }
    this.update({
      phase: 'review',
      attachment: result.attachment,
      draftText: normalized,
      limits: result.limits || this.state.limits,
      error: undefined,
    });
  }
}

export interface CoverLetterReviewUiOptions {
  artifact: GeneratedResumeArtifactV1;
  jobDescription: string;
  initialLimits?: CoverLetterLimitState;
  sendMessage(message: unknown): Promise<CoverLetterGenerationResult>;
  onArtifactUpdated(artifact: GeneratedResumeArtifactV1): void;
  download(attachment: GeneratedCoverLetterAttachment): void;
  onUpgrade?: () => void;
}

function limitCopy(limits: CoverLetterLimitState): string {
  return `${formatAiAllowanceCopy(limits)} ${limits.itemRegenerationsRemaining} of ${limits.itemRegenerationLimit} cover-letter regenerations remaining.`;
}

/** Mounts the non-blocking cover-letter action beneath the Resume ready state. */
export function mountCoverLetterReviewUi(
  container: HTMLElement,
  options: CoverLetterReviewUiOptions,
): void {
  const root = document.createElement('section');
  root.className = 'tmo-cover-letter-review';
  root.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid var(--tmo-widget-border);';
  container.appendChild(root);

  let artifact = options.artifact;
  const deps: CoverLetterReviewDependencies = {
    generate: () => options.sendMessage({
      type: 'GENERATE_COVER_LETTER',
      artifactId: artifact.artifactId,
      jobDescription: options.jobDescription,
      isRegeneration: !!artifact.coverLetter,
    }),
    invalidateCurrent: () => {
      const { coverLetter: _old, ...withoutCoverLetter } = artifact;
      artifact = withoutCoverLetter;
      options.onArtifactUpdated(artifact);
    },
    recompile: (editedText) => options.sendMessage({
      type: 'RECOMPILE_COVER_LETTER',
      artifactId: artifact.artifactId,
      editedText,
      sourceContentHash: artifact.generatedContentHash,
    }),
  };

  const render = (state: CoverLetterReviewState): void => {
    root.textContent = '';
    const title = document.createElement('div');
    title.textContent = state.attachment ? 'Cover letter ready for review' : 'Tailored cover letter';
    title.style.cssText = 'font-size:12px;font-weight:800;color:var(--tmo-widget-ink);';
    root.appendChild(title);

    const quota = document.createElement('div');
    quota.className = 'tmo-cover-letter-limits';
    quota.textContent = limitCopy(state.limits);
    quota.style.cssText = 'margin-top:4px;font-size:10.5px;color:var(--tmo-widget-muted);';
    root.appendChild(quota);

    if (state.error) {
      const error = document.createElement('div');
      error.setAttribute('role', 'alert');
      const monthlyLimitReached =
        state.error === 'ai_monthly_limit_reached';
      error.textContent = monthlyLimitReached
        ? 'Your Free cover-letter allowance is used for this month.'
        : state.error;
      error.style.cssText = 'margin-top:6px;font-size:11px;color:#b91c1c;';
      root.appendChild(error);
      if (monthlyLimitReached && options.onUpgrade) {
        const upgrade = document.createElement('button');
        upgrade.type = 'button';
        upgrade.textContent = 'Upgrade to Pro';
        upgrade.style.cssText =
          'margin-top:7px;padding:6px 9px;border:0;border-radius:7px;background:var(--tmo-widget-accent);color:#fff;font-size:11px;font-weight:700;cursor:pointer;';
        upgrade.addEventListener('click', options.onUpgrade);
        root.appendChild(upgrade);
      }
    }

    if (state.phase === 'ready' || state.phase === 'error') {
      const generate = document.createElement('button');
      generate.type = 'button';
      generate.textContent = artifact.coverLetter ? 'Regenerate cover letter' : 'Generate cover letter';
      generate.disabled =
        !state.limits.allowed ||
        remainingAiAllowance(state.limits) <= 0 ||
        state.limits.itemRegenerationsRemaining <= 0;
      generate.style.cssText = 'margin-top:7px;padding:6px 9px;border:0;border-radius:7px;background:var(--tmo-widget-accent);color:#fff;font-size:11px;font-weight:700;cursor:pointer;';
      generate.addEventListener('click', () => void controller.generate());
      root.appendChild(generate);
      return;
    }

    if (state.phase === 'generating' || state.phase === 'recompiling') {
      const progress = document.createElement('div');
      progress.setAttribute('role', 'status');
      progress.textContent = state.phase === 'generating' ? 'Generating cover letter…' : 'Recompiling your edits…';
      progress.style.cssText = 'margin-top:7px;font-size:11px;color:var(--tmo-widget-muted);';
      root.appendChild(progress);
      return;
    }

    if (state.phase === 'editing') {
      const editor = document.createElement('textarea');
      editor.value = state.draftText;
      editor.placeholder = 'Review and edit your cover letter text';
      editor.style.cssText = 'box-sizing:border-box;width:100%;min-height:150px;margin-top:7px;padding:8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:11px/1.45 inherit;';
      const save = document.createElement('button');
      save.type = 'button';
      save.textContent = 'Save edits and recompile';
      save.style.cssText = 'margin-top:6px;padding:6px 9px;border:0;border-radius:7px;background:var(--tmo-widget-accent);color:#fff;font-size:11px;font-weight:700;cursor:pointer;';
      save.addEventListener('click', () => void controller.saveEdit(editor.value));
      root.appendChild(editor);
      root.appendChild(save);
      return;
    }

    if (state.attachment) {
      const preview = document.createElement('iframe');
      preview.title = 'Generated cover letter preview';
      preview.src = `data:application/pdf;base64,${state.attachment.base64}`;
      preview.style.cssText = 'width:100%;height:180px;margin-top:7px;border:1px solid var(--tmo-widget-border);border-radius:7px;';
      root.appendChild(preview);

      const actions = document.createElement('div');
      actions.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px;';
      const download = document.createElement('button');
      download.type = 'button';
      download.textContent = 'Download';
      download.addEventListener('click', () => options.download(state.attachment!));
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => controller.beginEdit());
      for (const button of [download, edit]) {
        button.style.cssText = 'padding:6px 9px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font-size:11px;font-weight:700;cursor:pointer;';
        actions.appendChild(button);
      }
      root.appendChild(actions);
    }
  };

  const controller = new CoverLetterReviewController(deps, render);
  if (options.initialLimits) {
    controller.state = {
      ...controller.state,
      limits: options.initialLimits,
    };
  }
  if (artifact.coverLetter) {
    controller.state = {
      ...controller.state,
      phase: 'review',
      attachment: artifact.coverLetter,
    };
  }
  render(controller.state);
}
