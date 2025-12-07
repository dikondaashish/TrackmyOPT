/**
 * Email Service - Handles all email sending via SMTP (Hostinger)
 * 
 * Features:
 * - Daily reminder emails
 * - Urgency-based messaging
 * - Beautiful HTML templates
 * - Apple-inspired design
 */

import nodemailer from 'nodemailer';

// Create SMTP transporter for Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailReminderData {
  userId: string;
  userEmail: string;
  firstName: string;
  tools: {
    name: string;
    daysLeft: number;
    endDate: string;
    urgency: 'safe' | 'moderate' | 'urgent' | 'critical';
    message: string;
  }[];
}

/**
 * Send daily reminder email to a user
 */
export async function sendDailyReminder(data: EmailReminderData) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'TrackMyOPT'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: data.userEmail,
      subject: getDynamicSubject(data.tools),
      html: generateEmailHTML(data),
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

/**
 * Generate dynamic subject line based on urgency
 */
function getDynamicSubject(tools: EmailReminderData['tools']): string {
  const minDays = Math.min(...tools.map(t => t.daysLeft));
  
  if (minDays <= 7) {
    return `🚨 URGENT: ${minDays} ${minDays === 1 ? 'day' : 'days'} left - Action required!`;
  } else if (minDays <= 14) {
    return `⚠️ ${minDays} days remaining - Don't delay!`;
  } else if (minDays <= 30) {
    return `📅 ${minDays} days left - Time to prepare`;
  } else {
    return `✅ TrackMyOPT Daily Update - ${minDays} days remaining`;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(data: EmailReminderData): string {
  const toolsHTML = data.tools.map(tool => {
    const bgColor = getUrgencyColor(tool.urgency);
    const textColor = getUrgencyTextColor(tool.urgency);
    const emoji = getUrgencyEmoji(tool.urgency);
    
    return `
      <div style="background: ${bgColor}; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 8px 0; color: ${textColor}; font-size: 18px; font-weight: 700;">
          ${emoji} ${tool.name}
        </h3>
        <div style="font-size: 36px; font-weight: 800; color: ${textColor}; margin: 12px 0;">
          ${tool.daysLeft} ${tool.daysLeft === 1 ? 'day' : 'days'} left
        </div>
        <div style="color: ${textColor}; opacity: 0.8; font-size: 14px; margin-bottom: 8px; font-weight: 500;">
          Deadline: ${tool.endDate}
        </div>
        <div style="color: ${textColor}; font-size: 15px; font-weight: 600; line-height: 1.5;">
          ${tool.message}
        </div>
      </div>
    `;
  }).join('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrackMyOPT Daily Reminder</title>
      <!--[if mso]>
      <style>
        table { border-collapse: collapse; }
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007AFF, #5856D6); border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);">
          <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
            TrackMyOPT
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 15px; font-weight: 500;">
            Your Daily OPT Reminder
          </p>
        </div>

        <!-- Greeting -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="margin: 0 0 12px 0; color: #1F2937; font-size: 22px; font-weight: 700;">
            Good morning, ${data.firstName}! 👋
          </h2>
          <p style="margin: 0; color: #6B7280; font-size: 15px; line-height: 1.6;">
            Here's your daily OPT timeline update for <strong>${currentDate}</strong>
          </p>
        </div>

        <!-- Tools/Countdowns -->
        ${toolsHTML}

        <!-- Call to Action -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px;">
            Track your progress and manage deadlines
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #007AFF, #5856D6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);">
            Open Dashboard →
          </a>
        </div>

        <!-- Tips Section -->
        <div style="background: linear-gradient(135deg, #10B981, #059669); border-radius: 12px; padding: 20px; margin-bottom: 20px; color: white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
          <div style="font-size: 20px; margin-bottom: 8px;">💡</div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">
            Quick Tip
          </h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; opacity: 0.95;">
            ${getRandomTip()}
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #F9FAFB; border-radius: 12px; padding: 24px; margin-top: 24px; text-align: center; border: 1px solid #E5E7EB;">
          <p style="margin: 0 0 12px 0; color: #6B7280; font-size: 13px; line-height: 1.6;">
            You're receiving this email because you're a <strong style="color: #007AFF;">TrackMyOPT Premium</strong> member with daily reminders enabled.
          </p>
          <p style="margin: 0 0 16px 0; color: #9CA3AF; font-size: 12px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #007AFF; text-decoration: none; font-weight: 500;">
              Manage email preferences
            </a>
            <span style="margin: 0 8px; color: #D1D5DB;">·</span>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #007AFF; text-decoration: none; font-weight: 500;">
              View Dashboard
            </a>
            <span style="margin: 0 8px; color: #D1D5DB;">·</span>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" style="color: #007AFF; text-decoration: none; font-weight: 500;">
              Get Help
            </a>
          </p>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 11px;">
              © ${new Date().getFullYear()} TrackMyOPT. All rights reserved.
            </p>
            <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
              Helping international students navigate OPT requirements
            </p>
          </div>
        </div>

        <!-- Anti-spam footer (required for compliance) -->
        <div style="margin-top: 16px; text-align: center;">
          <p style="margin: 0; color: #9CA3AF; font-size: 10px;">
            TrackMyOPT, Inc. | support@trackmyopt.com
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * Get background color based on urgency
 */
function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'safe':
      return '#D1FAE5'; // Light green
    case 'moderate':
      return '#DBEAFE'; // Light blue
    case 'urgent':
      return '#FED7AA'; // Light orange
    case 'critical':
      return '#FEE2E2'; // Light red
    default:
      return '#F3F4F6';
  }
}

/**
 * Get text color based on urgency
 */
function getUrgencyTextColor(urgency: string): string {
  switch (urgency) {
    case 'safe':
      return '#065F46'; // Dark green
    case 'moderate':
      return '#1E40AF'; // Dark blue
    case 'urgent':
      return '#C2410C'; // Dark orange
    case 'critical':
      return '#991B1B'; // Dark red
    default:
      return '#1F2937';
  }
}

/**
 * Get emoji based on urgency
 */
function getUrgencyEmoji(urgency: string): string {
  switch (urgency) {
    case 'safe':
      return '✅';
    case 'moderate':
      return '📅';
    case 'urgent':
      return '⚠️';
    case 'critical':
      return '🚨';
    default:
      return '📋';
  }
}

/**
 * Get random helpful tip for the email
 */
function getRandomTip(): string {
  const tips = [
    'Always keep digital copies of all your immigration documents in a secure cloud storage.',
    'Schedule reminders 2 weeks before any deadline to avoid last-minute rushes.',
    'Consult with your DSO before making any decisions about your OPT or STEM OPT.',
    'USCIS processing times can vary. Apply as early as possible within your filing window.',
    'Keep your SEVIS information up to date and report any changes within 10 days.',
    'Make copies of all forms before mailing. Send with tracking to confirm delivery.',
    'Save all receipts and confirmation emails from USCIS for your records.',
    'Join OPT communities online to stay informed about processing times and updates.',
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Send OTP email for data export verification
 */
export async function sendExportOtpEmail(
  email: string,
  otp: string,
  firstName?: string
) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'TrackMyOPT'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: 'Your Data Export Verification Code - TrackMyOPT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">TrackMyOPT</h1>
            </div>
            <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px;">
                Data Export Verification
              </h2>
              <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 15px;">
                ${firstName ? `Hi ${firstName}, ` : ''}You requested to export your data. Use this code to verify your identity:
              </p>
              <div style="background: #F9FAFB; border: 2px solid #E5E7EB; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1F2937; font-family: monospace;">${otp}</span>
              </div>
              <p style="margin: 24px 0 0 0; color: #9CA3AF; font-size: 13px; text-align: center;">
                This code expires in 10 minutes. If you didn't request this, please ignore this email.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} TrackMyOPT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Export OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Export OTP email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send verification email for email address confirmation
 */
export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  firstName: string
) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'TrackMyOPT'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: 'Verify your email for TrackMyOPT reminders',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="margin: 0 0 16px 0; color: #1F2937; font-size: 24px;">
                Verify Your Email
              </h1>
              <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 15px;">
                Hi ${firstName}, click the button below to verify your email and start receiving daily OPT reminders.
              </p>
              <a href="${verificationLink}" 
                 style="display: inline-block; background: #007AFF; color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                Verify Email Address
              </a>
              <p style="margin: 24px 0 0 0; color: #9CA3AF; font-size: 13px;">
                This link expires in 24 hours.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Verification email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send enrollment confirmation email when user enables daily reminders
 */
export async function sendEnrollmentEmail(
  email: string,
  firstName: string,
  toolName: string
) {
  try {
    const toolDescriptions: Record<string, { title: string; description: string; icon: string }> = {
      'opt-apply': {
        title: 'OPT Application Reminders',
        description: 'You\'ll receive daily reminders about your OPT filing window, including document preparation, DSO appointments, and submission deadlines.',
        icon: '📋'
      },
      'opt-clock': {
        title: 'OPT Unemployment Clock',
        description: 'Track your 90-day unemployment limit with daily updates on remaining days and job search tips.',
        icon: '⏰'
      },
      'stem-apply': {
        title: 'STEM OPT Extension Reminders',
        description: 'Get daily reminders for your STEM OPT application timeline, including Form I-983 preparation and filing deadlines.',
        icon: '🔬'
      },
      'stem-clock': {
        title: 'STEM Unemployment Clock',
        description: 'Monitor your 150-day aggregate unemployment limit during STEM OPT with daily countdown updates.',
        icon: '⏱️'
      },
      'documents': {
        title: 'Document Expiry Reminders',
        description: 'Get notified before your important documents expire. We\'ll send you reminders based on the schedule you set for each document.',
        icon: '📄'
      },
      'case-status': {
        title: 'Case Status Alerts',
        description: 'Receive instant notifications when your USCIS case status changes. We check your case every 6 hours and alert you of any updates.',
        icon: '🔔'
      },
    };

    const tool = toolDescriptions[toolName] || {
      title: 'OPT Daily Reminders',
      description: 'You\'ll receive daily reminder emails to help you stay on track with your OPT timeline.',
      icon: '📧'
    };

    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'TrackMyOPT'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: `✅ You're enrolled: ${tool.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">${tool.icon}</div>
              <h1 style="margin: 16px 0 0 0; color: #1F2937; font-size: 28px;">
                You're All Set!
              </h1>
            </div>

            <!-- Main Card -->
            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Hi ${firstName || 'there'},
              </p>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                You've successfully enrolled in <strong>${tool.title}</strong>! 
              </p>

              <div style="background: linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.6;">
                  ${tool.description}
                </p>
              </div>

              <h3 style="margin: 24px 0 16px 0; color: #1F2937; font-size: 16px;">
                📬 What to Expect:
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 15px; line-height: 1.8;">
                <li>Daily emails at <strong>9:00 AM ET</strong></li>
                <li>Timeline-specific action items</li>
                <li>Urgency alerts as deadlines approach</li>
                <li>Step-by-step guidance for applications</li>
              </ul>

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
                <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">
                  <strong>Got a job or completed your application?</strong>
                </p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  Simply visit your <a href="https://www.trackmyopt.com/dashboard/settings" style="color: #007AFF; text-decoration: none;">Settings</a> to stop receiving these reminders.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
              <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 13px;">
                TrackMyOPT - Your OPT Timeline Companion
              </p>
              <a href="https://www.trackmyopt.com/dashboard" 
                 style="color: #007AFF; text-decoration: none; font-size: 14px; font-weight: 500;">
                Go to Dashboard →
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Enrollment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Enrollment email service error:', error);
    return { success: false, error };
  }
}

