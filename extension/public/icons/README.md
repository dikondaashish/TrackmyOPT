# Extension Icons

These are placeholder icons for the TrackMyOPT Chrome extension.

## Current Icons
- `icon16.png` - 16x16px (toolbar icon)
- `icon48.png` - 48x48px (extension management page)
- `icon128.png` - 128x128px (Chrome Web Store)

## Customizing Icons

### Option 1: Design Tools
Use tools like Figma, Sketch, or Photoshop to create:
- Modern, minimalist clock/timer design
- Blue gradient (#007AFF to #AF52DE) matching brand
- Clean, recognizable at small sizes

### Option 2: Online Icon Generators
- [Favicon.io](https://favicon.io/) - Text/emoji to icon
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Icon Kitchen](https://icon.kitchen/)

### Option 3: AI Generation
Use AI tools to generate:
- "Modern minimalist OPT countdown timer icon, blue gradient, clean design"
- Export at 512x512, then resize to needed dimensions

## Requirements
- PNG format
- Transparent background recommended
- Square dimensions (1:1 ratio)
- Clear and recognizable at 16px

## After Updating
Rebuild the extension to copy new icons to dist:
```bash
pnpm build:ext
```

Then reload the extension in Chrome.

