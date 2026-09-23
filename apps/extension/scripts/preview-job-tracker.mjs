// Local-only, credential-free browser fixture. All tracker messages are mocked.
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const { outputFiles } = await build({
  stdin: { contents: `
    import { reviewJobForTracker } from './job-tracker-review';
    import { getJobInfo } from './job-posting-scrape';
    let saves = 0;
    window.chrome = { runtime: { sendMessage: async message => {
      const scenario = document.querySelector('#scenario').value;
      if (message.type === 'CHECK_JOB_SAVED') return scenario === 'signed-out'
        ? { ok: false, error: 'not_signed_in' }
        : { ok: true, saved: scenario === 'saved', status: 'Applied' };
      if (message.type === 'ADD_JOB_TO_TRACKER') {
        if (scenario === 'failure') return { ok: false, error: 'Mock save failed. Please try again.' };
        saves++;
        document.querySelector('#saved').textContent = 'Mock saves: ' + saves + ' | ' + message.status + ' | ' + message.job.role_title;
        return { ok: true, id: 'mock-job', status: message.status };
      }
      throw new Error('Unexpected message: ' + message.type);
    } } };
    const info = getJobInfo();
    document.querySelector('#detected').textContent = JSON.stringify(info);
    document.querySelector('#review').onclick = async () => {
      const result = await reviewJobForTracker();
      document.querySelector('#result').textContent = result.ok ? 'Review ready' : result.error;
    };
    document.querySelector('#theme').onclick = () => {
      document.body.style.backgroundColor = document.body.style.backgroundColor ? '' : 'rgb(13, 16, 22)';
      document.body.style.color = document.body.style.color ? '' : 'rgb(230, 234, 242)';
    };
  `, resolveDir: fileURLToPath(new URL('../src', import.meta.url)), loader: 'ts' },
  bundle: true, write: false, platform: 'browser', format: 'iife',
});
const server = createServer((req, res) => {
  if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(outputFiles[0].text); return; }
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'none'");
  const noJob = req.url === '/no-job';
  res.end(`<!doctype html><html><head><title>${noJob ? 'Help center' : 'Client Billing Specialist at Example Corp'}</title></head><body>
    <h1>${noJob ? 'Help center' : 'Client Billing Specialist'}</h1>
    ${noJob ? '' : '<script type="application/ld+json">{"@type":"JobPosting","title":"Client Billing Specialist","hiringOrganization":{"name":"Example Corp"},"jobLocation":{"address":{"addressLocality":"New York","addressRegion":"NY"}}}</script>'}
    <p>Local test fixture. No network saves or real accounts.</p>
    <label>Scenario <select id="scenario"><option value="success">Success</option><option value="failure">Save failure</option><option value="signed-out">Signed out</option><option value="saved">Already saved</option></select></label>
    <button id="theme">Toggle theme</button><button id="review">Add this job to tracker</button>
    <p id="result" role="status"></p><p id="saved">Mock saves: 0</p><pre id="detected"></pre>
    <script src="/bundle.js"></script></body></html>`);
});
server.listen(0, '127.0.0.1', () => console.log(`Job tracker fixture: http://127.0.0.1:${server.address().port}`));
