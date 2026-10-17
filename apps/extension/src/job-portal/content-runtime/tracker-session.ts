import { requestJobContextSession } from '../../job/job-context-session';
import { buildJobSaveSnapshot } from '../../job/job-save-snapshot';
import { jobMemoryKey, recordSeenJob } from '../../prefill/smart-flow';
import { JobInfo } from '../../job/job-posting-scrape';
import { scrapeJobDescription } from '../../job/job-description-scrape';
/** Per-session tracker bookkeeping: saved application ids and post-save suggestion memory.
 * Application-success tracking lives in submission-session.ts. */

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

export function saveJobContext(job: JobInfo) {
  void requestJobContextSession('save', buildJobSaveSnapshot(job, scrapeJobDescription()));
}
