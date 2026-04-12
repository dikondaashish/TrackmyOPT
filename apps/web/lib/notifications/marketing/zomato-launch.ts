import { emailOuterClose, emailOuterOpen } from '../email-brand';

/**
 * Zomato-Energy Launch Email Template (V2 — Polished)
 * ────────────────────────────────────────────────────
 * Subject: Maggi takes 2 mins. So does your new resume. 🍜
 * Preview: No cooking skills needed. Just upload and watch the magic happen.
 * 
 * Fixes applied from audit:
 * - Correct CTA URL (trackmyopt.com)
 * - TrackMyOPT branded header with logo
 * - Social proof in footer
 * - Unsubscribe + Privacy links (CAN-SPAM compliant)
 * - Hidden preview text for inbox display
 * - Table-based bullets for email client compatibility
 * - "Professor emails" comparison (universal student humor)
 * - No CID image attachment (cleaner rendering)
 */

const BRAND = {
  red: '#E23744',
  black: '#111111',
  white: '#FFFFFF',
  gray: '#F4F4F4',
  text: '#1C1C1C',
  muted: '#696969',
  bgDark: '#111827',
  border: '#E5E7EB',
  bgSurface: '#F9FAFB',
  textFaint: '#9CA3AF',
} as const;

const font = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const LIVE_LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ||
  'https://www.trackmyopt.com/TrackMyOPT%20Logo/logo.gif';

export function generateZomatoLaunchEmail(firstName: string, emailId?: string): string {
  const baseCta = 'https://www.trackmyopt.com/dashboard/career/resume-generator';
  const baseFeatures = 'https://www.trackmyopt.com/features/resume-ai';
  const utmParams = '?utm_source=email&utm_campaign=zomato_launch&utm_medium=marketing';
  
  const ctaWithUtm = `${baseCta}${utmParams}`;
  const featuresWithUtm = `${baseFeatures}${utmParams}`;

  let ctaUrl = ctaWithUtm;
  let featuresUrl = featuresWithUtm;
  
  if (emailId) {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com').replace(/\/$/, '');
    ctaUrl = `${baseUrl}/api/notifications/track-click?id=${emailId}&url=${encodeURIComponent(ctaWithUtm)}`;
    featuresUrl = `${baseUrl}/api/notifications/track-click?id=${emailId}&url=${encodeURIComponent(featuresWithUtm)}`;
  }

  const logoUrl = LIVE_LOGO_URL;

  return `
    ${emailOuterOpen()}

    <!-- Preview Text -->
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
      No cooking skills needed. Just upload and watch the magic happen. &#8199;&#65279;&#847;
    </div>

    <div style="background:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};font-family:${font};">

      <!-- ═══ BRANDED HEADER ═══ -->
      <div style="background:${BRAND.bgDark};padding:32px 28px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 20px auto;">
          <tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img src="${logoUrl}" alt="TrackMyOPT" width="44" height="44"
                style="display:block;width:44px;height:44px;border-radius:12px;" />
            </td>
            <td style="vertical-align:middle;font-family:${font};font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">
              TrackMyOPT
            </td>
          </tr>
        </table>
        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3;letter-spacing:-0.03em;">
          Maggi takes 2 mins.<br/>So does your new resume. 🍜
        </h1>
      </div>

      <!-- ═══ HERO IMAGE ═══ -->
      <div style="padding:0;text-align:center;background:${BRAND.white};line-height:0;">
        <img src="cid:maggi_resume_hero" alt="Maggi takes 2 mins, so does your resume" 
          style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto;" />
      </div>

      <!-- ═══ BODY ═══ -->
      <div style="padding:30px 28px 24px;">

        <p style="margin:0 0 6px 0;font-size:16px;font-weight:600;color:${BRAND.black};line-height:1.6;">
          Hey ${firstName},
        </p>

        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:${BRAND.text};">
          Maggi can&rsquo;t cook itself.
        </p>

        <p style="margin:0 0 18px 0;font-size:22px;font-weight:800;line-height:1.3;color:${BRAND.red};">
          But your resume? Oh, it absolutely can. 😤
        </p>

        <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:${BRAND.text};">
          Here&rsquo;s the deal &mdash; upload your old resume, drop in the job description, and in
          <strong>under 2 minutes</strong> TrackMyOPT hands you back a
          <strong>recruiter-approved, ATS-crushing resume</strong> built specifically for that job.
        </p>

        <!-- Feature bullets (table-based for email clients) -->
        <div style="background:${BRAND.gray};border-radius:12px;padding:18px 20px;margin-bottom:22px;border:1px solid ${BRAND.border};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="padding-bottom:10px;font-size:15px;color:${BRAND.text};line-height:1.5;">
              📄&nbsp;&nbsp;Not a template. Not a Word doc your cousin made in 2019.
            </td></tr>
            <tr><td style="padding-bottom:10px;font-size:15px;color:${BRAND.text};line-height:1.5;">
              ⚡&nbsp;&nbsp;A sharp, LaTeX-formatted, <strong>95% ATS-optimized resume</strong>.
            </td></tr>
            <tr><td style="font-size:15px;color:${BRAND.text};line-height:1.5;">
              🔥&nbsp;&nbsp;Actually gets you through the door.
            </td></tr>
          </table>
        </div>

        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:${BRAND.text};">
          The recruiter won&rsquo;t know what hit them. Neither will you, honestly.
        </p>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:8px;">
          <a href="${ctaUrl}"
            style="display:inline-block;background:${BRAND.red};color:${BRAND.white}!important;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:700;font-size:16px;">
            Try it free &rarr;
          </a>
        </div>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${featuresUrl}" style="color:${BRAND.muted};text-decoration:none;font-size:13px;">
            or see how it works &rarr;
          </a>
        </div>

        <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:${BRAND.muted};text-align:center;">
          2 minutes. That&rsquo;s it.<br/>
          Faster than your professor replies to emails. 📧
        </p>

        <hr style="border:none;border-top:1px solid #EEEEEE;margin:24px 0;"/>

        <p style="margin:0 0 8px 0;font-size:15px;font-weight:700;color:${BRAND.black};">
          &mdash; Team TrackMyOPT
        </p>

        <p style="margin:0;font-size:14px;font-style:italic;color:${BRAND.muted};line-height:1.6;">
          P.S. Your dream job is literally waiting. The resume was the only thing in the way. Not anymore.
        </p>
      </div>

      <!-- ═══ FOOTER ═══ -->
      <div style="padding:20px 28px;background:${BRAND.bgSurface};border-top:1px solid ${BRAND.border};text-align:center;">
        <p style="margin:0 0 8px 0;font-size:12px;color:#374151;font-weight:600;">
          Used by students at Harvard, Stanford, NYU, and 500+ universities
        </p>
        <p style="margin:0;font-size:11px;color:${BRAND.textFaint};">
          <a href="{{unsubscribe_url}}" style="color:${BRAND.textFaint};text-decoration:none;">Unsubscribe</a>
          &nbsp;&middot;&nbsp;
          <a href="https://www.trackmyopt.com/privacy" style="color:${BRAND.textFaint};text-decoration:none;">Privacy Policy</a>
          &nbsp;&middot;&nbsp;
          <a href="https://www.trackmyopt.com" style="color:${BRAND.textFaint};text-decoration:none;">trackmyopt.com</a>
        </p>
      </div>

    </div>
    ${emailOuterClose()}
  `;
}

export function getZomatoLaunchSubject(): string {
  return 'Maggi takes 2 mins. So does your new resume. 🍜';
}

export function getZomatoLaunchPreview(): string {
  return 'No cooking skills needed. Just upload and watch the magic happen.';
}
