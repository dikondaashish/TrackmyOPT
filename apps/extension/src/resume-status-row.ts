/**
 * "Is a tailored resume going to be attached here?" — stated plainly, above the
 * Prefill button.
 *
 * Previously the only signal was the Prefill button's own label flipping
 * between "Prefill application" and "Prefill application + resume". That is
 * easy to miss, and it said nothing after the fact: a user could not tell
 * whether the PDF actually landed in the upload field or was silently skipped
 * because the field was on a later step. That is the one thing they need to
 * know before submitting.
 *
 * Pure DOM + icons, no chrome.* — so it renders in a unit test and in a static
 * preview exactly as it does in the widget.
 */

import { icon, type ExtensionIconName } from './icons';

export const RESUME_STATUS_ROW_CLASS = 'tmo-resume-status-row';

export type ResumeStatusState = 'checking' | 'none' | 'ready' | 'attached';

interface ResumeStatusCopy {
  label: string;
  sublabel: string;
  iconName: ExtensionIconName;
  tone: 'muted' | 'success';
}

export const RESUME_STATUS_COPY: Record<ResumeStatusState, ResumeStatusCopy> = {
  checking: {
    label: 'Checking for a tailored resume…',
    sublabel: 'Looking for one generated for this job',
    iconName: 'info',
    tone: 'muted',
  },
  none: {
    label: 'No tailored resume for this job',
    sublabel: 'Prefill will fill your profile fields only',
    iconName: 'fileText',
    tone: 'muted',
  },
  ready: {
    label: 'Tailored resume ready',
    sublabel: 'Attaches to the upload field when you prefill',
    iconName: 'checkCircle',
    tone: 'success',
  },
  attached: {
    label: 'Resume attached to this application',
    sublabel: 'Review it, then submit the form yourself',
    iconName: 'checkCircle',
    tone: 'success',
  },
};

export function createResumeStatusRow(
  ownerDocument: Document = document,
): HTMLElement {
  const row = ownerDocument.createElement('div');
  row.className = RESUME_STATUS_ROW_CLASS;
  row.setAttribute('role', 'status');
  row.setAttribute('aria-live', 'polite');
  row.style.cssText =
    'display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--tmo-widget-border);';

  const mark = ownerDocument.createElement('span');
  mark.className = 'tmo-resume-status-icon';
  mark.setAttribute('aria-hidden', 'true');
  mark.style.cssText = 'display:flex;flex:0 0 auto;';

  const textWrap = ownerDocument.createElement('span');
  textWrap.style.cssText = 'flex:1;min-width:0;';

  const label = ownerDocument.createElement('span');
  label.className = 'tmo-resume-status-label';
  label.style.cssText =
    'display:block;font-size:11.5px;font-weight:800;line-height:1.3;overflow-wrap:anywhere;';

  // Hierarchy here comes from size and weight, not from a lighter colour.
  // `--tmo-widget-muted` on the neutral surface measures 4.32:1, under the
  // 4.5:1 AA floor for text this small, so both lines take the tone colour.
  const sublabel = ownerDocument.createElement('span');
  sublabel.className = 'tmo-resume-status-sublabel';
  sublabel.style.cssText =
    'display:block;margin-top:1px;font-size:10.5px;font-weight:600;line-height:1.35;overflow-wrap:anywhere;';

  textWrap.append(label, sublabel);
  row.append(mark, textWrap);
  paintResumeStatusRow(row, 'checking');
  return row;
}

export function paintResumeStatusRow(
  row: HTMLElement,
  state: ResumeStatusState,
  detail?: string,
): void {
  const copy = RESUME_STATUS_COPY[state];
  const ink =
    copy.tone === 'success'
      ? 'var(--tmo-widget-success-ink)'
      : 'var(--tmo-widget-ink)';

  row.style.background =
    copy.tone === 'success'
      ? 'var(--tmo-widget-success-surface)'
      : 'var(--tmo-widget-surface-2)';
  row.dataset.resumeStatus = state;

  const mark = row.querySelector<HTMLElement>('.tmo-resume-status-icon');
  if (mark) mark.innerHTML = icon(copy.iconName, 15, ink);

  const label = row.querySelector<HTMLElement>('.tmo-resume-status-label');
  if (label) {
    label.textContent = copy.label;
    label.style.color = ink;
  }

  const sublabel = row.querySelector<HTMLElement>('.tmo-resume-status-sublabel');
  if (sublabel) {
    // textContent only — `detail` can carry scraped field labels.
    sublabel.textContent = detail || copy.sublabel;
    sublabel.style.color = ink;
  }
}

/** True once the file is really in the form; a later re-check must not undo it. */
export function isResumeStatusAttached(row: HTMLElement | null): boolean {
  return row?.dataset.resumeStatus === 'attached';
}

/**
 * Copy for a Prefill control, wherever it lives.
 *
 * There are three ways to start a prefill — the in-page widget, the toolbar
 * popup, and Continuous mode — and they used to describe the same action
 * differently, with only the widget hinting that a resume was involved. One
 * source of copy keeps them honest with each other.
 */
export function prefillEntryCopy(hasResume: boolean): {
  label: string;
  sublabel: string;
  title: string;
} {
  // Sublabels stay under ~36 characters: the in-page widget is 320px wide, and
  // a second line there pushes the whole panel taller on a height-constrained
  // job page. The full explanation lives in the title attribute.
  return hasResume
    ? {
        label: 'Prefill application + resume',
        sublabel: 'Fills fields + attaches your resume',
        title:
          'Prefill profile fields and attach the custom resume generated for this job. You review and submit.',
      }
    : {
        label: 'Prefill this application',
        sublabel: 'Fills your saved profile fields',
        title:
          'Prefill available profile fields for this application. You review and submit.',
      };
}

/**
 * What the row should say after a prefill pass. `attachedCount` is the engine's
 * own count of resume fields it filled, so the row reports what happened rather
 * than what was offered.
 */
export function resumeStatusAfterPrefill(input: {
  attachedCount: number;
  hasResume: boolean;
}): { state: ResumeStatusState; detail?: string } {
  if (input.attachedCount > 0) return { state: 'attached' };
  if (input.hasResume) {
    return {
      state: 'ready',
      detail:
        'No empty Resume/CV upload field here yet — prefill again when it appears',
    };
  }
  return { state: 'none' };
}
