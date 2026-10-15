import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { LEGAL_CONTACT } from '@/lib/legal/legal-config';

export const metadata: Metadata = {
  title: 'Cookie Policy | TrackMyOPT',
  description: 'How TrackMyOPT uses cookies and similar technologies.',
  alternates: { canonical: 'https://www.trackmyopt.com/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageShell title="Cookie Policy" policyType="cookie_policy">
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. We also use similar technologies (e.g. local storage, session
        tokens) for authentication and preferences.
      </p>

      <h2>2. How your location affects the defaults</h2>
      <p>
        We use the approximate country our hosting provider (Vercel) detects
        for each request to choose which privacy rules apply. We keep only a
        broad region group (EEA, United Kingdom, United States, or other) in a
        cookie; we do not store your IP address or precise location for this
        purpose.
      </p>
      <ul>
        <li>
          <strong>EEA, United Kingdom, other countries, or an unknown
          location:</strong> optional technologies stay off until you choose
          &quot;Accept all&quot; or turn on a category under
          &quot;Customize&quot;. &quot;Reject non-essential&quot; is offered
          just as prominently, and the site works normally either way.
        </li>
        <li>
          <strong>United States:</strong> functional, analytics, and marketing
          technologies are on by default and we do not show a cookie banner.
          You can turn any of them off at any time from &quot;Your Privacy
          Choices&quot;. A Global Privacy Control signal turns marketing off
          automatically (see section 5).
        </li>
      </ul>

      <h2>3. Categories we use</h2>

      <h3>3.1 Essential (always on)</h3>
      <ul>
        <li>
          <strong>Supabase authentication cookies</strong> — keep you signed in
          securely, including the short-lived sign-in verification cookie
        </li>
        <li>
          <strong>Privacy choice cookies</strong> — <code>tmo_consent</code>{' '}
          remembers your choices for up to 12 months and{' '}
          <code>tmo_privacy_region</code> remembers your region group for one
          day
        </li>
        <li>
          <strong>Sentry error monitoring</strong> — filtered technical error
          reports; it sets no cookies and does not use session replay
        </li>
        <li>
          <strong>Stripe</strong> — may set cookies during checkout and in the
          billing portal on Stripe-hosted pages
        </li>
        <li>
          <strong>Google sign-in</strong> — if you choose &quot;Sign in with
          Google&quot;, Google may set cookies on its own sign-in pages
        </li>
        <li>
          <strong>Settings you choose yourself</strong> — for example theme,
          sidebar layout, &quot;remember my email&quot;, dismissed promotions,
          and resume drafts, stored in your browser only after you choose them
        </li>
      </ul>
      <p>
        These are required for login, billing, security, and features you ask
        for. Blocking them in your browser may prevent you from using the
        Service.
      </p>

      <h3>3.2 Functional (optional)</h3>
      <ul>
        <li>
          <strong>Referral credit</strong> — remembers a referral code from an
          invitation link so the person who invited you gets credit
        </li>
        <li>
          <strong>Sign-in hint</strong> — remembers which sign-in method you
          used last
        </li>
      </ul>
      <p>
        The Chrome extension&apos;s own sync storage is described in our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h3>3.3 Analytics (optional)</h3>
      <ul>
        <li>
          <strong>PostHog</strong> — product events, feature experiments,
          surveys, and session replay with inputs and sensitive areas masked
        </li>
        <li>
          <strong>Google Analytics (GA4)</strong> — website traffic and usage
          metrics
        </li>
        <li>
          <strong>Vercel Web Analytics and Speed Insights</strong> — cookieless,
          aggregated page-view and page-speed measurements
        </li>
      </ul>
      <p>
        When analytics is off, these tools are not loaded at all. We may still
        process limited server-side service events for security, billing,
        reliability, error diagnosis, and operation of core features; those
        events are not browser cookies and are not controlled by these
        choices.
      </p>

      <h3>3.4 Marketing (optional)</h3>
      <p>
        <strong>Google AdSense</strong> shows ads on some free articles to help
        support free educational content, and may set cookies for ad delivery
        and measurement. AdSense is loaded only while marketing is allowed. We
        do not use Facebook Pixel, Google Ads remarketing, or similar
        ad-tracking beyond AdSense. While analytics is on and marketing is off,
        Google Analytics is told (through Google Consent Mode) that advertising
        storage and ad personalization are denied.
      </p>

      <h2>4. How to manage your choices</h2>
      <ul>
        <li>
          <strong>Your Privacy Choices:</strong> use the link in the site
          footer, the shield button on public pages, or your dashboard profile
          menu to turn each optional category on or off at any time
        </li>
        <li>
          <strong>Browser settings:</strong> Chrome, Safari, Firefox, and Edge
          let you block or delete cookies
        </li>
        <li>
          <strong>Sign out:</strong> clears session cookies for your account
        </li>
        <li>
          <strong>Privacy requests:</strong> contact{' '}
          <a href={`mailto:${LEGAL_CONTACT.privacy}`}>
            {LEGAL_CONTACT.privacy}
          </a>
        </li>
      </ul>
      <p>
        Turning a category off stops its tools from collecting further data and
        removes the cookies they set on trackmyopt.com where your browser
        allows it. If ads were already showing, the page reloads without them.
        Cookies set on other companies&apos; domains may remain until they
        expire or you remove them in your browser.
      </p>

      <h2>5. Browser privacy signals</h2>
      <p>
        <strong>Global Privacy Control (GPC):</strong> when your browser sends
        a GPC signal, we treat it as a request to opt out of the sale or
        sharing of personal information and targeted advertising. Marketing is
        turned off for that browser in every region and cannot be turned back
        on while the signal is present. GPC does not turn off essential
        technology, and it does not by itself change functional or analytics
        settings.
      </p>
      <p>
        <strong>Do Not Track:</strong> we do not respond differently to Do Not
        Track signals because there is no industry standard for them. DNT is a
        different signal from GPC.
      </p>

      <h2>6. Updates</h2>
      <p>
        We may update this Cookie Policy. See the version date at the top of
        this page.
      </p>

      <p>
        More detail: <Link href="/privacy">Privacy Policy</Link> · Contact:{' '}
        <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a>
      </p>
    </LegalPageShell>
  );
}
