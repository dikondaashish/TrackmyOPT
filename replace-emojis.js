const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Note: we'll use fs.readdir recursive if glob is not installed, but let's just write a simple recursive function

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, fileList);
        } else if (filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = walk(path.join(__dirname, 'apps/web/app/blog'));

const emojiMap = {
    '✅': 'CheckCircle',
    '❌': 'XCircle',
    '⚠️': 'AlertTriangle',
    '🚨': 'AlertCircle',
    '⚖️': 'Scale',
    '🏛️': 'Landmark',
    '🗺️': 'MapIcon',
    '📊': 'BarChart',
    '🗓️': 'Calendar',
    '✈️': 'Plane',
    '🌍': 'Globe',
    '💼': 'Briefcase',
    '🔗': 'LinkIcon'
};

const emojiRegex = new RegExp(`[${Object.keys(emojiMap).join('')}]`, 'g');

let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Quick check if file has any of the emojis
    if (!emojiRegex.test(content)) continue;
    
    // Find which emojis are used
    const usedEmojis = [...new Set(content.match(emojiRegex))];
    const componentsNeeded = usedEmojis.map(e => emojiMap[e]);
    
    // For each emoji, we need to replace it.
    // If it's inside a string literal like "✅ Yes", we want to turn it into <><CheckCircle className="w-4 h-4 inline text-green-500 mr-1" /> Yes</>
    // However, if it's in a JSX text block like <p>✅ Fix:</p>, we can just replace the character directly.
    // To handle both string literals in arrays and JSX text, a string-to-JSX replacement within { } or just straight in JSX is best.
    
    // Let's do string replacement. Since we're in TSX, if it's inside a string array like ["Risk Level", "⚠️ Higher"],
    // we change it to [<><AlertTriangle className="w-4 h-4 inline text-yellow-500 mr-1" /> Higher</>]
    // This is hard to do with pure regex safely.
    // Let's look for specific string patterns first:
    
    let newContent = content;
    
    // 1. Replace emojis in string literals: "✅ Text" -> <><CheckCircle className="w-4 h-4 inline text-green-500 mr-1" /> Text</>
    // This covers arrays and object values where strings are used.
    // But wait, if it's already in JSX text: <p>✅ Fix:</p>, it's NOT in quotes.
    
    // First, let's handle the specific array pattern found in tables:
    // e.g. ["During Cap-Gap", "✅ Yes", "Continue"]
    const stringEmojiRegex = new RegExp(`"([^"]*)([${Object.keys(emojiMap).join('')}])([^"]*)"`, 'g');
    newContent = newContent.replace(stringEmojiRegex, (match, before, emoji, after) => {
        const comp = emojiMap[emoji];
        const color = emoji === '✅' ? 'text-green-500' : emoji === '❌' ? 'text-red-500' : emoji === '⚠️' ? 'text-yellow-500' : emoji === '🚨' ? 'text-red-500' : 'text-blue-500';
        return `<><${comp} className="w-4 h-4 inline ${color} shrink-0 mr-1.5" /> ${before.trim()} ${after.trim()}</>`;
    });

    // Then handle JSX text: <p className="...">✅ Fix: ...</p>
    const jsxEmojiRegex = new RegExp(`([>\\s])([${Object.keys(emojiMap).join('')}])([\\s<])`, 'g');
    newContent = newContent.replace(jsxEmojiRegex, (match, before, emoji, after) => {
        const comp = emojiMap[emoji];
        const color = emoji === '✅' ? 'text-green-500' : emoji === '❌' ? 'text-red-500' : emoji === '⚠️' ? 'text-yellow-500' : emoji === '🚨' ? 'text-red-500' : 'text-blue-500';
        return `${before}<${comp} className="w-4 h-4 inline ${color} shrink-0 mr-1.5" />${after}`;
    });
    
    // Sometimes the emoji is directly next to text like ✅Fix
    const directEmojiRegex = new RegExp(`([${Object.keys(emojiMap).join('')}])([a-zA-Z0-9])`, 'g');
    newContent = newContent.replace(directEmojiRegex, (match, emoji, after) => {
        const comp = emojiMap[emoji];
        const color = emoji === '✅' ? 'text-green-500' : emoji === '❌' ? 'text-red-500' : emoji === '⚠️' ? 'text-yellow-500' : emoji === '🚨' ? 'text-red-500' : 'text-blue-500';
        return `<${comp} className="w-4 h-4 inline ${color} shrink-0 mr-1.5" /> ${after}`;
    });

    // Replace any remaining emojis
    const anyEmojiRegex = new RegExp(`([${Object.keys(emojiMap).join('')}])`, 'g');
    newContent = newContent.replace(anyEmojiRegex, (match, emoji) => {
        const comp = emojiMap[emoji];
        const color = emoji === '✅' ? 'text-green-500' : emoji === '❌' ? 'text-red-500' : emoji === '⚠️' ? 'text-yellow-500' : emoji === '🚨' ? 'text-red-500' : 'text-blue-500';
        return `<${comp} className="w-4 h-4 inline ${color} shrink-0 mr-1.5" />`;
    });

    // Clean up empty text bits if any (e.g. <><Comp />  </>)
    newContent = newContent.replace(/<><([^>]+)>  <\/>/g, '<><$1 /></>');

    // Now update the lucide-react import
    if (componentsNeeded.length > 0 && content !== newContent) {
        let importMatch = newContent.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/);
        if (importMatch) {
            let existingImports = importMatch[1].split(',').map(s => s.trim());
            for (const comp of componentsNeeded) {
                if (!existingImports.includes(comp)) {
                    existingImports.push(comp);
                }
            }
            newContent = newContent.replace(importMatch[0], `import { ${existingImports.join(', ')} } from "lucide-react"`);
        } else {
            // Add import after 'next/link' or 'next'
            if (newContent.includes('import Link')) {
                newContent = newContent.replace('import Link from "next/link";', `import Link from "next/link";\nimport { ${componentsNeeded.join(', ')} } from "lucide-react";`);
            } else {
                newContent = `import { ${componentsNeeded.join(', ')} } from "lucide-react";\n` + newContent;
            }
        }
    }
    
    fs.writeFileSync(file, newContent, 'utf-8');
    changedCount++;
    console.log(`Updated ${file}`);
}

console.log(`Completed updating ${changedCount} files.`);
