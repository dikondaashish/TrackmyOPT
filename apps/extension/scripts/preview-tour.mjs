// Build first. Serves only the packaged demo, never account data or API mocks.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.gif': 'image/gif',
};
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  response.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/responsive') {
    response.setHeader('Content-Type', 'text/html');
    response.end(
      '<!doctype html><title>TrackMyOPT narrow tour QA</title><body style="margin:0;background:#e7eaf0"><iframe title="390 pixel tour preview" src="/tour.html?dark" style="display:block;width:390px;height:844px;border:0;margin:16px auto"></iframe></body>'
    );
    return;
  }
  const file = resolve(
    root,
    `.${url.pathname === '/' ? '/tour.html' : url.pathname}`
  );
  if (!file.startsWith(resolve(root) + sep)) {
    response.writeHead(403);
    response.end();
    return;
  }
  try {
    let data = await readFile(file);
    if (extname(file) === '.html' && url.searchParams.has('dark'))
      data = Buffer.from(
        data
          .toString()
          .replace('<html lang="en">', '<html lang="en" data-tmo-theme="dark">')
      );
    response.setHeader(
      'Content-Type',
      mime[extname(file)] ?? 'application/octet-stream'
    );
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
server.listen(59765, '127.0.0.1', () =>
  console.log('Tour: http://127.0.0.1:59765/tour.html | Narrow QA: /responsive')
);
