import type { ToolReminderDetail } from '../../email-service';
import { emailChecklistItem, emailSectionHeading } from '../../email-icons';

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
      emoji: '',
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
      emoji: '',
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
      emoji: '',
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
      actionHeadline: 'Urgent - Submit Your Application Soon',
    };
  } else if (percentRemaining > 10) {
    return {
      emoji: '',
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
      actionHeadline: 'CRITICAL - Submit TODAY!',
    };
  } else {
    return {
      emoji: '',
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
      actionHeadline: 'EMERGENCY - SUBMIT IMMEDIATELY!',
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
      '<strong>Finalize your application package</strong> this week',
      'Make copies of all documents before mailing',
      'Use <strong>USPS certified mail with tracking</strong>',
      'Mail to the correct USCIS lockbox address for your state',
      'Save your tracking number and check delivery confirmation',
    ];
  } else if (percentRemaining > 10) {
    return [
      '<strong>Submit your application TODAY</strong>',
      'If not submitted, contact your DSO immediately for emergency assistance',
      'Consider premium processing if available for your case type',
      'Use overnight shipping (FedEx/UPS) if mailing',
      'Verify the lockbox address before sending',
    ];
  } else {
    return [
      '<strong>SUBMIT IMMEDIATELY</strong> - Every hour counts!',
      'Contact your DSO for emergency support',
      'Use overnight shipping only at this point',
      'Keep proof of submission with timestamp',
      'Prepare contingency plans in case of issues',
    ];
  }
}

export function generateOptApplySection(tool: ToolReminderDetail): string {
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
          OPT Application Dates
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          Track Your OPT Filing Window
        </p>
      </div>

      <!-- Application Status Section -->
      <div style="background: ${urgencyConfig.actionBg}; border: 1px solid ${urgencyConfig.actionBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          Your Application Status:
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
          ${urgencyConfig.actionHeadline}
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          ${actionItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <!-- Required Documents Checklist -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          Required Documents Checklist:
        </h3>
        <ul style="margin: 0; padding: 0; color: #374151; font-size: 14px; line-height: 1.8;">
          ${emailChecklistItem("<strong>Form I-765</strong> - Application for Employment Authorization (completed & signed)")}
          ${emailChecklistItem("<strong>Form I-20</strong> - with OPT recommendation from DSO (<strong>must be signed by you!</strong>)")}
          ${emailChecklistItem("<strong>2 Passport Photos</strong> - 2x2 inches, white background, taken within 30 days")}
          ${emailChecklistItem("<strong>Passport Copy</strong> - Bio page and visa stamp")}
          ${emailChecklistItem("<strong>I-94</strong> - Most recent arrival/departure record")}
          ${emailChecklistItem("<strong>Previous EAD Cards</strong> - If any (copies)")}
          ${emailChecklistItem("<strong>Filing Fee</strong> - $470 (online) or $520 (paper filing)")}
        </ul>
      </div>

      <!-- Common Mistakes to Avoid -->
      <div style="background: #FEF2F2; border: 2px solid #DC2626; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #991B1B; font-size: 16px; font-weight: 700;">
          Common Mistakes That Cause Denials/RFEs:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
          <li><strong>Avoid: Unsigned I-20:</strong> ALWAYS sign your I-20 before submitting - unsigned = automatic denial!</li>
          <li><strong>Avoid: Wrong Photo Size:</strong> Must be exactly 2x2 inches with white background</li>
          <li><strong>Avoid: Expired Passport:</strong> Passport must be valid for at least 6 months</li>
          <li><strong>Avoid: Missing Signature on I-765:</strong> Sign the form in black ink only</li>
          <li><strong>Avoid: Wrong Filing Address:</strong> Use the correct USCIS Lockbox address for your state</li>
          <li><strong>Avoid: Late Filing:</strong> Apply within 30 days AFTER DSO recommends OPT in SEVIS</li>
          <li><strong>Avoid: Working Before EAD:</strong> Never work before your EAD card arrives AND start date begins</li>
        </ul>
      </div>

      <!-- How Successful Applicants Apply -->
      <div style="background: #F5F3FF; border: 1px solid #8B5CF6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
          How Successful Applicants Apply:
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
          ${emailSectionHeading("Where to Submit Your Application:", "link", "#9D174D")}
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
          Expected Processing Timeline:
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
          Helpful Resources:
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
          We're here to help you succeed! </p>
      </div>

    </div>
  `;
}
