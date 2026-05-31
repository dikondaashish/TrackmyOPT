import { createClient } from "@supabase/supabase-js";
import { sendMaterialPolicyChangeEmail } from "@/lib/notifications/transactional-emails";
import { recordBillingConsentEvent } from "./recordBillingConsent";

/**
 * Notify active premium subscribers of a material billing policy change.
 * Call from an admin script or protected API — not exposed to end users without auth.
 */
export async function notifyActiveSubscribersOfMaterialPolicyChange(args: {
  effectiveDate: string;
  changeSummary: string;
  policyVersion: string;
}): Promise<{ sent: number; skipped: number; errors: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("premium_status", true);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of profiles ?? []) {
    const email = p.email?.trim();
    if (!email) {
      skipped++;
      continue;
    }

    const r = await sendMaterialPolicyChangeEmail({
      supabase,
      userId: p.user_id,
      toEmail: email,
      firstName: p.first_name,
      effectiveDate: args.effectiveDate,
      changeSummary: args.changeSummary,
      policyVersion: args.policyVersion,
    });

    if (r.ok && !("skipped" in r && r.skipped)) {
      sent++;
      await recordBillingConsentEvent({
        userId: p.user_id,
        eventType: "policy_material_change_notice",
        metadata: {
          effective_date: args.effectiveDate,
          policy_version: args.policyVersion,
        },
      });
    } else if ("skipped" in r && r.skipped) {
      skipped++;
    } else {
      errors++;
    }
  }

  return { sent, skipped, errors };
}
