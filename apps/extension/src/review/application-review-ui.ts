/**
 * Review-before-submit panel inside the widget's coverage area.
 *
 * Accessibility: real headings, lists and buttons; one polite live status
 * line; every action is keyboard operable; layout wraps at narrow widths and
 * high zoom. The panel refreshes itself while visible when the applicant edits
 * the form or the form changes, so warnings and "ready" states never go stale.
 * It never submits anything: the applicant always clicks Submit.
 */
import { scanApplicationFields } from '../prefill/application-field-scan';
import type { PrefillCoverageResult } from '../prefill/prefill-coverage';
import {
  buildApplicationReview,
  type ApplicationReview,
  type ReviewActionKind,
  type ReviewItem,
} from './application-review';
import { markAnswerReviewed } from './field-outcomes';

const PANEL_CLASS = 'tmo-application-review';
const REFRESH_DEBOUNCE_MS = 400;

interface ReviewSession {
  root: ParentNode;
  result: PrefillCoverageResult;
  settled: WeakSet<HTMLElement>;
  observer: MutationObserver | null;
  timer: number | null;
  onInput: (event: Event) => void;
  lastSignature: string;
}

const sessions = new WeakMap<HTMLElement, ReviewSession>();

const ACTION_LABEL: Record<ReviewActionKind, string> = {
  go_to: 'Go to field',
  use_suggested: 'Use saved value',
  keep_mine: 'Keep this answer',
  looks_right: 'Looks right',
  answer_yes: 'Yes',
  answer_no: 'No',
};

function focusControl(control: HTMLElement): void {
  if (!control.isConnected) return;
  const reduced = control.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  control.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  control.focus({ preventScroll: true });
}

function button(text: string, primary = false): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  element.style.cssText = `min-height:32px;padding:6px 10px;border-radius:8px;font:600 12px/1.3 system-ui;cursor:pointer;` +
    (primary
      ? 'border:1px solid var(--tmo-widget-accent-strong, #245bd6);background:var(--tmo-widget-accent-strong, #245bd6);color:#fff;'
      : 'border:1px solid var(--tmo-widget-border, #dce3ed);background:var(--tmo-widget-surface, #fff);color:var(--tmo-widget-ink, #17243b);');
  return element;
}

function section(title: string, items: ReviewItem[], open: boolean, render: (item: ReviewItem) => HTMLElement): HTMLElement | null {
  if (!items.length) return null;
  const details = document.createElement('details');
  details.open = open;
  details.dataset.reviewGroup = title;
  details.style.cssText = 'margin-top:10px;border-top:1px solid var(--tmo-widget-border, #dce3ed);padding-top:4px;';
  const summary = document.createElement('summary');
  summary.style.cssText = 'cursor:pointer;padding:8px 2px;min-height:32px;box-sizing:border-box;';
  const heading = document.createElement('h4');
  heading.textContent = `${title} (${items.length})`;
  heading.style.cssText = 'display:inline;margin:0;font:600 12px/1.5 system-ui;color:var(--tmo-widget-ink, #17243b);';
  summary.appendChild(heading);
  details.appendChild(summary);
  const list = document.createElement('ul');
  list.style.cssText = 'list-style:none;margin:0;padding:0 2px 0 0;display:grid;gap:8px;max-height:280px;overflow:auto;overscroll-behavior:contain;';
  for (const item of items) list.appendChild(render(item));
  details.appendChild(list);
  return details;
}

function signatureOf(review: ApplicationReview): string {
  const keys = (items: ReviewItem[]) => items.map(item => item.key).join(',');
  return [review.status, keys(review.filled), keys(review.needsConfirmation), keys(review.missingRequired),
    keys(review.problems), review.resume.state, review.uninspectableFrames].join('|');
}

function renderReview(container: HTMLElement, session: ReviewSession, rebuild: () => void): ApplicationReview {
  const scan = scanApplicationFields(session.root);
  const review = buildApplicationReview({
    scan,
    outcomes: session.result.fieldOutcomes ?? [],
    resume: { result: session.result.resumeAttachmentResult, verification: session.result.uploadVerification?.resume,
      filename: session.result.resumeFilename },
    root: session.root,
    settled: session.settled,
  });
  const openGroups = new Map(Array.from(container.querySelectorAll<HTMLDetailsElement>('details[data-review-group]'))
    .map(details => [details.dataset.reviewGroup, details.open]));
  container.textContent = '';
  const heading = document.createElement('h3');
  heading.textContent = 'Review before you submit';
  heading.style.cssText = 'margin:12px 0 4px;font:650 13px/1.4 system-ui;color:var(--tmo-widget-ink, #17243b);';
  const status = document.createElement('p');
  status.className = 'tmo-review-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = review.statusText;
  status.style.cssText = `margin:0 0 6px;font:500 12px/1.5 system-ui;overflow-wrap:anywhere;color:${
    review.status === 'ready_to_review' ? 'var(--tmo-color-success-ink, #168465)' : 'var(--tmo-color-warning-ink, #9b4b13)'};`;
  const resume = document.createElement('p');
  resume.className = 'tmo-review-resume';
  resume.textContent = `Resume: ${review.resume.text}`;
  resume.style.cssText = 'margin:0;font:400 12px/1.5 system-ui;color:var(--tmo-widget-muted, #60718b);overflow-wrap:anywhere;';
  container.append(heading, status, resume);

  const renderItem = (item: ReviewItem): HTMLElement => {
    const row = document.createElement('li');
    row.style.cssText = 'display:grid;gap:4px;padding:8px 0;min-width:0;';
    const label = document.createElement('span');
    label.textContent = item.label;
    label.style.cssText = 'font:500 12px/1.5 system-ui;color:var(--tmo-widget-ink, #17243b);overflow-wrap:anywhere;';
    row.appendChild(label);
    if (item.question && item.question !== item.label) {
      const question = document.createElement('q');
      question.textContent = item.question;
      question.style.cssText = 'display:block;font:italic 400 12px/1.5 system-ui;color:var(--tmo-widget-ink, #17243b);overflow-wrap:anywhere;';
      row.appendChild(question);
    }
    if (item.detail) {
      const detail = document.createElement('small');
      detail.textContent = item.detail;
      detail.style.cssText = 'font:400 11px/1.5 system-ui;color:var(--tmo-widget-muted, #60718b);overflow-wrap:anywhere;';
      row.appendChild(detail);
    }
    if (item.actions.length) {
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
      for (const kind of item.actions) {
        const action = button(ACTION_LABEL[kind], kind === 'answer_yes' || kind === 'use_suggested' || kind === 'looks_right');
        if (kind === 'answer_yes' || kind === 'answer_no') {
          action.setAttribute('aria-label', `Answer ${ACTION_LABEL[kind]}: ${item.question ?? item.label}`);
        } else {
          action.setAttribute('aria-label', `${ACTION_LABEL[kind]}: ${item.label}`);
        }
        action.addEventListener('click', () => {
          void runAction(kind, item, session).then(ok => {
            if (!ok && kind !== 'go_to') status.textContent = 'TrackMyOPT could not apply that. Please update the field yourself.';
            else if (kind !== 'go_to') rebuild();
          });
        });
        actions.appendChild(action);
      }
      row.appendChild(actions);
    }
    return row;
  };
  const groups: Array<[string, ReviewItem[], boolean]> = [
    ['Missing required answers', review.missingRequired, true],
    ['Needs your confirmation', review.needsConfirmation, true],
    ['Problems to fix', review.problems, true],
    ['Filled', review.filled, false],
  ];
  for (const [title, items, defaultOpen] of groups) {
    const element = section(title, items, openGroups.get(title) ?? defaultOpen, renderItem);
    if (element) container.appendChild(element);
  }
  return review;
}

async function runAction(kind: ReviewActionKind, item: ReviewItem, session: ReviewSession): Promise<boolean> {
  const control = item.control;
  try {
    switch (kind) {
      case 'go_to':
        if (control) focusControl(control);
        return true;
      case 'use_suggested':
        return (await item.outcome?.replace?.()) ?? false;
      case 'keep_mine':
        if (control) session.settled.add(control);
        return true;
      case 'looks_right':
        if (control) { markAnswerReviewed(control); session.settled.add(control); }
        return true;
      case 'answer_yes':
      case 'answer_no': {
        const ok = (await item.outcome?.answerWith?.(kind === 'answer_yes' ? 'yes' : 'no')) ?? false;
        if (ok && control) session.settled.add(control);
        return ok;
      }
    }
  } catch {
    return false;
  }
}

function stopWatching(session: ReviewSession): void {
  session.observer?.disconnect();
  session.observer = null;
  if (session.timer !== null) clearTimeout(session.timer);
  session.timer = null;
  session.root.removeEventListener?.('input', session.onInput, true);
  session.root.removeEventListener?.('change', session.onInput, true);
}

/**
 * Paint (or repaint) the review panel at the end of `line`. Replaces any
 * previous review for this line and keeps exactly one watcher alive.
 */
export function mountApplicationReview(line: HTMLElement, result: PrefillCoverageResult, root: ParentNode): ApplicationReview {
  const previous = sessions.get(line);
  if (previous) stopWatching(previous);
  let container = line.querySelector<HTMLElement>(`.${PANEL_CLASS}`);
  if (!container) {
    container = document.createElement('section');
    container.className = PANEL_CLASS;
    container.setAttribute('aria-label', 'Review before you submit');
    line.appendChild(container);
  }
  const panel = container;
  const session: ReviewSession = {
    root, result, settled: previous?.settled ?? new WeakSet(), observer: null, timer: null, lastSignature: '',
    onInput: () => schedule(),
  };
  const rebuild = () => {
    if (!panel.isConnected) { stopWatching(session); return; }
    const review = renderReview(panel, session, rebuild);
    session.lastSignature = signatureOf(review);
  };
  const schedule = () => {
    if (session.timer !== null) return;
    session.timer = window.setTimeout(() => {
      session.timer = null;
      if (!panel.isConnected) { stopWatching(session); return; }
      // Repaint only when the review changed, so typing never steals focus.
      const scanCheck = buildApplicationReview({
        scan: scanApplicationFields(session.root), outcomes: session.result.fieldOutcomes ?? [],
        resume: { result: session.result.resumeAttachmentResult, verification: session.result.uploadVerification?.resume,
          filename: session.result.resumeFilename }, root: session.root, settled: session.settled,
      });
      if (signatureOf(scanCheck) !== session.lastSignature) rebuild();
    }, REFRESH_DEBOUNCE_MS);
  };
  sessions.set(line, session);
  const review = renderReview(panel, session, rebuild);
  session.lastSignature = signatureOf(review);
  root.addEventListener?.('input', session.onInput, true);
  root.addEventListener?.('change', session.onInput, true);
  const observeTarget = root instanceof Node ? root : null;
  if (observeTarget && typeof MutationObserver !== 'undefined') {
    session.observer = new MutationObserver(records => {
      // Ignore our own panel and widget updates.
      if (records.every(record => panel.contains(record.target) || line.contains(record.target))) return;
      schedule();
    });
    session.observer.observe(observeTarget, { childList: true, subtree: true, attributes: true,
      attributeFilter: ['aria-invalid', 'disabled', 'hidden', 'aria-checked', 'aria-valuetext', 'value'] });
  }
  return review;
}

/** Stop watching when the widget is torn down or a new run starts. */
export function unmountApplicationReview(line: HTMLElement): void {
  const session = sessions.get(line);
  if (session) stopWatching(session);
  sessions.delete(line);
  line.querySelector(`.${PANEL_CLASS}`)?.remove();
}
