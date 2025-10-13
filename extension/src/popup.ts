import { API_BASE_URL } from './config';

async function init() {
  const state = await chrome.storage.sync.get(['signedIn', 'idToken']);
  const container = document.getElementById('root');

  if (!container) {
    console.error('Root element not found');
    return;
  }

  if (!state.signedIn) {
    container.innerHTML =
      '<button id="signin">Sign in or create account</button>';
    document.getElementById('signin')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'BEGIN_AUTH' });
    });
    return;
  }

  const r = await fetch(`${API_BASE_URL}/api/me`, {
    headers: { Authorization: 'Bearer ' + state.idToken },
  });
  const data = await r.json();

  container.innerHTML = `
    <h3>OPT Hub</h3>
    <p>Signed in.</p>
    <div><strong>Program End Date:</strong> ${data?.status?.program_end_date ?? '-'}</div>
    <div><strong>DSO Recommendation Date:</strong> ${data?.status?.dso_recommendation_date ?? '-'}</div>
    <div><strong>OPT EAD End Date:</strong> ${data?.status?.opt_ead_end_date ?? '-'}</div>
    <div><strong>OPT Start Date:</strong> ${data?.status?.opt_start_date ?? '-'}</div>
    <div><strong>STEM Start Date:</strong> ${data?.status?.stem_start_date ?? '-'}</div>
  `;
}

document.addEventListener('DOMContentLoaded', init);
