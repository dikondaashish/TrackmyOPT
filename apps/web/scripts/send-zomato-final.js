const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// --- Template ---

function generateZomatoLaunchEmailV2(firstName) {
  const BRAND = {
    red: '#E23744',
    redDark: '#C81E2B',
    black: '#111111',
    white: '#FFFFFF',
    gray: '#F4F4F4',
    text: '#1C1C1C',
    muted: '#696969',
    bgPage: '#F4F6F8',
    bgDark: '#111827',
    border: '#E5E7EB',
    bgSurface: '#F9FAFB',
    textFaint: '#9CA3AF',
  };

  const font = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
  const ctaUrl = 'https://www.trackmyopt.com/dashboard/career/resume-generator';
  const logoUrl = 'https://www.trackmyopt.com/TrackMyOPT%20Logo/logo.gif';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body { margin:0; padding:0; background:${BRAND.bgPage}; color:#374151; }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: inherit !important;
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:${font};background-color:${BRAND.bgPage};color:#374151;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Preview Text (hidden but shows in inbox) -->
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
      No cooking skills needed. Just upload and watch the magic happen. &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
    </div>

    <div style="background:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};font-family:${font};">

      <!-- ═══ BRANDED HEADER ═══ -->
      <div style="background:${BRAND.bgDark};padding:32px 28px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 20px auto;">
          <tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img
                src="${logoUrl}"
                alt="TrackMyOPT"
                width="44"
                height="44"
                style="display:block;width:44px;height:44px;border-radius:12px;"
              />
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
          Here&rsquo;s the deal &mdash; upload your old resume, drop in the job description, and in <strong>under 2 minutes</strong> TrackMyOPT hands you back a <strong>recruiter-approved, ATS-crushing resume</strong> built specifically for that job.
        </p>

        <!-- Feature bullets -->
        <div style="background:${BRAND.gray};border-radius:12px;padding:18px 20px;margin-bottom:22px;border:1px solid ${BRAND.border};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding-bottom:10px;font-size:15px;color:${BRAND.text};line-height:1.5;">
                📄&nbsp;&nbsp;Not a template. Not a Word doc your cousin made in 2019.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:10px;font-size:15px;color:${BRAND.text};line-height:1.5;">
                ⚡&nbsp;&nbsp;A sharp, LaTeX-formatted, <strong>95% ATS-optimized resume</strong>.
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;color:${BRAND.text};line-height:1.5;">
                🔥&nbsp;&nbsp;Actually gets you through the door.
              </td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:${BRAND.text};">
          The recruiter won&rsquo;t know what hit them. Neither will you, honestly.
        </p>

        <!-- ══ CTA BUTTON ══ -->
        <div style="text-align:center;margin-bottom:8px;">
          <a href="${ctaUrl}" style="display:inline-block;background:${BRAND.red};color:${BRAND.white}!important;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:700;font-size:16px;">
            Try it free &rarr;
          </a>
        </div>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="https://www.trackmyopt.com" style="color:${BRAND.muted};text-decoration:none;font-size:13px;">
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
  </div>
</body>
</html>`;
}

// --- Main Execution ---

async function main() {
  console.log('🚀 Preparing to send polished Zomato-Energy V2 email...');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const recipient = 'dikondaashish@gmail.com';
  const firstName = 'Ashish';
  const html = generateZomatoLaunchEmailV2(firstName);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: recipient,
    subject: 'Maggi takes 2 mins. So does your new resume. 🍜',
    html,
    // No CID image attachment — cleaner rendering across all clients
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Recipient:', recipient);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  }
}

main();
