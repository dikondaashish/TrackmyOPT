import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const home = readFileSync(resolve('src/home.ts'), 'utf8');
const background = readFileSync(resolve('src/background.ts'), 'utf8');
const build = readFileSync(resolve('esbuild.config.js'), 'utf8');

assert.match(
  home,
  /files:\s*\['job-portal-login-entry\.js'\]/,
  'the ordinary popup Prefill path injects the standalone reviewed login entry',
);
assert.match(
  build,
  /src\/job-portal-login-entry\.ts/,
  'the standalone login content entry is included in the extension build',
);
assert.match(
  background,
  /GET_JOB_PORTAL_LOGIN_FOR_TAB/,
  'the standalone content entry has a dedicated background request',
);
assert.match(
  background,
  /getPrivateApplicationAnswers\(_sender\.tab\?\.url\)/,
  'background credential access is bound to the requesting tab URL',
);

console.log(
  'popup-login-prefill-flow: popup -> dedicated content entry -> sender-bound background contract passed',
);
