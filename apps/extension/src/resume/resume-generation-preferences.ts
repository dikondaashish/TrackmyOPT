const ALIGN_JOB_TITLES_KEY = 'tmo_align_job_titles_v1';

/** User preference for career-ladder job title rewriting. Default off. */
export async function getAlignJobTitlesPreference(): Promise<boolean> {
  try {
    const stored = await chrome.storage.local.get(ALIGN_JOB_TITLES_KEY);
    return stored[ALIGN_JOB_TITLES_KEY] === true;
  } catch {
    return false;
  }
}

export async function setAlignJobTitlesPreference(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [ALIGN_JOB_TITLES_KEY]: enabled });
}
