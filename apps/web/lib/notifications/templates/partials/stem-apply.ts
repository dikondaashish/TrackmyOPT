import { renderStemFilingTimeline } from '../../stem-filing-email';
import type { ToolReminderDetail } from '../../email-service';
import { emailChecklistItem, emailIcon, emailSectionHeading } from '../../email-icons';

export function generateStemApplySection(tool: ToolReminderDetail): string {
  return `
    <div style="padding: 24px 28px; border-bottom: 1px solid #E5E7EB;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">
          ${emailIcon("graduationCap", { size: 22, color: "#ffffff" })}<span style="vertical-align:middle;"> STEM OPT Extension</span>
        </h2>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
          24-Month STEM Extension Application
        </p>
      </div>

      ${renderStemFilingTimeline(tool.stemFiling)}

      <!-- STEM Extension Requirements -->
      <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 600;">
          Key Requirements for STEM Extension:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li><strong>STEM Degree:</strong> Your degree must be on the STEM Designated Degree Program List</li>
          <li><strong>E-Verify Employer:</strong> Your employer MUST be enrolled in E-Verify</li>
          <li><strong>Form I-983:</strong> Training Plan signed by you and your employer</li>
          <li><strong>Timely Filing:</strong> Apply up to 90 days before OPT expires and within 60 days of your DSO entering the STEM recommendation in SEVIS. The earlier deadline controls.</li>
          <li><strong>Automatic extension:</strong> A timely and properly filed STEM application may extend work authorization for up to 180 days while pending, ending sooner upon a USCIS decision.</li>
        </ul>
      </div>

      <!-- Required Documents Checklist -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          Required Documents Checklist:
        </h3>
        <ul style="margin: 0; padding: 0; color: #374151; font-size: 14px; line-height: 1.8;">
          ${emailChecklistItem("<strong>Form I-765</strong> - Application for Employment Authorization")}
          ${emailChecklistItem("<strong>Form I-983</strong> - Training Plan for STEM OPT Students (signed by employer)")}
          ${emailChecklistItem("<strong>Form I-20</strong> - with STEM OPT recommendation from DSO")}
          ${emailChecklistItem("<strong>Copy of Current EAD</strong> - Front and back")}
          ${emailChecklistItem("<strong>Copy of STEM Degree</strong> - Diploma or official transcript")}
          ${emailChecklistItem("<strong>2 Passport Photos</strong> - 2x2 inches, white background")}
          ${emailChecklistItem("<strong>Passport Copy</strong> - Bio page (valid for 6+ months)")}
          ${emailChecklistItem("<strong>Filing Fee</strong> - <a href=\"https://www.uscis.gov/g-1055\">Check the current USCIS fee schedule</a>")}
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
          <li><strong>Avoid: Late Filing:</strong> Must meet BOTH the EAD expiration and 60-day STEM recommendation deadlines</li>
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
          ${emailSectionHeading("Verify Your Employer's E-Verify Status:", "shield", "#92400E")}
        </h3>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.6;">
          Before applying, confirm your employer is enrolled in E-Verify:
        </p>
        <a href="https://www.e-verify.gov/about-e-verify/e-verify-data/how-to-find-participating-employers" 
           style="display: inline-block; background: #F59E0B; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Check E-Verify Status →
        </a>
      </div>

      <!-- Automatic extension information -->
      <div style="background: #ECFDF5; border: 1px solid #10B981; border-top: none; padding: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #065F46; font-size: 16px; font-weight: 600;">
          Automatic STEM OPT Extension:
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>A timely and properly filed STEM OPT application may extend work authorization for <strong>up to 180 days</strong></li>
          <li>This extension applies while the STEM application is pending and ends earlier if USCIS decides it</li>
          <li>Keep your receipt notice as proof of pending application</li>
          <li>Confirm your work authorization with your DSO</li>
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
          Review your saved dates and confirm your filing requirements with your DSO.
        </p>
        <p style="margin: 0; color: #7C3AED; font-size: 14px; font-weight: 600;">
          Your STEM skills are in demand - keep going! </p>
      </div>

    </div>
  `;
}
