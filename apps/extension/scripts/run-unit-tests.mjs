import * as esbuild from 'esbuild';
import { readdir } from 'node:fs/promises';

const entryPoints = (await readdir('tests'))
  .filter((name) => name.endsWith('.test.ts'))
  .map((name) => `tests/${name}`);

const result = await esbuild.build({
  entryPoints,
  bundle: true,
  write: false,
  outdir: 'test-dist',
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  logLevel: 'silent',
});

const require = await import('node:module').then(({ createRequire }) => createRequire(import.meta.url));
for (const output of result.outputFiles) {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output.text)(require, module, module.exports);
}
