import { buildJobSaveSnapshot, type JobSaveSnapshotSource } from './job-save-snapshot';

// Session storage is not exposed to content scripts. Relay only job context,
// scoped to the sending top-level tab; never expose the session's resume/token keys.
export async function handleJobContextSession(
  message: { action?: string; job?: JobSaveSnapshotSource },
  sender: chrome.runtime.MessageSender,
) {
  if (sender.frameId !== 0 || sender.tab?.id === undefined || !/^https?:\/\//.test(sender.url ?? '')) {
    return { ok: false };
  }
  const key = `tmo_job_context_tab_${sender.tab.id}`;
  const value = (await chrome.storage.session.get(key))[key] ?? {};
  if (message.action === 'read') return { ok: true, ...value };
  if (message.action === 'save') {
    const job = message.job;
    if (!job || typeof job.company_name !== 'string' || typeof job.role_title !== 'string') return { ok: false };
    const snapshot = buildJobSaveSnapshot({
      company_name: job.company_name.slice(0, 300), role_title: job.role_title.slice(0, 300),
      job_url: typeof job.job_url === 'string' ? job.job_url.slice(0, 2048) : undefined,
      location: typeof job.location === 'string' ? job.location.slice(0, 500) : undefined,
      salary_text: job.salary_text, job_description: job.job_description,
    });
    await chrome.storage.session.set({ [key]: { ...value, context: { job: snapshot, storedAt: Date.now() } } });
    return { ok: true };
  }
  if (message.action === 'added') {
    await chrome.storage.session.set({ [key]: { lastAdded: { job_url: value.context?.job?.job_url, at: Date.now() } } });
    return { ok: true };
  }
  return { ok: false };
}

export async function requestJobContextSession(action: 'read' | 'save' | 'added', job?: JobSaveSnapshotSource) {
  try { return await chrome.runtime.sendMessage({ type: 'JOB_CONTEXT_SESSION', action, job }); }
  catch { return { ok: false }; }
}
