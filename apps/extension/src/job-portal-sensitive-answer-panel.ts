/** Informational only. Saved values are fetched by Prefill, never rendered here. */
import { API_ENDPOINTS } from './config';
import { icon } from './icons';

export function createSensitiveAnswerPanel(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'tmo-sensitive-answer-panel';
  section.style.cssText = 'background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);border:0;border-top:1px solid var(--tmo-widget-border);border-radius:0;margin:8px 0 0;padding:6px 0;';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.innerHTML = `${icon('lock',16)}<span>Private answers</span><span style="font-size:11px;color:var(--tmo-widget-muted)">Included in Prefill</span>${icon('chevronRight',16)}`;
  toggle.setAttribute('aria-label','Private answers (included in Prefill)');
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls','tmo-private-answers-body');
  toggle.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;min-height:44px;padding:6px 8px;border:0;border-radius:8px;background:transparent;color:var(--tmo-widget-ink);font:inherit;font-size:12px;text-align:left;cursor:pointer;';
  const body = document.createElement('div');
  body.id = 'tmo-private-answers-body';
  body.hidden = true;
  const note = document.createElement('p');
  note.textContent = 'Click Prefill this application to fill matching questions with your saved answers. Your saved portal login can also fill supported login and create-account forms. Existing answers stay unchanged. Review everything before continuing or submitting.';
  note.style.cssText = 'margin:8px;color:var(--tmo-widget-muted);font-size:12px;line-height:1.5;';
  const manage = document.createElement('button');
  manage.type = 'button';
  manage.textContent = 'Manage saved prefill data';
  manage.style.cssText = 'min-height:36px;padding:6px 8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-accent);font:inherit;font-size:12px;cursor:pointer;';
  manage.addEventListener('click',()=>window.open(API_ENDPOINTS.DASHBOARD_JOB_PREFILL,'_blank','noopener,noreferrer'));
  const status = document.createElement('p');
  status.setAttribute('role','status');
  status.style.cssText = 'margin:6px 8px;color:var(--tmo-widget-muted);font-size:12px;line-height:1.4;';
  section.addEventListener('tmo-private-prefill-status',event=>{
    const state=(event as CustomEvent).detail;
    status.textContent = state === 'unavailable'
      ? 'Saved private answers could not load. Your profile can still fill. Click Prefill to retry.'
      : state === 'empty' ? 'No private answers saved. Add them in Manage saved prefill data.'
      : '';
  });
  toggle.addEventListener('click',()=>{
    body.hidden=!body.hidden;
    toggle.setAttribute('aria-expanded',String(!body.hidden));
  });
  body.append(note,manage);
  section.append(toggle,body,status);
  return section;
}
