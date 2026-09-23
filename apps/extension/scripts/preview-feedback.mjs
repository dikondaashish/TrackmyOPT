// Credential-free Chrome preview. All feedback submissions are mocked.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const logo = await readFile(new URL('../public/icons/logo.gif', import.meta.url));
const bundle = await build({ stdin: { contents: `
  import { openFeedbackModal } from './feedback';
  let submissions = 0;
  const mockChrome = { runtime: { getURL: () => '/logo.gif', getManifest: () => ({version:'0.2.0'}), sendMessage: async message => {
    submissions++; document.querySelector('#sent').textContent = 'Mock submissions: ' + submissions;
    if (document.querySelector('#fail').checked) return {ok:false,error:'Could not send feedback. Please try again.'};
    return {ok:true};
  } } };
  document.querySelector('#open').onclick = () => { window.chrome = mockChrome; openFeedbackModal(); };
  document.querySelector('#dark').onchange = event => { document.body.style.backgroundColor = event.target.checked ? 'rgb(13,16,22)' : 'rgb(246,248,251)'; document.body.style.color = event.target.checked ? 'rgb(230,234,242)' : 'rgb(15,23,42)'; };
`, resolveDir: fileURLToPath(new URL('../src', import.meta.url)), loader: 'ts' }, bundle:true, write:false, platform:'browser', format:'iife' });
const server = createServer((req,res) => {
  if(req.url === '/logo.gif') {res.setHeader('Content-Type','image/gif');res.end(logo);return;}
  if(req.url === '/bundle.js') {res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'");
  res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>TrackMyOPT feedback preview</title><body><h1>Feedback preview</h1><p>Local fixture. No feedback is sent to TrackMyOPT.</p><label><input type="checkbox" id="dark">Dark background</label><label><input type="checkbox" id="fail">Simulate failure</label><button id="open">Open feedback</button><p id="sent">Mock submissions: 0</p><script src="/bundle.js"></script></body>');
});
server.listen(0,'127.0.0.1',()=>console.log('Feedback preview: http://127.0.0.1:'+server.address().port));
