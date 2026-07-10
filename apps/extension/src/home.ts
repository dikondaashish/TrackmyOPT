import { API_ENDPOINTS } from './config';
import { performExtensionSignOut } from './signOut';
import { icon, themeToggleIcon } from './icons';
import { getIdToken } from './token-store';

/** Escape untrusted values before interpolating them into innerHTML. */
function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );
}

/**
 * Renders the signed-in home screen with tool tiles
 */
export async function renderHome(root: HTMLElement, onNavigate: (page: string) => void): Promise<void> {
  // Fetch premium status to show badge
  let planBadge = '';
  let caseStatusCard = '';
  try {
    const res = await fetch(API_ENDPOINTS.STATUS, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.isPremium && data.planName) {
        const plan = String(data.planName).toUpperCase();
        const badgeClass = plan === 'DEDICATED' ? 'badge-dedicated' : 'badge-pro';
        planBadge = `<span class="plan-badge ${badgeClass}">${escapeHtml(plan)}</span>`;
      }
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
    <style>
      .plan-badge {
        font-size: 8px;
        font-weight: 800;
        padding: 1.5px 4px;
        border-radius: 3px;
        margin-left: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        vertical-align: middle;
        display: inline-block;
        line-height: 1;
      }
      .badge-pro {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
      }
      .badge-dedicated {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);
      }
      .header-title-container {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
      }
      .case-status-card {
        display: block;
        margin: 0 0 12px 0;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(16, 185, 129, 0.35);
        background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.12) 100%);
        text-decoration: none;
        color: inherit;
      }
      .case-status-card:hover {
        border-color: rgba(16, 185, 129, 0.55);
      }
      .case-status-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }
      .case-status-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #059669;
      }
      .case-more {
        font-size: 10px;
        font-weight: 700;
        color: #047857;
        background: rgba(16,185,129,0.15);
        padding: 2px 6px;
        border-radius: 999px;
      }
      .case-status-receipt {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
        font-weight: 700;
        margin: 0 0 4px 0;
      }
      .case-status-text {
        font-size: 12px;
        line-height: 1.35;
        margin: 0;
        opacity: 0.85;
      }
    </style>
    <div class="header" role="region" aria-label="TrackMyOPT header">
      <div class="logo-icon">
        <img src="icons/logo.gif" alt="TrackMyOPT" />
      </div>
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon">${icon('moon', 18)}</span>
        </button>
        <button class="logout-btn" id="logout-btn" title="Sign out" aria-label="Sign out">
          <span>→</span>
        </button>
      </div>
      <div class="header-title-container">
        <h1 class="title" style="margin-bottom: 0;">TrackMyOPT</h1>
        ${planBadge}
      </div>
      <p class="subtitle">Your complete toolkit for managing OPT requirements</p>
    </div>

    <div class="banner" aria-live="polite">
      Select a tool below to get started with your OPT journey
    </div>

    ${caseStatusCard}

    <div class="grid" role="list">
      <div class="tile blue" role="button" tabindex="0" aria-label="OPT Apply Start Dates - Calculate when you can start applying for OPT" data-page="opt-apply">
        <div class="icon">${icon('calendar')}</div>
        <h3 class="t">OPT Apply Dates</h3>
        <p class="s">Calculate when you can apply for OPT</p>
      </div>

      <div class="tile purple" role="button" tabindex="0" aria-label="OPT Clock Tracker - Track your OPT unemployment days in real-time" data-page="clock">
        <div class="icon">${icon('clock')}</div>
        <h3 class="t">OPT Clock Tracker</h3>
        <p class="s">Track your unemployment days</p>
      </div>

      <div class="tile green" role="button" tabindex="0" aria-label="STEM OPT Apply Start Dates - Calculate STEM OPT extension application dates" data-page="stem-apply">
        <div class="icon">${icon('graduationCap')}</div>
        <h3 class="t">STEM Apply Dates</h3>
        <p class="s">Calculate STEM OPT dates</p>
      </div>

      <div class="tile orange" role="button" tabindex="0" aria-label="STEM OPT Clock Tracker - Track your STEM OPT unemployment days" data-page="stem-clock">
        <div class="icon">${icon('timer')}</div>
        <h3 class="t">STEM Clock Tracker</h3>
        <p class="s">Track STEM unemployment</p>
      </div>
    </div>

    <button id="scan-page-btn" type="button" title="Detect a job posting on the current tab and add it to your tracker" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 12px 0;padding:11px 14px;border-radius:12px;border:1px solid rgba(59,130,246,0.35);background:rgba(59,130,246,0.08);color:inherit;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">
      ${icon('fileText', 16)} Add a job from this page
    </button>

    <button id="prefill-easy-apply-btn" type="button" title="Prefill the open application form (LinkedIn Easy Apply or Greenhouse) — you review and submit" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 12px 0;padding:11px 14px;border-radius:12px;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.08);color:inherit;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">
      ${icon('checkCircle', 16)} Prefill this application
    </button>

    <div class="notice">
      <div class="dot">${icon('shield', 18)}</div>
      <div>
        <div style="font-weight:800; margin-bottom: 4px;">Stay Compliant</div>
        <div>All tools are designed to help you track and manage your OPT requirements. Always consult with your DSO for official guidance.</div>
      </div>
    </div>

    <div class="footer">
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/privacy">Privacy</a> ·
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/terms">Terms</a>
    </div>
  `;

  // Hook up tile navigation
  const tiles = root.querySelectorAll<HTMLElement>('.tile');
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

  // Application prefill (fill-only). Injects the prefill script into the current
  // tab via activeTab on a supported ATS host; it fills the open form's identity
  // fields and never submits. Supported: LinkedIn, Greenhouse.
  const SUPPORTED_PREFILL_HOST = /(^|\.)(linkedin\.com|greenhouse\.io)$/;
  const prefillBtn = root.querySelector<HTMLButtonElement>('#prefill-easy-apply-btn');
  prefillBtn?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let host = '';
    try {
      host = new URL(tab?.url ?? '').hostname;
    } catch {
      /* no URL */
    }
    if (!tab?.id || !SUPPORTED_PREFILL_HOST.test(host)) {
      prefillBtn.textContent = 'Open a LinkedIn or Greenhouse application page';
      return;
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['easy-apply-fill.js'],
      });
      window.close();
    } catch {
      prefillBtn.textContent = 'Cannot prefill on this page';
    }
  });

  // Theme button - toggle between light and dark mode
  const themeBtn = root.querySelector('.theme-btn');
  const themeIcon = root.querySelector('#theme-icon');

  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIcon) {
    themeIcon.innerHTML = themeToggleIcon(theme === 'dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');

      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIcon) themeIcon.innerHTML = themeToggleIcon(false);
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIcon) themeIcon.innerHTML = themeToggleIcon(true);
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

