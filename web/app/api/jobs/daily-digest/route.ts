import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify request is from Vercel Cron or authorized
function verifyAuthorization(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow Vercel Cron jobs
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  
  // Allow local development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Initialize Supabase with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all users with their OPT status
    const { data: users, error: usersError } = await supabase
      .from('opt_status')
      .select(`
        user_id,
        program_end_date,
        opt_ead_end_date,
        opt_start_date,
        stem_start_date
      `);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users to process' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const user of users) {
      try {
        // Get user email from auth.users
        const { data: authUser } = await supabase.auth.admin.getUserById(
          user.user_id
        );

        if (!authUser?.user?.email) {
          errors.push(`No email found for user ${user.user_id}`);
          continue;
        }

        const email = authUser.user.email;

        // Check program_end_date
        if (user.program_end_date) {
          const programEndDate = new Date(user.program_end_date);
          const daysUntilProgramEnd = Math.ceil(
            (programEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if ([60, 30, 10].includes(daysUntilProgramEnd)) {
            await sendEmail({
              to: email,
              subject: `OPT Application Window Opens in ${daysUntilProgramEnd} Days`,
              body: `
                <h2>Important OPT Deadline Reminder</h2>
                <p>Your program end date is approaching!</p>
                <p><strong>Days until program end:</strong> ${daysUntilProgramEnd} days</p>
                <p><strong>Program End Date:</strong> ${programEndDate.toLocaleDateString()}</p>
                <p>Remember: You can apply for OPT up to 90 days before your program end date and no later than 60 days after.</p>
                <p>Visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}">OPT Hub</a> to track your timeline.</p>
              `,
            });
            emailsSent.push(`program_end: ${email} (${daysUntilProgramEnd} days)`);
          }
        }

        // Check opt_ead_end_date
        if (user.opt_ead_end_date) {
          const optEadEndDate = new Date(user.opt_ead_end_date);
          const daysUntilOptEnd = Math.ceil(
            (optEadEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if ([60, 30, 10].includes(daysUntilOptEnd)) {
            await sendEmail({
              to: email,
              subject: `Your OPT Ends in ${daysUntilOptEnd} Days`,
              body: `
                <h2>OPT Expiration Reminder</h2>
                <p>Your OPT EAD is expiring soon!</p>
                <p><strong>Days until OPT ends:</strong> ${daysUntilOptEnd} days</p>
                <p><strong>OPT EAD End Date:</strong> ${optEadEndDate.toLocaleDateString()}</p>
                <p>Make sure you have plans for your status after OPT expires. Consider STEM extension if eligible, H1-B, or other visa options.</p>
                <p>Visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}">OPT Hub</a> to track your timeline.</p>
              `,
            });
            emailsSent.push(`opt_ead_end: ${email} (${daysUntilOptEnd} days)`);
          }
        }

        // Check if OPT start date is approaching
        if (user.opt_start_date) {
          const optStartDate = new Date(user.opt_start_date);
          const daysUntilOptStart = Math.ceil(
            (optStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if ([14, 7, 3, 1].includes(daysUntilOptStart)) {
            await sendEmail({
              to: email,
              subject: `Your OPT Starts in ${daysUntilOptStart} Days`,
              body: `
                <h2>OPT Start Date Approaching</h2>
                <p>Your OPT is about to begin!</p>
                <p><strong>Days until OPT starts:</strong> ${daysUntilOptStart} days</p>
                <p><strong>OPT Start Date:</strong> ${optStartDate.toLocaleDateString()}</p>
                <p>Make sure you're ready to start work or actively seeking employment. Remember the 90-day unemployment limit!</p>
                <p>Visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}">OPT Hub</a> to track your timeline.</p>
              `,
            });
            emailsSent.push(`opt_start: ${email} (${daysUntilOptStart} days)`);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError);
        errors.push(`User ${user.user_id}: ${userError}`);
      }
    }

    return NextResponse.json({
      message: 'Daily digest completed',
      emailsSent: emailsSent.length,
      errors: errors.length,
      details: {
        sent: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Daily digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OPT Hub <noreply@opt-tracker.ashishdikonda.com>',
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              h2 {
                color: #2563eb;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 15px;
              }
              strong {
                color: #1f2937;
              }
              a {
                color: #2563eb;
                text-decoration: none;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            ${body}
            <div class="footer">
              <p>This is an automated reminder from OPT Hub. To manage your notification preferences, visit your dashboard.</p>
              <p>© ${new Date().getFullYear()} OPT Hub. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

