const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function main() {
  console.log("Starting mass mail script...");

  // Initialize Supabase Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Initialize Nodemailer Transport
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM_EMAIL || 'no-reply@trackmyopt.com';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("Missing SMTP credentials in .env.local");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort) || 465,
    secure: parseInt(smtpPort) === 465, 
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  // Test SMTP connection
  try {
    await transporter.verify();
    console.log("SMTP connection verified.");
  } catch (err) {
    console.error("Failed to connect to SMTP server:", err);
    process.exit(1);
  }

  // Fetch Free Users
  console.log("Fetching target audience from Supabase...");
  const { data: users, error } = await supabase
    .from('profiles')
    .select('email, first_name')
    .or('premium_status.is.null,premium_status.eq.false')
    .not('email', 'is', null);

  if (error) {
    console.error("Error fetching users:", error);
    process.exit(1);
  }

  console.log(`Found ${users.length} free-tier users. Beginning dispatch...`);

  // Load Email Template
  const templatePath = path.join(__dirname, 'templates', 'premium-upsell-email.html');
  const htmlContent = fs.readFileSync(templatePath, 'utf8');

  let sentCount = 0;
  let failedCount = 0;

  // Rate Limiting (Helper to sleep)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userEmail = user.email;
    const userFirstName = user.first_name && user.first_name.trim().length > 0 ? user.first_name.trim() : 'there';

    const personalizedHtml = htmlContent
      .replace(/{{first_name}}/g, userFirstName)
      .replace(/{{premium_link}}/g, 'https://www.trackmyopt.com/pricing')
      .replace(/{{unsubscribe_url}}/g, '#')
      .replace(/{{preferences_url}}/g, '#');

    try {
      await transporter.sendMail({
        from: '"TrackMyOPT" <' + smtpFrom + '>',
        to: userEmail,
        subject: "TrackMyOPT Premium - Your OPT needs these 12 tools",
        html: personalizedHtml,
      });

      sentCount++;
      process.stdout.write(`✅ Sent to ${userEmail} (${sentCount}/${users.length})\n`);
    } catch (err) {
      failedCount++;
      process.stdout.write(`❌ Failed for ${userEmail}: ${err.message}\n`);
    }

    // Sleep for 300ms to avoid ZeptoMail rate limits
    if (i < users.length - 1) {
      await sleep(300);
    }
  }

  console.log(`\nEmail campaign complete!`);
  console.log(`Total Success: ${sentCount}`);
  console.log(`Total Failed: ${failedCount}`);
  process.exit(0);
}

main();
