import type { ToolReminderDetail } from '../../email-service';

export function generateOptClockSection(tool: ToolReminderDetail): string {
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
  let statusEmoji = '';
  let motivationalMessage = 'You have time on your side! Stay consistent and you\'ll find the right opportunity.';

  if (percentRemaining <= 33) {
    statusBg = '#FEF2F2';
    statusBorder = '#EF4444';
    statusEmoji = '';
    motivationalMessage = 'Time is running short! Intensify your job search efforts immediately.';
  } else if (percentRemaining <= 66) {
    statusBg = '#FFFBEB';
    statusBorder = '#F59E0B';
    statusEmoji = '';
    motivationalMessage = 'You\'re making progress! Stay focused and consistent with your job search.';
  }

  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          OPT Unemployment Clock
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          Track Your 90-Day Unemployment Limit
        </p>
      </div>

      <!-- OPT Status Section -->
      <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
          Your OPT Status:
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
          Strategic Approach:
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
          � Top Job Search Resources:
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
          � Skill Building:
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
          Critical Reminder:
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
          Stay strong and keep pushing forward! �
        </p>
      </div>

    </div>
  `;
}
