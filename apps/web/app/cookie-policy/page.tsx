import { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_CONTACT } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Cookie Policy | TrackMyOPT",
  description: "How TrackMyOPT uses cookies and similar technologies.",
  alternates: { canonical: "https://www.trackmyopt.com/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageShell title="Cookie Policy" policyType="cookie_policy">
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. We also use similar technologies (e.g. local storage, session tokens) for authentication and preferences.
      </p>

      <h2>2. Cookies we use</h2>

      <h3>2.1 Essential (strictly necessary)</h3>
      <ul>
        <li><strong>Supabase authentication cookies</strong> — keep you signed in securely</li>
        <li><strong>Session / CSRF protection</strong> — help prevent unauthorized requests</li>
        <li><strong>Stripe</strong> — may set cookies during checkout on Stripe-hosted pages</li>
      </ul>
      <p>These are required for login, billing, and core security. Disabling them may prevent you from using the Service.</p>

      <h3>2.2 Functional</h3>
      <ul>
        <li>Theme or UI preferences (e.g. light/dark mode) where stored locally</li>
        <li>Chrome extension sync storage for extension sign-in state</li>
      </ul>

      <h3>2.3 Analytics (optional)</h3>
      <p>When you click &quot;Accept All&quot; in our cookie banner:</p>
      <ul>
        <li><strong>PostHog</strong> — product analytics (events, feature usage)</li>
        <li><strong>Google Analytics (GA4)</strong> — aggregated website traffic and usage metrics</li>
        <li><strong>Vercel Analytics / Speed Insights</strong> — aggregated page performance metrics (loaded on all visits; privacy-preserving, no advertising)</li>
      </ul>
      <p>
        Analytics tools are used for product improvement and performance measurement, not advertising retargeting. You may contact{" "}
        <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a> to request opt-out, or choose &quot;Essential Only&quot; in the cookie banner.
      </p>

      <h3>2.4 Advertising cookies</h3>
      <p>
        When you click &quot;Accept All&quot; in our cookie banner, we load <strong>Google AdSense</strong> to display ads that help support free educational content. AdSense may set cookies for ad delivery and measurement. We do not use Facebook Pixel, Google Ads remarketing, or similar ad-tracking beyond AdSense.
      </p>

      <h2>3. Third-party cookies</h2>
      <p>
        Third parties (Supabase, Stripe, Google sign-in, analytics providers) may set their own cookies when you use those features. Their policies govern those cookies.
      </p>

      <h2>4. How to manage cookies</h2>
      <ul>
        <li><strong>Browser settings:</strong> Chrome, Safari, Firefox, and Edge let you block or delete cookies</li>
        <li><strong>Sign out:</strong> Clears session cookies for your account</li>
        <li><strong>Analytics:</strong> If we offer an in-app analytics opt-out, use Settings → Privacy; otherwise contact {LEGAL_CONTACT.privacy}</li>
      </ul>
      <p>
        Blocking essential cookies will break login and dashboard access.
      </p>

      <h2>5. Do Not Track</h2>
      <p>
        Some browsers send &quot;Do Not Track&quot; signals. We do not currently respond differently to DNT signals because there is no industry standard; we limit tracking to the categories above.
      </p>

      <h2>6. Updates</h2>
      <p>
        We may update this Cookie Policy. See the version date at the top of this page.
      </p>

      <p>
        More detail: <Link href="/privacy">Privacy Policy</Link> · Contact:{" "}
        <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a>
      </p>
    </LegalPageShell>
  );
}
