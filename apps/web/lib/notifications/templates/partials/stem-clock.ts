import type { ToolReminderDetail } from '../../email-service';

export function generateStemClockSection(tool: ToolReminderDetail): string {
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
  let statusEmoji = '';
  let motivationalMessage = 'You have time to find the right opportunity! Focus on quality applications and networking.';

  if (percentRemaining <= 33) {
    statusBg = '#FEF2F2';
    statusBorder = '#EF4444';
    statusEmoji = '';
    motivationalMessage = 'Time is critical! Intensify your job search immediately - consider all options including NGOs and internships.';
  } else if (percentRemaining <= 66) {
    statusBg = '#FFFBEB';
    statusBorder = '#F59E0B';
    statusEmoji = '';
    motivationalMessage = 'Stay focused on your job search. Consistency is key - apply daily and follow up on applications.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          STEM Unemployment Clock
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          Track Your 60-Day STEM Unemployment Limit
        </p>
      </div>

      <!-- STEM Status Section -->
      <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          Your STEM Unemployment Status:
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
          Strategic Job Search Approach:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>Apply to <strong>10-15 quality jobs daily</strong> - focus on STEM roles matching your degree</li>
          <li>Target <strong>E-Verify employers</strong> (required for STEM OPT)</li>
          <li>Unlock high-paying STEM roles for contract and consulting opportunities</li>
          <li>Network with professionals in your field on LinkedIn</li>
          <li>Consider <strong>H-1B sponsoring companies</strong> for long-term opportunities</li>
        </ul>
      </div>

      <!-- Top Job Search Resources for STEM -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          � STEM-Focused Job Resources:
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
          Critical STEM OPT Employment Rules:
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
          H-1B Planning (Think Ahead):
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
          Important SEVP Reminders:
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
          Your STEM expertise is valuable - the right opportunity is out there! </p>
      </div>

    </div>
  `;
}
