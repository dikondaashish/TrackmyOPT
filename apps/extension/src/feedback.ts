/**
 * "Feedback" form for the TrackMyOPT extension. NPS-style rating, aspect
 * checkboxes, and a free-text comment. Submits via the background worker to
 * /api/extension/feedback (bearer-linked when signed in). TrackMyOPT theme.
 *
 * Always shown as an ON-PAGE modal overlay (centered over the current website),
 * never inside the small toolbar popup — from the job widget's "Send feedback"
 * link, and from the popup's "Feedback" button (which injects it into the
 * active tab; see feedback-modal-entry.ts).
 */

const ASPECTS = [
  "Fields weren't filled correctly",
  "Some fields weren't detected",
  'Not enough sites are supported',
  'The prefill took too long',
  "The widget appeared when it shouldn't have",
  'Other',
] as const;

// TrackMyOPT brand blue (matches web --primary + extension --tmo-blue-600).
const GREEN = '#2563eb';

/**
 * Build the feedback form element, used inside openFeedbackModal()'s on-page
 * modal (never inside the toolbar popup). `onClose` is called on Cancel and
 * shortly after a successful submit.
 */
export function buildFeedbackForm(onClose: () => void): HTMLElement {
  const onBack = onClose;
  let rating: number | null = null;
  const selectedAspects = new Set<string>();

  const container = document.createElement('div');
  container.style.cssText =
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;";

  // Branded header — TrackMyOPT ecosystem: emerald gradient + logo (matches the
  // widget header and popup theme).
  const header = document.createElement('div');
  header.style.cssText =
    'display:flex;align-items:center;gap:9px;padding:10px 14px;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);';
  const logoRing = document.createElement('div');
  logoRing.style.cssText =
    'width:28px;height:28px;border-radius:9px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 1px 3px rgba(30,64,175,0.2);overflow:hidden;';
  const logoImg = document.createElement('img');
  logoImg.src = chrome.runtime.getURL('icons/logo.gif');
  logoImg.alt = '';
  logoImg.width = 20;
  logoImg.height = 20;
  logoImg.style.cssText = 'object-fit:contain;';
  logoRing.appendChild(logoImg);
  const h = document.createElement('h1');
  h.textContent = 'Share feedback';
  h.style.cssText = 'font-size:15px;font-weight:800;margin:0;color:#1e40af;';
  header.appendChild(logoRing);
  header.appendChild(h);
  container.appendChild(header);

  const wrap = document.createElement('div');
  wrap.style.cssText = 'padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px;';
  container.appendChild(wrap);

  // Q1 — rating 0..10
  const q1 = section('How would you rate your prefill experience?', true);
  const scale = document.createElement('div');
  scale.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;';
  const ratingBtns: HTMLButtonElement[] = [];
  for (let i = 0; i <= 10; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(i);
    b.style.cssText = ratingStyle(false);
    b.addEventListener('click', () => {
      rating = i;
      ratingBtns.forEach((btn, idx) => (btn.style.cssText = ratingStyle(idx === i)));
      clearStatus();
    });
    ratingBtns.push(b);
    scale.appendChild(b);
  }
  const scaleEnds = document.createElement('div');
  scaleEnds.style.cssText =
    'display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-top:6px;';
  scaleEnds.innerHTML = '<span>Not satisfied</span><span>Very satisfied</span>';
  q1.appendChild(scale);
  q1.appendChild(scaleEnds);
  wrap.appendChild(q1);

  // Q2 — aspects
  const q2 = section('Anything that didn’t meet your expectations?', false);
  const aspectGrid = document.createElement('div');
  aspectGrid.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px;row-gap:2px;';
  for (const label of ASPECTS) {
    const row = document.createElement('label');
    row.style.cssText =
      'display:flex;align-items:center;gap:8px;min-height:38px;padding:3px 0;font-size:12px;line-height:1.25;cursor:pointer;';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.cssText = `width:16px;height:16px;accent-color:${GREEN};cursor:pointer;`;
    cb.addEventListener('change', () => {
      if (cb.checked) selectedAspects.add(label);
      else selectedAspects.delete(label);
      clearStatus();
    });
    const span = document.createElement('span');
    span.textContent = label;
    row.appendChild(cb);
    row.appendChild(span);
    aspectGrid.appendChild(row);
  }
  q2.appendChild(aspectGrid);
  wrap.appendChild(q2);

  // Q3 — comment
  const q3 = section('Any specific feedback on how we can improve?', false);
  const ta = document.createElement('textarea');
  ta.rows = 2;
  ta.placeholder = 'The more specific you are, the better we can help.';
  ta.style.cssText =
    'width:100%;height:64px;box-sizing:border-box;padding:9px 11px;border:1px solid #e2e8f0;border-radius:10px;font:inherit;font-size:12.5px;line-height:1.35;resize:none;background:#f8fafc;color:inherit;';
  ta.addEventListener('input', clearStatus);
  q3.appendChild(ta);
  wrap.appendChild(q3);

  // Status + actions
  const status = document.createElement('p');
  status.style.cssText = 'margin:0;font-size:11.5px;line-height:1.25;min-height:14px;';
  function clearStatus() {
    status.textContent = '';
  }
  function setStatus(msg: string, ok: boolean) {
    status.textContent = msg;
    status.style.color = ok ? GREEN : '#dc2626';
  }

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:9px;';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.style.cssText =
    'flex:1;min-height:42px;padding:9px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:inherit;font:inherit;font-weight:700;font-size:13px;cursor:pointer;';
  cancel.addEventListener('click', onBack);

  const submit = document.createElement('button');
  submit.type = 'button';
  submit.textContent = 'Submit';
  submit.style.cssText = `flex:1;min-height:42px;padding:9px;border:none;border-radius:10px;background:${GREEN};color:#fff;font:inherit;font-weight:800;font-size:13px;cursor:pointer;`;
  submit.addEventListener('click', async () => {
    const comment = ta.value.trim();
    if (rating === null && selectedAspects.size === 0 && comment === '') {
      setStatus('Add a rating, an option, or a comment first.', false);
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Submitting…';
    try {
      const res = (await chrome.runtime.sendMessage({
        type: 'SUBMIT_FEEDBACK',
        payload: {
          rating,
          aspects: [...selectedAspects],
          comment,
          version: chrome.runtime.getManifest().version,
        },
      })) as { ok?: boolean; error?: string } | undefined;

      if (res?.ok) {
        wrap.innerHTML = '';
        const done = document.createElement('div');
        done.style.cssText = 'padding:32px 16px;text-align:center;';
        done.innerHTML =
          `<div style="font-size:40px;line-height:1;margin-bottom:12px;">✅</div>` +
          `<div style="font-size:16px;font-weight:800;margin-bottom:6px;">Thank you!</div>` +
          `<div style="font-size:13px;color:#64748b;">Your feedback helps us improve.</div>`;
        wrap.appendChild(done);
        setTimeout(onBack, 1400);
      } else {
        submit.disabled = false;
        submit.textContent = 'Submit';
        setStatus(res?.error || 'Could not submit. Please try again.', false);
      }
    } catch {
      submit.disabled = false;
      submit.textContent = 'Submit';
      setStatus('Network error. Please try again.', false);
    }
  });

  actions.appendChild(cancel);
  actions.appendChild(submit);
  wrap.appendChild(status);
  wrap.appendChild(actions);

  return container;
}

function section(titleText: string, required: boolean): HTMLDivElement {
  const s = document.createElement('div');
  const t = document.createElement('div');
  t.style.cssText = 'font-size:12.5px;font-weight:750;margin-bottom:6px;line-height:1.3;';
  t.textContent = titleText;
  if (required) {
    const star = document.createElement('span');
    star.textContent = ' *';
    star.style.color = '#dc2626';
    t.appendChild(star);
  }
  s.appendChild(t);
  return s;
}

function ratingStyle(selected: boolean): string {
  return [
    'width:28px',
    'height:32px',
    'flex:0 0 auto',
    'border-radius:8px',
    'font:inherit',
    'font-size:12px',
    'font-weight:700',
    'cursor:pointer',
    selected ? `background:${GREEN}` : 'background:#fff',
    selected ? 'color:#fff' : 'color:#0f172a',
    selected ? `border:1px solid ${GREEN}` : 'border:1px solid #e2e8f0',
  ].join(';');
}

const FEEDBACK_MODAL_ID = 'tmo-feedback-modal';

/**
 * Open the feedback form as an ON-PAGE modal overlay, centered over the
 * current website (dark backdrop, click-outside-to-close). Shared by the job
 * widget and the popup-injected entry (feedback-modal-entry.ts) — the exact
 * same modal either way.
 */
export function openFeedbackModal(): void {
  if (document.getElementById(FEEDBACK_MODAL_ID)) return;

  const backdrop = document.createElement('div');
  backdrop.id = FEEDBACK_MODAL_ID;
  backdrop.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.5);display:flex;align-items:center;justify-content:center;padding:10px;';

  const card = document.createElement('div');
  card.style.cssText =
    'width:min(460px,100%);overflow:hidden;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.35);';

  const close = () => backdrop.remove();
  card.appendChild(buildFeedbackForm(close));
  backdrop.appendChild(card);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.body.appendChild(backdrop);
}
