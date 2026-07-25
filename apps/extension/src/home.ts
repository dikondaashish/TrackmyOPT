import { API_ENDPOINTS } from './config';
import { performExtensionSignOut } from './signOut';
import { icon, themeToggleIcon } from './icons';
import { getIdToken } from './token-store';
import {
  AUTOFILL_PREFERENCES_KEY,
  DEFAULT_AUTOFILL_PREFERENCES,
  normalizeAutofillPreferences,
  type AutofillPreferences,
} from './autofill-preferences';
import { AUTOFILL_FEATURE_FLAGS } from './autofill-feature-flags';

/** Escape untrusted values before interpolating them into innerHTML. */
function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );
}

const transientLabelTimers = new WeakMap<HTMLElement, number>();

/** Change only a button's text span, preserve its icon/subtext, then restore. */
function showTransientLabel(label: HTMLElement, message: string, original: string): void {
  const previousTimer = transientLabelTimers.get(label);
  if (previousTimer) window.clearTimeout(previousTimer);
  label.textContent = message;
  const timer = window.setTimeout(() => {
    if (label.isConnected) label.textContent = original;
    transientLabelTimers.delete(label);
  }, 2500);
  transientLabelTimers.set(label, timer);
}

/**
 * Renders the signed-in home screen with tool tiles
 */
export async function renderHome(root: HTMLElement, onNavigate: (page: string) => void): Promise<void> {
  let autofillPreferences: AutofillPreferences = { ...DEFAULT_AUTOFILL_PREFERENCES };
  try {
    const stored = await chrome.storage.sync.get(AUTOFILL_PREFERENCES_KEY);
    autofillPreferences = normalizeAutofillPreferences(stored[AUTOFILL_PREFERENCES_KEY]);
  } catch {
    // Safe defaults remain active if preferences cannot be read.
  }
  // Fetch premium status to show badge. Try the web session cookie first; only
  // an unauthenticated/failed cookie request falls back to the extension JWT.
  let planBadge = '';
  let caseStatusCard = '';
  try {
    const statusToken = await getIdToken();
    type PremiumStatusPayload = {
      isPremium?: boolean;
      planName?: string;
      error?: string;
    };
    let data: PremiumStatusPayload | null = null;
    let cookieRequestOk = false;
    try {
      const cookieRes = await fetch(API_ENDPOINTS.STATUS, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      cookieRequestOk = cookieRes.ok;
      if (cookieRes.ok) data = await cookieRes.json() as PremiumStatusPayload;
    } catch {
      // The Bearer attempt below is still useful for a transient cookie failure.
    }

    const cookieUnauthenticated = data?.error === 'Not authenticated';
    if ((!cookieRequestOk || cookieUnauthenticated) && statusToken) {
      const bearerRes = await fetch(API_ENDPOINTS.STATUS, {
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${statusToken}`,
        },
      });
      if (bearerRes.ok) data = await bearerRes.json() as PremiumStatusPayload;
    }

    if (data?.isPremium && data.planName) {
      const plan = String(data.planName).toUpperCase();
      const badgeClass = plan === 'DEDICATED' ? 'badge-dedicated' : 'badge-pro';
      planBadge = `<span class="plan-badge ${badgeClass}">${escapeHtml(plan)}</span>`;
    }
  } catch (err) {
    console.error('Failed to fetch premium status for extension', err);
  }

  try {
    const idToken = await getIdToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof idToken === 'string' && idToken.length > 0) {
      headers.Authorization = `Bearer ${idToken}`;
    }
    const caseRes = await fetch(API_ENDPOINTS.CASE_STATUS, {
      credentials: 'include',
      headers,
    });
    if (caseRes.ok) {
      const caseData = await caseRes.json();
      const primary = caseData.data;
      const caseCount = Array.isArray(caseData.cases) ? caseData.cases.length : primary ? 1 : 0;
      if (primary?.receipt_number) {
        const statusText = primary.current_status || 'Checking USCIS…';
        const moreCases =
          caseCount > 1 ? `<span class="case-more">+${caseCount - 1} more</span>` : '';
        caseStatusCard = `
          <a class="case-status-card" href="${API_ENDPOINTS.DASHBOARD_CASE_STATUS}" target="_blank" rel="noreferrer" aria-label="Open case status dashboard">
            <div class="case-status-top">
              <span class="case-status-label">${icon('fileText', 16)} Case Status</span>
              ${moreCases}
            </div>
            <p class="case-status-receipt">${escapeHtml(primary.receipt_number)}</p>
            <p class="case-status-text">${escapeHtml(statusText)}</p>
          </a>
        `;
      }
    }
  } catch (err) {
    console.error('Failed to fetch case status for extension', err);
  }

  root.innerHTML = `
    <div class="tmo-top" role="region" aria-label="TrackMyOPT header">
      <div class="brandmark">${icon('graduationCap', 20)}</div>
      <div class="brandtext">
        <h1 class="title">TrackMyOPT ${planBadge}</h1>
        <p class="subtitle">Your OPT command center</p>
      </div>
      <button class="theme-btn" id="theme-btn" title="Toggle theme" aria-label="Toggle theme">
        <span id="theme-icon">${icon('moon', 16)}</span>
      </button>
      <button class="logout-btn" id="logout-btn" title="Sign out" aria-label="Sign out">
        ${icon('logOut', 16)}
      </button>
    </div>

    ${caseStatusCard}

    <div class="eyebrow">OPT Tools</div>
    <div class="tools" role="list">
      <div class="tool-card" role="button" tabindex="0" aria-label="OPT Apply Dates - Calculate when you can start applying for OPT" data-page="opt-apply">
        <div class="chip blue">${icon('calendar', 18)}</div>
        <h3 class="t">OPT Apply Dates</h3>
        <p class="s">Your filing window</p>
      </div>

      <div class="tool-card" role="button" tabindex="0" aria-label="OPT Clock Tracker - Track your OPT unemployment days in real-time" data-page="clock">
        <div class="chip purple">${icon('clock', 18)}</div>
        <h3 class="t">OPT Clock</h3>
        <p class="s">Unemployment days</p>
      </div>

      <div class="tool-card" role="button" tabindex="0" aria-label="STEM Apply Dates - Calculate STEM OPT extension application dates" data-page="stem-apply">
        <div class="chip green">${icon('graduationCap', 18)}</div>
        <h3 class="t">STEM Apply Dates</h3>
        <p class="s">Extension window</p>
      </div>

      <div class="tool-card" role="button" tabindex="0" aria-label="STEM Clock Tracker - Track your STEM OPT unemployment days" data-page="stem-clock">
        <div class="chip orange">${icon('timer', 18)}</div>
        <h3 class="t">STEM Clock</h3>
        <p class="s">STEM unemployment</p>
      </div>
    </div>

    <div class="page-panel">
      <div class="phead"><span class="pdot"></span> Job application</div>
      <a
        class="act"
        id="manage-job-prefill-link"
        href="${API_ENDPOINTS.DASHBOARD_JOB_PREFILL}"
        target="_blank"
        rel="noopener noreferrer"
        title="Add or edit the information TrackMyOPT uses to prefill job applications"
      >
        <span class="aic">${icon('sparkles', 16)}</span>
        <span class="atxt">
          <span class="at">Add or edit prefill data</span>
          <span class="as">Name, address, visa &amp; work preferences</span>
        </span>
        <span class="arr">${icon('chevronRight', 16)}</span>
      </a>
      <button class="act" id="scan-page-btn" type="button" title="Detect a job posting on the current tab and add it to your tracker">
        <span class="aic">${icon('fileText', 16)}</span>
        <span class="atxt">
          <span class="at">Add this job to tracker</span>
          <span class="as">Detect the posting on this tab</span>
        </span>
        <span class="arr">${icon('chevronRight', 16)}</span>
      </button>
      <button class="act" id="prefill-easy-apply-btn" type="button" title="Prefill the open job application form — you review and submit">
        <span class="aic">${icon('checkCircle', 16)}</span>
        <span class="atxt">
          <span class="at">Prefill this application</span>
          <span class="as">Fill the form — you review &amp; submit</span>
        </span>
        <span class="arr">${icon('chevronRight', 16)}</span>
      </button>
      <div class="prefill-settings" aria-label="Application prefill settings">
        <div class="prefill-setting-heading">Prefill mode</div>
        <div class="prefill-mode-toggle" role="group" aria-label="Prefill mode">
          <button type="button" id="prefill-mode-step" aria-pressed="false">Step-by-step</button>
          <button type="button" id="prefill-mode-continuous" aria-pressed="false">Continuous</button>
        </div>
        <label class="prefill-skills-toggle">
          <input type="checkbox" id="autofill-skills-toggle">
          <span>
            <b>Fill dedicated skills fields</b>
            <small>Off by default · uses only this job's generated resume</small>
          </span>
        </label>
        <label class="prefill-skills-toggle">
          <input type="checkbox" id="guided-autopilot-toggle">
          <span>
            <b>Guided Autopilot</b>
            <small>Fills each step and clicks safe Next/Done buttons · never Submit</small>
          </span>
        </label>
        <p class="prefill-mode-note" id="prefill-mode-note" role="status" aria-live="polite"></p>
      </div>
    </div>

    <div class="compliance">
      <div class="ci">${icon('shield', 15)}</div>
      <div><b>Stay compliant.</b> These tools help you track your OPT requirements. Always confirm official guidance with your DSO.</div>
    </div>

    <div class="foot">
      <button id="feedback-btn" class="fb" type="button">
        ${icon('mail', 13)} <span class="fb-label">Feedback</span>
      </button>
      <div class="links">
        <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/privacy">Privacy</a> ·
        <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/terms">Terms</a>
      </div>
    </div>
  `;

  // Opens the feedback modal ON THE ACTUAL PAGE (centered overlay), injected via
  // activeTab — the exact same modal the job widget's "Send feedback" link opens.
  // Never renders inside the small toolbar popup.
  const feedbackBtnEl = root.querySelector<HTMLButtonElement>('#feedback-btn');
  const feedbackLabel = feedbackBtnEl?.querySelector<HTMLElement>('.fb-label');
  feedbackBtnEl?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url ?? '';
    if (!tab?.id || !/^https?:\/\//i.test(url)) {
      if (feedbackLabel) showTransientLabel(feedbackLabel, 'Open a website tab first', 'Feedback');
      return;
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['feedback-modal-entry.js'],
      });
      window.close();
    } catch {
      if (feedbackLabel) showTransientLabel(feedbackLabel, 'Cannot open feedback on this page', 'Feedback');
    }
  });

  // Hook up tile navigation
  const tiles = root.querySelectorAll<HTMLElement>('.tool-card');
  tiles.forEach(tile => {
    const page = tile.dataset.page;
    const href = tile.dataset.link;

    const navigate = () => {
      if (page) {
        // Navigate within popup
        onNavigate(page);
      } else if (href) {
        // Open external link in new tab
        chrome.tabs.create({ url: href });
      }
    };

    tile.addEventListener('click', navigate);

    // Keyboard accessibility
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });
  });

  // Manual job-detect trigger: inject the job-portal content script into the
  // current tab on demand (activeTab). Covers career pages not in the static
  // matches list now that the broad URL wildcards were removed.
  const scanBtn = root.querySelector<HTMLButtonElement>('#scan-page-btn');
  scanBtn?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-job-portal.js'],
      });
      window.close(); // close popup so the injected widget is visible
    } catch {
      /* restricted page (chrome://, Web Store, etc.) — injection not allowed */
    }
  });

  // Application prefill (fill-only). Injects the prefill engine into the current
  // tab via activeTab; it detects the application form generically (any ATS),
  // fills the identity fields, and never submits. Works on any http(s) page —
  // the engine toasts if it can't find a fillable form.
  const prefillBtn = root.querySelector<HTMLButtonElement>('#prefill-easy-apply-btn');
  const prefillLabel = prefillBtn?.querySelector<HTMLElement>('.at');
  const prefillLabelText = prefillLabel?.textContent || 'Prefill this application';
  prefillBtn?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url ?? '';
    if (!tab?.id || !/^https?:\/\//i.test(url)) {
      if (prefillLabel) showTransientLabel(prefillLabel, 'Open a job application page first', prefillLabelText);
      return;
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: [
          autofillPreferences.guidedAutopilot
            ? 'content-job-portal.js'
            : 'easy-apply-fill.js',
        ],
      });
      window.close();
    } catch {
      if (prefillLabel) showTransientLabel(prefillLabel, 'Cannot prefill on this page', prefillLabelText);
    }
  });

  const stepModeBtn = root.querySelector<HTMLButtonElement>('#prefill-mode-step');
  const continuousModeBtn = root.querySelector<HTMLButtonElement>('#prefill-mode-continuous');
  const skillsToggle = root.querySelector<HTMLInputElement>('#autofill-skills-toggle');
  const guidedToggle = root.querySelector<HTMLInputElement>('#guided-autopilot-toggle');
  const skillsToggleLabel = root.querySelector<HTMLElement>(
    '.prefill-skills-toggle'
  );
  const modeNote = root.querySelector<HTMLElement>('#prefill-mode-note');

  if (!AUTOFILL_FEATURE_FLAGS.continuousMode && continuousModeBtn) {
    continuousModeBtn.hidden = true;
    continuousModeBtn.disabled = true;
  }
  if (!AUTOFILL_FEATURE_FLAGS.skills) {
    if (skillsToggle) {
      skillsToggle.checked = false;
      skillsToggle.disabled = true;
    }
    if (skillsToggleLabel) skillsToggleLabel.hidden = true;
  }
  if (!AUTOFILL_FEATURE_FLAGS.guidedAutopilot && guidedToggle) {
    guidedToggle.checked = false;
    guidedToggle.disabled = true;
    guidedToggle.closest('label')!.hidden = true;
  }

  const paintAutofillPreferences = () => {
    const continuous = autofillPreferences.mode === 'continuous';
    stepModeBtn?.setAttribute('aria-pressed', String(!continuous));
    continuousModeBtn?.setAttribute('aria-pressed', String(continuous));
    if (skillsToggle) skillsToggle.checked = autofillPreferences.autofillSkills;
    if (guidedToggle) guidedToggle.checked = autofillPreferences.guidedAutopilot;
    if (modeNote) {
      modeNote.textContent = autofillPreferences.guidedAutopilot
        ? 'Guided Autopilot fills and advances safe steps. It stops before Review/Submit; press Escape to stop anytime.'
        : continuous
        ? 'Fills each new step as it loads. You control all navigation.'
        : 'You click Prefill on each application page or step.';
    }
  };

  const saveAutofillPreferences = async (next: AutofillPreferences) => {
    autofillPreferences = normalizeAutofillPreferences(next);
    paintAutofillPreferences();
    await chrome.storage.sync.set({
      [AUTOFILL_PREFERENCES_KEY]: autofillPreferences,
    });
  };

  stepModeBtn?.addEventListener('click', () => {
    void saveAutofillPreferences({
      ...autofillPreferences,
      mode: 'step_by_step',
      guidedAutopilot: false,
    });
  });
  continuousModeBtn?.addEventListener('click', () => {
    if (!AUTOFILL_FEATURE_FLAGS.continuousMode) return;
    void saveAutofillPreferences({ ...autofillPreferences, mode: 'continuous' });
  });
  guidedToggle?.addEventListener('change', () => {
    if (!AUTOFILL_FEATURE_FLAGS.guidedAutopilot) return;
    void saveAutofillPreferences({
      ...autofillPreferences,
      mode: guidedToggle.checked ? 'continuous' : autofillPreferences.mode,
      guidedAutopilot: guidedToggle.checked,
    });
  });
  skillsToggle?.addEventListener('change', () => {
    if (!AUTOFILL_FEATURE_FLAGS.skills) return;
    void saveAutofillPreferences({
      ...autofillPreferences,
      autofillSkills: skillsToggle.checked,
    });
  });
  paintAutofillPreferences();

  // Theme button - toggle between light and dark mode
  const themeBtn = root.querySelector('.theme-btn');
  const themeIcon = root.querySelector('#theme-icon');

  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIcon) {
    themeIcon.innerHTML = themeToggleIcon(theme === 'dark', 16);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');

      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIcon) themeIcon.innerHTML = themeToggleIcon(false, 16);
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIcon) themeIcon.innerHTML = themeToggleIcon(true, 16);
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to sign out?')) return;
      (logoutBtn as HTMLButtonElement).disabled = true;
      try {
        await new Promise<void>((resolve) => {
          chrome.runtime.sendMessage({ type: 'EXTENSION_SIGN_OUT' }, (res?: { ok?: boolean }) => {
            if (chrome.runtime.lastError || res?.ok === false) {
              void performExtensionSignOut().finally(() => resolve());
              return;
            }
            resolve();
          });
        });
      } catch {
        await performExtensionSignOut();
      } finally {
        window.location.reload();
      }
    });
  }
}
