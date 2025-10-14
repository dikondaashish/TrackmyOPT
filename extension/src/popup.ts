async function init(){
  const s = await chrome.storage.sync.get(['signedIn','idToken']);
  const root = document.getElementById('root')!;
  
  if (!s.signedIn) {
    root.innerHTML = `
      <div style="text-align:center; padding:20px">
        <h2 style="margin:0 0 16px 0; font-size:20px; color:#1f2937">OPT Hub</h2>
        <button id="signin" style="width:100%; padding:12px 24px; background:#2563eb; color:white; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer">
          Sign in or create account
        </button>
      </div>
    `;
    document.getElementById('signin')!.addEventListener('click', ()=> chrome.runtime.sendMessage({type:'BEGIN_AUTH'}));
    return;
  }
  
  showLoading(root);
  
  try {
    const r = await fetch('http://localhost:3000/api/me', { 
      headers: { Authorization: 'Bearer ' + s.idToken }
    });
    
    if (!r.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await r.json();
    renderData(root, data);
  } catch (error) {
    showError(root, error);
  }
}

function showLoading(root: HTMLElement) {
  root.innerHTML = `
    <div style="padding:20px; text-align:center">
      <p style="color:#6b7280">Loading...</p>
    </div>
  `;
}

function showError(root: HTMLElement, error: any) {
  root.innerHTML = `
    <div style="padding:20px">
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px; margin-bottom:12px">
        <p style="margin:0; color:#991b1b; font-size:14px">⚠️ ${error.message || 'Failed to load data'}</p>
      </div>
      <button id="refresh" style="width:100%; padding:10px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer">
        Refresh
      </button>
    </div>
  `;
  document.getElementById('refresh')!.addEventListener('click', () => init());
}

function renderData(root: HTMLElement, data: any) {
  const status = data?.status || {};
  root.innerHTML = `
    <div style="padding:16px; font-family:system-ui, -apple-system, sans-serif">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px">
        <h3 style="margin:0; font-size:20px; font-weight:700; color:#1f2937">OPT Hub</h3>
        <button id="refresh" style="padding:6px 12px; background:#f3f4f6; border:none; border-radius:6px; font-size:13px; font-weight:600; color:#374151; cursor:pointer">
          🔄 Refresh
        </button>
      </div>
      
      <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:12px; padding:16px; margin-bottom:12px">
        <p style="margin:0 0 4px 0; font-size:12px; color:rgba(255,255,255,0.9); font-weight:600">Status</p>
        <p style="margin:0; font-size:14px; color:white; font-weight:500">✅ Signed in</p>
      </div>
      
      <div style="display:grid; gap:8px">
        ${renderDateCard('Program End', status.program_end_date, '#3b82f6')}
        ${renderDateCard('DSO Recommendation', status.dso_recommendation_date, '#8b5cf6')}
        ${renderDateCard('OPT EAD End', status.opt_ead_end_date, '#ec4899')}
        ${renderDateCard('OPT Start', status.opt_start_date, '#10b981')}
        ${renderDateCard('STEM Start', status.stem_start_date, '#f59e0b')}
      </div>
    </div>
  `;
  document.getElementById('refresh')!.addEventListener('click', () => init());
}

function renderDateCard(label: string, date: string | null, color: string): string {
  const displayDate = date || '-';
  return `
    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px">
        <div style="width:3px; height:16px; background:${color}; border-radius:2px"></div>
        <p style="margin:0; font-size:12px; font-weight:600; color:#6b7280">${label}</p>
      </div>
      <p style="margin:0; font-size:14px; font-weight:600; color:#1f2937; padding-left:11px">${displayDate}</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', init);
