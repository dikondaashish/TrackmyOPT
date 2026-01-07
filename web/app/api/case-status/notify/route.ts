import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Request',
  'Cache-Control': 'no-store',
};

// Create SMTP transporter for Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * POST /api/case-status/notify
 * Send email notification when case status changes
 * (Premium feature only)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify internal request
    const internalHeader = req.headers.get('X-Internal-Request');

    if (internalHeader !== 'true') {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { user_id, receipt_number, old_status, new_status, description, case_type, received_date } = body;

    if (!user_id || !receipt_number || !new_status) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }


    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user details and check if premium
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, full_name, premium_status')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has notifications enabled
    const { data: caseData, error: caseError } = await supabase
      .from('case_status')
      .select('notifications_enabled')
      .eq('user_id', user_id)
      .single();

    if (caseError || !caseData || !caseData.notifications_enabled) {
      return NextResponse.json(
        { ok: true, message: 'Notifications disabled' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Check if user is premium
    if (!userData.premium_status) {
      return NextResponse.json(
        { ok: true, message: 'Notifications are a premium feature' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Get user's email from auth.users table
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(user_id);

    if (authError || !authData.user) {
      console.error('Error fetching auth user:', authError);
      return NextResponse.json(
        { ok: false, error: 'Could not fetch user email' },
        { status: 500, headers: corsHeaders }
      );
    }

    const userEmail = authData.user.email;

    if (!userEmail) {
      console.error('User email not found');
      return NextResponse.json(
        { ok: false, error: 'User email not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Send email notification via SMTP
    try {
      const info = await transporter.sendMail({
        from: `Zyene Inc <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
        to: userEmail,
        subject: `🔔 Your USCIS Case Status Has Changed - ${receipt_number}`,
        html: generateEmailHTML({
          name: userData.full_name || 'there',
          receipt_number,
          old_status,
          new_status,
          description,
          case_type,
          received_date,
        }),
      });

      console.log('Email sent:', info.messageId);

      return NextResponse.json(
        { ok: true, message: 'Notification sent', email_id: info.messageId },
        { status: 200, headers: corsHeaders }
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { ok: false, error: 'Failed to send email' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/case-status/notify:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Generate HTML email template for case status change notification
 */
function generateEmailHTML({
  name,
  receipt_number,
  old_status,
  new_status,
  description,
  case_type,
  received_date,
}: {
  name: string;
  receipt_number: string;
  old_status: string | null;
  new_status: string;
  description?: string;
  case_type?: string;
  received_date?: string | null;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Case Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🔔 Case Status Update
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hi ${name},
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Great news! Your USCIS case status has been updated:
                    </p>

                    <!-- Receipt Number -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Receipt Number
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace;">
                        ${receipt_number}
                      </p>
                    </div>

                    <!-- Case Details -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${case_type ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Case Type:</td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${case_type}</td>
                        </tr>
                        ` : ''}
                        ${received_date ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Submitted Date:</td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${received_date}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Notification Date:</td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Status Change -->
                    <div style="border-left: 4px solid #10b981; background-color: #f0fdf4; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                      ${old_status ? `
                        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                          <strong>Previous Status:</strong>
                        </p>
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px;">
                          ${old_status}
                        </p>
                      ` : ''}
                      
                      <p style="margin: 0 0 12px 0; color: #10b981; font-size: 14px; font-weight: 600;">
                        <strong>✨ New Status:</strong>
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">
                        ${new_status}
                      </p>
                    </div>

                    <!-- Description -->
                    ${description ? `
                    <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
                      <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                        📋 Status Description
                      </p>
                      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                        ${description}
                      </p>
                    </div>
                    ` : ''}

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://trackmyopt.com'}/dashboard/case-status" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                        View Full Status
                      </a>
                    </div>

                    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      We'll continue monitoring your case and notify you of any future changes.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-align: center;">
                      This is a premium feature
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      © ${new Date().getFullYear()} Zyene, Inc. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://trackmyopt.com'}/dashboard/case-status" style="color: #667eea; text-decoration: none;">Manage Notifications</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

