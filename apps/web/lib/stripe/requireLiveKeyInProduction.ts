/**
 * Fail fast in production if Stripe is not configured with a live secret key.
 * Prevents accidentally processing real traffic against test mode.
 */
export function requireLiveStripeKeyInProduction(): void {
  if (process.env.NODE_ENV !== "production") return;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return;
  if (!key.startsWith("sk_live_")) {
    const msg =
      "STRIPE_SECRET_KEY must start with sk_live_ when NODE_ENV=production. Refusing to use test keys in production.";
    console.error(msg);
    throw new Error(msg);
  }
}
