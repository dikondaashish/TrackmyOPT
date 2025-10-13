# TrackMyOPT

A monorepo containing the TrackMyOPT web application and Chrome extension for tracking OPT timelines with precision.

## 📁 Project Structure

```
TrackMyOPT/
├── web/                    # Next.js 14 web application
│   ├── app/               # App Router pages and layouts
│   ├── public/            # Static assets
│   └── package.json
├── extension/             # Chrome Manifest V3 extension
│   ├── src/               # TypeScript source files
│   ├── public/            # Extension assets (icons, etc.)
│   ├── manifest.json      # Extension manifest
│   └── package.json
├── package.json           # Root workspace configuration
└── pnpm-workspace.yaml    # pnpm workspace definition
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Installation

```bash
# Install all dependencies for the monorepo
pnpm install
```

## 📦 Available Commands

### Web Application

```bash
# Start Next.js development server (http://localhost:3000)
pnpm dev:web

# Build Next.js for production
pnpm build:web
```

### Chrome Extension

```bash
# Watch mode - rebuilds extension on file changes
pnpm dev:ext

# Build extension for production
pnpm build:ext
```

### Other Commands

```bash
# Format all files with Prettier
pnpm format

# Check formatting without modifying files
pnpm format:check
```

## 🌐 Running the Web App

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm dev:web`
3. Open [http://localhost:3000](http://localhost:3000) in your browser

The web app uses:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality

## 🧩 Loading the Chrome Extension

1. Build the extension: `pnpm build:ext`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `extension/dist` directory

For development, use `pnpm dev:ext` to watch for changes and rebuild automatically.

## 🛠️ Tech Stack

### Web App (`web/`)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Linting:** ESLint

### Extension (`extension/`)
- **Manifest:** Chrome Manifest V3
- **Language:** TypeScript
- **Build Tool:** esbuild
- **Runtime:** Chrome Extension APIs

## 📝 Development Notes

### Working with the Monorepo

This project uses pnpm workspaces to manage multiple packages. Each package (`web/` and `extension/`) has its own `package.json` and can be worked on independently.

### Adding Dependencies

```bash
# Add to web app
pnpm --filter web add <package-name>

# Add to extension
pnpm --filter extension add <package-name>

# Add to root (for tools like prettier)
pnpm add -w <package-name>
```

### Extension Icons

Place your extension icons in `extension/public/icons/`:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `pnpm format` to format code
4. Test both web and extension
5. Submit a pull request

## 📄 License

MIT

