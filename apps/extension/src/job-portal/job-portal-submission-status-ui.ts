import { SUBMISSION_STATUS_COPY } from '../submission/submission-protocol';
import type { AttemptView } from '../submission/submission-lifecycle';
import { applyWidgetThemeScope } from './job-portal-widget-theme';
import { queryWidget } from '../widget/widget-dom';

/**
 * Application-submission status shown in the widget card (or, on pages that
 * have no widget such as many confirmation pages, a small floating region).
 * Distinguishes confirmed / failed / not confirmed, and never reports a
 * failed application when only the tracker sync is pending.
 */
export type SubmissionUiState =
  | { kind: 'attempt'; attempt: AttemptView }
  | { kind: 'unattributed_confirmation' }
  | { kind: 'dismissed' };

export interface SubmissionUiActions {
  confirmManually: () => Promise<AttemptView | null>;
}

const HOST_CLASS = 'tmo-submission-status';
const FLOATING_ID = 'tmo-submission-status-floating';
let state: SubmissionUiState = { kind: 'dismissed' };
let actions: SubmissionUiActions | null = null;

export function submissionStatusMessage(attempt: AttemptView): { message: string; tone: 'info' | 'success' | 'warning' | 'error'; canConfirm: boolean } {
  if (attempt.status === 'confirmed') {
    const by = attempt.confirmation === 'manual' ? ' (confirmed by you)' : '';
    if (attempt.sync === 'synced') return { message: `${SUBMISSION_STATUS_COPY.confirmed}${by} · Saved as Applied in your tracker.`, tone: 'success', canConfirm: false };
    if (attempt.sync === 'signed_out') return { message: `Application submitted${by}. Sign in to TrackMyOPT to save it to your tracker.`, tone: 'warning', canConfirm: false };
    if (attempt.sync === 'rejected' || attempt.sync === 'abandoned') {
      return { message: `Application submitted${by}, but your tracker could not be updated automatically. Update it from your Job Tracker.`, tone: 'warning', canConfirm: false };
    }
    return { message: `${SUBMISSION_STATUS_COPY.sync_pending}${by}. TrackMyOPT will retry automatically.`, tone: 'success', canConfirm: false };
  }
  if (attempt.status === 'failed') return { message: SUBMISSION_STATUS_COPY.failed, tone: 'error', canConfirm: true };
  if (attempt.status === 'not_confirmed') return { message: SUBMISSION_STATUS_COPY.not_confirmed, tone: 'warning', canConfirm: true };
  return { message: SUBMISSION_STATUS_COPY.pending, tone: 'info', canConfirm: false };
}

function render(host: HTMLElement): void {
  host.textContent = '';
  if (state.kind === 'dismissed') { host.hidden = true; return; }
  host.hidden = false;
  const view = state.kind === 'attempt'
    ? submissionStatusMessage(state.attempt)
    : { message: 'This page says your application was submitted. Should TrackMyOPT mark it as Applied?', tone: 'info' as const, canConfirm: true };
  const ink = { info: 'var(--tmo-widget-ink, #17243b)', success: 'var(--tmo-color-success-ink, #168465)',
    warning: 'var(--tmo-color-warning-ink, #9b4b13)', error: 'var(--tmo-widget-danger-ink, #b42318)' }[view.tone];
  host.style.cssText = `display:block;margin:0 0 10px;padding:12px;border-radius:10px;border:1px solid var(--tmo-widget-border, #dce3ed);background:var(--tmo-widget-surface-2, #f2f5fa);font:500 12px/1.5 system-ui;color:${ink};overflow-wrap:anywhere;`;
  const text = document.createElement('p');
  text.className = 'tmo-submission-status-text';
  text.setAttribute('role', view.tone === 'error' ? 'alert' : 'status');
  text.style.margin = '0';
  text.textContent = view.message;
  host.appendChild(text);
  if (!view.canConfirm || !actions) return;
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;';
  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'tmo-submission-confirm';
  confirm.textContent = state.kind === 'attempt' && state.attempt.status === 'failed' ? 'I did submit it' : 'Yes, I submitted it';
  confirm.style.cssText = 'min-height:36px;padding:8px 12px;border-radius:8px;border:1px solid var(--tmo-widget-accent-strong, #245bd6);background:var(--tmo-widget-accent-strong, #245bd6);color:#fff;font:600 12px/1.4 system-ui;cursor:pointer;';
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'tmo-submission-dismiss';
  dismiss.textContent = 'Not yet';
  dismiss.style.cssText = 'min-height:36px;padding:8px 12px;border-radius:8px;border:1px solid var(--tmo-widget-border, #dce3ed);background:var(--tmo-widget-surface, #fff);color:var(--tmo-widget-ink, #17243b);font:600 12px/1.4 system-ui;cursor:pointer;';
  confirm.addEventListener('click', () => {
    confirm.disabled = true;
    dismiss.disabled = true;
    void actions?.confirmManually().then(attempt => {
      if (!attempt) {
        text.textContent = 'TrackMyOPT could not record that. Try again, or update your Job Tracker directly.';
        confirm.disabled = false;
        dismiss.disabled = false;
      }
    });
  });
  dismiss.addEventListener('click', () => setSubmissionUiState({ kind: 'dismissed' }));
  row.append(confirm, dismiss);
  host.appendChild(row);
}

function floatingHost(): HTMLElement {
  let host = document.getElementById(FLOATING_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = FLOATING_ID;
    applyWidgetThemeScope(host);
    host.setAttribute('aria-label', 'TrackMyOPT application status');
    document.body.appendChild(host);
  }
  return host;
}

/** Paint into the widget card when present, otherwise the floating region. */
export function mountSubmissionStatus(): void {
  const card = queryWidget<HTMLElement>('.tmo-job-widget-card');
  if (card) {
    document.getElementById(FLOATING_ID)?.remove();
    let host = card.querySelector<HTMLElement>(`.${HOST_CLASS}`);
    if (!host) {
      host = document.createElement('section');
      host.className = HOST_CLASS;
      host.setAttribute('aria-label', 'Application status');
      card.prepend(host);
    }
    render(host);
    return;
  }
  if (state.kind === 'dismissed') { document.getElementById(FLOATING_ID)?.remove(); return; }
  if (!document.body) return;
  const host = floatingHost();
  render(host);
  host.style.position = 'fixed';
  host.style.right = '16px';
  host.style.bottom = '16px';
  host.style.zIndex = '2147483646';
  host.style.maxWidth = 'min(360px, calc(100vw - 32px))';
  host.style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)';
}

export function setSubmissionUiActions(next: SubmissionUiActions): void {
  actions = next;
}

export function setSubmissionUiState(next: SubmissionUiState): void {
  // A real attempt outcome always replaces a generic confirmation prompt.
  if (next.kind === 'unattributed_confirmation' && state.kind === 'attempt') return;
  state = next;
  mountSubmissionStatus();
}

export function currentSubmissionUiState(): SubmissionUiState {
  return state;
}
