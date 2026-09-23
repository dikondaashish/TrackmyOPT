/** Popup-only bridge. The small review entry never starts prefill or auto-add. */
export async function requestJobReview(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) {
    throw new Error('Open a job posting in a website tab first.');
  }
  const message = { type: 'TMO_REVIEW_JOB_FOR_TRACKER' };
  const request = () => chrome.tabs.sendMessage(tab.id!, message, { frameId: 0 });
  let result;
  try { result = await request(); } catch { /* The review entry is not installed yet. */ }
  if (!result) {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['job-tracker-review-entry.js'] });
      result = await request();
    } catch {
      throw new Error('Cannot scan this page. Open a job posting or refresh the tab and try again.');
    }
  }
  if (!result?.ok) throw new Error(result?.error || 'Could not detect this job. Refresh the tab and try again.');
}
