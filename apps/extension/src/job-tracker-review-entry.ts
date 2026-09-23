import { reviewJobForTracker } from './job-tracker-review';

declare global { interface Window { __tmoTrackerReviewReady?: boolean } }

// Repeated popup clicks must not register duplicate listeners or start the
// full assistant runtime (which includes automatic application detection).
if (window.top === window.self && !window.__tmoTrackerReviewReady) {
  window.__tmoTrackerReviewReady = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'TMO_REVIEW_JOB_FOR_TRACKER') return false;
    void reviewJobForTracker().then(sendResponse).catch(() => sendResponse({ ok: false, error: 'Could not detect this job. Refresh the tab and try again.' }));
    return true;
  });
}
