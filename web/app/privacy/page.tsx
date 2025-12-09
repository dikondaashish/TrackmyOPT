import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TrackMyOPT',
  description: 'Privacy Policy for TrackMyOPT - OPT & STEM OPT Toolkit',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: December 9, 2025
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            TrackMyOPT is a product of <strong>Zyene, Inc.</strong>, a company incorporated in the State of Delaware, with headquarters located in San Francisco, California. TrackMyOPT ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chrome extension and web application.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>When you create an account or sign in, we collect:</p>
          <ul>
            <li><strong>Email address</strong>: For account creation and authentication</li>
            <li><strong>Name</strong>: First and last name (for Google OAuth or manual sign-up)</li>
            <li><strong>Password</strong>: Encrypted and stored securely (manual sign-up only)</li>
          </ul>

          <h3>OPT & Immigration Data</h3>
          <p>You may voluntarily provide:</p>
          <ul>
            <li>Program End Date</li>
            <li>DSO Recommendation Date</li>
            <li>OPT EAD End Date</li>
            <li>OPT Start Date</li>
            <li>STEM OPT Start Date</li>
            <li>Employment history and dates</li>
            <li>STEM eligibility status</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Browser type and version</li>
            <li>Extension version</li>
            <li>Timezone (for accurate date calculations)</li>
            <li>Authentication timestamps</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Calculate OPT filing windows and deadlines</li>
            <li>Send reminders about critical dates (if you opt-in to email notifications)</li>
            <li>Authenticate your account and secure your data</li>
            <li>Improve our services and user experience</li>
            <li>Respond to your support requests</li>
          </ul>

          <h2>Data Storage and Security</h2>
          
          <h3>Where We Store Data</h3>
          <p>
            Your data is stored securely using <strong>Supabase</strong>, a PostgreSQL database with enterprise-grade security:
          </p>
          <ul>
            <li>Encrypted at rest and in transit (TLS/SSL)</li>
            <li>Row-Level Security (RLS) policies ensure you can only access your own data</li>
            <li>Regular backups and disaster recovery</li>
            <li>SOC 2 Type II compliant infrastructure</li>
          </ul>

          <h3>Local Storage</h3>
          <p>The Chrome extension stores:</p>
          <ul>
            <li><strong>Authentication tokens</strong>: Short-lived JWT tokens (10-minute expiry) in <code>chrome.storage.sync</code></li>
            <li><strong>Session state</strong>: Sign-in status and timestamps</li>
          </ul>
          <p>
            These are stored locally on your device and synchronized across your Chrome browsers if you're signed into Chrome.
          </p>

          <h2>Data Sharing and Disclosure</h2>
          <p>
            <strong>We do NOT sell, rent, or share your personal information with third parties</strong> except in the following limited circumstances:
          </p>

          <h3>Service Providers</h3>
          <ul>
            <li><strong>Supabase</strong>: Database and authentication (privacy policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>)</li>
            <li><strong>Hostinger SMTP</strong>: Email notifications via our own domain (emails sent from @trackmyopt.com)</li>
            <li><strong>Google OAuth</strong>: If you sign in with Google (privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>)</li>
            <li><strong>Stripe</strong>: Payment processing for premium features (privacy policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>)</li>
          </ul>
          <p>
            <strong>All third-party service providers are contractually bound</strong> to protect your data in accordance with this Privacy Policy and are prohibited from using your data for any purpose other than providing their services to TrackMyOPT.
          </p>

          <h3>Legal Requirements</h3>
          <p>We may disclose your information if required by law or in response to valid legal requests.</p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong>: Request a copy of your personal data</li>
            <li><strong>Correction</strong>: Update or correct your information in the app settings</li>
            <li><strong>Deletion</strong>: Request deletion of your account and all associated data</li>
            <li><strong>Portability</strong>: Export your data in a machine-readable format</li>
            <li><strong>Opt-out</strong>: Unsubscribe from email notifications at any time</li>
          </ul>

          <p>
            To exercise these rights, please contact us at: <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a>
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active. If your account becomes dormant (no login for 24 months), we will notify you before taking any action on your data.
          </p>
          <p>If you delete your account:</p>
          <ul>
            <li>All personal data is permanently deleted within 30 days</li>
            <li>Aggregated, anonymized data may be retained for analytics</li>
          </ul>

          <h2>Data Breach Notification</h2>
          <p>
            In the unlikely event of a data breach affecting your personal information, we will:
          </p>
          <ul>
            <li>Notify affected users via email within 72 hours of discovery</li>
            <li>Provide details about what data was compromised</li>
            <li>Explain what steps we are taking to address the breach</li>
            <li>Provide instructions on actions you may take to protect yourself</li>
            <li>Report to relevant authorities as required by law</li>
          </ul>

          <h2>Business Transfers</h2>
          <p>
            If TrackMyOPT is involved in a merger, acquisition, or sale of assets:
          </p>
          <ul>
            <li>We will notify you via email and/or prominent notice on our website before your data is transferred</li>
            <li>Your data will only be transferred to entities that agree to protect your data consistent with this Privacy Policy</li>
            <li>You will have the option to delete your account and data before any transfer</li>
          </ul>
          <p>
            If TrackMyOPT ceases operations, we will provide at least 30 days' notice and securely delete all user data.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            We use minimal cookies for authentication and session management:
          </p>
          <ul>
            <li><strong>Supabase auth cookies</strong>: For maintaining your sign-in session</li>
            <li><strong>No third-party tracking</strong>: We do NOT use Google Analytics or other tracking tools</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>
            TrackMyOPT is intended for F-1 students (typically 18+). We do not knowingly collect information from anyone under 13.
          </p>

          <h2>International Users</h2>
          <p>
            Your data is stored in the United States. By using TrackMyOPT, you consent to the transfer of your information to the U.S.
          </p>

          <h2>California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul>
            <li><strong>Right to Know</strong>: You may request information about the categories and specific pieces of personal information we have collected about you</li>
            <li><strong>Right to Delete</strong>: You may request deletion of your personal information</li>
            <li><strong>Right to Opt-Out</strong>: You have the right to opt-out of the sale of personal information. Note: We do NOT sell personal information</li>
            <li><strong>Right to Non-Discrimination</strong>: We will not discriminate against you for exercising your privacy rights</li>
          </ul>
          <p>
            To exercise your CCPA rights, please contact us at <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a>. We will respond to verified requests within 45 days.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we make changes:
          </p>
          <ul>
            <li>We will update the "Last Updated" date at the top of this page</li>
            <li>For material changes, we will send an email notification to all registered users</li>
            <li>We will provide a <strong>plain-language summary</strong> of what has changed</li>
            <li>For significant changes, we will request your <strong>active consent</strong> (e.g., checkbox confirmation) before the changes take effect</li>
            <li>You will have the opportunity to review changes and delete your account if you do not agree</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li><strong>Company</strong>: Zyene, Inc.</li>
            <li><strong>Headquarters</strong>: San Francisco, California</li>
            <li><strong>Email</strong>: <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a></li>
            <li><strong>Website</strong>: <a href="https://trackmyopt.com">trackmyopt.com</a></li>
          </ul>

          <hr className="my-8" />

          <p className="text-sm text-gray-600 dark:text-gray-400">
            By using TrackMyOPT, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </main>
  );
}

