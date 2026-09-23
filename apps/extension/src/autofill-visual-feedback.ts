import type { PrefillFieldGroup } from './prefill-coverage';
import { COLORS } from './design/tokens';

export type AutofillVisualState =
  | 'filling'
  | 'complete'
  | 'needs_user'
  | 'error';
type VisualGroup = PrefillFieldGroup | 'private_answers';

export interface AutofillVisualStatusInput {
  state: AutofillVisualState;
  filled: number;
  needsUser: number;
  group?: VisualGroup;
}

export interface AutofillVisualFeedback {
  prepareField(element: HTMLElement, group: VisualGroup): Promise<void>;
  clearActiveField(): void;
  markFieldFilled(element: HTMLElement, group: VisualGroup): void;
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
const fieldTimers = new WeakMap<HTMLElement, number>();

const GROUP_LABELS: Record<VisualGroup, string> = {
  private_answers: 'saved answers',
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
    [${FIELD_STATE_ATTR}] {
      outline-offset: 2px !important;
      transition: outline-color 160ms ease, box-shadow 160ms ease !important;
    }
    [${FIELD_STATE_ATTR}="filling"] {
      outline: 2px solid ${COLORS.light.accent} !important;
      box-shadow: 0 0 0 4px color-mix(in srgb, ${COLORS.light.accent} 12%, transparent) !important;
      transition: none !important;
    }
    [${FIELD_STATE_ATTR}="filled"] {
      outline: 2px solid ${COLORS.light.stemAccent} !important;
      box-shadow: 0 0 0 4px color-mix(in srgb, ${COLORS.light.stemAccent} 12%, transparent) !important;
    }
    [${FIELD_STATE_ATTR}="needs-user"] {
      outline: 2px solid ${COLORS.light.warningInk} !important;
      box-shadow: none !important;
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
  const prior = fieldTimers.get(element);
  if (prior !== undefined) view?.clearTimeout(prior);
  const timer = view?.setTimeout(() => {
    if (
      element.isConnected &&
      element.getAttribute(FIELD_STATE_ATTR) === state
    ) {
      element.removeAttribute(FIELD_STATE_ATTR);
    }
  }, state === 'filled' ? 1_450 : 2_600);
  if (timer !== undefined) fieldTimers.set(element, timer);
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
  documentForVisual: Document = document,
  options: { animateFields?: boolean } = {},
): AutofillVisualFeedback {
  documentForVisual.getElementById(VISUAL_HOST_ID)?.remove();
  const host = documentForVisual.createElement('div');
  host.id = VISUAL_HOST_ID;
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'true');
  const slot = documentForVisual.querySelector<HTMLElement>('.tmo-prefill-progress-slot');
  host.style.cssText = slot
    ? 'display:block;margin:8px 12px;pointer-events:none;'
    : 'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = documentForVisual.createElement('style');
  style.textContent = `
    :host { color-scheme: light dark; }
    .shell {
      width:${slot ? '100%' : 'min(340px,calc(100vw - 32px))'}; box-sizing:border-box;
      padding:12px; border:1px solid var(--tmo-widget-border,${COLORS.light.border});
      border-radius:12px; color:var(--tmo-widget-ink,${COLORS.light.ink}); background:var(--tmo-widget-surface,${COLORS.light.surface});
      box-shadow:${slot ? 'none' : '0 8px 24px rgba(15,23,42,.12)'};
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
      animation:tmo-autofill-hud-in 220ms cubic-bezier(.2,.8,.2,1) both;
    }
    .row { display:flex;align-items:center;gap:10px;min-height:22px; }
    .icon {
      width:24px;height:24px;border-radius:999px;display:grid;place-items:center;
      flex:0 0 auto;color:${COLORS.light.accent};background:${COLORS.light.infoSurface};
    }
    .shell[data-state="complete"] .icon {
      color:${COLORS.light.stemAccent};background:${COLORS.light.successSurface};
    }
    .shell[data-state="needs_user"] .icon {
      color:${COLORS.light.warningInk};background:${COLORS.light.warningSurface};
    }
    .shell[data-state="error"] .icon {
      color:${COLORS.light.dangerInk};background:${COLORS.light.dangerSurface};
    }
    .copy { min-width:0;flex:1; }
    .title { margin:0;font-size:13px;line-height:1.35;font-weight:750;letter-spacing:.01em; }
    .hint { margin:2px 0 0;color:var(--tmo-widget-muted,${COLORS.light.inkMuted});font-size:11px;line-height:1.35;font-weight:500; }
    .track { height:3px;margin-top:9px;border-radius:999px;overflow:hidden;background:rgba(148,163,184,.25); }
    .fill {
      width:100%;height:100%;border-radius:inherit;transform-origin:left;
      background:${COLORS.light.accent};animation:tmo-autofill-progress 1100ms cubic-bezier(.4,0,.2,1) infinite;
    }
    .shell[data-state="complete"] .fill {
      background:${COLORS.light.stemAccent};animation:none;transform:scaleX(1);
    }
    .shell[data-state="needs_user"] .fill {
      background:${COLORS.light.warningInk};animation:none;transform:scaleX(1);
    }
    .shell[data-state="error"] .fill { background:${COLORS.light.dangerInk};animation:none;transform:scaleX(1); }
    .spinner {
      width:13px;height:13px;border-radius:999px;border:2px solid ${COLORS.light.infoBorder};
      border-top-color:${COLORS.light.accent};animation:tmo-autofill-spin 680ms linear infinite;
    }
    @keyframes tmo-autofill-hud-in {
      from { opacity:0;transform:translateY(-8px) scale(.98); }
      to { opacity:1;transform:translateY(0) scale(1); }
    }
    @keyframes tmo-autofill-progress {
      from { transform:translateX(-35%) scaleX(.35); }
      to { transform:translateX(100%) scaleX(.35); }
    }
    @keyframes tmo-autofill-spin { to { transform:rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .shell,.fill,.spinner { animation:none !important;transition:none !important; }
      .fill { width:100%; }
    }
    :host([data-motion="reduced"]) .shell,
    :host([data-motion="reduced"]) .fill,
    :host([data-motion="reduced"]) .spinner { animation:none !important;transition:none !important; }
    @media (prefers-color-scheme: dark) {
      .shell { color:var(--tmo-widget-ink,${COLORS.dark.ink});background:var(--tmo-widget-surface,${COLORS.dark.surface});border-color:var(--tmo-widget-border,${COLORS.dark.border}); }
      .hint { color:var(--tmo-widget-muted,${COLORS.dark.inkMuted}); }
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
  hint.textContent = 'TrackMyOPT · Never submits';
  const track = documentForVisual.createElement('div');
  track.className = 'track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', 'Prefill in progress');
  const fill = documentForVisual.createElement('div');
  fill.className = 'fill';
  track.appendChild(fill);
  copy.append(title, hint);
  row.append(icon, copy);
  shell.append(row, track);
  shadow.append(style, shell);
  (slot || documentForVisual.body || documentForVisual.documentElement).appendChild(host);

  const reducedMotion = options.animateFields === false ||
    documentForVisual.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches === true;
  host.setAttribute('data-motion', reducedMotion ? 'reduced' : 'full');
  let scheduledFields = 0;
  let displayedFilled = 0;
  let displayedNeedsUser = 0;
  const pending: Promise<void>[] = [];
  let finished = false;
  let failed = false;
  let preparedFields = 0;
  let activeField: HTMLElement | undefined;
  const clearActiveField = () => {
    if (activeField?.getAttribute(FIELD_STATE_ATTR) === 'filling') activeField.removeAttribute(FIELD_STATE_ATTR);
    activeField = undefined;
  };

  const render = (
    state: AutofillVisualState,
    group?: VisualGroup,
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

  const schedule = (callback: () => void, immediate = false) => {
    const delay = immediate ? 0 : autofillStaggerDelay(scheduledFields, reducedMotion);
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
    async prepareField(element, group) {
      clearActiveField();
      if (finished || !host.isConnected || !element.isConnected) return;
      ensureFieldStyles(rootForElement(element));
      element.setAttribute(FIELD_STATE_ATTR, 'filling');
      activeField = element;
      render('filling', group);
      // Short visible sequencing, capped at 864ms per pass. Never type partial
      // values into application controls or slow background Continuous runs.
      if (!reducedMotion && preparedFields++ < 12) {
        await new Promise<void>(resolve => documentForVisual.defaultView!.setTimeout(resolve, 72));
      }
    },
    clearActiveField,
    markFieldFilled(element, group) {
      if (finished) return;
      const prepared = activeField === element;
      if (prepared) activeField = undefined;
      else clearActiveField();
      schedule(() => {
        if (failed || !host.isConnected) return;
        displayedFilled += 1;
        flashAutofillField(element, 'filled');
        render('filling', group);
      }, prepared);
    },
    markNeedsUser(element) {
      if (finished) return;
      displayedNeedsUser += 1;
      flashAutofillField(element, 'needs-user');
    },
    finish(result, emptyResultMessage) {
      if (finished) return;
      finished = true;
      clearActiveField();
      void Promise.all(pending).then(() => {
        if (failed || !host.isConnected) return;
        displayedFilled = result.filled;
        displayedNeedsUser = result.skipped;
        render(
          result.skipped > 0 ? 'needs_user' : 'complete',
          undefined,
          result.filled === 0 ? emptyResultMessage : undefined
        );
        track.removeAttribute('role');
        track.removeAttribute('aria-label');
        documentForVisual.defaultView?.setTimeout(
          () => host.remove(),
          reducedMotion ? 1_600 : 2_600
        );
      });
    },
    fail(message) {
      if (failed) return;
      failed = true;
      finished = true;
      clearActiveField();
      render('error', undefined, message);
      track.removeAttribute('role');
      track.removeAttribute('aria-label');
      documentForVisual.defaultView?.setTimeout(
        () => host.remove(),
        reducedMotion ? 1_600 : 3_200
      );
    },
  };
}
