/**
 * MAIN-world entry, declared in manifest.json for Workday hosts only. It has
 * no chrome.* access and stays inert until the isolated content script arms
 * it after a trusted Submit activation (and only while remote config keeps
 * the workday_network detector on).
 */
import { installSubmissionMonitor } from './page-monitor';
import {
  SUBMIT_LABEL_RE,
  WORKDAY_SUBMIT_SELECTOR,
  classifyWorkdayFinalizeResponse,
  matchWorkdayFinalizeRequest,
} from './workday-submission-rules';

installSubmissionMonitor(window, {
  detector: 'workday_network',
  isSubmitControl: element =>
    element.matches(WORKDAY_SUBMIT_SELECTOR) &&
    SUBMIT_LABEL_RE.test((element.textContent || '').replace(/\s+/g, ' ').trim()),
  matchRequest: matchWorkdayFinalizeRequest,
  classify: classifyWorkdayFinalizeResponse,
});
