import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateZomatoLaunchEmail } from '../lib/notifications/marketing/zomato-launch';

// Load .env.local from the current directory (apps/web)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  console.log('Preparing to send Zomato-Energy marketing email...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const recipient = 'dikondaashish@gmail.com';
  const firstName = 'Ashish';
  const emailType = 'zomato_launch_marketing';

  // 1. Insert into email_queue to get a unique tracking ID
  const { data: inserted, error: queueErr } = await supabase
    .from('email_queue')
    .insert({
      email_address: recipient,
      email_type: emailType,
      email_subject: 'Maggi takes 2 mins. So does your new resume. 🍜',
      status: 'pending',
      retry_count: 0,
      user_id: null, // Marketing email might not have a linked user yet
    })
    .select('id')
    .single();

  if (queueErr || !inserted) {
    console.error('❌ Failed to queue email in DB:', queueErr);
    // Continue anyway or exit? Let's exit to ensure tracking.
    process.exit(1);
  }

  const emailId = inserted.id;
  const html = generateZomatoLaunchEmail(firstName, emailId);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: recipient,
    subject: 'Maggi takes 2 mins. So does your new resume. 🍜',
    html,
    attachments: [
      {
        filename: 'maggi-resume-hero.png',
        path: path.resolve(__dirname, '../public/marketing/maggi-resume-hero.png'),
        cid: 'maggi_resume_hero',
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Tracking ID (email_queue):', emailId);

    // 2. Update status in DB
    await supabase
      .from('email_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_message_id: info.messageId,
      })
      .eq('id', emailId);

  } catch (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  }
}

main();
