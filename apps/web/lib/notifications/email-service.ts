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

// Create SMTP transporter for Hostinger with improved timeout settings
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Connection settings to prevent timeout issues
  connectionTimeout: 30000, // 30 seconds to establish connection
  greetingTimeout: 30000, // 30 seconds for greeting
  socketTimeout: 60000, // 60 seconds for socket operations
  // Pool settings for multiple emails
  pool: true,
  maxConnections: 3,
  maxMessages: 10,
  // TLS settings
  tls: {
    rejectUnauthorized: false, // Allow self-signed certs if needed
  },
});

// Lazy initialization of transporter
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send email with retry logic
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

      // If it's a timeout error, close and recreate the transporter
      if ((error as Error).message?.includes('timeout') || (error as Error).message?.includes('421')) {
        console.log('Recreating transporter due to timeout...');
        if (transporter) {
          transporter.close();
          transporter = null;
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Waiting ${delay}ms before retry...`);
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
  // OPT specific fields
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
 * Send daily reminder email to a user
 */
export async function sendDailyReminder(data: EmailReminderData) {
  try {
    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'TrackMyOPT'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: data.userEmail,
      subject: getDynamicSubject(data.tools),
      html: generateEmailHTML(data),
    });

    console.log('Daily reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Daily reminder email service error:', error);
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
 * Generate HTML email content - comprehensive professional template
 */
function generateEmailHTML(data: EmailReminderData): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate tool-specific sections
  const toolSectionsHTML = data.tools.map(tool => generateToolSection(tool)).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OPT Daily Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
      <div style="max-width: 640px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007AFF, #5856D6); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">
            OPT<span style="color: #FFD60A;">Clock</span>Tracker
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            Your <strong>OPT</strong> Timeline Assistant
          </p>
        </div>

        <!-- Main Content Container -->
        <div style="background: white; border-radius: 0 0 16px 16px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Greeting Section -->
          <div style="padding: 28px 28px 20px 28px; border-bottom: 1px solid #E5E7EB;">
            <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 14px;">
              ${currentDate}
            </p>
            <h2 style="margin: 0; color: #1F2937; font-size: 22px; font-weight: 700;">
              Hi ${data.firstName}! 👋
            </h2>
          </div>

          <!-- Tool Sections -->
          ${toolSectionsHTML}

          <!-- Daily Reminder Note -->
          <div style="padding: 20px 28px; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-top: 1px solid #C7D2FE;">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 12px;">📬</span>
              <div>
                <p style="margin: 0 0 4px 0; color: #4338CA; font-size: 14px; font-weight: 600;">
                  Daily Reminders Active
                </p>
                <p style="margin: 0; color: #6366F1; font-size: 13px; line-height: 1.5;">
                  We'll send you daily updates at 9:00 AM ET to help you stay on track. Best of luck with your OPT application and job search! 🍀
                </p>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="padding: 24px 28px; text-align: center; border-top: 1px solid #E5E7EB;">
            <a href="https://www.trackmyopt.com/dashboard/opt-tools/opt-apply" 
               style="display: inline-block; background: linear-gradient(135deg, #007AFF, #5856D6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);">
              Update OPT Portal →
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; color: #6B7280; font-size: 12px;">
            Want to stop these emails? 
            <a href="https://www.trackmyopt.com/dashboard/settings?tab=notifications" style="color: #007AFF; text-decoration: none; font-weight: 500;">
              Manage Email Preferences
            </a>
          </p>
          <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 11px;">
            Best regards,<br/>
            <strong>OPT Clock Tracker Team</strong>
          </p>
          <p style="margin: 0; color: #D1D5DB; font-size: 10px;">
            © ${new Date().getFullYear()} Zyene, Inc. | support@trackmyopt.com
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * Generate detailed section for each tool type
 */
function generateToolSection(tool: ToolReminderDetail): string {
  if (tool.toolType === 'opt-apply') {
    return generateOptApplySection(tool);
  } else if (tool.toolType === 'opt-clock') {
    return generateOptClockSection(tool);
  } else if (tool.toolType === 'stem-apply') {
    return generateStemApplySection(tool);
  } else if (tool.toolType === 'stem-clock') {
    return generateStemClockSection(tool);
  }
  return '';
}

/**
 * Generate comprehensive OPT Apply email section
 */
function generateOptApplySection(tool: ToolReminderDetail): string {
  const urgencyConfig = getUrgencyConfig(tool.daysLeft, tool.totalDays);
  const actionItems = getOptApplyActionItems(tool.daysLeft, tool.totalDays);
  const daysUsed = tool.totalDays - tool.daysLeft;
  const progressPercent = Math.round((daysUsed / tool.totalDays) * 100);
  const today = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  // Get urgency-based motivational message
  const percentRemaining = (tool.daysLeft / tool.totalDays) * 100;
  let motivationalMessage = 'You have plenty of time! Apply early to get in the queue first and receive faster processing.';
  if (percentRemaining <= 25) {
    motivationalMessage = 'Time is critical! Submit your application TODAY to avoid losing your OPT opportunity.';
  } else if (percentRemaining <= 50) {
    motivationalMessage = 'Don\'t delay! Early applicants typically receive faster processing and approvals.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          📋 OPT Application Dates
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          Track Your OPT Filing Window
        </p>
      </div>

      <!-- Application Status Section -->
      <div style="background: ${urgencyConfig.actionBg}; border: 1px solid ${urgencyConfig.actionBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          ${urgencyConfig.emoji} Your Application Status:
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Time Remaining:</td>
            <td style="padding: 8px 0; color: ${urgencyConfig.daysColor}; font-size: 14px; font-weight: 700; text-align: right;">${tool.daysLeft} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Days Elapsed:</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${daysUsed} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Filing Window Used:</td>
            <td style="padding: 8px 0; color: ${urgencyConfig.daysColor}; font-size: 14px; font-weight: 700; text-align: right;">${progressPercent}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Apply Start Date:</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${tool.startDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Filing Deadline:</td>
            <td style="padding: 8px 0; color: #DC2626; font-size: 14px; font-weight: 700; text-align: right;">${tool.endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Program End Date:</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${tool.programEndDate || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Today (ET):</td>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; text-align: right;">${today}</td>
          </tr>
        </table>
        
        <!-- Progress Bar -->
        <div style="margin-top: 16px;">
          <div style="background: #E5E7EB; border-radius: 10px; height: 10px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, ${urgencyConfig.progressColor}); width: ${progressPercent}%; height: 100%; border-radius: 10px;"></div>
          </div>
        </div>
      </div>

      <!-- What to Do Now -->
      <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 600;">
          ✅ ${urgencyConfig.actionHeadline}
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          ${actionItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <!-- Required Documents Checklist -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          📄 Required Documents Checklist:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>☐ <strong>Form I-765</strong> - Application for Employment Authorization (completed & signed)</li>
          <li>☐ <strong>Form I-20</strong> - with OPT recommendation from DSO (<strong>must be signed by you!</strong>)</li>
          <li>☐ <strong>2 Passport Photos</strong> - 2x2 inches, white background, taken within 30 days</li>
          <li>☐ <strong>Passport Copy</strong> - Bio page and visa stamp</li>
          <li>☐ <strong>I-94</strong> - Most recent arrival/departure record</li>
          <li>☐ <strong>Previous EAD Cards</strong> - If any (copies)</li>
          <li>☐ <strong>Filing Fee</strong> - $470 (online) or $520 (paper filing)</li>
        </ul>
      </div>

      <!-- Common Mistakes to Avoid -->
      <div style="background: #FEF2F2; border: 2px solid #DC2626; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #991B1B; font-size: 16px; font-weight: 700;">
          🚨 Common Mistakes That Cause Denials/RFEs:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
          <li><strong>❌ Unsigned I-20:</strong> ALWAYS sign your I-20 before submitting - unsigned = automatic denial!</li>
          <li><strong>❌ Wrong Photo Size:</strong> Must be exactly 2x2 inches with white background</li>
          <li><strong>❌ Expired Passport:</strong> Passport must be valid for at least 6 months</li>
          <li><strong>❌ Missing Signature on I-765:</strong> Sign the form in black ink only</li>
          <li><strong>❌ Wrong Filing Address:</strong> Use the correct USCIS Lockbox address for your state</li>
          <li><strong>❌ Late Filing:</strong> Apply within 30 days AFTER DSO recommends OPT in SEVIS</li>
          <li><strong>❌ Working Before EAD:</strong> Never work before your EAD card arrives AND start date begins</li>
        </ul>
      </div>

      <!-- How Successful Applicants Apply -->
      <div style="background: #F5F3FF; border: 1px solid #8B5CF6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
          ⭐ How Successful Applicants Apply:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>Apply Early:</strong> Don't wait until the deadline - early applicants get processed first</li>
          <li><strong>Use USPS Priority Mail:</strong> With tracking and delivery confirmation</li>
          <li><strong>Make Copies:</strong> Keep copies of EVERYTHING you submit</li>
          <li><strong>Check, Double-Check:</strong> Review all forms for errors before mailing</li>
          <li><strong>Online Filing:</strong> Consider filing online at <a href="https://www.uscis.gov/i-765" style="color: #5B21B6;">USCIS.gov</a> for faster processing</li>
        </ul>
      </div>

      <!-- Where to Apply -->
      <div style="background: #FDF2F8; border: 1px solid #EC4899; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #9D174D; font-size: 16px; font-weight: 600;">
          📮 Where to Submit Your Application:
        </h3>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
          <strong>Option 1: Online (Recommended)</strong><br/>
          <a href="https://www.uscis.gov/i-765" style="color: #3B82F6;">https://www.uscis.gov/i-765</a>
        </p>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
          <strong>Option 2: Mail to USCIS Lockbox</strong><br/>
          Check the <a href="https://www.uscis.gov/i-765-addresses" style="color: #3B82F6;">USCIS Filing Addresses</a> for your specific location
        </p>
      </div>

      <!-- Processing Timeline -->
      <div style="background: #FFFBEB; border: 1px solid #F59E0B; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #92400E; font-size: 16px; font-weight: 600;">
          ⏱️ Expected Processing Timeline:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>Receipt Notice:</strong> 2-4 weeks after USCIS receives your application</li>
          <li><strong>Biometrics (if required):</strong> 3-6 weeks after receipt</li>
          <li><strong>Decision:</strong> 90-120 days (3-4 months) on average</li>
          <li><strong>EAD Card:</strong> Mailed within 1-2 weeks of approval</li>
        </ul>
      </div>

      <!-- Helpful Resources -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          🔗 Helpful Resources:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><a href="https://www.uscis.gov/i-765" style="color: #3B82F6;">USCIS I-765 Page</a> - Official form and instructions</li>
          <li><a href="https://egov.uscis.gov/casestatus" style="color: #3B82F6;">USCIS Case Status</a> - Track your application</li>
          <li><a href="https://egov.uscis.gov/processing-times/" style="color: #3B82F6;">Processing Times</a> - Check current wait times</li>
          <li><a href="https://sevp.ice.gov/opt/" style="color: #3B82F6;">SEVP Portal</a> - Update employment info after approval</li>
        </ul>
      </div>

      <!-- Motivational Message -->
      <div style="background: linear-gradient(135deg, ${urgencyConfig.bgGradient}); border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
        <p style="margin: 0 0 12px 0; color: ${urgencyConfig.titleColor}; font-size: 15px; font-weight: 500; line-height: 1.6;">
          ${motivationalMessage}
        </p>
        <p style="margin: 0; color: ${urgencyConfig.subtitleColor}; font-size: 14px; font-weight: 600;">
          We're here to help you succeed! 🎓
        </p>
      </div>

    </div>
  `;
}

/**
 * Get urgency configuration based on days left
 */
function getUrgencyConfig(daysLeft: number, totalDays: number): {
  emoji: string;
  headline: string;
  subtitle: string;
  bgGradient: string;
  titleColor: string;
  subtitleColor: string;
  daysColor: string;
  progressColor: string;
  actionBg: string;
  actionBorder: string;
  actionTitle: string;
  actionHeadline: string;
} {
  const percentRemaining = (daysLeft / totalDays) * 100;

  if (percentRemaining > 75) {
    return {
      emoji: '🎉',
      headline: 'Congratulations! Your OPT Timeline Has Started!',
      subtitle: 'You have plenty of time to prepare. Start gathering your documents and planning ahead.',
      bgGradient: '#ECFDF5 0%, #D1FAE5 100%',
      titleColor: '#065F46',
      subtitleColor: '#047857',
      daysColor: '#059669',
      progressColor: '#10B981, #34D399',
      actionBg: '#F0FDF4',
      actionBorder: '#10B981',
      actionTitle: '#065F46',
      actionHeadline: 'Early Preparation Phase - Take Your Time',
    };
  } else if (percentRemaining > 50) {
    return {
      emoji: '📋',
      headline: 'Your OPT Filing Window is Open',
      subtitle: 'Good progress! Continue preparing your documents and schedule your DSO appointment.',
      bgGradient: '#EFF6FF 0%, #DBEAFE 100%',
      titleColor: '#1E40AF',
      subtitleColor: '#1D4ED8',
      daysColor: '#2563EB',
      progressColor: '#3B82F6, #60A5FA',
      actionBg: '#EFF6FF',
      actionBorder: '#3B82F6',
      actionTitle: '#1E40AF',
      actionHeadline: 'Active Preparation Phase - Keep Moving Forward',
    };
  } else if (percentRemaining > 25) {
    return {
      emoji: '⏰',
      headline: 'Time to Submit Your OPT Application',
      subtitle: 'The clock is ticking! Prioritize finalizing and submitting your application.',
      bgGradient: '#FFFBEB 0%, #FEF3C7 100%',
      titleColor: '#92400E',
      subtitleColor: '#B45309',
      daysColor: '#D97706',
      progressColor: '#F59E0B, #FBBF24',
      actionBg: '#FFFBEB',
      actionBorder: '#F59E0B',
      actionTitle: '#92400E',
      actionHeadline: '⚠️ Urgent - Submit Your Application Soon',
    };
  } else if (percentRemaining > 10) {
    return {
      emoji: '🚨',
      headline: 'URGENT: Limited Time Remaining!',
      subtitle: 'You must submit your application immediately to avoid missing your deadline.',
      bgGradient: '#FEF2F2 0%, #FEE2E2 100%',
      titleColor: '#991B1B',
      subtitleColor: '#B91C1C',
      daysColor: '#DC2626',
      progressColor: '#EF4444, #F87171',
      actionBg: '#FEF2F2',
      actionBorder: '#EF4444',
      actionTitle: '#991B1B',
      actionHeadline: '🚨 CRITICAL - Submit TODAY!',
    };
  } else {
    return {
      emoji: '🆘',
      headline: 'FINAL DAYS - ACT NOW!',
      subtitle: 'This is your last chance. Submit your application immediately or you will miss your OPT window.',
      bgGradient: '#7F1D1D 0%, #991B1B 100%',
      titleColor: '#FFFFFF',
      subtitleColor: '#FECACA',
      daysColor: '#DC2626',
      progressColor: '#DC2626, #EF4444',
      actionBg: '#FEF2F2',
      actionBorder: '#DC2626',
      actionTitle: '#7F1D1D',
      actionHeadline: '🆘 EMERGENCY - SUBMIT IMMEDIATELY!',
    };
  }
}

/**
 * Get action items based on timeline position
 */
function getOptApplyActionItems(daysLeft: number, totalDays: number): string[] {
  const percentRemaining = (daysLeft / totalDays) * 100;

  if (percentRemaining > 75) {
    return [
      '<strong>Request official transcripts</strong> from your university (takes 1-2 weeks)',
      'Gather required documents: passport copies, I-94, all previous I-20s',
      'Make digital copies of everything for your records',
      'Start filling out <strong>Form I-765</strong> (Application for Employment Authorization)',
      'Review OPT requirements with your DSO',
    ];
  } else if (percentRemaining > 50) {
    return [
      '<strong>Schedule an appointment with your DSO</strong> for OPT recommendation',
      'Get your I-20 endorsed for OPT by your DSO',
      'Complete Form I-765 carefully (double-check all entries!)',
      'Get <strong>2 passport-style photos</strong> (2x2 inches, white background)',
      'Prepare payment ($470 online / $520 paper fee)',
    ];
  } else if (percentRemaining > 25) {
    return [
      '⚠️ <strong>Finalize your application package</strong> this week',
      'Make copies of all documents before mailing',
      'Use <strong>USPS certified mail with tracking</strong>',
      'Mail to the correct USCIS lockbox address for your state',
      'Save your tracking number and check delivery confirmation',
    ];
  } else if (percentRemaining > 10) {
    return [
      '🚨 <strong>Submit your application TODAY</strong>',
      'If not submitted, contact your DSO immediately for emergency assistance',
      'Consider premium processing if available for your case type',
      'Use overnight shipping (FedEx/UPS) if mailing',
      'Verify the lockbox address before sending',
    ];
  } else {
    return [
      '🆘 <strong>SUBMIT IMMEDIATELY</strong> - Every hour counts!',
      'Contact your DSO for emergency support',
      'Use overnight shipping only at this point',
      'Keep proof of submission with timestamp',
      'Prepare contingency plans in case of issues',
    ];
  }
}

/**
 * Generate OPT Clock (unemployment tracker) section - Comprehensive version
 */
function generateOptClockSection(tool: ToolReminderDetail): string {
  const urgencyColor = tool.urgency === 'critical' ? '#DC2626' :
    tool.urgency === 'urgent' ? '#D97706' :
      tool.urgency === 'moderate' ? '#2563EB' : '#059669';

  const daysElapsed = tool.totalDays - tool.daysLeft;
  const unemploymentDaysUsed = daysElapsed; // Simplified - actual would come from tracking
  const today = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  // Get urgency-based headline and color scheme
  const percentRemaining = (tool.daysLeft / tool.totalDays) * 100;
  let statusBg = '#ECFDF5';
  let statusBorder = '#10B981';
  let statusEmoji = '✅';
  let motivationalMessage = 'You have time on your side! Stay consistent and you\'ll find the right opportunity.';

  if (percentRemaining <= 33) {
    statusBg = '#FEF2F2';
    statusBorder = '#EF4444';
    statusEmoji = '🚨';
    motivationalMessage = 'Time is running short! Intensify your job search efforts immediately.';
  } else if (percentRemaining <= 66) {
    statusBg = '#FFFBEB';
    statusBorder = '#F59E0B';
    statusEmoji = '⚠️';
    motivationalMessage = 'You\'re making progress! Stay focused and consistent with your job search.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          ⏰ OPT Unemployment Clock
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          Track Your 90-Day Unemployment Limit
        </p>
      </div>

      <!-- OPT Status Section -->
      <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          ${statusEmoji} Your OPT Status:
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Time Remaining:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 14px; font-weight: 700; text-align: right;">${tool.daysLeft} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Days Elapsed:</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${daysElapsed} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Unemployment Days Used:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 14px; font-weight: 700; text-align: right;">${unemploymentDaysUsed} / 90</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• OPT End Date (ET):</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${tool.endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Today (ET):</td>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; text-align: right;">${today}</td>
          </tr>
        </table>
      </div>

      <!-- Strategic Approach -->
      <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 600;">
          📋 Strategic Approach:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>Apply to 5-10 quality jobs daily (focus on fit)</li>
          <li>Build relationships with recruiters and hiring managers</li>
          <li>Work on side projects to strengthen your portfolio</li>
          <li>Attend industry meetups and networking events</li>
          <li>Practice interview skills with mock interviews</li>
        </ul>
      </div>

      <!-- Top Job Search Resources -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          🔍 Top Job Search Resources:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><a href="https://www.linkedin.com/jobs/" style="color: #3B82F6; text-decoration: none;">LinkedIn Jobs</a></li>
          <li><a href="https://www.indeed.com/" style="color: #3B82F6; text-decoration: none;">Indeed</a></li>
          <li><a href="https://www.glassdoor.com/" style="color: #3B82F6; text-decoration: none;">Glassdoor</a></li>
          <li><a href="https://joinhandshake.com/" style="color: #3B82F6; text-decoration: none;">Handshake</a></li>
          <li><a href="https://builtin.com/jobs" style="color: #3B82F6; text-decoration: none;">Built In (tech)</a></li>
        </ul>
      </div>

      <!-- NGO & Internship Options -->
      <div style="background: #FDF2F8; border: 1px solid #EC4899; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #9D174D; font-size: 16px; font-weight: 600;">
          🤝 NGO & Internship Options:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><a href="https://www.idealist.org/" style="color: #3B82F6; text-decoration: none;">Idealist (NGO)</a></li>
          <li><a href="https://www.catchafire.org/" style="color: #3B82F6; text-decoration: none;">Catchafire</a></li>
          <li><a href="https://www.internships.com/" style="color: #3B82F6; text-decoration: none;">Internships.com</a></li>
          <li><a href="https://www.wayup.com/" style="color: #3B82F6; text-decoration: none;">WayUp</a></li>
        </ul>
      </div>

      <!-- Skill Building -->
      <div style="background: #F5F3FF; border: 1px solid #8B5CF6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
          📚 Skill Building:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>Take relevant online courses (Coursera, Udemy)</li>
          <li>Contribute to open source projects</li>
          <li>Build your personal brand on LinkedIn</li>
        </ul>
      </div>

      <!-- Critical Reminder -->
      <div style="background: #FEF2F2; border: 2px solid #DC2626; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #991B1B; font-size: 16px; font-weight: 700;">
          🚨 Critical Reminder:
        </h3>
        <p style="margin: 0 0 16px 0; color: #991B1B; font-size: 14px; font-weight: 600;">
          Update SEVP portal within 10 days of starting work!
        </p>
        <a href="https://sevp.ice.gov/opt/#/login" 
           style="display: inline-block; background: #DC2626; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Update SEVP Portal →
        </a>
      </div>

      <!-- Motivational Message -->
      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%); border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-size: 15px; font-weight: 500; line-height: 1.6;">
          ${motivationalMessage}
        </p>
        <p style="margin: 0; color: #B45309; font-size: 14px; font-weight: 600;">
          Stay strong and keep pushing forward! 💪
        </p>
      </div>

    </div>
  `;
}

/**
 * Generate comprehensive STEM Apply section
 */
function generateStemApplySection(tool: ToolReminderDetail): string {
  const urgencyColor = tool.urgency === 'critical' ? '#DC2626' :
    tool.urgency === 'urgent' ? '#D97706' : '#2563EB';

  const daysElapsed = tool.totalDays - tool.daysLeft;
  const progressPercent = Math.round((daysElapsed / tool.totalDays) * 100);
  const today = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  // Get urgency-based styling
  const percentRemaining = (tool.daysLeft / tool.totalDays) * 100;
  let statusBg = '#F5F3FF';
  let statusBorder = '#8B5CF6';
  let statusEmoji = '✅';
  let motivationalMessage = 'You have time to prepare your STEM OPT extension carefully. Start gathering documents now!';

  if (percentRemaining <= 33) {
    statusBg = '#FEF2F2';
    statusBorder = '#EF4444';
    statusEmoji = '🚨';
    motivationalMessage = 'URGENT! Your OPT expires soon. Submit your STEM extension application immediately!';
  } else if (percentRemaining <= 66) {
    statusBg = '#FFFBEB';
    statusBorder = '#F59E0B';
    statusEmoji = '⚠️';
    motivationalMessage = 'Time is moving! Don\'t wait - apply for your STEM extension now.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          🔬 STEM OPT Extension
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          24-Month STEM Extension Application
        </p>
      </div>

      <!-- Application Status Section -->
      <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          ${statusEmoji} Your STEM Extension Status:
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Time Remaining:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 14px; font-weight: 700; text-align: right;">${tool.daysLeft} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Days Elapsed:</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${daysElapsed} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Filing Window Used:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 14px; font-weight: 700; text-align: right;">${progressPercent}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• OPT Expiration Date:</td>
            <td style="padding: 8px 0; color: #DC2626; font-size: 14px; font-weight: 700; text-align: right;">${tool.endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Earliest Filing Date:</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${tool.startDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Today (ET):</td>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; text-align: right;">${today}</td>
          </tr>
        </table>
        
        <!-- Progress Bar -->
        <div style="margin-top: 16px;">
          <div style="background: #E5E7EB; border-radius: 10px; height: 10px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #8B5CF6, #A78BFA); width: ${progressPercent}%; height: 100%; border-radius: 10px;"></div>
          </div>
        </div>
      </div>

      <!-- STEM Extension Requirements -->
      <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 600;">
          ✅ Key Requirements for STEM Extension:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>STEM Degree:</strong> Your degree must be on the STEM Designated Degree Program List</li>
          <li><strong>E-Verify Employer:</strong> Your employer MUST be enrolled in E-Verify</li>
          <li><strong>Form I-983:</strong> Training Plan signed by you and your employer</li>
          <li><strong>Timely Filing:</strong> Apply up to 90 days before OPT expires</li>
          <li><strong>Cap-Gap Protection:</strong> If filed on time, you can continue working while pending</li>
        </ul>
      </div>

      <!-- Required Documents Checklist -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          📄 Required Documents Checklist:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>☐ <strong>Form I-765</strong> - Application for Employment Authorization</li>
          <li>☐ <strong>Form I-983</strong> - Training Plan for STEM OPT Students (signed by employer)</li>
          <li>☐ <strong>Form I-20</strong> - with STEM OPT recommendation from DSO</li>
          <li>☐ <strong>Copy of Current EAD</strong> - Front and back</li>
          <li>☐ <strong>Copy of STEM Degree</strong> - Diploma or official transcript</li>
          <li>☐ <strong>2 Passport Photos</strong> - 2x2 inches, white background</li>
          <li>☐ <strong>Passport Copy</strong> - Bio page (valid for 6+ months)</li>
          <li>☐ <strong>Filing Fee</strong> - $410 (check current fee)</li>
        </ul>
      </div>

      <!-- Common Mistakes to Avoid -->
      <div style="background: #FEF2F2; border: 2px solid #DC2626; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #991B1B; font-size: 16px; font-weight: 700;">
          � Common STEM Extension Mistakes:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
          <li><strong>❌ Non-E-Verify Employer:</strong> Your employer MUST be enrolled in E-Verify - no exceptions!</li>
          <li><strong>❌ Incomplete I-983:</strong> All sections must be completed and signed by both you and employer</li>
          <li><strong>❌ Wrong Job Title:</strong> Job must be directly related to your STEM degree field</li>
          <li><strong>❌ Missing DSO Endorsement:</strong> I-20 must be updated with STEM recommendation</li>
          <li><strong>❌ Late Filing:</strong> Must file BEFORE your current OPT expires</li>
          <li><strong>❌ Part-time Work:</strong> Must work at least 20 hours per week</li>
        </ul>
      </div>

      <!-- I-983 Form Tips -->
      <div style="background: #F5F3FF; border: 1px solid #8B5CF6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
          📝 I-983 Training Plan Tips:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>Learning Goals:</strong> Be specific about skills you'll develop</li>
          <li><strong>Supervisor Info:</strong> Include their title and contact information</li>
          <li><strong>Training Methods:</strong> Describe mentorship, projects, coursework</li>
          <li><strong>E-Verify Number:</strong> Get the company's E-Verify Company ID Number</li>
          <li><strong>Employer Signature:</strong> Must be signed by authorized company representative</li>
        </ul>
      </div>

      <!-- E-Verify Check -->
      <div style="background: #FFFBEB; border: 1px solid #F59E0B; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #92400E; font-size: 16px; font-weight: 600;">
          🔍 Verify Your Employer's E-Verify Status:
        </h3>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.6;">
          Before applying, confirm your employer is enrolled in E-Verify:
        </p>
        <a href="https://www.e-verify.gov/about-e-verify/e-verify-data/how-to-find-participating-employers" 
           style="display: inline-block; background: #F59E0B; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Check E-Verify Status →
        </a>
      </div>

      <!-- Cap-Gap Information -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          🛡️ Cap-Gap Protection:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>If you file before OPT expires, you get automatic <strong>180-day extension</strong></li>
          <li>You can continue working while your STEM extension is pending</li>
          <li>Keep your receipt notice as proof of pending application</li>
          <li>Cap-gap ends when STEM extension is approved or denied</li>
        </ul>
      </div>

      <!-- Helpful Resources -->
      <div style="background: #FDF2F8; border: 1px solid #EC4899; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #9D174D; font-size: 16px; font-weight: 600;">
          🔗 Helpful Resources:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt" style="color: #3B82F6;">USCIS STEM OPT Page</a></li>
          <li><a href="https://www.ice.gov/doclib/sevis/pdf/i983.pdf" style="color: #3B82F6;">Form I-983 (PDF)</a></li>
          <li><a href="https://www.e-verify.gov/" style="color: #3B82F6;">E-Verify Website</a></li>
          <li><a href="https://sevp.ice.gov/opt/" style="color: #3B82F6;">SEVP Portal</a></li>
        </ul>
      </div>

      <!-- Motivational Message -->
      <div style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
        <p style="margin: 0 0 12px 0; color: #5B21B6; font-size: 15px; font-weight: 500; line-height: 1.6;">
          ${motivationalMessage}
        </p>
        <p style="margin: 0; color: #7C3AED; font-size: 14px; font-weight: 600;">
          Your STEM skills are in demand - keep going! 🚀
        </p>
      </div>

    </div>
  `;
}

/**
 * Generate comprehensive STEM Clock section
 */
function generateStemClockSection(tool: ToolReminderDetail): string {
  const urgencyColor = tool.urgency === 'critical' ? '#DC2626' :
    tool.urgency === 'urgent' ? '#D97706' : '#059669';

  const daysElapsed = tool.totalDays - tool.daysLeft;
  const unemploymentDaysUsed = daysElapsed;
  const today = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  // Get urgency-based styling
  const percentRemaining = (tool.daysLeft / tool.totalDays) * 100;
  let statusBg = '#ECFDF5';
  let statusBorder = '#10B981';
  let statusEmoji = '✅';
  let motivationalMessage = 'You have time to find the right opportunity! Focus on quality applications and networking.';

  if (percentRemaining <= 33) {
    statusBg = '#FEF2F2';
    statusBorder = '#EF4444';
    statusEmoji = '🚨';
    motivationalMessage = 'Time is critical! Intensify your job search immediately - consider all options including NGOs and internships.';
  } else if (percentRemaining <= 66) {
    statusBg = '#FFFBEB';
    statusBorder = '#F59E0B';
    statusEmoji = '⚠️';
    motivationalMessage = 'Stay focused on your job search. Consistency is key - apply daily and follow up on applications.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          ⏱️ STEM Unemployment Clock
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          Track Your 60-Day STEM Unemployment Limit
        </p>
      </div>

      <!-- STEM Status Section -->
      <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          ${statusEmoji} Your STEM Unemployment Status:
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Time Remaining:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 14px; font-weight: 700; text-align: right;">${tool.daysLeft} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Days Elapsed:</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${daysElapsed} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• STEM Unemployment Used:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-size: 14px; font-weight: 700; text-align: right;">${unemploymentDaysUsed} / 60</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• STEM Start Date:</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${tool.startDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• STEM End Date:</td>
            <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; text-align: right;">${tool.endDate || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">• Today (ET):</td>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; text-align: right;">${today}</td>
          </tr>
        </table>
      </div>

      <!-- Strategic Approach -->
      <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 600;">
          📋 Strategic Job Search Approach:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>Apply to <strong>10-15 quality jobs daily</strong> - focus on STEM roles matching your degree</li>
          <li>Target <strong>E-Verify employers</strong> (required for STEM OPT)</li>
          <li>Leverage your STEM skills for contract and consulting opportunities</li>
          <li>Network with professionals in your field on LinkedIn</li>
          <li>Consider <strong>H-1B sponsoring companies</strong> for long-term opportunities</li>
        </ul>
      </div>

      <!-- Top Job Search Resources for STEM -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          🔍 STEM-Focused Job Resources:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><a href="https://www.linkedin.com/jobs/" style="color: #3B82F6;">LinkedIn Jobs</a> - Filter for "Visa Sponsorship"</li>
          <li><a href="https://www.indeed.com/" style="color: #3B82F6;">Indeed</a> - Search with "OPT" or "H1B sponsor"</li>
          <li><a href="https://www.dice.com/" style="color: #3B82F6;">Dice</a> - Tech & Engineering jobs</li>
          <li><a href="https://builtin.com/jobs" style="color: #3B82F6;">Built In</a> - Startup & Tech jobs</li>
          <li><a href="https://www.myvisajobs.com/" style="color: #3B82F6;">MyVisaJobs</a> - H-1B sponsor database</li>
          <li><a href="https://h1bdata.info/" style="color: #3B82F6;">H1B Data</a> - Check company H-1B history</li>
        </ul>
      </div>

      <!-- NGO & Research Options -->
      <div style="background: #FDF2F8; border: 1px solid #EC4899; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #9D174D; font-size: 16px; font-weight: 600;">
          🤝 NGO, Research & Alternative Options:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><a href="https://www.idealist.org/" style="color: #3B82F6;">Idealist</a> - NGO & nonprofit jobs</li>
          <li><a href="https://www.usajobs.gov/" style="color: #3B82F6;">USAJobs</a> - Federal research positions</li>
          <li><a href="https://academicjobsonline.org/" style="color: #3B82F6;">Academic Jobs Online</a> - University positions</li>
          <li><a href="https://www.higheredjobs.com/" style="color: #3B82F6;">HigherEd Jobs</a> - Higher education careers</li>
          <li><strong>University Research Labs:</strong> Contact professors directly for RA positions</li>
        </ul>
      </div>

      <!-- STEM Employment Rules -->
      <div style="background: #FEF2F2; border: 2px solid #DC2626; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #991B1B; font-size: 16px; font-weight: 700;">
          🚨 Critical STEM OPT Employment Rules:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
          <li><strong>60-Day Limit:</strong> Maximum unemployment during STEM period (separate from OPT's 90 days)</li>
          <li><strong>E-Verify ONLY:</strong> Can only work for employers enrolled in E-Verify</li>
          <li><strong>Minimum 20 Hours:</strong> Must work at least 20 hours per week</li>
          <li><strong>Report Changes:</strong> Report any employer changes to DSO within <strong>10 days</strong></li>
          <li><strong>6-Month Validation:</strong> Self-validate your SEVIS record every 6 months</li>
          <li><strong>Related Work:</strong> Job must be directly related to your STEM degree</li>
        </ul>
      </div>

      <!-- H-1B Planning -->
      <div style="background: #F5F3FF; border: 1px solid #8B5CF6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
          📅 H-1B Planning (Think Ahead):
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>H-1B Cap Season:</strong> Registration typically in March for October start</li>
          <li>Ask employers about H-1B sponsorship early in the interview process</li>
          <li>Consider <strong>cap-exempt employers</strong> (universities, research institutions)</li>
          <li>STEM OPT gives you up to 3 chances at the H-1B lottery</li>
          <li>Check company H-1B history at <a href="https://h1bdata.info/" style="color: #5B21B6;">h1bdata.info</a></li>
        </ul>
      </div>

      <!-- SEVP Portal Reminder -->
      <div style="background: #FFFBEB; border: 1px solid #F59E0B; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #92400E; font-size: 16px; font-weight: 700;">
          ⚠️ Important SEVP Reminders:
        </h3>
        <ul style="margin: 0 0 16px 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>Update within 10 days</strong> when starting new employment</li>
          <li><strong>Validate every 6 months</strong> during STEM OPT</li>
          <li>Report address changes within 10 days</li>
        </ul>
        <a href="https://sevp.ice.gov/opt/#/login" 
           style="display: inline-block; background: #F59E0B; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Update SEVP Portal →
        </a>
      </div>

      <!-- Motivational Message -->
      <div style="background: linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%); border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
        <p style="margin: 0 0 12px 0; color: #0F766E; font-size: 15px; font-weight: 500; line-height: 1.6;">
          ${motivationalMessage}
        </p>
        <p style="margin: 0; color: #115E59; font-size: 14px; font-weight: 600;">
          Your STEM expertise is valuable - the right opportunity is out there! 💼
        </p>
      </div>

    </div>
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
    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: 'Your Data Export Verification Code - OPT Clock Tracker',
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
    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
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
 * Enrollment email data including timeline information
 */
export interface EnrollmentEmailData {
  startDate?: string;
  endDate?: string;
  programEndDate?: string;
  optType?: string;
  totalDays?: number;
}

/**
 * Generate tool-specific preparation steps and tips
 */
function getToolEnrollmentContent(toolName: string, data?: EnrollmentEmailData): {
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  timelineHtml: string;
  preparationHtml: string;
  tipsHtml: string;
  whatToExpectHtml: string;
} {
  const baseStyles = {
    listItem: 'margin: 0 0 12px 0; padding-left: 8px; color: #374151; font-size: 14px; line-height: 1.6;',
    sectionTitle: 'margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: 600;',
  };

  switch (toolName) {
    case 'opt-apply':
      return {
        title: 'OPT Apply Dates',
        subtitle: 'Your Daily OPT Application Reminder',
        icon: '📋',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        timelineHtml: data?.startDate && data?.endDate ? `
          <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #0369A1; font-size: 16px; font-weight: 600;">📅 Your OPT Filing Window</h3>
            <div style="display: flex; justify-content: space-between; gap: 16px;">
              <div style="flex: 1; background: white; border-radius: 8px; padding: 12px; text-align: center;">
                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Earliest Apply Date</p>
                <p style="margin: 0; color: #059669; font-size: 16px; font-weight: 700;">${data.startDate}</p>
              </div>
              <div style="flex: 1; background: white; border-radius: 8px; padding: 12px; text-align: center;">
                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Filing Deadline</p>
                <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: 700;">${data.endDate}</p>
              </div>
            </div>
            ${data.programEndDate ? `<p style="margin: 16px 0 0 0; color: #64748B; font-size: 13px; text-align: center;">Program End Date: <strong>${data.programEndDate}</strong></p>` : ''}
            ${data.totalDays ? `<p style="margin: 8px 0 0 0; color: #64748B; font-size: 13px; text-align: center;">Total Filing Window: <strong>${data.totalDays} days</strong></p>` : ''}
          </div>
        ` : '',
        preparationHtml: `
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">📝 Documents to Prepare</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Form I-765</strong> - Application for Employment Authorization</li>
              <li style="${baseStyles.listItem}"><strong>2 Passport-Size Photos</strong> - Recent, with white background (2x2 inches)</li>
              <li style="${baseStyles.listItem}"><strong>Form I-20</strong> - With OPT recommendation from your DSO</li>
              <li style="${baseStyles.listItem}"><strong>Passport Copy</strong> - All pages with stamps/visas</li>
              <li style="${baseStyles.listItem}"><strong>I-94 Record</strong> - Print from CBP website</li>
              <li style="${baseStyles.listItem}"><strong>Previous EAD Cards</strong> - Copies if applicable</li>
              <li style="${baseStyles.listItem}"><strong>G-1145</strong> - E-Notification of Application Acceptance</li>
              <li style="${baseStyles.listItem}"><strong>Filing Fee</strong> - Check current USCIS fee ($410 as of 2024)</li>
            </ul>
          </div>
        `,
        tipsHtml: `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">💡 Pro Tips for Faster Approval</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Apply on Day 1:</strong> Submit your application as early as possible in your filing window for the best processing times</li>
              <li style="${baseStyles.listItem}"><strong>Schedule DSO Appointment Early:</strong> Request your OPT I-20 recommendation at least 2 weeks before your earliest filing date</li>
              <li style="${baseStyles.listItem}"><strong>Use USPS Certified Mail:</strong> Always send with tracking and signature confirmation</li>
              <li style="${baseStyles.listItem}"><strong>Make Copies:</strong> Keep copies of EVERYTHING you submit</li>
              <li style="${baseStyles.listItem}"><strong>Check Processing Times:</strong> Current processing times are 3-5 months - plan accordingly</li>
              <li style="${baseStyles.listItem}"><strong>Don't Start Work:</strong> Never begin employment until your EAD card arrives</li>
            </ul>
          </div>
        `,
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Daily reminder emails at <strong>9:00 AM ET</strong></li>
            <li>Document preparation checklists</li>
            <li>DSO appointment reminders</li>
            <li>Filing deadline countdowns</li>
            <li>Step-by-step application guidance</li>
            <li>Urgency alerts as deadlines approach</li>
          </ul>
        `,
      };

    case 'opt-clock':
      return {
        title: 'OPT Unemployment Clock',
        subtitle: 'Track Your 90-Day Unemployment Limit',
        icon: '⏰',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        timelineHtml: data?.startDate ? `
          <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #92400E; font-size: 16px; font-weight: 600;">⏱️ Your Unemployment Clock</h3>
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">OPT Start Date</p>
              <p style="margin: 0 0 16px 0; color: #B45309; font-size: 18px; font-weight: 700;">${data.startDate}</p>
              <div style="background: white; border-radius: 8px; padding: 16px;">
                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">Maximum Unemployment Days Allowed</p>
                <p style="margin: 0; color: #DC2626; font-size: 32px; font-weight: 800;">90 Days</p>
              </div>
            </div>
          </div>
        ` : '',
        preparationHtml: `
          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">🚨 Important Rules to Remember</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>90-Day Limit:</strong> You can only be unemployed for 90 cumulative days during your entire OPT period</li>
              <li style="${baseStyles.listItem}"><strong>Count Starts:</strong> Clock begins from your OPT start date, not EAD receipt date</li>
              <li style="${baseStyles.listItem}"><strong>Aggregate Days:</strong> Unemployment days are cumulative - they add up over time</li>
              <li style="${baseStyles.listItem}"><strong>Volunteer Work:</strong> At least 20 hours/week of unpaid work in your field counts as employment</li>
              <li style="${baseStyles.listItem}"><strong>Self-Employment:</strong> Starting your own business in your field is valid employment</li>
            </ul>
          </div>
        `,
        tipsHtml: `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">💼 Job Search Tips</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Start Early:</strong> Begin your job search before your program ends</li>
              <li style="${baseStyles.listItem}"><strong>Use OPT-Friendly Job Boards:</strong> MyVisaJobs, H1BGrader, Indeed with visa filter</li>
              <li style="${baseStyles.listItem}"><strong>Network Actively:</strong> Attend career fairs, join LinkedIn groups, reach out to alumni</li>
              <li style="${baseStyles.listItem}"><strong>Consider Contract Work:</strong> Staffing agencies often have OPT-friendly positions</li>
              <li style="${baseStyles.listItem}"><strong>Keep Records:</strong> Document all job search activities and employment offers</li>
            </ul>
          </div>
        `,
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Daily countdown of remaining unemployment days</li>
            <li>Alerts when approaching critical thresholds</li>
            <li>Job search tips and resources</li>
            <li>Employment documentation reminders</li>
            <li>SEVIS reporting deadline alerts</li>
          </ul>
        `,
      };

    case 'stem-apply':
      return {
        title: 'STEM OPT Extension',
        subtitle: 'Your 24-Month Extension Application Reminder',
        icon: '🔬',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        timelineHtml: data?.startDate && data?.endDate ? `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">📅 Your STEM OPT Filing Window</h3>
            <div style="display: flex; justify-content: space-between; gap: 16px;">
              <div style="flex: 1; background: white; border-radius: 8px; padding: 12px; text-align: center;">
                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Earliest Apply Date</p>
                <p style="margin: 0; color: #059669; font-size: 16px; font-weight: 700;">${data.startDate}</p>
              </div>
              <div style="flex: 1; background: white; border-radius: 8px; padding: 12px; text-align: center;">
                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">OPT EAD Expires</p>
                <p style="margin: 0; color: #DC2626; font-size: 16px; font-weight: 700;">${data.endDate}</p>
              </div>
            </div>
          </div>
        ` : '',
        preparationHtml: `
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">📝 Documents Required for STEM Extension</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Form I-983</strong> - Training Plan (signed by you and employer)</li>
              <li style="${baseStyles.listItem}"><strong>Form I-765</strong> - Employment Authorization Application</li>
              <li style="${baseStyles.listItem}"><strong>New I-20</strong> - With STEM OPT recommendation from DSO</li>
              <li style="${baseStyles.listItem}"><strong>Current EAD Card</strong> - Copy front and back</li>
              <li style="${baseStyles.listItem}"><strong>2 Passport Photos</strong> - Recent, 2x2 inches</li>
              <li style="${baseStyles.listItem}"><strong>Passport Copy</strong> - All pages with stamps</li>
              <li style="${baseStyles.listItem}"><strong>Employer's E-Verify Number</strong> - Must be current and valid</li>
            </ul>
          </div>
        `,
        tipsHtml: `
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">💡 STEM Extension Success Tips</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Verify E-Verify:</strong> Confirm your employer is enrolled in E-Verify before starting the process</li>
              <li style="${baseStyles.listItem}"><strong>I-983 Training Plan:</strong> Work with your employer to create a detailed, degree-related training plan</li>
              <li style="${baseStyles.listItem}"><strong>Apply Early:</strong> Submit up to 90 days before your OPT EAD expires</li>
              <li style="${baseStyles.listItem}"><strong>Cap-Gap:</strong> If your OPT expires while application is pending, you get automatic extension</li>
              <li style="${baseStyles.listItem}"><strong>6-Month Reports:</strong> Remember you must report to your school every 6 months during STEM OPT</li>
            </ul>
          </div>
        `,
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Daily reminder emails at <strong>9:00 AM ET</strong></li>
            <li>I-983 preparation guidance</li>
            <li>E-Verify verification reminders</li>
            <li>Filing deadline countdowns</li>
            <li>DSO reporting reminders</li>
          </ul>
        `,
      };

    case 'stem-clock':
      return {
        title: 'STEM Unemployment Clock',
        subtitle: 'Track Your 60-Day STEM Unemployment Limit',
        icon: '⏱️',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        timelineHtml: data?.startDate ? `
          <div style="background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">⏱️ Your STEM Unemployment Clock</h3>
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">STEM OPT Start Date</p>
              <p style="margin: 0 0 16px 0; color: #7C3AED; font-size: 18px; font-weight: 700;">${data.startDate}</p>
              <div style="background: white; border-radius: 8px; padding: 16px;">
                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">STEM OPT Unemployment Limit</p>
                <p style="margin: 0; color: #DC2626; font-size: 32px; font-weight: 800;">60 Days</p>
                <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 12px;">Additional days during your 24-month STEM extension</p>
              </div>
            </div>
          </div>
        ` : '',
        preparationHtml: `
          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">🚨 STEM OPT Employment Rules</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>60-Day Limit:</strong> You have 60 additional unemployment days during your STEM OPT period (separate from the 90 days during initial OPT)</li>
              <li style="${baseStyles.listItem}"><strong>E-Verify Required:</strong> You can only work for E-Verify enrolled employers</li>
              <li style="${baseStyles.listItem}"><strong>Wage Requirements:</strong> Must be paid at least as much as US workers in similar positions</li>
              <li style="${baseStyles.listItem}"><strong>Report Changes:</strong> Report any employer changes to your DSO within 10 days</li>
              <li style="${baseStyles.listItem}"><strong>6-Month Validation:</strong> Self-validate your SEVIS record every 6 months</li>
            </ul>
          </div>
        `,
        tipsHtml: `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">💼 Maintaining STEM OPT Status</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Keep I-983 Updated:</strong> Any material changes require a new training plan</li>
              <li style="${baseStyles.listItem}"><strong>Plan for H-1B:</strong> Start H-1B preparation early - lottery registration is in March</li>
              <li style="${baseStyles.listItem}"><strong>Multiple Employers:</strong> You can work for multiple E-Verify employers (each needs I-983)</li>
              <li style="${baseStyles.listItem}"><strong>Document Everything:</strong> Keep records of all employment and training activities</li>
            </ul>
          </div>
        `,
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Daily countdown of remaining unemployment days</li>
            <li>6-month validation reminders</li>
            <li>H-1B timeline alerts</li>
            <li>Employer change reporting reminders</li>
            <li>Status maintenance tips</li>
          </ul>
        `,
      };

    case 'documents':
      return {
        title: 'Document Expiry Reminders',
        subtitle: 'Never Miss an Important Deadline',
        icon: '📄',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        timelineHtml: '',
        preparationHtml: `
          <div style="background: #FDF2F8; border: 1px solid #FBCFE8; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">📁 Documents We Help You Track</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Passport</strong> - Must be valid for at least 6 months</li>
              <li style="${baseStyles.listItem}"><strong>Visa</strong> - F-1/OPT visa stamp validity</li>
              <li style="${baseStyles.listItem}"><strong>I-20</strong> - Program end dates and extensions</li>
              <li style="${baseStyles.listItem}"><strong>EAD Card</strong> - Employment Authorization Document</li>
              <li style="${baseStyles.listItem}"><strong>Driver's License</strong> - State ID renewals</li>
              <li style="${baseStyles.listItem}"><strong>Any Custom Documents</strong> - Add any document you need to track</li>
            </ul>
          </div>
        `,
        tipsHtml: `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">💡 Document Management Tips</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Renew Early:</strong> Start renewal process 3-6 months before expiry</li>
              <li style="${baseStyles.listItem}"><strong>Keep Copies:</strong> Maintain digital copies of all documents</li>
              <li style="${baseStyles.listItem}"><strong>Update Promptly:</strong> When you renew a document, update the expiry date on our website</li>
            </ul>
          </div>
        `,
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Reminders at 60, 45, 30, 20, 10, 5, and 0 days before expiry</li>
            <li>Priority alerts for critical documents</li>
            <li>Renewal guidance and checklists</li>
          </ul>
        `,
      };

    case 'case-status':
      return {
        title: 'Case Status Tracker',
        subtitle: 'Track Your USCIS Case Status Automatically',
        icon: '🔔',
        gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        timelineHtml: `
          <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px; font-weight: 600;">🎉 You're All Set!</h3>
            <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6;">
              Congratulations! You've successfully enrolled in <strong>Case Status Tracker</strong>. 
              We'll help you track and stay on top of your case status with timely reminders and instant notifications when your status changes.
            </p>
          </div>
        `,
        preparationHtml: `
          <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">📋 How Case Tracking Works</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Automatic Checks:</strong> We check your case status daily</li>
              <li style="${baseStyles.listItem}"><strong>Instant Alerts:</strong> Get notified immediately when status changes</li>
              <li style="${baseStyles.listItem}"><strong>Status History:</strong> Track all changes over time</li>
              <li style="${baseStyles.listItem}"><strong>USCIS Direct:</strong> Data comes directly from USCIS servers</li>
            </ul>
          </div>
        `,
        tipsHtml: `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="${baseStyles.sectionTitle}">💡 Understanding Case Status</h3>
            <ul style="margin: 0; padding: 0 0 0 20px;">
              <li style="${baseStyles.listItem}"><strong>Case Received:</strong> USCIS has your application</li>
              <li style="${baseStyles.listItem}"><strong>Fingerprints Scheduled:</strong> Biometrics appointment coming</li>
              <li style="${baseStyles.listItem}"><strong>Case Being Reviewed:</strong> Actively under review</li>
              <li style="${baseStyles.listItem}"><strong>Card Being Produced:</strong> Approved! Card in production</li>
              <li style="${baseStyles.listItem}"><strong>Card Was Mailed:</strong> Your EAD is on the way</li>
            </ul>
          </div>
        `,
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Email alerts when your case status changes</li>
            <li>Daily automatic status checks</li>
            <li>Explanation of what each status means</li>
            <li>Next steps guidance after updates</li>
          </ul>
        `,
      };

    default:
      return {
        title: 'OPT Daily Reminders',
        subtitle: 'Your OPT Timeline Assistant',
        icon: '📧',
        gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        timelineHtml: '',
        preparationHtml: '',
        tipsHtml: '',
        whatToExpectHtml: `
          <ul style="margin: 0; padding: 0 0 0 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
            <li>Daily reminder emails at <strong>9:00 AM ET</strong></li>
            <li>Timeline-specific action items</li>
            <li>Urgency alerts as deadlines approach</li>
          </ul>
        `,
      };
  }
}

/**
 * Send enrollment confirmation email when user enables daily reminders
 */
export async function sendEnrollmentEmail(
  email: string,
  firstName: string,
  toolName: string,
  data?: EnrollmentEmailData
) {
  try {
    const content = getToolEnrollmentContent(toolName, data);
    const chromeExtensionUrl = 'https://chromewebstore.google.com/detail/trackmyopt/hfljbefkccdmlnhclfojlafipjnjbajm';

    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: `✅ Welcome to ${content.title} - You're All Set!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header with Branding -->
            <div style="background: ${content.gradient}; border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: white; font-size: 28px; font-weight: 700;">
                OPT<span style="color: #FFD60A;">Clock</span>Tracker
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">${content.subtitle}</p>
            </div>

            <!-- Success Banner -->
            <div style="background: #ECFDF5; border-left: 4px solid #10B981; padding: 16px 20px; margin: 0;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">${content.icon}</span>
                <div>
                  <h2 style="margin: 0; color: #065F46; font-size: 20px; font-weight: 600;">You're All Set!</h2>
                  <p style="margin: 4px 0 0 0; color: #047857; font-size: 14px;">Successfully enrolled in ${content.title}</p>
                </div>
              </div>
            </div>

            <!-- Main Content Card -->
            <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${firstName || 'there'}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Congratulations! 🎉 You've successfully enrolled in <strong>${content.title}</strong>. 
                We'll help you stay on track with timely reminders and expert guidance throughout your journey.
              </p>

              <!-- Timeline Info (if available) -->
              ${content.timelineHtml}

              <!-- Preparation Section -->
              ${content.preparationHtml}

              <!-- Tips Section -->
              ${content.tipsHtml}

              <!-- What to Expect -->
              <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
                  📬 What to Expect
                </h3>
                ${content.whatToExpectHtml}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0 24px 0;">
                <a href="https://www.trackmyopt.com/dashboard/${toolName === 'case-status' ? 'case-status' : 'opt-tools/' + toolName}" 
                   style="display: inline-block; background: ${content.gradient}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                  Go to ${content.title} →
                </a>
              </div>

              <!-- Settings Link -->
              <div style="text-align: center; padding: 20px; border-top: 1px solid #E5E7EB; margin-top: 24px;">
                <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">
                  <strong>Got a job or completed your application?</strong>
                </p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  Visit your <a href="https://www.trackmyopt.com/dashboard/settings?tab=notifications" style="color: #3B82F6; text-decoration: none; font-weight: 500;">Settings → Notifications</a> to manage your email preferences.
                </p>
              </div>
            </div>

            <!-- Rating Section -->
            <div style="background: white; border-radius: 16px; padding: 24px; margin-top: 16px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
                ⭐ Loving OPT Clock Tracker?
              </h3>
              <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                Help other international students by leaving a review!
              </p>
              <a href="${chromeExtensionUrl}" style="text-decoration: none;">
                <div style="display: inline-block;">
                  <span style="font-size: 32px; letter-spacing: 4px;">⭐⭐⭐⭐⭐</span>
                </div>
              </a>
              <p style="margin: 12px 0 0 0;">
                <a href="${chromeExtensionUrl}" 
                   style="color: #3B82F6; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Rate on Chrome Web Store →
                </a>
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 24px 20px;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">
                Best regards,<br>
                <strong>The OPT Clock Tracker Team</strong>
              </p>
              <p style="margin: 16px 0 0 0; color: #9CA3AF; font-size: 12px;">
                © ${new Date().getFullYear()} Zyene, Inc. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 12px;">
                <a href="mailto:support@trackmyopt.com" style="color: #9CA3AF; text-decoration: none;">support@trackmyopt.com</a>
              </p>
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

/**
 * Send welcome email to new premium user
 */
export async function sendPremiumWelcomeEmail(userId: string, email: string, name: string) {
  try {
    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: "Welcome to TrackMyOPT Premium! 🚀",
      html: generateWelcomeEmailHTML(name),
    });

    console.log('Premium welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Premium welcome email service error:', error);
    return { success: false, error };
  }
}

function generateWelcomeEmailHTML(firstName: string): string {
  const year = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Premium</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #007AFF, #5856D6); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Premium! 🎉</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
              Hi ${firstName},
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
              Thank you for upgrading to <strong>TrackMyOPT Premium</strong>! You've just unlocked mostly powerful tools to help you secure and maintain your status.
            </p>
            
            <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px;">🚀 Your New Superpowers:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 15px; line-height: 1.6;">
                <li>Unlimited AI Resume Scans</li>
                <li>Advanced Job Tracker & Analytics</li>
                <li>Priority Alerts & Reminders</li>
                <li>Exclusive Sponsor Data Access</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
              We're excited to be part of your career journey in the US. Let's get you hired!
            </p>

            <div style="text-align: center;">
              <a href="https://www.trackmyopt.com/dashboard" style="display: inline-block; background: #007AFF; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="font-size: 12px; color: #6B7280; margin: 0;">
              © ${year} Zyene, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send email change notification
 */
export async function sendEmailChangeNotification(userId: string, email: string) {
  try {
    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
      to: email,
      subject: "Your email address was updated",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Email Address Updated</h2>
          <p>Hello,</p>
          <p>Your email address for TrackMyOPT was recently updated to this address.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <br>
          <p>Best,<br>TrackMyOPT Team</p>
        </div>
      `,
    });

    console.log('Email change notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email change notification error:', error);
    return { success: false, error };
  }
}

