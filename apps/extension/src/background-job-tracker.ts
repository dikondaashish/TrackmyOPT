import { WEBSITE_URL } from './config';
import { buildJobSaveSnapshot } from './job-save-snapshot';
import type { DuplicateApplicationNotice } from './smart-flow';
import { getExtensionBearerToken } from './background-auth';

export interface CheckJobSavedResult {
  ok: boolean;
  error?: string;
  saved?: boolean;
  id?: string;
  status?: 'Applied' | 'Wishlist';
  savedAt?: string | null;
  duplicateApplication?: DuplicateApplicationNotice;
}

/**
 * Is this posting already in the user's tracker? Used to paint the widget's
 * saved state on load so we don't show "Not saved" for a job already added.
 */
export async function checkJobSaved(input: {
  jobUrl: string;
  companyName: string;
  roleTitle: string;
}): Promise<CheckJobSavedResult> {
  const url = input.jobUrl.trim();
  const companyName = input.companyName.trim();
  const roleTitle = input.roleTitle.trim();
  if (!url && (!companyName || !roleTitle)) return { ok: true, saved: false };
  let bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const endpoint = new URL(`${WEBSITE_URL}/api/extension/job-application`);
  if (url) endpoint.searchParams.set('job_url', url);
  if (companyName) endpoint.searchParams.set('company_name', companyName);
  if (roleTitle) endpoint.searchParams.set('role_title', roleTitle);
  const request = (token: string) =>
    fetch(endpoint.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
  let res = await request(bearer);
  if (res.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      bearer = refreshed;
      res = await request(bearer);
    }
  }
  if (res.status === 401) return { ok: false, error: 'not_signed_in' };
  if (!res.ok) return { ok: false, error: 'lookup_failed' };
  const data = (await res.json()) as {
    saved?: boolean;
    id?: string;
    status?: string;
    saved_at?: string | null;
    duplicate_application?: DuplicateApplicationNotice;
  };
  return {
    ok: true,
    saved: !!data.saved,
    id: typeof data.id === 'string' ? data.id : undefined,
    status: data.status === 'Wishlist' ? 'Wishlist' : data.status === 'Applied' ? 'Applied' : undefined,
    savedAt: data.saved_at ?? null,
    duplicateApplication: data.duplicate_application,
  };
}

export async function handleAddJobToTracker(
  job: {
    company_name: string;
    role_title: string;
    job_url?: string;
    location?: string;
    salary_text?: string;
    job_description?: string;
  },
  autoAdd: boolean = false,
  requestedStatus: 'Wishlist' | 'Applied' = 'Applied',
) {
  // Application-success auto-adds are always Applied. Manual saves preserve
  // the status explicitly selected in the side-panel dialog.
  const status: 'Wishlist' | 'Applied' = autoAdd ? 'Applied' : requestedStatus;
  const snapshot = buildJobSaveSnapshot(job);
  let token = await getExtensionBearerToken();
  if (!token) {
    const err = new Error('Sign in to TrackMyOPT in the extension to add jobs.');
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'TrackMyOPT',
        message: err.message,
      });
    }
    throw err;
  }

  const postJob = (bearer: string) =>
    fetch(`${WEBSITE_URL}/api/extension/job-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({
        company_name: snapshot.company_name,
        role_title: snapshot.role_title,
        job_url: snapshot.job_url || null,
        location: snapshot.location || null,
        salary_text: snapshot.salary_text || null,
        job_description: snapshot.job_description || null,
        status,
      }),
    });

  let res = await postJob(token);
  if (res.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      res = await postJob(refreshed);
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error || 'Failed to add job to tracker';
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'TrackMyOPT',
        message: msg,
      });
    }
    throw new Error(msg);
  }
  if (chrome.notifications) {
    const message = autoAdd
      ? `Application auto-added: "${job.role_title}" at ${job.company_name}`
      : `"${job.role_title}" at ${job.company_name} added to Job Tracker!`;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'TrackMyOPT',
      message,
    });
  }
  return {
    ok: true,
    id: typeof (data as { id?: string }).id === 'string' ? (data as { id: string }).id : undefined,
    status,
  };
}
