#!/bin/bash

echo "🔧 Rebuilding TrackMyOPT Extension..."
echo ""

cd "$(dirname "$0")/extension"

# Check which package manager is available
if command -v pnpm &> /dev/null; then
    echo "📦 Using pnpm..."
    pnpm run build
elif command -v npm &> /dev/null; then
    echo "📦 Using npm..."
    npm run build
elif command -v yarn &> /dev/null; then
    echo "📦 Using yarn..."
    yarn build
else
    echo "❌ Error: No package manager found (pnpm, npm, or yarn)"
    echo "Please install Node.js and a package manager first"
    exit 1
fi

echo ""
echo "✅ Extension rebuilt successfully!"
echo ""
echo "🔄 Now reload the extension in Chrome:"
echo "   1. Open chrome://extensions/"
echo "   2. Find 'TrackMyOPT'"
echo "   3. Click the reload button 🔄"
echo ""
