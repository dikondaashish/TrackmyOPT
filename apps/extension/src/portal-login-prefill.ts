import {
  fillJobPortalLogin,
  findApprovedJobPortalPasswordField,
  normalizeDefaultJobPortalLogin,
  normalizeJobPortalHostname,
} from './job-portal-login';

export type PortalLoginPrefillResult = {
  status: 'filled' | 'skipped' | 'empty' | 'unavailable' | 'stopped';
  totalFilled: number;
};
type CredentialResponse = { ok?: boolean; credential?: unknown };
const running = new WeakSet<Document>();
const ATS_HOSTS = ['myworkdayjobs.com', 'myworkdaysite.com', 'greenhouse.io',
  'ashbyhq.com', 'lever.co', 'icims.com', 'smartrecruiters.com', 'taleo.net',
  'successfactors.com', 'successfactors.eu', 'workable.com', 'bamboohr.com',
  'applytojob.com', 'ultipro.com', 'paylocity.com', 'jobvite.com'];

/** A user click is required by the caller. Never run on page load/Continuous.
 * Credentials are fetched separately from answer payloads and never relayed.
 */
export async function prefillSavedPortalLogin(options: {
  root?: Document;
  shouldContinue?: () => boolean;
  requestCredential?: () => Promise<CredentialResponse>;
} = {}): Promise<PortalLoginPrefillResult> {
  const root = options.root ?? document;
  const result = (status: PortalLoginPrefillResult['status'], totalFilled = 0) => ({ status, totalFilled });
  const view = root.defaultView;
  if (!view || view.top !== view.self || running.has(root)) return result('skipped');
  const pageUrl = root.location.href;
  const url = new URL(pageUrl);
  const hostname = normalizeJobPortalHostname(pageUrl);
  if (url.protocol !== 'https:' || !hostname) return result('skipped');
  const knownAts = ATS_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`));
  const jobPath = /(?:^|[./_-])(?:careers?|jobs?|apply|applicant|candidate|recruitment)(?:[./_-]|$)/i.test(`${hostname}${url.pathname}`);
  const heading = Array.from(root.querySelectorAll('h1,h2,[role="heading"]'))
    .filter(el => !el.closest('[id^="tmo-"],[class*="tmo-"]'))
    .map(el => el.textContent ?? '').join(' ');
  if (!knownAts && !jobPath && !/\b(?:candidate|applicant|job application|careers|apply for)\b/i.test(heading)) return result('skipped');
  const field = findApprovedJobPortalPasswordField(root);
  if (!field) return result('skipped');
  const form = field.form;
  const action = form?.action;
  if (form?.hasAttribute('action') && new URL(form.action, pageUrl).origin !== url.origin) return result('skipped');
  let stopped = false;
  const stop = (event: KeyboardEvent) => { if (event.key === 'Escape') stopped = true; };
  const allowed = () => !stopped && root.location.href === pageUrl && field.isConnected &&
    field.form === form && form?.action === action &&
    (options.shouldContinue?.() ?? true);
  if (!allowed()) return result('stopped');
  running.add(root);
  root.addEventListener('keydown', stop, true);
  const showStatus = (status: PortalLoginPrefillResult['status']) => {
    if (!allowed()) return;
    let note = root.getElementById('tmo-portal-login-status');
    if (!note) {
      note = root.createElement('p');
      note.id = 'tmo-portal-login-status';
      note.setAttribute('role', 'status');
      note.style.cssText = 'font:13px/1.5 system-ui;margin:12px 0;padding:10px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#1e3a8a;';
      (form ?? field.parentElement ?? root.body).append(note);
    }
    note.textContent = status === 'filled' ? 'TrackMyOPT filled your saved portal login. Review it, then continue yourself. Nothing was submitted.'
      : status === 'empty' ? 'No portal login saved. Add it in your TrackMyOPT application profile, then click Prefill again.'
      : status === 'unavailable' ? 'Your portal login could not load. Sign in to TrackMyOPT and click Prefill to retry.'
      : 'No login values changed. Check existing entries and complete any remaining fields yourself.';
  };
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const response: CredentialResponse | undefined = await Promise.race([
      (options.requestCredential ?? (() => chrome.runtime.sendMessage({ type: 'GET_JOB_PORTAL_LOGIN_FOR_TAB' }) as Promise<CredentialResponse>))(),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('timeout')), 10000); }),
    ]);
    if (!allowed()) return result('stopped');
    if (!response?.ok) { showStatus('unavailable'); return result('unavailable'); }
    const credential = normalizeDefaultJobPortalLogin(response.credential);
    if (!credential) { showStatus('empty'); return result('empty'); }
    const filled = fillJobPortalLogin(form ?? field.getRootNode() as ParentNode, credential, hostname, allowed);
    const status = filled.totalFilled ? 'filled' : 'skipped';
    showStatus(status);
    return result(status, filled.totalFilled);
  } catch {
    showStatus('unavailable');
    return result(allowed() ? 'unavailable' : 'stopped');
  } finally {
    clearTimeout(timeout);
    running.delete(root);
    root.removeEventListener('keydown', stop, true);
  }
}
