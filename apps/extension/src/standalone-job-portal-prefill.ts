import {
  findApprovedJobPortalPasswordField,
  fillJobPortalLogin,
  normalizeDefaultJobPortalLogin,
  normalizeJobPortalHostname,
  type JobPortalLoginCredential,
} from './job-portal-login';

const REVIEW_HOST_ID = 'tmo-job-portal-login-review';

interface CredentialResponse {
  ok?: boolean;
  error?: string;
  credential?: unknown;
}

type RequestCredential = () => Promise<CredentialResponse>;

async function requestCredentialFromBackground(): Promise<CredentialResponse> {
  try {
    const response = (await chrome.runtime.sendMessage({
      type: 'GET_JOB_PORTAL_LOGIN_FOR_TAB',
    })) as CredentialResponse | undefined;
    return response ?? { ok: false, error: 'unavailable' };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}

function button(label: string, primary = false): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.style.cssText = primary
    ? 'min-height:38px;padding:8px 12px;border:0;border-radius:9px;background:#2563eb;color:#fff;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;'
    : 'min-height:38px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#334155;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;';
  return element;
}

export interface StandaloneLoginPrefillOptions {
  root?: Document;
  currentHostname?: string;
  requestCredential?: RequestCredential;
}

/**
 * Popup-injected, standalone login entry. The secret is requested only after
 * Review, filled only after a second explicit click, and never submitted.
 */
export function runStandaloneJobPortalLoginPrefill(
  options: StandaloneLoginPrefillOptions = {}
): 'shown' | 'not_applicable' {
  const root = options.root ?? document;
  const currentHostname =
    normalizeJobPortalHostname(
      options.currentHostname ?? root.location?.hostname ?? ''
    ) ?? null;
  const approvedPasswordField = findApprovedJobPortalPasswordField(root);
  if (
    !currentHostname ||
    root.getElementById(REVIEW_HOST_ID) ||
    !approvedPasswordField
  ) {
    return 'not_applicable';
  }

  const requestCredential =
    options.requestCredential ?? requestCredentialFromBackground;
  const host = root.createElement('div');
  host.id = REVIEW_HOST_ID;
  host.style.cssText =
    'all:initial;position:fixed;right:24px;bottom:24px;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });
  const panel = root.createElement('section');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'TrackMyOPT login prefill review');
  panel.style.cssText =
    'box-sizing:border-box;width:min(360px,calc(100vw - 32px));padding:16px;border:1px solid #bfdbfe;border-radius:14px;background:#fff;color:#0f172a;box-shadow:0 20px 50px rgba(15,23,42,.24);font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
  const title = root.createElement('strong');
  title.textContent = 'Review saved login';
  title.style.cssText = 'display:block;font-size:16px;margin-bottom:5px;';
  const note = root.createElement('p');
  note.textContent =
    `TrackMyOPT can offer your shared default job-portal login on ${currentHostname}. Review it before filling. TrackMyOPT never clicks Login, Continue, Next, Create Account, or Submit.`;
  note.style.cssText = 'margin:0 0 12px;color:#475569;';
  const status = root.createElement('p');
  status.setAttribute('role', 'status');
  status.style.cssText =
    'display:none;margin:0 0 12px;padding:9px;border-radius:8px;background:#f1f5f9;color:#334155;overflow-wrap:anywhere;';
  const actions = root.createElement('div');
  actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
  const cancel = button('Not now');
  const review = button('Review saved login', true);
  actions.append(cancel, review);
  panel.append(title, note, status, actions);
  shadow.append(panel);
  const employerDialog = approvedPasswordField.closest<HTMLElement>(
    '[role="dialog"],dialog,[aria-modal="true"]'
  );
  (employerDialog ?? root.body).append(host);

  let reviewedCredential: JobPortalLoginCredential | null = null;
  cancel.addEventListener('click', () => {
    reviewedCredential = null;
    host.remove();
  });
  review.addEventListener('click', async () => {
    if (reviewedCredential) {
      const result = fillJobPortalLogin(
        root,
        reviewedCredential,
        currentHostname
      );
      reviewedCredential = null;
      review.disabled = true;
      review.textContent = 'Filled';
      status.textContent =
        result.totalFilled > 0
          ? `Filled ${result.totalFilled} empty login field${result.totalFilled === 1 ? '' : 's'}. Nothing was submitted.`
          : 'No safe empty login fields were found. Nothing was changed.';
      return;
    }
    review.disabled = true;
    review.textContent = 'Loading…';
    const response = await requestCredential();
    reviewedCredential = normalizeDefaultJobPortalLogin(
      response?.credential
    );
    if (!response?.ok || !reviewedCredential) {
      reviewedCredential = null;
      status.style.display = 'block';
      status.textContent =
        response?.error === 'not_signed_in'
          ? 'Sign in to TrackMyOPT, then try again.'
          : 'No default job-portal login is saved. Add one in TrackMyOPT.';
      review.textContent = 'Try again';
      review.disabled = false;
      return;
    }

    status.style.display = 'block';
    status.textContent =
      `${reviewedCredential.email}\nPassword: ••••••••`;
    review.textContent = 'Fill login fields';
    review.disabled = false;
  });

  return 'shown';
}
