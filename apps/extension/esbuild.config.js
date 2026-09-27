const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Store builds must never inherit a developer's local API target.
if (!isWatch && process.env.EXT_TARGET) {
  throw new Error('Production builds require EXT_TARGET to be unset. Use dev:local for local development.');
}

// Clean dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Copy public directory if it exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, {
    recursive: true,
    filter: (source) => fs.statSync(source).isDirectory() || /\.(html|css|png|gif)$/.test(source) && !/ 2\./.test(source),
  });
}

// Generate dist/tokens.css from the design tokens. Keeping this in the build
// means a colour or scale can only be changed in src/design/tokens.ts — the
// popup stylesheet can never drift from the widget's tokens again.
function emitTokensCss() {
  const bundled = esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'src/design/tokens-css-entry.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
  });
  const moduleShim = { exports: {} };
  new Function('module', 'exports', bundled.outputFiles[0].text)(
    moduleShim,
    moduleShim.exports
  );
  const css = moduleShim.exports.css;
  if (typeof css !== 'string' || css.length === 0) {
    throw new Error('tokens-css-entry produced no CSS');
  }
  fs.writeFileSync(path.join(distDir, 'tokens.css'), css);
}

emitTokensCss();

const buildOptions = {
  entryPoints: [
    'src/background.ts',
    'src/popup.ts',
    'src/sidepanel.ts',
    'src/content.ts',
    { in: 'src/content-job-portal-bootstrap.ts', out: 'content-job-portal' },
    'src/easy-apply-fill.ts',
    'src/job-portal-login-entry.ts',
    'src/job-tracker-review-entry.ts',
    'src/feedback-modal-entry.ts',
    'src/tour.ts',
  ],
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  logLevel: 'info',
  minify: !isWatch,
  sourcemap: false,
  drop: isWatch ? [] : ['console', 'debugger'],
  legalComments: 'none',
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isWatch ? 'development' : 'production'
    ),
    // '' (default) -> live site; 'local' -> localhost. See src/config.ts.
    'process.env.EXT_TARGET': JSON.stringify(process.env.EXT_TARGET || ''),
  },
};

const portalOptions = {
  ...buildOptions,
  entryPoints: [{ in: 'src/content-job-portal.ts', out: 'content-job-portal-runtime' }],
  format: 'esm',
};
const builds = [buildOptions, portalOptions];
if (isWatch) {
  Promise.all(builds.map(options => esbuild.context(options).then(ctx => ctx.watch())))
    .catch(() => process.exit(1));
} else {
  Promise.all(builds.map(options => esbuild.build(options))).catch(() => process.exit(1));
}
