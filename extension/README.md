# TrackMyOPT Chrome Extension

## Development

```bash
# Install dependencies
pnpm install

# Watch mode (rebuilds on file changes)
pnpm dev

# Production build
pnpm build
```

## Loading in Chrome

1. Run `pnpm build` to build the extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension/dist` directory

## Project Structure

```
extension/
├── src/
│   ├── background.ts    # Service worker
│   ├── popup.ts         # Popup script
│   └── popup.html       # Popup UI
├── public/
│   └── icons/           # Extension icons
├── manifest.json        # Extension manifest
└── esbuild.config.js    # Build configuration
```

## Notes

- Place your extension icons (16x16, 48x48, 128x128) in `public/icons/`
- The build process automatically copies manifest.json and public/ to dist/

