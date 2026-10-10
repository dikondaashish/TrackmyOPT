/**
 * Per-site and per-session widget preferences kept in localStorage /
 * sessionStorage: hide rules, collapsed state, default view, dismissed URL and
 * drag position.
 */


const WIDGET_DISMISSED_URL_KEY = 'tmo_job_widget_dismissed_url';

const WIDGET_POS_KEY = 'tmo_job_widget_pos';

const WIDGET_COLLAPSED_KEY = 'tmo_job_widget_collapsed';

const WIDGET_HIDE_KEY = 'tmo_widget_hidden';

const WIDGET_HIDE_SESSION_KEY = 'tmo_job_widget_hide_session';

type WidgetHideConfig = { all?: boolean; domains?: string[] };

export function currentSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

async function getHideConfig(): Promise<WidgetHideConfig> {
  try {
    const s = await chrome.storage.local.get(WIDGET_HIDE_KEY);
    return (s[WIDGET_HIDE_KEY] as WidgetHideConfig) || {};
  } catch {
    return {};
  }
}

export async function isWidgetSuppressed(): Promise<boolean> {
  try {
    if (sessionStorage.getItem(WIDGET_HIDE_SESSION_KEY) === '1') return true;
  } catch {
    /* ignore */
  }
  const cfg = await getHideConfig();
  if (cfg.all) return true;
  if (Array.isArray(cfg.domains) && cfg.domains.includes(location.hostname)) return true;
  return false;
}

export function hideForThisVisit() {
  try {
    sessionStorage.setItem(WIDGET_HIDE_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export async function hideForThisSite() {
  const cfg = await getHideConfig();
  const domains = new Set(cfg.domains || []);
  domains.add(location.hostname);
  try {
    await chrome.storage.local.set({ [WIDGET_HIDE_KEY]: { ...cfg, domains: [...domains] } });
  } catch {
    /* ignore */
  }
}

export async function hideForAllSites() {
  const cfg = await getHideConfig();
  try {
    await chrome.storage.local.set({ [WIDGET_HIDE_KEY]: { ...cfg, all: true } });
  } catch {
    /* ignore */
  }
}

export function readSessionCollapsedOverride(): boolean | null {
  try {
    const v = sessionStorage.getItem(WIDGET_COLLAPSED_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
    return null;
  } catch {
    return null;
  }
}

export function setCollapsedPref(collapsed: boolean) {
  try {
    sessionStorage.setItem(WIDGET_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function clearSessionCollapsedOverride() {
  try {
    sessionStorage.removeItem(WIDGET_COLLAPSED_KEY);
  } catch {
    /* ignore */
  }
}

export type DefaultView = 'expanded' | 'minimized';

const WIDGET_DEFAULT_VIEW_KEY = 'tmo_widget_default_view';

export async function getDefaultViewPref(): Promise<DefaultView> {
  try {
    const s = await chrome.storage.local.get(WIDGET_DEFAULT_VIEW_KEY);
    return s[WIDGET_DEFAULT_VIEW_KEY] === 'minimized' ? 'minimized' : 'expanded';
  } catch {
    return 'expanded';
  }
}

export async function setDefaultViewPref(view: DefaultView): Promise<void> {
  try {
    await chrome.storage.local.set({ [WIDGET_DEFAULT_VIEW_KEY]: view });
  } catch {
    /* ignore */
  }
}

export function readWidgetDismissedUrl(): string | null {
  try {
    return sessionStorage.getItem(WIDGET_DISMISSED_URL_KEY);
  } catch {
    return null;
  }
}

function setWidgetDismissedUrl(url: string) {
  try {
    sessionStorage.setItem(WIDGET_DISMISSED_URL_KEY, url);
  } catch {
    /* ignore */
  }
}

export function clearWidgetDismissedUrl() {
  try {
    sessionStorage.removeItem(WIDGET_DISMISSED_URL_KEY);
  } catch {
    /* ignore */
  }
}

export function readWidgetPosition(): { top: number } | null {
  try {
    const raw = sessionStorage.getItem(WIDGET_POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { top?: number };
    if (typeof p.top !== 'number') return null;
    return { top: p.top };
  } catch {
    return null;
  }
}

export function saveWidgetPosition(top: number) {
  try {
    sessionStorage.setItem(WIDGET_POS_KEY, JSON.stringify({ top }));
  } catch {
    /* ignore */
  }
}
