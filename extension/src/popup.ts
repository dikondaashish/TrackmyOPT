async function init(){
  const s = await chrome.storage.sync.get(['signedIn','idToken']);
  const root = document.getElementById('root')!;
  if (!s.signedIn) {
    root.innerHTML = '<button id="signin">Sign in or create account</button>';
    document.getElementById('signin')!.addEventListener('click', ()=> chrome.runtime.sendMessage({type:'BEGIN_AUTH'}));
    return;
  }
  const r = await fetch('http://localhost:3000/api/me', { headers: { Authorization: 'Bearer ' + s.idToken }});
  const data = await r.json();
  root.innerHTML = `
    <h3>OPT Hub</h3>
    <p>Signed in.</p>
    <div><b>Program End:</b> ${data?.status?.program_end_date ?? '-'}</div>
    <div><b>DSO Rec:</b> ${data?.status?.dso_recommendation_date ?? '-'}</div>
    <div><b>OPT EAD End:</b> ${data?.status?.opt_ead_end_date ?? '-'}</div>
    <div><b>OPT Start:</b> ${data?.status?.opt_start_date ?? '-'}</div>
    <div><b>STEM Start:</b> ${data?.status?.stem_start_date ?? '-'}</div>
  `;
}
document.addEventListener('DOMContentLoaded', init);
