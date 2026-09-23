// Serve production helpers with synthetic test data. Browser interaction is
// intentionally separate: open the printed URL in Chrome and run the checks.
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: [
    fileURLToPath(
      new URL('../tests/fixtures/portal-compatibility.ts', import.meta.url)
    ),
  ],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
});
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portal compatibility checks</title><style>
body{font:16px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#17324b;background:#f6f8fc}button{font:inherit;padding:12px 20px;background:#1459d9;color:white;border:0;border-radius:10px}#fixture{padding:20px;margin-top:20px;background:white;border:1px solid #ced8e8;border-radius:12px}label{display:block}input,select{font:inherit;margin:8px;padding:8px}spl-select-option{display:block;padding:8px}li[data-pass=true]{color:#17653a}li[data-pass=false]{color:#b42318}output{display:block;margin:18px 0;font-weight:600}oc-oneclick-form,spl-autocomplete,spl-input,spl-dropzone{display:block}
</style></head><body><h1>Portal compatibility</h1><p>Local browser tests · synthetic details only · no application submission or external requests.</p><button id="run" type="button">Run compatibility checks</button><output id="result" role="status">Ready</output><ol id="checks"></ol><div id="fixture"></div><script src="/fixture.js"></script></body></html>`;
const server = createServer((req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'"
  );
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader(
    'Content-Type',
    req.url === '/fixture.js' ? 'text/javascript' : 'text/html; charset=utf-8'
  );
  res.end(req.url === '/fixture.js' ? outputFiles[0].text : html);
});
server.listen(0, '127.0.0.1', () =>
  console.log(`Portal checks: http://127.0.0.1:${server.address().port}`)
);
