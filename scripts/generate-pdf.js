const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    const htmlPath = path.resolve(__dirname, '../apps/web/public/templates/f1-incorporation-checklist.html');
    const pdfPath = path.resolve(__dirname, '../apps/web/public/templates/f1-incorporation-checklist.pdf');

    // Use the cached Chrome for Testing from the earlier puppeteer browsers install
    const chromePath = '/Users/ashishdikonda/.cache/puppeteer/chrome/mac_arm-127.0.6533.88/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

    console.log('🚀 Launching Chrome...');
    
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    console.log('📄 Loading HTML file...');
    const fileUrl = `file://${htmlPath}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for fonts to load
    await new Promise(r => setTimeout(r, 2500));

    console.log('🖨️ Generating PDF...');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        displayHeaderFooter: false,
    });

    await browser.close();
    
    const stats = fs.statSync(pdfPath);
    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 Location: ${pdfPath}`);
    console.log(`📏 Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

generatePDF().catch(err => {
    console.error('❌ Error generating PDF:', err);
    process.exit(1);
});
