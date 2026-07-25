import type { PrefillFieldGroup } from './prefill-coverage';

export type AutofillVisualState =
  | 'filling'
  | 'complete'
  | 'needs_user'
  | 'error';

export interface AutofillVisualStatusInput {
  state: AutofillVisualState;
  filled: number;
  needsUser: number;
  group?: PrefillFieldGroup;
}

export interface AutofillVisualFeedback {
  markFieldFilled(element: HTMLElement, group: PrefillFieldGroup): void;
  markNeedsUser(element: HTMLElement): void;
  finish(
    result: { filled: number; skipped: number },
    emptyResultMessage?: string
  ): void;
  fail(message: string): void;
}

const VISUAL_HOST_ID = 'tmo-autofill-progress';
const FIELD_STATE_ATTR = 'data-tmo-autofill-visual';
const FIELD_STAGGER_MS = 60;
const FIELD_STAGGER_CAP_MS = 720;
const fieldStyleRoots = new WeakSet<object>();

const GROUP_LABELS: Record<PrefillFieldGroup, string> = {
  resume: 'resume',
  cover_letter: 'cover letter',
  contact: 'contact details',
  skills: 'skills',
  experience: 'work experience',
  education: 'education',
};

export function autofillStaggerDelay(
  index: number,
  reducedMotion: boolean
): number {
  if (reducedMotion) return 0;
  return Math.min(Math.max(0, index) * FIELD_STAGGER_MS, FIELD_STAGGER_CAP_MS);
}

export function autofillVisualStatus(
  input: AutofillVisualStatusInput
): string {
  if (input.state === 'filling') {
    if (!input.group) return 'Preparing your application…';
    return `Filling ${GROUP_LABELS[input.group]} · ${input.filled} ready`;
  }
  if (input.state === 'needs_user') {
    return `${input.filled} filled · ${input.needsUser} need your review`;
  }
  if (input.state === 'error') {
    return 'Autofill paused';
  }
  if (input.filled === 0) return 'No empty supported fields found';
  return `${input.filled} fields ready for your review`;
}

function rootForElement(element: HTMLElement): Document | ShadowRoot {
  const root = element.getRootNode();
  return root.nodeType === 9 || root.nodeType === 11
    ? (root as Document | ShadowRoot)
    : element.ownerDocument;
}

function ensureFieldStyles(root: Document | ShadowRoot): void {
  if (fieldStyleRoots.has(root)) return;
  fieldStyleRoots.add(root);
  const isDocument = root.nodeType === 9;
  const documentForRoot = isDocument
    ? (root as Document)
    : (root as ShadowRoot).host.ownerDocument;
  const style = documentForRoot.createElement('style');
  style.setAttribute('data-tmo-autofill-visual-styles', 'true');
  style.textContent = `
    [${FIELD_STATE_ATTR}="filled"] {
      outline: 3px solid rgba(16, 185, 129, .92) !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 7px rgba(16, 185, 129, .16) !important;
      animation: tmo-autofill-field-ready 520ms cubic-bezier(.2,.8,.2,1) both !important;
    }
    [${FIELD_STATE_ATTR}="needs-user"] {
      outline: 3px solid rgba(245, 158, 11, .92) !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 7px rgba(245, 158, 11, .14) !important;
      animation: tmo-autofill-needs-user 760ms ease-out both !important;
    }
    @keyframes tmo-autofill-field-ready {
      0% { opacity: .72; filter: saturate(.8); }
      45% { opacity: 1; filter: saturate(1.18); }
      100% { opacity: 1; filter: saturate(1); }
    }
    @keyframes tmo-autofill-needs-user {
      0%, 100% { box-shadow: 0 0 0 4px rgba(245, 158, 11, .10); }
      50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, .18); }
    }
    @media (prefers-reduced-motion: reduce) {
      [${FIELD_STATE_ATTR}] {
        animation: none !important;
        transition: none !important;
      }
    }
  `;
  if (isDocument) {
    const rootDocument = root as Document;
    (rootDocument.head || rootDocument.documentElement).appendChild(style);
  } else {
    root.appendChild(style);
  }
}

export function flashAutofillField(
  element: HTMLElement,
  state: 'filled' | 'needs-user' = 'filled'
): void {
  if (!element?.isConnected) return;
  const root = rootForElement(element);
  ensureFieldStyles(root);
  element.setAttribute(FIELD_STATE_ATTR, state);
  const view = element.ownerDocument.defaultView;
  view?.setTimeout(() => {
    if (
      element.isConnected &&
      element.getAttribute(FIELD_STATE_ATTR) === state
    ) {
      element.removeAttribute(FIELD_STATE_ATTR);
    }
  }, state === 'filled' ? 1_450 : 2_600);
}

function svgIcon(
  documentForIcon: Document,
  state: AutofillVisualState
): SVGSVGElement | HTMLSpanElement {
  if (state === 'filling') {
    const spinner = documentForIcon.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    return spinner;
  }
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = documentForIcon.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = documentForIcon.createElementNS(namespace, 'path');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2.4');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute(
    'd',
    state === 'complete'
      ? 'M5 12.5l4.2 4.2L19 7'
      : state === 'needs_user'
        ? 'M12 7v6m0 4h.01'
        : 'M7 7l10 10M17 7L7 17'
  );
  svg.appendChild(path);
  return svg;
}

export function createAutofillVisualFeedback(
  documentForVisual: Document = document
): AutofillVisualFeedback {
  documentForVisual.getElementById(VISUAL_HOST_ID)?.remove();
  const host = documentForVisual.createElement('div');
  host.id = VISUAL_HOST_ID;
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'true');
  host.style.cssText =
    'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = documentForVisual.createElement('style');
  style.textContent = `
    :host { color-scheme: light dark; }
    .shell {
      width:min(360px,calc(100vw - 32px)); box-sizing:border-box;
      padding:12px 14px 10px; border:1px solid rgba(255,255,255,.16);
      border-radius:14px; color:#f8fafc; background:rgba(15,23,42,.96);
      box-shadow:0 18px 48px rgba(15,23,42,.30),0 4px 14px rgba(15,23,42,.18);
      backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
      animation:tmo-autofill-hud-in 220ms cubic-bezier(.2,.8,.2,1) both;
    }
    .row { display:flex;align-items:center;gap:10px;min-height:22px; }
    .icon {
      width:24px;height:24px;border-radius:999px;display:grid;place-items:center;
      flex:0 0 auto;color:#c4b5fd;background:rgba(124,58,237,.22);
    }
    .shell[data-state="complete"] .icon {
      color:#a7f3d0;background:rgba(16,185,129,.22);
    }
    .shell[data-state="needs_user"] .icon {
      color:#fde68a;background:rgba(245,158,11,.22);
    }
    .shell[data-state="error"] .icon {
      color:#fecaca;background:rgba(239,68,68,.22);
    }
    .copy { min-width:0;flex:1; }
    .title { margin:0;font-size:13px;line-height:1.35;font-weight:750;letter-spacing:.01em; }
    .hint { margin:2px 0 0;color:#cbd5e1;font-size:11px;line-height:1.35;font-weight:500; }
    .track { height:3px;margin-top:9px;border-radius:999px;overflow:hidden;background:rgba(148,163,184,.25); }
    .fill {
      width:42%;height:100%;border-radius:inherit;
      background:linear-gradient(90deg,#7c3aed,#60a5fa,#7c3aed);
      background-size:200% 100%;animation:tmo-autofill-progress 950ms linear infinite;
    }
    .shell[data-state="complete"] .fill {
      width:100%;background:#10b981;animation:none;transition:width 220ms ease-out;
    }
    .shell[data-state="needs_user"] .fill {
      width:100%;background:linear-gradient(90deg,#10b981 0 76%,#f59e0b 76%);animation:none;
    }
    .spinner {
      width:13px;height:13px;border-radius:999px;border:2px solid rgba(196,181,253,.38);
      border-top-color:#c4b5fd;animation:tmo-autofill-spin 680ms linear infinite;
    }
    @keyframes tmo-autofill-hud-in {
      from { opacity:0;transform:translateY(-8px) scale(.98); }
      to { opacity:1;transform:translateY(0) scale(1); }
    }
    @keyframes tmo-autofill-progress {
      from { transform:translateX(-100%);background-position:0 0; }
      to { transform:translateX(245%);background-position:200% 0; }
    }
    @keyframes tmo-autofill-spin { to { transform:rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .shell,.fill,.spinner { animation:none !important;transition:none !important; }
      .fill { width:100%; }
    }
  `;
  const shell = documentForVisual.createElement('div');
  shell.className = 'shell';
  shell.dataset.state = 'filling';
  const row = documentForVisual.createElement('div');
  row.className = 'row';
  const icon = documentForVisual.createElement('span');
  icon.className = 'icon';
  const copy = documentForVisual.createElement('span');
  copy.className = 'copy';
  const title = documentForVisual.createElement('p');
  title.className = 'title';
  const hint = documentForVisual.createElement('p');
  hint.className = 'hint';
  hint.textContent = 'You stay in control. TrackMyOPT never submits.';
  const track = documentForVisual.createElement('div');
  track.className = 'track';
  const fill = documentForVisual.createElement('div');
  fill.className = 'fill';
  track.appendChild(fill);
  copy.append(title, hint);
  row.append(icon, copy);
  shell.append(row, track);
  shadow.append(style, shell);
  (documentForVisual.body || documentForVisual.documentElement).appendChild(host);
  documentForVisual.defaultView?.setTimeout(() => host.remove(), 15_000);

  const reducedMotion =
    documentForVisual.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches === true;
  let scheduledFields = 0;
  let displayedFilled = 0;
  let displayedNeedsUser = 0;
  const pending: Promise<void>[] = [];
  let finished = false;

  const render = (
    state: AutofillVisualState,
    group?: PrefillFieldGroup,
    customMessage?: string
  ) => {
    if (!host.isConnected) return;
    shell.dataset.state = state;
    icon.replaceChildren(svgIcon(documentForVisual, state));
    title.textContent =
      customMessage ||
      autofillVisualStatus({
        state,
        filled: displayedFilled,
        needsUser: displayedNeedsUser,
        group,
      });
  };

  const schedule = (callback: () => void) => {
    const delay = autofillStaggerDelay(scheduledFields, reducedMotion);
    scheduledFields += 1;
    const view = documentForVisual.defaultView;
    const task = new Promise<void>((resolve) => {
      if (!view || delay === 0) {
        callback();
        resolve();
        return;
      }
      view.setTimeout(() => {
        callback();
        resolve();
      }, delay);
    });
    pending.push(task);
  };

  render('filling');

  return {
    markFieldFilled(element, group) {
      if (finished) return;
      schedule(() => {
        displayedFilled += 1;
        flashAutofillField(element, 'filled');
        render('filling', group);
      });
    },
    markNeedsUser(element) {
      if (finished) return;
      displayedNeedsUser += 1;
      flashAutofillField(element, 'needs-user');
    },
    finish(result, emptyResultMessage) {
      if (finished) return;
      finished = true;
      void Promise.all(pending).then(() => {
        displayedFilled = result.filled;
        displayedNeedsUser = result.skipped;
        render(
          result.skipped > 0 ? 'needs_user' : 'complete',
          undefined,
          result.filled === 0 ? emptyResultMessage : undefined
        );
        documentForVisual.defaultView?.setTimeout(
          () => host.remove(),
          reducedMotion ? 1_600 : 2_600
        );
      });
    },
    fail(message) {
      if (finished) return;
      finished = true;
      render('error', undefined, message);
      documentForVisual.defaultView?.setTimeout(
        () => host.remove(),
        reducedMotion ? 1_600 : 3_200
      );
    },
  };
}
