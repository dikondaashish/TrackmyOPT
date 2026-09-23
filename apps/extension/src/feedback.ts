/** Shared, on-page feedback form. Opening it never sends feedback. */
import { applyWidgetThemeScope } from './job-portal-widget-theme';
import { icon } from './icons';
import { FEEDBACK_CSS } from './feedback-styles';

// Short labels preserve existing API/reporting values.
const ASPECTS = [
  ['Incorrect answers', "Fields weren't filled correctly"],
  ['Missed fields', "Some fields weren't detected"],
  ['Unsupported site', 'Not enough sites are supported'],
  ['Too slow', 'The prefill took too long'],
  ['Unexpected widget', "The widget appeared when it shouldn't have"],
  ['Other', 'Other'],
] as const;
const MODAL_ID = 'tmo-feedback-modal';

export function buildFeedbackForm(onClose: () => void): HTMLElement {
  const form = document.createElement('form');
  form.className = 'tmo-feedback';
  form.noValidate = true;
  form.innerHTML = `<style>${FEEDBACK_CSS}</style>
    <header class="fb-header">
      <img class="fb-logo" width="36" height="36" alt="TrackMyOPT" />
      <div><p class="fb-brand">TrackMyOPT</p><h1 id="tmo-feedback-title">Share feedback</h1></div>
      <button class="fb-close" type="button" aria-label="Close feedback">×</button>
    </header>
    <div class="fb-body">
      <fieldset class="fb-section"><legend>How was your prefill experience?</legend>
        <div class="fb-scale" role="radiogroup" aria-label="Prefill experience rating" aria-describedby="fb-scale-help"></div>
        <div class="fb-scale-help" id="fb-scale-help"><span>0 · Not satisfied</span><span>10 · Very satisfied</span></div>
      </fieldset>
      <fieldset class="fb-section"><legend>What could be better? <span class="fb-optional">Optional</span></legend>
        <p class="fb-hint">Select any that apply.</p><div class="fb-issues"></div>
      </fieldset>
      <div class="fb-section"><label class="fb-label" for="fb-comment">Anything else? <span class="fb-optional">Optional</span></label>
        <textarea id="fb-comment" name="comment" rows="3" maxlength="4000" placeholder="Tell us what happened or what would help." aria-describedby="fb-comment-help"></textarea>
        <div class="fb-comment-meta"><span id="fb-comment-help">Please leave out sensitive personal details.</span><span class="fb-count">0 / 4,000</span></div>
      </div>
      <p class="fb-status" role="status" aria-live="polite" tabindex="-1"></p>
    </div>
    <footer class="fb-actions"><button class="fb-cancel" type="button">Cancel</button><button class="fb-submit" type="submit">Send feedback ${icon('chevronRight', 16, 'currentColor')}</button></footer>`;
  form.querySelector<HTMLImageElement>('.fb-logo')!.src = chrome.runtime.getURL('icons/logo.gif');
  const scale = form.querySelector('.fb-scale')!;
  for (let n = 0; n <= 10; n++) {
    const label = document.createElement('label');
    label.className = 'fb-rating';
    label.innerHTML = `<input type="radio" name="rating" value="${n}" aria-label="${n} out of 10" /><span>${n}</span>`;
    scale.appendChild(label);
  }
  for (const [label, value] of ASPECTS) {
    const chip = document.createElement('label');
    chip.className = 'fb-chip';
    const input = document.createElement('input');
    input.type = 'checkbox'; input.name = 'aspect'; input.value = value;
    const text = document.createElement('span');
    const check = document.createElement('span');
    check.className = 'fb-chip-mark'; check.setAttribute('aria-hidden', 'true'); check.textContent = '✓';
    text.append(check, label); chip.append(input, text);
    form.querySelector('.fb-issues')!.appendChild(chip);
  }
  const status = form.querySelector<HTMLElement>('.fb-status')!;
  const comment = form.querySelector<HTMLTextAreaElement>('textarea')!;
  const submit = form.querySelector<HTMLButtonElement>('.fb-submit')!;
  const submitMarkup = submit.innerHTML;
  form.addEventListener('input', () => {
    status.textContent = ''; status.removeAttribute('data-error');
    form.querySelector('.fb-count')!.textContent = `${comment.value.length.toLocaleString('en-US')} / 4,000`;
  });
  const close = () => { if (form.getAttribute('aria-busy') !== 'true') onClose(); };
  form.querySelector('.fb-close')!.addEventListener('click', close);
  form.querySelector('.fb-cancel')!.addEventListener('click', close);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;
    const selected = form.querySelector<HTMLInputElement>('input[name="rating"]:checked');
    const aspects = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="aspect"]:checked')).map(input => input.value);
    if (!selected && !aspects.length && !comment.value.trim()) {
      status.textContent = 'Choose a rating, select an issue, or add a note.';
      status.dataset.error = 'true';
      form.querySelector<HTMLInputElement>('input[name="rating"]')!.focus(); return;
    }
    form.setAttribute('aria-busy', 'true');
    const controls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>('button,input,textarea'));
    controls.forEach(control => { control.disabled = true; });
    submit.textContent = 'Sending…'; status.textContent = 'Sending your feedback…'; status.focus();
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SUBMIT_FEEDBACK', payload: {
        rating: selected ? Number(selected.value) : null, aspects, comment: comment.value.trim(), version: chrome.runtime.getManifest().version,
      } });
      if (!response?.ok) throw new Error(response?.error || 'Could not send feedback. Please try again.');
      if (!form.isConnected) return;
      form.querySelector('.fb-body')!.innerHTML = `<div class="fb-success" role="status" tabindex="-1"><span class="fb-success-icon" aria-hidden="true">${icon('checkCircle', 28, 'currentColor')}</span><h2>Thanks for sharing.</h2><p>Your feedback helps improve prefill.</p></div>`;
      form.querySelector('.fb-actions')!.innerHTML = '<button class="fb-submit fb-done" type="button">Done</button>';
      form.querySelector('.fb-done')!.addEventListener('click', onClose);
      form.querySelector<HTMLElement>('.fb-success')!.focus();
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Could not send feedback. Please try again.';
      status.dataset.error = 'true'; status.focus();
    } finally {
      form.setAttribute('aria-busy', 'false');
      controls.forEach(control => { control.disabled = false; }); submit.innerHTML = submitMarkup;
    }
  });
  return form;
}

/** Shadow styles isolate the form from employer-page CSS. */
export function openFeedbackModal(): void {
  if (document.getElementById(MODAL_ID)) return;
  const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const backdrop = document.createElement('div'); backdrop.id = MODAL_ID;
  applyWidgetThemeScope(backdrop); backdrop.setAttribute('popover', 'manual');
  backdrop.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;margin:0;border:0;padding:12px;box-sizing:border-box;z-index:2147483647;background:var(--tmo-widget-overlay);display:flex;align-items:center;justify-content:center;';
  const shadow = backdrop.attachShadow({ mode: 'open' });
  let form: HTMLElement;
  const close = () => {
    if (form.getAttribute('aria-busy') === 'true') return;
    document.removeEventListener('keydown', onKey, true);
    try { backdrop.hidePopover?.(); } catch { /* already closed */ }
    backdrop.remove(); if (returnFocus?.isConnected) returnFocus.focus();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key !== 'Tab') return;
    const controls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>('button,input,textarea')).filter(control => !control.disabled);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && shadow.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && shadow.activeElement === last) { event.preventDefault(); first.focus(); }
    else if (!controls.some(control => control === shadow.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
  };
  form = buildFeedbackForm(close); form.setAttribute('role', 'dialog');
  form.setAttribute('aria-modal', 'true'); form.setAttribute('aria-labelledby', 'tmo-feedback-title');
  shadow.appendChild(form);
  backdrop.addEventListener('click', event => { if (event.composedPath()[0] === backdrop) close(); });
  document.body.appendChild(backdrop); document.addEventListener('keydown', onKey, true);
  try { backdrop.showPopover?.(); } catch { backdrop.removeAttribute('popover'); }
  form.querySelector<HTMLInputElement>('input[name="rating"]')!.focus();
}
