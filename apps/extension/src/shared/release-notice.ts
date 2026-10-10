import { EXTENSION_RELEASE_KEY, RELEASE_NOTES, normalizeReleaseState, type ExtensionReleaseState } from './extension-lifecycle';
export async function showReleaseNotice(): Promise<void> {
  const stored = await chrome.storage.local.get(EXTENSION_RELEASE_KEY);
  const release = normalizeReleaseState(stored[EXTENSION_RELEASE_KEY]);
  if (!release || release.noticeDismissed || release.version !== chrome.runtime.getManifest().version || document.getElementById('tmo-release-notice')) return;
  const notice = document.createElement('aside');
  notice.id = 'tmo-release-notice';
  notice.setAttribute('aria-label', 'Extension update');
  notice.style.cssText = 'margin:12px;padding:12px;border:1px solid #94a3b8;border-radius:10px;font:12px/1.5 system-ui;';
  const title = document.createElement('strong');
  title.textContent = `Updated to ${release.version}`;
  const details = document.createElement('p');
  details.textContent = RELEASE_NOTES.join(' ');
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = 'Dismiss';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      // Do not dismiss a newer release that arrived while this popup was open.
      const latest = (await chrome.storage.local.get(EXTENSION_RELEASE_KEY))[EXTENSION_RELEASE_KEY] as ExtensionReleaseState | undefined;
      if (latest?.version === release.version) await chrome.storage.local.set({ [EXTENSION_RELEASE_KEY]: { ...latest, noticeDismissed: true } });
      notice.remove();
    } catch { button.disabled = false; button.textContent = 'Retry dismiss'; }
  });
  notice.append(title, details, button);
  document.body.append(notice);
}
