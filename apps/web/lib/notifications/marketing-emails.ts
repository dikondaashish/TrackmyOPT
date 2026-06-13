import {
  emailOuterClose,
  emailOuterOpen,
} from './email-brand';

/**
 * Premium Re-engagement Email Template
 * ─────────────────────────────────────
 * Subject: Most OPT students apply to companies that will never sponsor them.
 * Coupon:  EARLYBIRD
 * Pricing: $7.99 → $4.99/mo (37% off)
 * Expires: March 31, 2026
 */

// ── Local Brand tokens (Standardized to project hex codes) ────────────────────
const BRAND = {
  applBlue: '#007AFF',
  premiumPurple: '#8B5CF6',
  purpleDeep: '#5B21B6',
  purpleDark: '#4C1D95',
  purpleLight: '#F5F3FF',
  purpleBorder: '#DDD6FE',
  purpleAccent: '#FAF5FF',
  purpleText: '#6D28D9',

  optBlue: '#2563EB',
  optClockAmber: '#B45309',
  stemGreen: '#047857',

  textPrimary: '#111827',
  textBody: '#374151',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',

  bgWhite: '#FFFFFF',
  bgSurface: '#F9FAFB',
  bgDark: '#111827',
  border: '#E5E7EB',

  amberBg: '#FFFBEB',
  amberBorder: '#B45309',
  amberText: '#92400E',
  amberStrong: '#78350F',
} as const;

const font = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const LIVE_LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ||
  'https://www.trackmyopt.com/TrackMyOPT%20Logo/logo.gif';

// ── Template ──────────────────────────────────────────────────────────────────
const UNSUBSCRIBE_URL = 'https://www.trackmyopt.com/unsubscribe';

export function generatePremiumReengagementEmail(firstName: string): string {
  const totalSponsors = '24,682';
  const couponCode = 'EARLYBIRD';
  const priceOld = '$7.99';
  const priceNew = '$4.99';
  const savePct = '37%';
  const expiryDate = 'March 31, 2026';
  const ctaUrl = 'https://www.trackmyopt.com/pricing';
  const resumeUrl = 'https://www.trackmyopt.com/dashboard/career/resume-generator';
  const logoUrl = LIVE_LOGO_URL;

  return `
    ${emailOuterOpen()}
    <div style="background:${BRAND.bgWhite};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">

      <!-- ═══ HEADER (Side-by-side logo + text) ═══ -->
      <div style="background:${BRAND.bgDark};padding:32px 28px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 20px auto;">
          <tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img
                src="${logoUrl}"
                alt=""
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
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;line-height:1.4;">
          Most OPT students apply to companies<br/>
          that will <span style="color:${BRAND.premiumPurple};">never</span> sponsor them.
        </h1>
      </div>

      <!-- ═══ BODY ═══ -->
      <div style="padding:28px 28px 24px;">

        <p style="margin:0 0 4px 0;color:${BRAND.textPrimary};font-size:15px;font-weight:600;line-height:1.6;">
          Hi ${firstName},
        </p>
        <p style="margin:0 0 14px 0;color:${BRAND.textBody};font-size:15px;line-height:1.6;">
          Right now, someone with your exact qualifications just landed an interview 
          &mdash; not because they&rsquo;re better, but because they targeted companies 
          that actually provide H-1B sponsorship.
        </p>
        <p style="margin:0 0 20px 0;color:${BRAND.textBody};font-size:15px;line-height:1.6;">
          Stop guessing. Start targeting the right doors.
        </p>

        <!-- ── Proof Card ── -->
        <div style="background:${BRAND.purpleLight};border-radius:12px;padding:16px;border:1px solid ${BRAND.purpleBorder};margin-bottom:16px;">
          <p style="margin:0 0 2px 0;font-size:26px;font-weight:700;color:${BRAND.purpleDeep};line-height:1.1;">
            ${totalSponsors}
          </p>
          <p style="margin:0;font-size:12px;color:${BRAND.purpleText};">
            Verified H-1B sponsors &mdash; searchable by industry, location, and size
          </p>
        </div>

        <!-- ══ FEATURE: Resume Generator ══ -->
        <div style="border-radius:14px;padding:20px;margin-bottom:20px;border:2px solid ${BRAND.premiumPurple};background:${BRAND.purpleAccent};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <!-- Icon (Fallback-safe Unicode) -->
              <td style="width:48px;vertical-align:top;padding-right:16px;">
                <div style="width:48px;height:48px;border-radius:12px;background:${BRAND.premiumPurple};text-align:center;line-height:48px;font-size:24px;color:#ffffff;">
                  📄
                </div>
              </td>
              <!-- Content -->
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:28px;font-weight:700;color:${BRAND.purpleDeep};line-height:1.1;">
                  Under 2 min
                </p>
                <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:${BRAND.purpleDark};">
                  AI resume generator
                </p>
                <p style="margin:0;font-size:13px;color:${BRAND.purpleText};line-height:1.4;">
                  ATS-optimized and tailored to each role. Professional one-page 
                  templates built for F-1 visa success.
                </p>
              </td>
            </tr>
          </table>

          <div style="text-align:center;padding-top:16px;">
            <a
              href="${resumeUrl}"
              style="display:inline-block;background:${BRAND.premiumPurple};color:#ffffff!important;text-decoration:none;padding:10px 24px;border-radius:10px;font-weight:600;font-size:13px;"
            >
              Build My Resume Now &rarr;
            </a>
          </div>
        </div>

        <!-- ── Mini Tools ── -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
          <tr>
            <td style="width:49%;vertical-align:top;padding-right:5px;">
              <div style="border-radius:10px;padding:12px;border:1px solid ${BRAND.border};background:${BRAND.bgSurface};">
                <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:${BRAND.textPrimary};">
                  Deadline tracker
                </p>
                <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.4;">
                  STEM extensions, I-983, employer reporting alerts
                </p>
              </div>
            </td>
            <td style="width:49%;vertical-align:top;padding-left:5px;">
              <div style="border-radius:10px;padding:12px;border:1px solid ${BRAND.border};background:${BRAND.bgSurface};">
                <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:${BRAND.textPrimary};">
                  Job pipeline
                </p>
                <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.4;">
                  Every application, follow-up, and offer in one place
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- ── Guarantee ── -->
        <div style="border-radius:12px;padding:14px 16px;margin-bottom:24px;border:1px solid ${BRAND.amberBorder};background:${BRAND.amberBg};">
          <p style="margin:0;color:${BRAND.amberText};font-size:13px;line-height:1.5;">
            <strong style="color:${BRAND.amberStrong};">
              The 2-minute guarantee
            </strong><br/>
            If our AI takes longer than 2 minutes to build your tailored 
            resume, your Premium month is free.
          </p>
        </div>

        <!-- ══ CTA PRICING BLOCK ══ -->
        <div style="border-radius:14px;padding:24px 20px;margin-bottom:20px;text-align:center;background:${BRAND.bgDark};">
          <p style="margin:0 0 10px 0;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">
            EARLY ACCESS &mdash; EXPIRES ${expiryDate}
          </p>

          <p style="margin:0 0 14px 0;">
            <span style="font-size:16px;color:rgba(255,255,255,0.35);text-decoration:line-through;">
              ${priceOld}
            </span>
            <span style="font-size:32px;font-weight:700;color:#ffffff;margin:0 8px;">
              ${priceNew}
            </span>
            <span style="font-size:14px;color:rgba(255,255,255,0.5);">
              /month
            </span>
          </p>

          <p style="margin:0 0 16px 0;font-size:14px;color:rgba(255,255,255,0.6);">
            Use code
            <span style="background:${BRAND.premiumPurple};color:#ffffff;padding:3px 12px;border-radius:6px;font-weight:700;font-size:13px;">
              ${couponCode}
            </span>
          </p>

          <a
            href="${ctaUrl}"
            style="display:inline-block;background:${BRAND.applBlue};color:#ffffff!important;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:600;font-size:15px;"
          >
            Upgrade to Premium
          </a>
        </div>

        <p style="margin:0 0 16px 0;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
          Your OPT window doesn&rsquo;t pause while you figure this out. 
          ${totalSponsors} doors are open. Let&rsquo;s get you through one.
        </p>

        <p style="margin:0;color:${BRAND.textPrimary};font-size:14px;">
          &mdash; The TrackMyOPT Team
        </p>
      </div>

      <!-- ═══ FOOTER ═══ -->
      <div style="padding:20px 28px;background:${BRAND.bgSurface};border-top:1px solid ${BRAND.border};text-align:center;">
        <p style="margin:0 0 8px 0;font-size:12px;color:${BRAND.textBody};font-weight:600;">
          Used by students at Harvard, Stanford, NYU, and 500+ universities
        </p>
        <p style="margin:0;font-size:11px;color:${BRAND.textFaint};">
          <a href="${UNSUBSCRIBE_URL}" style="color:${BRAND.textFaint};text-decoration:none;">Unsubscribe</a>
          &nbsp;&middot;&nbsp;
          <a href="https://www.trackmyopt.com/privacy" style="color:${BRAND.textFaint};text-decoration:none;">Privacy Policy</a>
          &nbsp;&middot;&nbsp;
          <a href="https://trackmyopt.com" style="color:${BRAND.textFaint};text-decoration:none;">trackmyopt.com</a>
        </p>
      </div>

    </div>
    ${emailOuterClose()}
  `;
}

export function getPremiumReengagementSubject(): string {
  return 'Most OPT students apply to companies that will never sponsor them.';
}

export function getPremiumReengagementPreview(): string {
  return '24,682 verified sponsors are waiting. Resume ready in under 2 min. Code EARLYBIRD — $4.99/mo.';
}

/**
 * USCIS Case Status Tracker — Feature Announcement / Promotional Email
 * Target: Free-tier OPT users → drive Premium upgrade
 */
export function generateUscisTrackerEmail(firstName: string): string {
  const ctaUrl = 'https://www.trackmyopt.com/pricing';
  const featureUrl = 'https://www.trackmyopt.com/dashboard/case-status';
  const logoUrl = LIVE_LOGO_URL;
  const couponCode = 'EARLYBIRD';
  const priceNew = '$4.99';
  const priceOld = '$7.99';

  return `
    ${emailOuterOpen()}
    <div class="tmo-force-card" style="background:${BRAND.bgWhite};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">

      <div class="tmo-force-dark" style="background:${BRAND.bgDark};padding:32px 28px 28px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 18px auto;">
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
            <td class="tmo-force-dark-text" style="vertical-align:middle;font-family:${font};font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;">
              TrackMyOPT
            </td>
          </tr>
        </table>

        <div style="display:inline-block;background:${BRAND.premiumPurple};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 14px;border-radius:20px;text-transform:uppercase;margin-bottom:14px;">
          New Feature
        </div>

        <h1 class="tmo-force-dark-text" style="margin:0;color:#ffffff;font-size:23px;font-weight:700;line-height:1.35;">
          Your USCIS case, tracked<br/>
          <span style="color:${BRAND.premiumPurple};">automatically</span> — every single day.
        </h1>
      </div>

      <div class="tmo-force-dark" style="background:#1E3A5F;padding:12px 28px;text-align:center;">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:0.5px;">
          &#x2714;&nbsp; <strong style="color:#ffffff;">USCIS Case Status API access</strong> &nbsp;&mdash;&nbsp; Structured status data, not screen scraping.
        </p>
      </div>

      <div style="padding:28px 28px 24px;">
        <p style="margin:0 0 6px 0;color:${BRAND.textPrimary};font-size:15px;font-weight:600;line-height:1.6;">
          Hi ${firstName},
        </p>
        <p style="margin:0 0 20px 0;color:${BRAND.textBody};font-size:15px;line-height:1.6;">
          Waiting on a USCIS decision is stressful enough. Manually refreshing the USCIS website every day should not be part of your routine.
          That is why we built <strong>automatic case tracking</strong> directly into TrackMyOPT.
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
          <tr>
            <td style="padding-bottom:12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-right:14px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#EFF6FF;border:1.5px solid #BFDBFE;text-align:center;line-height:34px;font-size:14px;font-weight:700;color:#2563EB;">1</div>
                  </td>
                  <td style="vertical-align:top;padding-top:6px;">
                    <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:${BRAND.textPrimary};">Enter your receipt number</p>
                    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.4;">13 characters — 3-letter prefix + 10 digits (e.g., IOE1234567890)</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-right:14px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#EFF6FF;border:1.5px solid #BFDBFE;text-align:center;line-height:34px;font-size:14px;font-weight:700;color:#2563EB;">2</div>
                  </td>
                  <td style="vertical-align:top;padding-top:6px;">
                    <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:${BRAND.textPrimary};">We check USCIS <em>for you</em> daily</p>
                    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.4;">Retrieved via USCIS Case Status API access. No guesswork, no stale updates.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-right:14px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#ECFDF5;border:1.5px solid #6EE7B7;text-align:center;line-height:34px;font-size:14px;font-weight:700;color:#059669;">3</div>
                  </td>
                  <td style="vertical-align:top;padding-top:6px;">
                    <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:${BRAND.textPrimary};">Get notified instantly on status change</p>
                    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.4;">Email alert the moment your status updates. Premium feature.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div style="border-radius:14px;border:1.5px solid #6EE7B7;background:#ECFDF5;padding:16px 18px;margin-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="vertical-align:middle;">
                <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.8px;">Case Update Detected</p>
                <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#065F46;">Case Was Approved</p>
                <p style="margin:0;font-size:12px;color:#047857;">Receipt: IOE&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull; &nbsp;|&nbsp; Checked: Today at 8:04 AM</p>
              </td>
              <td style="vertical-align:middle;text-align:right;width:48px;">
                <div style="width:40px;height:40px;border-radius:50%;background:#D1FAE5;border:2px solid #6EE7B7;text-align:center;line-height:38px;font-size:20px;">&#10003;</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="border-radius:14px;border:2px solid ${BRAND.premiumPurple};background:${BRAND.purpleAccent};padding:20px;margin-bottom:20px;">
          <p style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:${BRAND.purpleDeep};">Premium: Never miss an update</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
            <tr>
              <td style="width:50%;vertical-align:top;padding-right:8px;">
                <div style="background:${BRAND.purpleLight};border-radius:10px;padding:12px;border:1px solid ${BRAND.purpleBorder};">
                  <p style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:${BRAND.purpleDeep};line-height:1.1;">Daily</p>
                  <p style="margin:0;font-size:12px;color:${BRAND.purpleText};line-height:1.4;">Automatic checks — no manual refresh needed</p>
                </div>
              </td>
              <td style="width:50%;vertical-align:top;padding-left:8px;">
                <div style="background:${BRAND.purpleLight};border-radius:10px;padding:12px;border:1px solid ${BRAND.purpleBorder};">
                  <p style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:${BRAND.purpleDeep};line-height:1.1;">Instant</p>
                  <p style="margin:0;font-size:12px;color:${BRAND.purpleText};line-height:1.4;">Email alert the moment your status changes</p>
                </div>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
            <tr><td style="font-size:13px;color:${BRAND.purpleDark};padding:5px 0;">&#x2714;&nbsp; <strong>Full status history</strong> — see every change in one timeline</td></tr>
            <tr><td style="font-size:13px;color:${BRAND.purpleDark};padding:5px 0;">&#x2714;&nbsp; <strong>Multiple receipt numbers</strong> — track EAD, STEM, and more</td></tr>
            <tr><td style="font-size:13px;color:${BRAND.purpleDark};padding:5px 0;">&#x2714;&nbsp; <strong>USCIS Case Status API access</strong> — reliable case-status lookups</td></tr>
          </table>
          <div style="text-align:center;">
            <a href="${featureUrl}" style="display:inline-block;background:${BRAND.premiumPurple};color:#ffffff!important;text-decoration:none;padding:11px 28px;border-radius:10px;font-weight:600;font-size:14px;">Track My Case Status &rarr;</a>
          </div>
        </div>

        <div style="border-radius:12px;padding:14px 16px;margin-bottom:24px;border:1px solid ${BRAND.amberBorder};background:${BRAND.amberBg};">
          <p style="margin:0;color:${BRAND.amberText};font-size:13px;line-height:1.6;">
            <strong style="color:${BRAND.amberStrong};">Your OPT window is time-sensitive.</strong><br/>
            A delayed response to a Request for Evidence — or a missed approval notification — can cost you weeks. Do not find out too late.
          </p>
        </div>

        <div style="border-radius:14px;padding:24px 20px;margin-bottom:20px;text-align:center;background:${BRAND.bgDark};">
          <p style="margin:0 0 8px 0;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;">Early Access — Limited Time</p>
          <p style="margin:0 0 14px 0;">
            <span style="font-size:16px;color:rgba(255,255,255,0.3);text-decoration:line-through;">${priceOld}</span>
            <span style="font-size:34px;font-weight:700;color:#ffffff;margin:0 8px;">${priceNew}</span>
            <span style="font-size:14px;color:rgba(255,255,255,0.45);">/month</span>
          </p>
          <p style="margin:0 0 4px 0;font-size:13px;color:rgba(255,255,255,0.5);">USCIS tracking + AI resume + H-1B sponsor database + full suite</p>
          <p style="margin:0 0 18px 0;font-size:14px;color:rgba(255,255,255,0.55);">Use code&nbsp;<span style="background:${BRAND.premiumPurple};color:#ffffff;padding:3px 12px;border-radius:6px;font-weight:700;font-size:13px;">${couponCode}</span></p>
          <a href="${ctaUrl}" style="display:inline-block;background:${BRAND.applBlue};color:#ffffff!important;text-decoration:none;padding:14px 44px;border-radius:12px;font-weight:700;font-size:15px;">Upgrade to Premium</a>
        </div>

        <p style="margin:0 0 16px 0;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
          Your case status can change any day. With TrackMyOPT, you will know the moment it does.
        </p>
        <p style="margin:0;color:${BRAND.textPrimary};font-size:14px;">— The TrackMyOPT Team</p>
      </div>

      <div style="padding:20px 28px;background:${BRAND.bgSurface};border-top:1px solid ${BRAND.border};text-align:center;">
        <p style="margin:0 0 8px 0;font-size:12px;color:${BRAND.textBody};font-weight:600;">Used by students at Harvard, Stanford, NYU, and 500+ universities</p>
        <p style="margin:0;font-size:11px;color:${BRAND.textFaint};">
          <a href="${UNSUBSCRIBE_URL}" style="color:${BRAND.textFaint};text-decoration:none;">Unsubscribe</a>
          &nbsp;&middot;&nbsp;
          <a href="https://www.trackmyopt.com/privacy" style="color:${BRAND.textFaint};text-decoration:none;">Privacy Policy</a>
          &nbsp;&middot;&nbsp;
          <a href="https://trackmyopt.com" style="color:${BRAND.textFaint};text-decoration:none;">trackmyopt.com</a>
        </p>
      </div>
    </div>
    ${emailOuterClose()}
  `;
}

export function getUscisTrackerSubjectA(): string {
  return "Your USCIS case status, checked for you — every day.";
}

export function getUscisTrackerSubjectB(): string {
  return "We just plugged into USCIS. Here's why it matters.";
}

export function getUscisTrackerSubjectC(): string {
  return "New: Official USCIS tracking is live on TrackMyOPT.";
}

export function getUscisTrackerPreview(): string {
  return "Daily automated checks + instant email alerts when your status changes. Enter your receipt number — we handle the rest.";
}
