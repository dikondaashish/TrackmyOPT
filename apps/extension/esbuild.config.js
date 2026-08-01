const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

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
  const copyRecursive = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      fs.readdirSync(src).forEach((file) => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  copyRecursive(publicDir, distDir);
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
    'src/content-job-portal.ts',
    'src/easy-apply-fill.ts',
    'src/job-portal-login-entry.ts',
    'src/feedback-modal-entry.ts',
  ],
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    // '' (default) -> live site; 'local' -> localhost. See src/config.ts.
    'process.env.EXT_TARGET': JSON.stringify(process.env.EXT_TARGET || ''),
  },
};

if (isWatch) {
  esbuild
    .context(buildOptions)
    .then((ctx) => {
      console.log('👀 Watching for changes...');
      return ctx.watch();
    })
    .catch(() => process.exit(1));
} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}
