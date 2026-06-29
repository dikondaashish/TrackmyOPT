#!/usr/bin/env node

/**
 * IndexNow Bulk Submission Script
 * 
 * Submits all blog posts and key pages to IndexNow for instant indexing
 * Run this script after deploying new content to speed up indexing
 * 
 * Usage:
 * npm run submit:indexnow
 * 
 * Example from package.json:
 * "submit:indexnow": "node scripts/submit-to-indexnow.js"
 */

const https = require('https');
const blogArticles = [
  '90-day-unemployment-rule-opt',
  'ats-resume-international-students',
  'can-you-travel-on-opt',
  'day-1-cpt-vs-opt',
  'f1-student-tax-filing-guide',
  'f1-visa-jobs-guide',
  'h1b-approval-rates-by-company',
  'h1b-cap-gap-extension',
  'i-983-training-plan-guide',
  'opt-application-checklist-2026',
  'opt-application-denied',
  'opt-ead-card-guide',
  'opt-extension-guide',
  'opt-health-insurance-guide',
  'opt-processing-time-2026',
  'opt-to-h1b-transition',
  'stem-opt-employer-requirements',
  'stem-opt-extension-guide',
  'stem-opt-unemployment-limit',
  'top-h1b-sponsor-companies-2026',
  'uscis-case-status-tracking-guide',
  'what-happens-if-opt-expires',
];

const featurePages = [
  'case-status',
  'compliance',
  'extension',
  'health-insurance',
  'job-tracker',
  'resume-ai',
  'sponsors',
  'tax-filing',
  'community',
];

const guides = [
  'f1-tax-filing',
  'opt-career',
  'opt-health-insurance',
];

const otherPages = [
  'pricing',
  'glossary',
  'tools',
];

// Build full URL list
const baseUrl = 'https://www.trackmyopt.com';
const urlList = [
  ...blogArticles.map((slug) => `${baseUrl}/blog/${slug}`),
  ...featurePages.map((slug) => `${baseUrl}/features/${slug}`),
  ...guides.map((slug) => `${baseUrl}/guides/${slug}`),
  ...otherPages.map((slug) => `${baseUrl}/${slug}`),
  baseUrl, // Home page
];

console.log(`📤 Submitting ${urlList.length} URLs to IndexNow...`);
console.log(`   - ${blogArticles.length} blog articles`);
console.log(`   - ${featurePages.length} feature pages`);
console.log(`   - ${guides.length} guides`);
console.log(`   - ${otherPages.length} other pages`);
console.log(`   - 1 home page`);
console.log('');

// Submit in batches of 10,000 (IndexNow limit)
async function submitBatch(batch, batchNumber) {
  return new Promise((resolve, reject) => {
    const indexNowKey = process.env.INDEXNOW_KEY || 'trackmyopt2026indexnow';
    const payload = JSON.stringify({
      host: 'www.trackmyopt.com',
      key: indexNowKey,
      keyLocation: 'https://www.trackmyopt.com/indexnow-key.txt',
      urlList: batch,
    });

    const options = {
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/IndexNow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`✅ Batch ${batchNumber}: Status ${res.statusCode} - ${batch.length} URLs submitted`);
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          console.error(`❌ Batch ${batchNumber}: Status ${res.statusCode}`);
          console.error(`   Response: ${data}`);
          reject(new Error(`IndexNow API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Batch ${batchNumber}: Error -`, error.message);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// Main function
async function main() {
  const indexNowKey = process.env.INDEXNOW_KEY || 'trackmyopt2026indexnow';
  if (!indexNowKey) {
    console.error('❌ INDEXNOW_KEY environment variable not set');
    process.exit(1);
  }

  try {
    // Submit in batches of 10,000
    const batchSize = 10000;
    const batches = [];
    for (let i = 0; i < urlList.length; i += batchSize) {
      batches.push(urlList.slice(i, i + batchSize));
    }

    console.log(`📦 Splitting into ${batches.length} batch(es)...`);
    console.log('');

    // Submit batches sequentially with a small delay between to avoid rate limiting
    for (let i = 0; i < batches.length; i++) {
      await submitBatch(batches[i], i + 1);

      // Delay between batches (1 second)
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log('');
    console.log('🎉 All URLs submitted to IndexNow!');
    console.log('');
    console.log('⏱️  Indexing timeline:');
    console.log('   • 24-48 hours: Most URLs indexed');
    console.log('   • 1-7 days: All content discoverable');
    console.log('');
    console.log('📊 Monitor progress at: https://www.bing.com/webmaster/');
  } catch (error) {
    console.error('');
    console.error('❌ Submission failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
