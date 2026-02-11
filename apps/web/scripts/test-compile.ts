
import fs from 'fs';
import path from 'path';

const COMPILER_URL = 'https://latex.ytotech.com/builds/sync';

const SAMPLE_LATEX = `
\\documentclass{article}
\\begin{document}
Hello World! This is a test PDF from the Resume Generator.
\\end{document}
`;

async function testCompilation() {
    console.log('Testing compilation...');
    try {
        const response = await fetch(COMPILER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compiler: 'pdflatex',
                resources: [{ main: true, content: SAMPLE_LATEX }]
            })
        });

        if (!response.ok) {
            throw new Error(`Failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const outputPath = path.join(process.cwd(), 'test-output.pdf');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Success! PDF saved to ${outputPath}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

testCompilation();
