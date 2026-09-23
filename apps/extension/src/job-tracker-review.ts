import { getJobInfo, isHttpDocument } from './job-posting-scrape';
import { buildJobSaveSnapshot } from './job-save-snapshot';
import { scrapeJobDescription } from './job-description-scrape';
import { openApplicationStatusDialog } from './job-portal-application-status-dialog';
import { showMessage } from './job-portal-widget-ui';
import { WIDGET_ROOT_ID } from './widget-dom-ids';

let reviewing = false;
let saving = false;

/** Explicit user request only; opening this review never writes an application. */
export async function reviewJobForTracker(): Promise<{ ok: boolean; error?: string }> {
  if (reviewing || saving || document.getElementById('tmo-application-status-dialog')) return { ok: true };
  if (!isHttpDocument()) return { ok: false, error: 'Open a job posting in a website tab first.' };
  const job = getJobInfo();
  if (!job?.role_title || !job.company_name) return { ok: false, error: 'No job posting found. Open a specific job listing and try again.' };
  // Capture before the lookup yields: an SPA can switch postings while it runs.
  const snapshot = buildJobSaveSnapshot(job, scrapeJobDescription());
  reviewing = true;
  try {
    const lookup = await chrome.runtime.sendMessage({ type: 'CHECK_JOB_SAVED', jobUrl: job.job_url, companyName: job.company_name, roleTitle: job.role_title });
    if (!lookup?.ok) return { ok: false, error: lookup?.error === 'not_signed_in' ? 'Sign in to TrackMyOPT again to save jobs.' : 'Could not check your tracker. Please try again.' };
    if (lookup.saved && lookup.status !== 'Wishlist') {
      showMessage('This job is already in your tracker.', false);
      return { ok: true };
    }
    openApplicationStatusDialog(job, status => {
      if (saving) return;
      saving = true;
      showMessage('Saving job…', false);
      void chrome.runtime.sendMessage({ type: 'ADD_JOB_TO_TRACKER', job: snapshot, status })
        .then(response => {
          if (!response?.ok) throw new Error(response?.error || 'Could not save job. Please try again.');
          const actualStatus = response.status || status;
          document.getElementById(WIDGET_ROOT_ID)?.dispatchEvent(new CustomEvent('tmo-tracker-saved', {
            detail: { jobUrl: job.job_url, status: actualStatus, id: response.id },
          }));
          showMessage(actualStatus === 'Wishlist' ? 'Job saved to your Wishlist!' : 'Job saved in your tracker.', false);
        })
        .catch(error => showMessage(error instanceof Error ? error.message : 'Could not save job. Please try again.', true))
        .finally(() => { saving = false; });
    }, lookup.duplicateApplication);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach your tracker. Refresh the tab and try again.' };
  } finally { reviewing = false; }
}
