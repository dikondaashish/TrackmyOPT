/**
 * Email Service v2 - Simplified for better deliverability
 * 
 * Changes from v1:
 * - Removed excessive emojis (spam trigger)
 * - Simplified HTML structure
 * - Reduced external links
 * - Removed promotional language
 * - Added proper transactional email headers
 */

import nodemailer from 'nodemailer';

// Create SMTP transporter for Hostinger
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  pool: true,
  maxConnections: 3,
  maxMessages: 10,
  tls: {
    rejectUnauthorized: false,
  },
});

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send email with retry logic and proper headers
 */
async function sendMailWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  maxRetries: number = 3
): Promise<nodemailer.SentMessageInfo> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transport = getTransporter();
      const info = await transport.sendMail(mailOptions);
      return info;
    } catch (error) {
      lastError = error as Error;
      console.error(`Email attempt ${attempt}/${maxRetries} failed:`, (error as Error).message);
      
      if ((error as Error).message?.includes('timeout') || (error as Error).message?.includes('421')) {
        console.log('Recreating transporter due to timeout...');
        if (transporter) {
          transporter.close();
          transporter = null;
        }
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to send email after retries');
}

export interface ToolReminderDetail {
  name: string;
  toolType: 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
  daysLeft: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  urgency: 'safe' | 'moderate' | 'urgent' | 'critical';
  message: string;
  optType?: 'Pre-Completion OPT' | 'Post-Completion OPT';
  programEndDate?: string;
}

export interface EmailReminderData {
  userId: string;
  userEmail: string;
  firstName: string;
  tools: ToolReminderDetail[];
}

/**
 * Send daily reminder email - simplified version
 */
export async function sendDailyReminder(data: EmailReminderData) {
  try {
    const minDays = Math.min(...data.tools.map(t => t.daysLeft));
    
    const info = await sendMailWithRetry({
      from: `TrackMyOPT <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: data.userEmail,
      subject: `OPT Status Update - ${minDays} days remaining`,
      html: generateSimpleEmailHTML(data),
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'TrackMyOPT',
        'List-Unsubscribe': `<https://www.trackmyopt.com/dashboard/settings?tab=notifications>`,
        'Precedence': 'bulk',
      },
    });

    console.log('Daily reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Daily reminder email service error:', error);
    return { success: false, error };
  }
}

/**
 * Generate simplified HTML email - cleaner, less spam-triggering
 */
function generateSimpleEmailHTML(data: EmailReminderData): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const toolSections = data.tools.map(tool => generateSimpleToolSection(tool)).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OPT Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background-color: #1a1a2e; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
        TrackMyOPT
      </h1>
      <p style="margin: 8px 0 0 0; color: #a0a0a0; font-size: 13px;">
        Your OPT Timeline Assistant
      </p>
    </div>

    <!-- Main Content -->
    <div style="background-color: #ffffff; padding: 24px;">
      
      <!-- Greeting -->
      <p style="margin: 0 0 4px 0; color: #666666; font-size: 13px;">
        ${currentDate}
      </p>
      <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 18px; font-weight: 600;">
        Hello ${data.firstName},
      </h2>

      <p style="margin: 0 0 20px 0; color: #444444; font-size: 14px; line-height: 1.6;">
        Here is your daily OPT status update. Please review the information below and take any necessary actions.
      </p>

      ${toolSections}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #eeeeee;">
        <a href="https://www.trackmyopt.com/dashboard" 
           style="display: inline-block; background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 500; font-size: 14px;">
          View Dashboard
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f0f0f0; border-radius: 0 0 8px 8px; padding: 20px; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px;">
        <a href="https://www.trackmyopt.com/dashboard/settings?tab=notifications" style="color: #1a1a2e; text-decoration: underline;">
          Manage email preferences
        </a>
      </p>
      <p style="margin: 0; color: #999999; font-size: 11px;">
        Zyene, Inc. | support@trackmyopt.com
      </p>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Generate simplified tool section
 */
function generateSimpleToolSection(tool: ToolReminderDetail): string {
  const daysUsed = tool.totalDays - tool.daysLeft;
  const progressPercent = Math.round((daysUsed / tool.totalDays) * 100);
  
  // Determine status color based on urgency
  let statusColor = '#10b981'; // green
  let statusText = 'On Track';
  
  if (tool.urgency === 'critical') {
    statusColor = '#dc2626';
    statusText = 'Action Needed';
  } else if (tool.urgency === 'urgent') {
    statusColor = '#f59e0b';
    statusText = 'Attention Required';
  } else if (tool.urgency === 'moderate') {
    statusColor = '#3b82f6';
    statusText = 'In Progress';
  }

  const toolName = getToolDisplayName(tool.toolType);

  return `
    <div style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
      
      <!-- Tool Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: #1a1a2e; font-size: 16px; font-weight: 600;">
          ${toolName}
        </h3>
        <span style="background-color: ${statusColor}; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 500;">
          ${statusText}
        </span>
      </div>

      <!-- Key Metrics -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="padding: 6px 0; color: #666666; font-size: 13px;">Days Remaining</td>
          <td style="padding: 6px 0; color: ${statusColor}; font-size: 14px; font-weight: 600; text-align: right;">${tool.daysLeft}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #666666; font-size: 13px;">Days Used</td>
          <td style="padding: 6px 0; color: #333333; font-size: 14px; text-align: right;">${daysUsed} of ${tool.totalDays}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #666666; font-size: 13px;">Progress</td>
          <td style="padding: 6px 0; color: #333333; font-size: 14px; text-align: right;">${progressPercent}%</td>
        </tr>
        ${tool.endDate ? `
        <tr>
          <td style="padding: 6px 0; color: #666666; font-size: 13px;">End Date</td>
          <td style="padding: 6px 0; color: #333333; font-size: 14px; text-align: right;">${tool.endDate}</td>
        </tr>
        ` : ''}
      </table>

      <!-- Progress Bar -->
      <div style="background-color: #e5e5e5; border-radius: 4px; height: 6px; overflow: hidden;">
        <div style="background-color: ${statusColor}; width: ${progressPercent}%; height: 100%;"></div>
      </div>

      <!-- Action Message -->
      ${tool.message ? `
      <p style="margin: 12px 0 0 0; color: #444444; font-size: 13px; line-height: 1.5;">
        ${tool.message}
      </p>
      ` : ''}

    </div>
  `;
}

/**
 * Get display name for tool type
 */
function getToolDisplayName(toolType: string): string {
  switch (toolType) {
    case 'opt-apply':
      return 'OPT Application Timeline';
    case 'opt-clock':
      return 'OPT Unemployment Tracker';
    case 'stem-apply':
      return 'STEM OPT Application';
    case 'stem-clock':
      return 'STEM OPT Unemployment Tracker';
    default:
      return 'OPT Status';
  }
}

// Export case status notification functions
export async function sendCaseStatusNotification(
  userEmail: string,
  firstName: string,
  receiptNumber: string,
  oldStatus: string,
  newStatus: string
) {
  try {
    const info = await sendMailWithRetry({
      from: `TrackMyOPT <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: userEmail,
      subject: `Case Status Update: ${receiptNumber}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background-color: #1a1a2e; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">TrackMyOPT</h1>
    </div>

    <div style="background-color: #ffffff; padding: 24px;">
      <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 18px;">Hello ${firstName},</h2>
      
      <p style="margin: 0 0 16px 0; color: #444444; font-size: 14px; line-height: 1.6;">
        Your USCIS case status has been updated.
      </p>

      <div style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px;">Receipt Number</p>
        <p style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 15px; font-weight: 600; font-family: monospace;">${receiptNumber}</p>
        
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px;">Previous Status</p>
        <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px;">${oldStatus || 'Unknown'}</p>
        
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px;">New Status</p>
        <p style="margin: 0; color: #10b981; font-size: 15px; font-weight: 600;">${newStatus}</p>
      </div>

      <div style="text-align: center;">
        <a href="https://www.trackmyopt.com/dashboard/case-status" 
           style="display: inline-block; background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 500; font-size: 14px;">
          View Full Details
        </a>
      </div>
    </div>

    <div style="background-color: #f0f0f0; border-radius: 0 0 8px 8px; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #999999; font-size: 11px;">Zyene, Inc. | support@trackmyopt.com</p>
    </div>

  </div>
</body>
</html>`,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'TrackMyOPT',
        'List-Unsubscribe': `<https://www.trackmyopt.com/dashboard/settings?tab=notifications>`,
      },
    });

    console.log('Case status notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Case status notification error:', error);
    return { success: false, error };
  }
}

// Export document reminder function
export async function sendDocumentReminder(
  userEmail: string,
  firstName: string,
  documentName: string,
  expiryDate: string,
  daysUntilExpiry: number
) {
  try {
    const info = await sendMailWithRetry({
      from: `TrackMyOPT <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: userEmail,
      subject: `Document Expiring: ${documentName}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background-color: #1a1a2e; border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">TrackMyOPT</h1>
    </div>

    <div style="background-color: #ffffff; padding: 24px;">
      <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 18px;">Hello ${firstName},</h2>
      
      <p style="margin: 0 0 16px 0; color: #444444; font-size: 14px; line-height: 1.6;">
        Your document is expiring soon. Please take action to renew or update it.
      </p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px;">Document</p>
        <p style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 15px; font-weight: 600;">${documentName}</p>
        
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px;">Expiry Date</p>
        <p style="margin: 0 0 16px 0; color: #dc2626; font-size: 15px; font-weight: 600;">${expiryDate}</p>
        
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px;">Days Remaining</p>
        <p style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 700;">${daysUntilExpiry} days</p>
      </div>

      <div style="text-align: center;">
        <a href="https://www.trackmyopt.com/dashboard/documents" 
           style="display: inline-block; background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 500; font-size: 14px;">
          Manage Documents
        </a>
      </div>
    </div>

    <div style="background-color: #f0f0f0; border-radius: 0 0 8px 8px; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #999999; font-size: 11px;">Zyene, Inc. | support@trackmyopt.com</p>
    </div>

  </div>
</body>
</html>`,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'TrackMyOPT',
        'List-Unsubscribe': `<https://www.trackmyopt.com/dashboard/settings?tab=notifications>`,
      },
    });

    console.log('Document reminder sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Document reminder error:', error);
    return { success: false, error };
  }
}
