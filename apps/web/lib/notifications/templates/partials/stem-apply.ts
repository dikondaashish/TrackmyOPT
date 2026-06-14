import type { ToolReminderDetail } from '../../email-service';

export function generateStemApplySection(tool: ToolReminderDetail): string {
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
  let statusEmoji = '';
  let motivationalMessage = 'You have time to prepare your STEM OPT extension carefully. Start gathering documents now!';

  if (percentRemaining <= 33) {
    statusBg = '#FEF2F2';
    statusBorder = '#EF4444';
    statusEmoji = '';
    motivationalMessage = 'URGENT! Your OPT expires soon. Submit your STEM extension application immediately!';
  } else if (percentRemaining <= 66) {
    statusBg = '#FFFBEB';
    statusBorder = '#F59E0B';
    statusEmoji = '';
    motivationalMessage = 'Time is moving! Don\'t wait - apply for your STEM extension now.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          � STEM OPT Extension
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          24-Month STEM Extension Application
        </p>
      </div>

      <!-- Application Status Section -->
      <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          Your STEM Extension Status:
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
          Key Requirements for STEM Extension:
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
          Required Documents Checklist:
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
          Common STEM Extension Mistakes:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #7F1D1D; font-size: 14px; line-height: 1.8;">
          <li><strong>Avoid: Non-E-Verify Employer:</strong> Your employer MUST be enrolled in E-Verify - no exceptions!</li>
          <li><strong>Avoid: Incomplete I-983:</strong> All sections must be completed and signed by both you and employer</li>
          <li><strong>Avoid: Wrong Job Title:</strong> Job must be directly related to your STEM degree field</li>
          <li><strong>Avoid: Missing DSO Endorsement:</strong> I-20 must be updated with STEM recommendation</li>
          <li><strong>Avoid: Late Filing:</strong> Must file BEFORE your current OPT expires</li>
          <li><strong>Avoid: Part-time Work:</strong> Must work at least 20 hours per week</li>
        </ul>
      </div>

      <!-- I-983 Form Tips -->
      <div style="background: #F5F3FF; border: 1px solid #8B5CF6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
          I-983 Training Plan Tips:
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
          � Verify Your Employer's E-Verify Status:
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
          Cap-Gap Protection:
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
          Helpful Resources:
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
          Your STEM skills are in demand - keep going! </p>
      </div>

    </div>
  `;
}
