/**
 * Email Service - Handles all email sending via SMTP (Hostinger)
 * 
 * Features:
 * - Daily reminder emails
 * - Urgency-based messaging
 * - Beautiful HTML templates
 * - Apple-inspired design
 */

import { createClient } from '@supabase/supabase-js';
import { getSmtpFromHeader, sendMailWithRetry } from './email-smtp';
import { sendPremiumWelcomeQueuedEmail } from './transactional-emails';
import {
  EMAIL,
  emailBrandHeaderWithLogo,
  emailFooter,
  emailOuterClose,
  emailOuterOpen,
  emailTextLead,
  emailTextMuted,
  emailTextP,
} from './email-brand';
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailOtpBox,
  emailPrimaryButton,
} from './email-layout';
import {
  getDailyReminderSubject,
  renderDailyReminderEmailHtml,
} from './templates/daily-reminder-html';

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
      from: getSmtpFromHeader(),
      to: data.userEmail,
      subject: getDailyReminderSubject(data.tools),
      html: renderDailyReminderEmailHtml(data),
    });

    console.log('Daily reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Daily reminder email service error:', error);
    return { success: false, error };
  }
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
      from: getSmtpFromHeader(),
      to: email,
      subject: 'Your TrackMyOPT data export verification code',
      html: buildTransactionalEmail({
        headerTitle: 'Data export verification',
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead('Use the code below to finish your export')}
${emailTextP(
  `${firstName ? `Hi ${firstName}, ` : ''}You requested an export of your data. Enter this code to continue:`
)}
${emailOtpBox(otp)}
${emailTextMuted("Expires in 10 minutes. If you didn&rsquo;t request this, you can ignore this email.")}
${emailBodySectionClose()}`,
      }),
    });

    console.log('Export OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Export OTP email service error:', error);
    return { success: false, error };
  }
}

// removed: sendVerificationEmail — no double opt-in / notification-email verification flow implemented.
// Re-add when wiring email_preferences confirmation with email_type: email_verified + email_queue.

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
  /** Accent for header underline & CTA (tool family color) */
  accent: string;
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
        accent: EMAIL.accent.optApply,
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
        accent: EMAIL.accent.optClock,
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
        accent: EMAIL.accent.stemApply,
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
        accent: EMAIL.accent.stemClock,
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
        accent: EMAIL.accent.documents,
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
        accent: EMAIL.accent.caseStatus,
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
        accent: EMAIL.accent.default,
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

/** Build enrollment HTML (tool onboarding) — shared by send + preview catalog */
export function buildEnrollmentEmailHtml(
  firstName: string,
  toolName: string,
  data?: EnrollmentEmailData
): { subject: string; html: string } {
  const content = getToolEnrollmentContent(toolName, data);
  const chromeExtensionUrl =
    "https://chromewebstore.google.com/detail/trackmyopt/hfljbefkccdmlnhclfojlafipjnjbajm";
  const dashPath =
    toolName === "case-status" ? "case-status" : `opt-tools/${toolName}`;

  const html = `
        ${emailOuterOpen()}
        <div style="background:${EMAIL.bgCard};border-radius:12px;overflow:hidden;border:1px solid ${EMAIL.border};box-shadow:0 1px 3px rgba(15,23,42,0.08);">
            ${emailBrandHeaderWithLogo({ title: content.title, accentBottom: content.accent })}
            <div class="tmo-force-card" style="padding:16px 24px 0 24px;background:${EMAIL.bgCard};">
              ${content.subtitle ? emailTextLead(content.subtitle) : ""}
            </div>

            <div style="background:${EMAIL.bgCard};border-left:4px solid ${content.accent};padding:14px 20px;margin:0;">
              <p style="margin:0;color:${EMAIL.textSecondary};font-size:14px;line-height:1.5;">
                <strong style="color:${EMAIL.text};">Enrollment confirmed</strong> — ${content.title}
              </p>
            </div>

            <div class="tmo-force-card" style="background:${EMAIL.bgCard};padding:28px 24px;">
              
              <p style="margin: 0 0 16px 0; color: ${EMAIL.textSecondary}; font-size: 15px; line-height: 1.6;">
                Hi <strong>${firstName || "there"}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; color: ${EMAIL.textSecondary}; font-size: 15px; line-height: 1.6;">
                You&apos;re enrolled in <strong>${content.title}</strong>. We&apos;ll use this channel to send reminders and updates you&apos;ve opted into for this tool.
              </p>

              ${content.timelineHtml}
              ${content.preparationHtml}
              ${content.tipsHtml}

              <div style="background:${EMAIL.borderLight};border-radius:8px;border:1px solid ${EMAIL.border};padding:18px 18px;margin:20px 0;">
                <h3 style="margin:0 0 12px 0;color:${EMAIL.text};font-size:15px;font-weight:600;">What to expect</h3>
                ${content.whatToExpectHtml}
              </div>

              <div style="text-align:center;margin:28px 0 20px 0;">
                <a href="https://www.trackmyopt.com/dashboard/${dashPath}"
                   style="display:inline-block;background:${content.accent};color:#fff!important;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">
                  Open ${content.title}
                </a>
              </div>

              <div style="padding:18px 0 0 0;border-top:1px solid ${EMAIL.border};margin-top:8px;">
                <p style="margin:0 0 6px 0;color:${EMAIL.textMuted};font-size:13px;">
                  Manage email preferences anytime in
                  <a href="https://www.trackmyopt.com/dashboard/settings?tab=notifications" style="color:${EMAIL.link};text-decoration:none;font-weight:600;">Settings → Notifications</a>.
                </p>
              </div>
            </div>

            <div style="background:${EMAIL.borderLight};padding:20px 24px;text-align:center;border-top:1px solid ${EMAIL.border};">
              <p style="margin:0 0 10px 0;color:${EMAIL.textMuted};font-size:13px;">Find TrackMyOPT useful? Leave a review on the Chrome Web Store.</p>
              <a href="${chromeExtensionUrl}" style="color:${EMAIL.link};text-decoration:none;font-size:13px;font-weight:600;">Rate TrackMyOPT →</a>
            </div>

            ${emailFooter()}
        </div>
        ${emailOuterClose()}
      `;

  return {
    subject: `Welcome to ${content.title} — TrackMyOPT`,
    html,
  };
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
    const { subject, html } = buildEnrollmentEmailHtml(firstName, toolName, data);

    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject,
      html,
    });

    console.log('Enrollment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Enrollment email service error:', error);
    return { success: false, error };
  }
}

/**
 * Short confirmation when the user saves their shared notification email from
 * Settings (no toolType) — does not imply Document Vault / tool enrollment.
 */
export async function sendNotificationPreferencesSavedEmail(email: string, firstName: string) {
  try {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const dashSettings =
      (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.trackmyopt.com').replace(
        /\/$/,
        ''
      ) + '/dashboard/settings?tab=notifications';
    const greeting = esc(firstName && firstName.trim() ? firstName.trim() : 'there');
    const safeEmail = esc(email.trim());
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject: 'Your TrackMyOPT notification email is saved',
      text: `Hi ${firstName && firstName.trim() ? firstName.trim() : 'there'},

We saved this address for TrackMyOPT notifications: ${email.trim()}

You'll receive important updates, case and document reminders (when enabled), and other messages you opt into at this address.

Manage preferences anytime:
${dashSettings}

— TrackMyOPT
support@trackmyopt.com`,
      html: buildTransactionalEmail({
        headerTitle: 'Notification email saved',
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(`Hi <strong>${greeting}</strong>,`)}
${emailTextP('We saved this address for your <strong>notification email</strong>:')}
${emailTextP(`<span class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:600;word-break:break-all;">${safeEmail}</span>`)}
${emailTextP(
  'You may receive case updates, document reminders (when you use those features), and other messages you opt into at this address.'
)}
${emailPrimaryButton(dashSettings, 'Notification settings')}
${emailTextMuted('Questions? <a href="mailto:support@trackmyopt.com" class="tmo-force-link" style="color:#2563EB !important;">support@trackmyopt.com</a>')}
${emailBodySectionClose()}`,
      }),
    });
    console.log('Notification preferences confirmation sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('sendNotificationPreferencesSavedEmail error:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new premium user (email_queue + SMTP; deduped per user via premium_welcome).
 */
export async function sendPremiumWelcomeEmail(userId: string, email: string, name: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const result = await sendPremiumWelcomeQueuedEmail({
      supabase,
      userId,
      toEmail: email,
      firstName: name,
    });
    if (result.ok) {
      if (result.skipped === false) {
        console.log('Premium welcome email queued/sent:', result.queueId);
        return { success: true, messageId: result.queueId };
      }
      console.log('Premium welcome skipped:', result.skipped);
      return { success: true, messageId: 'skipped' };
    }
    return { success: false, error: 'error' in result ? result.error : undefined };
  } catch (error) {
    console.error('Premium welcome email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send email change notification
 */
export async function sendEmailChangeNotification(userId: string, email: string) {
  try {
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject: "Your email address was updated",
      html: buildTransactionalEmail({
        headerTitle: 'Email address updated',
        bodyHtml: `
${emailBodySectionOpen()}
${emailTextP('Hello,')}
${emailTextP('Your email address for TrackMyOPT was recently updated to this address.')}
${emailTextP('If you did not make this change, please contact support immediately.')}
${emailTextMuted('&mdash; TrackMyOPT Team')}
${emailBodySectionClose()}`,
      }),
    });

    console.log('Email change notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email change notification error:', error);
    return { success: false, error };
  }
}

