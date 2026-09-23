import { API_ENDPOINTS, WEBSITE_URL } from './config';
import { TOUR_KEY, normalizeTourState } from './onboarding';
import { TOUR_CHAPTERS, chapterMarkup } from './tour-content';
import { runPrefill } from './easy-apply-engine';
import { createAutofillVisualFeedback } from './autofill-visual-feedback';
import { mountTourGuide } from './tour-guide';
import type { BasicContactProfile } from './resume-autofill-contract';

const DEMO_PROFILE: BasicContactProfile = {
  firstName: 'Alex',
  lastName: 'Taylor',
  fullName: 'Alex Taylor',
  email: 'alex@example.test',
  phone: '',
  country: 'United States',
  city: 'Boston',
  state: 'MA',
  streetAddress: '',
  postalCode: '',
  countyDistrict: '',
  yearsExperience: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
};
const root = document.getElementById('tour-root')!;
let step = 0;
let generation = 0;
let busy = false;
let demoUsed = false;
let clearGuide = () => {};
const packaged = location.protocol === 'chrome-extension:';

async function save(status: 'active' | 'completed' | 'skipped') {
  if (!packaged) return true;
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'SAVE_TOUR_PROGRESS',
      step,
      status,
    });
    if (!result?.ok) throw new Error('storage');
    return true;
  } catch {
    const note = root.querySelector<HTMLElement>('#save-note');
    if (note)
      note.textContent =
        'Progress could not be saved. You can keep exploring or retry.';
    return false;
  }
}

function connectRoutes() {
  root.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach((link) => {
    link.href = `${WEBSITE_URL}${link.dataset.route}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

function render(focus = false) {
  clearGuide();
  generation++;
  busy = false;
  demoUsed = false;
  const chapter = TOUR_CHAPTERS[step];
  root.innerHTML = `<header class="tour-header"><a class="brand" href="${API_ENDPOINTS.DASHBOARD_JOB_PREFILL}" target="_blank" rel="noopener noreferrer"><img src="icons/logo.gif" width="40" height="40" alt=""><b>TrackMyOPT</b></a><span class="tour-label">FIRST STEPS</span><button type="button" class="quiet" id="skip">Skip tour</button></header><div class="tour-layout"><nav class="chapters" aria-label="Tour sections"><p class="eyebrow">A QUICK LOOK AROUND</p><ol>${TOUR_CHAPTERS.map((item, index) => `<li><button type="button" data-step="${index}" ${index === step ? 'aria-current="step"' : ''}><span class="chapter-number">${String(index + 1).padStart(2, '0')}</span>${item.label}</button></li>`).join('')}</ol><div class="safe-note"><span class="badge">Safe to explore</span><p>Sample data only.<br>No applications sent.<br>No AI credits used.</p></div></nav><main><div class="chapter-heading"><p class="eyebrow">${String(step + 1).padStart(2, '0')} / 07 · ${chapter.label}</p><h1 id="chapter-title" tabindex="-1">${chapter.title}</h1><p>${chapter.text}</p></div><section class="demo-stage" aria-label="Interactive demonstration">${chapterMarkup(step)}</section><p id="demo-status" role="status" aria-live="polite"></p><p class="chapter-tip">${chapter.tip}</p><footer class="tour-footer"><button type="button" id="back" class="secondary" ${step === 0 ? 'disabled' : ''}>Back</button><div class="tour-progress"><label for="tour-progress">${step + 1} of 7</label><progress id="tour-progress" value="${step + 1}" max="7"></progress></div><button type="button" id="next" class="primary">${step === 6 ? 'Finish tour' : step === 0 ? 'Try Prefill →' : 'Continue →'}</button></footer><p role="status" id="save-note"></p></main></div>`;
  connectRoutes();
  root
    .querySelector('form')
    ?.addEventListener('submit', (event) => event.preventDefault());
  root
    .querySelectorAll<HTMLButtonElement>('[data-step]')
    .forEach((button) =>
      button.addEventListener('click', () =>
        navigate(Number(button.dataset.step))
      )
    );
  root
    .querySelector('#back')
    ?.addEventListener('click', () => navigate(step - 1));
  root
    .querySelector('#next')
    ?.addEventListener('click', () =>
      step === 6 ? void finish('completed') : navigate(step + 1)
    );
  root
    .querySelector('#skip')
    ?.addEventListener('click', () => void finish('skipped'));
  root
    .querySelector('#demo-action')
    ?.addEventListener('click', () => void demo());
  root
    .querySelector('#demo-reset')
    ?.addEventListener('click', () => render(true));
  clearGuide = mountTourGuide(root, step, () => void finish('skipped'), focus);
}

function navigate(next: number) {
  if (next < 0 || next >= TOUR_CHAPTERS.length) return;
  step = next;
  render(true);
  void save('active');
}

async function demo() {
  if (busy) return;
  busy = true;
  const run = generation;
  const button = root.querySelector<HTMLButtonElement>('#demo-action')!;
  button.disabled = true;
  const status = root.querySelector<HTMLElement>('#demo-status')!;
  try {
    if (step === 1) {
      const visual = createAutofillVisualFeedback(document, {
        animateFields: true,
      });
      const result = await runPrefill({
        profileFallback: DEMO_PROFILE,
        visualFeedback: visual,
        animateFields: true,
        quietResultToast: true,
        shouldContinue: () => generation === run,
      });
      if (generation !== run) return;
      visual.finish(
        result,
        'Sample already filled. Your existing entries stay unchanged.'
      );
      status.textContent = result.filled
        ? `${result.filled} sample fields filled. Review or edit them. Nothing was sent.`
        : 'No fields changed. Your existing entries stay untouched.';
    } else if (step === 2) {
      root.querySelector('#resume-bullet')!.textContent =
        'Built SQL reports and maintained dashboards for weekly team reporting.';
      root.querySelector('#resume-note')!.textContent =
        'Same experience, clearer emphasis for this sample role. Review facts before using a real generated resume.';
      root.querySelector('.resume-paper')?.classList.add('demonstrated');
      status.textContent = 'Prepared example shown. No AI request was made.';
    } else if (step === 3) {
      root.querySelector('#job-stage')!.textContent = demoUsed
        ? 'Applied'
        : 'Wishlist';
      button.textContent = demoUsed
        ? 'Sample marked Applied'
        : 'Mark sample as Applied';
      status.textContent =
        'Only the demo changed. Your real tracker is untouched.';
      demoUsed = true;
    } else if (step === 4 || step === 5) {
      root.querySelector('#clock-value')!.textContent = '14';
      root.querySelector('#clock-explanation')!.textContent =
        'Example: 21 days minus a 7-day recorded employment period leaves 14 sample days. Your real clock depends on your full history and the applicable rules.';
      status.textContent =
        'Employment history changes the example. No dates or records were saved.';
    }
  } catch {
    if (generation === run)
      status.textContent =
        'The demo could not finish. Try again or continue to the next section.';
  } finally {
    if (generation === run) {
      busy = false;
      button.disabled = false;
    }
  }
}

async function finish(status: 'completed' | 'skipped') {
  const transition = ++generation;
  busy = false;
  const demoButton = root.querySelector<HTMLButtonElement>('#demo-action');
  if (demoButton) demoButton.disabled = false;
  if (!(await save(status)) || generation !== transition) return;
  clearGuide();
  root.innerHTML = `<main class="tour-done"><img src="icons/logo.gif" width="64" height="64" alt="TrackMyOPT"><span class="eyebrow">${status === 'completed' ? 'TOUR COMPLETE' : 'EXPLORE AT YOUR PACE'}</span><h1 tabindex="-1">${status === 'completed' ? 'Your next application starts here.' : 'Ready when you are.'}</h1><p>Set up your profile when you’re ready. Find this tour anytime in the extension’s Product tour link.</p><a class="primary" data-route="/dashboard/extension">Set up my application profile ↗</a><button type="button" class="secondary" id="restart">Replay tour</button><p id="save-note" role="status"></p></main>`;
  connectRoutes();
  root.querySelector('#restart')?.addEventListener('click', () => navigate(0));
  root.querySelector<HTMLElement>('h1')?.focus();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && busy) {
    generation++;
    busy = false;
    const button = root.querySelector<HTMLButtonElement>('#demo-action');
    if (button) button.disabled = false;
    const status = root.querySelector<HTMLElement>('#demo-status');
    if (status) status.textContent = 'Demo stopped. You can retry or continue.';
  }
});

async function init() {
  if (packaged) {
    try {
      const [stored, preferences] = await Promise.all([
        chrome.storage.local.get(TOUR_KEY),
        chrome.storage.sync.get('theme'),
      ]);
      const state = normalizeTourState(stored[TOUR_KEY]);
      if (state?.status === 'active') step = state.step;
      if (preferences.theme === 'light' || preferences.theme === 'dark')
        document.documentElement.dataset.tmoTheme = preferences.theme;
    } catch {
      /* The demo works even when progress storage is unavailable. */
    }
  }
  render();
}
void init();
