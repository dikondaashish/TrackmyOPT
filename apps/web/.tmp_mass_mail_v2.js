const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function main() {
  console.log("Starting mass mail script v2...");

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

  // Fetch all Auth Users mapping
  console.log("Fetching auth.users...");
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) {
    console.error("Error fetching auth users:", authErr);
    process.exit(1);
  }
  const authUsers = authData.users;

  // Fetch Profiles
  console.log("Fetching public.profiles...");
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('user_id, premium_status, first_name');
  if (profErr) {
    console.error("Error fetching profiles:", profErr);
    process.exit(1);
  }

  // Cross reference
  const alreadySentList = [
    'katea1@udayton.edu',
    'asadalam2326@gmail.com',
    'sunil.sam96@gmail.com',
    'sql.python2727@gmail.com',
    'heartbreakersplanet@gmail.com'
  ];

  const targetUsers = [];
  
  for (const authUser of authUsers) {
    const profile = profiles.find(p => p.user_id === authUser.id);
    
    // Default to false if no profile, otherwise check premium_status
    let isPremium = false;
    if (profile && profile.premium_status === true) {
      isPremium = true;
    }

    if (!isPremium) {
      // Exclude those we already hit in the V1 script
      if (!alreadySentList.includes(authUser.email)) {
        targetUsers.push({
          email: authUser.email,
          first_name: profile && profile.first_name ? profile.first_name : ''
        });
      }
    }
  }

  console.log(`Found ${targetUsers.length} free-tier users needing emails. Beginning dispatch...`);

  // Load Email Template
  const templatePath = path.join(__dirname, 'templates', 'premium-upsell-email.html');
  const htmlContent = fs.readFileSync(templatePath, 'utf8');

  let sentCount = 0;
  let failedCount = 0;

  // Rate Limiting (Helper to sleep)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < targetUsers.length; i++) {
    const user = targetUsers[i];
    const userEmail = user.email;
    const userFirstName = user.first_name.trim().length > 0 ? user.first_name.trim() : 'there';

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
      process.stdout.write(`✅ Sent to ${userEmail} (${sentCount}/${targetUsers.length})\n`);
    } catch (err) {
      failedCount++;
      process.stdout.write(`❌ Failed for ${userEmail}: ${err.message}\n`);
    }

    // Sleep for 300ms to avoid ZeptoMail rate limits
    if (i < targetUsers.length - 1) {
      await sleep(300);
    }
  }

  console.log(`\nEmail campaign complete!`);
  console.log(`Total Success: ${sentCount}`);
  console.log(`Total Failed: ${failedCount}`);
  process.exit(0);
}

main();
