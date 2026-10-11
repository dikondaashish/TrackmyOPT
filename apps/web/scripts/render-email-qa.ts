/** Offline QA only. No SMTP, database mutations, or campaign delivery. */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getAllEmailPreviews } from '../lib/notifications/email-preview-catalog';
import { getSupabaseAuthTemplates } from '../lib/notifications/supabase-auth-templates';
import { buildDocumentExpiryReminderEmail } from '../lib/notifications/document-expiry-email';
import { buildNotificationPreferencesSavedEmailHtml } from '../lib/notifications/email-service';

async function main() {
  const output = path.resolve(
    process.argv[2] || '/tmp/trackmyopt-email-qa/after'
  );
  await mkdir(output, { recursive: true });
  const long = 'Alexandria'.repeat(20) + ' & <Student>';
  const templates = getAllEmailPreviews();
  const stress = getAllEmailPreviews(long).filter((t) =>
    /welcome|daily_reminder|enrollment_stem|otp/.test(t.id)
  );
  const campaign = (
    await readFile('../../docs/marketing/updates/2026-09-28/email.html', 'utf8')
  )
    .replaceAll('{{firstName}}', 'Alex')
    .replaceAll('{{POSTAL_ADDRESS}}', 'Sample postal address for preview')
    .replaceAll(
      '{{UNSUBSCRIBE_URL}}',
      'https://www.trackmyopt.com/api/notifications/campaign/unsubscribe?token=preview'
    );
  const all = [
    ...templates,
    {
      id: 'product_update_2026_09_28',
      category: 'Marketing',
      subject: 'A quick note from Karthik',
      html: campaign,
    },
    ...stress.map((t) => ({ ...t, id: `stress_${t.id}` })),
    {
      id: 'stress_filename',
      category: 'Stress',
      subject: 'Long filename',
      html: buildDocumentExpiryReminderEmail({
        filename: 'passport'.repeat(40) + '.pdf',
        expiry_date: '2026-10-15',
        document_type: 'passport',
      }),
    },
    {
      id: 'stress_email',
      category: 'Stress',
      subject: 'Long address',
      html: buildNotificationPreferencesSavedEmailHtml(
        'long-address'.repeat(10) + '@example.com',
        long
      ),
    },
  ];
  const modes = ['light', 'dark', 'outlook', 'no_styles', 'images_blocked'];
  for (const t of all) {
    for (const mode of modes) {
      let html = t.html;
      if (mode === 'dark')
        html = html.replaceAll(
          '@media (prefers-color-scheme: dark)',
          '@media all'
        );
      if (mode === 'outlook') html = html.replace('<body', '<body data-ogsc');
      if (mode === 'no_styles')
        html = html
          .replace(/<style>[\s\S]*?<\/style>/gi, '')
          .replace(/background-image:[^;]+;/g, '');
      if (mode === 'images_blocked') html = html.replace(/<img\b[^>]*>/gi, '');
      await writeFile(path.join(output, `${t.id}_${mode}.html`), html);
    }
  }
  await writeFile(
    path.join(output, 'auth-templates.json'),
    JSON.stringify(getSupabaseAuthTemplates(), null, 2)
  );
  await writeFile(
    path.join(output, 'auth-editor.html'),
    `<!doctype html><meta charset="utf-8"><title>Authentication template source</title><h1>Authentication template source</h1>${getSupabaseAuthTemplates()
      .map(
        (t) =>
          `<label>${t.id}<pre id="${t.id}" data-subject="${t.subject}" style="display:block;width:95%;height:120px;">${t.html.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</pre></label>`
      )
      .join('')}`
  );
  const jobs = all.flatMap((t) =>
    modes.flatMap((mode) =>
      [320, 768, 1366].map((width) => ({
        id: t.id,
        mode,
        width,
        file: `${t.id}_${mode}.html`,
      }))
    )
  );
  await writeFile(
    path.join(output, 'matrix.html'),
    `<!doctype html><html><head><title>TrackMyOPT email QA</title><style>body{font:16px system-ui;margin:24px;color:#172d4e}select,button{font:inherit;padding:8px}iframe{border:1px solid #ccd4e0;background:white}#test{position:absolute;left:-10000px;top:0}pre{white-space:pre-wrap}a{color:#2459c4}</style></head><body><h1>TrackMyOPT email QA</h1><p>${all.length} email fixtures. Phone, tablet, laptop; light, dark CSS, Outlook dark selectors, stripped style blocks, and blocked images.</p><p><label>Email <select id="template">${all.map((t) => `<option value="${t.id}">${t.id}</option>`).join('')}</select></label> <label>Mode <select id="mode">${modes.map((m) => `<option>${m}</option>`).join('')}</select></label> <button id="show">Show preview</button> <button id="run">Run all layout checks</button></p><div id="gallery"></div><h2>Layout results</h2><pre id="results">Ready</pre><iframe id="test" title="Layout check" height="1000"></iframe><script>
const jobs=${JSON.stringify(jobs)};let results=[];
function show(){const id=document.querySelector('#template').value,mode=document.querySelector('#mode').value;document.querySelector('#gallery').innerHTML=[320,768].map(w=>'<h3>'+w+'px</h3><iframe title="'+w+'px preview" width="'+w+'" height="1100" src="'+id+'_'+mode+'.html"></iframe>').join('')}
document.querySelector('#show').onclick=show;show();
document.querySelector('#run').onclick=async()=>{const f=document.querySelector('#test');results=[];for(const [i,j] of jobs.entries()){f.width=j.width;await new Promise(resolve=>{f.onload=resolve;f.src=j.file});const d=f.contentDocument;const overflow=Math.max(d.documentElement.scrollWidth,d.body.scrollWidth)-j.width;results.push({...j,overflow,height:d.body.scrollHeight});document.querySelector('#results').textContent='Checked '+(i+1)+' / '+jobs.length;}const failures=results.filter(r=>r.overflow>1);document.querySelector('#results').textContent=JSON.stringify({checked:results.length,failures},null,2);const blob=new Blob([JSON.stringify(results,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='email-layout-results.json';a.textContent='Download QA results';document.body.append(a)};
</script></body></html>`
  );
  console.log(
    `Rendered ${all.length} fixtures, ${jobs.length} layout checks to ${output}`
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
