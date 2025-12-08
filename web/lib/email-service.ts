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
    return `✅ OPT Daily Update - ${minDays} days remaining`;
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
      <title>OPT Daily Reminder</title>
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
            OPT<span style="color: #FFD60A;">Clock</span>Tracker
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
            You're receiving this email because you're a <strong style="color: #007AFF;">Premium</strong> member with daily reminders enabled.
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
              © ${new Date().getFullYear()} Zyene, Inc. All rights reserved.
            </p>
            <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
              Helping international students navigate OPT requirements
            </p>
          </div>
        </div>

        <!-- Anti-spam footer (required for compliance) -->
        <div style="margin-top: 16px; text-align: center;">
          <p style="margin: 0; color: #9CA3AF; font-size: 10px;">
            Zyene, Inc. | support@trackmyopt.com
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
              <h1 style="color: white; margin: 0; font-size: 28px;">OPT<span style="color: #FFD60A;">Clock</span>Tracker</h1>
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
              <p style="margin: 0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
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
      subject: 'Verify your email for OPT reminders',
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
            <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Zyene, Inc. All rights reserved.</p>
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
                Zyene, Inc. - Your OPT Timeline Companion
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

// ============================================================================
// OPT APPLY - COMPREHENSIVE DAILY REMINDER EMAIL
// ============================================================================

export interface OptApplyEmailData {
  userEmail: string;
  firstName: string;
  optType: 'Regular OPT' | 'Post-Completion OPT';
  programEndDate: Date;
  earliestFilingDate: Date;
  filingDeadline: Date;
  daysRemaining: number;
  totalWindowDays: number;
}

/**
 * Send comprehensive OPT Apply daily reminder email
 */
export async function sendOptApplyReminder(data: OptApplyEmailData) {
  try {
    const { urgencyLevel, headerColor, badgeColor, headerEmoji } = getOptApplyUrgency(data.daysRemaining, data.totalWindowDays);
    
    const info = await transporter.sendMail({
      from: `Zyene Inc <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: data.userEmail,
      subject: getOptApplySubject(data.daysRemaining, urgencyLevel),
      html: generateOptApplyEmailHTML(data, urgencyLevel, headerColor, badgeColor, headerEmoji),
    });

    console.log('OPT Apply reminder sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('OPT Apply email error:', error);
    return { success: false, error };
  }
}

function getOptApplyUrgency(daysLeft: number, totalDays: number): {
  urgencyLevel: 'relaxed' | 'planning' | 'active' | 'urgent' | 'critical';
  headerColor: string;
  badgeColor: string;
  headerEmoji: string;
} {
  const percentage = (daysLeft / totalDays) * 100;
  
  if (percentage > 80) {
    return { urgencyLevel: 'relaxed', headerColor: '#059669', badgeColor: '#10B981', headerEmoji: '🎉' };
  } else if (percentage > 60) {
    return { urgencyLevel: 'planning', headerColor: '#0284C7', badgeColor: '#0EA5E9', headerEmoji: '📋' };
  } else if (percentage > 40) {
    return { urgencyLevel: 'active', headerColor: '#D97706', badgeColor: '#F59E0B', headerEmoji: '📝' };
  } else if (percentage > 20) {
    return { urgencyLevel: 'urgent', headerColor: '#EA580C', badgeColor: '#F97316', headerEmoji: '⚠️' };
  } else {
    return { urgencyLevel: 'critical', headerColor: '#DC2626', badgeColor: '#EF4444', headerEmoji: '🚨' };
  }
}

function getOptApplySubject(daysLeft: number, urgency: string): string {
  switch (urgency) {
    case 'relaxed':
      return `🎉 Your Regular OPT Timeline Has Started! ${daysLeft} Days to Apply`;
    case 'planning':
      return `📋 OPT Application Reminder: ${daysLeft} Days Remaining`;
    case 'active':
      return `📝 Time to Submit OPT Application - ${daysLeft} Days Left`;
    case 'urgent':
      return `⚠️ URGENT: Only ${daysLeft} Days to Submit OPT Application!`;
    case 'critical':
      return `🚨 CRITICAL: ${daysLeft} Days Left - Submit OPT Application NOW!`;
    default:
      return `OPT Application Reminder - ${daysLeft} Days Remaining`;
  }
}

function generateOptApplyEmailHTML(
  data: OptApplyEmailData,
  urgencyLevel: string,
  headerColor: string,
  badgeColor: string,
  headerEmoji: string
): string {
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const today = new Date();
  const daysToDeadline = data.daysRemaining;
  const progressPercentage = Math.round(((data.totalWindowDays - daysToDeadline) / data.totalWindowDays) * 100);

  // Generate timeline-based instructions
  const instructions = getOptApplyInstructions(daysToDeadline, data.programEndDate);
  const importantReminders = getOptApplyReminders(daysToDeadline);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OPT Application Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 640px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">${headerEmoji}</div>
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">
            ${urgencyLevel === 'relaxed' ? 'Congratulations!' : urgencyLevel === 'critical' ? 'Urgent Action Required!' : 'OPT Application Reminder'}
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
            ${urgencyLevel === 'relaxed' ? 'Your OPT timeline has officially started!' : `${daysToDeadline} days remaining to apply`}
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 32px 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Greeting -->
          <p style="margin: 0 0 24px 0; color: #1F2937; font-size: 17px; line-height: 1.6;">
            Hi <strong>${data.firstName}</strong>,
            ${urgencyLevel === 'relaxed' 
              ? `<br><br>Great news! Your Regular OPT application window is now open. This is an exciting step in your career journey in the United States!`
              : urgencyLevel === 'critical'
              ? `<br><br>This is an urgent reminder about your OPT application. You have very limited time remaining - please take action immediately!`
              : `<br><br>Here's your daily OPT application status update. Stay on track with the steps below.`
            }
          </p>

          <!-- OPT Details Card -->
          <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #BAE6FD;">
            <h2 style="margin: 0 0 20px 0; color: #0369A1; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
              📊 Your OPT Details
            </h2>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding: 8px 0; color: #64748B; width: 50%;">OPT Type:</td>
                <td style="padding: 8px 0; color: #0F172A; font-weight: 600;">${data.optType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; border-top: 1px solid #E0F2FE;">Program End Date:</td>
                <td style="padding: 8px 0; color: #0F172A; font-weight: 600; border-top: 1px solid #E0F2FE;">${formatDate(data.programEndDate)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; border-top: 1px solid #E0F2FE;">Earliest Filing Date:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: 600; border-top: 1px solid #E0F2FE;">${formatDate(data.earliestFilingDate)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; border-top: 1px solid #E0F2FE;">Filing Deadline:</td>
                <td style="padding: 8px 0; color: #DC2626; font-weight: 600; border-top: 1px solid #E0F2FE;">${formatDate(data.filingDeadline)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; border-top: 1px solid #E0F2FE;">Total Application Window:</td>
                <td style="padding: 8px 0; color: #0F172A; font-weight: 600; border-top: 1px solid #E0F2FE;">${data.totalWindowDays} days</td>
              </tr>
            </table>
          </div>

          <!-- Days Remaining Counter -->
          <div style="background: ${badgeColor}15; border: 2px solid ${badgeColor}; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #64748B; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Days Remaining to Apply</p>
            <div style="font-size: 56px; font-weight: 800; color: ${headerColor}; line-height: 1;">${daysToDeadline}</div>
            <p style="margin: 12px 0 0 0; color: #64748B; font-size: 14px;">out of ${data.totalWindowDays} days total</p>
            
            <!-- Progress Bar -->
            <div style="margin-top: 16px; background: #E5E7EB; border-radius: 10px; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, ${badgeColor}, ${headerColor}); width: ${progressPercentage}%; height: 100%; border-radius: 10px;"></div>
            </div>
            <p style="margin: 8px 0 0 0; color: #64748B; font-size: 12px;">${progressPercentage}% of application window used</p>
          </div>

          <!-- What To Do Now Section -->
          <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 0 12px 12px 0; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #92400E; font-size: 18px; font-weight: 700;">
              📌 What To Do Now
            </h3>
            <ol style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 15px; line-height: 2;">
              ${instructions.map(step => `<li style="margin-bottom: 4px;">${step}</li>`).join('')}
            </ol>
          </div>

          <!-- Important Reminders -->
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 0 12px 12px 0; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #991B1B; font-size: 18px; font-weight: 700;">
              ⚠️ Important Reminders
            </h3>
            <ul style="margin: 0; padding: 0 0 0 20px; color: #7F1D1D; font-size: 15px; line-height: 1.8;">
              ${importantReminders.map(reminder => `<li style="margin-bottom: 8px;">${reminder}</li>`).join('')}
            </ul>
          </div>

          <!-- SEVP Portal Link -->
          <div style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <h3 style="margin: 0 0 12px 0; color: #5B21B6; font-size: 16px; font-weight: 700;">
              🔗 SEVP Portal
            </h3>
            <p style="margin: 0 0 16px 0; color: #6D28D9; font-size: 14px;">
              Access the official Student and Exchange Visitor Program portal
            </p>
            <a href="https://studyinthestates.dhs.gov/students" 
               style="display: inline-block; background: #7C3AED; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Visit SEVP Portal →
            </a>
          </div>

          <!-- Daily Reminder Notice -->
          <div style="background: #F0FDF4; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
              📧 <strong>We'll send you daily reminders</strong> to help you stay on track with your OPT application timeline.
            </p>
          </div>

          <!-- Closing -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #E5E7EB;">
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
              Best of luck with your OPT application! 🍀
            </p>
            <p style="margin: 0; color: #374151; font-size: 15px;">
              Best regards,<br>
              <strong style="color: #0EA5E9;">OPT Clock Tracker</strong><br>
              <span style="color: #6B7280; font-size: 13px;">by Zyene, Inc.</span>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px; margin-top: 16px;">
          <p style="margin: 0 0 12px 0; color: #6B7280; font-size: 13px;">
            Questions? Contact us at <a href="mailto:support@trackmyopt.com" style="color: #0EA5E9; text-decoration: none;">support@trackmyopt.com</a>
          </p>
          <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 13px;">
            <a href="https://www.trackmyopt.com/dashboard/settings#notifications" 
               style="color: #0EA5E9; text-decoration: none; font-weight: 500;">
              Manage Email Preferences
            </a>
            <span style="color: #D1D5DB; margin: 0 8px;">•</span>
            <a href="https://www.trackmyopt.com/dashboard" 
               style="color: #0EA5E9; text-decoration: none; font-weight: 500;">
              View Dashboard
            </a>
          </p>
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} Zyene, Inc. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * Get timeline-based instructions for OPT Apply
 */
function getOptApplyInstructions(daysLeft: number, programEndDate: Date): string[] {
  const today = new Date();
  const daysToProgEnd = Math.ceil((programEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Before program ends - still in school
  if (daysToProgEnd > 60) {
    return [
      '<strong>Request official transcripts</strong> from your university registrar',
      '<strong>Gather all required documents:</strong> passport, I-94, all I-20s, 2 passport photos (2x2 inches)',
      'Review Form I-765 instructions on the USCIS website',
      'Schedule a meeting with your DSO to discuss the OPT process',
      'Start researching employers and job opportunities in your field'
    ];
  } else if (daysToProgEnd > 45) {
    return [
      '<strong>Begin filling out Form I-765</strong> - take your time and double-check every entry',
      'Complete any missing sections of your I-765 carefully',
      'Organize your documents in a folder (originals and copies)',
      'Schedule your DSO appointment for I-20 OPT recommendation',
      'Get your passport photos taken if you haven\'t already'
    ];
  } else if (daysToProgEnd > 30) {
    return [
      '<strong>Meet with your DSO</strong> to get OPT recommendation on your I-20',
      'Review your completed I-765 one final time for errors',
      'Make photocopies of ALL documents before mailing',
      'Prepare your application package with correct filing fee',
      'Research USCIS processing times for your service center'
    ];
  } else if (daysToProgEnd > 14) {
    return [
      '<strong>Finalize your application package</strong> - double-check all documents',
      'Verify you have the correct USCIS filing fee (check for updates)',
      'Get passport photos if not done yet (2 identical, 2x2 inches)',
      'Prepare mailing envelope with USPS tracking',
      'Consider your preferred OPT start date (within 60 days after program end)'
    ];
  } else if (daysToProgEnd > 0) {
    return [
      '<strong>Submit your OPT application TODAY if possible!</strong>',
      'Mail via USPS with tracking number',
      'Save your tracking number and check delivery status',
      'Expect receipt notice (I-797C) within 2-3 weeks',
      'Do NOT travel internationally until you receive your EAD card'
    ];
  }
  
  // After program ends - counting down to 60-day deadline
  if (daysLeft > 45) {
    return [
      '<strong>Your program has ended - submit OPT application ASAP</strong>',
      'If not already submitted, mail your application this week',
      'Use USPS Priority Mail with tracking',
      'Monitor tracking until confirmed delivered',
      'Save all confirmation and tracking information'
    ];
  } else if (daysLeft > 30) {
    return [
      '<strong>URGENT: Submit your application within the next few days!</strong>',
      'Processing takes 3-5 months - don\'t wait any longer',
      'Double-check your application package is complete',
      'Mail with express tracking and signature confirmation',
      'Contact your DSO if you need any last-minute help'
    ];
  } else if (daysLeft > 14) {
    return [
      '<strong>CRITICAL: You must submit your application immediately!</strong>',
      'This week is your last safe window to apply',
      'Use overnight mail with tracking',
      'Verify all documents are included before sealing',
      'Contact your DSO today if you have any issues'
    ];
  } else if (daysLeft > 7) {
    return [
      '<strong>EMERGENCY: Only ${daysLeft} days left to apply!</strong>',
      'Submit your application TODAY',
      'Use overnight express mail',
      'Contact your DSO immediately for assistance',
      'Missing this deadline means losing OPT eligibility'
    ];
  } else {
    return [
      '<strong>FINAL DAYS: Submit immediately or lose OPT eligibility!</strong>',
      'Mail your application TODAY using overnight express',
      'Contact your DSO right now if you need help',
      'Every hour counts at this point',
      'Consider visiting USCIS lockbox in person if possible'
    ];
  }
}

/**
 * Get important reminders based on timeline
 */
function getOptApplyReminders(daysLeft: number): string[] {
  const baseReminders = [
    'USCIS processing time is typically <strong>3-5 months</strong>',
    'You <strong>cannot work</strong> until you receive your EAD card',
    'Do <strong>NOT travel internationally</strong> while your OPT is pending',
    'Keep your address updated with USCIS through AR-11 form'
  ];
  
  if (daysLeft <= 30) {
    return [
      '<strong>Missing the deadline = losing your OPT eligibility entirely</strong>',
      'You cannot apply for OPT after the 60-day grace period ends',
      ...baseReminders
    ];
  } else if (daysLeft <= 60) {
    return [
      'Early submission gives you a buffer for any delivery issues',
      'USCIS accepts applications as soon as your filing window opens',
      ...baseReminders
    ];
  }
  
  return [
    'Start your job search early - many employers have long hiring processes',
    'Network on LinkedIn and attend career fairs at your university',
    ...baseReminders
  ];
}

