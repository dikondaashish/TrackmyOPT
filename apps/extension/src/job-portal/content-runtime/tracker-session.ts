import { requestJobContextSession } from '../../job/job-context-session';
import { buildJobSaveSnapshot } from '../../job/job-save-snapshot';
import { jobMemoryKey, recordSeenJob } from '../../prefill/smart-flow';
import { JobInfo, getJobInfo } from '../../job/job-posting-scrape';
import { scrapeJobDescription } from '../../job/job-description-scrape';
import { isApplicationSuccessPage } from '../job-portal-application-success';
import { showMessage } from '../job-portal-widget-ui';
/** Per-session tracker bookkeeping: saved application ids, post-save suggestion memory, and auto-add on success pages. */

/** Tracker application ids for jobs saved (or already saved) this session. */
const trackerApplicationIdByJobKey = new Map<string, string>();

export function rememberTrackerApplicationId(job: JobInfo, applicationId?: string): void {
  const id = applicationId?.trim();
  if (!id) return;
  trackerApplicationIdByJobKey.set(
    jobMemoryKey({
      jobUrl: job.job_url || window.location.href,
      companyName: job.company_name || '',
      roleTitle: job.role_title || '',
    }),
    id,
  );
}

export function trackerApplicationIdFor(job: JobInfo): string | undefined {
  return trackerApplicationIdByJobKey.get(
    jobMemoryKey({
      jobUrl: job.job_url || window.location.href,
      companyName: job.company_name || '',
      roleTitle: job.role_title || '',
    }),
  );
}

const POST_SAVE_SUGGESTION_SEEN_KEY = 'tmo_post_save_suggestions_seen_v1';

export async function markPostSaveSuggestionSeen(job: JobInfo): Promise<boolean> {
  try {
    const key = jobMemoryKey({
      jobUrl: job.job_url,
      companyName: job.company_name,
      roleTitle: job.role_title,
    });
    const stored = await chrome.storage.local.get(POST_SAVE_SUGGESTION_SEEN_KEY);
    const next = recordSeenJob(stored[POST_SAVE_SUGGESTION_SEEN_KEY], key, 100);
    if (next.alreadySeen) return false;
    await chrome.storage.local.set({ [POST_SAVE_SUGGESTION_SEEN_KEY]: next.keys });
    return true;
  } catch {
    // Storage failure should not repeatedly nag the user in the same page.
    return false;
  }
}

const AUTO_ADD_DEBOUNCE_MS = 15000; // don't auto-add same job twice within 15 min
const JOB_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000; // use stored context up to 30 min old

export function saveJobContext(job: JobInfo) {
  void requestJobContextSession('save', buildJobSaveSnapshot(job, scrapeJobDescription()));
}

export function tryAutoAddOnSuccess() {
  if (!document.body || !isApplicationSuccessPage()) return;
  const fromPage = getJobInfo();
  void requestJobContextSession('read').then((result) => {
    const ctx = result.context as { job: JobInfo; storedAt: number } | undefined;
    const storedJob = ctx?.job && Date.now() - (ctx.storedAt || 0) <= JOB_CONTEXT_MAX_AGE_MS
      ? ctx.job
      : null;
    const jobToAdd = storedJob || fromPage;
    if (!jobToAdd?.role_title || !jobToAdd.company_name) return;
    tryAutoAddWithJob(jobToAdd);
  });
}

export function tryAutoAddWithJob(job: JobInfo) {
  void requestJobContextSession('read').then((result) => {
    const last = result.lastAdded as { job_url: string; at: number } | undefined;
    if (last && last.job_url === job.job_url && Date.now() - last.at < AUTO_ADD_DEBOUNCE_MS) return;

    chrome.runtime.sendMessage(
      {
        type: 'ADD_JOB_TO_TRACKER',
        job: buildJobSaveSnapshot(job, scrapeJobDescription()),
        autoAdd: true,
      },
      (response: { ok?: boolean; error?: string; id?: string; status?: string } | undefined) => {
        if (chrome.runtime.lastError) return;
        if (response?.ok) {
          rememberTrackerApplicationId(job, response.id);
          void requestJobContextSession('added');
          showMessage(response.status === 'Applied' ? 'Application saved as Applied in TrackMyOPT!' : 'Job already saved. Check its status in your tracker.', false);
        }
      }
    );
  });
}
