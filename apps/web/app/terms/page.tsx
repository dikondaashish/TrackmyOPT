import { Metadata } from 'next';
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Terms & Conditions | TrackMyOPT',
  description: 'Terms and Conditions for TrackMyOPT - OPT & STEM OPT Toolkit',
  alternates: {
    canonical: 'https://www.trackmyopt.com/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-100 relative">
      {/* Careerflow-inspired Vignette Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 1. Base Layer: Soft White/Zinc */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950" />

        {/* 2. Top-Center Highlights (Sunlight effect) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />

        {/* 3. Vignette Edges (Depth) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        <LandingNavbar />

        <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Terms & Conditions</h1>

            <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-12 uppercase tracking-widest">
              Last Updated: December 12, 2025
            </p>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none 
              prose-headings:text-gray-900 dark:prose-headings:text-white 
              prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-gray-600 dark:prose-p:text-gray-400
              prose-li:text-gray-600 dark:prose-li:text-gray-400
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-hr:border-gray-200 dark:prose-hr:border-white/10">

              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to TrackMyOPT, a product of <strong>Zyene, Inc.</strong>, a company incorporated in the State of Delaware, with headquarters located in San Francisco, California. By accessing or using our Chrome extension and web application (collectively, the "Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                TrackMyOPT is a toolkit designed to help F-1 international students manage their Optional Practical Training (OPT) and STEM OPT timelines. Our Service provides:
              </p>
              <ul>
                <li>OPT and STEM OPT application deadline calculations</li>
                <li>Real-time unemployment day tracking</li>
                <li>Timeline visualization and reminders</li>
                <li>Document vault for storing immigration documents</li>
                <li>USCIS Case Status Tracking using your receipt number</li>
                <li>Email notifications for important dates (optional, premium feature)</li>
              </ul>

              <h2>3. Eligibility</h2>
              <p>
                You must be at least 18 years old to use TrackMyOPT. By using our Service, you represent that you meet this requirement.
              </p>

              <h2>4. User Accounts</h2>

              <h3>4.1 Account Creation</h3>
              <p>
                To use certain features of TrackMyOPT, you must create an account. You may sign up using:
              </p>
              <ul>
                <li><strong>Manual Sign-Up</strong>: Email and password</li>
                <li><strong>Google OAuth</strong>: Sign in with your Google account</li>
              </ul>

              <h3>4.2 Account Security</h3>
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h3>4.3 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activity.
              </p>

              <h2>5. User Data and Privacy</h2>
              <p>
                Your use of TrackMyOPT is also governed by our <a href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>. By using our Service, you consent to our collection and use of your information as described in the Privacy Policy.
              </p>

              <h3>5.1 Personal Identifiable Information (PII)</h3>
              <p>
                Certain features of TrackMyOPT require you to provide Personal Identifiable Information (PII), including:
              </p>
              <ul>
                <li><strong>USCIS Receipt Number</strong>: If you use our Case Status Tracking feature, you may provide your 13-character USCIS receipt number (e.g., EAC1234567890). This is used exclusively to check your case status via the public USCIS Case Status Online system.</li>
                <li><strong>Email Address</strong>: Used for account authentication and optional notifications.</li>
                <li><strong>Immigration Dates</strong>: OPT/STEM dates you voluntarily provide for timeline calculations.</li>
              </ul>
              <p>
                We treat all PII with the highest level of security. Your USCIS receipt number and other sensitive data are encrypted and never shared with third parties. See our <a href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a> for complete details on how we collect, use, and protect your data.
              </p>

              <h2>6. Acceptable Use</h2>

              <h3>6.1 Permitted Use</h3>
              <p>
                TrackMyOPT is intended solely for personal, non-commercial use to help you manage your OPT and STEM OPT timelines.
              </p>

              <h3>6.2 Prohibited Activities</h3>
              <p>You agree NOT to:</p>
              <ul>
                <li>Use the Service for any illegal purpose or in violation of U.S. immigration laws</li>
                <li>Provide false or misleading information</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use automated tools (bots, scrapers) to access the Service</li>
                <li>Resell, redistribute, or commercialize the Service without permission</li>
                <li>Interfere with or disrupt the Service's operation</li>
              </ul>

              <h2>7. Disclaimer of Warranties</h2>

              <p className="font-semibold text-gray-900 dark:text-white">
                IMPORTANT: TRACKMYOPT IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              </p>

              <h3>7.1 No Immigration Advice</h3>
              <p>
                <strong>TrackMyOPT is NOT a substitute for professional immigration advice.</strong> We are not immigration attorneys, and our Service does not constitute legal advice. You should:
              </p>
              <ul>
                <li>Consult with your Designated School Official (DSO) before making OPT decisions</li>
                <li>Verify all dates and deadlines independently</li>
                <li>Seek legal counsel if you have immigration questions</li>
              </ul>

              <h3>7.2 Accuracy of Information</h3>
              <p>
                While we strive to provide accurate calculations and timelines, we make NO guarantees regarding:
              </p>
              <ul>
                <li>The accuracy of date calculations or deadline estimates</li>
                <li>The completeness of checklists or resources</li>
                <li>The timeliness of email notifications</li>
              </ul>

              <h3>7.3 Service Availability</h3>
              <p>
                We do not guarantee that the Service will be:
              </p>
              <ul>
                <li>Available at all times without interruption</li>
                <li>Free from errors, bugs, or security vulnerabilities</li>
                <li>Compatible with all devices or browsers</li>
              </ul>

              <h2>8. Limitation of Liability</h2>

              <p className="font-semibold text-gray-900 dark:text-white">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRACKMYOPT AND ITS DEVELOPERS SHALL NOT BE LIABLE FOR:
              </p>
              <ul>
                <li>Any immigration consequences, denied applications, or visa issues arising from use of our Service</li>
                <li>Lost data, missed deadlines, or inaccurate calculations</li>
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any damages exceeding $100 USD</li>
              </ul>

              <p>
                You acknowledge that <strong>you are solely responsible</strong> for managing your OPT status and meeting USCIS deadlines.
              </p>

              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless TrackMyOPT, its developers, and affiliates from any claims, damages, losses, or expenses arising from:
              </p>
              <ul>
                <li>Your violation of these Terms</li>
                <li>Your use or misuse of the Service</li>
                <li>Your violation of any third-party rights</li>
              </ul>

              <h2>10. Intellectual Property</h2>

              <h3>10.1 Our Rights</h3>
              <p>
                All content, features, and functionality of TrackMyOPT (including code, design, logos, and text) are owned by TrackMyOPT and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3>10.2 Your Rights</h3>
              <p>
                We grant you a limited, non-exclusive, non-transferable license to use TrackMyOPT for personal use only. This license does NOT include:
              </p>
              <ul>
                <li>The right to modify, copy, or distribute the Service</li>
                <li>The right to create derivative works</li>
                <li>Commercial use without written permission</li>
              </ul>

              <h2>11. Third-Party Services</h2>
              <p>
                TrackMyOPT integrates with third-party services:
              </p>
              <ul>
                <li><strong>Supabase</strong>: Database and authentication</li>
                <li><strong>Google OAuth</strong>: Sign-in option</li>
                <li><strong>Hostinger SMTP</strong>: Email notifications via our own domain (emails sent from @trackmyopt.com)</li>
                <li><strong>USCIS Case Status Online</strong>: We query the public USCIS case status system (egov.uscis.gov) on your behalf to retrieve your case status. We do not store or share any data with USCIS.</li>
              </ul>
              <p>
                Your use of these services is subject to their respective terms and privacy policies. We are not responsible for third-party services.
              </p>

              <h2>12. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective upon posting. We will notify you of material changes via:
              </p>
              <ul>
                <li>Email notification (if you have an account)</li>
                <li>In-app notification</li>
                <li>Updating the "Last Updated" date</li>
              </ul>
              <p>
                Your continued use of TrackMyOPT after changes constitutes acceptance of the new Terms.
              </p>

              <h2>13. Governing Law and Dispute Resolution</h2>

              <h3>13.1 Governing Law</h3>
              <p>
                These Terms are governed by the laws of the United States and the State of Delaware, without regard to conflict of law principles.
              </p>

              <h3>13.2 Dispute Resolution</h3>
              <p>
                Any disputes arising from these Terms or your use of TrackMyOPT shall be resolved through:
              </p>
              <ol>
                <li><strong>Informal Negotiation</strong>: Contact us at <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a> to resolve disputes informally</li>
                <li><strong>Arbitration</strong>: If informal resolution fails, disputes will be resolved through binding arbitration in accordance with the American Arbitration Association rules</li>
              </ol>

              <h2>14. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
              </p>

              <h2>15. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and TrackMyOPT regarding your use of the Service.
              </p>

              <h2>16. Contact Information</h2>
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              <ul>
                <li><strong>Company</strong>: Zyene, Inc.</li>
                <li><strong>Headquarters</strong>: San Francisco, California</li>
                <li><strong>Email</strong>: <a href="mailto:support@trackmyopt.com">support@trackmyopt.com</a></li>
                <li><strong>Website</strong>: <a href="https://www.trackmyopt.com">trackmyopt.com</a></li>
              </ul>

              <hr className="my-8" />

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-8 rounded-xl">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  ⚠️ DISCLAIMER
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 leading-relaxed">
                  TrackMyOPT is an independent tool and is NOT affiliated with, endorsed by, or associated with the U.S. Citizenship and Immigration Services (USCIS), Department of Homeland Security (DHS), or any educational institution. Always verify information with your DSO and official USCIS resources.
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                By creating an account and using TrackMyOPT, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>

        <LandingFooter />
      </div>
    </main>
  );
}
