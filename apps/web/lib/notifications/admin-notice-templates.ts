import {
  buildTransactionalEmail,
  emailBodySectionOpen,
  emailBodySectionClose,
} from './email-layout';

/** Drafts: replace every bracketed field with verified incident/policy details before sending. */
export function getAdminNoticeTemplates() {
  return {
    policy_change: {
      subject: 'Important: TrackMyOPT Privacy Policy Update',
      htmlContent: buildTransactionalEmail({
        headerTitle: 'Privacy Policy Update',
        bodyHtml: `${emailBodySectionOpen()}
          <p>Hi {{firstName}},</p>
          <p>We've updated our Privacy Policy to better protect your data and comply with regulations.</p>
          <h3>Summary of Changes:</h3>
          <ul>
            <li>[Change 1]</li>
            <li>[Change 2]</li>
          </ul>
          <p>These changes take effect on [DATE].</p>
          <p><a href="https://www.trackmyopt.com/privacy" style="color: #007AFF;">Read the full Privacy Policy</a></p>
          <p>If you have questions, contact us at support@trackmyopt.com</p>
          ${emailBodySectionClose()}`,
      }),
      plainTextContent: `Hi {{firstName}}, We've updated our Privacy Policy. Visit https://www.trackmyopt.com/privacy to read the changes.`,
    },
    ownership_transfer: {
      subject: 'Important Notice: TrackMyOPT Ownership Change',
      htmlContent: buildTransactionalEmail({
        headerTitle: 'Ownership Transfer Notice',
        bodyHtml: `${emailBodySectionOpen()}
          <p>Hi {{firstName}},</p>
          <p>We're writing to inform you that TrackMyOPT (Zyene, Inc.) will be transferring ownership to [NEW OWNER].</p>
          <h3>What This Means For You:</h3>
          <ul>
            <li>Your data will be transferred to the new owner</li>
            <li>The new owner agrees to our current Privacy Policy terms</li>
            <li>You have until [DATE] to delete your account if you prefer</li>
          </ul>
          <p><a href="https://www.trackmyopt.com/dashboard/settings" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Delete My Account Before Transfer</a></p>
          <p>If you have questions, contact us at support@trackmyopt.com</p>
          ${emailBodySectionClose()}`,
      }),
      plainTextContent: `Hi {{firstName}}, TrackMyOPT ownership is being transferred. Visit https://www.trackmyopt.com/dashboard/settings to delete your account before transfer if you prefer.`,
    },
    data_breach: {
      subject: 'Security Notice: TrackMyOPT Data Incident',
      htmlContent: buildTransactionalEmail({
        headerTitle: 'Security Incident Notification',
        bodyHtml: `${emailBodySectionOpen()}
          <p>Hi {{firstName}},</p>
          <p>We are writing to inform you of a security incident that may have affected your data.</p>
          <h3>What Happened:</h3>
          <p>[Description of incident]</p>
          <h3>What Data Was Affected:</h3>
          <ul>
            <li>[List affected data types]</li>
          </ul>
          <h3>What We're Doing:</h3>
          <ul>
            <li>[Steps being taken]</li>
          </ul>
          <h3>What You Should Do:</h3>
          <ul>
            <li>Change your password if you use the same password elsewhere</li>
            <li>Monitor your accounts for suspicious activity</li>
          </ul>
          <p>We sincerely apologize for this incident. Contact us at support@trackmyopt.com with any questions.</p>
          ${emailBodySectionClose()}`,
      }),
      plainTextContent: `SECURITY NOTICE: Hi {{firstName}}, We're informing you of a security incident. Please contact support@trackmyopt.com for details.`,
    },
  };
}
