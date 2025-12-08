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
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
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

  return `
    <!-- Congratulations Banner -->
    <div style="padding: 24px 28px; background: linear-gradient(135deg, ${urgencyConfig.bgGradient}); border-bottom: 1px solid #E5E7EB;">
      <div style="text-align: center;">
        <span style="font-size: 32px;">${urgencyConfig.emoji}</span>
        <h3 style="margin: 12px 0 8px 0; color: ${urgencyConfig.titleColor}; font-size: 20px; font-weight: 700;">
          ${urgencyConfig.headline}
        </h3>
        <p style="margin: 0; color: ${urgencyConfig.subtitleColor}; font-size: 14px; line-height: 1.5;">
          ${urgencyConfig.subtitle}
        </p>
      </div>
    </div>

    <!-- OPT Details Section -->
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      <h4 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 700; display: flex; align-items: center;">
        📋 OPT Details
      </h4>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background: #F9FAFB; border-radius: 8px 0 0 0; border-bottom: 1px solid #E5E7EB;">
            <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">OPT Type</span><br/>
            <strong style="color: #1F2937; font-size: 15px;">${tool.optType || 'Post-Completion OPT'}</strong>
          </td>
          <td style="padding: 12px; background: #F9FAFB; border-radius: 0 8px 0 0; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;">
            <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Program End Date</span><br/>
            <strong style="color: #1F2937; font-size: 15px;">${tool.programEndDate || 'N/A'}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
            <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Apply Start Date</span><br/>
            <strong style="color: #059669; font-size: 15px;">${tool.startDate}</strong>
          </td>
          <td style="padding: 12px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; border-left: 1px solid #E5E7EB;">
            <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Filing Deadline</span><br/>
            <strong style="color: #DC2626; font-size: 15px;">${tool.endDate}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #F9FAFB; border-radius: 0 0 0 8px;">
            <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total Filing Window</span><br/>
            <strong style="color: #1F2937; font-size: 15px;">${tool.totalDays} days</strong>
          </td>
          <td style="padding: 12px; background: #F9FAFB; border-radius: 0 0 8px 0; border-left: 1px solid #E5E7EB;">
            <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Days Remaining</span><br/>
            <strong style="color: ${urgencyConfig.daysColor}; font-size: 20px; font-weight: 800;">${tool.daysLeft} days</strong>
          </td>
        </tr>
      </table>

      <!-- Progress Bar -->
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #6B7280; font-size: 12px;">${daysUsed} days elapsed</span>
          <span style="color: #6B7280; font-size: 12px;">${tool.daysLeft} days left</span>
        </div>
        <div style="background: #E5E7EB; border-radius: 10px; height: 10px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, ${urgencyConfig.progressColor}); width: ${progressPercent}%; height: 100%; border-radius: 10px;"></div>
        </div>
      </div>
    </div>

    <!-- What to Do Now Section -->
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      <h4 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 700;">
        ✅ What to Do Now
      </h4>
      
      <div style="background: ${urgencyConfig.actionBg}; border-radius: 12px; padding: 20px; border-left: 4px solid ${urgencyConfig.actionBorder};">
        <p style="margin: 0 0 12px 0; color: ${urgencyConfig.actionTitle}; font-size: 15px; font-weight: 700;">
          ${urgencyConfig.actionHeadline}
        </p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          ${actionItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Important Reminders Section -->
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      <h4 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 700;">
        ⚠️ Important Reminders
      </h4>
      
      <div style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <ul style="margin: 0; padding: 0 0 0 20px; color: #92400E; font-size: 13px; line-height: 1.8;">
          <li><strong>Never</strong> start working before your EAD card arrives and the start date begins</li>
          <li>Keep copies of ALL documents you submit to USCIS</li>
          <li>Use USPS certified mail with tracking for your application</li>
          <li>OPT application processing typically takes <strong>3-5 months</strong></li>
          <li>You can track your case status at <a href="https://egov.uscis.gov/casestatus" style="color: #B45309;">USCIS Case Status Portal</a></li>
        </ul>
      </div>
    </div>

    <!-- USCIS Portal Link -->
    <div style="padding: 20px 28px; background: #F0FDF4; border-bottom: 1px solid #E5E7EB;">
      <div style="display: flex; align-items: center;">
        <span style="font-size: 24px; margin-right: 12px;">🔗</span>
        <div>
          <p style="margin: 0 0 4px 0; color: #166534; font-size: 14px; font-weight: 600;">
            USCIS SCVP Portal
          </p>
          <a href="https://egov.uscis.gov/casestatus" style="color: #15803D; font-size: 13px; text-decoration: none;">
            https://egov.uscis.gov/casestatus →
          </a>
        </div>
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
      'Prepare payment ($410 filing fee - check current fee on USCIS website)',
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
 * Generate OPT Clock (unemployment tracker) section
 */
function generateOptClockSection(tool: ToolReminderDetail): string {
  const urgencyColor = tool.urgency === 'critical' ? '#DC2626' : 
                       tool.urgency === 'urgent' ? '#D97706' : 
                       tool.urgency === 'moderate' ? '#2563EB' : '#059669';
  
  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%); border-radius: 12px; padding: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #92400E; font-size: 18px; font-weight: 700;">
          ⏰ OPT Unemployment Clock
        </h4>
        <div style="font-size: 36px; font-weight: 800; color: ${urgencyColor}; margin: 8px 0;">
          ${tool.daysLeft} days remaining
        </div>
        <p style="margin: 12px 0 0 0; color: #78350F; font-size: 14px; line-height: 1.6;">
          ${tool.message}
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate STEM Apply section
 */
function generateStemApplySection(tool: ToolReminderDetail): string {
  const urgencyColor = tool.urgency === 'critical' ? '#DC2626' : 
                       tool.urgency === 'urgent' ? '#D97706' : '#2563EB';
  
  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      <div style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); border-radius: 12px; padding: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #5B21B6; font-size: 18px; font-weight: 700;">
          🔬 STEM OPT Extension
        </h4>
        <div style="font-size: 28px; font-weight: 800; color: ${urgencyColor}; margin: 8px 0;">
          ${tool.daysLeft} days until deadline
        </div>
        <p style="margin: 12px 0 0 0; color: #6D28D9; font-size: 14px; line-height: 1.6;">
          ${tool.message}
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate STEM Clock section
 */
function generateStemClockSection(tool: ToolReminderDetail): string {
  const urgencyColor = tool.urgency === 'critical' ? '#DC2626' : 
                       tool.urgency === 'urgent' ? '#D97706' : '#059669';
  
  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      <div style="background: linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%); border-radius: 12px; padding: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #0F766E; font-size: 18px; font-weight: 700;">
          ⏱️ STEM Unemployment Clock
        </h4>
        <div style="font-size: 28px; font-weight: 800; color: ${urgencyColor}; margin: 8px 0;">
          ${tool.daysLeft} of 60 STEM days remaining
        </div>
        <p style="margin: 12px 0 0 0; color: #115E59; font-size: 14px; line-height: 1.6;">
          ${tool.message}
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

    const info = await sendMailWithRetry({
      from: `${process.env.EMAIL_FROM_NAME || 'Zyene Inc'} <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
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

