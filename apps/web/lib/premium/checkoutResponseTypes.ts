/** Discriminated union returned by POST /api/premium/create-checkout */

export type CreateCheckoutResponse =
  | { type: "checkout"; sessionId: string; url: string }
  | { type: "subscription_updated"; status: "active"; redirect: string; planId: string }
  | {
      type: "payment_action_required";
      message: string;
      clientSecret: string | null;
      hostedInvoiceUrl?: string | null;
      portalUrl?: string | null;
    }
  | {
      type: "payment_required";
      message: string;
      hostedInvoiceUrl?: string | null;
      portalUrl?: string | null;
    }
  | { type: "already_subscribed"; message: string; planId: string; portalUrl?: string | null };
