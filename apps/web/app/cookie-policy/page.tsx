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

      <h2>2. Cookies we use</h2>

      <h3>2.1 Essential (strictly necessary)</h3>
      <ul>
        <li>
          <strong>Supabase authentication cookies</strong> — keep you signed in
          securely
        </li>
        <li>
          <strong>Session / CSRF protection</strong> — help prevent unauthorized
          requests
        </li>
        <li>
          <strong>Stripe</strong> — may set cookies during checkout on
          Stripe-hosted pages
        </li>
      </ul>
      <p>
        These are required for login, billing, and core security. Disabling them
        may prevent you from using the Service.
      </p>

      <h3>2.2 Functional</h3>
      <ul>
        <li>
          Theme or UI preferences (e.g. light/dark mode) where stored locally
        </li>
        <li>Chrome extension sync storage for extension sign-in state</li>
      </ul>

      <h3>2.3 Browser analytics (optional)</h3>
      <p>When you click &quot;Accept All&quot; in our cookie banner:</p>
      <ul>
        <li>
          <strong>PostHog browser analytics</strong> — product events and
          feature usage
        </li>
        <li>
          <strong>Google Analytics (GA4)</strong> — aggregated website traffic
          and usage metrics
        </li>
      </ul>
      <p>
        Choosing &quot;Essential Only&quot; prevents those optional browser
        analytics tools from loading. We may still process limited server-side
        service events for security, billing, reliability, error diagnosis, and
        operation of core features. Those server events are not optional browser
        cookies and are not controlled by the cookie choice.
      </p>
      <p>
        <strong>Vercel Analytics / Speed Insights</strong> may process
        aggregated site-performance measurements on visits. We do not use those
        measurements for advertising.
      </p>

      <h3>2.4 Advertising cookies</h3>
      <p>
        When you click &quot;Accept All&quot; in our cookie banner, we load{' '}
        <strong>Google AdSense</strong> to display ads that help support free
        educational content. AdSense may set cookies for ad delivery and
        measurement. We do not use Facebook Pixel, Google Ads remarketing, or
        similar ad-tracking beyond AdSense.
      </p>
      <p>
        Visitors in U.S. states supported by Google&apos;s privacy tools may
        also receive a &quot;Do Not Sell or Share My Personal Information&quot;
        choice for AdSense personalization. Where supported, Google may apply
        restricted data processing after an opt-out or recognized Global Privacy
        Control signal.
      </p>

      <h2>3. Third-party cookies</h2>
      <p>
        Third parties (Supabase, Stripe, Google sign-in, analytics providers)
        may set their own cookies when you use those features. Their policies
        govern those cookies.
      </p>

      <h2>4. How to manage cookies</h2>
      <ul>
        <li>
          <strong>Privacy choices:</strong> Use the &quot;Privacy
          choices&quot; link in the site footer, your profile menu on the
          dashboard, or the shield button on public pages to switch between
          Accept All and Essential Only
        </li>
        <li>
          <strong>Browser settings:</strong> Chrome, Safari, Firefox, and Edge
          let you block or delete cookies
        </li>
        <li>
          <strong>Sign out:</strong> Clears session cookies for your account
        </li>
        <li>
          <strong>Privacy requests:</strong> Contact{' '}
          <a href={`mailto:${LEGAL_CONTACT.privacy}`}>
            {LEGAL_CONTACT.privacy}
          </a>
        </li>
      </ul>
      <p>
        Switching to Essential Only prevents optional browser tools from loading
        on the next page load. Cookies already stored on your device may remain
        until they expire or you remove them in your browser. Blocking essential
        cookies will break login and dashboard access.
      </p>

      <h2>5. Browser privacy signals</h2>
      <p>
        Some browsers send &quot;Do Not Track&quot; signals. We do not currently
        respond differently to DNT signals because there is no industry
        standard; we limit tracking to the categories above.
      </p>
      <p>
        Global Privacy Control is a separate browser signal. Google states that
        it applies restricted data processing to applicable AdSense requests
        when it receives a recognized GPC opt-out signal in supported U.S.
        states.
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
